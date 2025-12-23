import { Module } from "@nestjs/common";
import { OrdersModule } from "./orders/orders.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { FoodModule } from "./food/food.module";
@Module({
  imports: [
    PrismaModule,
    OrdersModule,
    AuthModule,
     FoodModule, 
  ],
})
export class AppModule {}
