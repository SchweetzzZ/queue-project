export const PERMISSIONS = {
    company: {
        CREATE: "company:create",
        UPDATE: "company:update",
        DELETE: "company:delete",
        READ: "company:read",
    },
} as const
type ExtractValues<T> = T[keyof T]

export type Permission =
    ExtractValues<ExtractValues<typeof PERMISSIONS>>