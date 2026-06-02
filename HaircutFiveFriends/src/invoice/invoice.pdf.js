import PDFDocument from 'pdfkit';

export default function generateInvoicePDF({ invoice, sale, details }) {
   return new Promise((resolve) => {

      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const pageWidth = doc.page.width;

      /* =========================
         HEADER
      ========================== */

      doc.rect(0, 0, pageWidth, 120)
         .fill('#0f172a');

      doc.fillColor('#facc15')
         .fontSize(28)
         .text('HAIRCUT FIVE FRIENDS', 0, 40, { align: 'center' });

      doc.fillColor('white')
         .fontSize(12)
         .text('Premium Barbershop Experience', 0, 75, { align: 'center' });

      doc.moveDown(4);

      /* =========================
         INFO FACTURA
      ========================== */

      doc.fillColor('#0f172a')
         .fontSize(16)
         .text(`Invoice #${invoice.invoiceNumber}`, { align: 'center' });

      doc.moveDown();

      doc.fontSize(12)
         .fillColor('black')
         .text(`Date: ${new Date(sale.createdAt).toLocaleDateString()}`, {
            align: 'center'
         });

      doc.text(
         `Client: ${sale.clientId?.name || 'N/A'}`,
         { align: 'center' }
      );

      doc.moveDown(2);

      /* =========================
         TABLA HEADER
      ========================== */

      const tableTop = doc.y;

      doc.rect(50, tableTop, pageWidth - 100, 25)
         .fill('#1e293b');

      doc.fillColor('white')
         .fontSize(12);

      doc.text('Item', 60, tableTop + 7);
      doc.text('Qty', pageWidth / 2 - 20, tableTop + 7);
      doc.text('Price', pageWidth - 140, tableTop + 7);

      let positionY = tableTop + 35;

      /* =========================
         ITEMS
      ========================== */

      details.forEach((detail, index) => {

         // name could come from product or service depending on type
         const productName = detail.productId?.name || detail.productId?.serviceName || 'Unknown';

         const price = Number(detail.productId?.price || 0).toFixed(2);

         if (index % 2 === 0) {
            doc.rect(50, positionY - 5, pageWidth - 100, 25)
               .fill('#f3f4f6');
         }

         doc.fillColor('black')
            .text(productName, 60, positionY);

         doc.text(detail.quantity.toString(), pageWidth / 2 - 15, positionY);

         doc.text(`$${price}`, pageWidth - 140, positionY);

         positionY += 25;
      });

      /* =========================
         TOTAL BOX
      ========================== */

      const totalBoxY = positionY + 20;

      doc.rect(50, totalBoxY, pageWidth - 100, 60)
         .fill('#0f172a');

      doc.fillColor('#facc15')
         .fontSize(14)
         .text(`Subtotal: $${invoice.subtotal}`, 0, totalBoxY + 10, {
            align: 'center'
         });

      doc.text(`Tax: $${invoice.tax}`, { align: 'center' });

      doc.fontSize(22)
         .text(`TOTAL: $${invoice.total}`, { align: 'center' });

      /* =========================
         FOOTER
      ========================== */

      doc.fillColor('gray')
         .fontSize(10)
         .text(
            'Thank you for choosing Haircut Five Friends 💈',
            0,
            doc.page.height - 50,
            { align: 'center' }
         );

      doc.end();
   });
}