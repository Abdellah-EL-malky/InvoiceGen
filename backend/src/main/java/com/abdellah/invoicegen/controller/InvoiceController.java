package com.abdellah.invoicegen.controller;

import com.abdellah.invoicegen.dto.InvoiceRequest;
import com.abdellah.invoicegen.dto.InvoiceResponse;
import com.abdellah.invoicegen.dto.StatsResponse;
import com.abdellah.invoicegen.service.InvoiceService;
import com.abdellah.invoicegen.service.PdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired private InvoiceService invoiceService;
    @Autowired private PdfService pdfService;

    @GetMapping
    public List<InvoiceResponse> getAll(@AuthenticationPrincipal UserDetails user) {
        return invoiceService.getAll(user.getUsername());
    }

    @GetMapping("/stats")
    public StatsResponse getStats(@AuthenticationPrincipal UserDetails user) {
        return invoiceService.getStats(user.getUsername());
    }

    @GetMapping("/{id}")
    public InvoiceResponse getById(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        return invoiceService.getById(id, user.getUsername());
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> create(@RequestBody InvoiceRequest request,
                                                   @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(invoiceService.create(request, user.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceResponse> update(@PathVariable Long id,
                                                   @RequestBody InvoiceRequest request,
                                                   @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(invoiceService.update(id, request, user.getUsername()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<InvoiceResponse> updateStatus(@PathVariable Long id,
                                                         @RequestBody Map<String, String> body,
                                                         @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(invoiceService.updateStatus(id, body.get("status"), user.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        invoiceService.delete(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id,
                                               @AuthenticationPrincipal UserDetails user) throws Exception {
        InvoiceResponse invoice = invoiceService.getById(id, user.getUsername());
        byte[] pdf = pdfService.generateInvoicePdf(invoice, user.getUsername());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + invoice.getInvoiceNumber() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
