import { AppShell } from "@/components/app-shell";
import { DesignPractice } from "@/components/design-practice";
import { LLD_QUESTIONS } from "@/data/lld-questions";

export default function LldPage() {
  return (
    <AppShell
      eyebrow="Object modeling"
      title="Low-level design"
      description="Practice classes, responsibilities, interfaces, and the trade-offs behind them."
      accent="orange"
    >
      <DesignPractice
        questions={LLD_QUESTIONS}
        kind="lld"
        accent="orange"
        notePlaceholder={"Core objects\n• Class / responsibility\n\nRelationships\n• Composition / inheritance\n\nKey interfaces & patterns\n..."}
      />
    </AppShell>
  );
}
