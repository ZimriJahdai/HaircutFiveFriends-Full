import PDFDocument from 'pdfkit';

export default function generateStatisticsPDF(data) {
    return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const pageWidth = doc.page.width;

        /* =========================
           HEADER PREMIUM
        ========================== */

        doc.rect(0, 0, pageWidth, 110)
           .fill('#111827'); // oscuro elegante

        doc.fillColor('#fbbf24')
           .fontSize(26)
           .text('HAIRCUT FIVE FRIENDS', 0, 35, { align: 'center' });

        doc.fillColor('white')
           .fontSize(14)
           .text('Business Statistics Report', 0, 70, { align: 'center' });

        doc.moveDown(4);

        doc.fillColor('black')
           .fontSize(12)
           .text(`Generated: ${new Date().toLocaleDateString()}`, {
               align: 'center'
           });

        doc.moveDown(3);

        /* =========================
           CARDS PRINCIPALES
        ========================== */

        const cardWidth = pageWidth - 100;
        let y = doc.y;

        const cards = [
            { title: 'Total Sales', value: data.totalSales ?? 0 },
            { title: 'Total Revenue', value: `$${data.totalRevenue ?? 0}` }
        ];

        cards.forEach(card => {

            doc.rect(50, y, cardWidth, 60)
               .fill('#f3f4f6');

            doc.fillColor('#111827')
               .fontSize(14)
               .text(card.title, 70, y + 15);

            doc.fontSize(22)
               .fillColor('#2563eb')
               .text(String(card.value), 70, y + 30);

            y += 80;
        });

        doc.moveDown(2);

        /* =========================
           TOP SERVICE
        ========================== */

        doc.rect(50, y, cardWidth, 50)
           .fill('#e0f2fe');

        doc.fillColor('#1e3a8a')
           .fontSize(14)
           .text('Most Popular Service', 70, y + 10);

        doc.fontSize(18)
           .fillColor('black')
           .text(data.topService ?? 'N/A', 70, y + 25);

        y += 70;

        /* =========================
           TOP PRODUCT
        ========================== */

        doc.rect(50, y, cardWidth, 50)
           .fill('#fef3c7');

        doc.fillColor('#92400e')
           .fontSize(14)
           .text('Best Selling Product', 70, y + 10);

        doc.fontSize(18)
           .fillColor('black')
           .text(data.topProduct ?? 'N/A', 70, y + 25);

        /* =========================
           FOOTER
        ========================== */

        doc.fillColor('gray')
           .fontSize(10)
           .text(
               'Confidential Business Report • Haircut Five Friends',
               0,
               doc.page.height - 50,
               { align: 'center' }
           );

        doc.end();
    });
}