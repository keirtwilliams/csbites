import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ✅ POST: Create Order (Customer)
  @Post()
  create(@Body() body: any) {
    return this.ordersService.createOrder(body);
  }

  // ✅ GET: List All Orders (Admin Dashboard)
  @Get()
  findAll() {
    return this.ordersService.getOrders();
  }

  // 👇 NEW: List Active Riders (For Admin Dropdown)
  // GET http://localhost:3000/orders/riders
  @Get('riders')
  findRiders() {
    return this.ordersService.getActiveRiders();
  }

  // 👇 NEW: Assign Rider (Admin Action)
  // PATCH http://localhost:3000/orders/123/assign
  @Patch(':id/assign')
  assignRider(@Param('id') id: string, @Body('riderId') riderId: string) {
    return this.ordersService.assignRider(id, riderId);
  }
}