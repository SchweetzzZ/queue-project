import { z } from "zod"

export const agentSchema = z.object({
    userId: z.string(),
    companyId: z.string().optional(),
    role: z.enum(["ADMIN", "AGENT"]),
    status: z.enum(["ONLINE", "OFFLINE", "BUSY"]),
    isActive: z.boolean().default(true),
})
export const updateAgentSchema = z.object({
    role: z.enum(["ADMIN", "AGENT"]).optional(),
    status: z.enum(["ONLINE", "OFFLINE", "BUSY"]).optional(),
    isActive: z.boolean().default(true).optional(),
})
export type AgentDto = z.infer<typeof agentSchema>
export type UpdateAgentDto = z.infer<typeof updateAgentSchema>