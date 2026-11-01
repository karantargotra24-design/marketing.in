import Link from "next/link";
import { notFound } from "next/navigation";
import { defaultStore } from "@/hq";
import { clientIdSchema } from "@/hq/types";

export const dynamic = "force-dynamic";

export default async function Report({ params }: { params: Promise<{ client: string; file: string }> }) {
  const { client, file } = await params;
  if (!clientIdSchema.safeParse(client).success || !/^[\w.-]+\.md$/.test(file)) notFound();
  const body = await defaultStore().readOutput(client, file);
  if (body === null) notFound();
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link href={`/hq/client/${client}`} className="text-sm underline">← {client}</Link>
      <pre className="mt-3 whitespace-pre-wrap rounded border bg-white p-4 text-sm leading-relaxed">{body}</pre>
    </main>
  );
}
