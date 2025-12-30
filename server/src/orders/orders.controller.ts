import { Controller, Get, Post, Patch, Param, Body } from "@nestjs/common";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  constructor(private orders: OrdersService) {}

  // GET /orders
  @Get()
  getAll() {
    return this.orders.getOrders();
  }

  // POST /orders
  @Post()
  create(@Body() body: any) {
    return this.orders.createOrder(body);
  }

  // PATCH /orders/:id/assign
  @Patch(":id/assign")
  assign(
    @Param("id") orderId: string,
    @Body("riderId") riderId: string
  ) {
    return this.orders.assignRider(orderId, riderId);
  }
}
