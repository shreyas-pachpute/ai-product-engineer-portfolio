/**
 * What the content pages and the résumé say.
 *
 * WHERE THIS COMES FROM
 * Every fact here traces to Shreyas's own earlier résumé and project notes
 * (the `data/` folder of his previous site), to his public GitHub
 * repositories, or to the public website of the product in question. The
 * wording is new; the facts are not. Nothing was added on the grounds that
 * it is the kind of thing someone in the role might have done.
 *
 * PRACTICE (evals, guardrails, observability, cost, latency) is the one
 * section drawn from code rather than from what he wrote about his work:
 * each line describes something that exists and runs in one of his public
 * repositories, which are built on synthetic data. Neither employer's
 * material says anything about evals, monitoring or measured latency, so
 * nothing here claims them for either job.
 *
 * If something here is wrong or out of date, this is the only file to
 * change: the pages and the résumé all read from it.
 *
 * Dates are free text, written the way he would write them.
 */

/* -------------------------------------------------------------------------
   Summary
   ------------------------------------------------------------------------- */

export const PROFILE = {
  headline: "LLM agents, retrieval and document intelligence, in production",
  /**
   * Employment runs from January 2024, which is nearly three years at the
   * time of writing (November 2026). It becomes "three years" in January
   * 2027; change the wording then, not before.
   */
  summary:
    "AI Product Engineer with nearly three years shipping LLM systems inside live products. At ZYLITIX I own the AI backend of DTAXO, a tax-preparation platform used by 119 CPA firms. Before that, at Commercient Sync, I built the agents that replaced a $12,000-a-month third-party chatbot and ran open-weight models on the company's own GPUs. I work across the whole product: retrieval, agent design, evaluation, serving and cost, and the interface people use.",
  location: "Surat, India · Remote",
  /**
   * On the résumé only, at his request (19 November 2026); not on the
   * site's pages. The number is the one on his earlier résumé.
   */
  phone: { label: "+91 99786 42388", href: "tel:+919978642388" },
} as const;

/* -------------------------------------------------------------------------
   Skills: grouped; the strongest lead their group and are marked.
   ------------------------------------------------------------------------- */

export type Skill = {
  name: string;
  /** One line of evidence: where or how it was used. */
  evidence?: string;
  /** One of the few he would lead with. */
  strong?: boolean;
};

export type SkillGroup = {
  name: string;
  skills: readonly Skill[];
};

export const SKILLS: readonly SkillGroup[] = [
  {
    name: "LLMs and agents",
    skills: [
      {
        name: "AI agents and multi-agent systems",
        evidence:
          "Sales and support agents at Commercient; Dispatch and Roundtable in the open.",
        strong: true,
      },
      {
        name: "Retrieval-augmented generation (RAG)",
        evidence: "Over ERP, CRM, documents and web sources at Commercient.",
        strong: true,
      },
      {
        name: "vLLM and self-hosted models",
        evidence: "Open-weight LLMs served on in-house GPU servers.",
        strong: true,
      },
      { name: "LangGraph" },
      {
        name: "LLM evaluation (evals)",
        evidence:
          "Ground-truth eval harnesses and grounding validators in the open agent series.",
      },
      {
        name: "Guardrails and approval gates",
        evidence:
          "Source-matched quotes, a Reviewer agent and a policy file enforced in code, in Dispatch.",
      },
      {
        name: "Cost and call tracing",
        evidence:
          "Every model call logged with tokens, cost and time in Dispatch and Roundtable.",
      },
      { name: "Context engineering" },
      { name: "Structured outputs" },
      { name: "Fine-tuning" },
      { name: "Model Context Protocol (MCP)" },
      { name: "Claude and OpenAI APIs" },
    ],
  },
  {
    name: "Document intelligence",
    skills: [
      {
        name: "Classification and structured extraction",
        evidence:
          "W-2, 1099, 1098, K-1 and brokerage statements into form schemas at DTAXO.",
        strong: true,
      },
      { name: "Source-traceable citations" },
      { name: "Human-in-the-loop review" },
      { name: "Workflow automation" },
    ],
  },
  {
    name: "Engineering",
    skills: [
      {
        name: "Python and FastAPI",
        evidence:
          "Python across all of it; FastAPI behind Dispatch and Roundtable.",
        strong: true,
      },
      { name: ".NET (C#)" },
      { name: "SQL and PostgreSQL (pgvector)" },
      { name: "REST APIs" },
      { name: "Scraping and ingestion pipelines" },
      { name: "AWS, GPU servers, Docker" },
      { name: "Next.js and TypeScript" },
      { name: "Playwright" },
    ],
  },
];

