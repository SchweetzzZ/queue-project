import { z } from "zod"

export const QueueEntryCreateSchema = z.object({
    customerId: z.string(),
    queueId: z.string(),
    agentId: z.string().optional(),
    status: z.enum(["WAITING", "MATCHED", "IN_PROGRESS", "COMPLETED", "CANCELED"]),
})

export type QueueEntryCreateDto = z.infer<typeof QueueEntryCreateSchema>

export const QueueEntryUpdateSchema = z.object({
    status: z.enum(["WAITING", "MATCHED", "IN_PROGRESS", "COMPLETED", "CANCELED"]).optional(),
})

export type QueueEntryUpdateDto = z.infer<typeof QueueEntryUpdateSchema>