package com.thitiphatx.secondhand.service;

import com.thitiphatx.secondhand.dto.ChangePasswordRequest;
import com.thitiphatx.secondhand.dto.AddressRequest;
import com.thitiphatx.secondhand.dto.UpdaterUserRequest;
import com.thitiphatx.secondhand.model.Address;
import com.thitiphatx.secondhand.model.Gender;
import com.thitiphatx.secondhand.model.User;
import com.thitiphatx.secondhand.model.UnautorizedException;
import com.thitiphatx.secondhand.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id("1")
                .email("test@example.com")
                .password("encodedPassword")
                .name("Old Name")
                .build();
    }

    @Test
    void changePassword_Success() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("oldPassword");
        request.setNewPassword("newPassword");

        when(passwordEncoder.matches("oldPassword", "encodedPassword")).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        userService.changePassword("1", request, user);

        assertEquals("newEncodedPassword", user.getPassword());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void changePassword_WrongCurrentPassword_ThrowsException() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("wrongPassword");
        request.setNewPassword("newPassword");

        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> userService.changePassword("1", request, user));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateUser_Unauthorized_ThrowsException() {
        UpdaterUserRequest request = new UpdaterUserRequest();
        assertThrows(UnautorizedException.class, () -> userService.updateUser("wrong-id", request, user));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void changePassword_Unauthorized_ThrowsException() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        assertThrows(UnautorizedException.class, () -> userService.changePassword("wrong-id", request, user));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void createAddress_Success() {
        AddressRequest request = new AddressRequest();
        request.setReceiverName("John Doe");
        request.setPhone("0987654321");
        request.setAddress("123 Main St");
        request.setProvince("City");
        request.setDistrict("District");
        request.setSubDistrict("State");
        request.setZipcode("10100");

        when(userRepository.save(any(User.class))).thenReturn(user);

        Address address = userService.createAddress(request, user);

        assertNotNull(address.getId());
        assertEquals("John Doe", address.getReceiverName());
        assertEquals(1, user.getAddresses().size());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void updateAddress_Success() {
        Address existingAddress = new Address();
        existingAddress.setId("addr1");
        existingAddress.setReceiverName("Old Name");
        user.getAddresses().add(existingAddress);

        AddressRequest request = new AddressRequest();
        request.setReceiverName("New Name");
        request.setPhone("1234567890");
        request.setAddress("456 New St");
        request.setProvince("New City");
        request.setDistrict("New District");
        request.setSubDistrict("New State");
        request.setZipcode("20200");

        when(userRepository.save(any(User.class))).thenReturn(user);

        Address updatedAddress = userService.updateAddress("addr1", request, user);

        assertEquals("New Name", updatedAddress.getReceiverName());
        assertEquals("456 New St", updatedAddress.getAddress());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void deleteAddress_Success() {
        Address existingAddress = new Address();
        existingAddress.setId("addr1");
        user.getAddresses().add(existingAddress);

        when(userRepository.save(any(User.class))).thenReturn(user);

        userService.deleteAddress("addr1", user);

        assertTrue(user.getAddresses().isEmpty());
        verify(userRepository, times(1)).save(user);
    }
}
