import type { ReactNode } from "react";
import { Months } from "./months";
import type { Harbour, Leg } from "./voyage";

/**
 * The log: one ruled page per leg, and one for the harbour of departure.
 *
 * Rendered on the server, complete, so every fact is in the HTML whether
 * or not the chart ever runs. With JavaScript the chart shows the pages
 * for the legs its dividers span; without it, all of them are shown in
 * order. Section names are written in the margin, as in a ledger.
 */

export const CHART_ID = "dead-reckoning";

export function legEntryId(leg: Leg): string {
  return `log-${leg.id}`;
}
export const HARBOUR_ENTRY_ID = "log-harbour";

function Line({
  name,
  children,
  className,
}: {
  name: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rk-line${className ? ` ${className}` : ""}`}>
      <h3 className="rk-margin">{name}</h3>
      <div className="rk-text">{children}</div>
    </section>
  );
}

function Turn({
  earlier,
  later,
}: {
  earlier?: { href: string; go: string; text: string };
  later?: { href: string; go: string; text: string };
}) {
  if (!earlier && !later) return null;
  return (
    <nav className="rk-turn" aria-label="Other log pages">
      {earlier ? (
        <a className="rk-turn__link" href={earlier.href} data-go={earlier.go}>
          <span className="rk-turn__dir label">Earlier</span>
          <span className="rk-turn__name">{earlier.text}</span>
        </a>
      ) : (
        <span />
      )}
      {later ? (
        <a
          className="rk-turn__link rk-turn__link--later"
          href={later.href}
          data-go={later.go}
        >
          <span className="rk-turn__dir label">Later</span>
          <span className="rk-turn__name">{later.text}</span>
        </a>
      ) : null}
    </nav>
  );
}

export function LegPage({
  leg,
  index,
  legs,
  harbour,
}: {
  leg: Leg;
  index: number;
  legs: readonly Leg[];
  harbour: Harbour | null;
}) {
  const id = legEntryId(leg);
  const before = legs[index - 1];
  const after = legs[index + 1];
  const story = leg.story;
  return (
    <article className="rk-page" id={id} aria-labelledby={`${id}-title`}>
      <a className="rk-back label" href={`#${CHART_ID}`}>
        Back to the chart
      </a>
      <header className="rk-page__head">
        <p className="rk-page__no label">
          Leg {index + 1} of {legs.length}
        </p>
        <h2 className="rk-page__title display" id={`${id}-title`} tabIndex={-1}>
          {leg.title}
          <span className="sr-only">, </span>
          <span className="rk-page__at">{leg.company}</span>
        </h2>
        <p className="rk-page__when label">
          <span>
            {leg.start} – {leg.end}
          </span>
          <Months from={leg.start} to={leg.end} />
          {leg.place ? <span>{leg.place}</span> : null}
        </p>
      </header>

      <div className="rk-ruled">
        <p className="rk-page__context">{leg.context}</p>

        <Line name="Fixes" className="rk-line--fixes">
          <ol className="rk-fixes">
            {leg.remarks.map((remark, k) => (
              <li key={k} data-fix={k + 1}>
                <span className="rk-fixes__no" aria-hidden="true">
                  {k + 1}
                </span>
                {remark}
              </li>
            ))}
          </ol>
        </Line>

        {story ? (
          <>
            <p className="rk-kicker display">{story.kicker}</p>
            <Line name="Problem">
              <p>{story.problem}</p>
            </Line>
            <Line name="Built">
              <p>{story.built}</p>
            </Line>
            <Line name="Decisions">
              <dl className="rk-decisions">
                {story.decisions.map((decision) => (
                  <div key={decision.title}>
                    <dt className="display">{decision.title}</dt>
                    <dd>{decision.body}</dd>
                  </div>
                ))}
              </dl>
            </Line>
            <Line name="Result">
              <p>{story.result}</p>
            </Line>
          </>
        ) : null}
      </div>

      <Turn
        earlier={
          before
            ? {
                href: `#${legEntryId(before)}`,
                go: `leg:${index - 1}`,
                text: `${before.title}, ${before.company}`,
              }
            : harbour
              ? {
                  href: `#${HARBOUR_ENTRY_ID}`,
                  go: "harbour",
                  text: `The harbour: ${harbour.name}`,
                }
              : undefined
        }
        later={
          after
            ? {
                href: `#${legEntryId(after)}`,
                go: `leg:${index + 1}`,
                text: `${after.title}, ${after.company}`,
              }
            : undefined
        }
      />
    </article>
  );
}

export function HarbourPage({
  harbour,
  first,
}: {
  harbour: Harbour;
  first?: Leg;
}) {
  return (
    <article
      className="rk-page rk-page--harbour"
      id={HARBOUR_ENTRY_ID}
      aria-labelledby={`${HARBOUR_ENTRY_ID}-title`}
    >
      <a className="rk-back label" href={`#${CHART_ID}`}>
        Back to the chart
      </a>
      <header className="rk-page__head">
        <p className="rk-page__no label">Harbour of departure</p>
        <h2
          className="rk-page__title display"
          id={`${HARBOUR_ENTRY_ID}-title`}
          tabIndex={-1}
        >
          {harbour.name}
        </h2>
        <p className="rk-page__when label">
          <span>{harbour.years}</span>
          {harbour.note ? <span>{harbour.note}</span> : null}
        </p>
      </header>
      <div className="rk-ruled">
        <Line name="Studied">
          <p>
            <strong>{harbour.award}</strong>
            <br />
            {harbour.institution}
          </p>
        </Line>
        {first ? (
          <Line name="Sailed">
            <p>
              The first leg, {first.title} at {first.company}, began in{" "}
              {first.start}.
            </p>
          </Line>
        ) : null}
      </div>
      <Turn
        later={
          first
            ? {
                href: `#${legEntryId(first)}`,
                go: "leg:0",
                text: `${first.title}, ${first.company}`,
              }
            : undefined
        }
      />
    </article>
  );
}
