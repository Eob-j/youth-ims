import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statements = {
  ...defaultStatements,
  data: ["create", "view", "update", "delete", "list"],
} as const;

export const ac = createAccessControl(statements);

export const admin = ac.newRole({
  ...adminAc.statements,
  data: ["create", "view", "update", "delete", "list"],
});

export const data_entry = ac.newRole({
  data: ["create", "view", "update", "delete", "list"],
  user: [],
  session: [],
});

export const viewer = ac.newRole({
  data: ["view", "list"],
  user: [],
  session: [],
});
