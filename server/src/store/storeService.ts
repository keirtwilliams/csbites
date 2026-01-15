import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  // Find a store by the Owner's User ID
  async findByOwner(ownerId: string) {
    return this.prisma.store.findUnique({
      where: { ownerId },
      include: { menu: true },
    });
  }

  // Create a new Store
  async createStore(data: { ownerId: string; name: string; address: string }) {
    return this.prisma.store.create({
      data: {
        ownerId: data.ownerId,
        name: data.name,
        address: data.address,
        isOpen: true,
      },
    });
  }

  // Add a food item to the store
  async addFoodItem(data: { storeId: string; name: string; price: number }) {
    return this.prisma.foodItem.create({
      data: {
        storeId: data.storeId,
        name: data.name,
        price: Number(data.price),
      },
    });
  }

  // 👇 ADD THIS NEW METHOD 👇
  // Get all open stores for the customer list
  async findAll() {
    return this.prisma.store.findMany({
      where: { isOpen: true }, // Optional: only show open stores
      include: { menu: true }, // Include menu so the customer can see food immediately
    });
  }
}