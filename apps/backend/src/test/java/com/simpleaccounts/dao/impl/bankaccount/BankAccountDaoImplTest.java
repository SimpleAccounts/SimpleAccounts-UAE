package com.simpleaccounts.dao.impl.bankaccount;

import static org.assertj.core.api.Assertions.assertThat;

import com.simpleaccounts.constant.dbfilter.BankAccounrFilterEnum;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
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
        "spring.datasource.url=jdbc:h2:mem:bankaccountdb;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.liquibase.enabled=false"
})
@Import(BankAccountDaoImpl.class)
@DisplayName("BankAccountDaoImpl Tests")
class BankAccountDaoImplTest {

    @Autowired
    private BankAccountDaoImpl bankAccountDao;

    @Autowired
    private TestEntityManager entityManager;

    private BankAccount bankAccount1;
    private BankAccount bankAccount2;

    @BeforeEach
    void setUp() {
        bankAccount1 = persistBankAccount("Primary Account", "BANK001", "Test Bank", BigDecimal.valueOf(1000));
        bankAccount2 = persistBankAccount("Secondary Account", "BANK002", "Other Bank", BigDecimal.valueOf(2000));
    }

    @Nested
    @DisplayName("getBankAccountById Tests")
    class GetBankAccountByIdTests {

        @Test
        @DisplayName("Should return bank account by id")
        void shouldReturnBankAccountById() {
            BankAccount result = bankAccountDao.getBankAccountById(bankAccount1.getBankAccountId());

            assertThat(result).isNotNull();
            assertThat(result.getBankAccountName()).isEqualTo("Primary Account");
            assertThat(result.getAccountNumber()).isEqualTo("BANK001");
        }

        @Test
        @DisplayName("Should return null when bank account not found")
        void shouldReturnNullWhenNotFound() {
            BankAccount result = bankAccountDao.getBankAccountById(99999);

            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("getBankAccountByUser Tests")
    class GetBankAccountByUserTests {

        @Test
        @DisplayName("Should return bank accounts for user")
        void shouldReturnBankAccountsForUser() {
            List<BankAccount> result = bankAccountDao.getBankAccountByUser(1);

            assertThat(result).isNotNull().hasSize(2);
        }

        @Test
        @DisplayName("Should return empty list when user has no accounts")
        void shouldReturnEmptyListWhenNoAccounts() {
            List<BankAccount> result = bankAccountDao.getBankAccountByUser(999);

            assertThat(result).isNotNull().isEmpty();
        }
    }

    @Nested
    @DisplayName("deleteByIds Tests")
    class DeleteByIdsTests {

        @Test
        @DisplayName("Should soft delete bank accounts by ids")
        void shouldSoftDeleteBankAccountsByIds() {
            List<Integer> ids = List.of(bankAccount1.getBankAccountId());

            bankAccountDao.deleteByIds(ids);

            entityManager.flush();
            entityManager.clear();

            BankAccount deleted = bankAccountDao.findByPK(bankAccount1.getBankAccountId());
            assertThat(deleted.getDeleteFlag()).isTrue();
        }

        @Test
        @DisplayName("Should handle empty list of ids")
        void shouldHandleEmptyIdList() {
            bankAccountDao.deleteByIds(List.of());

            BankAccount notDeleted = bankAccountDao.findByPK(bankAccount1.getBankAccountId());
            assertThat(notDeleted.getDeleteFlag()).isFalse();
        }

        @Test
        @DisplayName("Should handle null list of ids")
        void shouldHandleNullIdList() {
            bankAccountDao.deleteByIds(null);

            BankAccount notDeleted = bankAccountDao.findByPK(bankAccount1.getBankAccountId());
            assertThat(notDeleted.getDeleteFlag()).isFalse();
        }
    }

    @Nested
    @DisplayName("Multiple Bank Account Tests")
    class MultipleBankAccountTests {

        @Test
        @DisplayName("Should return correct account when multiple exist")
        void shouldReturnCorrectAccountWhenMultipleExist() {
            BankAccount result1 = bankAccountDao.getBankAccountById(bankAccount1.getBankAccountId());
            BankAccount result2 = bankAccountDao.getBankAccountById(bankAccount2.getBankAccountId());

            assertThat(result1.getBankAccountName()).isEqualTo("Primary Account");
            assertThat(result2.getBankAccountName()).isEqualTo("Secondary Account");
        }
    }

    private BankAccount persistBankAccount(String name, String accountNumber, String bankName, BigDecimal balance) {
        ChartOfAccount chartOfAccount = new ChartOfAccount();
        chartOfAccount.setChartOfAccountName("Cash");
        chartOfAccount.setChartOfAccountCode("CASH-" + accountNumber);
        chartOfAccount.setDebitCreditFlag('D');
        chartOfAccount.setDefaltFlag('N');
        chartOfAccount.setDeleteFlag(false);
        chartOfAccount.setOrderSequence(1);
        chartOfAccount.setLastUpdateDate(new java.util.Date());
        entityManager.persist(chartOfAccount);

        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryName("Bank Category " + name);
        category.setTransactionCategoryCode("BANK-" + accountNumber);
        category.setChartOfAccount(chartOfAccount);
        category.setDefaltFlag('N');
        category.setSelectableFlag(true);
        category.setEditableFlag(true);
        category.setIsMigratedRecord(false);
        category.setCreatedDate(LocalDateTime.now());
        entityManager.persist(category);

        BankAccount bankAccount = new BankAccount();
        bankAccount.setBankAccountName(name);
        bankAccount.setAccountNumber(accountNumber);
        bankAccount.setBankName(bankName);
        bankAccount.setPersonalCorporateAccountInd('C');
        bankAccount.setIsprimaryAccountFlag(Boolean.TRUE);
        bankAccount.setOpeningBalance(BigDecimal.ZERO);
        bankAccount.setCurrentBalance(balance);
        bankAccount.setCreatedBy(1);
        bankAccount.setDeleteFlag(false);
        bankAccount.setCreatedDate(LocalDateTime.now().minusMonths(1));
        bankAccount.setOpeningDate(LocalDateTime.now().minusMonths(1));
        bankAccount.setTransactionCategory(category);
        entityManager.persist(bankAccount);
        entityManager.flush();
        return bankAccount;
    }
}
