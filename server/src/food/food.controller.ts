import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("food")
export class FoodController {
  constructor(private prisma: PrismaService) {}

  @Get()
  getFood() {
    return this.prisma.foodItem.findMany({
      where: { isActive: true },
    });
  }
}
