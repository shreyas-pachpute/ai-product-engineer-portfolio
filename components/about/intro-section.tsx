import { Text } from "@/components/primitives";
import { INTRO_PARAGRAPHS } from "./content";

export function IntroSection() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      {INTRO_PARAGRAPHS.map((paragraph) => (
        <Text key={paragraph} size="lead" tone="secondary">
          {paragraph}
        </Text>
      ))}
    </div>
  );
}
