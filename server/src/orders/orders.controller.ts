import { Controller, Post, Get, Patch, Param, Body } from "@nestjs/common";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() body: any) {
    return this.ordersService.createOrder(body);
  }

  @Get()
  getOrders() {
    return this.ordersService.getOrders();
  }

  @Patch(":id/assign")
  assignRider(
    @Param("id") orderId: string,
    @Body("riderId") riderId: string
  ) {
    return this.ordersService.assignRider(orderId, riderId);
  }
}
