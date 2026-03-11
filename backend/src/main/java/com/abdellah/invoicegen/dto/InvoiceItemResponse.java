package com.abdellah.invoicegen.dto;
import lombok.Data;
@Data
public class InvoiceItemResponse {
    private Long id;
    private String description;
    private Integer quantity;
    private Double unitPrice;
    private Double total;
}