/* -------------------------------------------------------------------------
   Stories: a piece of work told the way a hiring manager reads it.
   The kicker is his own line, from his notes. Every other sentence is a
   fact from the sources named at the top of this file.
   ------------------------------------------------------------------------- */

export type Story = {
  /** One line, in his own words. */
  kicker: string;
  problem: string;
  built: string;
  /** The choices a weaker engineer would have got wrong, and why. */
  decisions: readonly { title: string; body: string }[];
  result: string;
};

const DTAXO_STORY: Story = {
  kicker: "In tax, a confident wrong number is worse than no number.",
  problem:
    "A CPA firm's filing season is a mountain of paper: W-2s, 1099s, 1098s, K-1s, 80-page brokerage statements, sideways scans, handwritten notes. Someone reads all of it, builds the workpapers, prepares the return, reviews it and keys it into the tax software by hand. A corrected 1099 in March forces the whole chain to be redone, and firms cannot hire their way out of a three-month spike.",
  built:
    "The AI backend for the whole pipeline. Documents in any condition are classified and extracted into tax-form schemas, with completeness tracking so the firm knows what is still missing. From those values it builds the workbook and leadsheet, then prepares and first-reviews the return, which is keyed into the firm's own Drake or CCH Axcess for a person to sign.",
  decisions: [
    {
      title: "Models over templates",
      body: "LLM-based extraction, because tax documents arrive in every layout and condition, and a fixed template parser breaks on the first sideways scan.",
    },
    {
      title: "Traceable, or it does not ship",
      body: "Every value is tied to the page it came from, because a plausible number is the most dangerous kind of error in a tax return.",
    },
    {
      title: "Let the AI decide, and say why",
      body: "Preparer judgment calls are made by the AI, flagged and documented with the reasoning. Once the AI could explain its decisions, reviewers trusted the pipeline.",
    },
    {
      title: "Re-run, do not restart",
      body: "A late or corrected document re-runs extraction, workpapers and the return, instead of starting the client over.",
    },
  ],
  result:
    "Per dtaxo.com: 8,000+ returns processed for 119 CPA firms and 2,800+ client entities, with firms live on their first return within 24 hours. 1040s run on Drake and CCH Axcess, 1120-S on Drake.",
};

const COMMERCIENT_STORY: Story = {
  kicker:
    "A $12,000-a-month chatbot that could not see the business, replaced by one that could.",
  problem:
    "Commercient's value is the data it syncs between ERP, CRM and eCommerce systems, yet the work around that data was manual: support looked up orders and invoices by hand, sales qualified leads themselves, and data questions needed someone to write SQL. The website chat ran on Drift at about $12,000 a month, and it could not see any of the business data the platform already held.",
  built:
    "A LangGraph sales agent grounded in the synced ERP and CRM data, which replaced Drift; a support agent that answers from live order, invoice and account data; a SQL View Generator; a self-serve bot builder; and the scraping and ingestion pipelines that feed them, on open-weight models served from the company's own GPUs.",
  decisions: [
    {
      title: "Inside the product, not beside it",
      body: "The agents shipped inside the existing .NET product, where the data and the customers already were.",
    },
    {
      title: "Own the models",
      body: "Open-weight LLMs served with vLLM on in-house GPUs instead of paying per token, chosen for throughput.",
    },
    {
      title: "State you can debug",
      body: "LangGraph, because it makes agent state explicit, and you cannot support what you cannot inspect.",
    },
    {
      title: "A systems problem first",
      body: "Putting AI into a product with customers is a systems problem first and a model problem second.",
    },
  ],
  result:
    "The Drift bill went, replaced by an agent that knows the business. Support, sales and data work that was fully manual now runs as agents inside the product.",
};

