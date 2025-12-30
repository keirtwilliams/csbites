import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OrderStatus } from "@prisma/client";

@Injectable()
export class RiderService {
  constructor(private prisma: PrismaService) {}

  // ✅ Get all active riders
  async getActiveRiders() {
    return this.prisma.rider.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  // ✅ Get assigned orders for a rider
  async getAssignedOrders(riderId: string) {
    return this.prisma.order.findMany({
      where: {
        riderId,
        status: OrderStatus.ASSIGNED,
      },
      include: {
        items: {
          include: {
            food: true,
          },
        },
        customer: {
          select: {
            email: true,
          },
        },
      },
    });
  }

  // ✅ Complete an order
  async completeOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    if (order.status !== OrderStatus.ASSIGNED) {
      throw new BadRequestException("Order not assigned");
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.COMPLETED,
      },
    });
  }
}
