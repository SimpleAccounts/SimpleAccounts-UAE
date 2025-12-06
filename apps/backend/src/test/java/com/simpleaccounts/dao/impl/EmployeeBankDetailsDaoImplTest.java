package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.entity.EmployeeBankDetails;
import com.simpleaccounts.rest.PaginationModel;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmployeeBankDetailsDaoImpl Unit Tests")
class EmployeeBankDetailsDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<EmployeeBankDetails> typedQuery;

    @InjectMocks
    private EmployeeBankDetailsDaoImpl employeeBankDetailsDao;

    private EmployeeBankDetails testEmployeeBankDetails;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(employeeBankDetailsDao, "entityManager", entityManager);
        testEmployeeBankDetails = createTestEmployeeBankDetails();
    }

    @Test
    @DisplayName("Should find employee bank details by primary key when it exists")
    void findByPKReturnsEmployeeBankDetailsWhenExists() {
        // Arrange
        Integer id = 1;
        when(entityManager.find(EmployeeBankDetails.class, id)).thenReturn(testEmployeeBankDetails);

        // Act
        EmployeeBankDetails result = employeeBankDetailsDao.findByPK(id);

        // Assert
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
        // Arrange
        Integer id = 999;
        when(entityManager.find(EmployeeBankDetails.class, id)).thenReturn(null);

        // Act
        EmployeeBankDetails result = employeeBankDetailsDao.findByPK(id);

        // Assert
        assertThat(result).isNull();
        verify(entityManager).find(EmployeeBankDetails.class, id);
    }

    @Test
    @DisplayName("Should persist new employee bank details successfully")
    void persistSavesNewEmployeeBankDetails() {
        // Arrange
        EmployeeBankDetails newBankDetails = new EmployeeBankDetails();
        newBankDetails.setAccountHolderName("Jane Smith");
        newBankDetails.setAccountNumber("9876543210");
        newBankDetails.setIban("AE070339876543210123456");

        // Act
        employeeBankDetailsDao.persist(newBankDetails);

        // Assert
        verify(entityManager).persist(newBankDetails);
        verify(entityManager).flush();
        verify(entityManager).refresh(newBankDetails);
    }

    @Test
    @DisplayName("Should update existing employee bank details successfully")
    void updateModifiesExistingEmployeeBankDetails() {
        // Arrange
        testEmployeeBankDetails.setAccountHolderName("John Updated");
        when(entityManager.merge(testEmployeeBankDetails)).thenReturn(testEmployeeBankDetails);

        // Act
        EmployeeBankDetails result = employeeBankDetailsDao.update(testEmployeeBankDetails);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getAccountHolderName()).isEqualTo("John Updated");
        verify(entityManager).merge(testEmployeeBankDetails);
    }

    @Test
    @DisplayName("Should delete employee bank details when it is managed")
    void deleteRemovesEmployeeBankDetailsWhenManaged() {
        // Arrange
        when(entityManager.contains(testEmployeeBankDetails)).thenReturn(true);

        // Act
        employeeBankDetailsDao.delete(testEmployeeBankDetails);

        // Assert
        verify(entityManager).contains(testEmployeeBankDetails);
        verify(entityManager).remove(testEmployeeBankDetails);
    }

    @Test
    @DisplayName("Should merge and delete employee bank details when it is not managed")
    void deleteRemovesEmployeeBankDetailsWhenNotManaged() {
        // Arrange
        when(entityManager.contains(testEmployeeBankDetails)).thenReturn(false);
        when(entityManager.merge(testEmployeeBankDetails)).thenReturn(testEmployeeBankDetails);

        // Act
        employeeBankDetailsDao.delete(testEmployeeBankDetails);

        // Assert
        verify(entityManager).contains(testEmployeeBankDetails);
        verify(entityManager).merge(testEmployeeBankDetails);
        verify(entityManager).remove(testEmployeeBankDetails);
    }

    @Test
    @DisplayName("Should execute query with filters and return results")
    void executeQueryWithFiltersReturnsResults() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        List<EmployeeBankDetails> expectedResults = Arrays.asList(testEmployeeBankDetails);

        when(entityManager.createQuery(anyString(), eq(EmployeeBankDetails.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        // Act
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters);

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        assertThat(results.get(0)).isEqualTo(testEmployeeBankDetails);
        verify(typedQuery).setParameter("deleteFlag", false);
    }

    @Test
    @DisplayName("Should execute query with pagination and return results")
    void executeQueryWithPaginationReturnsResults() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("isActive").condition("=:isActive").value(true).build()
        );
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);
        paginationModel.setSortingCol("accountHolderName");
        paginationModel.setOrder("ASC");

        List<EmployeeBankDetails> expectedResults = Arrays.asList(testEmployeeBankDetails);

        when(entityManager.createQuery(anyString(), eq(EmployeeBankDetails.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.setFirstResult(0)).thenReturn(typedQuery);
        when(typedQuery.setMaxResults(10)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        // Act
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters, paginationModel);

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        verify(typedQuery).setFirstResult(0);
        verify(typedQuery).setMaxResults(10);
    }

    @Test
    @DisplayName("Should return result count with filters")
    void getResultCountReturnsCorrectCount() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("isActive").condition("=:isActive").value(true).build()
        );
        List<EmployeeBankDetails> results = Arrays.asList(testEmployeeBankDetails, createTestEmployeeBankDetails());

        when(entityManager.createQuery(anyString(), eq(EmployeeBankDetails.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(results);

        // Act
        Integer count = employeeBankDetailsDao.getResultCount(filters);

        // Assert
        assertThat(count).isEqualTo(2);
    }

    @Test
    @DisplayName("Should return zero count when no results found")
    void getResultCountReturnsZeroWhenNoResults() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );

        when(entityManager.createQuery(anyString(), eq(EmployeeBankDetails.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        Integer count = employeeBankDetailsDao.getResultCount(filters);

        // Assert
        assertThat(count).isEqualTo(0);
    }

    @Test
    @DisplayName("Should execute named query and return results")
    void executeNamedQueryReturnsResults() {
        // Arrange
        String namedQuery = "EmployeeBankDetails.findAll";
        List<EmployeeBankDetails> expectedResults = Arrays.asList(testEmployeeBankDetails);

        when(entityManager.createNamedQuery(namedQuery, EmployeeBankDetails.class)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        // Act
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeNamedQuery(namedQuery);

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        verify(entityManager).createNamedQuery(namedQuery, EmployeeBankDetails.class);
    }

    @Test
    @DisplayName("Should return entity manager instance")
    void getEntityManagerReturnsInstance() {
        // Act
        EntityManager result = employeeBankDetailsDao.getEntityManager();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(entityManager);
    }

    @Test
    @DisplayName("Should dump all employee bank details data")
    void dumpDataReturnsAllEmployeeBankDetails() {
        // Arrange
        List<EmployeeBankDetails> expectedResults = Arrays.asList(testEmployeeBankDetails, createTestEmployeeBankDetails());

        when(entityManager.createQuery(anyString())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        // Act
        List<EmployeeBankDetails> results = employeeBankDetailsDao.dumpData();

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(2);
    }

    @Test
    @DisplayName("Should handle empty filters in executeQuery")
    void executeQueryWithEmptyFiltersReturnsAllResults() {
        // Arrange
        List<DbFilter> emptyFilters = new ArrayList<>();
        List<EmployeeBankDetails> expectedResults = Arrays.asList(testEmployeeBankDetails);

        when(entityManager.createQuery(anyString(), eq(EmployeeBankDetails.class))).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        // Act
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(emptyFilters);

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
    }

    @Test
    @DisplayName("Should handle null value in filter")
    void executeQuerySkipsNullValueFilters() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("accountNumber").condition("=:accountNumber").value(null).build()
        );

        when(entityManager.createQuery(anyString(), eq(EmployeeBankDetails.class))).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters);

        // Assert
        assertThat(results).isNotNull();
        verify(typedQuery, times(0)).setParameter(anyString(), any());
    }

    @Test
    @DisplayName("Should handle multiple filters correctly")
    void executeQueryWithMultipleFilters() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build(),
            DbFilter.builder().dbCoulmnName("isActive").condition("=:isActive").value(true).build()
        );

        when(entityManager.createQuery(anyString(), eq(EmployeeBankDetails.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmployeeBankDetails));

        // Act
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters);

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        verify(typedQuery).setParameter("deleteFlag", false);
        verify(typedQuery).setParameter("isActive", true);
    }

    @Test
    @DisplayName("Should handle pagination disabled flag")
    void executeQueryWithPaginationDisabled() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPaginationDisable(true);

        when(entityManager.createQuery(anyString(), eq(EmployeeBankDetails.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmployeeBankDetails));

        // Act
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters, paginationModel);

        // Assert
        assertThat(results).isNotNull();
        verify(typedQuery, times(0)).setFirstResult(any(Integer.class));
        verify(typedQuery, times(0)).setMaxResults(any(Integer.class));
    }

    @Test
    @DisplayName("Should handle null pagination model")
    void executeQueryWithNullPaginationModel() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );

        when(entityManager.createQuery(anyString(), eq(EmployeeBankDetails.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmployeeBankDetails));

        // Act
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters, null);

        // Assert
        assertThat(results).isNotNull();
        verify(typedQuery, times(0)).setFirstResult(any(Integer.class));
    }

    @Test
    @DisplayName("Should return correct count when result list is null")
    void getResultCountReturnsZeroWhenResultIsNull() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );

        when(entityManager.createQuery(anyString(), eq(EmployeeBankDetails.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(null);

        // Act
        Integer count = employeeBankDetailsDao.getResultCount(filters);

        // Assert
        assertThat(count).isEqualTo(0);
    }

    @Test
    @DisplayName("Should handle sorting column in pagination")
    void executeQueryWithSortingColumn() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("bankName");
        paginationModel.setOrder("DESC");

        when(entityManager.createQuery(anyString(), eq(EmployeeBankDetails.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmployeeBankDetails));

        // Act
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters, paginationModel);

        // Assert
        assertThat(results).isNotNull();
        verify(entityManager).createQuery(anyString(), eq(EmployeeBankDetails.class));
    }

    @Test
    @DisplayName("Should filter by bank ID")
    void executeQueryFiltersByBankId() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("bankId").condition("=:bankId").value(1).build()
        );

        when(entityManager.createQuery(anyString(), eq(EmployeeBankDetails.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmployeeBankDetails));

        // Act
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters);

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        verify(typedQuery).setParameter("bankId", 1);
    }

    @Test
    @DisplayName("Should filter by active status")
    void executeQueryFiltersByActiveStatus() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("isActive").condition("=:isActive").value(true).build()
        );

        when(entityManager.createQuery(anyString(), eq(EmployeeBankDetails.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmployeeBankDetails));

        // Act
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters);

        // Assert
        assertThat(results).isNotNull();
        assertThat(results.get(0).getIsActive()).isTrue();
        verify(typedQuery).setParameter("isActive", true);
    }

    @Test
    @DisplayName("Should filter by IBAN")
    void executeQueryFiltersByIban() {
        // Arrange
        String iban = "AE070331234567890123456";
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("iban").condition("=:iban").value(iban).build()
        );

        when(entityManager.createQuery(anyString(), eq(EmployeeBankDetails.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmployeeBankDetails));

        // Act
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters);

        // Assert
        assertThat(results).isNotNull();
        assertThat(results.get(0).getIban()).isEqualTo(iban);
        verify(typedQuery).setParameter("iban", iban);
    }

    @Test
    @DisplayName("Should skip invalid sorting column with spaces")
    void executeQuerySkipsInvalidSortingColumn() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("account Number");  // Contains space - should be skipped

        when(entityManager.createQuery(anyString(), eq(EmployeeBankDetails.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmployeeBankDetails));

        // Act
        List<EmployeeBankDetails> results = employeeBankDetailsDao.executeQuery(filters, paginationModel);

        // Assert
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
