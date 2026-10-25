#!/usr/bin/env python3
"""Isolation test: plants a canary in each workspace, then fails if a canary appears outside its workspace
or if any agent/skill/command text references a specific client folder in a way that could mix data."""
import os, sys
ROOT = os.path.join(os.path.dirname(__file__), "..")
ws = {"personal-brand": "CANARY-PERSONAL", "clients/client-001-sa-visa-central": "CANARY-C001",
      "clients/client-002-jammu-motors": "CANARY-C002", "clients/client-000-TEST": "CANARY-C000"}
tmp = []
for w, c in ws.items():
    p = os.path.join(ROOT, w, "research", ".canary"); open(p, "w").write(c); tmp.append(p)
bad = []
try:
    for dp, _, fs in os.walk(ROOT):
        for f in fs:
            p = os.path.join(dp, f)
            if "/.git" in p or p.endswith("isolation.py"): continue
            t = open(p, errors="ignore").read()
            for w, c in ws.items():
                if c in t and not os.path.abspath(p).startswith(os.path.abspath(os.path.join(ROOT, w))):
                    bad.append(f"{c} leaked into {p}")
    # shared config must not hardcode client-specific content
    for dp, _, fs in os.walk(os.path.join(ROOT, ".claude")):
        for f in fs:
            t = open(os.path.join(dp, f)).read()
            for name in ["Jammu Motors", "SA Visa Central"]:
                if name in t: bad.append(f"client name {name} in shared config {f}")
finally:
    for p in tmp: os.remove(p)
print("FAIL" if bad else "PASS", *bad, sep="\n")
sys.exit(1 if bad else 0)
