export function SandboxBanner({ daysLeft }: { daysLeft: number | null }) {
  return (
    <p
      role="status"
      className="border-b bg-amber-50 px-4 py-2 text-center text-sm text-amber-950"
    >
      Demo environment — resets in {daysLeft ?? "—"} days — Stripe test mode
    </p>
  );
}
