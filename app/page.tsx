import { Intro } from "@/components/intro/intro";
import { VoyageDriver } from "@/components/voyage/driver";
import { Rail } from "@/components/voyage/rail";
import { Voyage } from "@/components/voyage/voyage";
import { chapter } from "@/lib/site";

/**
 * The home page: a crossing in five chapters. (The 3D world and the header
 * are in app/layout.tsx, shared with the other pages.)
 *
 *   Rail          where you are in the crossing
 *   Voyage        the chapters' text, as server-rendered HTML
 *   VoyageDriver  turns scroll position into the chapter coordinate
 *   Intro         the opening, once per session
 */
export default function Page() {
  return (
    <>
      <a
        className="skip label"
        href="#open-water"
        data-go={chapter("open-water").target}
      >
        Skip to contact
      </a>
      <Rail />
      <Voyage />
      <VoyageDriver />
      <Intro />
    </>
  );
}
