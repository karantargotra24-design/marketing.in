#!/usr/bin/env python3
"""Checks agents/skills/commands frontmatter, section completeness, and settings JSON."""
import json, os, re, sys
R = os.path.join(os.path.dirname(__file__), "..", ".claude")
bad = []
def fm(p):
    t = open(p).read()
    m = re.match(r"---\n(.*?)\n---\n", t, re.S)
    if not m: bad.append(f"{p}: no frontmatter"); return {}
    return dict(l.split(": ", 1) for l in m.group(1).splitlines() if ": " in l), t
for f in os.listdir(f"{R}/agents"):
    d, t = fm(f"{R}/agents/{f}")
    if d.get("name") != f[:-3]: bad.append(f"agent {f}: name mismatch")
    if not d.get("description") or not d.get("tools"): bad.append(f"agent {f}: missing field")
for s in os.listdir(f"{R}/skills"):
    p = f"{R}/skills/{s}/SKILL.md"
    d, t = fm(p)
    if d.get("name") != s: bad.append(f"skill {s}: name mismatch")
    for sec in ["Purpose", "Required inputs", "Workflow", "Output template", "Quality checklist", "Example invocation"]:
        if f"**{sec}:**" not in t: bad.append(f"skill {s}: missing {sec}")
for f in os.listdir(f"{R}/commands"):
    d, t = fm(f"{R}/commands/{f}")
    if not d.get("description"): bad.append(f"command {f}: no description")
json.load(open(f"{R}/settings.json"))
print(f"agents={len(os.listdir(R+'/agents'))} skills={len(os.listdir(R+'/skills'))} commands={len(os.listdir(R+'/commands'))}")
print("FAIL" if bad else "PASS", *bad, sep="\n")
sys.exit(1 if bad else 0)
