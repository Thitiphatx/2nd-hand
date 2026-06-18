package com.thitiphatx.secondhand.dto;

import com.thitiphatx.secondhand.model.Gender;
import com.thitiphatx.secondhand.model.Role;
import lombok.Data;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.List;

@Data
@SuperBuilder
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private String phone;
    private Gender gender;
    private LocalDate birth;
    private List<Role> roles;
    private String defaultAddressId;
    private boolean enabled;
}
