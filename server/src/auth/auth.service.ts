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

    const rider = await this.prisma.rider.findUnique({
      where: { userId: user.id },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      riderId: rider?.id ?? null,
    };
  }

  async register(body: {
    email: string;
    password: string;
    role: Role;
    rider?: { latitude?: number; longitude?: number } | null;
  }) {
    const { email, password, role, rider } = body;

    if (role === Role.ADMIN) {
      throw new BadRequestException("Admin account cannot be created");
    }

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
        role: Role.CUSTOMER,
      },
    });

    let riderRecord = null;

    if (rider) {
      riderRecord = await this.prisma.rider.create({
        data: {
          userId: user.id,
          latitude: rider.latitude ?? 0,
          longitude: rider.longitude ?? 0,
          isActive: true,
        },
      });
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      riderId: riderRecord?.id ?? null,
    };
  }
}
