import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  create(body: any) {
    return 'This action adds a new report';
  }
}
