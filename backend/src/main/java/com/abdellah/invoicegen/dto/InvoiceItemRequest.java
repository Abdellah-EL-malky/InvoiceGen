package com.abdellah.invoicegen.dto;
import lombok.Data;
@Data
public class InvoiceItemRequest {
    private String description;
    private Integer quantity;
    private Double unitPrice;
}
