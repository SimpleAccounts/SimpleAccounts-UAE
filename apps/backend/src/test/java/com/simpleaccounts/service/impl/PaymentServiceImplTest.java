package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.PayMode;
import com.simpleaccounts.constant.dbfilter.PaymentFilterEnum;
import com.simpleaccounts.dao.AbstractFilter;
import com.simpleaccounts.dao.ActivityDao;
import com.simpleaccounts.dao.PaymentDao;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.entity.Payment;
import com.simpleaccounts.entity.Project;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.exceptions.ServiceException;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentServiceImpl Tests")
class PaymentServiceImplTest {

    @Mock
    private PaymentDao paymentDao;

    @Mock
    private ActivityDao activityDao;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private Payment testPayment;
    private PaginationModel paginationModel;
    private Map<PaymentFilterEnum, Object> filterMap;

    @BeforeEach
    void setUp() {
        testPayment = createTestPayment();
        paginationModel = createPaginationModel();
        filterMap = new HashMap<>();
    }

    // ==================== Helper Methods ====================

    private Payment createTestPayment() {
        Payment payment = new Payment();
        payment.setPaymentId(1);
        payment.setPaymentNo("PAY-001");
        payment.setPaymentDate(LocalDate.now());
        payment.setInvoiceAmount(new BigDecimal("1000.00"));
        payment.setDescription("Test Payment");
        payment.setReferenceNo("REF-001");
        payment.setNotes("Test notes");
        payment.setPayMode(PayMode.CASH);
        payment.setDeleteFlag(false);
        payment.setCreatedBy(1);
        payment.setCreatedDate(LocalDateTime.now());
        payment.setVersionNumber(1);
        return payment;
    }

    private Payment createPaymentWithDetails() {
        Payment payment = createTestPayment();

        Contact supplier = new Contact();
        supplier.setContactId(10);
        payment.setSupplier(supplier);

        Currency currency = new Currency();
        currency.setCurrencyCode("AED");
        payment.setCurrency(currency);

        Project project = new Project();
        project.setProjectId(5);
        payment.setProject(project);

        BankAccount bankAccount = new BankAccount();
        bankAccount.setBankId(3);
        payment.setBankAccount(bankAccount);

        Invoice invoice = new Invoice();
        invoice.setInvoiceId(20);
        payment.setInvoice(invoice);

        TransactionCategory transactionCategory = new TransactionCategory();
        transactionCategory.setTransactionCategoryId(15);
        payment.setDepositeToTransactionCategory(transactionCategory);

        return payment;
    }

    private PaginationModel createPaginationModel() {
        PaginationModel model = new PaginationModel();
        model.setPageNo(0);
        model.setPageSize(10);
        model.setOrder("DESC");
        model.setSortingCol("paymentId");
        model.setPaginationDisable(false);
        return model;
    }

    // ==================== GetDao Tests ====================

    @Nested
    @DisplayName("getDao() Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return PaymentDao instance")
        void shouldReturnPaymentDao() {
            assertThat(paymentService.getDao()).isEqualTo(paymentDao);
        }

