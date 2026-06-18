package com.thitiphatx.secondhand.service;

import com.thitiphatx.secondhand.dto.*;
import com.thitiphatx.secondhand.helper.UserMapper;
import com.thitiphatx.secondhand.model.Address;
import com.thitiphatx.secondhand.model.ResourceNotFoundException;
import com.thitiphatx.secondhand.model.UnautorizedException;
import com.thitiphatx.secondhand.model.User;
import com.thitiphatx.secondhand.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public AuthResponse approveUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(true);
        User updatedUser = userRepository.save(user);
        return userMapper.mapToAuthResponse(updatedUser);
    }

    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public UserResponse getUserDetail(String id, User user) {
        if (user == null) {
            throw new UnautorizedException("You must be authenticated");
        }
        if (!user.getId().equals(id)) {
            throw new AccessDeniedException("You don't have access to get user id: " + id + "details");
        }

        return userRepository.findById(id)
                .map(userMapper::mapToUserResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public UserResponse updateUser(
            String userId,
            UpdaterUserRequest request,
            User user
    ) {
        if (user == null) {
            throw new UnautorizedException("You must be authenticated");
        }
        if (!user.getId().equals(userId)) {
            throw new UnautorizedException("You are not authorized to update this user");
        }

        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setGender(request.getGender());
        user.setBirth(request.getBirth());

        return userMapper.mapToUserResponse(userRepository.save(user));
    }

    public void changePassword(
            String userId,
            ChangePasswordRequest request,
            User user
    ) {
        if (user == null) {
            throw new UnautorizedException("You must be authenticated");
        }
        if (!user.getId().equals(userId)) {
            throw new UnautorizedException("You are not authorized to change password for this user");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid current password");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public Address createAddress(AddressRequest request, User user) {
        Address address = new Address();
        address.setTitle(request.getTitle());
        address.setId(UUID.randomUUID().toString());
        address.setReceiverName(request.getReceiverName());
        address.setPhone(request.getPhone());
        address.setAddress(request.getAddress());
        address.setProvince(request.getProvince());
        address.setDistrict(request.getDistrict());
        address.setSubDistrict(request.getSubDistrict());
        address.setZipcode(request.getZipcode());

        if (user.getAddresses() == null) {
            user.setAddresses(new ArrayList<>());
        }
        user.getAddresses().add(address);
        userRepository.save(user);
        return address;
    }

    public List<Address> getAddresses(User user) {
        return user.getAddresses();
    }

    public Address updateAddress(String addressId, AddressRequest request, User user) {
        Address address = user.getAddresses().stream()
                .filter(a -> a.getId().equals(addressId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Address not found"));

        address.setTitle(request.getTitle());
        address.setReceiverName(request.getReceiverName());
        address.setPhone(request.getPhone());
        address.setAddress(request.getAddress());
        address.setProvince(request.getProvince());
        address.setDistrict(request.getDistrict());
        address.setSubDistrict(request.getSubDistrict());
        address.setZipcode(request.getZipcode());

        userRepository.save(user);
        return address;
    }

    public void deleteAddress(String addressId, User user) {
        user.getAddresses().removeIf(a -> a.getId().equals(addressId));
        userRepository.save(user);
    }

    public Address updateDefaultAddress(String addressId, User user) {
        Address defaultAddress = user.getAddresses().stream()
                .filter(address -> address.getId().equals(addressId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Address not found with ID: " + addressId));

        user.setDefaultAddressId(addressId);
        userRepository.save(user);
        return defaultAddress;
    }

    public Page<User> getUser() {
        Pageable pageable = PageRequest.of(0, 5);
        return userRepository.findAll(pageable);
    }

    public UserPublicInfoResponse getUserPublicInfo(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserPublicInfoResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .build();
    }
}
