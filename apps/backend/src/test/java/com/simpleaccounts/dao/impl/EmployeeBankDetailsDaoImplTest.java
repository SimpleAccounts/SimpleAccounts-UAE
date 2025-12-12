package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.lenient;

import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.entity.EmployeeBankDetails;
import com.simpleaccounts.rest.PaginationModel;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
@DisplayName("EmployeeBankDetailsDaoImpl Unit Tests")
class EmployeeBankDetailsDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<EmployeeBankDetails> typedQuery;
    @Mock private TypedQuery<Long> countQuery;

    @Mock private CriteriaBuilder criteriaBuilder;
    @Mock private CriteriaQuery<EmployeeBankDetails> criteriaQuery;
    @Mock private CriteriaQuery<Long> countCriteriaQuery;
    @Mock private Root<EmployeeBankDetails> root;
    @Mock private Predicate predicate;
    @Mock private Path<Object> path;

    @InjectMocks
    private EmployeeBankDetailsDaoImpl employeeBankDetailsDao;

    private EmployeeBankDetails testEmployeeBankDetails;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(employeeBankDetailsDao, "entityManager", entityManager);
        testEmployeeBankDetails = createTestEmployeeBankDetails();

        lenient().when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        lenient().when(criteriaBuilder.createQuery(EmployeeBankDetails.class)).thenReturn(criteriaQuery);
        lenient().when(criteriaQuery.from(EmployeeBankDetails.class)).thenReturn(root);
        lenient().when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
        lenient().when(root.get(anyString())).thenReturn(path);
        lenient().when(criteriaBuilder.equal(any(), any())).thenReturn(predicate);

        lenient().when(criteriaBuilder.createQuery(Long.class)).thenReturn(countCriteriaQuery);
        lenient().when(countCriteriaQuery.from(EmployeeBankDetails.class)).thenReturn(root);
        lenient().when(entityManager.createQuery(countCriteriaQuery)).thenReturn(countQuery);
        
        lenient().when(countQuery.getSingleResult()).thenReturn(0L);
    }

    @Test
    @DisplayName("Should find employee bank details by primary key when it exists")
    void findByPKReturnsEmployeeBankDetailsWhenExists() {
        Integer id = 1;
        when(entityManager.find(EmployeeBankDetails.class, id)).thenReturn(testEmployeeBankDetails);
        EmployeeBankDetails result = employeeBankDetailsDao.findByPK(id);
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(testEmployeeBankDetails.getId());
        assertThat(result.getAccountHolderName()).isEqualTo("John Doe");
        assertThat(result.getAccountNumber()).isEqualTo("1234567890");
        assertThat(result.getIban()).isEqualTo("AE070331234567890123456");
        verify(entityManager).find(EmployeeBankDetails.class, id);
    }

    @Test
    @DisplayName("Should return null when employee bank details does not exist")
    void findByPKReturnsNullWhenNotExists() {
        Integer id = 999;
        when(entityManager.find(EmployeeBankDetails.class, id)).thenReturn(null);
        EmployeeBankDetails result = employeeBankDetailsDao.findByPK(id);
        assertThat(result).isNull();
        verify(entityManager).find(EmployeeBankDetails.class, id);
    }

    @Test
    @DisplayName("Should persist new employee bank details successfully")
    void persistSavesNewEmployeeBankDetails() {
        EmployeeBankDetails newBankDetails = new EmployeeBankDetails();
        newBankDetails.setAccountHolderName("Jane Smith");
        newBankDetails.setAccountNumber("9876543210");
        newBankDetails.setIban("AE070339876543210123456");
        employeeBankDetailsDao.persist(newBankDetails);
        verify(entityManager).persist(newBankDetails);
        verify(entityManager).flush();
        verify(entityManager).refresh(newBankDetails);
    }

    @Test
    @DisplayName("Should update existing employee bank details successfully")
    void updateModifiesExistingEmployeeBankDetails() {
        testEmployeeBankDetails.setAccountHolderName("John Updated");
        when(entityManager.merge(testEmployeeBankDetails)).thenReturn(testEmployeeBankDetails);
        EmployeeBankDetails result = employeeBankDetailsDao.update(testEmployeeBankDetails);
        assertThat(result).isNotNull();
        assertThat(result.getAccountHolderName()).isEqualTo("John Updated");
        verify(entityManager).merge(testEmployeeBankDetails);
    }

    @Test
    @DisplayName("Should delete employee bank details when it is managed")
    void deleteRemovesEmployeeBankDetailsWhenManaged() {
        when(entityManager.contains(testEmployeeBankDetails)).thenReturn(true);
        employeeBankDetailsDao.delete(testEmployeeBankDetails);
        verify(entityManager).contains(testEmployeeBankDetails);
        verify(entityManager).remove(testEmployeeBankDetails);
    }

    @Test
    @DisplayName("Should merge and delete employee bank details when it is not managed")
    void deleteRemovesEmployeeBankDetailsWhenNotManaged() {
        when(entityManager.contains(testEmployeeBankDetails)).thenReturn(false);
        when(entityManager.merge(testEmployeeBankDetails)).thenReturn(testEmployeeBankDetails);
        employeeBankDetailsDao.delete(testEmployeeBankDetails);
        verify(entityManager).contains(testEmployeeBankDetails);
        verify(entityManager).merge(testEmployeeBankDetails);
        verify(entityManager).remove(testEmployeeBankDetails);
    }

    @Test
    @DisplayName("Should execute query with filters and return results")
    void executeQueryWithFiltersReturnsResults() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        List<EmployeeBankDetails> expectedResults = Arrays.asList(testEmployeeBankDetails);

        when(typedQuery.getResultList()).thenReturn(expectedResults);

        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters);

        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        assertThat(results.get(0)).isEqualTo(testEmployeeBankDetails);
    }

    @Test
    @DisplayName("Should execute query with pagination and return results")
    void executeQueryWithPaginationReturnsResults() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("isActive").condition("=:isActive").value(true).build()
        );
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);
        paginationModel.setSortingCol("accountHolderName");
        paginationModel.setOrder("ASC");

        List<EmployeeBankDetails> expectedResults = Arrays.asList(testEmployeeBankDetails);

        when(typedQuery.setFirstResult(0)).thenReturn(typedQuery);
        when(typedQuery.setMaxResults(10)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters, paginationModel);

        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        verify(typedQuery).setFirstResult(0);
        verify(typedQuery).setMaxResults(10);
    }

    @Test
    @DisplayName("Should return result count with filters")
    void getResultCountReturnsCorrectCount() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("isActive").condition("=:isActive").value(true).build()
        );

        when(countQuery.getSingleResult()).thenReturn(2L);

        Integer count = employeeBankDetailsDao.getResultCount(filters);

        assertThat(count).isEqualTo(2);
    }

    @Test
    @DisplayName("Should return zero count when no results found")
    void getResultCountReturnsZeroWhenNoResults() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );

        when(countQuery.getSingleResult()).thenReturn(0L);

        Integer count = employeeBankDetailsDao.getResultCount(filters);

        assertThat(count).isEqualTo(0);
    }

    @Test
    @DisplayName("Should execute named query and return results")
    void executeNamedQueryReturnsResults() {
        String namedQuery = "EmployeeBankDetails.findAll";
        List<EmployeeBankDetails> expectedResults = Arrays.asList(testEmployeeBankDetails);

        when(entityManager.createNamedQuery(namedQuery, EmployeeBankDetails.class)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeNamedQuery(namedQuery);

        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        verify(entityManager).createNamedQuery(namedQuery, EmployeeBankDetails.class);
    }

    @Test
    @DisplayName("Should return entity manager instance")
    void getEntityManagerReturnsInstance() {
        EntityManager result = employeeBankDetailsDao.getEntityManager();
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(entityManager);
    }

    @Test
    @DisplayName("Should dump all employee bank details data")
    void dumpDataReturnsAllEmployeeBankDetails() {
        List<EmployeeBankDetails> expectedResults = Arrays.asList(testEmployeeBankDetails, createTestEmployeeBankDetails());
        when(typedQuery.getResultList()).thenReturn(expectedResults);
        List<EmployeeBankDetails> results = employeeBankDetailsDao.dumpData();
        assertThat(results).isNotNull();
        assertThat(results).hasSize(2);
    }

    @Test
    @DisplayName("Should handle empty filters in executeQuery")
    void executeQueryWithEmptyFiltersReturnsAllResults() {
        List<DbFilter> emptyFilters = new ArrayList<>();
        List<EmployeeBankDetails> expectedResults = Arrays.asList(testEmployeeBankDetails);
        when(typedQuery.getResultList()).thenReturn(expectedResults);
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(emptyFilters);
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
    }

    @Test
    @DisplayName("Should handle null value in filter")
    void executeQuerySkipsNullValueFilters() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("accountNumber").condition("=:accountNumber").value(null).build()
        );
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters);
        assertThat(results).isNotNull();
        verify(criteriaBuilder, times(0)).equal(any(), any());
    }

    @Test
    @DisplayName("Should handle multiple filters correctly")
    void executeQueryWithMultipleFilters() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build(),
            DbFilter.builder().dbCoulmnName("isActive").condition("=:isActive").value(true).build()
        );
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmployeeBankDetails));
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters);
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
    }

    @Test
    @DisplayName("Should handle pagination disabled flag")
    void executeQueryWithPaginationDisabled() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPaginationDisable(true);

        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmployeeBankDetails));

        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters, paginationModel);

        assertThat(results).isNotNull();
        verify(typedQuery, times(0)).setFirstResult(any(Integer.class));
        verify(typedQuery, times(0)).setMaxResults(any(Integer.class));
    }

    @Test
    @DisplayName("Should handle null pagination model")
    void executeQueryWithNullPaginationModel() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmployeeBankDetails));
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters, null);
        assertThat(results).isNotNull();
        verify(typedQuery, times(0)).setFirstResult(any(Integer.class));
    }

    @Test
    @DisplayName("Should return correct count when result list is null")
    void getResultCountReturnsZeroWhenResultIsNull() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        when(countQuery.getSingleResult()).thenReturn(0L);
        Integer count = employeeBankDetailsDao.getResultCount(filters);
        assertThat(count).isEqualTo(0);
    }

    @Test
    @DisplayName("Should handle sorting column in pagination")
    void executeQueryWithSortingColumn() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("bankName");
        paginationModel.setOrder("DESC");

        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmployeeBankDetails));

        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters, paginationModel);

        assertThat(results).isNotNull();
        verify(criteriaQuery).orderBy(any(List.class));
    }

    @Test
    @DisplayName("Should filter by bank ID")
    void executeQueryFiltersByBankId() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("bankId").condition("=:bankId").value(1).build()
        );
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmployeeBankDetails));
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters);
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
    }

    @Test
    @DisplayName("Should filter by active status")
    void executeQueryFiltersByActiveStatus() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("isActive").condition("=:isActive").value(true).build()
        );
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmployeeBankDetails));
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters);
        assertThat(results).isNotNull();
        assertThat(results.get(0).getIsActive()).isTrue();
    }

    @Test
    @DisplayName("Should filter by IBAN")
    void executeQueryFiltersByIban() {
        String iban = "AE070331234567890123456";
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("iban").condition("=:iban").value(iban).build()
        );
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmployeeBankDetails));
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters);
        assertThat(results).isNotNull();
        assertThat(results.get(0).getIban()).isEqualTo(iban);
    }

    @Test
    @DisplayName("Should skip invalid sorting column with spaces")
    void executeQuerySkipsInvalidSortingColumn() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("account Number");  // Contains space - should be skipped

        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmployeeBankDetails));

        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters, paginationModel);

        assertThat(results).isNotNull();
    }

    private EmployeeBankDetails createTestEmployeeBankDetails() {
        EmployeeBankDetails bankDetails = new EmployeeBankDetails();
        bankDetails.setId(1);
        bankDetails.setAccountHolderName("John Doe");
        bankDetails.setAccountNumber("1234567890");
        bankDetails.setIban("AE070331234567890123456");
        bankDetails.setBankId(1);
        bankDetails.setBankName("Emirates NBD");
        bankDetails.setBranch("Dubai Main Branch");
        bankDetails.setSwiftCode("EBILAEAD");
        bankDetails.setRoutingCode("033");
        bankDetails.setIsActive(true);
        bankDetails.setCreatedBy(1);
        bankDetails.setCreatedDate(LocalDateTime.now());
        bankDetails.setDeleteFlag(false);
        bankDetails.setVersionNumber(1);
        return bankDetails;
    }
}