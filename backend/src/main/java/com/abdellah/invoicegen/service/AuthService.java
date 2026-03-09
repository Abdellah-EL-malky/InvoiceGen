package com.abdellah.invoicegen.service;

import com.abdellah.invoicegen.dto.AuthRequest;
import com.abdellah.invoicegen.dto.AuthResponse;
import com.abdellah.invoicegen.dto.RegisterRequest;
import com.abdellah.invoicegen.entity.User;
import com.abdellah.invoicegen.repository.UserRepository;
import com.abdellah.invoicegen.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .build();
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getBusinessName());
    }

    // InvoiceGen AuthService.java — même fix
public AuthResponse login(AuthRequest request) {
    try {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
    } catch (Exception e) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }
    User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
    String token = jwtUtil.generateToken(user.getEmail());
    return new AuthResponse(token, user.getEmail(), user.getName(), user.getBusinessName());
}
}