const DISPATCH_STORY: Story = {
  kicker:
    "Most businesses do not have a data problem. They have a paperwork problem.",
  problem:
    "Invoices arrive as PDFs, orders live in a spreadsheet, questions come by email, and a few people spend their week moving facts from one to another. Every AI demo makes this look solved. In production it fails on the boring parts: an unsupported number in a reply, an action nobody approved.",
  built:
    "An AI operations team: a dispatcher, six specialist agents and an independent Reviewer, with a policy that decides what runs on its own and what waits for a person, and a control room that shows what happened, what it cost and what is waiting.",
  decisions: [
    {
      title: "Grounded, or it does not say it",
      body: "Every extracted value carries a quote that must appear word for word in the source; one retry, then a person.",
    },
    {
      title: "Policy in code, not in the prompt",
      body: "A YAML approval matrix, evaluated in code, decides auto, notify or approve. A model never sets its own permissions.",
    },
    {
      title: "The arithmetic is not the model's job",
      body: "The three-way match of invoice, order and receipt is computed in code; the model only explains it.",
    },
    {
      title: "Every call has a price",
      body: "Each model call is logged with tokens, cost and time, and judgment goes to a larger model while volume goes to a smaller one.",
    },
  ],
  result:
    "v0 runs, open source under the MIT licence, and is live to try at dispatch.shreyaspachpute.in, with your own key or the keyless demo.",
};

const ROUNDTABLE_STORY: Story = {
  kicker:
    "The hard part is not getting agents to talk. It is getting them to stop.",
  problem:
    "Answering an RFP takes a week and a company's best people, because it needs judgment from several sides: is the scope realistic, is the price defensible, is that clause a risk. Most multi-agent demos hide that behind a supervisor that never lets its workers disagree.",
  built:
    "Nine agents around one versioned blackboard, run by a Chair. They research, scope, estimate, price, flag risks and write, and a Critic objects with evidence until the proposal holds up. Out come the proposal, a pricing sheet, a risk register and the minutes. A person can take a seat at the table at any point.",
  decisions: [
    {
      title: "Disagreement on the record",
      body: "Objections are objects with a claim and a citation; an objection without evidence is rejected.",
    },
    {
      title: "Limits, so it ends",
      body: "At most five objections and three arbitrations per meeting, so every meeting converges.",
    },
    {
      title: "Numbers from code",
      body: "Prices are computed in code against the rate card, and deviations beyond policy are refused.",
    },
    {
      title: "In parallel where it can be",
      body: "One estimator per work package, pricing beside risk, every section drafted at once.",
    },
  ],
  result:
    "v0 runs, open source, and is live to try at roundtable.shreyaspachpute.in, with your own key or without one.",
};

/* -------------------------------------------------------------------------
   Experience: newest first.
   ------------------------------------------------------------------------- */

export type Role = {
  company: string;
  title: string;
  start: string;
  /** "Present" for a current role. */
  end: string;
  place?: string;
  /** What the company or product does, in one line. */
  context: string;
  /** What was built or owned, and what came of it. */
  remarks: readonly string[];
  story?: Story;
};

