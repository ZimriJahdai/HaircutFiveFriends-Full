import PDFDocument from 'pdfkit';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return date.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCurrency = (value) => {
  if (value == null || Number.isNaN(Number(value))) return 'Q0.00';
  return `Q${Number(value).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function generateClientStatisticsPDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const headline = `Reporte personal de ${data.clientName || 'Cliente'}`;

    doc
      .fillColor('#111827')
      .fontSize(24)
      .text('Haircut Five Friends', { align: 'center' });

    doc
      .moveDown(0.5)
      .fontSize(16)
      .fillColor('#C9A84C')
      .text(headline, { align: 'center' });

    doc
      .moveDown(0.5)
      .fontSize(10)
      .fillColor('#6B7280')
      .text(`Generado el ${new Date().toLocaleDateString('es-GT')}`, { align: 'center' });

    doc.moveDown(2);

    const summaryTop = doc.y;
    const summaryBoxWidth = (doc.page.width - 120) / 2;

    const renderSummaryCard = (label, value, top, left) => {
      doc.rect(left, top, summaryBoxWidth, 70)
        .fill('#F3F4F6');
      doc.fillColor('#111827')
        .fontSize(11)
        .text(label, left + 12, top + 12);
      doc.fontSize(20)
        .fillColor('#111827')
        .text(value, left + 12, top + 32);
    };

    renderSummaryCard('Puntos acumulados', `${data.points ?? 0} pts`, summaryTop, 50);
    renderSummaryCard('Citas totales', `${data.totalAppointments ?? 0}`, summaryTop, 60 + summaryBoxWidth);
    renderSummaryCard('Compras totales', `${data.totalSales ?? 0}`, summaryTop + 90, 50);
    renderSummaryCard('Gastado', formatCurrency(data.totalSpent ?? 0), summaryTop + 90, 60 + summaryBoxWidth);

    doc.moveDown(6);

    doc.fillColor('#111827')
      .fontSize(14)
      .text('Próximas citas', { underline: true });

    doc.moveDown(0.5);

    if (!data.upcomingAppointments?.length) {
      doc.fontSize(11).fillColor('#4B5563').text('No hay citas próximas registradas.');
    } else {
      data.upcomingAppointments.forEach((appt, index) => {
        const top = doc.y;
        doc.fontSize(11).fillColor('#111827').text(`${formatDate(appt.appointmentDate)} · ${appt.serviceId?.name ?? 'Servicio'}`, { continued: true });
        doc.fillColor('#6B7280').text(`  •  ${appt.barberId?.name ?? 'Barbero'}`);
        doc.fontSize(10).fillColor('#111827').text(`Estado: ${appt.status ?? '—'}`, { indent: 10 });
        if (index < data.upcomingAppointments.length - 1) doc.moveDown(0.8);
      });
    }

    doc.moveDown(1.5);

    doc.fillColor('#111827')
      .fontSize(14)
      .text('Compras recientes', { underline: true });

    doc.moveDown(0.5);

    if (!data.recentSales?.length) {
      doc.fontSize(11).fillColor('#4B5563').text('No hay compras recientes para mostrar.');
    } else {
      const tableTop = doc.y;
      const columnPositions = [50, 220, 380];

      doc.fontSize(10).fillColor('#111827').text('Fecha', columnPositions[0], tableTop);
      doc.text('Total', columnPositions[1], tableTop);
      doc.text('Estado', columnPositions[2], tableTop);
      doc.moveDown(0.7);

      data.recentSales.forEach((sale) => {
        const rowTop = doc.y;
        doc.fontSize(10).fillColor('#374151').text(formatDate(sale.saleDate), columnPositions[0], rowTop);
        doc.text(formatCurrency(sale.total), columnPositions[1], rowTop);
        doc.text(sale.status || '—', columnPositions[2], rowTop);
        doc.moveDown(0.6);
      });
    }

    doc.moveDown(2);
    doc.fontSize(10).fillColor('#6B7280').text('Reporte generado automáticamente por Haircut Five Friends.', { align: 'center' });

    doc.end();
  });
}
