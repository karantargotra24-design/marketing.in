import { defaultStore, Orchestrator, seedWorkspaces, onboardClient, AGENT_LIST, WORKFLOWS } from "../src/hq";

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
    const results = await Promise.all(ids.map((id) => new Orchestrator(store).runWorkflow(id, workflow)));
    for (const r of results) {
      console.log(`\n== ${r.clientId} run ${r.runId} (max concurrent tasks: ${r.maxObservedConcurrency}) ==`);
      for (const t of r.tasks) console.log(`${t.id}  ${t.agent.padEnd(14)} ${t.status.padEnd(18)} review=${t.reviewStatus.padEnd(18)} ${t.startedAt?.slice(11, 23)} → ${t.completedAt?.slice(11, 23)}  ${t.outputPath ?? ""}${t.error ? "  ERROR: " + t.error : ""}`);
      console.log("final report:", r.finalReport);
    }
    return;
  }
  if (cmd === "onboard") { const [id, ...name] = args; await onboardClient(store, { id, name: name.join(" ") }); console.log("onboarded", id); return; }
  if (cmd === "status") {
    const tasks = await store.listTasks();
    const by = (s: string) => tasks.filter((t) => t.status === s).length;
    console.log({ clients: (await store.listClients()).length, agents: AGENT_LIST.length, tasks: tasks.length, completed: by("COMPLETED"), waitingForInput: by("WAITING FOR INPUT"), underReview: by("UNDER REVIEW"), failed: by("FAILED"), workflows: Object.keys(WORKFLOWS) });
    return;
  }
  console.log("usage: npm run hq -- seed | audit [clientId|all] | run <clientId> <workflow> | onboard <id> <name> | status");
}
main().catch((e) => { console.error(e); process.exit(1); });
