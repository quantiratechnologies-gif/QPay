import type { Transaction } from '../types';

export const receiptGenerator = {
  /**
   * Generates a high-resolution branded receipt image on canvas
   */
  async generateReceiptCanvas(txn: Transaction, recipientName: string, isAr: boolean = false): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 780;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');

    // Background
    ctx.fillStyle = '#080C14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Card border & container
    ctx.fillStyle = '#111726';
    ctx.roundRect(30, 30, 540, 720, 24);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(127, 232, 127, 0.4)';
    ctx.stroke();

    // Top Brand Header
    ctx.fillStyle = '#7FE87F';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QTPay | سريع Sarie', 300, 80);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(isAr ? 'إيصال تحويل مالي فوري معتمد' : 'Official Instant Payment Receipt', 300, 104);

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(60, 125);
    ctx.lineTo(540, 125);
    ctx.stroke();

    // Status Badge
    ctx.fillStyle = 'rgba(127, 232, 127, 0.14)';
    ctx.roundRect(200, 145, 200, 36, 18);
    ctx.fill();
    ctx.fillStyle = '#7FE87F';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillText(isAr ? '✓ اكتملت العملية بنجاح' : '✓ Payment Successful', 300, 168);

    // Amount
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 36px Inter, sans-serif';
    ctx.fillText(`SAR ${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 300, 230);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText(
      isAr ? `مدفوع إلى: ${recipientName}` : `Paid to: ${recipientName}`,
      300,
      260
    );

    // Key-Value rows background
    ctx.fillStyle = '#182236';
    ctx.roundRect(60, 290, 480, 320, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.stroke();

    const rows = [
      { label: isAr ? 'المستفيد' : 'Beneficiary / Payee', val: recipientName },
      { label: isAr ? 'رقم العملية' : 'Transaction ID', val: txn.id },
      { label: isAr ? 'المرجع البنكي (سريع)' : 'Sarie Reference (UTR)', val: txn.utr },
      { label: isAr ? 'التاريخ والوقت' : 'Date & Time', val: new Date(txn.timestamp).toLocaleString('en-GB') },
      { label: isAr ? 'طريقة الدفع' : 'Payment Method', val: 'Sarie Instant Transfer (mada)' },
      { label: isAr ? 'رسوم التحويل' : 'Transfer Fee', val: '0.00 SAR (Free)' },
    ];

    ctx.font = '13px Inter, sans-serif';
    let currentY = 330;
    rows.forEach((row, i) => {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText(row.label, 80, currentY);

      ctx.textAlign = 'right';
      ctx.fillStyle = i === 2 ? '#7FE87F' : '#FFFFFF';
      ctx.font = i === 1 || i === 2 ? 'bold 12px monospace' : 'bold 13px Inter, sans-serif';
      ctx.fillText(row.val, 520, currentY);

      if (i < rows.length - 1) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.beginPath();
        ctx.moveTo(80, currentY + 14);
        ctx.lineTo(520, currentY + 14);
        ctx.stroke();
      }

      currentY += 46;
    });

    // Regulatory Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6B7280';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Regulated by Saudi Central Bank (SAMA) • Sarie National Payment System', 300, 670);
    ctx.fillText(`Generated on ${new Date().toLocaleDateString('en-GB')} via QPay`, 300, 692);

    return canvas;
  },

  /**
   * Save / Download receipt as image
   */
  async downloadReceipt(txn: Transaction, recipientName: string, isAr: boolean = false): Promise<void> {
    const canvas = await this.generateReceiptCanvas(txn, recipientName, isAr);
    const dataUrl = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `QPay_Receipt_${txn.utr || txn.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Share receipt via Web Share API with image file
   */
  async shareReceipt(txn: Transaction, recipientName: string, isAr: boolean = false): Promise<boolean> {
    const canvas = await this.generateReceiptCanvas(txn, recipientName, isAr);

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }

        const file = new File([blob], `QPay_Receipt_${txn.utr || txn.id}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `QPay Receipt: SAR ${txn.amount}`,
              text: `Payment Receipt for SAR ${txn.amount} to ${recipientName}. Ref: ${txn.utr}`,
              files: [file],
            });
            resolve(true);
            return;
          } catch {
            // fallback if dismissed
          }
        }

        if (navigator.share) {
          try {
            await navigator.share({
              title: `QPay Receipt: SAR ${txn.amount}`,
              text: `Payment Receipt for SAR ${txn.amount} to ${recipientName}. Ref: ${txn.utr}\nhttps://qtpay.vercel.app`,
            });
            resolve(true);
            return;
          } catch {
            // fallback
          }
        }

        // Fallback: download
        await this.downloadReceipt(txn, recipientName, isAr);
        resolve(true);
      }, 'image/png');
    });
  },
};
