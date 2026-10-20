export interface AnalyticsReportData {
  startDate: string;
  endDate: string;
  days: number;
  presetLabel: string;
  // Financials
  grossSales: number;
  discounts: number;
  netSales: number;
  totalExp: number;
  totalPay: number;
  netProfit: number;
  profitMargin: number;
  avgDailySales: number;
  avgDailyProfit: number;
  // Operations & Stock
  totalPrepared: number;
  totalSold: number;
  totalWaste: number; // Count of wasted items
  totalStockValue?: number; // Total Stock Value loaded for the period
  // Closing Cash Reserve for the latest date in range
  closingReserve: number;
  // Product breakdown
  products: {
    name: string;
    unitPrice: number;
    sold: number;
    wasted: number;
    revenue: number;
  }[];
  // Expense categories
  expenseCategories: {
    category: string;
    amount: number;
    percentShare: number;
  }[];
  // Payouts breakdown
  payouts: {
    recipientName: string;
    payoutType: string;
    amount: number;
  }[];
}

export function downloadAnalyticsReportImage(data: AnalyticsReportData) {
  const scale = 2; // High-res retina scale
  const width = 700;
  const xMargin = 24;
  const contentWidth = width - (xMargin * 2);
  const xRight = width - xMargin - 12;

  const productRowHeight = 24;
  const expenseRowHeight = 22;
  const payoutRowHeight = 22;

  // Dynamic height calculation
  const metricsBoxHeight = data.days > 1 ? 144 : 118;
  const prodTableHeight = 44 + Math.max(1, data.products.length) * productRowHeight + 26;
  const expTableHeight = 44 + Math.max(1, data.expenseCategories.length) * expenseRowHeight + 24;
  const payTableHeight = 44 + Math.max(1, data.payouts.length) * payoutRowHeight + 24;
  const profitCalcHeight = 88;

  const totalHeight = 110 + 100 + metricsBoxHeight + prodTableHeight + expTableHeight + payTableHeight + profitCalcHeight + 85;

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
  ctx.fillText('ALBATROSS FOOD CART', xMargin, 36);

  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText('Circuit House Field, Joypurhat • Business Analytics Report', xMargin, 56);

  // Date line
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#FFDD00';
  const dateStr = data.days === 1 
    ? `DATE: ${data.startDate}` 
    : `DATE RANGE: ${data.startDate} to ${data.endDate} (${data.days} Days)`;
  ctx.fillText(dateStr, xMargin, 82);

  let y = 115;

  // 1. SUMMARY (Renamed from EXECUTIVE SUMMARY)
  ctx.fillStyle = '#EA4300';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('SUMMARY', xMargin, y);

  y += 10;

  const cardSpacing = 6;
  const cardWidth = (contentWidth - (cardSpacing * 3)) / 4;
  const cardHeight = 68;

  const drawSummaryCard = (x: number, title: string, value: string, subtitle: string, bgColor: string, borderColor: string, valColor: string) => {
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, cardWidth, cardHeight, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.fillText(title, x + 8, y + 18);

    ctx.fillStyle = valColor;
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText(value, x + 8, y + 38);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '9px system-ui, -apple-system, sans-serif';
    ctx.fillText(subtitle, x + 8, y + 54);
  };

  drawSummaryCard(xMargin, 'NET SALES', `৳${data.netSales.toLocaleString()}`, `${data.totalSold} sold`, '#F8FAFC', '#E2E8F0', '#0F172A');
  drawSummaryCard(xMargin + cardWidth + cardSpacing, 'BAZAAR EXP', `৳${data.totalExp.toLocaleString()}`, 'Supplies', '#F8FAFC', '#E2E8F0', '#DC2626');
  drawSummaryCard(xMargin + (cardWidth + cardSpacing) * 2, 'PAYOUTS', `৳${data.totalPay.toLocaleString()}`, 'Staff & owner', '#F8FAFC', '#E2E8F0', '#DC2626');
  drawSummaryCard(xMargin + (cardWidth + cardSpacing) * 3, 'NET PROFIT', `৳${data.netProfit.toLocaleString()}`, `Margin: ${data.profitMargin}%`, '#FFF7ED', '#FDBA74', '#EA4300');

  y += cardHeight + 18;

  // 2. FINANCIAL & INVENTORY METRICS
  ctx.fillStyle = '#EA4300';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('FINANCIAL & INVENTORY METRICS', xMargin, y);

  y += 10;

  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(xMargin, y, contentWidth, metricsBoxHeight, 8);
  ctx.fill();
  ctx.stroke();

  // Draw 2-column key-value metrics with safe right alignment to prevent overflow
  const drawMetricPair = (
    label1: string, val1: string,
    label2: string, val2: string,
    rowY: number,
    val1Color = '#0F172A',
    val2Color = '#0F172A'
  ) => {
    // Column 1 (Left: label at xMargin+12, value right aligned at xMargin+280)
    ctx.fillStyle = '#64748B';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText(label1, xMargin + 12, rowY);

    ctx.textAlign = 'right';
    ctx.fillStyle = val1Color;
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(val1, xMargin + 280, rowY);
    ctx.textAlign = 'left';

    // Column 2 (Right: label at xMargin+320, value right aligned at xRight)
    if (label2) {
      ctx.fillStyle = '#64748B';
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.fillText(label2, xMargin + 320, rowY);

      ctx.textAlign = 'right';
      ctx.fillStyle = val2Color;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillText(val2, xRight, rowY);
      ctx.textAlign = 'left';
    }
  };

  let rowY = y + 20;
  // Row 1: Gross Sales & Discounts Given
  drawMetricPair('Gross Food Sales:', `৳${data.grossSales.toLocaleString()}`, 'Discounts Given:', `−৳${data.discounts.toLocaleString()}`, rowY, '#0F172A', '#D97706');

  // Row 2: Total Stock Value & Total Items Prepared
  rowY += 22;
  drawMetricPair('Total Stock Value:', `৳${(data.totalStockValue || 0).toLocaleString()}`, 'Total Items Prepared:', `${data.totalPrepared} pcs`, rowY, '#EA4300', '#0F172A');

  // Row 3: Items Sold & Items Wasted
  rowY += 22;
  drawMetricPair('Total Items Sold:', `${data.totalSold} pcs`, 'Total Items Wasted:', `${data.totalWaste} pcs`, rowY, '#059669', '#DC2626');

  // Row 4: Closing Cash Reserve (for last day)
  rowY += 22;
  const reserveLabel = data.days > 1 ? `Closing Cash Reserve (${data.endDate}):` : 'Cash Reserve:';
  drawMetricPair(reserveLabel, `৳${data.closingReserve.toLocaleString()}`, '', '', rowY, '#EA4300');

  // Row 5: Average Daily Sales & Profit (Kept ONLY for multi-day range)
  if (data.days > 1) {
    rowY += 22;
    drawMetricPair('Avg Daily Net Sales:', `৳${data.avgDailySales.toLocaleString()}/day`, 'Avg Daily Profit:', `৳${data.avgDailyProfit.toLocaleString()}/day`, rowY, '#0F172A', '#059669');
  }

  y += metricsBoxHeight + 18;

  // 3. PRODUCT BREAKDOWN
  ctx.fillStyle = '#EA4300';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('PRODUCT BREAKDOWN', xMargin, y);

  y += 10;

  // Table Header
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(xMargin, y, contentWidth, 22);

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
  ctx.fillText('ITEM', xMargin + 10, y + 15);
  ctx.textAlign = 'center';
  ctx.fillText('UNIT PRICE', 320, y + 15);
  ctx.fillText('SOLD', 410, y + 15);
  ctx.fillText('WASTE', 490, y + 15);
  ctx.textAlign = 'right';
  ctx.fillText('REVENUE (৳)', xRight, y + 15);
  ctx.textAlign = 'left';

  y += 22;

  let totalSoldUnits = 0;
  let totalWastedUnits = 0;
  let totalProdRevenue = 0;

  data.products.forEach((prod, index) => {
    ctx.fillStyle = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(xMargin, y, contentWidth, productRowHeight);

    ctx.fillStyle = '#0F172A';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText(prod.name.length > 34 ? prod.name.slice(0, 32) + '...' : prod.name, xMargin + 10, y + 16);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748B';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText(`৳${prod.unitPrice}`, 320, y + 16);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${prod.sold}`, 410, y + 16);

    ctx.fillStyle = prod.wasted > 0 ? '#DC2626' : '#94A3B8';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${prod.wasted}`, 490, y + 16);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(`৳${prod.revenue.toLocaleString()}`, xRight, y + 16);
    ctx.textAlign = 'left';

    totalSoldUnits += prod.sold;
    totalWastedUnits += prod.wasted;
    totalProdRevenue += prod.revenue;

    y += productRowHeight;
  });

  // PROD BREAK TOTAL ROW (= TOTAL)
  ctx.fillStyle = '#FEF2F2';
  ctx.fillRect(xMargin, y, contentWidth, 26);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('= TOTAL', xMargin + 10, y + 17);

  ctx.textAlign = 'center';
  ctx.fillText(`${totalSoldUnits} pcs`, 410, y + 17);
  ctx.fillStyle = totalWastedUnits > 0 ? '#DC2626' : '#0F172A';
  ctx.fillText(`${totalWastedUnits} pcs`, 490, y + 17);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#EA4300';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText(`৳${totalProdRevenue.toLocaleString()}`, xRight, y + 17);
  ctx.textAlign = 'left';

  y += 26;

  // Table border
  const prodFullHeight = 22 + data.products.length * productRowHeight + 26;
  ctx.strokeStyle = '#E2E8F0';
  ctx.strokeRect(xMargin, y - prodFullHeight, contentWidth, prodFullHeight);

  y += 18;

  // 4. EXPENSES (exp) BREAKDOWN
  ctx.fillStyle = '#EA4300';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('EXPENSES BREAKDOWN', xMargin, y);

  y += 10;

  // Table Header
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(xMargin, y, contentWidth, 22);

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
  ctx.fillText('EXPENSE CATEGORY', xMargin + 10, y + 15);
  ctx.textAlign = 'center';
  ctx.fillText('SHARE %', 420, y + 15);
  ctx.textAlign = 'right';
  ctx.fillText('AMOUNT (৳)', xRight, y + 15);
  ctx.textAlign = 'left';

  y += 22;

  let totalExpSum = 0;

  data.expenseCategories.forEach((cat, index) => {
    ctx.fillStyle = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(xMargin, y, contentWidth, expenseRowHeight);

    ctx.fillStyle = '#0F172A';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText(cat.category, xMargin + 10, y + 15);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748B';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${cat.percentShare}%`, 420, y + 15);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#DC2626';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(`৳${cat.amount.toLocaleString()}`, xRight, y + 15);
    ctx.textAlign = 'left';

    totalExpSum += cat.amount;
    y += expenseRowHeight;
  });

  // EXPENSES TOTAL ROW (= TOTAL)
  ctx.fillStyle = '#FEF2F2';
  ctx.fillRect(xMargin, y, contentWidth, 24);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('= TOTAL EXPENSES', xMargin + 10, y + 16);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748B';
  ctx.fillText('100%', 420, y + 16);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#DC2626';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText(`৳${totalExpSum.toLocaleString()}`, xRight, y + 16);
  ctx.textAlign = 'left';

  y += 24;

  const expFullHeight = 22 + data.expenseCategories.length * expenseRowHeight + 24;
  ctx.strokeStyle = '#E2E8F0';
  ctx.strokeRect(xMargin, y - expFullHeight, contentWidth, expFullHeight);

  y += 18;

  // 5. PAYOUTS BREAKDOWN
  ctx.fillStyle = '#EA4300';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('PAYOUTS BREAKDOWN', xMargin, y);

  y += 10;

  // Table Header
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(xMargin, y, contentWidth, 22);

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
  ctx.fillText('RECIPIENT / ROLE', xMargin + 10, y + 15);
  ctx.textAlign = 'center';
  ctx.fillText('PAYOUT TYPE', 420, y + 15);
  ctx.textAlign = 'right';
  ctx.fillText('AMOUNT (৳)', xRight, y + 15);
  ctx.textAlign = 'left';

  y += 22;

  let totalPaySum = 0;

  data.payouts.forEach((pay, index) => {
    ctx.fillStyle = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(xMargin, y, contentWidth, payoutRowHeight);

    ctx.fillStyle = '#0F172A';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText(pay.recipientName, xMargin + 10, y + 15);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748B';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText(pay.payoutType, 420, y + 15);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#DC2626';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(`৳${pay.amount.toLocaleString()}`, xRight, y + 15);
    ctx.textAlign = 'left';

    totalPaySum += pay.amount;
    y += payoutRowHeight;
  });

  // PAYOUTS TOTAL ROW (= TOTAL)
  ctx.fillStyle = '#FEF2F2';
  ctx.fillRect(xMargin, y, contentWidth, 24);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('= TOTAL PAYOUTS', xMargin + 10, y + 16);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#DC2626';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText(`৳${totalPaySum.toLocaleString()}`, xRight, y + 16);
  ctx.textAlign = 'left';

  y += 24;

  const payFullHeight = 22 + data.payouts.length * payoutRowHeight + 24;
  ctx.strokeStyle = '#E2E8F0';
  ctx.strokeRect(xMargin, y - payFullHeight, contentWidth, payFullHeight);

  y += 18;

  // 6. PROFIT CALCULATION (Net Rev - Bazaar - Payouts)
  ctx.fillStyle = '#EA4300';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('PROFIT CALCULATION', xMargin, y);

  y += 10;

  ctx.fillStyle = '#FFF7ED';
  ctx.strokeStyle = '#FDBA74';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(xMargin, y, contentWidth, 68, 8);
  ctx.fill();
  ctx.stroke();

  // Formula Line
  ctx.fillStyle = '#475569';
  ctx.font = '11px system-ui, -apple-system, sans-serif';
  ctx.fillText('FORMULA: Net Sales Revenue − Bazaar Expenses − Staff/Owner Payouts', xMargin + 12, y + 20);

  // Values Equation
  ctx.fillStyle = '#0F172A';
  ctx.font = '11px system-ui, -apple-system, sans-serif';
  const equation = `৳${data.netSales.toLocaleString()} (Sales) − ৳${data.totalExp.toLocaleString()} (Bazaar) − ৳${data.totalPay.toLocaleString()} (Payouts)`;
  ctx.fillText(equation, xMargin + 12, y + 38);

  // Result Line
  ctx.fillStyle = '#EA4300';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText(`= NET OPERATING PROFIT: ৳${data.netProfit.toLocaleString()} (Margin: ${data.profitMargin}%)`, xMargin + 12, y + 56);

  y += 68 + 24;

  // FOOTER
  ctx.fillStyle = '#94A3B8';
  ctx.font = '10px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Generated by Albatross Analytics Portal • Circuit House Field, Joypurhat • ${new Date().toLocaleString()}`, width / 2, y);

  // Trigger download
  const link = document.createElement('a');
  link.download = `albatross-analytics-${data.startDate}-to-${data.endDate}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
