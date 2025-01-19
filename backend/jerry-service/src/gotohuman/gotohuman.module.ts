import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GotohumanService } from './gotohuman.service';

@Module({
  imports: [HttpModule],
  providers: [GotohumanService],
  exports: [GotohumanService],
})
export class GotohumanModule {}
