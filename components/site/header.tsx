import { Lockup } from "@/components/brand/logo";
import { IDENTITY, chapter } from "@/lib/site";

/**
 * The header: the lockup on the left, one flag on the right.
 *
 * It sits over the 3D world with no bar behind it. Its colour follows the
 * scene (navy by day, cream in the storm) via `data-tone` on <html>, which
 * the scroll driver keeps current.
 */
export function Header() {
  return (
    <header className="site-header">
      <a
        className="brand"
        href="#harbour"
        data-go="0"
        aria-label={`${IDENTITY.name}: back to the start`}
      >
        <Lockup />
      </a>
      <a
        className="flag label"
        href="#open-water"
        data-go={chapter("open-water").target}
      >
        Send a signal
      </a>
    </header>
  );
}
