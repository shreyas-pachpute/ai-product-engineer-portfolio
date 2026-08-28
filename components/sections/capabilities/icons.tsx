import type { SVGProps } from "react";

/**
 * Six marks, one visual grammar: nodes (circles) and thin connecting
 * lines, continuing the Logo's node-graph language rather than reaching
 * for literal/generic AI iconography (brains, sparkles, robot faces).
 * Specific to this section — if a future page wants the same "RAG" icon
 * next to a service description, it can still import from here directly.
 */

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function AgentsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="9" cy="9" r="3.2" {...stroke} />
      <path d="M11.3 11.3L18 18M18 18V13M18 18H13" {...stroke} />
    </svg>
  );
}

export function MultiAgentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 6.3V9.8M10.5 13.5L6.3 15.7M13.5 13.5L17.7 15.7"
        {...stroke}
      />
      <circle cx="12" cy="12" r="2.2" {...stroke} />
      <circle cx="12" cy="4.5" r="1.8" {...stroke} />
      <circle cx="5" cy="17" r="1.8" {...stroke} />
      <circle cx="19" cy="17" r="1.8" {...stroke} />
    </svg>
  );
}

export function KnowledgeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4 6H14M4 10H14M4 14H10" {...stroke} />
      <circle cx="17.5" cy="16.5" r="3" {...stroke} />
      <path d="M19.8 18.8L22 21" {...stroke} />
    </svg>
  );
}

export function CopilotIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="9" cy="12" r="5" {...stroke} />
      <circle cx="16.5" cy="8.5" r="2.3" {...stroke} />
      <path d="M12 10.3L14.5 9" {...stroke} />
    </svg>
  );
}

export function VoiceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <line x1="4" y1="10" x2="4" y2="14" {...stroke} />
      <line x1="8" y1="6" x2="8" y2="18" {...stroke} />
      <line x1="12" y1="3" x2="12" y2="21" {...stroke} />
      <line x1="16" y1="6" x2="16" y2="18" {...stroke} />
      <line x1="20" y1="10" x2="20" y2="14" {...stroke} />
    </svg>
  );
}

export function InfraIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3L20 7V13C20 17 16.5 20 12 21C7.5 20 4 17 4 13V7L12 3Z"
        {...stroke}
      />
      <path d="M8.5 12L11 14.5L15.5 9.5" {...stroke} />
    </svg>
  );
}
