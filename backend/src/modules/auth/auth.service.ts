import { Injectable } from '@nestjs/common';
import { PrismaService } from "../../prisma/prisma.service";
import { RegisterDto, LoginDto } from "./schemas/auth-zod"
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';
import { PERMISSIONS } from '../common/enums/permissions.enums';
import { Role } from '../common/enums/roles.enums';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) { }
    async validateUser(data: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: data.email,
            },
        })
        if (!user) {
            throw new Error("User not found")
        }
        const isValid = await bcrypt.compare(data.password, user.password)
        if (!isValid) {
            throw new Error("Invalid password")
        }
        return user
    }
    async register(data: RegisterDto) {
        const hashedPassword = await bcrypt.hash(data.password, 10)
        const user = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                phone: data.phone,
            },
        })
        return user
    }
    async login(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            permissions: this.getPermissionsByRole(user.role)
        }
        return {
            access_token: this.jwtService.sign(payload),
        }
    }
    private getPermissionsByRole(role: Role): string[] {
        if (role === Role.SUPER_ADMIN) {
            return Object.values(PERMISSIONS).flatMap(category => Object.values(category));
        }
        // Usuários comuns começam apenas com permissão de leitura global
        // As outras permissões serão injetadas pelo AgentGuard conforme o papel na empresa
        return [PERMISSIONS.company.READ]
    }
}
