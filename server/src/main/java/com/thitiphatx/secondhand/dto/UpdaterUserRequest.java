package com.thitiphatx.secondhand.dto;

import com.thitiphatx.secondhand.model.Gender;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdaterUserRequest {
    @NotNull
    private String name;
    private String phone;
    private Gender gender;
    private LocalDate birth;
}
