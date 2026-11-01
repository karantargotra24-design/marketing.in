export default function Locked() {
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-xl font-bold">Agency HQ is locked</h1>
      <p className="mt-2 text-sm">Sign in with a staff account (owner or member). If auth is not configured on this server, HQ stays closed in production on purpose.</p>
      <a href="/login" className="mt-3 inline-block underline text-sm">Go to login</a>
    </main>
  );
}
