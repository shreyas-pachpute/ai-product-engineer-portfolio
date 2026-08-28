/**
 * No form, no Calendly embed, no social icon grid, no fabricated SLA
 * badge — the architecture doc's original "multi-path persona intake
 * engine" (dynamic form fields keyed off a Recruiter/Founder/Advisory
 * selector) is exactly the kind of generic-portfolio mechanism this
 * phase's brief explicitly rejected. A working form also implies backend
 * infrastructure (an API route, an email-sending service, secrets) that
 * nothing else in this build has needed yet — skipping it keeps this
 * phase, correctly, frontend-only.
 *
 * Real values only: email, LinkedIn, and GitHub below were confirmed
 * directly by the site owner, not guessed or templated.
 */

export const CONTACT_EMAIL = "shreyaspachpute1107@gmail.com";
export const CONTACT_LINKEDIN = "https://www.linkedin.com/in/shreyaspachpute/";
export const CONTACT_GITHUB = "https://github.com/shreyas-pachpute";

export const CONTACT_HERO = {
  eyebrow: "Contact",
  heading: "The next step is a conversation, not a form.",
  sub: "Reach out directly — here's what's useful to include, and what happens after.",
};

export const INCLUDE_SECTION = {
  label: "Starting Point",
  heading: "What's useful to include",
  paragraphs: [
    "A first message doesn't need to be formal — a few sentences are enough. Useful to mention: what's actually happening today (the manual process, the workflow that doesn't scale), anything already known about timeline or budget, and what “better” would look like, even roughly.",
  ],
  fitNote:
    "This works best for a real problem already in view, not a sense that there should be AI somewhere. The longer version of who this is and isn't a fit for is on the",
  fitLinkLabel: "Services page",
  fitLinkHref: "/services",
};

export const NEXT_SECTION = {
  label: "What Happens Next",
  heading: "I read every message myself.",
  paragraphs: [
    "Usually within a day or two. If it looks like a fit, the reply proposes a short call — twenty or thirty minutes, nothing to prepare. If it's not a fit, I'll say so directly, and point you somewhere better if I can.",
  ],
};
