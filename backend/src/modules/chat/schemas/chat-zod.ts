import { z } from "zod"

export const charCreateSchema = z.object({
    companyId: z.string().min(1, "Empresa inválida"),
    queueEntryId: z.string().min(1, "Entrada de fila inválida"),
    agentId: z.string().min(1, "Agente inválido"),
    customerId: z.string().min(1, "Cliente inválido"),
})
export const messageSendSchema = z.object({
    chatId: z.string().min(1, "Chat inválido"),
    companyId: z.string().optional(),
    senderType: z.enum(["AGENT", "CUSTOMER"]),
    senderId: z.string().min(1, "Remetente inválido"),
    content: z.string().min(1, "Conteúdo inválido"),
})
export const chatUpdateSchema = z.object({
    isActive: z.boolean().optional(),
})

export type ChatCreateDto = z.infer<typeof charCreateSchema>
export type ChatUpdateDto = z.infer<typeof chatUpdateSchema>

export type MessageSendDto = z.infer<typeof messageSendSchema>