export const EXPERIENCE: readonly Role[] = [
  {
    company: "ZYLITIX",
    title: "AI Product Engineer",
    start: "Mar 2026",
    end: "Present",
    place: "Remote",
    context:
      "DTAXO: turns a client's tax documents into a prepared, first-reviewed return and enters it into the CPA firm's own tax software.",
    remarks: [
      "Own the AI backend end to end, from a client's uploaded documents to a return ready for entry into Drake Tax or CCH Axcess.",
      "Built the document intelligence that classifies and extracts tax data from W-2s, the 1099 family, 1098s, K-1s and brokerage statements, scanned or not, with every value traceable to its source document.",
      "Built workpaper generation (workbook and leadsheet) with completeness tracking, so a firm can see what is still missing.",
      "Built AI preparation and first-level review: it flags judgment calls and records its reasoning for the person who signs.",
      "Designed the update flow, so a late or corrected document re-runs the pipeline instead of restarting the return.",
      "The platform today, per dtaxo.com: 8,000+ returns processed for 119 CPA firms and 2,800+ client entities.",
    ],
    story: DTAXO_STORY,
  },
  {
    company: "Commercient Sync",
    title: "AI Engineer",
    start: "Jan 2024",
    end: "Mar 2026",
    place: "Remote",
    context:
      "Commercient syncs data between ERP, CRM and eCommerce systems. I built the AI layer on top of that data.",
    remarks: [
      "Built a sales agent in LangGraph, grounded in synced ERP and CRM data, that qualifies website visitors and generates leads. It replaced a third-party chatbot (Drift) costing about $12,000 a month.",
      "Shipped a support agent inside the .NET product that resolves tickets from live order, invoice and account data.",
      "Served open-weight LLMs on in-house GPUs with vLLM, removing per-token API cost; ran RAG and fine-tuning for domain tasks.",
      "Designed a self-serve bot builder: customers connect Google Drive, YouTube links, sitemaps or files and get an assistant on their own data. Built the scraping and ingestion pipelines behind it.",
      "Built a SQL View Generator that turns plain-language questions into SQL views over synced data.",
      "Mentored teammates on applied AI as the AI surface of the product grew.",
    ],
    story: COMMERCIENT_STORY,
  },
];

/* -------------------------------------------------------------------------
   Projects: what has been put in the water.
   ------------------------------------------------------------------------- */

export type Project = {
  name: string;
  /** Who it was built for. */
  owner: string;
  status: "In production" | "Live to try" | "Open source";
  years: string;
  /** One sentence: what it is. */
  line: string;
  /** What he built or what sets it apart. */
  points: readonly string[];
  stack: readonly string[];
  links: readonly { label: string; href: string }[];
  story?: Story;
};

export const PROJECTS: readonly Project[] = [
  {
    name: "DTAXO",
    story: DTAXO_STORY,
    owner: "ZYLITIX",
    status: "In production",
    years: "2026 – now",
    line: "AI tax-preparation for CPA firms: from a shoebox of client documents to a first-reviewed return.",
    points: [
      "I own the AI backend: ingestion that tolerates any document condition, extraction into tax-form schemas, workpapers, AI preparation and first review.",
      "Every extracted value is traceable to the document it came from, because a tax return has no room for a plausible number.",
      "A corrected document re-runs the chain instead of restarting it.",
    ],
    stack: ["Python", "LLM extraction", "Document intelligence"],
    links: [{ label: "dtaxo.com", href: "https://dtaxo.com/" }],
  },
  {
    name: "Commercient AI",
    story: COMMERCIENT_STORY,
    owner: "Commercient Sync",
    status: "In production",
    years: "2024 – 2026",
    line: "AI agents on top of an ERP-to-CRM integration platform, running inside the existing product.",
    points: [
      "A LangGraph sales agent that replaced a $12,000-a-month third-party chatbot, and a support agent that works from live order and invoice data.",
      "Open-weight models served on the company's own GPUs with vLLM, so no agent pays per token.",
      "A self-serve bot builder and a SQL View Generator, with the scraping and ingestion pipelines that feed them.",
    ],
    stack: ["Python", ".NET", "vLLM", "LangGraph", "RAG", "Fine-tuning"],
    links: [
      {
        label: "commercient.com/ai/agents",
        href: "https://www.commercient.com/ai/agents/",
      },
    ],
  },
  {
    name: "Dispatch",
    story: DISPATCH_STORY,
    owner: "Open source",
    status: "Live to try",
    years: "2026",
    line: "An AI operations team for businesses that run on email, PDFs and spreadsheets.",
    points: [
      "Six specialist agents, each with its own context pack, and an independent Reviewer that can pass, amend or block anything they send.",
      "Extraction quotes are validated word for word against the source; approvals follow a policy written in YAML and evaluated in code, not by a model.",
      "A live control room, with bring-your-own-key.",
    ],
    stack: ["Python", "LangGraph", "FastAPI", "Next.js"],
    links: [
      { label: "Try it", href: "https://dispatch.shreyaspachpute.in/" },
      { label: "Code", href: "https://github.com/shreyas-pachpute/dispatch" },
    ],
  },
  {
    name: "Roundtable",
    story: ROUNDTABLE_STORY,
    owner: "Open source",
    status: "Live to try",
    years: "2026",
    line: "A multi-agent proposal team: send it an RFP, get back a proposal, a price, the risks and the minutes.",
    points: [
      "Nine agents on a versioned blackboard, run by a Chair, with hard limits on objections and arbitrations.",
      "Fan-out sub-estimates with variance flags, evidence-backed objections, an Arbiter, and a seat for a human.",
    ],
    stack: ["Python", "LangGraph", "FastAPI", "Next.js"],
    links: [
      { label: "Try it", href: "https://roundtable.shreyaspachpute.in/" },
      { label: "Code", href: "https://github.com/shreyas-pachpute/roundtable" },
    ],
  },
];

