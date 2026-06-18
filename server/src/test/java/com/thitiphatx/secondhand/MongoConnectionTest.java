package com.thitiphatx.secondhand;

import com.thitiphatx.secondhand.model.User;
import com.thitiphatx.secondhand.model.Role;
import com.thitiphatx.secondhand.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class MongoConnectionTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testConnection() {
        User user = User.builder()
                .email("test@example.com")
                .password("password")
                .name("Test User")
                .roles(java.util.List.of(Role.USER))
                .build();
        
        User savedUser = userRepository.save(user);
        assertNotNull(savedUser.getId());
        userRepository.delete(savedUser);
    }
}
