package com.simpleaccounts.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.simpleaccounts.entity.Invoice;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.sql.DataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@DataJpaTest
@ExtendWith(SpringExtension.class)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:invoicetest;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.liquibase.enabled=false"
})
class InvoiceRepositoryTest {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private DataSource dataSource;

    @BeforeEach
    void registerDateTruncAlias() throws SQLException {
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            statement.execute("CREATE ALIAS IF NOT EXISTS DATE_TRUNC FOR \"com.simpleaccounts.repository.H2Functions.dateTrunc\"");
        }
    }

    @Test
    void shouldFindInvoicesByStatusAndType() {
        persistInvoice("INV-1001", 6, 2, false);
        persistInvoice("INV-1002", 3, 2, false);

        List<Invoice> result = invoiceRepository.findAllByStatusAndType(6, 2);

        assertThat(result)
                .hasSize(1)
                .allMatch(invoice -> invoice.getReferenceNumber().equals("INV-1001"));
    }

    @Test
    void shouldReturnOnlyActiveInvoicesWhenDeleteFlagIsFalse() {
        persistInvoice("INV-2001", 6, 2, false);
        persistInvoice("INV-2002", 6, 2, true);

        List<Invoice> result = invoiceRepository.findAllByDeleteFlag(false);

        assertThat(result)
                .extracting(Invoice::getReferenceNumber)
                .containsExactly("INV-2001");
    }

    private void persistInvoice(String referenceNumber, int status, int type, boolean deleteFlag) {
        Invoice invoice = new Invoice();
        invoice.setReferenceNumber(referenceNumber);
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setInvoiceDueDate(LocalDate.now().plusDays(30));
        invoice.setTotalAmount(BigDecimal.TEN);
        invoice.setTotalVatAmount(BigDecimal.ONE);
        invoice.setStatus(status);
        invoice.setType(type);
        invoice.setDeleteFlag(deleteFlag);
        invoice.setFreeze(false);
        invoice.setIsMigratedRecord(false);
        invoice.setIsReverseChargeEnabled(false);
        invoice.setTaxType(false);
        invoice.setChangeShippingAddress(false);
        invoice.setGeneratedByScan(false);
        invoice.setCnCreatedOnPaidInvoice(false);
        invoice.setEditFlag(true);
        invoice.setCreatedBy(1);
        entityManager.persist(invoice);
        entityManager.flush();
    }
}

