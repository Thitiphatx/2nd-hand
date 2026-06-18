package com.thitiphatx.secondhand.model;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.annotation.Id;

@Data
public class Address {
    @Id
    private String id;
    private String title;
    @NotNull
    private String receiverName;
    @NotNull
    private String phone;
    private String address;
    @NotNull
    private String province;
    @NotNull
    private String district;
    @NotNull
    private String subDistrict;
    @NotNull
    private String zipcode;
}
