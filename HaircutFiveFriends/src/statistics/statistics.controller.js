'use strict'

import PDFDocument from 'pdfkit'
import Sale from '../sale/sale.model.js'
import Detail from '../detailSale/detail.model.js'
import Appointment from '../appointment/appointment.model.js'
import Client from '../client/client.model.js'
import generateClientStatisticsPDF from './clientStatistics.pdf.js'

export const generateStatisticsReport = async (req, res) => {
    try {

        const completedSales = await Sale.find({ status: 'COMPLETADO' })

        const totalSales = completedSales.length
        const totalRevenue = completedSales.reduce((acc, s) => acc + s.total, 0)

        const doc = new PDFDocument({ margin: 40 })

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=statistics_report.pdf'
        )

        doc.pipe(res)

        /* =========================
           HEADER CON FONDO
        ========================== */

        doc.rect(0, 0, doc.page.width, 90)
            .fill('#111827')

        doc
            .fillColor('#ffffff')
            .fontSize(24)
            .text('HAIRCUT FIVE FRIENDS', 0, 30, { align: 'center' })

        doc
            .fontSize(14)
            .text('REPORTE ESTADÍSTICO DE VENTAS', { align: 'center' })

        doc.moveDown(4)

        /* =========================
           CAJA RESUMEN
        ========================== */

        doc.fillColor('#000000')
        doc.roundedRect(40, 130, doc.page.width - 80, 80, 10)
            .fill('#f3f4f6')

        doc.fillColor('#000000')
            .fontSize(16)
            .text('Resumen General', 60, 145)

        doc.fontSize(12)
            .text(`Total ventas completadas: ${totalSales}`, 60, 170)

        doc.fillColor('#16a34a')
            .fontSize(12)
            .text(`Ingresos totales: Q${totalRevenue.toFixed(2)}`, 60, 190)

        doc.moveDown(5)

        /* =========================
           TABLA
        ========================== */

        let tableTop = 240

        doc.fillColor('#000000')
            .fontSize(16)
            .text('Detalle de Ventas', 40, tableTop)

        tableTop += 25

        // Encabezado tabla con fondo
        doc.rect(40, tableTop, doc.page.width - 80, 25)
            .fill('#2563eb')

        doc.fillColor('#ffffff')
            .fontSize(12)
            .text('ID', 60, tableTop + 7)
            .text('Fecha', 220, tableTop + 7)
            .text('Total (Q)', 400, tableTop + 7)

        tableTop += 30

        if (completedSales.length === 0) {
            doc.fillColor('#000000')
                .fontSize(12)
                .text('No hay ventas registradas.', 60, tableTop)
        } else {

            completedSales.forEach((sale, index) => {

                // Filas alternadas
                if (index % 2 === 0) {
                    doc.rect(40, tableTop - 5, doc.page.width - 80, 25)
                        .fill('#f9fafb')
                }

                doc.fillColor('#000000')
                    .fontSize(11)
                    .text(sale._id.toString().slice(-6), 60, tableTop)
                    .text(
                        sale.saleDate
                            ? sale.saleDate.toISOString().split('T')[0]
                            : 'Sin fecha',
                        220,
                        tableTop
                    )
                    .text(`Q${sale.total.toFixed(2)}`, 400, tableTop)

                tableTop += 25
            })
        }

        /* =========================
           FOOTER
        ========================== */

        doc.moveDown(2)
        doc.fontSize(10)
            .fillColor('#6b7280')
            .text(
                `Generado el ${new Date().toISOString().split('T')[0]}`,
                0,
                doc.page.height - 40,
                { align: 'center' }
            )

        doc.end()

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const generateClientStatisticsReport = async (req, res) => {
    try {
        const client = req.clientFromToken;
        if (!client) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }

        const completedSales = await Sale.find({ clientId: client._id, status: 'COMPLETADO' })
            .sort({ saleDate: -1 })
            .lean();

        const upcomingAppointments = await Appointment.find({
            clienteId: client._id,
            appointmentDate: { $gte: new Date() },
            status: { $ne: 'CANCELADO' }
        })
            .populate('barberId', 'name')
            .populate('serviceId', 'name')
            .sort({ appointmentDate: 1 })
            .limit(6)
            .lean();

        const totalSales = completedSales.length;
        const totalSpent = completedSales.reduce((acc, sale) => acc + (sale.total || 0), 0);

        const data = {
            clientName: client.name,
            points: client.points ?? 0,
            totalAppointments: await Appointment.countDocuments({ clienteId: client._id }),
            totalSales,
            totalSpent,
            upcomingAppointments,
            recentSales: completedSales.slice(0, 6).map((sale) => ({
                saleDate: sale.saleDate,
                total: sale.total,
                status: sale.status,
            })),
        };

        const pdfBuffer = await generateClientStatisticsPDF(data);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=client_statistics_report_${client._id.toString().slice(-6)}.pdf`);
        return res.status(200).send(pdfBuffer);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};