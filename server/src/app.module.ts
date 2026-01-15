import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { FoodModule } from "./food/food.module";
import { OrdersModule } from "./orders/orders.module";
import { RiderModule } from "./rider/rider.module";
import { StoreModule } from './store/store.module';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    FoodModule,
    OrdersModule, 
    RiderModule,
    StoreModule
  ],
})
export class AppModule {}
