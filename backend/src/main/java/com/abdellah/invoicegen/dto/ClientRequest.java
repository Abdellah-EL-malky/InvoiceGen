package com.abdellah.invoicegen.dto;
import lombok.Data;
@Data
public class ClientRequest {
    private String name;
    private String email;
    private String phone;
    private String address;
    private String company;
}
