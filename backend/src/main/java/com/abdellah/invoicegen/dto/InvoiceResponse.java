package com.abdellah.invoicegen.dto;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
@Data
public class InvoiceResponse {
    private Long id;
    private String invoiceNumber;
    private String status;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private Double taxRate;
    private String notes;
    private ClientResponse client;
    private List<InvoiceItemResponse> items;
    private Double subtotal;
    private Double taxAmount;
    private Double total;
    private LocalDateTime createdAt;
}
