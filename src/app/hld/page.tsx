import { AppShell } from "@/components/app-shell";
import { DesignPractice } from "@/components/design-practice";
import { HLD_QUESTIONS } from "@/data/hld-questions";

export default function HldPage() {
  return (
    <AppShell
      eyebrow="System thinking"
      title="High-level design"
      description="Draw a prompt, structure the system, and save a concise interview-ready outline."
      accent="violet"
    >
      <DesignPractice
        questions={HLD_QUESTIONS}
        kind="hld"
        accent="violet"
        notePlaceholder={"Requirements\n• Functional...\n• Non-functional...\n\nAPIs & data model\n...\n\nArchitecture & trade-offs\n..."}
      />
    </AppShell>
  );
}