/**
 * A series of agent systems on GitHub. The one-line descriptions are the
 * repositories' own.
 */
export const SERIES: readonly { name: string; line: string; repo: string }[] = [
  {
    name: "Incident Commander",
    line: "Correlated investigation across logs, metrics and deploys, with hard safety rails on remediation.",
    repo: "ai-incident-commander",
  },
  {
    name: "Engineering Control Plane",
    line: "Subagents, tool permissions, sandboxing and human approval for agents working on real repositories.",
    repo: "ai-engineering-control-plane",
  },
  {
    name: "Executive Operating System",
    line: "Supervisor and specialist agents synthesising cross-department signals with full evidence trails.",
    repo: "ai-executive-operating-system",
  },
  {
    name: "Contract Risk Review",
    line: "Clause extraction, policy comparison and risk explanation, routed to legal for judgment.",
    repo: "ai-contract-risk-review",
  },
  {
    name: "Financial Analyst",
    line: "Variance investigation and narrative explanation on top of deterministic arithmetic.",
    repo: "ai-financial-analyst",
  },
  {
    name: "Tax Return Review",
    line: "Document intelligence, deterministic validation and anomaly investigation for return review.",
    repo: "ai-tax-return-review",
  },
  {
    name: "Customer Support Control Tower",
    line: "Retrieval plus an investigation agent across tickets, CRM, docs and product data.",
    repo: "ai-customer-support-control-tower",
  },
  {
    name: "Revenue Operations",
    line: "Investigation, risk scoring and drafted outreach for at-risk deals, with human approval.",
    repo: "ai-revenue-operations",
  },
  {
    name: "Procurement Negotiation",
    line: "Spend analysis and negotiation briefs, with a mandatory human gate before outreach.",
    repo: "ai-procurement-negotiation",
  },
  {
    name: "Account Intelligence",
    line: "Multi-source company research with explicit fact-versus-hypothesis labelling.",
    repo: "ai-account-intelligence",
  },
  {
    name: "Resource Planner",
    line: "Constrained optimisation and scenario explanation for staffing decisions.",
    repo: "ai-resource-planner",
  },
  {
    name: "Data Investigation",
    line: "Hypothesis generation and testing over the warehouse, with evidence, not guesses.",
    repo: "ai-data-investigation",
  },
];

