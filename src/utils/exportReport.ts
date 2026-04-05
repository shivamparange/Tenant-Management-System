import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Property } from '../types';

export const exportRentReport = (properties: Property[]) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('Parange Estates - Rent & Occupancy Report', 14, 22);
  
  // Date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Aggregate Stats
  const totalOccupied = properties.filter(p => p.status === 'occupied').length;
  const totalRent = properties.filter(p => p.status === 'occupied').reduce((sum, p) => sum + p.rent, 0);
  
  doc.text(`Total Properties: ${properties.length}`, 14, 40);
  doc.text(`Occupied: ${totalOccupied}`, 14, 46);
  doc.text(`Total Monthly Rent: Rs. ${totalRent.toLocaleString()}`, 14, 52);

  // Table Data
  const tableData = properties.map(p => [
    p.name + (p.unitNumber ? ` #${p.unitNumber}` : ''),
    p.status.toUpperCase(),
    p.tenantName || 'N/A',
    p.status === 'occupied' ? `Rs. ${p.rent.toLocaleString()}` : '-',
    p.paymentStatus ? p.paymentStatus.toUpperCase() : '-',
    p.nextPaymentDate || '-'
  ]);

  autoTable(doc, {
    startY: 60,
    head: [['Property', 'Status', 'Tenant', 'Rent', 'Payment Status', 'Due Date']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [124, 58, 237] }, // Brand purple
    styles: { fontSize: 10, cellPadding: 4 },
  });

  doc.save('Parange_Estates_Report.pdf');
};
