import { Suspense } from "react";
import { WizardClient } from "./wizard-client";

async function submit(): Promise<void> {
  "use server";
}

export default function WizardPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Multi-step wizard</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Three steps. State persists across refresh via localStorage. Each step
        validates before you can advance.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div data-testid="wizard-loading">Loading…</div>}>
          <WizardClient submitAction={submit} />
        </Suspense>
      </div>
    </main>
  );
}
