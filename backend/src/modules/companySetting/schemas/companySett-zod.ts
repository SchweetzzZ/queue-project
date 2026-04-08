import { z } from "zod"

export const updateCompanySettingSchema = z.object({
    customerLabel: z.string().optional(),
    agentLabel: z.string().optional(),
    queueLabel: z.string().optional(),
})

export type UpdateCompanySettingDto = z.infer<typeof updateCompanySettingSchema>