package com.abdellah.invoicegen.controller;

import com.abdellah.invoicegen.dto.ClientRequest;
import com.abdellah.invoicegen.dto.ClientResponse;
import com.abdellah.invoicegen.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    @Autowired private ClientService clientService;

    @GetMapping
    public List<ClientResponse> getAll(@AuthenticationPrincipal UserDetails user) {
        return clientService.getAll(user.getUsername());
    }

    @GetMapping("/{id}")
    public ClientResponse getById(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        return clientService.getById(id, user.getUsername());
    }

    @PostMapping
    public ResponseEntity<ClientResponse> create(@RequestBody ClientRequest request,
                                                  @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(clientService.create(request, user.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientResponse> update(@PathVariable Long id,
                                                  @RequestBody ClientRequest request,
                                                  @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(clientService.update(id, request, user.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        clientService.delete(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }
}
