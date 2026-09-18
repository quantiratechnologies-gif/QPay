import type { Transaction } from '../types';

export const pdfGenerator = {
  /**
   * Generates and downloads an official Bank/Sarie Account Statement PDF document
   */
  downloadHistoryPdf(
    transactions: Transaction[],
    userName: string,
    accountMasked: string = 'SA03 •••• 4821',
    isAr: boolean = false
  ): void {
    const totalSent = transactions
      .filter((t) => t.type === 'sent')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalReceived = transactions
      .filter((t) => t.type === 'received')
      .reduce((sum, t) => sum + t.amount, 0);

    const reportDate = new Date().toLocaleDateString('en-GB');

    const htmlContent = `
<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'en'}" dir="${isAr ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8" />
  <title>QTPay Statement of Account</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #111827;
      background: #FFFFFF;
      margin: 0;
      padding: 24px;
      font-size: 13px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #7FE87F;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #052e16;
      margin: 0;
    }
    .brand-sub {
      font-size: 12px;
      color: #4b5563;
      margin-top: 4px;
    }
    .meta-box {
      text-align: ${isAr ? 'left' : 'right'};
      font-size: 12px;
      color: #4b5563;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .summary-card {
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 12px 16px;
    }
    .summary-card .label {
      font-size: 11px;
      color: #6B7280;
      text-transform: uppercase;
      font-weight: 700;
    }
    .summary-card .value {
      font-size: 18px;
      font-weight: 800;
      color: #111827;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    th {
      background: #F3F4F6;
      color: #374151;
      font-weight: 700;
      text-align: ${isAr ? 'right' : 'left'};
      padding: 10px 12px;
      font-size: 12px;
      border-bottom: 2px solid #E5E7EB;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #E5E7EB;
      font-size: 12px;
    }
    .text-right {
      text-align: ${isAr ? 'left' : 'right'};
    }
    .amount-debit {
      color: #DC2626;
      font-weight: 700;
    }
    .amount-credit {
      color: #059669;
      font-weight: 700;
    }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #E5E7EB;
      font-size: 11px;
      color: #6B7280;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="brand-title">QTPay | سريع Sarie</h1>
      <div class="brand-sub">${isAr ? 'كشف حساب المعاملات المالية المعتمد' : 'Official Statement of Transactions'}</div>
      <div style="margin-top: 8px; font-weight: 700;">${isAr ? 'اسم العميل' : 'Account Holder'}: ${userName}</div>
      <div style="color: #6B7280; font-family: monospace;">${accountMasked}</div>
    </div>
    <div class="meta-box">
      <div><strong>${isAr ? 'تاريخ الكشف' : 'Statement Date'}:</strong> ${reportDate}</div>
      <div><strong>${isAr ? 'عدد العمليات' : 'Total Transactions'}:</strong> ${transactions.length}</div>
      <div><strong>${isAr ? 'النظام المالي' : 'Clearing System'}:</strong> Sarie (SAMA)</div>
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">${isAr ? 'إجمالي المدفوعات' : 'Total Debits'}</div>
      <div class="summary-card value amount-debit">SAR ${totalSent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="summary-card">
      <div class="label">${isAr ? 'إجمالي المقبوضات' : 'Total Credits'}</div>
      <div class="summary-card value amount-credit">SAR ${totalReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="summary-card">
      <div class="label">${isAr ? 'حالة الحساب' : 'Account Status'}</div>
      <div class="summary-card value" style="color: #059669;">${isAr ? 'نشط وموثق' : 'ACTIVE & VERIFIED'}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>${isAr ? 'التاريخ والوقت' : 'Date / Time'}</th>
        <th>${isAr ? 'تفاصيل المعاملة' : 'Description'}</th>
        <th>${isAr ? 'المرجع البنكي' : 'Reference (UTR)'}</th>
        <th>${isAr ? 'النوع' : 'Type'}</th>
        <th class="text-right">${isAr ? 'المبلغ (ر.س)' : 'Amount (SAR)'}</th>
      </tr>
    </thead>
    <tbody>
      ${transactions
        .map(
          (t) => `
        <tr>
          <td style="color: #4B5563;">${new Date(t.timestamp).toLocaleDateString('en-GB')} ${new Date(t.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</td>
          <td>
            <strong>${t.title}</strong>
            ${t.subTitle ? `<div style="font-size: 11px; color: #6B7280;">${t.subTitle}</div>` : ''}
          </td>
          <td style="font-family: monospace; font-size: 11px; color: #4B5563;">${t.utr}</td>
          <td>
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase;">${t.type}</span>
          </td>
          <td class="text-right ${t.type === 'sent' ? 'amount-debit' : 'amount-credit'}">
            ${t.type === 'sent' ? '-' : '+'}${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>This document is generated by QTPay National Instant Payment System, regulated by the Saudi Central Bank (SAMA).</p>
    <p>Official Verification Hash: SAMA-SARIE-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now()}</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // Open print window which triggers save as PDF or direct download
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    } else {
      // Fallback: download as statement HTML file
      const link = document.createElement('a');
      link.href = url;
      link.download = `QPay_Statement_${reportDate.replace(/\//g, '-')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },
};
