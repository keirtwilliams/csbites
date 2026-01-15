import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(email: string, password: string) {
    // 🛡️ 1. STATIC ADMIN LOGIN (Built-in)
    // Instant access for Admin
    if (email === "admin" && password === "admin123") {
      return {
        id: "static-admin-id",
        email: "admin",
        role: "ADMIN",
        riderId: null,
      };
    }

    // 👤 2. NORMAL USER LOGIN
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }

    // ✅ FIXED: Simple password check (No encryption)
    if (user.password !== password) { 
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

    // Admin creation blocked in DB (use static login above)
    if (role === Role.ADMIN) {
      throw new BadRequestException("Admin account cannot be created manually.");
    }

    const exists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      throw new BadRequestException("Email already exists");
    }

    // ✅ FIXED: Save password directly (No encryption)
    const user = await this.prisma.user.create({
      data: {
        email,
        password: password, 
        role: role, 
      },
    });

    let riderRecord = null;

    if (role === Role.RIDER && rider) {
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