const RISKY_CLAIMS = ["guaranteed", "100%", "risk-free", "no.1", "number one", "best price", "cure", "zero risk"];

/** Simple rule check on a draft's text. Returns plain-language flags for the human reviewer. */
export function checkDraftText(text: string, doNot: string[]): string[] {
  const t = text.toLowerCase();
  const flags: string[] = [];
  for (const rule of doNot) {
    if (rule && t.includes(rule.toLowerCase())) flags.push(`Contains "${rule}", which this client does not want said`);
  }
  for (const claim of RISKY_CLAIMS) {
    if (t.includes(claim)) flags.push(`Risky claim "${claim}": make sure it is true and provable`);
  }
  if (/\[confirm[^\]]*\]/i.test(text)) flags.push("Placeholder [CONFIRM ...] must be replaced with a real, confirmed detail");
  return flags;
}
