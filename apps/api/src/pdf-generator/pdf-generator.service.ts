import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from '../cases/entities/case.entity';
import { ActionLog } from '../cases/entities/action-log.entity';
import { addDays, formatDate } from '../common/utils/utils';
import puppeteer from 'puppeteer';
import { Customer } from '../customers/customer.entity';
import { Loan } from '../loan/loan.entity';

@Injectable()
export class PdfGeneratorService {
  constructor(
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
    @InjectRepository(ActionLog)
    private readonly actionLogRepository: Repository<ActionLog>,
  ) {}

  async generateNotice(caseId: number): Promise<Buffer> {
    const caseRecord = await this.caseRepository.findOne({
      where: { id: caseId },
      relations: { customer: true, loan: true },
    });

    // validate
    if (!caseRecord) throw new NotFoundException(`Case ${caseId} not found`);

    const actionLogs = await this.actionLogRepository.find({
      where: { caseId },
      order: { createdAt: 'DESC' },
      take: 3,
    });

    const payByDate = formatDate(addDays(new Date(), 3));
    const generatedAt = new Date().toISOString();

    // generate the html tempalate
    const html = this.buildHtmlTemplate(
      { ...caseRecord, actionLogs },
      payByDate,
      generatedAt,
    );

    // launch the pupeteer headless instance
    // generates PDF and returns it
    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private buildHtmlTemplate(
    caseRecord: Case & {
      customer: Customer;
      loan: Loan;
      actionLogs: ActionLog[];
    },
    payByDate: string,
    generatedAt: string,
  ): string {
    const { customer, loan, actionLogs } = caseRecord;
    const actionsHtml = actionLogs.length
      ? actionLogs
          .map(
            (a) => `
          <tr>
            <td>${new Date(a.createdAt).toLocaleDateString()}</td>
            <td>${a.type}</td>
            <td>${a.outcome}</td>
            <td>${a.notes ?? '-'}</td>
          </tr>`,
          )
          .join('')
      : '<tr><td colspan="4">No actions recorded</td></tr>';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Payment Reminder Notice</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #222; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #c0392b; padding-bottom: 16px; margin-bottom: 24px; }
    .logo { font-size: 22px; font-weight: 700; color: #c0392b; }
    .notice-title { font-size: 18px; font-weight: 700; text-align: right; color: #222; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #c0392b; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 0.5px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
    .field label { font-weight: 600; color: #555; font-size: 11px; text-transform: uppercase; }
    .field span { display: block; font-size: 13px; color: #222; margin-top: 2px; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-soft { background: #d4edda; color: #155724; }
    .badge-hard { background: #fff3cd; color: #856404; }
    .badge-legal { background: #f8d7da; color: #721c24; }
    .pay-notice { background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 14px 18px; margin: 20px 0; }
    .pay-notice strong { font-size: 15px; color: #856404; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f0f0f0; text-align: left; padding: 7px 10px; font-weight: 600; }
    td { padding: 6px 10px; border-bottom: 1px solid #eee; }
    .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px; font-size: 11px; color: #888; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">LCM Collections</div>
      <div style="font-size:11px;color:#888;margin-top:4px;">Loan Collection Manager</div>
    </div>
    <div>
      <div class="notice-title">PAYMENT REMINDER NOTICE</div>
      <div style="font-size:11px;color:#888;text-align:right;">Case #${caseRecord.id}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Customer Information</div>
    <div class="grid">
      <div class="field"><label>Full Name</label><span>${customer.name}</span></div>
      <div class="field"><label>Email</label><span>${customer.email}</span></div>
      <div class="field"><label>Country</label><span>${customer.country}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Loan Details</div>
    <div class="grid">
      <div class="field"><label>Loan ID</label><span>#${loan.id}</span></div>
      <div class="field"><label>Due Date</label><span>${formatDate(new Date(loan.dueDate))}</span></div>
      <div class="field"><label>Principal Amount</label><span>$${Number(loan.principal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
      <div class="field"><label>Outstanding Balance</label><span style="color:#c0392b;font-weight:700;">$${Number(loan.outstanding).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Case Status</div>
    <div class="grid">
      <div class="field"><label>Days Past Due (DPD)</label><span style="font-weight:700;color:#c0392b;">${caseRecord.dpd} days</span></div>
      <div class="field"><label>Stage</label><span><span class="badge badge-${caseRecord.stage.toLowerCase()}">${caseRecord.stage}</span></span></div>
      <div class="field"><label>Status</label><span>${caseRecord.status}</span></div>
      <div class="field"><label>Assigned Agent</label><span>${caseRecord.assignedTo ?? caseRecord.assignedGroup ?? 'Unassigned'}</span></div>
    </div>
  </div>

  <div class="pay-notice">
    <strong>Action Required: Please pay your outstanding balance of $${Number(loan.outstanding).toLocaleString('en-US', { minimumFractionDigits: 2 })} by ${payByDate}</strong>
    <p style="margin-top:6px;font-size:12px;">Failure to pay may result in further collection actions and legal proceedings.</p>
  </div>

  <div class="section">
    <div class="section-title">Recent Contact History (Last 3)</div>
    <table>
      <thead>
        <tr><th>Date</th><th>Type</th><th>Outcome</th><th>Notes</th></tr>
      </thead>
      <tbody>
        ${actionsHtml}
      </tbody>
    </table>
  </div>

  <div class="footer">
    Generated on ${generatedAt} &nbsp;|&nbsp; This is an automated payment reminder notice.
    &nbsp;|&nbsp; LCM Collections System
  </div>
</body>
</html>`;
  }
}
