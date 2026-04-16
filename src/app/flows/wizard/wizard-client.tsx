"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Channel = "Email" | "SMS" | "Push";
type WizardState = {
  name: string;
  email: string;
  channels: Channel[];
  step: 1 | 2 | 3;
};

const STORAGE_KEY = "wizard-state";
const CHANNELS: Channel[] = ["Email", "SMS", "Push"];

const INITIAL: WizardState = { name: "", email: "", channels: [], step: 1 };

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function highestReachableStep(state: WizardState): 1 | 2 | 3 {
  if (!state.name.trim() || !isEmail(state.email)) return 1;
  if (state.channels.length === 0) return 2;
  return 3;
}

export function WizardClient({ submitAction }: { submitAction: () => Promise<void> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<WizardState>(INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; channels?: string }>({});

  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    let loaded = INITIAL;
    if (raw) {
      try {
        loaded = { ...INITIAL, ...(JSON.parse(raw) as Partial<WizardState>) };
      } catch {
        loaded = INITIAL;
      }
    }
    const requested = Number(searchParams.get("step") ?? "1") as 1 | 2 | 3;
    const clamped = Math.min(requested || 1, highestReachableStep(loaded)) as 1 | 2 | 3;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration from localStorage requires client-side setState
    setState({ ...loaded, step: clamped });
    setHydrated(true);
  }, [searchParams]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const validate = (target: 1 | 2 | 3): boolean => {
    const next: typeof errors = {};
    if (target >= 2) {
      if (!state.name.trim()) next.name = "Full name is required";
      if (!isEmail(state.email)) next.email = "Valid email is required";
    }
    if (target >= 3) {
      if (state.channels.length === 0) next.channels = "Select at least one channel";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    const target = Math.min(3, (state.step + 1) as 2 | 3);
    if (!validate(target as 1 | 2 | 3)) return;
    setState((s) => ({ ...s, step: target as 1 | 2 | 3 }));
  };
  const goBack = () => {
    setErrors({});
    setState((s) => ({ ...s, step: Math.max(1, s.step - 1) as 1 | 2 | 3 }));
  };
  const toggleChannel = (ch: Channel) => {
    setState((s) => ({
      ...s,
      channels: s.channels.includes(ch)
        ? s.channels.filter((c) => c !== ch)
        : [...s.channels, ch],
    }));
  };

  const onSubmit = async () => {
    if (!validate(3)) return;
    window.localStorage.removeItem(STORAGE_KEY);
    await submitAction();
    router.push(
      `/flows/wizard/done?name=${encodeURIComponent(state.name)}&email=${encodeURIComponent(state.email)}&channels=${encodeURIComponent(state.channels.join(","))}`,
    );
  };

  const header = useMemo(
    () => (
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span data-testid="wizard-step">Step {state.step} of 3</span>
        <ol className="flex gap-1">
          {[1, 2, 3].map((n) => (
            <li
              key={n}
              className={`h-1 w-10 rounded ${n <= state.step ? "bg-foreground" : "bg-muted"}`}
              data-testid={`wizard-progress-${n}`}
            />
          ))}
        </ol>
      </div>
    ),
    [state.step],
  );

  if (!hydrated) {
    return <div data-testid="wizard-loading">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      {header}

      {state.step === 1 && (
        <section data-testid="wizard-step-1" className="space-y-4">
          <h2 className="text-lg font-medium">Account</h2>
          <div>
            <label className="block text-sm font-medium" htmlFor="wiz-name">
              Full name
            </label>
            <input
              id="wiz-name"
              className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
              value={state.name}
              onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
              data-testid="wizard-name-input"
            />
            {errors.name && (
              <p role="alert" className="text-xs text-red-500" data-testid="wizard-name-error">
                {errors.name}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="wiz-email">
              Email
            </label>
            <input
              id="wiz-email"
              type="email"
              className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
              value={state.email}
              onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))}
              data-testid="wizard-email-input"
            />
            {errors.email && (
              <p role="alert" className="text-xs text-red-500" data-testid="wizard-email-error">
                {errors.email}
              </p>
            )}
          </div>
        </section>
      )}

      {state.step === 2 && (
        <section data-testid="wizard-step-2" className="space-y-4">
          <h2 className="text-lg font-medium">Preferences</h2>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Notification channels</legend>
            {CHANNELS.map((ch) => (
              <label key={ch} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={state.channels.includes(ch)}
                  onChange={() => toggleChannel(ch)}
                  data-testid={`wizard-channel-${ch.toLowerCase()}`}
                />
                {ch}
              </label>
            ))}
          </fieldset>
          {errors.channels && (
            <p role="alert" className="text-xs text-red-500" data-testid="wizard-channels-error">
              {errors.channels}
            </p>
          )}
        </section>
      )}

      {state.step === 3 && (
        <section data-testid="wizard-step-3" className="space-y-4">
          <h2 className="text-lg font-medium">Review</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-medium">Name</dt>
              <dd data-testid="wizard-review-name">{state.name}</dd>
            </div>
            <div>
              <dt className="font-medium">Email</dt>
              <dd data-testid="wizard-review-email">{state.email}</dd>
            </div>
            <div>
              <dt className="font-medium">Channels</dt>
              <dd data-testid="wizard-review-channels">{state.channels.join(", ")}</dd>
            </div>
          </dl>
        </section>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={state.step === 1}
          className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
          data-testid="wizard-back"
        >
          Back
        </button>
        {state.step < 3 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
            data-testid="wizard-next"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
            data-testid="wizard-submit"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
