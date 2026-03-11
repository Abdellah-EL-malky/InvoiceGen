package com.abdellah.invoicegen.service;

import com.abdellah.invoicegen.dto.InvoiceResponse;
import com.abdellah.invoicegen.entity.User;
import com.abdellah.invoicegen.repository.UserRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;

@Service
public class PdfService {

    @Autowired private UserRepository userRepository;

    private static final Color DARK_BG = new Color(15, 23, 42);
    private static final Color EMERALD = new Color(16, 185, 129);
    private static final Color LIGHT_TEXT = new Color(226, 232, 240);
    private static final Color MUTED = new Color(100, 116, 139);

    public byte[] generateInvoicePdf(InvoiceResponse invoice, String userEmail) throws Exception {
        User user = userRepository.findByEmail(userEmail).orElseThrow();

        Document document = new Document(PageSize.A4, 40, 40, 40, 40);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(document, out);

        document.open();

        // ── Header bar ──────────────────────────────────────────────────────
        PdfContentByte cb = writer.getDirectContent();
        cb.setColorFill(DARK_BG);
        cb.rectangle(0, PageSize.A4.getHeight() - 120, PageSize.A4.getWidth(), 120);
        cb.fill();

        // Emerald accent line
        cb.setColorFill(EMERALD);
        cb.rectangle(0, PageSize.A4.getHeight() - 122, PageSize.A4.getWidth(), 2);
        cb.fill();

        Font titleFont = new Font(Font.HELVETICA, 28, Font.BOLD, EMERALD);
        Font headerFont = new Font(Font.HELVETICA, 10, Font.NORMAL, LIGHT_TEXT);
        Font labelFont = new Font(Font.HELVETICA, 8, Font.BOLD, MUTED);
        Font normalFont = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(30, 41, 59));
        Font boldFont = new Font(Font.HELVETICA, 9, Font.BOLD, new Color(30, 41, 59));
        Font totalFont = new Font(Font.HELVETICA, 12, Font.BOLD, EMERALD);

        // Company name in header
        Paragraph company = new Paragraph(
            user.getBusinessName() != null ? user.getBusinessName() : user.getName(),
            titleFont
        );
        company.setSpacingBefore(15);
        document.add(company);

        // Invoice number in header
        Paragraph invNum = new Paragraph("INVOICE  " + invoice.getInvoiceNumber(), headerFont);
        invNum.setSpacingBefore(4);
        document.add(invNum);

        document.add(new Paragraph(" "));
        document.add(new Paragraph(" "));

        // ── Info section ────────────────────────────────────────────────────
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setSpacingBefore(10);

        // FROM block
        PdfPCell fromCell = new PdfPCell();
        fromCell.setBorder(Rectangle.NO_BORDER);
        fromCell.addElement(new Paragraph("FROM", labelFont));
        fromCell.addElement(new Paragraph(
            user.getBusinessName() != null ? user.getBusinessName() : user.getName(), boldFont));
        if (user.getBusinessAddress() != null)
            fromCell.addElement(new Paragraph(user.getBusinessAddress(), normalFont));
        if (user.getBusinessEmail() != null)
            fromCell.addElement(new Paragraph(user.getBusinessEmail(), normalFont));
        if (user.getBusinessPhone() != null)
            fromCell.addElement(new Paragraph(user.getBusinessPhone(), normalFont));
        infoTable.addCell(fromCell);

        // TO block
        PdfPCell toCell = new PdfPCell();
        toCell.setBorder(Rectangle.NO_BORDER);
        toCell.addElement(new Paragraph("TO", labelFont));
        toCell.addElement(new Paragraph(invoice.getClient().getName(), boldFont));
        if (invoice.getClient().getCompany() != null)
            toCell.addElement(new Paragraph(invoice.getClient().getCompany(), normalFont));
        if (invoice.getClient().getAddress() != null)
            toCell.addElement(new Paragraph(invoice.getClient().getAddress(), normalFont));
        if (invoice.getClient().getEmail() != null)
            toCell.addElement(new Paragraph(invoice.getClient().getEmail(), normalFont));
        infoTable.addCell(toCell);
        document.add(infoTable);

        // Dates row
        PdfPTable datesTable = new PdfPTable(3);
        datesTable.setWidthPercentage(100);
        datesTable.setSpacingBefore(20);

        addDateCell(datesTable, "ISSUE DATE",
            invoice.getIssueDate() != null ? invoice.getIssueDate().toString() : "—", labelFont, normalFont);
        addDateCell(datesTable, "DUE DATE",
            invoice.getDueDate() != null ? invoice.getDueDate().toString() : "—", labelFont, normalFont);
        addDateCell(datesTable, "STATUS", invoice.getStatus(), labelFont, boldFont);

