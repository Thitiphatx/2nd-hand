package com.thitiphatx.secondhand.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotNull
    String currentPassword;
    @NotNull
    String newPassword;
}
