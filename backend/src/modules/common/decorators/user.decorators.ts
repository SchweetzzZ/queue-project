import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { Permission } from "../enums/permissions.enums"
import { Role } from "../enums/roles.enums"

type CurrentUser = {
    id: string
    email: string
    role: Role
    permissions: Permission[]
}

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user as CurrentUser
})