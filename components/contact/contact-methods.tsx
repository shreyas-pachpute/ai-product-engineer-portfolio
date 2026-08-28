import { CopyEmailButton } from "./copy-email-button";
import { CONTACT_EMAIL, CONTACT_GITHUB, CONTACT_LINKEDIN } from "./content";

/**
 * The page's actual purpose, given the most visual weight on the page —
 * everything else here is supporting context. Mono, not the display
 * font: an email address is data, not a headline, and mono is the
 * register this site already uses for anything technical/literal
 * (metrics, captions, code).
 *
 * LinkedIn/GitHub are plain text links, not an icon grid — "social icon
 * grids" were explicitly out of scope, and a giant email icon was too;
 * text that says what it is reads calmer than an icon that has to be
 * recognized.
 */
export function ContactMethods() {
  return (
    <section
      aria-label="Contact methods"
      className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center"
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-h2 text-text-primary ease-feedback hover:text-accent-primary font-mono break-all transition-colors duration-150"
        >
          {CONTACT_EMAIL}
        </a>
        <CopyEmailButton email={CONTACT_EMAIL} />
      </div>

      <div className="text-caption text-text-tertiary flex items-center gap-4">
        <a
          href={CONTACT_LINKEDIN}
          target="_blank"
          rel="noreferrer noopener"
          className="ease-feedback hover:text-text-primary transition-colors duration-150"
        >
          LinkedIn
        </a>
        <span aria-hidden="true">·</span>
        <a
          href={CONTACT_GITHUB}
          target="_blank"
          rel="noreferrer noopener"
          className="ease-feedback hover:text-text-primary transition-colors duration-150"
        >
          GitHub
        </a>
      </div>
    </section>
  );
}
