/**
 * The architecture doc's original Services page was four packaged
 * offerings ("AI Architecture Audit," "0-to-1 MVP Execution," ...) with
 * bullet deliverables and a "value-based pricing" pitch anchored to an
 * invented dollar figure ("prevents $50k+ in wasted spend"). That's the
 * generic agency-services pattern almost every consulting site uses, and
 * the fabricated anchor number is the same honesty problem the rest of
 * this site has already rejected (see Proof Bar, Business Impact).
 *
 * This page answers a different question — "if I hire this person, what
 * exactly happens" — as a small number of confident, specific statements
 * about how engagements actually work, not a menu of purchasable
 * packages. No tiers, no hourly rate, no fake pricing anchor.
 */

export const SERVICES_HERO = {
  eyebrow: "Services",
  heading: "What it's like to work with me.",
  sub: "Not a menu of packages — how I actually think about scope, risk, and what a good engagement requires from both sides.",
};

export const FIT_SECTION = {
  label: "Fit",
  heading: "This isn't the right fit for every project.",
  reachOutHeading: "Reach out when —",
  reachOut: [
    "You have a real workflow or customer problem, not just a sense that you should have AI somewhere.",
    "You need one person who can own the system end to end — architecture, interface, and the business case behind it.",
    "You want a working product, not a slide deck of what one might look like.",
    "You're prepared to be involved early. The best version of this needs your domain knowledge, not just your budget.",
  ],
  notFitHeading: "This probably isn't a fit if —",
  notFit: [
    "You already know exactly which model, framework, and architecture you want built. You need an implementer, not a product partner.",
    "You need a large team shipping in parallel across many workstreams at once.",
    "The honest answer to “does this need AI” is no — and I'll tell you that in the first conversation, not the fourth invoice.",
  ],
};

export const PROCESS_SECTION = {
  label: "Process",
  heading: "How this actually starts.",
  paragraphs: [
    "Every engagement starts the same way: a conversation about the problem, not the technology. If the honest answer is that AI isn't the right tool — or isn't the right tool yet — that's the outcome of the first call, not the fourth invoice.",
    "From there, the shape is roughly consistent: a short scoping period to get specific about what “done” looks like and what it's actually worth solving, followed by building in view of you — working software early, not a deck of slides that turns into software eight weeks later. You see the system before it's finished, not after.",
  ],
};

export const STANDARDS_SECTION = {
  label: "Standards",
  heading: "Success isn't “it works in a demo.”",
  paragraphs: [
    "A system that works in a demo and a system that's safe to hand to your customers are different achievements, and the gap between them is usually where projects quietly go over budget. Success here means the second one — shipped, monitored, and understood by the people who have to maintain it once I'm not in the room anymore.",
    "Uncertainty is treated as information, not as a reason to guess. Where the technical risk is real — will retrieval be accurate enough, will latency hit the target, will the model choice hold up under real traffic — that gets tested early and cheaply, before it's load-bearing in a production timeline. The expensive way to find out an approach doesn't work is to build the whole product first.",
  ],
};

export const EXPECTATIONS_SECTION = {
  label: "Expectations",
  heading: "This works both ways.",
  paragraphs: [
    "A good outcome depends on more than good engineering. The clearest bottleneck on most AI projects isn't the model — it's access: to the people who know why the edge cases matter, to real data instead of a sanitized sample, to someone who can say yes to a direction instead of routing it through committee.",
    "I ask for that access early, and I ask directly when something is unclear rather than guessing and hoping. In return, you get a system built on how the problem actually works — not how it looked in the first meeting.",
  ],
};

export const PRICING_SECTION = {
  label: "Pricing",
  heading: "Why this isn't priced like a website.",
  paragraphs: [
    "A marketing website has a knowable scope — a fixed number of pages, a known design, a predictable build. Most AI products don't start that way. The real open question usually isn't “how long does this take to build,” it's “does this approach actually work well enough to trust,” and that second question sometimes takes real exploration to answer honestly.",
    "What actually drives cost and timeline: how ready the underlying data is, how high the accuracy or reliability bar needs to be before the system can run unattended, how many existing systems it has to integrate with, and how much of the work is genuinely novel versus assembling well-understood pieces. Two projects that sound similar in a first conversation can have very different amounts of real engineering underneath them, for reasons that only show up once you're inside the problem.",
    "Scoping conversations exist to make that visible before any commitment is made — not to produce a number that sounds good on a call and turns into a change order three weeks in.",
  ],
};

export const CLOSING_SECTION = {
  heading: "Start with a conversation, not a proposal.",
  sub: "The first call is unscoped and honest — including about whether this is the right engagement at all.",
  cta: { label: "Start a Conversation", href: "/contact" },
};
