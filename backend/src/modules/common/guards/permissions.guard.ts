import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/permissons.decorators"
import { Permission } from "../enums/permissions.enums";
import { Role } from "../enums/roles.enums";

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext) {
        const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()]
        )
        const { user } = context.switchToHttp().getRequest()

        if (!user) throw new UnauthorizedException("User not found")

        // Bypass para SUPER_ADMIN
        if (user.role === Role.SUPER_ADMIN) return true

        if (!requiredPermissions) return true

        if (!user.permissions) return false

        return requiredPermissions.every(permission =>
            user.permissions.includes(permission))
    }
}