/* -------------------------------------------------------------------------
   Sea trials: the six pressures from the home page (PRESSURES in
   lib/site.ts, same order), put to the real projects. Each entry says what
   held and, where there is one, the proof. A project only lists the
   pressures there is evidence for.
   ------------------------------------------------------------------------- */

export type Trial = {
  /** Index into PRESSURES: 0 evals, 1 guardrails, 2 architecture,
   *  3 cost and latency, 4 observability, 5 interface. */
  pressure: 0 | 1 | 2 | 3 | 4 | 5;
  held: string;
  proof?: { label: string; href: string };
};

const DISPATCH_CODE =
  "https://github.com/shreyas-pachpute/dispatch/blob/main/apps/api/dispatch";
const ROUNDTABLE_CODE =
  "https://github.com/shreyas-pachpute/roundtable/blob/main/apps/api/roundtable";

export const TRIALS: Readonly<Record<string, readonly Trial[]>> = {
  DTAXO: [
    {
      pressure: 0,
      held: "Every extracted value is tied to the page it came from, and the AI flags each judgment call with its reasoning for the person who signs.",
    },
    {
      pressure: 2,
      held: "It carries real volume, and a late or corrected document re-runs the chain instead of restarting it.",
      proof: {
        label: "8,000+ returns, 119 firms, per dtaxo.com",
        href: "https://dtaxo.com/",
      },
    },
    {
      pressure: 4,
      held: "The firm watches every return move through its stages, from upload to finished return, in a live pipeline.",
    },
    {
      pressure: 5,
      held: "A new firm files its first live return within 24 hours of onboarding.",
      proof: { label: "dtaxo.com", href: "https://dtaxo.com/" },
    },
  ],
  "Commercient AI": [
    {
      pressure: 2,
      held: "The agents run inside the existing .NET product, on the ERP and CRM data it already syncs, not beside it.",
      proof: {
        label: "commercient.com/ai/agents",
        href: "https://www.commercient.com/ai/agents/",
      },
    },
    {
      pressure: 3,
      held: "Open-weight models on the company's own GPUs with vLLM, so no agent pays per token. The sales agent replaced a $12,000-a-month bot.",
    },
    {
      pressure: 4,
      held: "The agents are LangGraph graphs with explicit state, so a bad answer can be traced step by step.",
    },
    {
      pressure: 5,
      held: "Self-serve: customers connect Google Drive, YouTube links, sitemaps or files and get an assistant on their own data.",
    },
  ],
  Dispatch: [
    {
      pressure: 0,
      held: "Every extracted quote must appear word for word in the source document. One retry, then a person.",
      proof: {
        label: "validate_quotes, agents.py",
        href: `${DISPATCH_CODE}/agents.py#L41`,
      },
    },
    {
      pressure: 1,
      held: "An independent Reviewer can pass, amend or block every outbound action, and a policy evaluated in code decides what waits for approval. The demo data seeds a prompt injection on purpose.",
      proof: {
        label: "policy.yaml",
        href: "https://github.com/shreyas-pachpute/dispatch/blob/main/data/northwind/policy.yaml",
      },
    },
    {
      pressure: 3,
      held: "A gateway sends judgment to a larger model and volume to a smaller one, caches the stable prompt and prices every call.",
      proof: { label: "gateway.py", href: `${DISPATCH_CODE}/gateway.py#L33` },
    },
    {
      pressure: 4,
      held: "Every model call is logged with tokens, cost and milliseconds and shown live in the control room; each case keeps the exact context its agents saw.",
      proof: { label: "store.py", href: `${DISPATCH_CODE}/store.py` },
    },
    {
      pressure: 5,
      held: "Live to try, with your own key or the keyless demo.",
      proof: {
        label: "dispatch.shreyaspachpute.in",
        href: "https://dispatch.shreyaspachpute.in/",
      },
    },
  ],
  Roundtable: [
    {
      pressure: 0,
      held: "Every quote is checked against the RFP page it cites, and every price traces to the rate card.",
      proof: {
        label: "quote_ok, protocol.py",
        href: `${ROUNDTABLE_CODE}/protocol.py#L88`,
      },
    },
    {
      pressure: 1,
      held: "Objections without evidence are rejected, prices are computed in code, and hard limits (five objections, three arbitrations) make every meeting end.",
      proof: {
        label: "LIMITS, protocol.py",
        href: `${ROUNDTABLE_CODE}/protocol.py#L29`,
      },
    },
    {
      pressure: 3,
      held: "The heavy rounds run concurrently, so the slowest branch sets the pace, not the sum, and every turn is priced.",
      proof: {
        label: "asyncio.gather, protocol.py",
        href: `${ROUNDTABLE_CODE}/protocol.py#L169`,
      },
    },
    {
      pressure: 4,
      held: "Every turn is recorded with tokens, cost and time; the transcript is the minutes.",
      proof: { label: "store.py", href: `${ROUNDTABLE_CODE}/store.py#L15` },
    },
    {
      pressure: 5,
      held: "Live to try, and a person can take a seat at the table to answer, override or settle.",
      proof: {
        label: "roundtable.shreyaspachpute.in",
        href: "https://roundtable.shreyaspachpute.in/",
      },
    },
  ],
};

