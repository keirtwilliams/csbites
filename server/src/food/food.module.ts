import { Module } from "@nestjs/common";
import { FoodController } from "./food.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [FoodController],
})
export class FoodModule {}
