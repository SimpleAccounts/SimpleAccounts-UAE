package com.simpleaccounts.dao.impl.bankaccount;

import static org.assertj.core.api.Assertions.assertThat;

import com.simpleaccounts.constant.dbfilter.TransactionFilterEnum;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.ReconcileStatus;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
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
        "spring.datasource.url=jdbc:h2:mem:reconciledb;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.liquibase.enabled=false"
})
@Import(ReconcileStatusDaoImpl.class)
class ReconcileStatusDaoImplTest {

    @Autowired
    private ReconcileStatusDaoImpl reconcileStatusDao;

    @Autowired
    private TestEntityManager entityManager;

    private BankAccount bankAccount;

    @BeforeEach
    void setUp() {
        bankAccount = persistBankAccount("Primary");
    }

    @Test
    void getAllReconcileStatusListByBankAccountIdReturnsLatestActiveRow() {
        LocalDateTime now = LocalDateTime.of(2024, 1, 10, 10, 0);
        persistReconcileStatus(bankAccount, now.minusDays(5), now.minusDays(1), new BigDecimal("150.00"), false);
        ReconcileStatus latest = persistReconcileStatus(bankAccount, now.minusDays(2), now, new BigDecimal("175.00"), false);
        persistReconcileStatus(bankAccount, now, now.plusDays(1), new BigDecimal("200.00"), true);

        List<ReconcileStatus> results =
                reconcileStatusDao.getAllReconcileStatusListByBankAccountId(bankAccount.getBankAccountId());

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getReconciledDate()).isEqualTo(latest.getReconciledDate());
    }

    @Test
    void getAllReconcileStatusByBankAccountIdRespectsUpperBound() {
        LocalDateTime now = LocalDateTime.of(2024, 2, 1, 9, 0);
        persistReconcileStatus(bankAccount, now.minusDays(20), now.minusDays(15), new BigDecimal("100.00"), false);
        ReconcileStatus withinRange = persistReconcileStatus(bankAccount, now.minusDays(10), now.minusDays(5),
                new BigDecimal("125.00"), false);

        ReconcileStatus match =
                reconcileStatusDao.getAllReconcileStatusByBankAccountId(bankAccount.getBankAccountId(),
                        now.minusDays(4));

        assertThat(match).isNotNull();
        assertThat(match.getReconciledDate()).isEqualTo(withinRange.getReconciledDate());
    }

    @Test
    void getAllReconcileStatusListHonorsFiltersAndPagination() {
        BankAccount otherAccount = persistBankAccount("Secondary");
        persistReconcileStatus(bankAccount, LocalDateTime.now().minusDays(7),
                LocalDateTime.now().minusDays(6), new BigDecimal("90.00"), false);
        persistReconcileStatus(bankAccount, LocalDateTime.now().minusDays(5),
                LocalDateTime.now().minusDays(3), new BigDecimal("95.00"), false);
        persistReconcileStatus(otherAccount, LocalDateTime.now().minusDays(2),
                LocalDateTime.now().minusDays(1), new BigDecimal("80.00"), false);

        Map<TransactionFilterEnum, Object> filters = new EnumMap<>(TransactionFilterEnum.class);
        filters.put(TransactionFilterEnum.BANK_ID, bankAccount);
        filters.put(TransactionFilterEnum.DELETE_FLAG, Boolean.FALSE);

        PaginationModel pagination = new PaginationModel();
        pagination.setPageNo(0);
        pagination.setPageSize(10);

        PaginationResponseModel response = reconcileStatusDao.getAllReconcileStatusList(filters, pagination);

        assertThat(response.getCount()).isEqualTo(2);
        @SuppressWarnings("unchecked")
        List<ReconcileStatus> data = (List<ReconcileStatus>) response.getData();
        assertThat(data).hasSize(2);
        assertThat(data).allMatch(status -> status.getBankAccount().getBankAccountId()
                .equals(bankAccount.getBankAccountId()));
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
        category.setTransactionCategoryName("Bank Category " + name);
        category.setTransactionCategoryCode("BANK-" + name);
        category.setChartOfAccount(chartOfAccount);
        category.setDefaltFlag('N');
        category.setSelectableFlag(true);
        category.setEditableFlag(true);
        category.setIsMigratedRecord(false);
        category.setCreatedDate(LocalDateTime.now());
        entityManager.persist(category);

        BankAccount account = new BankAccount();
        account.setBankAccountName(name);
        account.setPersonalCorporateAccountInd('C');
        account.setIsprimaryAccountFlag(Boolean.TRUE);
        account.setOpeningBalance(BigDecimal.ZERO);
        account.setCurrentBalance(BigDecimal.ZERO);
        account.setCreatedBy(1);
        account.setCreatedDate(LocalDateTime.now().minusMonths(1));
        account.setOpeningDate(LocalDateTime.now().minusMonths(1));
        account.setTransactionCategory(category);
        entityManager.persist(account);
        entityManager.flush();
        return account;
    }

    private ReconcileStatus persistReconcileStatus(BankAccount account,
                                                   LocalDateTime start,
                                                   LocalDateTime end,
                                                   BigDecimal closingBalance,
                                                   boolean deleteFlag) {
        ReconcileStatus status = new ReconcileStatus();
        status.setBankAccount(account);
        status.setReconciledStartDate(start);
        status.setReconciledDate(end);
        status.setClosingBalance(closingBalance);
        status.setReconciledDuration("Custom");
        status.setCreatedBy(1);
        status.setCreatedDate(LocalDateTime.now().minusDays(1));
        status.setDeleteFlag(deleteFlag);
        entityManager.persist(status);
        entityManager.flush();
        return status;
    }
}

