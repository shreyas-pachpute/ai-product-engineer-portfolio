import type { CSSProperties, ReactNode } from "react";
import {
  ANATOMY,
  COPY,
  IDENTITY,
  LOGBOOK,
  builtAt,
  chapter,
  type ChapterId,
} from "@/lib/site";
import { AnatomyPins } from "./anatomy-pins";
import { BoatTags } from "./boat-tags";
import { CopyEmail } from "./copy-email";
import { FoldControl } from "./fold-control";

/**
 * The five chapters, as HTML.
 *
 * This is a Server Component: every word of the page is in the first
 * response, readable without JavaScript and by anything that does not run
 * it. The 3D world, the scroll driver and the small interactive pieces are
 * layered on afterwards.
 *
 * Structure of one chapter:
 *
 *   <section class="chapter">     tall and empty — the scroll distance
 *     <div class="panel">         pinned to the viewport — the text
 *
 * `data-from` / `data-to` are chapter coordinates (see lib/site.ts). The
 * scroll driver adds `data-on` to an element while the reader is inside
 * its range, and the CSS in app/globals.css decides what "on" looks like.
 */

/** Stagger position for the entrance animations. */
function at(index: number): CSSProperties {
  return { "--i": index } as CSSProperties;
}

function Chapter({ id, children }: { id: ChapterId; children: ReactNode }) {
  const entry = chapter(id);
  return (
    <section
      id={id}
      className="chapter"
      data-chapter=""
      data-target={entry.target}
      aria-labelledby={`${id}-title`}
      style={{ "--len": entry.length } as CSSProperties}
    >
      <div
        className={`panel panel--${id}`}
        data-tone={entry.tone}
        data-from={entry.from}
        data-to={entry.to}
        // The first chapter is on in the server's HTML, so the opening
        // lines are visible before any script has run.
        data-on={id === "harbour" ? "" : undefined}
      >
        {children}
      </div>
    </section>
  );
}

function ArrowDown() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2v11M3.5 8.5 8 13l4.5-4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowOut() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Harbour() {
  return (
    <Chapter id="harbour">
      <div className="harbour">
        {/*
         * Who this is and what he does, first and in plain words. It is
         * the page's h1; the statement under it is the voice.
         */}
        <h1
          id="harbour-title"
          tabIndex={-1}
          className="identity fade"
          style={at(0)}
        >
          <span className="identity__name">{IDENTITY.name}</span>
          <span className="sr-only">, </span>
          <span className="identity__role label">{IDENTITY.role}</span>
        </h1>
        <p className="display harbour__line">
          <span className="rise" style={at(0)}>
            {/* The trailing space keeps the two lines apart for anything
                that reads the text rather than the layout. */}
            <span>Models are the sea. </span>
          </span>
          <span className="rise" style={at(1)}>
            <span>
              I build the <em>ships.</em>
            </span>
          </span>
        </p>
        <p className="body fade" style={at(5)}>
          {COPY.harbour.body}
        </p>
        <p className="key label fade" style={at(6)}>
          {COPY.harbour.key}
        </p>
        <a
          className="cue label fade"
          href="#paper"
          data-go={chapter("paper").target}
          style={at(7)}
        >
          {COPY.harbour.cue}
          <ArrowDown />
        </a>
      </div>
    </Chapter>
  );
}

function Paper() {
  return (
    <Chapter id="paper">
      <div className="copy">
        <p className="key label fade" style={at(0)}>
          {COPY.paper.key}
        </p>
        <h2 id="paper-title" tabIndex={-1} className="display title">
          <span className="unfold" style={at(0)}>
            Anyone can{" "}
          </span>
          <span className="unfold" style={at(1)}>
            fold a boat.
          </span>
        </h2>
        <p className="body fade" style={at(4)}>
          {COPY.paper.body[0]}
        </p>
        <p className="display aside tip" data-from="1.42">
          {COPY.paper.body[1]}
        </p>
        <FoldControl
          label={COPY.paper.fold}
          hint={COPY.paper.hint}
          again={COPY.paper.again}
        />
      </div>
      <BoatTags />
    </Chapter>
  );
}