        @Test
        @DisplayName("Should return non-null DAO")
        void shouldReturnNonNullDao() {
            assertThat(paymentService.getDao()).isNotNull();
        }
    }

    // ==================== GetPayments Tests ====================

    @Nested
    @DisplayName("getPayments() Tests")
    class GetPaymentsTests {

        @Test
        @DisplayName("Should get payments with filters and pagination")
        void shouldGetPaymentsWithFiltersAndPagination() {
            filterMap.put(PaymentFilterEnum.DELETE_FLAG, false);
            List<Payment> payments = Arrays.asList(testPayment);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(1, payments);

            when(paymentDao.getPayments(filterMap, paginationModel)).thenReturn(expectedResponse);

            PaginationResponseModel result = paymentService.getPayments(filterMap, paginationModel);

            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(1);
            assertThat(result.getData()).isEqualTo(payments);
            verify(paymentDao, times(1)).getPayments(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should get payments with empty filter map")
        void shouldGetPaymentsWithEmptyFilterMap() {
            Map<PaymentFilterEnum, Object> emptyFilter = new HashMap<>();
            List<Payment> payments = Arrays.asList(testPayment);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(1, payments);

            when(paymentDao.getPayments(emptyFilter, paginationModel)).thenReturn(expectedResponse);

            PaginationResponseModel result = paymentService.getPayments(emptyFilter, paginationModel);

            assertThat(result).isNotNull();
            verify(paymentDao, times(1)).getPayments(emptyFilter, paginationModel);
        }

        @Test
        @DisplayName("Should get payments with supplier filter")
        void shouldGetPaymentsWithSupplierFilter() {
            filterMap.put(PaymentFilterEnum.SUPPLIER, 10);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(0, Collections.emptyList());

            when(paymentDao.getPayments(filterMap, paginationModel)).thenReturn(expectedResponse);

            PaginationResponseModel result = paymentService.getPayments(filterMap, paginationModel);

            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(0);
            verify(paymentDao, times(1)).getPayments(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should get payments with invoice amount filter")
        void shouldGetPaymentsWithInvoiceAmountFilter() {
            filterMap.put(PaymentFilterEnum.INVOICE_AMOUNT, new BigDecimal("1000.00"));
            List<Payment> payments = Arrays.asList(testPayment);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(1, payments);

            when(paymentDao.getPayments(filterMap, paginationModel)).thenReturn(expectedResponse);

            PaginationResponseModel result = paymentService.getPayments(filterMap, paginationModel);

            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(1);
            verify(paymentDao, times(1)).getPayments(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should get payments with payment date filter")
        void shouldGetPaymentsWithPaymentDateFilter() {
            filterMap.put(PaymentFilterEnum.PAYMENT_DATE, LocalDate.now());
            List<Payment> payments = Arrays.asList(testPayment);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(1, payments);

            when(paymentDao.getPayments(filterMap, paginationModel)).thenReturn(expectedResponse);

            PaginationResponseModel result = paymentService.getPayments(filterMap, paginationModel);

            assertThat(result).isNotNull();
            verify(paymentDao, times(1)).getPayments(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should get payments with user ID filter")
        void shouldGetPaymentsWithUserIdFilter() {
            filterMap.put(PaymentFilterEnum.USER_ID, 1);
            List<Payment> payments = Arrays.asList(testPayment);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(1, payments);

            when(paymentDao.getPayments(filterMap, paginationModel)).thenReturn(expectedResponse);

            PaginationResponseModel result = paymentService.getPayments(filterMap, paginationModel);

            assertThat(result).isNotNull();
            verify(paymentDao, times(1)).getPayments(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should get payments with multiple filters")
        void shouldGetPaymentsWithMultipleFilters() {
            filterMap.put(PaymentFilterEnum.SUPPLIER, 10);
            filterMap.put(PaymentFilterEnum.DELETE_FLAG, false);
            filterMap.put(PaymentFilterEnum.PAYMENT_DATE, LocalDate.now());
            List<Payment> payments = Arrays.asList(testPayment);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(1, payments);

            when(paymentDao.getPayments(filterMap, paginationModel)).thenReturn(expectedResponse);

            PaginationResponseModel result = paymentService.getPayments(filterMap, paginationModel);

            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(1);
            verify(paymentDao, times(1)).getPayments(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should return empty list when no payments found")
        void shouldReturnEmptyListWhenNoPaymentsFound() {
            filterMap.put(PaymentFilterEnum.DELETE_FLAG, false);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(0, Collections.emptyList());

            when(paymentDao.getPayments(filterMap, paginationModel)).thenReturn(expectedResponse);

            PaginationResponseModel result = paymentService.getPayments(filterMap, paginationModel);

            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(0);
            assertThat(result.getData()).isEqualTo(Collections.emptyList());
        }

        @Test
        @DisplayName("Should get payments with custom page size")
        void shouldGetPaymentsWithCustomPageSize() {
            paginationModel.setPageSize(50);
            filterMap.put(PaymentFilterEnum.DELETE_FLAG, false);
            List<Payment> payments = Arrays.asList(testPayment);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(1, payments);

            when(paymentDao.getPayments(filterMap, paginationModel)).thenReturn(expectedResponse);

            PaginationResponseModel result = paymentService.getPayments(filterMap, paginationModel);

            assertThat(result).isNotNull();
            verify(paymentDao, times(1)).getPayments(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should get payments with null pagination model")
        void shouldGetPaymentsWithNullPaginationModel() {
            filterMap.put(PaymentFilterEnum.DELETE_FLAG, false);
            List<Payment> payments = Arrays.asList(testPayment);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(1, payments);

            when(paymentDao.getPayments(filterMap, null)).thenReturn(expectedResponse);

            PaginationResponseModel result = paymentService.getPayments(filterMap, null);

            assertThat(result).isNotNull();
            verify(paymentDao, times(1)).getPayments(filterMap, null);
        }
    }

    // ==================== DeleteByIds Tests ====================

    @Nested
    @DisplayName("deleteByIds() Tests")
    class DeleteByIdsTests {

        @Test
        @DisplayName("Should delete single payment by ID")
        void shouldDeleteSinglePaymentById() {
            List<Integer> ids = Collections.singletonList(1);
            doNothing().when(paymentDao).deleteByIds(ids);

            paymentService.deleteByIds(ids);

            verify(paymentDao, times(1)).deleteByIds(ids);
        }

        @Test
        @DisplayName("Should delete multiple payments by IDs")
        void shouldDeleteMultiplePaymentsByIds() {
            List<Integer> ids = Arrays.asList(1, 2, 3, 4, 5);
            doNothing().when(paymentDao).deleteByIds(ids);

            paymentService.deleteByIds(ids);

            verify(paymentDao, times(1)).deleteByIds(ids);
        }

        @Test
        @DisplayName("Should handle empty ID list")
        void shouldHandleEmptyIdList() {
            List<Integer> ids = Collections.emptyList();
            doNothing().when(paymentDao).deleteByIds(ids);

            paymentService.deleteByIds(ids);

            verify(paymentDao, times(1)).deleteByIds(ids);
        }

        @Test
        @DisplayName("Should delete payments with null values in list")
        void shouldDeletePaymentsWithNullValuesInList() {
            List<Integer> ids = Arrays.asList(1, null, 3);
            doNothing().when(paymentDao).deleteByIds(ids);

            paymentService.deleteByIds(ids);

            verify(paymentDao, times(1)).deleteByIds(ids);
        }

        @Test
        @DisplayName("Should delete large number of payments")
        void shouldDeleteLargeNumberOfPayments() {
            List<Integer> ids = new ArrayList<>();
            for (int i = 1; i <= 100; i++) {
                ids.add(i);
            }
            doNothing().when(paymentDao).deleteByIds(ids);

            paymentService.deleteByIds(ids);

            verify(paymentDao, times(1)).deleteByIds(ids);
        }
    }

    // ==================== FindByPK Tests (Inherited) ====================

    @Nested
    @DisplayName("findByPK() Tests")
    class FindByPKTests {

        @Test
        @DisplayName("Should find payment by primary key")
        void shouldFindPaymentByPrimaryKey() {
            when(paymentDao.findByPK(1)).thenReturn(testPayment);

            Payment result = paymentService.findByPK(1);

            assertThat(result).isNotNull();
            assertThat(result.getPaymentId()).isEqualTo(1);
            assertThat(result.getPaymentNo()).isEqualTo("PAY-001");
            verify(paymentDao, times(1)).findByPK(1);
        }

        @Test
        @DisplayName("Should throw exception when payment not found")
        void shouldThrowExceptionWhenPaymentNotFound() {
            when(paymentDao.findByPK(999)).thenReturn(null);

            assertThatThrownBy(() -> paymentService.findByPK(999))
                    .isInstanceOf(ServiceException.class);

            verify(paymentDao, times(1)).findByPK(999);
        }

        @Test
        @DisplayName("Should find payment with all details")
        void shouldFindPaymentWithAllDetails() {
            Payment paymentWithDetails = createPaymentWithDetails();
            when(paymentDao.findByPK(1)).thenReturn(paymentWithDetails);

            Payment result = paymentService.findByPK(1);

            assertThat(result).isNotNull();
            assertThat(result.getSupplier()).isNotNull();
            assertThat(result.getCurrency()).isNotNull();
            assertThat(result.getProject()).isNotNull();
            assertThat(result.getBankAccount()).isNotNull();
            assertThat(result.getInvoice()).isNotNull();
        }

        @Test
        @DisplayName("Should handle null primary key")
        void shouldHandleNullPrimaryKey() {
            when(paymentDao.findByPK(null)).thenReturn(null);

            assertThatThrownBy(() -> paymentService.findByPK(null))
                    .isInstanceOf(ServiceException.class);
        }
    }

    // ==================== Persist Tests (Inherited) ====================

    @Nested
    @DisplayName("persist() Tests")
    class PersistTests {

        @Test
        @DisplayName("Should persist new payment")
        void shouldPersistNewPayment() {
            when(paymentDao.persist(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            paymentService.persist(testPayment);

            verify(paymentDao, times(1)).persist(testPayment);
        }

        @Test
        @DisplayName("Should persist payment with null primary key")
        void shouldPersistPaymentWithNullPrimaryKey() {
            when(paymentDao.findByPK(null)).thenReturn(null);
            when(paymentDao.persist(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            paymentService.persist(testPayment, null);

            verify(paymentDao, times(1)).persist(testPayment);
        }

        @Test
        @DisplayName("Should throw exception when payment already exists")
        void shouldThrowExceptionWhenPaymentAlreadyExists() {
            when(paymentDao.findByPK(1)).thenReturn(testPayment);

            assertThatThrownBy(() -> paymentService.persist(testPayment, 1))
                    .isInstanceOf(ServiceException.class);

            verify(paymentDao, never()).persist(any());
        }

        @Test
        @DisplayName("Should persist payment with complete details")
        void shouldPersistPaymentWithCompleteDetails() {
            Payment paymentWithDetails = createPaymentWithDetails();
            when(paymentDao.persist(paymentWithDetails)).thenReturn(paymentWithDetails);
            doNothing().when(activityDao).persist(any());

            paymentService.persist(paymentWithDetails);

            verify(paymentDao, times(1)).persist(paymentWithDetails);
        }

        @Test
        @DisplayName("Should persist payment and create activity log")
        void shouldPersistPaymentAndCreateActivityLog() {
            when(paymentDao.persist(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            paymentService.persist(testPayment);

            verify(paymentDao, times(1)).persist(testPayment);
            verify(activityDao, times(1)).persist(any());
        }
    }

    // ==================== Update Tests (Inherited) ====================

    @Nested
    @DisplayName("update() Tests")
    class UpdateTests {

        @Test
        @DisplayName("Should update existing payment")
        void shouldUpdateExistingPayment() {
            testPayment.setDescription("Updated Description");
            when(paymentDao.update(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            Payment result = paymentService.update(testPayment);

            assertThat(result).isNotNull();
            assertThat(result.getDescription()).isEqualTo("Updated Description");
            verify(paymentDao, times(1)).update(testPayment);
        }

        @Test
        @DisplayName("Should update payment with primary key")
        void shouldUpdatePaymentWithPrimaryKey() {
            testPayment.setInvoiceAmount(new BigDecimal("2000.00"));
            when(paymentDao.update(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            Payment result = paymentService.update(testPayment, 1);

            assertThat(result).isNotNull();
            assertThat(result.getInvoiceAmount()).isEqualTo(new BigDecimal("2000.00"));
            verify(paymentDao, times(1)).update(testPayment);
        }

        @Test
        @DisplayName("Should update payment and create activity log")
        void shouldUpdatePaymentAndCreateActivityLog() {
            when(paymentDao.update(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            paymentService.update(testPayment);

            verify(paymentDao, times(1)).update(testPayment);
            verify(activityDao, times(1)).persist(any());
        }

        @Test
        @DisplayName("Should update payment with null primary key")
        void shouldUpdatePaymentWithNullPrimaryKey() {
            when(paymentDao.update(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            Payment result = paymentService.update(testPayment, null);

            assertThat(result).isNotNull();
            verify(paymentDao, times(1)).update(testPayment);
        }

        @Test
        @DisplayName("Should update payment amount")
        void shouldUpdatePaymentAmount() {
            BigDecimal newAmount = new BigDecimal("5000.00");
            testPayment.setInvoiceAmount(newAmount);
            when(paymentDao.update(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            Payment result = paymentService.update(testPayment);

            assertThat(result.getInvoiceAmount()).isEqualTo(newAmount);
            verify(paymentDao, times(1)).update(testPayment);
        }

        @Test
        @DisplayName("Should update payment date")
        void shouldUpdatePaymentDate() {
            LocalDate newDate = LocalDate.now().plusDays(5);
            testPayment.setPaymentDate(newDate);
            when(paymentDao.update(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            Payment result = paymentService.update(testPayment);

            assertThat(result.getPaymentDate()).isEqualTo(newDate);
            verify(paymentDao, times(1)).update(testPayment);
        }
    }

    // ==================== Delete Tests (Inherited) ====================

    @Nested
    @DisplayName("delete() Tests")
    class DeleteTests {

        @Test
        @DisplayName("Should delete payment")
        void shouldDeletePayment() {
            doNothing().when(paymentDao).delete(testPayment);
            doNothing().when(activityDao).persist(any());

            paymentService.delete(testPayment);

            verify(paymentDao, times(1)).delete(testPayment);
        }

        @Test
        @DisplayName("Should delete payment with primary key")
        void shouldDeletePaymentWithPrimaryKey() {
            when(paymentDao.findByPK(1)).thenReturn(testPayment);
            doNothing().when(paymentDao).delete(testPayment);
            doNothing().when(activityDao).persist(any());

            paymentService.delete(testPayment, 1);

            verify(paymentDao, times(1)).findByPK(1);
            verify(paymentDao, times(1)).delete(testPayment);
        }

        @Test
        @DisplayName("Should throw exception when deleting non-existent payment")
        void shouldThrowExceptionWhenDeletingNonExistentPayment() {
            when(paymentDao.findByPK(999)).thenReturn(null);

            assertThatThrownBy(() -> paymentService.delete(testPayment, 999))
                    .isInstanceOf(ServiceException.class);

            verify(paymentDao, never()).delete(any());
        }

        @Test
        @DisplayName("Should delete payment and create activity log")
        void shouldDeletePaymentAndCreateActivityLog() {
            doNothing().when(paymentDao).delete(testPayment);
            doNothing().when(activityDao).persist(any());

            paymentService.delete(testPayment);

            verify(paymentDao, times(1)).delete(testPayment);
            verify(activityDao, times(1)).persist(any());
        }
    }

    // ==================== ExecuteNamedQuery Tests (Inherited) ====================

    @Nested
    @DisplayName("executeNamedQuery() Tests")
    class ExecuteNamedQueryTests {

        @Test
        @DisplayName("Should execute allPayments named query")
        void shouldExecuteAllPaymentsNamedQuery() {
            List<Payment> payments = Arrays.asList(testPayment);
            when(paymentDao.executeNamedQuery("allPayments")).thenReturn(payments);

            List<Payment> result = paymentService.executeNamedQuery("allPayments");

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            assertThat(result.get(0)).isEqualTo(testPayment);
            verify(paymentDao, times(1)).executeNamedQuery("allPayments");
        }

        @Test
        @DisplayName("Should execute getAmountByInvoiceId named query")
        void shouldExecuteGetAmountByInvoiceIdNamedQuery() {
            List<Payment> payments = Arrays.asList(testPayment);
            when(paymentDao.executeNamedQuery("getAmountByInvoiceId")).thenReturn(payments);

            List<Payment> result = paymentService.executeNamedQuery("getAmountByInvoiceId");

            assertThat(result).isNotNull();
            verify(paymentDao, times(1)).executeNamedQuery("getAmountByInvoiceId");
        }

        @Test
        @DisplayName("Should return empty list for named query with no results")
        void shouldReturnEmptyListForNamedQueryWithNoResults() {
            when(paymentDao.executeNamedQuery("allPayments")).thenReturn(Collections.emptyList());

            List<Payment> result = paymentService.executeNamedQuery("allPayments");

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
        }
    }

    // ==================== FindByAttributes Tests (Inherited) ====================

    @Nested
    @DisplayName("findByAttributes() Tests")
    class FindByAttributesTests {

        @Test
        @DisplayName("Should find payments by attributes")
        void shouldFindPaymentsByAttributes() {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("deleteFlag", false);
            List<Payment> payments = Arrays.asList(testPayment);
            when(paymentDao.findByAttributes(attributes)).thenReturn(payments);

            List<Payment> result = paymentService.findByAttributes(attributes);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            verify(paymentDao, times(1)).findByAttributes(attributes);
        }

        @Test
        @DisplayName("Should return empty list when attributes map is empty")
        void shouldReturnEmptyListWhenAttributesMapIsEmpty() {
            Map<String, Object> attributes = new HashMap<>();

            List<Payment> result = paymentService.findByAttributes(attributes);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(paymentDao, never()).findByAttributes(any());
        }

        @Test
        @DisplayName("Should return empty list when attributes map is null")
        void shouldReturnEmptyListWhenAttributesMapIsNull() {
            List<Payment> result = paymentService.findByAttributes(null);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(paymentDao, never()).findByAttributes(any());
        }

        @Test
        @DisplayName("Should find payments by payment number")
        void shouldFindPaymentsByPaymentNumber() {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("paymentNo", "PAY-001");
            List<Payment> payments = Arrays.asList(testPayment);
            when(paymentDao.findByAttributes(attributes)).thenReturn(payments);

            List<Payment> result = paymentService.findByAttributes(attributes);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            verify(paymentDao, times(1)).findByAttributes(attributes);
        }

        @Test
        @DisplayName("Should find payments by multiple attributes")
        void shouldFindPaymentsByMultipleAttributes() {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("deleteFlag", false);
            attributes.put("createdBy", 1);
            List<Payment> payments = Arrays.asList(testPayment);
            when(paymentDao.findByAttributes(attributes)).thenReturn(payments);

            List<Payment> result = paymentService.findByAttributes(attributes);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            verify(paymentDao, times(1)).findByAttributes(attributes);
        }
    }

    // ==================== Filter Tests (Inherited) ====================

    @Nested
    @DisplayName("filter() Tests")
    class FilterTests {

        @Test
        @DisplayName("Should filter payments with abstract filter")
        void shouldFilterPaymentsWithAbstractFilter() {
            AbstractFilter<Payment> filter = new AbstractFilter<Payment>() {};
            List<Payment> payments = Arrays.asList(testPayment);
            when(paymentDao.filter(filter)).thenReturn(payments);

            List<Payment> result = paymentService.filter(filter);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            verify(paymentDao, times(1)).filter(filter);
        }

        @Test
        @DisplayName("Should return empty list when filter is null")
        void shouldReturnEmptyListWhenFilterIsNull() {
            List<Payment> result = paymentService.filter(null);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(paymentDao, never()).filter(any());
        }

        @Test
        @DisplayName("Should return empty list when filter yields no results")
        void shouldReturnEmptyListWhenFilterYieldsNoResults() {
            AbstractFilter<Payment> filter = new AbstractFilter<Payment>() {};
            when(paymentDao.filter(filter)).thenReturn(Collections.emptyList());

            List<Payment> result = paymentService.filter(filter);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
        }
    }

    // ==================== Utility Methods Tests (Inherited) ====================

    @Nested
    @DisplayName("getFirstElement() Tests")
    class GetFirstElementTests {

        @Test
        @DisplayName("Should get first element from list")
        void shouldGetFirstElementFromList() {
            Payment payment2 = createTestPayment();
            payment2.setPaymentId(2);
            List<Payment> payments = Arrays.asList(testPayment, payment2);

            Payment result = paymentService.getFirstElement(payments);

            assertThat(result).isNotNull();
            assertThat(result.getPaymentId()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should return null when list is empty")
        void shouldReturnNullWhenListIsEmpty() {
            List<Payment> payments = Collections.emptyList();

            Payment result = paymentService.getFirstElement(payments);

            assertThat(result).isNull();
        }

        @Test
        @DisplayName("Should return null when list is null")
        void shouldReturnNullWhenListIsNull() {
            Payment result = paymentService.getFirstElement(null);

            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("getLastElement() Tests")
    class GetLastElementTests {

        @Test
        @DisplayName("Should get last element from list")
        void shouldGetLastElementFromList() {
            Payment payment2 = createTestPayment();
            payment2.setPaymentId(2);
            List<Payment> payments = Arrays.asList(testPayment, payment2);

            Payment result = paymentService.getLastElement(payments);

            assertThat(result).isNotNull();
            assertThat(result.getPaymentId()).isEqualTo(2);
        }

        @Test
        @DisplayName("Should return null when list is empty")
        void shouldReturnNullWhenListIsEmptyForLastElement() {
            List<Payment> payments = Collections.emptyList();

            Payment result = paymentService.getLastElement(payments);

            assertThat(result).isNull();
        }

        @Test
        @DisplayName("Should return null when list is null")
        void shouldReturnNullWhenListIsNullForLastElement() {
            Payment result = paymentService.getLastElement(null);

            assertThat(result).isNull();
        }

        @Test
        @DisplayName("Should return same element when list has single element")
        void shouldReturnSameElementWhenListHasSingleElement() {
            List<Payment> payments = Collections.singletonList(testPayment);

            Payment first = paymentService.getFirstElement(payments);
            Payment last = paymentService.getLastElement(payments);

            assertThat(first).isEqualTo(last);
            assertThat(first.getPaymentId()).isEqualTo(1);
        }
    }

    // ==================== Edge Cases and Null Handling Tests ====================

    @Nested
    @DisplayName("Edge Cases and Null Handling Tests")
    class EdgeCasesAndNullHandlingTests {

        @Test
        @DisplayName("Should handle payment with null invoice amount")
        void shouldHandlePaymentWithNullInvoiceAmount() {
            testPayment.setInvoiceAmount(null);
            when(paymentDao.persist(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            paymentService.persist(testPayment);

            verify(paymentDao, times(1)).persist(testPayment);
        }

        @Test
        @DisplayName("Should handle payment with null payment date")
        void shouldHandlePaymentWithNullPaymentDate() {
            testPayment.setPaymentDate(null);
            when(paymentDao.persist(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            paymentService.persist(testPayment);

            verify(paymentDao, times(1)).persist(testPayment);
        }

        @Test
        @DisplayName("Should handle payment with null description")
        void shouldHandlePaymentWithNullDescription() {
            testPayment.setDescription(null);
            when(paymentDao.update(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            Payment result = paymentService.update(testPayment);

            assertThat(result.getDescription()).isNull();
        }

        @Test
        @DisplayName("Should handle payment with zero amount")
        void shouldHandlePaymentWithZeroAmount() {
            testPayment.setInvoiceAmount(BigDecimal.ZERO);
            when(paymentDao.persist(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            paymentService.persist(testPayment);

            verify(paymentDao, times(1)).persist(testPayment);
        }

        @Test
        @DisplayName("Should handle payment with negative amount")
        void shouldHandlePaymentWithNegativeAmount() {
            testPayment.setInvoiceAmount(new BigDecimal("-100.00"));
            when(paymentDao.persist(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            paymentService.persist(testPayment);

            verify(paymentDao, times(1)).persist(testPayment);
        }

        @Test
        @DisplayName("Should handle payment with very large amount")
        void shouldHandlePaymentWithVeryLargeAmount() {
            testPayment.setInvoiceAmount(new BigDecimal("999999999999.99"));
            when(paymentDao.persist(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            paymentService.persist(testPayment);

            verify(paymentDao, times(1)).persist(testPayment);
        }

        @Test
        @DisplayName("Should handle payment with null pay mode")
        void shouldHandlePaymentWithNullPayMode() {
            testPayment.setPayMode(null);
            when(paymentDao.persist(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            paymentService.persist(testPayment);

            verify(paymentDao, times(1)).persist(testPayment);
        }

        @Test
        @DisplayName("Should handle payment with all optional fields null")
        void shouldHandlePaymentWithAllOptionalFieldsNull() {
            Payment minimalPayment = new Payment();
            minimalPayment.setPaymentId(100);
            minimalPayment.setDeleteFlag(false);
            minimalPayment.setCreatedBy(1);
            minimalPayment.setVersionNumber(1);

            when(paymentDao.persist(minimalPayment)).thenReturn(minimalPayment);
            doNothing().when(activityDao).persist(any());

            paymentService.persist(minimalPayment);

            verify(paymentDao, times(1)).persist(minimalPayment);
        }

        @Test
        @DisplayName("Should handle empty reference number")
        void shouldHandleEmptyReferenceNumber() {
            testPayment.setReferenceNo("");
            when(paymentDao.update(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            Payment result = paymentService.update(testPayment);

            assertThat(result.getReferenceNo()).isEmpty();
        }

        @Test
        @DisplayName("Should handle empty notes")
        void shouldHandleEmptyNotes() {
            testPayment.setNotes("");
            when(paymentDao.update(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            Payment result = paymentService.update(testPayment);

            assertThat(result.getNotes()).isEmpty();
        }
    }

    // ==================== PayMode Tests ====================

    @Nested
    @DisplayName("PayMode Tests")
    class PayModeTests {

        @Test
        @DisplayName("Should handle payment with CASH pay mode")
        void shouldHandlePaymentWithCashPayMode() {
            testPayment.setPayMode(PayMode.CASH);
            when(paymentDao.persist(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            paymentService.persist(testPayment);

            verify(paymentDao, times(1)).persist(testPayment);
        }

        @Test
        @DisplayName("Should handle payment with CHEQUE pay mode")
        void shouldHandlePaymentWithChequePayMode() {
            testPayment.setPayMode(PayMode.CHEQUE);
            when(paymentDao.persist(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            paymentService.persist(testPayment);

            verify(paymentDao, times(1)).persist(testPayment);
        }

        @Test
        @DisplayName("Should handle payment with CREDIT_CARD pay mode")
        void shouldHandlePaymentWithCreditCardPayMode() {
            testPayment.setPayMode(PayMode.CREDIT_CARD);
            when(paymentDao.persist(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());

            paymentService.persist(testPayment);

            verify(paymentDao, times(1)).persist(testPayment);
        }
    }

    // ==================== Integration-like Tests ====================

    @Nested
    @DisplayName("Integration-like Tests")
    class IntegrationLikeTests {

        @Test
        @DisplayName("Should create, update, and delete payment in sequence")
        void shouldCreateUpdateAndDeletePaymentInSequence() {
            // Create
            when(paymentDao.persist(testPayment)).thenReturn(testPayment);
            doNothing().when(activityDao).persist(any());
            paymentService.persist(testPayment);
            verify(paymentDao, times(1)).persist(testPayment);

            // Update
            testPayment.setDescription("Updated");
            when(paymentDao.update(testPayment)).thenReturn(testPayment);
            Payment updated = paymentService.update(testPayment);
            assertThat(updated.getDescription()).isEqualTo("Updated");

            // Delete
            doNothing().when(paymentDao).delete(testPayment);
            paymentService.delete(testPayment);
            verify(paymentDao, times(1)).delete(testPayment);
        }

        @Test
        @DisplayName("Should handle multiple payment operations")
        void shouldHandleMultiplePaymentOperations() {
            Payment payment1 = createTestPayment();
            Payment payment2 = createTestPayment();
            payment2.setPaymentId(2);
            payment2.setPaymentNo("PAY-002");

            when(paymentDao.persist(payment1)).thenReturn(payment1);
            when(paymentDao.persist(payment2)).thenReturn(payment2);
            doNothing().when(activityDao).persist(any());

            paymentService.persist(payment1);
            paymentService.persist(payment2);

            verify(paymentDao, times(1)).persist(payment1);
            verify(paymentDao, times(1)).persist(payment2);
        }

        @Test
        @DisplayName("Should search payments and then delete by IDs")
        void shouldSearchPaymentsAndThenDeleteByIds() {
            filterMap.put(PaymentFilterEnum.DELETE_FLAG, false);
            List<Payment> payments = Arrays.asList(testPayment);
            PaginationResponseModel searchResponse = new PaginationResponseModel(1, payments);

            when(paymentDao.getPayments(filterMap, paginationModel)).thenReturn(searchResponse);
            PaginationResponseModel result = paymentService.getPayments(filterMap, paginationModel);
            assertThat(result.getCount()).isEqualTo(1);

            List<Integer> ids = Collections.singletonList(1);
            doNothing().when(paymentDao).deleteByIds(ids);
            paymentService.deleteByIds(ids);

            verify(paymentDao, times(1)).getPayments(filterMap, paginationModel);
            verify(paymentDao, times(1)).deleteByIds(ids);
        }
    }
}
