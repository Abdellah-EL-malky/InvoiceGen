package com.abdellah.invoicegen.dto;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class ClientResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String company;
    private LocalDateTime createdAt;
}
