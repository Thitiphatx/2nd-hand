package com.thitiphatx.secondhand.dto;

import com.thitiphatx.secondhand.model.Gender;
import com.thitiphatx.secondhand.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class RegisterRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6)
    private String password;

    private String phone;
    private Gender gender;
    private LocalDate birth;
}
