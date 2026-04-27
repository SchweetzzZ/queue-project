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
        const { user } = context.switchToHttp().getRequest()

        if (!user) throw new UnauthorizedException()

        // Bypass para SUPER_ADMIN
        if (user.role === Role.SUPER_ADMIN) return true

        if (!requiredRoles) return true

        const userRole = user.role
        const agentRole = user.agent?.role

        return requiredRoles.includes(userRole) || (agentRole && requiredRoles.includes(agentRole as any))
    }
}
