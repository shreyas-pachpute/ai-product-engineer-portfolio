import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Coded product mockups, not screenshots — there are no real UI captures
 * to show yet (see conversation context: synthetic-but-realistic panels
 * were the deliberate choice over placeholder images or invented photos).
 * Each mockup illustrates the actual mechanism the matching case study
 * describes in prose (confidence-routed extraction, an agent trace with a
 * human checkpoint, live barge-in transcription) rather than a generic
 * "AI dashboard" — so it stays truthful to the linked write-up instead of
 * just decorating the card.
 *
 * Pure CSS animation (no Framer/client boundary needed), same pattern as
 * HeroBackground — every `animate-*` used here is a token in globals.css
 * already covered by the sitewide `prefers-reduced-motion` override.
 */

function AppWindow({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface-base relative overflow-hidden">
      <div className="border-border-subtle bg-surface-raised/60 flex items-center gap-1.5 border-b px-3 py-2">
        <span className="bg-status-danger/70 size-2 rounded-full" />
        <span className="bg-status-warning/70 size-2 rounded-full" />
        <span className="bg-status-success/70 size-2 rounded-full" />
      </div>
      {children}
    </div>
  );
}

function PanelLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-text-tertiary mb-2 font-mono text-[10px] tracking-[0.15em] uppercase">
      {children}
    </p>
  );
}

const EXTRACTED_FIELDS = [
  { label: "vendor_name", confidence: "99%", ok: true },
  { label: "invoice_number", confidence: "97%", ok: true },
  { label: "total_amount", confidence: "98%", ok: true },
  { label: "due_date", confidence: "61%", ok: false },
];

export function DocumentIntelligenceVisual() {
  return (
    <AppWindow>
      <div className="bg-border-subtle grid grid-cols-2 gap-px">
        <div className="bg-surface-base relative p-4">
          <PanelLabel>Source</PanelLabel>
          <div className="space-y-2">
            <div className="bg-border-highlight h-2 w-3/4 rounded-full" />
            <div className="bg-border-subtle h-2 w-full rounded-full" />
            <div className="bg-border-subtle h-2 w-5/6 rounded-full" />
            <div className="bg-border-subtle h-2 w-2/3 rounded-full" />
            <div className="bg-border-subtle mt-3 h-2 w-full rounded-full" />
            <div className="bg-border-subtle h-2 w-4/5 rounded-full" />
            <div className="bg-border-subtle h-2 w-3/5 rounded-full" />
          </div>
          <div
            aria-hidden="true"
            className="animate-scan-sweep via-accent-primary absolute inset-x-4 h-px bg-gradient-to-r from-transparent to-transparent"
            style={{ boxShadow: "0 0 8px var(--color-accent-primary)" }}
          />
        </div>
        <div className="bg-surface-base p-4">
          <PanelLabel>Extracted · per-field confidence</PanelLabel>
          <div className="space-y-1.5">
            {EXTRACTED_FIELDS.map((field) => (
              <div
                key={field.label}
                className="border-border-subtle bg-surface-raised flex items-center justify-between gap-2 rounded-sm border px-2 py-1.5"
              >
                <span className="text-text-secondary truncate font-mono text-[11px]">
                  {field.label}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[10px]",
                    field.ok
                      ? "bg-status-success/10 text-status-success"
                      : "bg-status-warning/10 text-status-warning",
                  )}
                >
                  {field.confidence}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppWindow>
  );
}

const TRACE_STEPS = [
  "Planner — decompose request",
  "Retrieval — billing system",
  "Retrieval — CRM history",
  "Retrieval — product usage",
  "Synthesis — draft reply",
];

export function SupportCopilotVisual() {
  return (
    <AppWindow>
      <div className="bg-border-subtle grid grid-cols-5 gap-px">
        <div className="bg-surface-base col-span-2 p-4">
          <PanelLabel>Ticket #4021</PanelLabel>
          <div className="border-border-subtle bg-surface-raised rounded-sm border p-2.5">
            <p className="text-text-secondary text-[11px] leading-relaxed">
              &ldquo;Why was I charged twice this month, and is my plan still
              active?&rdquo;
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span
              className="bg-accent-primary animate-typing-bounce size-1.5 rounded-full"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="bg-accent-primary animate-typing-bounce size-1.5 rounded-full"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="bg-accent-primary animate-typing-bounce size-1.5 rounded-full"
              style={{ animationDelay: "300ms" }}
            />
            <span className="text-text-tertiary ml-1 font-mono text-[10px]">
              drafting reply
            </span>
          </div>
        </div>
        <div className="bg-surface-base col-span-3 p-4">
          <PanelLabel>Agent trace</PanelLabel>
          <ul className="space-y-2">
            {TRACE_STEPS.map((step) => (
              <li key={step} className="flex items-center gap-2">
                <svg
                  className="text-status-success size-3 shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8.5L6.5 12L13 4.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-text-secondary font-mono text-[11px]">
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppWindow>
  );
}

const WAVEFORM_BARS = Array.from({ length: 28 });

export function VoiceOrderingVisual() {
  return (
    <AppWindow>
      <div className="bg-border-subtle grid grid-cols-5 gap-px">
        <div className="bg-surface-base col-span-3 flex flex-col justify-between p-4">
          <div className="flex items-center gap-2">
            <span className="bg-status-danger animate-pulse-glow size-1.5 rounded-full" />
            <span className="text-text-tertiary font-mono text-[10px] tracking-[0.15em] uppercase">
              Live call
            </span>
          </div>
          <div className="flex h-14 items-end gap-[3px]">
            {WAVEFORM_BARS.map((_, i) => (
              <span
                key={i}
                className="bg-accent-primary/70 animate-bar-bounce w-full origin-bottom rounded-full"
                style={{
                  height: `${22 + ((i * 37) % 60)}%`,
                  animationDelay: `${(i % 8) * 90}ms`,
                  animationDuration: `${900 + (i % 5) * 120}ms`,
                }}
              />
            ))}
          </div>
          <p className="text-text-secondary mt-3 font-mono text-[11px]">
            &ldquo;—actually make that two large, no wait—&rdquo;
          </p>
        </div>
        <div className="bg-surface-base col-span-2 p-4">
          <PanelLabel>Order</PanelLabel>
          <ul className="space-y-1.5">
            <li className="border-border-subtle bg-surface-raised text-text-secondary rounded-sm border px-2 py-1.5 font-mono text-[11px]">
              2× Large Pizza
            </li>
            <li className="border-border-subtle bg-surface-raised text-text-secondary rounded-sm border px-2 py-1.5 font-mono text-[11px]">
              1× Garlic Bread
            </li>
            <li className="border-accent-primary/30 bg-accent-glow text-accent-primary-hover rounded-sm border border-dashed px-2 py-1.5 font-mono text-[11px]">
              validating…
            </li>
          </ul>
        </div>
      </div>
    </AppWindow>
  );
}
