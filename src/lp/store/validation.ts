import type { Group, User, PermissionNode } from "./store";

export type Issue = {
  level: "error" | "warning" | "info";
  scope: "group" | "user" | "perm" | "global";
  ownerId?: string;
  permId?: string;
  message: string;
};

const NODE_RE = /^-?[a-z0-9_]+(\.[a-z0-9_*]+)*$/i;

export function validateAll(groups: Group[], users: User[]): Issue[] {
  const issues: Issue[] = [];

  // circular inheritance
  for (const g of groups) {
    const visit = (id: string, chain: string[]): boolean => {
      if (chain.includes(id)) return true;
      const cur = groups.find((x) => x.id === id);
      if (!cur) return false;
      return cur.parents.some((p) => visit(p, [...chain, id]));
    };
    if (g.parents.some((p) => visit(p, [g.id]))) {
      issues.push({
        level: "error",
        scope: "group",
        ownerId: g.id,
        message: `Circular inheritance involving "${g.name}"`,
      });
    }
  }

  const checkPerms = (
    perms: PermissionNode[],
    scope: "group" | "user",
    ownerId: string,
    ownerName: string,
  ) => {
    const seen = new Set<string>();
    const wildcards = perms.filter((p) => p.node.endsWith(".*")).map((p) => p.node.slice(0, -2));
    for (const p of perms) {
      if (!NODE_RE.test(p.node) && p.node !== "*") {
        issues.push({
          level: "error",
          scope: "perm",
          ownerId,
          permId: p.id,
          message: `Invalid node format: "${p.node}"`,
        });
      }
      const key =
        (p.node.startsWith("-") ? p.node.slice(1) : p.node) + JSON.stringify(p.contexts || {});
      if (seen.has(key)) {
        issues.push({
          level: "warning",
          scope: "perm",
          ownerId,
          permId: p.id,
          message: `Duplicate node in ${ownerName}: "${p.node}"`,
        });
      }
      seen.add(key);
      // redundant wildcard
      if (!p.node.endsWith(".*") && !p.node.startsWith("-")) {
        const base = p.node;
        for (const wc of wildcards) {
          if (base.startsWith(wc + ".") || base === wc) {
            issues.push({
              level: "info",
              scope: "perm",
              ownerId,
              permId: p.id,
              message: `Redundant — covered by "${wc}.*"`,
            });
            break;
          }
        }
      }
    }
    // conflict allow vs deny
    const positives = new Set(
      perms.filter((p) => !p.node.startsWith("-") && p.value).map((p) => p.node),
    );
    for (const p of perms) {
      if (p.node.startsWith("-") && positives.has(p.node.slice(1))) {
        issues.push({
          level: "warning",
          scope: "perm",
          ownerId,
          permId: p.id,
          message: `Conflict — both allow and deny for "${p.node.slice(1)}"`,
        });
      }
    }
  };

  for (const g of groups) checkPerms(g.permissions, "group", g.id, g.name);
  for (const u of users) checkPerms(u.permissions, "user", u.id, u.username);

  return issues;
}
