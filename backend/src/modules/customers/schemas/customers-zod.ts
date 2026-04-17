import { z } from "zod"

export const customerCreateSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string()

})

export type CustomerCreateDto = z.infer<typeof customerCreateSchema>

export const updateCustomerSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string()

})

export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>