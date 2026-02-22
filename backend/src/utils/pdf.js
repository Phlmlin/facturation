const PDFDocument = require('pdfkit');

/**
 * Génère un PDF professionnel pour un document (Devis ou Facture)
 */
const generateDocumentPDF = (doc, res) => {
    const pdf = new PDFDocument({ margin: 50 });

    // Stream le PDF directement vers la réponse Express
    pdf.pipe(res);

    // --- Header ---
    pdf.fontSize(20).text(doc.company_name || 'VOTRE ENTREPRISE', { align: 'left' });
    pdf.fontSize(10).text(doc.company_address || '', { align: 'left' });
    pdf.text(doc.company_phone || '', { align: 'left' });
    pdf.text(doc.company_email || '', { align: 'left' });

    pdf.moveDown();

    // --- Type de Document & Numéro ---
    const title = doc.type === 'proforma' ? 'FACTURE PROFORMA' :
        (doc.document_type === 'quote' ? 'DEVIS' : 'FACTURE');

    pdf.fontSize(16).text(title, { align: 'right' });
    pdf.fontSize(12).text(`N° ${doc.number}`, { align: 'right' });
    pdf.text(`Date: ${new Date(doc.issue_date).toLocaleDateString()}`, { align: 'right' });
    if (doc.expiry_date || doc.due_date) {
        const label = doc.expiry_date ? 'Expire le' : 'Echéance';
        const date = doc.expiry_date || doc.due_date;
        pdf.text(`${label}: ${new Date(date).toLocaleDateString()}`, { align: 'right' });
    }

    pdf.moveDown(2);

    // --- Client ---
    pdf.fontSize(12).text('Client:', { underline: true });
    pdf.text(doc.client_name || 'Client divers');
    pdf.text(doc.client_address || '');
    pdf.text(doc.client_phone || '');

    pdf.moveDown(2);

    // --- Table Header ---
    const tableTop = 330;
    pdf.fontSize(10).font('Helvetica-Bold');
    pdf.text('Description', 50, tableTop);
    pdf.text('Qté', 280, tableTop, { width: 50, align: 'right' });
    pdf.text('Prix Unitaire', 330, tableTop, { width: 100, align: 'right' });
    pdf.text('TVA %', 430, tableTop, { width: 50, align: 'right' });
    pdf.text('Total', 480, tableTop, { width: 70, align: 'right' });

    pdf.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // --- Table Items ---
    let currentY = tableTop + 25;
    pdf.font('Helvetica');
    doc.items.forEach(item => {
        pdf.text(item.description, 50, currentY);
        pdf.text(item.quantity.toString(), 280, currentY, { width: 50, align: 'right' });
        pdf.text(Number(item.unit_price).toLocaleString(), 330, currentY, { width: 100, align: 'right' });
        pdf.text(`${item.tax_rate}%`, 430, currentY, { width: 50, align: 'right' });
        pdf.text(Number(item.line_total).toLocaleString(), 480, currentY, { width: 70, align: 'right' });
        currentY += 20;
    });

    pdf.moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 15;

    // --- Totaux ---
    const totalLabelX = 350;
    const totalValueX = 480;

    pdf.text('Sous-total:', totalLabelX, currentY);
    pdf.text(Number(doc.subtotal).toLocaleString(), totalValueX, currentY, { align: 'right' });
    currentY += 20;

    pdf.text('TVA:', totalLabelX, currentY);
    pdf.text(Number(doc.tax_amount).toLocaleString(), totalValueX, currentY, { align: 'right' });
    currentY += 20;

    pdf.fontSize(14).font('Helvetica-Bold');
    pdf.text('TOTAL:', totalLabelX, currentY);
    pdf.text(`${Number(doc.total).toLocaleString()} ${doc.currency || 'XOF'}`, totalValueX, currentY, { align: 'right' });

    // --- Footer ---
    const footerY = 750;
    pdf.fontSize(8).font('Helvetica').text(
        `NIF: ${doc.company_nif || '-'} | RCCM: ${doc.company_rccm || '-'}`,
        50, footerY, { align: 'center', width: 500 }
    );

    pdf.end();
};

module.exports = { generateDocumentPDF };
