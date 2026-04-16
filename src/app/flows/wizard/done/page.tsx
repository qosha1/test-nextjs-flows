import Link from "next/link";

export default async function WizardDonePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; email?: string; channels?: string }>;
}) {
  const { name = "", email = "", channels = "" } = await searchParams;
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-semibold" data-testid="wizard-done-heading">
        All set!
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Your preferences have been saved.
      </p>
      <dl className="mt-6 space-y-2 text-sm">
        <div>
          <dt className="font-medium">Name</dt>
          <dd data-testid="wizard-done-name">{name}</dd>
        </div>
        <div>
          <dt className="font-medium">Email</dt>
          <dd data-testid="wizard-done-email">{email}</dd>
        </div>
        <div>
          <dt className="font-medium">Channels</dt>
          <dd data-testid="wizard-done-channels">{channels}</dd>
        </div>
      </dl>
      <Link
        href="/flows/wizard"
        className="mt-6 inline-block text-sm underline"
        data-testid="wizard-done-restart"
      >
        Start over
      </Link>
    </main>
  );
}