        document.add(datesTable);

        // ── Items table ─────────────────────────────────────────────────────
        document.add(new Paragraph(" "));

        PdfPTable itemsTable = new PdfPTable(4);
        itemsTable.setWidthPercentage(100);
        itemsTable.setWidths(new float[]{5f, 1.5f, 2f, 2f});
        itemsTable.setSpacingBefore(10);

        // Table header
        for (String col : new String[]{"DESCRIPTION", "QTY", "UNIT PRICE", "TOTAL"}) {
            PdfPCell h = new PdfPCell(new Phrase(col, new Font(Font.HELVETICA, 8, Font.BOLD, Color.WHITE)));
            h.setBackgroundColor(DARK_BG);
            h.setPadding(8);
            h.setBorder(Rectangle.NO_BORDER);
            if (col.equals("QTY") || col.equals("UNIT PRICE") || col.equals("TOTAL"))
                h.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemsTable.addCell(h);
        }

        // Items rows
        boolean alt = false;
        if (invoice.getItems() != null) {
            for (var item : invoice.getItems()) {
                Color rowBg = alt ? new Color(241, 245, 249) : Color.WHITE;
                addItemCell(itemsTable, item.getDescription(), Element.ALIGN_LEFT, normalFont, rowBg);
                addItemCell(itemsTable, String.valueOf(item.getQuantity()), Element.ALIGN_RIGHT, normalFont, rowBg);
                addItemCell(itemsTable, formatAmount(item.getUnitPrice()), Element.ALIGN_RIGHT, normalFont, rowBg);
                addItemCell(itemsTable, formatAmount(item.getTotal()), Element.ALIGN_RIGHT, boldFont, rowBg);
                alt = !alt;
            }
        }
        document.add(itemsTable);

        // ── Totals ──────────────────────────────────────────────────────────
        PdfPTable totalsTable = new PdfPTable(2);
        totalsTable.setWidthPercentage(40);
        totalsTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalsTable.setSpacingBefore(15);

        addTotalRow(totalsTable, "Subtotal", formatAmount(invoice.getSubtotal()), normalFont, boldFont, false);
        addTotalRow(totalsTable, "Tax (" + (invoice.getTaxRate() != null ? invoice.getTaxRate() : 0) + "%)",
            formatAmount(invoice.getTaxAmount()), normalFont, boldFont, false);

        // Total row with emerald background
        PdfPCell totalLabelCell = new PdfPCell(new Phrase("TOTAL", new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE)));
        totalLabelCell.setBackgroundColor(DARK_BG);
        totalLabelCell.setPadding(10);
        totalLabelCell.setBorder(Rectangle.NO_BORDER);
        totalsTable.addCell(totalLabelCell);

        PdfPCell totalValCell = new PdfPCell(new Phrase(formatAmount(invoice.getTotal()), totalFont));
        totalValCell.setBackgroundColor(DARK_BG);
        totalValCell.setPadding(10);
        totalValCell.setBorder(Rectangle.NO_BORDER);
        totalValCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalsTable.addCell(totalValCell);

        document.add(totalsTable);

        // Notes
        if (invoice.getNotes() != null && !invoice.getNotes().isEmpty()) {
            document.add(new Paragraph(" "));
            Paragraph notesLabel = new Paragraph("NOTES", labelFont);
            notesLabel.setSpacingBefore(10);
            document.add(notesLabel);
            document.add(new Paragraph(invoice.getNotes(), normalFont));
        }

        document.close();
        return out.toByteArray();
    }

    private void addDateCell(PdfPTable table, String label, String value,
                             Font labelFont, Font valueFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.addElement(new Paragraph(label, labelFont));
        cell.addElement(new Paragraph(value, valueFont));
        table.addCell(cell);
    }

    private void addItemCell(PdfPTable table, String text, int align, Font font, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(8);
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(new Color(226, 232, 240));
        cell.setHorizontalAlignment(align);
        table.addCell(cell);
    }

    private void addTotalRow(PdfPTable table, String label, String value,
                             Font labelFont, Font valueFont, boolean highlight) {
        PdfPCell lCell = new PdfPCell(new Phrase(label, labelFont));
        lCell.setBorder(Rectangle.NO_BORDER);
        lCell.setPadding(5);
        table.addCell(lCell);

        PdfPCell vCell = new PdfPCell(new Phrase(value, valueFont));
        vCell.setBorder(Rectangle.NO_BORDER);
        vCell.setPadding(5);
        vCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(vCell);
    }

    private String formatAmount(Double amount) {
        if (amount == null) return "€0.00";
        return String.format("€%.2f", amount);
    }
}
