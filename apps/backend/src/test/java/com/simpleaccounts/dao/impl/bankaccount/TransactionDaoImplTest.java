package com.simpleaccounts.dao.impl.bankaccount;

import static org.assertj.core.api.Assertions.assertThat;

import com.simpleaccounts.constant.TransactionCreationMode;
import com.simpleaccounts.constant.TransactionExplinationStatusEnum;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.utils.DateUtils;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@DataJpaTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.liquibase.enabled=false"
})
@Import({TransactionDaoImpl.class, DateUtils.class})
class TransactionDaoImplTest {

    @Autowired
    private TransactionDaoImpl transactionDao;

    @Autowired
    private TestEntityManager entityManager;

    private BankAccount bankAccount;

    @BeforeEach
    void setUp() {
        bankAccount = persistBankAccount("Primary Bank");
    }

    @Test
    void isTransactionsReadyForReconcileReturnsPendingCount() {
        LocalDateTime start = LocalDateTime.now().minusDays(5);
        LocalDateTime end = LocalDateTime.now().plusDays(1);
        persistTransaction(bankAccount, start.plusDays(1), new BigDecimal("150.00"),
                new BigDecimal("1150.00"), TransactionExplinationStatusEnum.NOT_EXPLAIN);

        Integer pending = transactionDao.isTransactionsReadyForReconcile(start, end, bankAccount.getBankAccountId());

        assertThat(pending).isEqualTo(1);
    }

    @Test
    void isTransactionsReadyForReconcileReturnsZeroWhenRangeIsClear() {
        LocalDateTime start = LocalDateTime.now().minusDays(10);
        LocalDateTime end = LocalDateTime.now();
        persistTransaction(bankAccount, start.minusDays(2), new BigDecimal("50.00"),
                new BigDecimal("1000.00"), TransactionExplinationStatusEnum.FULL);
        persistTransaction(bankAccount, start.plusDays(3), new BigDecimal("75.00"),
                new BigDecimal("925.00"), TransactionExplinationStatusEnum.RECONCILED);

        Integer result = transactionDao.isTransactionsReadyForReconcile(start, end, bankAccount.getBankAccountId());

        assertThat(result).isZero();
    }

    @Test
    void matchClosingBalanceForReconcileHonorsLatestTransactionBalance() {
        LocalDateTime date = LocalDateTime.now();
        persistTransaction(bankAccount, date.minusDays(2), new BigDecimal("90.00"),
                new BigDecimal("900.00"), TransactionExplinationStatusEnum.FULL);
        persistTransaction(bankAccount, date.minusDays(1), new BigDecimal("110.00"),
                new BigDecimal("1010.00"), TransactionExplinationStatusEnum.FULL);

        boolean matches = transactionDao.matchClosingBalanceForReconcile(date, new BigDecimal("1010.00"),
                bankAccount.getBankAccountId());
        boolean mismatch = transactionDao.matchClosingBalanceForReconcile(date, new BigDecimal("999.99"),
                bankAccount.getBankAccountId());

        assertThat(matches).isTrue();
        assertThat(mismatch).isFalse();
    }

    @Test
    void getTransactionStartDateToReconcileReturnsEarliestTransaction() {
        LocalDateTime earliest = LocalDateTime.now().minusDays(30);
        persistTransaction(bankAccount, earliest, new BigDecimal("50.00"),
                new BigDecimal("950.00"), TransactionExplinationStatusEnum.FULL);
        persistTransaction(bankAccount, earliest.plusDays(10), new BigDecimal("25.00"),
                new BigDecimal("975.00"), TransactionExplinationStatusEnum.FULL);

        LocalDateTime startDate = transactionDao.getTransactionStartDateToReconcile(LocalDateTime.now(),
                bankAccount.getBankAccountId());

        assertThat(startDate).isEqualTo(earliest);
    }

    @Test
    void isAlreadyExistSimilarTransactionDetectsExactDuplicate() {
        LocalDateTime date = LocalDateTime.of(2024, 3, 1, 12, 0);
        BigDecimal amount = new BigDecimal("250.00");
        String description = "POS-REF-250";
        persistTransaction(bankAccount, date, amount, new BigDecimal("1250.00"),
                TransactionExplinationStatusEnum.NOT_EXPLAIN, description);

        boolean exists = transactionDao.isAlreadyExistSimilarTransaction(amount, date, bankAccount, description);
        boolean missing = transactionDao.isAlreadyExistSimilarTransaction(amount, date, bankAccount, "OTHER-REF");

        assertThat(exists).isTrue();
        assertThat(missing).isFalse();
    }

    private BankAccount persistBankAccount(String name) {
        ChartOfAccount chartOfAccount = new ChartOfAccount();
        chartOfAccount.setChartOfAccountName("Cash");
        chartOfAccount.setChartOfAccountCode("CASH-" + name);
        chartOfAccount.setDebitCreditFlag('D');
        chartOfAccount.setDefaltFlag('N');
        chartOfAccount.setDeleteFlag(false);
        chartOfAccount.setOrderSequence(1);
        chartOfAccount.setLastUpdateDate(new java.util.Date());
        entityManager.persist(chartOfAccount);

        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryName("Bank Category");
        category.setTransactionCategoryCode("BANK-" + name);
        category.setChartOfAccount(chartOfAccount);
        category.setDefaltFlag('N');
        category.setSelectableFlag(true);
        category.setEditableFlag(true);
        category.setIsMigratedRecord(false);
        category.setCreatedDate(LocalDateTime.now());
        entityManager.persist(category);

        BankAccount bankAccount = new BankAccount();
        bankAccount.setBankAccountName(name);
        bankAccount.setPersonalCorporateAccountInd('C');
        bankAccount.setIsprimaryAccountFlag(Boolean.TRUE);
        bankAccount.setOpeningBalance(BigDecimal.ZERO);
        bankAccount.setCurrentBalance(BigDecimal.ZERO);
        bankAccount.setCreatedBy(1);
        bankAccount.setCreatedDate(LocalDateTime.now().minusMonths(1));
        bankAccount.setOpeningDate(LocalDateTime.now().minusMonths(1));
        bankAccount.setTransactionCategory(category);
        entityManager.persist(bankAccount);
        entityManager.flush();
        return bankAccount;
    }

    private Transaction persistTransaction(BankAccount account,
                                           LocalDateTime date,
                                           BigDecimal amount,
                                           BigDecimal currentBalance,
                                           TransactionExplinationStatusEnum status) {
        return persistTransaction(account, date, amount, currentBalance, status,
                "txn-" + date.toString());
    }

    private Transaction persistTransaction(BankAccount account,
                                           LocalDateTime date,
                                           BigDecimal amount,
                                           BigDecimal currentBalance,
                                           TransactionExplinationStatusEnum status,
                                           String description) {
        Transaction transaction = new Transaction();
        transaction.setBankAccount(account);
        transaction.setTransactionAmount(amount);
        transaction.setTransactionDueAmount(amount);
        transaction.setTransactionDate(date);
        transaction.setTransactionDescription(description);
        transaction.setDebitCreditFlag('C');
        transaction.setCurrentBalance(currentBalance);
        transaction.setCreationMode(TransactionCreationMode.MANUAL);
        transaction.setTransactionExplinationStatusEnum(status);
        transaction.setExchangeRate(BigDecimal.ONE);
        transaction.setCreatedBy(1);
        transaction.setCreatedDate(date.minusDays(1));
        entityManager.persist(transaction);
        entityManager.flush();
        return transaction;
    }
}

