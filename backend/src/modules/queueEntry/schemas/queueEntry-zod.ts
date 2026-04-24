import { z } from "zod"

export const QueueEntryCreateSchema = z.object({
    queueId: z.string(),
    name: z.string(),
    email: z.string().email("email invalido"),
    phone: z.string().min(8, "telefone invalido"),
    companyId: z.string().uuid().optional(),
})

export type QueueEntryCreateDto = z.infer<typeof QueueEntryCreateSchema>

export const QueueEntryUpdateSchema = z.object({
    status: z.enum(["WAITING", "MATCHED", "IN_PROGRESS", "COMPLETED", "CANCELED"]).optional(),
})

export type QueueEntryUpdateDto = z.infer<typeof QueueEntryUpdateSchema>