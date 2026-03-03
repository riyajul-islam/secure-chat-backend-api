import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PopupsService } from './popups.service';
import { PopupsController } from './popups.controller';
import { Popup } from './entities/popup.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Popup])],
  controllers: [PopupsController],
  providers: [PopupsService],
  exports: [PopupsService],
})
export class PopupsModule {}