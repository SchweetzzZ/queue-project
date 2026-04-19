export const PERMISSIONS = {
    company: {
        CREATE: "company:create",
        UPDATE: "company:update",
        DELETE: "company:delete",
        READ: "company:read",
    },
    agent: {
        CREATE: "agent:create",
        UPDATE: "agent:update",
        DELETE: "agent:delete",
        READ: "agent:read",
    },
    customer: {
        CREATE: "customer:create",
        UPDATE: "customer:update",
        DELETE: "customer:delete",
        READ: "customer:read",
    },
    queue: {
        CREATE: "queue:create",
        UPDATE: "queue:update",
        DELETE: "queue:delete",
        READ: "queue:read",
    },
    queueEntry: {
        CREATE: "queueEntry:create",
        UPDATE: "queueEntry:update",
        DELETE: "queueEntry:delete",
        READ: "queueEntry:read",
    },
    companySetting: {
        UPDATE: "companySetting:update",
        READ: "companySetting:read",
    }
} as const
export type Permission = {
    [K in keyof typeof PERMISSIONS]: typeof PERMISSIONS[K][keyof typeof PERMISSIONS[K]]
}[keyof typeof PERMISSIONS]