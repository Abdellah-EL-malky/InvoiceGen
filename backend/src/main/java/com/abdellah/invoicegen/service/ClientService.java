package com.abdellah.invoicegen.service;

import com.abdellah.invoicegen.dto.ClientRequest;
import com.abdellah.invoicegen.dto.ClientResponse;
import com.abdellah.invoicegen.entity.Client;
import com.abdellah.invoicegen.entity.User;
import com.abdellah.invoicegen.repository.ClientRepository;
import com.abdellah.invoicegen.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClientService {

    @Autowired private ClientRepository clientRepository;
    @Autowired private UserRepository userRepository;

    public List<ClientResponse> getAll(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return clientRepository.findByUserId(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ClientResponse getById(Long id, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Client client = clientRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Client not found"));
        return toResponse(client);
    }

    public ClientResponse create(ClientRequest request, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Client client = Client.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .company(request.getCompany())
                .user(user)
                .build();
        return toResponse(clientRepository.save(client));
    }

    public ClientResponse update(Long id, ClientRequest request, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Client client = clientRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Client not found"));
        client.setName(request.getName());
        client.setEmail(request.getEmail());
        client.setPhone(request.getPhone());
        client.setAddress(request.getAddress());
        client.setCompany(request.getCompany());
        return toResponse(clientRepository.save(client));
    }

    public void delete(Long id, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Client client = clientRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Client not found"));
        clientRepository.delete(client);
    }

    public ClientResponse toResponse(Client client) {
        ClientResponse r = new ClientResponse();
        r.setId(client.getId());
        r.setName(client.getName());
        r.setEmail(client.getEmail());
        r.setPhone(client.getPhone());
        r.setAddress(client.getAddress());
        r.setCompany(client.getCompany());
        r.setCreatedAt(client.getCreatedAt());
        return r;
    }
}
