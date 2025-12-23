import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.password !== password) {
      throw new BadRequestException("Invalid credentials");
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async register(email: string, password: string, role: string) {
    const exists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      throw new BadRequestException("Email already exists");
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        password,
        role: role as Role, // 🔴 THIS FIXES THE 500 ERROR
      },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
