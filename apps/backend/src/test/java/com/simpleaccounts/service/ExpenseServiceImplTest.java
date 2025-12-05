package com.simpleaccounts.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.dao.CompanyDao;
import com.simpleaccounts.dao.ExpenseDao;
import com.simpleaccounts.dao.ProjectDao;
import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.service.impl.ExpenseServiceImpl;
import com.simpleaccounts.service.report.model.BankAccountTransactionReportModel;
import com.simpleaccounts.utils.ChartUtil;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceImplTest {

    @Mock
    private ExpenseDao expenseDao;
    @Mock
    private ProjectDao projectDao;
    @Mock
    private CompanyDao companyDao;
    @Mock
    private ChartUtil chartUtil;

    @Mock
    private TransactionExpensesService transactionExpensesService;

    @InjectMocks
    private ExpenseServiceImpl expenseService;

    @Test
    void shouldDelegateUnmappedExpensesToDaoWithPostedStatus() {
        Expense expense = new Expense();
        BigDecimal amount = new BigDecimal("250.00");
        when(expenseDao.getExpensesToMatch(eq(42), any(), eq(amount)))
                .thenReturn(Collections.singletonList(expense));

        List<Expense> result = expenseService.getUnMappedExpenses(42, amount);

        ArgumentCaptor<List<Integer>> statusCaptor = ArgumentCaptor.forClass(List.class);
        verify(expenseDao).getExpensesToMatch(eq(42), statusCaptor.capture(), eq(amount));
        assertThat(statusCaptor.getValue())
                .containsExactly(CommonStatusEnum.POST.getValue());
        assertThat(result).containsExactly(expense);
    }

    @Test
    void shouldConvertExpenseRowsIntoBankAccountReportModelsWithDebitFlag() {
        Date start = new Date();
        Date end = new Date();
        List<Object[]> rows = Collections.singletonList(new Object[] { "row" });
        BankAccountTransactionReportModel model = new BankAccountTransactionReportModel();
        model.setCredit(true);
        List<BankAccountTransactionReportModel> converted = Collections.singletonList(model);

        when(expenseDao.getExpenses(start, end)).thenReturn(rows);
        when(chartUtil.convertToTransactionReportModel(rows)).thenReturn(converted);

        List<BankAccountTransactionReportModel> result = expenseService.getExpensesForReport(start, end);

        verify(expenseDao, times(1)).getExpenses(start, end);
        verify(chartUtil, times(1)).convertToTransactionReportModel(rows);
        assertThat(result).isSameAs(converted);
        assertThat(result.get(0).isCredit()).isFalse();
    }

    @Test
    void shouldReturnEmptyListWhenChartUtilHasNoRows() {
        when(expenseDao.getExpenses(any(), any())).thenReturn(Collections.emptyList());
        when(chartUtil.convertToTransactionReportModel(Collections.emptyList())).thenReturn(null);

        List<BankAccountTransactionReportModel> result =
                expenseService.getExpensesForReport(new Date(), new Date());

        assertThat(result).isEmpty();
    }
}




