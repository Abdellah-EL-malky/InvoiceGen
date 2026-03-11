package com.abdellah.invoicegen.repository;

import com.abdellah.invoicegen.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Invoice> findByIdAndUserId(Long id, Long userId);
    boolean existsByInvoiceNumber(String invoiceNumber);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.user.id = :userId AND i.status = 'PAID'")
    long countPaidByUserId(Long userId);

    @Query("SELECT COALESCE(SUM(item.quantity * item.unitPrice), 0) FROM InvoiceItem item WHERE item.invoice.user.id = :userId AND item.invoice.status = 'PAID'")
    Double sumPaidRevenueByUserId(Long userId);
}