/* -------------------------------------------------------------------------
   Orders: jobs he would be hired for, and the skills (by name, as in
   SKILLS) each one takes. Drawn from the work above; used by the Skills
   page's sail plan.
   ------------------------------------------------------------------------- */

export type Order = {
  order: string;
  skills: readonly string[];
  /** Where he has done it. */
  where: string;
};

export const ORDERS: readonly Order[] = [
  {
    order: "Read a shoebox of tax documents and get every number right",
    skills: [
      "Classification and structured extraction",
      "Source-traceable citations",
      "Human-in-the-loop review",
      "Workflow automation",
      "Python and FastAPI",
    ],
    where: "DTAXO",
  },
  {
    order: "Put an agent inside a product that already has customers",
    skills: [
      "AI agents and multi-agent systems",
      "Retrieval-augmented generation (RAG)",
      "LangGraph",
      ".NET (C#)",
      "REST APIs",
    ],
    where: "Commercient",
  },
  {
    order: "Stop an agent from inventing a number",
    skills: [
      "Guardrails and approval gates",
      "LLM evaluation (evals)",
      "Source-traceable citations",
      "Structured outputs",
      "Human-in-the-loop review",
    ],
    where: "Dispatch, DTAXO and the agent series",
  },
  {
    order: "Cut the model bill",
    skills: [
      "vLLM and self-hosted models",
      "Cost and call tracing",
      "Fine-tuning",
      "AWS, GPU servers, Docker",
    ],
    where: "Commercient, Dispatch and Roundtable",
  },
  {
    order: "Turn a company's own documents into an assistant",
    skills: [
      "Scraping and ingestion pipelines",
      "Retrieval-augmented generation (RAG)",
      "Context engineering",
      "SQL and PostgreSQL (pgvector)",
    ],
    where: "Commercient's bot builder and SQL View Generator",
  },
  {
    order: "Get a team of agents to agree, and stop",
    skills: [
      "AI agents and multi-agent systems",
      "LangGraph",
      "Context engineering",
      "Structured outputs",
      "Claude and OpenAI APIs",
    ],
    where: "Roundtable and Dispatch",
  },
];

/* -------------------------------------------------------------------------
   Practice: what makes an agent hold, and where it is built.

   Each line is something that exists in code, in one of his public
   repositories (see the note at the top of this file). Numbers are the
   repositories' own: test counts and results as their READMEs state them.
   ------------------------------------------------------------------------- */

export type Practice = {
  area: "Evals" | "Guardrails" | "Observability" | "Cost" | "Latency";
  /** What was built, how, and what it changed. */
  line: string;
  /** The repositories it is in, by name. */
  where: readonly string[];
};

