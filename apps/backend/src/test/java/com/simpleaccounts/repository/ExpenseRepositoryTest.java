package com.simpleaccounts.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
        "spring.datasource.url=jdbc:h2:mem:expensetest;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.liquibase.enabled=false"
})
class ExpenseRepositoryTest {

    @Autowired
    private ExpenseRepository expenseRepository;

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
    void shouldFilterExpensesByTransactionCategory() {
        TransactionCategory travel = persistCategory("Travel");
        TransactionCategory supplies = persistCategory("Supplies");

        persistExpense("EXP-001", travel, false);
        persistExpense("EXP-002", supplies, false);

        List<Expense> result = expenseRepository.findAllByTransactionCategory(travel);

        assertThat(result)
                .hasSize(1)
                .allMatch(expense -> expense.getExpenseNumber().equals("EXP-001"));
    }

    @Test
    void shouldReturnOnlyActiveExpensesWhenDeleteFlagFalse() {
        TransactionCategory travel = persistCategory("Travel");
        persistExpense("EXP-003", travel, false);
        persistExpense("EXP-004", travel, true);

        List<Expense> result = expenseRepository.findAllByDeleteFlag(false);

        assertThat(result)
                .extracting(Expense::getExpenseNumber)
                .containsExactly("EXP-003");
    }

    private TransactionCategory persistCategory(String name) {
        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryName(name);
        category.setTransactionCategoryDescription(name + " desc");
        category.setTransactionCategoryCode(name.substring(0, 2).toUpperCase());
        category.setDefaltFlag('N');
        category.setCreatedBy(1);
        category.setCreatedDate(LocalDateTime.now());
        category.setDeleteFlag(false);
        category.setSelectableFlag(true);
        category.setEditableFlag(true);
        category.setVersionNumber(1);
        category.setIsMigratedRecord(false);
        entityManager.persist(category);
        return category;
    }

    private void persistExpense(String number, TransactionCategory category, boolean deleteFlag) {
        Expense expense = new Expense();
        expense.setExpenseNumber(number);
        expense.setExpenseAmount(new BigDecimal("100.00"));
        expense.setExpenseVatAmount(new BigDecimal("5.00"));
        expense.setExpenseDate(LocalDate.now());
        expense.setExpenseDescription("desc");
        expense.setTransactionCategory(category);
        expense.setCreatedBy(1);
        expense.setStatus(1);
        expense.setDeleteFlag(deleteFlag);
        expense.setVatClaimable(true);
        expense.setExclusiveVat(false);
        expense.setVersionNumber(1);
        expense.setIsMigratedRecord(false);
        expense.setExpenseType(false);
        expense.setBankGenerated(false);
        expense.setEditFlag(true);
        entityManager.persist(expense);
        entityManager.flush();
    }
}

