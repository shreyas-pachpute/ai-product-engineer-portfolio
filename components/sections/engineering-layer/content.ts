/**
 * Not the architecture doc's tech-stack matrix — that format (a filterable
 * grid of tool badges) is what every AI portfolio already has, and it
 * proves familiarity with tools, not judgment about when to use them.
 * This shows five layers of decisions between a prompt and a system
 * running in production, each covering 2–3 of the concerns a technical
 * reviewer actually checks for (model selection, evals, observability,
 * latency, deployment, scaling, security, cost, UX, iteration) — as
 * reasoning, not a checklist. Tool names appear only where a sentence
 * naturally needs one, never as a badge.
 */

export const ENGINEERING_EYEBROW = "Engineering Judgment";
export const ENGINEERING_HEADING =
  "Half the job is knowing which model to use. The other half is knowing when not to.";
export const ENGINEERING_SUBHEADING =
  "Five layers of decisions between a prompt and a production system — most of them have nothing to do with the model.";

export type Layer = {
  number: string;
  title: string;
  summary: string;
  detail: string;
};

export const LAYERS: Layer[] = [
  {
    number: "01",
    title: "Judgment",
    summary:
      "Choosing whether this needs a model at all — and which one, if it does.",
    detail:
      "A classifier, a regex, or a lookup table is sometimes the right answer, and cheaper and more reliable than a language model. When a model is the right call, size and provider follow the constraint — a distilled, task-tuned open-weight model for a narrow, high-volume job; a frontier model only where the reasoning actually needs it.",
  },
  {
    number: "02",
    title: "Interface",
    summary:
      "Designing for the model being slow, uncertain, or wrong — not assuming it won't be.",
    detail:
      "Streaming output so a three-second response doesn't feel like a hang, optimistic UI for actions the model is probably right about, and a real fallback state for when it isn't — not a spinner and a hope.",
  },
  {
    number: "03",
    title: "Runtime",
    summary:
      "What a request costs and how fast it returns, under real traffic — not in a demo.",
    detail:
      "Prompt and context size are a budget, not an afterthought. Caching repeat queries, routing simple requests to a cheaper model, and load-testing the p95 — not just the average — before it's someone else's incident.",
  },
  {
    number: "04",
    title: "Trust",
    summary:
      "Whether the output can be trusted without a human re-checking it every time.",
    detail:
      "Structured output validated against a schema, an eval suite that runs on every prompt change, and monitoring that catches drift — hallucination and data leakage get caught in a test, not a support ticket.",
  },
  {
    number: "05",
    title: "Deployment & Iteration",
    summary:
      "Shipping a prompt or model change like any other production change — versioned and reversible.",
    detail:
      "Prompts and model versions are tracked like code, rollouts are gradual, and a bad change can be rolled back in minutes, not diagnosed for a day. Production usage feeds directly back into the next eval set.",
  },
];
