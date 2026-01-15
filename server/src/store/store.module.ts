import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './storeService';
import { PrismaModule } from '../prisma/prisma.module'; // Import your PrismaModule

@Module({
  imports: [PrismaModule], 
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}