package com.abdellah.invoicegen.dto;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;
@Data
public class InvoiceRequest {
    private Long clientId;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private Double taxRate;
    private String notes;
    private List<InvoiceItemRequest> items;
}
