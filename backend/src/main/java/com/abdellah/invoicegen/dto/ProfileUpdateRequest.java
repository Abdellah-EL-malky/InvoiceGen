package com.abdellah.invoicegen.dto;
import lombok.Data;
@Data
public class ProfileUpdateRequest {
    private String name;
    private String businessName;
    private String businessAddress;
    private String businessPhone;
    private String businessEmail;
}
