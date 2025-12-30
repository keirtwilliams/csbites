import { Controller, Get, Post, Param, Body } from "@nestjs/common";
import { RiderService } from "./rider.service";

@Controller("riders")
export class RiderController {
  constructor(private rider: RiderService) {}

  // GET /riders/active
  @Get("active")
  getActiveRiders() {
    return this.rider.getActiveRiders();
  }

  // GET /riders/:id/orders
  @Get(":id/orders")
  getAssignedOrders(@Param("id") riderId: string) {
    return this.rider.getAssignedOrders(riderId);
  }

  // POST /riders/complete/:orderId
  @Post("complete/:orderId")
  completeOrder(@Param("orderId") orderId: string) {
    return this.rider.completeOrder(orderId);
  }
}
