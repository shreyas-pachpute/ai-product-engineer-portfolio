import { Intro } from "@/components/intro/intro";
import { Header } from "@/components/site/header";
import { VoyageDriver } from "@/components/voyage/driver";
import { Rail } from "@/components/voyage/rail";
import { Voyage } from "@/components/voyage/voyage";
import { Stage } from "@/components/world/stage";
import { chapter } from "@/lib/site";

/**
 * The whole site is this one page: a crossing in five chapters.
 *
 *   Stage         the 3D world, fixed behind everything
 *   Header, Rail  the only chrome
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
      <Stage />
      <Header />
      <Rail />
      <Voyage />
      <VoyageDriver />
      <Intro />
    </>
  );
}
