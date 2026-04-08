import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorators";
import { Role } from "../enums/roles.enums";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext) {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        )
        if (!requiredRoles) return true
        const { user } = context.switchToHttp().getRequest()

        if (!user) throw new UnauthorizedException()

        return requiredRoles.includes(user.role)
    }
}
