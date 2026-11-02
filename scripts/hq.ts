import { writeFileSync, readFileSync } from "node:fs";
import { defaultStore, fileStore, exportAll, importAll, Orchestrator, seedWorkspaces, onboardClient, AGENT_LIST, WORKFLOWS, aiEngineFromEnv, describeAi, summarizeUsage, runLiveTest } from "../src/hq";

const [cmd, ...args] = process.argv.slice(2);
const store = defaultStore();

async function main() {
  if (cmd === "seed") return seedWorkspaces(store);
  if (cmd === "audit" || cmd === "run") {
    await seedWorkspaces(store, true);
    const workflow = cmd === "audit" ? "audit_360" : args[1] ?? "audit_360";
    const target = args[0] ?? "all";
    const ids = target === "all" ? (await store.listClients()).map((c) => c.id) : [target];
    // Different clients also run concurrently: separate workspaces, shared task engine.
    const results = await Promise.all(ids.map((id) => new Orchestrator(store, { ai: aiEngineFromEnv(store) }).runWorkflow(id, workflow)));
    for (const r of results) {
      console.log(`\n== ${r.clientId} run ${r.runId} (max concurrent tasks: ${r.maxObservedConcurrency}) ==`);
      for (const t of r.tasks) console.log(`${t.id}  ${t.agent.padEnd(14)} ${t.status.padEnd(18)} review=${t.reviewStatus.padEnd(18)} ${t.startedAt?.slice(11, 23)} → ${t.completedAt?.slice(11, 23)}  ${t.outputPath ?? ""}${t.error ? "  ERROR: " + t.error : ""}`);
      console.log("final report:", r.finalReport);
    }
    return;
  }
  if (cmd === "ai-status") { console.log(describeAi()); return; }
  if (cmd === "usage") {
    const u = summarizeUsage(await store.listUsage());
    const f = (b: { calls: number; costUsd: number }) => `${b.calls} calls, $${b.costUsd.toFixed(4)}`;
    console.log({ realToday: f(u.real.today), realMonth: f(u.real.month), simulatedMonth: f(u.simulated.month), inrPerUsd: u.inr });
    return;
  }
  if (cmd === "live-test") {
    const r = await runLiveTest(store, { clientId: args[0] ?? "pahadi-origin" });
    console.log(JSON.stringify({ ...r, qaIssues: r.qaIssues.slice(0, 5) }, null, 2));
    process.exit(r.verdict === "PASS" ? 0 : 2);
  }
  if (cmd === "export") { const out = args[0] ?? `hq-backup-${new Date().toISOString().slice(0, 10)}.json`; writeFileSync(out, JSON.stringify(await exportAll(store))); console.log("exported to", out, "(contains client data: keep it private)"); return; }
  if (cmd === "import") { console.log(await importAll(store, JSON.parse(readFileSync(args[0], "utf8")))); return; }
  if (cmd === "copy-files-to-db") { console.log("copied (nothing overwritten):", await importAll(store, await exportAll(fileStore()))); return; }
  if (cmd === "onboard") { const [id, ...name] = args; await onboardClient(store, { id, name: name.join(" ") }); console.log("onboarded", id); return; }
  if (cmd === "status") {
    const tasks = await store.listTasks();
    const by = (s: string) => tasks.filter((t) => t.status === s).length;
    console.log({ clients: (await store.listClients()).length, agents: AGENT_LIST.length, tasks: tasks.length, completed: by("COMPLETED"), waitingForInput: by("WAITING FOR INPUT"), underReview: by("UNDER REVIEW"), failed: by("FAILED"), workflows: Object.keys(WORKFLOWS) });
    return;
  }
  console.log("usage: npm run hq -- live-test [clientId] | ai-status | usage | export [file] | import <file> | copy-files-to-db | seed | audit [clientId|all] | run <clientId> <workflow> | onboard <id> <name> | status");
}
main().catch((e) => { console.error(e); process.exit(1); });
