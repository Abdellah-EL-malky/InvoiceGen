package com.abdellah.invoicegen.config;

import com.abdellah.invoicegen.entity.User;
import com.abdellah.invoicegen.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("demo@invoicegen.com")) {
            userRepository.save(User.builder()
                .email("demo@invoicegen.com")
                .password(passwordEncoder.encode("demo1234"))
                .name("Demo User")
                .businessName("Demo Company")
                .build());
            System.out.println("✅ Demo user created: demo@invoicegen.com / demo1234");
        }
    }
}