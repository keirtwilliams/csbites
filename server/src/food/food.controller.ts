import { Controller, Get, Patch, Delete, Param, Body } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("stores/items") // ✅ Matches frontend path: /stores/items
export class FoodController {
  constructor(private prisma: PrismaService) {}

  // 1. READ: Get all active food items
  @Get()
  getFood() {
    return this.prisma.foodItem.findMany({
      where: { isActive: true },
    });
  }

  // 2. UPDATE: Edit item (e.g., fixing "adobi" to "adobo")
  @Patch(":id")
  updateFood(@Param("id") id: string, @Body() data: { name?: string; price?: number }) {
    return this.prisma.foodItem.update({
      where: { id: id },
      data: {
        name: data.name,
        price: data.price ? Number(data.price) : undefined, // Ensure price is a number
      },
    });
  }

  // 3. DELETE: Remove item from the menu
  @Delete(":id")
  deleteFood(@Param("id") id: string) {
    return this.prisma.foodItem.delete({
      where: { id: id },
    });
  }
}