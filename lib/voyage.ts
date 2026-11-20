import type { World, WorldReadout } from "@/components/world/sea";
import type { BeaconDef } from "@/components/world/sea/beacons";

/**
 * The one shared piece of client state: where the reader is in the
 * crossing.
 *
 * It is a plain module, not React state, on purpose. The chapter
 * coordinate changes on every scroll frame, and the things that follow it
 * (the 3D world, the route rail, the anatomy pins) each write one or two
 * style values in response. Routing that through React would re-render
 * components sixty times a second to change a transform. Here, whoever
 * cares subscribes and touches the DOM directly.
 *
 * Three signals:
 *   chapter   the chapter coordinate, published by the scroll driver
 *   frame     the world's readout (screen positions), once per rendered frame
 *   fold      how many paper boats the reader has folded
 */

type ChapterListener = (coordinate: number) => void;
type FrameListener = (readout: WorldReadout) => void;
type FoldListener = (count: number) => void;

const chapterListeners = new Set<ChapterListener>();
const frameListeners = new Set<FrameListener>();
const foldListeners = new Set<FoldListener>();

let coordinate = 0;
let world: World | null = null;
let folds = 0;
let quietUntil = 0;
let trialKind = -1;
let beaconDefs: readonly BeaconDef[] = [];
let bearingDegrees = 0;
let travel: ((target: number, instant?: boolean) => void) | null = null;

export const voyage = {
  get chapter(): number {
    return coordinate;
  },

  /**
   * Called by the scroll driver on the home page, and by the other pages
   * to put the world's camera where they want it. `immediate` cuts there
   * instead of travelling: right for a change of page, wrong for a scroll.
   */
  setChapter(value: number, immediate = false): void {
    if (value === coordinate && !immediate) return;
    coordinate = value;
    world?.setChapter(value, immediate);
    for (const listener of chapterListeners) listener(value);
  },

  onChapter(listener: ChapterListener): () => void {
    chapterListeners.add(listener);
    listener(coordinate);
    return () => chapterListeners.delete(listener);
  },

  /** Called by the stage when the world is created or torn down. */
  attachWorld(next: World | null): void {
    world = next;
    if (!next) return;
    next.onFrame = (readout) => {
      for (const listener of frameListeners) listener(readout);
    };
    // Start where the page already is, not at the top.
    next.setChapter(coordinate, true);
    next.setTrial(trialKind);
    next.setBeacons(beaconDefs);
    next.setBearing(bearingDegrees);
  },

  onFrame(listener: FrameListener): () => void {
    frameListeners.add(listener);
    return () => frameListeners.delete(listener);
  },

  /** Screen y of the horizon, if the world is up to say. */
  horizon(): number | null {
    return world ? world.readout.horizonY : null;
  },

  /** Folds a paper boat where the pointer met the water. */
  fold(clientX: number, clientY: number): boolean {
    // A click that closed a boat's tag was not a click on the water.
    if (performance.now() < quietUntil) return false;
    if (!world || !world.tap(clientX, clientY)) return false;
    folds += 1;
    for (const listener of foldListeners) listener(folds);
    return true;
  },

  /** For the next moment, clicks do not fold boats. */
  hush(milliseconds = 400): void {
    quietUntil = performance.now() + milliseconds;
  },

  /**
   * Leans on a paper boat (`slot` in the world's fleet) with one of the
   * six pressures (the order of PRESSURES in lib/site.ts). It goes down.
   */
  lean(slot: number, kind: number): boolean {
    return world ? world.lean(slot, kind) : false;
  },

  /**
   * Sea trials (the Projects page): puts the ship through one of the six
   * pressures' conditions, or back to calm with -1. Remembered, so a world
   * that arrives later starts in the right weather.
   */
  trial(kind: number): void {
    trialKind = kind;
    world?.setTrial(kind);
  },

  /** Lights on the night coast (the Achievements page); [] for none. */
  beacons(defs: readonly BeaconDef[]): void {
    beaconDefs = defs;
    world?.setBeacons(defs);
  },

  /** Turns the camera's line of sight, degrees to the right; 0 to reset. */
  bearing(degrees: number): void {
    bearingDegrees = degrees;
    world?.setBearing(degrees);
  },

  onFold(listener: FoldListener): () => void {
    foldListeners.add(listener);
    return () => foldListeners.delete(listener);
  },

  /** The scroll driver registers how to travel to a chapter coordinate. */
  setNavigator(next: typeof travel): void {
    travel = next;
  },

  /** Scrolls the page to a chapter coordinate. */
  go(target: number, instant = false): void {
    travel?.(target, instant);
  },
};
