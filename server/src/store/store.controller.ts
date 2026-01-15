import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { StoreService } from './storeService';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // 👇 FIX 1: Add this endpoint for Customers
  // GET http://localhost:3000/store
  @Get()
  async getAllStores() {
    return this.storeService.findAll();
  }

  // 👇 FIX 2: Handle "Not Found" correctly for Owners
  // GET http://localhost:3000/store/user-123
  @Get(':ownerId')
  async getStore(@Param('ownerId') ownerId: string) {
    const store = await this.storeService.findByOwner(ownerId);
    
    // CRITICAL FIX: If no store exists, throw a real 404 error
    // so the frontend knows to show the "Setup Store" form.
    if (!store) {
      throw new NotFoundException('Store not found'); 
    }
    
    return store;
  }

  // POST http://localhost:3000/store
  @Post()
  async createStore(@Body() body: { ownerId: string; name: string; address: string }) {
    return this.storeService.createStore(body);
  }

  // POST http://localhost:3000/store/item
  @Post('item')
  async addItem(@Body() body: { storeId: string; name: string; price: number }) {
    return this.storeService.addFoodItem(body);
  }
}