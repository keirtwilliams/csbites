import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(data: any) {
    return this.prisma.order.create({
      data: {
        customerId: data.customerId,
        pickup: data.pickup,
        dropoff: data.dropoff,
        status: "PENDING",
      },
    });
  }

  async assignRider(orderId: string, riderId: string) {
  return this.prisma.order.update({
    where: { id: orderId },
    data: {
      riderId,
      status: "ASSIGNED",
    },
  });
}

  async getOrders() {
    return this.prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
