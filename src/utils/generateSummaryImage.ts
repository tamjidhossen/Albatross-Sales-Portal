import { DailySession, DailyInventoryItem, DailyExpense, DailyPayout } from '../types';

export function downloadDailySummaryImage(
  session: DailySession,
  items: DailyInventoryItem[],
  expenses: DailyExpense[],
  payouts: DailyPayout[]
) {
  const scale = 2; // High-res retina scale
  const width = 640;
  
  // Calculate dynamic height based on product count
  const itemRowHeight = 28;
  const itemsSectionHeight = Math.max(100, items.length * itemRowHeight + 50);
  const totalHeight = 710 + itemsSectionHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = totalHeight * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, totalHeight);

  // Top Orange Header Banner
  ctx.fillStyle = '#EA4300';
  ctx.fillRect(0, 0, width, 100);

  // Brand Name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('ALBATROSS FOOD CART', 24, 38);

  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText('Circuit House Field, Joypurhat • Daily Operations Summary', 24, 58);

  // Session Date & Lock badge
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#FFDD00';
  ctx.fillText(`DATE: ${session.sessionDate}`, 24, 82);

  const statusText = session.isLocked ? 'STATUS: CLOSED & VERIFIED' : 'STATUS: SHIFT OPEN';
  ctx.fillStyle = session.isLocked ? '#D1FAE5' : '#FEF3C7';
  ctx.fillText(statusText, width - 230, 82);

  // Divider line
  let y = 120;

  // CASH RECONCILIATION CARD
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(20, y, width - 40, 268, 12);
  ctx.fill();
  ctx.stroke();

  // Cash Section Header
  ctx.fillStyle = '#EA4300';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('CASH & SETTLEMENT BREAKDOWN', 36, y + 26);

  const khuchra = session.khuchraTakenFromReserve || session.openingCash || 0;
  const drawRow = (label: string, value: string, rowY: number, color = '#1E293B', isBold = false) => {
    ctx.fillStyle = color;
    ctx.font = `${isBold ? 'bold' : 'normal'} 13px system-ui, -apple-system, sans-serif`;
    ctx.fillText(label, 36, rowY);
    ctx.textAlign = 'right';
    ctx.fillText(value, width - 36, rowY);
    ctx.textAlign = 'left';
  };

  drawRow('Khuchra Cash (Cart Opening):', `৳${khuchra.toLocaleString()}`, y + 54, '#64748B');
  drawRow('Net Food Sales Revenue:', `+৳${session.netEstimatedRevenue.toLocaleString()}`, y + 78, '#059669', true);
  drawRow('Bazaar Expenses Paid from Drawer:', `−৳${session.totalExpenses.toLocaleString()}`, y + 102, '#DC2626');
  drawRow('Staff Payouts & Daily Takes:', `−৳${session.totalPayouts.toLocaleString()}`, y + 126, '#DC2626');

  // Drawer divider line
  ctx.strokeStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.moveTo(36, y + 142);
  ctx.lineTo(width - 36, y + 142);
  ctx.stroke();

  drawRow('Expected Closing Drawer Cash:', `৳${session.expectedClosingCash.toLocaleString()}`, y + 164, '#0F172A', true);
  
  const diff = session.cashDifference;
  const diffLabel = diff === 0 ? 'Exact Match (৳0)' : diff < 0 ? `Shortage: −৳${Math.abs(diff)}` : `Surplus: +৳${diff}`;
  const diffColor = diff === 0 ? '#059669' : diff < 0 ? '#DC2626' : '#D97706';
  drawRow('Actual Counted Drawer Cash:', `৳${session.actualCashCounted.toLocaleString()} (${diffLabel})`, y + 188, diffColor, true);

  drawRow('Khuchra Cash Returned:', `৳${khuchra.toLocaleString()}`, y + 214, '#64748B');
  drawRow('Saved Business Cash Reserve:', `৳${session.closingSavedCash.toLocaleString()}`, y + 242, '#EA4300', true);

  y += 295;

  // PRODUCT INVENTORY SUMMARY TABLE
  ctx.fillStyle = '#EA4300';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('PRODUCT SALES & INVENTORY', 24, y);

  y += 15;

  // Table header background
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(20, y, width - 40, 26);

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('ITEM', 32, y + 17);
  ctx.textAlign = 'center';
  ctx.fillText('AVAIL', 310, y + 17);
  ctx.fillText('SOLD', 380, y + 17);
  ctx.fillText('WASTE', 450, y + 17);
  ctx.textAlign = 'right';
  ctx.fillText('SALES (৳)', width - 32, y + 17);
  ctx.textAlign = 'left';

  y += 26;

  // Table rows
  items.forEach((item, index) => {
    ctx.fillStyle = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(20, y, width - 40, itemRowHeight);

    ctx.fillStyle = '#0F172A';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText(item.productName.length > 28 ? item.productName.slice(0, 26) + '...' : item.productName, 32, y + 18);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748B';
    ctx.fillText(`${item.totalAvailable}`, 310, y + 18);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${item.quantitySold}`, 380, y + 18);

    ctx.fillStyle = item.closingWasted > 0 ? '#DC2626' : '#94A3B8';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${item.closingWasted}`, 450, y + 18);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(`৳${item.estimatedRevenue.toLocaleString()}`, width - 32, y + 18);
    ctx.textAlign = 'left';

    y += itemRowHeight;
  });

  // Table border
  ctx.strokeStyle = '#E2E8F0';
  ctx.strokeRect(20, y - items.length * itemRowHeight - 26, width - 40, items.length * itemRowHeight + 26);

  y += 24;

  // SUMMARY TOTALS ROW
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.roundRect(20, y, width - 40, 50, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#334155';
  ctx.font = '11px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Total Items Prepared: ${session.totalProductsPrepared} pcs`, 36, y + 22);
  ctx.fillText(`Total Items Sold: ${session.totalProductsSold} pcs`, 36, y + 38);

  ctx.textAlign = 'right';
  ctx.fillText(`Gross Food Sales: ৳${session.grossEstimatedRevenue.toLocaleString()}`, width - 36, y + 22);
  ctx.fillText(`Discounts Given: −৳${session.estimatedDiscounts.toLocaleString()}`, width - 36, y + 38);
  ctx.textAlign = 'left';

  y += 75;

  // FOOTER
  ctx.fillStyle = '#94A3B8';
  ctx.font = '10px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Generated by Albatross Food Cart Portal • ${new Date().toLocaleString()}`, width / 2, y);

  // Trigger Download
  const link = document.createElement('a');
  link.download = `albatross-summary-${session.sessionDate}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

