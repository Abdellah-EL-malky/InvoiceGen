package com.abdellah.invoicegen.service;

import com.abdellah.invoicegen.dto.*;
import com.abdellah.invoicegen.entity.*;
import com.abdellah.invoicegen.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private ClientRepository clientRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ClientService clientService;

    public List<InvoiceResponse> getAll(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return invoiceRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public InvoiceResponse getById(Long id, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Invoice invoice = invoiceRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        return toResponse(invoice);
    }

    @Transactional
    public InvoiceResponse create(InvoiceRequest request, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Client client = clientRepository.findByIdAndUserId(request.getClientId(), user.getId())
                .orElseThrow(() -> new RuntimeException("Client not found"));

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .status(Invoice.Status.DRAFT)
                .issueDate(request.getIssueDate())
                .dueDate(request.getDueDate())
                .taxRate(request.getTaxRate() != null ? request.getTaxRate() : 0.0)
                .notes(request.getNotes())
                .user(user)
                .client(client)
                .build();

        invoice = invoiceRepository.save(invoice);

        if (request.getItems() != null) {
            Invoice finalInvoice = invoice;
            List<InvoiceItem> items = request.getItems().stream().map(i -> InvoiceItem.builder()
                    .description(i.getDescription())
                    .quantity(i.getQuantity())
                    .unitPrice(i.getUnitPrice())
                    .invoice(finalInvoice)
                    .build()).collect(Collectors.toList());
            invoice.setItems(items);
            invoice = invoiceRepository.save(invoice);
        }

        return toResponse(invoice);
    }

    @Transactional
    public InvoiceResponse update(Long id, InvoiceRequest request, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Invoice invoice = invoiceRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (request.getClientId() != null) {
            Client client = clientRepository.findByIdAndUserId(request.getClientId(), user.getId())
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            invoice.setClient(client);
        }

        if (request.getIssueDate() != null) invoice.setIssueDate(request.getIssueDate());
        if (request.getDueDate() != null) invoice.setDueDate(request.getDueDate());
        if (request.getTaxRate() != null) invoice.setTaxRate(request.getTaxRate());
        if (request.getNotes() != null) invoice.setNotes(request.getNotes());

        if (request.getItems() != null) {
            invoice.getItems().clear();
            Invoice finalInvoice = invoice;
            List<InvoiceItem> items = request.getItems().stream().map(i -> InvoiceItem.builder()
                    .description(i.getDescription())
                    .quantity(i.getQuantity())
                    .unitPrice(i.getUnitPrice())
                    .invoice(finalInvoice)
                    .build()).collect(Collectors.toList());
            invoice.getItems().addAll(items);
        }

        return toResponse(invoiceRepository.save(invoice));
    }

    public InvoiceResponse updateStatus(Long id, String status, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Invoice invoice = invoiceRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        invoice.setStatus(Invoice.Status.valueOf(status.toUpperCase()));
        return toResponse(invoiceRepository.save(invoice));
    }

    public void delete(Long id, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Invoice invoice = invoiceRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        invoiceRepository.delete(invoice);
    }

    public StatsResponse getStats(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Invoice> all = invoiceRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        StatsResponse stats = new StatsResponse();
        stats.setTotalInvoices(all.size());
        stats.setDraftCount(all.stream().filter(i -> i.getStatus() == Invoice.Status.DRAFT).count());
        stats.setSentCount(all.stream().filter(i -> i.getStatus() == Invoice.Status.SENT).count());
        stats.setPaidCount(all.stream().filter(i -> i.getStatus() == Invoice.Status.PAID).count());

        Double revenue = invoiceRepository.sumPaidRevenueByUserId(user.getId());
        stats.setTotalRevenue(revenue != null ? revenue : 0.0);

        return stats;
    }

    private String generateInvoiceNumber() {
        String prefix = "INV-" + java.time.LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")) + "-";
        long count = invoiceRepository.count() + 1;
        return prefix + String.format("%04d", count);
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        InvoiceResponse r = new InvoiceResponse();
        r.setId(invoice.getId());
        r.setInvoiceNumber(invoice.getInvoiceNumber());
        r.setStatus(invoice.getStatus().name());
        r.setIssueDate(invoice.getIssueDate());
        r.setDueDate(invoice.getDueDate());
        r.setTaxRate(invoice.getTaxRate());
        r.setNotes(invoice.getNotes());
        r.setClient(clientService.toResponse(invoice.getClient()));
        r.setCreatedAt(invoice.getCreatedAt());
        r.setSubtotal(invoice.getSubtotal());
        r.setTaxAmount(invoice.getTaxAmount());
        r.setTotal(invoice.getTotal());

        if (invoice.getItems() != null) {
            r.setItems(invoice.getItems().stream().map(item -> {
                InvoiceItemResponse ir = new InvoiceItemResponse();
                ir.setId(item.getId());
                ir.setDescription(item.getDescription());
                ir.setQuantity(item.getQuantity());
                ir.setUnitPrice(item.getUnitPrice());
                ir.setTotal(item.getTotal());
                return ir;
            }).collect(Collectors.toList()));
        }

        return r;
    }
}
