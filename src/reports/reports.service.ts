import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto, UpdateReportDto } from './report.dto';
import { Report } from './report.entity';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private readonly reports: Repository<Report>) {}

  create(reporterId: string, dto: CreateReportDto) {
    return this.reports.save(this.reports.create({ ...dto, reporterId }));
  }

  list() {
    return this.reports.find({ order: { createdAt: 'DESC' }, take: 100 });
  }

  async update(id: string, moderatorId: string, dto: UpdateReportDto) {
    const report = await this.reports.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    report.status = dto.status;
    report.moderatorId = moderatorId;
    report.moderatorNote = dto.moderatorNote ?? null;
    return this.reports.save(report);
  }
}
