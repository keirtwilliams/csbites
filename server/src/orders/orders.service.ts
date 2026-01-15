import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OrderStatus } from "@prisma/client";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // ✅ CREATE ORDER (CUSTOMER)
  async createOrder(data: {
    customerId: string;
    storeId: string;
    pickup: string;
    dropoff: string;
    items: { foodId: string; quantity: number }[];
  }) {
    return this.prisma.order.create({
      data: {
        customerId: data.customerId,
        storeId: data.storeId,
        pickup: data.pickup,
        dropoff: data.dropoff,
        status: OrderStatus.PENDING,
        items: {
          create: data.items.map((item) => ({
            foodId: item.foodId,
            quantity: item.quantity,
          })),
        },
      },
    });
  }

  // ✅ GET ALL ORDERS (ADMIN)
  async getOrders() {
    return this.prisma.order.findMany({
      include: {
        items: { include: { food: true } },
        rider: true,
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ✅ ASSIGN RIDER (ADMIN)
  async assignRider(orderId: string, riderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException("Order already assigned or completed");
    }

    const rider = await this.prisma.rider.findUnique({
      where: { id: riderId },
    });

    if (!rider) {
      throw new BadRequestException("Rider does not exist");
    }

    if (!rider.isActive) {
      throw new BadRequestException("Rider is not active");
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        riderId,
        status: OrderStatus.ASSIGNED,
      },
    });
  }

  // 👇 NEW: GET ACTIVE RIDERS (For Admin Dropdown)
  async getActiveRiders() {
    return this.prisma.rider.findMany({
      where: { isActive: true }, // Only get riders who are working
      include: { user: true },   // Include user info (email) so Admin knows who they are
    });
  }
}