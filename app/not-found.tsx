import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Off the chart",
  robots: { index: false },
};

/** 404. Same sea, no map for this bit of it. */
export default function NotFound() {
  return (
    <main className="lost">
      <div className="lost__inner">
        <Mark className="lost__mark" />
        <h1 className="display title">Off the chart.</h1>
        <p className="body">
          There is nothing at this address. The harbour is this way.
        </p>
        <Link className="flag label" href="/">
          Back to harbour
        </Link>
      </div>
    </main>
  );
}
