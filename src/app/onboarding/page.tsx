import Link from "next/link";
import { BrandOnboarding } from "@/ui/BrandOnboarding";

export default function OnboardingPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Client onboarding</h1>
        <Link href="/content" className="text-sm underline">Content</Link>
      </header>
      <BrandOnboarding />
    </main>
  );
}