export const PRACTICE: readonly Practice[] = [
  {
    area: "Evals",
    line: "Built eval harnesses on ground-truth cases, scored for root cause, calibration, grounding and cost. On a small local model the grounding check caught fabricated evidence 2 for 2; a fixture test caught four mislabelled excerpts.",
    where: [
      "ai-incident-commander",
      "ai-data-investigation",
      "ai-contract-risk-review",
    ],
  },
  {
    area: "Guardrails",
    line: "Put the gates in code, not prompts: quotes must match the source, a Reviewer agent can block any outbound action, a YAML policy decides what needs approval, and a command allowlist passes 27 adversarial tests, an injected force-push included.",
    where: ["dispatch", "ai-engineering-control-plane"],
  },
  {
    area: "Observability",
    line: "Logged every model call (agent, model, tokens, cached tokens, cost, time) and showed it live beside the transcript and the approval queue. Each case keeps the exact context its agents saw, so any decision can be replayed.",
    where: ["dispatch", "roundtable"],
  },
  {
    area: "Cost",
    line: "Built a gateway that sends judgment to a larger model and volume work to a smaller one, caches stable prompt prefixes and prices every call. Matching, pricing and policy run in plain code, at no model cost.",
    where: ["dispatch", "roundtable"],
  },
  {
    area: "Latency",
    line: "Ran the heavy rounds concurrently (an estimator per work package, pricing beside risk, six sections at once), so the slowest branch sets the pace, not the sum. Every loop has a hard cap or a timeout.",
    where: ["roundtable"],
  },
];

/* -------------------------------------------------------------------------
   Achievements: things finished, shipped or recognised that can be checked.
   ------------------------------------------------------------------------- */

export type Achievement = {
  name: string;
  /** Who issued it, or where it happened. */
  by?: string;
  date?: string;
  /** One line on why it matters. */
  why?: string;
  href?: string;
  /** A certificate or course, as opposed to something built. */
  credential?: boolean;
};

export const ACHIEVEMENTS: readonly Achievement[] = [
  {
    name: "AWS Certified Machine Learning – Specialty",
    by: "Amazon Web Services",
    date: "March 2024, valid through March 2027",
    why: "Designing, building, tuning, deploying and maintaining ML solutions on AWS, and choosing the right approach for a business problem.",
    href: "https://www.credly.com/badges/ce106f19-ee1e-4d96-9e8e-b25f4f5b1249",
    credential: true,
  },
  {
    name: "Amazon ML Summer School",
    by: "Amazon (India)",
    date: "2023",
    why: "A selective, test-gated programme taught by Amazon scientists: four weekends of applied ML with live Q&A.",
    href: "https://www.amazon.science/news-and-features/third-annual-2023-ml-summer-school-amazon-india",
    credential: true,
  },
  {
    name: "DTAXO, used by 119 CPA firms",
    by: "ZYLITIX",
    date: "2026",
    why: "8,000+ returns processed on the platform whose AI backend I own. Figures from dtaxo.com.",
    href: "https://dtaxo.com/",
  },
  {
    name: "An in-house agent in place of a $12,000-a-month chatbot",
    by: "Commercient Sync",
    why: "The LangGraph sales agent replaced the third-party bot, and unlike it could use the business data the platform already held.",
  },
  {
    name: "Dispatch and Roundtable released",
    by: "Open source",
    date: "2026",
    why: "Two multi-agent systems, built in public, each with a version anyone can try without a key.",
    href: "https://github.com/shreyas-pachpute",
  },
];

/* -------------------------------------------------------------------------
   Education: newest first.
   ------------------------------------------------------------------------- */

export type Qualification = {
  institution: string;
  /** Degree and field, or the name of the course. */
  award: string;
  years: string;
  /** Grade, thesis, anything worth one line. Optional. */
  note?: string;
};

export const EDUCATION: readonly Qualification[] = [
  {
    institution: "Sarvajanik College of Engineering & Technology, Surat",
    award: "Bachelor of Engineering, Computer Science",
    years: "2020 – 2024",
    note: "CGPA 8.3 / 10",
  },
];
