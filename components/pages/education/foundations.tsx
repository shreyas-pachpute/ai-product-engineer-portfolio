import type { Achievement, Qualification } from "@/lib/content";

/**
 * The facts, as plain HTML: the degree and the two certificates, numbered
 * as the folds that reveal them on the paper. This is what a screen reader
 * reads and what shows without JavaScript; the paper is the picture of it.
 */

function host(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

export function Foundations({
  degree,
  credentials,
}: {
  degree?: Qualification;
  credentials: readonly Achievement[];
}) {
  const first = degree ? 2 : 1;
  return (
    <ol className="edu-facts">
      {degree ? (
        <li className="edu-fact">
          <span className="edu-fact__no" aria-hidden="true">
            1
          </span>
          <div className="edu-fact__body">
            <h2 className="edu-fact__name display">{degree.award}</h2>
            <p className="edu-fact__by">{degree.institution}</p>
            <p className="edu-fact__when label">
              {[degree.years, degree.note].filter(Boolean).join(" · ")}
            </p>
          </div>
        </li>
      ) : null}
      {credentials.map((item, i) => (
        <li className="edu-fact" key={item.name}>
          <span className="edu-fact__no" aria-hidden="true">
            {first + i}
          </span>
          <div className="edu-fact__body">
            <h2 className="edu-fact__name display">{item.name}</h2>
            {item.by || item.date ? (
              <p className="edu-fact__by">
                {item.by}
                {item.by && item.date ? " · " : null}
                {item.date ? (
                  <span className="edu-fact__when label">{item.date}</span>
                ) : null}
              </p>
            ) : null}
            {item.why ? <p className="edu-fact__why">{item.why}</p> : null}
            {item.href ? (
              <a
                className="edu-fact__link label"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {host(item.href)}
                <span aria-hidden="true"> ↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
