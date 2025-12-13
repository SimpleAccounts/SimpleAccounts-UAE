package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.dao.JournalDao;
import com.simpleaccounts.dao.JournalLineItemDao;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.rest.financialreport.VatReportFilingRepository;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.DateUtils;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class InvoiceDaoImplTest {

    @Mock
    private EntityManager entityManager;
    @Mock
    private DateUtils dateUtil;
    @Mock
    private DateFormatUtil dateFormatUtil;
    @Mock
    private DatatableSortingFilterConstant datatableUtil;
    @Mock
    private JournalDao journalDao;
    @Mock
    private JournalLineItemDao journalLineItemDao;
    @Mock
    private TransactionCategoryService transactionCategoryService;
    @Mock
    private VatReportFilingRepository vatReportFilingRepository;
    @Mock
    private UserService userService;

    @InjectMocks
    private InvoiceDaoImpl invoiceDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(invoiceDao, "entityManager", entityManager);
    }

    @Test
    void shouldReturnLastInvoice() {
        Integer invoiceType = 1;
        Invoice expectedInvoice = new Invoice();
        expectedInvoice.setId(100);

        TypedQuery<Invoice> query = mock(TypedQuery.class);
        when(entityManager.createNamedQuery("lastInvoice", Invoice.class)).thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.singletonList(expectedInvoice));

        Invoice result = invoiceDao.getLastInvoice(invoiceType);

        assertThat(result).isEqualTo(expectedInvoice);
        verify(query).setParameter("type", invoiceType);
        verify(query).setMaxResults(1);
    }

    @Test
    void shouldReturnNullIfNoLastInvoice() {
        Integer invoiceType = 1;
        TypedQuery<Invoice> query = mock(TypedQuery.class);
        when(entityManager.createNamedQuery("lastInvoice", Invoice.class)).thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.emptyList());

        Invoice result = invoiceDao.getLastInvoice(invoiceType);

        assertThat(result).isNull();
    }

    @Test
    void shouldReturnActiveInvoicesByDateRange() {
        Date startDate = new Date();
        Date endDate = new Date();
        LocalDateTime localStartDate = LocalDateTime.now();
        LocalDateTime localEndDate = LocalDateTime.now();

        // Mock DateUtil behavior
        when(dateUtil.get(startDate)).thenReturn(localStartDate);
        when(dateUtil.get(endDate)).thenReturn(localEndDate);

        Invoice invoice = new Invoice();
        TypedQuery<Invoice> query = mock(TypedQuery.class);
        when(entityManager.createNamedQuery("activeInvoicesByDateRange", Invoice.class)).thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.singletonList(invoice));

        List<Invoice> result = invoiceDao.getInvoiceList(startDate, endDate);

        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(invoice);

        verify(query).setParameter(eq(CommonColumnConstants.START_DATE), any(LocalDate.class));
        verify(query).setParameter(eq(CommonColumnConstants.END_DATE), any(LocalDate.class));
    }
}
