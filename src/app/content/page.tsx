import Link from "next/link";
import { ContentStudio } from "@/ui/ContentStudio";

export default function ContentPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Content</h1>
        <span className="flex gap-3 text-sm"><Link href="/onboarding" className="underline">Onboarding</Link><Link href="/dashboard" className="underline">Clients</Link></span>
      </header>
      <ContentStudio />
    </main>
  );
}
