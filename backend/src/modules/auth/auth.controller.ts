import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from './schemas/auth-zod';
import type { RegisterDto, LoginDto } from './schemas/auth-zod';
import { ZodBody } from '../common/decorators/zod-decorator';
import express from 'express'

@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) { }
    @Post("register")
    async register(@ZodBody(registerSchema) data: RegisterDto) {
        return this.auth.register(data)
    }
    @Post("login")
    async login(@ZodBody(loginSchema) data: LoginDto,
        @Res({ passthrough: true }) res: express.Response) {
        const user = await this.auth.validateUser(data)
        const { access_token } = await this.auth.login(user)
        res.cookie("access_token", access_token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24,
        })
        return { message: "Login successful" }
    }
}
