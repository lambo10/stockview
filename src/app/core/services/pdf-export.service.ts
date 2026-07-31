import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Sale } from '../models/sale.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  /**
   * Generates a downloadable modern PDF invoice with shop header, QR code mock, tax, and itemized table.
   */
  generateSaleInvoice(sale: Sale): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Dark Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('STOCKVIEW POS', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Official Sales Invoice & Receipt', 14, 28);
    doc.text(`Invoice No: ${sale.sale_number}`, 140, 20);
    doc.text(`Date: ${new Date(sale.created_at || Date.now()).toLocaleDateString()}`, 140, 28);

    // Customer & Shop Info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Billed To:', 14, 52);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(sale.customer_name || 'Walk-in Customer', 14, 58);
    if (sale.customer_email) {
      doc.text(sale.customer_email, 14, 64);
    }
    doc.text(`Payment Method: ${sale.payment_method}`, 14, 70);

    doc.setFont('helvetica', 'bold');
    doc.text('Issued By:', 140, 52);
    doc.setFont('helvetica', 'normal');
    doc.text('StockView Retail Store', 140, 58);
    doc.text('100 Innovation Plaza, Suite 400', 140, 64);
    doc.text('support@stockview.io', 140, 70);

    // Table Data
    const tableData = (sale.items || []).map((item, idx) => [
      (idx + 1).toString(),
      item.product?.name || 'Item #' + (idx + 1),
      `$${item.unit_price.toFixed(2)}`,
      item.quantity.toString(),
      `$${item.total_price.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 78,
      head: [['#', 'Item Description', 'Unit Price', 'Qty', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [16, 185, 129], // emerald-500
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 90 },
        2: { cellWidth: 28, halign: 'right' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 30, halign: 'right' }
      }
    });

    // Summary Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 130, finalY);
    doc.text(`$${(sale.total_amount - sale.tax_amount + sale.discount_amount).toFixed(2)}`, 180, finalY, { align: 'right' });

    doc.text('Tax (8%):', 130, finalY + 6);
    doc.text(`$${sale.tax_amount.toFixed(2)}`, 180, finalY + 6, { align: 'right' });

    if (sale.discount_amount > 0) {
      doc.text('Discount:', 130, finalY + 12);
      doc.text(`-$${sale.discount_amount.toFixed(2)}`, 180, finalY + 12, { align: 'right' });
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Grand Total:', 130, finalY + 20);
    doc.setTextColor(16, 185, 129);
    doc.text(`$${sale.total_amount.toFixed(2)}`, 180, finalY + 20, { align: 'right' });

    // Footer note
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    doc.text('Thank you for shopping with StockView! Returns accepted within 14 days with receipt.', 105, 280, { align: 'center' });

    doc.save(`StockView_Invoice_${sale.sale_number}.pdf`);
  }

  /**
   * Export Inventory Report to PDF
   */
  exportInventoryReportPDF(products: Product[]): void {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('StockView - Inventory Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    const rows = products.map(p => [
      p.sku,
      p.name,
      p.category?.name || 'Unassigned',
      `$${p.purchase_price.toFixed(2)}`,
      `$${p.selling_price.toFixed(2)}`,
      p.current_stock.toString(),
      p.current_stock <= p.min_stock_alert ? 'LOW STOCK' : 'IN STOCK'
    ]);

    autoTable(doc, {
      startY: 34,
      head: [['SKU', 'Product Name', 'Category', 'Cost', 'Price', 'Stock', 'Status']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] }
    });

    doc.save(`StockView_Inventory_Report_${Date.now()}.pdf`);
  }

  /**
   * Export Sales or Products to Clean Excel Spreadsheet
   */
  exportToExcel(data: any[], filename: string): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'StockView Export');
    XLSX.writeFile(wb, `${filename}_${Date.now()}.xlsx`);
  }
}
