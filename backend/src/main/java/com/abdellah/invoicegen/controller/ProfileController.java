package com.abdellah.invoicegen.controller;

import com.abdellah.invoicegen.dto.ProfileUpdateRequest;
import com.abdellah.invoicegen.entity.User;
import com.abdellah.invoicegen.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(Map.of(
            "name", user.getName() != null ? user.getName() : "",
            "email", user.getEmail(),
            "businessName", user.getBusinessName() != null ? user.getBusinessName() : "",
            "businessAddress", user.getBusinessAddress() != null ? user.getBusinessAddress() : "",
            "businessPhone", user.getBusinessPhone() != null ? user.getBusinessPhone() : "",
            "businessEmail", user.getBusinessEmail() != null ? user.getBusinessEmail() : ""
        ));
    }

    @PutMapping
    public ResponseEntity<Map<String, String>> updateProfile(@RequestBody ProfileUpdateRequest request,
                                                              @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        if (request.getName() != null) user.setName(request.getName());
        if (request.getBusinessName() != null) user.setBusinessName(request.getBusinessName());
        if (request.getBusinessAddress() != null) user.setBusinessAddress(request.getBusinessAddress());
        if (request.getBusinessPhone() != null) user.setBusinessPhone(request.getBusinessPhone());
        if (request.getBusinessEmail() != null) user.setBusinessEmail(request.getBusinessEmail());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated"));
    }
}
