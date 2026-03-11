package com.abdellah.invoicegen.repository;

import com.abdellah.invoicegen.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByUserId(Long userId);
    Optional<Client> findByIdAndUserId(Long id, Long userId);
}