function Board() {
  return (
    <Chapter id="board">
      <div className="board">
        <p className="key label fade" style={at(0)}>
          {COPY.board.key}
        </p>
        <h2 id="board-title" tabIndex={-1} className="display title letter">
          {COPY.board.title}
        </h2>
        <p className="body fade" style={at(6)}>
          {COPY.board.body}
        </p>
        <ol className="anatomy fade" style={at(8)}>
          {ANATOMY.map((part, index) => (
            <li
              key={part.part}
              className="anatomy__row"
              data-from={builtAt(part.built).toFixed(3)}
            >
              <span className="badge" aria-hidden="true">
                {index + 1}
              </span>
              <p className="display anatomy__means">
                {part.means}
                <span className="sr-only">: </span>
                <span className="anatomy__name">
                  the {part.name.toLowerCase()}
                </span>
              </p>
              <p className="anatomy__line">{part.line}</p>
            </li>
          ))}
        </ol>
        <p className="display closing fade" data-from="2.8">
          {COPY.board.closing}
        </p>
      </div>
      <AnatomyPins />
    </Chapter>
  );
}

function Weather() {
  return (
    <Chapter id="weather">
      <div className="copy">
        <p className="key label fade" style={at(0)}>
          {COPY.weather.key}
        </p>
        <h2 id="weather-title" tabIndex={-1} className="display title sweep">
          {COPY.weather.title}
        </h2>
        <p className="body sweep" style={at(1)}>
          {COPY.weather.body[0]}
        </p>
        <p className="body fade" data-from="3.5">
          {COPY.weather.body[1]}
        </p>
      </div>
    </Chapter>
  );
}

function Logbook() {
  if (LOGBOOK.length === 0) return null;
  return (
    <ul className="logbook glide" style={at(2)}>
      {LOGBOOK.map((entry) => (
        <li key={entry.title}>
          {entry.href ? (
            <a className="textlink" href={entry.href}>
              {entry.title}
            </a>
          ) : (
            <strong>{entry.title}</strong>
          )}
          {entry.year ? ` · ${entry.year}` : null}
          <br />
          {entry.summary}
        </li>
      ))}
    </ul>
  );
}

function OpenWater() {
  const [user, domain] = IDENTITY.email.split("@");
  return (
    <Chapter id="open-water">
      <div className="signal">
        <p className="key label glide" style={at(0)}>
          {COPY["open-water"].key}
        </p>
        <h2
          id="open-water-title"
          tabIndex={-1}
          className="display title glide"
          style={at(0)}
        >
          {COPY["open-water"].title}
        </h2>
        <p className="body glide" style={at(1)}>
          {COPY["open-water"].body}
        </p>
        <Logbook />
        {/* Two ways to answer, given equal weight: write, or book a time. */}
        <div className="answer glide" style={at(3)}>
          <div className="answer__way">
            <p className="key label">{COPY["open-water"].write}</p>
            <a className="display email" href={`mailto:${IDENTITY.email}`}>
              {user}
              <wbr />@{domain}
            </a>
            <p className="answer__more label">
              <CopyEmail email={IDENTITY.email} />
            </p>
          </div>
          <div className="answer__way">
            <p className="key label">{COPY["open-water"].book}</p>
            <a
              className="display email"
              href={IDENTITY.booking}
              target="_blank"
              rel="noopener noreferrer"
            >
              {COPY["open-water"].bookLine}
              <span className="sr-only"> (opens Calendly in a new tab)</span>
            </a>
            <p className="answer__more label" aria-hidden="true">
              {COPY["open-water"].bookNote}
              <ArrowOut />
            </p>
          </div>
        </div>
        <div className="reach label glide" style={at(4)}>
          {IDENTITY.links.map((link) => (
            <a
              key={link.href}
              className="textlink"
              href={link.href}
              target="_blank"
              rel="me noopener noreferrer"
            >
              {link.label}
              <ArrowOut />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
        </div>
        <p className="onward label glide" style={at(5)}>
          <a className="textlink" href="/projects">
            See what I have built
          </a>
          <a className="textlink" href="/resume">
            Résumé
          </a>
        </p>
        <footer className="foot glide" style={at(6)}>
          <span>
            © {new Date().getFullYear()} {IDENTITY.name}
          </span>
          <a className="textlink" href="#harbour" data-go="0">
            Back to harbour
          </a>
        </footer>
      </div>
    </Chapter>
  );
}

export function Voyage() {
  return (
    <main id="voyage">
      <Harbour />
      <Paper />
      <Board />
      <Weather />
      <OpenWater />
    </main>
  );
}
