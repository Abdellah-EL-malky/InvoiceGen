package com.abdellah.invoicegen.dto;
import lombok.Data;
@Data
public class StatsResponse {
    private long totalInvoices;
    private long draftCount;
    private long sentCount;
    private long paidCount;
    private Double totalRevenue;
}
