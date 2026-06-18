package com.thitiphatx.secondhand.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddressRequest {
    private String title;
    @NotNull
    private String receiverName;
    @NotNull
    private String phone;
    @NotNull
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
