export const statuses = ["draft", "in_review", "changes_requested", "approved", "ready_to_publish"] as const;
export type ContentStatus = (typeof statuses)[number];

/**
 * Allowed moves. There is no "published" status on purpose: this app never posts anything itself yet.
 * "ready_to_publish" only means a human approved it and will post it manually.
 */
const transitions: Record<ContentStatus, ContentStatus[]> = {
  draft: ["in_review"],
  in_review: ["approved", "changes_requested"],
  changes_requested: ["in_review"],
  approved: ["ready_to_publish", "changes_requested"],
  ready_to_publish: ["approved"],
};

/** Moves that need a human decision. */
export const humanOnly: ContentStatus[] = ["approved", "ready_to_publish"];

export const labels: Record<ContentStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  changes_requested: "Changes requested",
  approved: "Approved",
  ready_to_publish: "Ready to post",
};

export function nextStatuses(from: ContentStatus): ContentStatus[] {
  return transitions[from];
}

export function canTransition(from: ContentStatus, to: ContentStatus): boolean {
  return transitions[from].includes(to);
}

export function transition(from: ContentStatus, to: ContentStatus): ContentStatus {
  if (!canTransition(from, to)) throw new Error(`Cannot move from "${labels[from]}" to "${labels[to]}"`);
  return to;
}
