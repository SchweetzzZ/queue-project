import { z } from "zod"

export const companySchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    plan: z.enum(["FREE", "PRO"]),
    isActive: z.boolean().default(true),
})
export const updateCompanySchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long").optional(),
    plan: z.enum(["FREE", "PRO"]).optional(),
    isActive: z.boolean().default(true).optional(),
})
export type CompanyDto = z.infer<typeof companySchema>
export type UpdateCompanyDto = z.infer<typeof updateCompanySchema>


