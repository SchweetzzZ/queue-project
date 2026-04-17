import { z } from "zod"

export const queueCreateSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
})

export const queueUpdateSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
})

export type QueueCreateDto = z.infer<typeof queueCreateSchema>
export type QueueUpdateDto = z.infer<typeof queueUpdateSchema>