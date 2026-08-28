/**
 * No chronology, no bio, no personal facts of any kind — every other
 * "why do you work this way" question on this site (Engineering Layer,
 * Business Impact, Services) is answered at the level of process or
 * tactics. This page is the one level underneath all of them: the
 * specific beliefs that produced that process, framed as reversals
 * ("I used to think X, now I think Y") rather than a list of current
 * opinions. A reversal carries its own "why" for free — nobody changes
 * their mind without a reason — which is what lets this page explain
 * "why" without narrating a biography to get there.
 */

export const ABOUT_HERO = {
  eyebrow: "About",
  heading: "What changed my mind.",
  sub: "Not a biography — the specific beliefs about building AI products that turned out to be wrong, and what replaced them.",
};

export const INTRO_PARAGRAPHS = [
  "Most interesting engineering problems right now aren't “can this be built” — they're “should this be built with a model, and if so, built well enough to actually trust.” That's a different discipline than pure ML research or traditional software engineering, sitting somewhere between them, and it's the one worth getting good at.",
  "The rest of this site shows what that looks like in practice. This page is the reasoning underneath it.",
];

export type Belief = {
  was: string;
  now: string;
  elaboration: string;
};

export const BELIEFS: Belief[] = [
  {
    was: "I used to think the model was the product.",
    now: "Now I think it's the least differentiated part of it.",
    elaboration:
      "The interface, the infrastructure, and the business case around a model are what actually separate a system customers trust from one that impresses in a meeting. Two teams can call the same API and ship completely different products — the model was never where the real work was.",
  },
  {
    was: "I used to think a working demo meant the hard part was done.",
    now: "Now I think the demo is the easy fifth of the work.",
    elaboration:
      "Reliability, cost, observability, and the failure states nobody demos are the other four-fifths — and that's exactly the part most AI projects never reach. A prototype proves an idea is possible. It says nothing about whether it's safe to hand to a customer.",
  },
  {
    was: "I used to try to learn every new model and framework the week it shipped.",
    now: "Now I wait, and ask what problem it actually solves that I couldn't already solve.",
    elaboration:
      "Most releases are a faster horse, not a different vehicle. Chasing all of them is how you end up shallow across ten tools instead of deep in the two or three that actually matter for the problem in front of you.",
  },
  {
    was: "I used to treat business context as a distraction from the real engineering.",
    now: "Now I think it's the missing constraint that makes the engineering decisions correct.",
    elaboration:
      "“What's the latency budget” and “what's this worth if it works” aren't product-manager questions asked before the real work starts — they're inputs to the architecture itself. Skip them and you're not being more technical, you're just guessing with better syntax.",
  },
  {
    was: "I used to think good engineers have strong opinions about the right architecture.",
    now: "Now I think good engineers have strong opinions about how to find out.",
    elaboration:
      "Fast, cheap ways to test whether an approach actually works — and the discipline to hold the first opinion loosely until the evidence is in. Certainty that arrives before the test is usually just a preference wearing a technical argument.",
  },
];

export const CLOSING_PARAGRAPHS = [
  "These aren't fixed. The ones above replaced ones I was just as sure of a couple of years ago — which is the best argument I have for staying suspicious of my own certainty, including about this list.",
];

export const CLOSING_LINK = {
  prefix: "The",
  label: "Work page",
  href: "/work",
  suffix: "is what these beliefs look like applied.",
};
