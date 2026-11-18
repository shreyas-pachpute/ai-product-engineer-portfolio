import type { World, WorldReadout } from "@/components/world/engine";

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
let travel: ((target: number, instant?: boolean) => void) | null = null;

export const voyage = {
  get chapter(): number {
    return coordinate;
  },

  /** Called by the scroll driver. */
  setChapter(value: number): void {
    if (value === coordinate) return;
    coordinate = value;
    world?.setChapter(value);
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
    if (!world || !world.tap(clientX, clientY)) return false;
    folds += 1;
    for (const listener of foldListeners) listener(folds);
    return true;
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
