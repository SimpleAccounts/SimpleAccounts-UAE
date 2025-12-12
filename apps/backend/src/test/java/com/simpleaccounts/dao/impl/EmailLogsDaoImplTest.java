package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.entity.EmailLogs;
import com.simpleaccounts.rest.PaginationModel;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmailLogsDaoImpl Unit Tests")
class EmailLogsDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<EmailLogs> typedQuery;

    @Mock private CriteriaBuilder criteriaBuilder;
    @Mock private CriteriaQuery<EmailLogs> criteriaQuery;
    @Mock private Root<EmailLogs> root;

    @InjectMocks
    private EmailLogsDaoImpl emailLogsDao;

    private EmailLogs testEmailLog;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailLogsDao, "entityManager", entityManager);
        testEmailLog = createTestEmailLog();
    }

    @Test
    @DisplayName("Should find email log by primary key when it exists")
    void findByPKReturnsEmailLogWhenExists() {
        // Arrange
        Integer id = 1;
        when(entityManager.find(EmailLogs.class, id)).thenReturn(testEmailLog);

        // Act
        EmailLogs result = emailLogsDao.findByPK(id);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(testEmailLog.getId());
        assertThat(result.getEmailFrom()).isEqualTo("sender@example.com");
        assertThat(result.getEmailTo()).isEqualTo("recipient@example.com");
        verify(entityManager).find(EmailLogs.class, id);
    }

    @Test
    @DisplayName("Should return null when email log does not exist")
    void findByPKReturnsNullWhenNotExists() {
        // Arrange
        Integer id = 999;
        when(entityManager.find(EmailLogs.class, id)).thenReturn(null);

        // Act
        EmailLogs result = emailLogsDao.findByPK(id);

        // Assert
        assertThat(result).isNull();
        verify(entityManager).find(EmailLogs.class, id);
    }

    @Test
    @DisplayName("Should persist new email log successfully")
    void persistSavesNewEmailLog() {
        // Arrange
        EmailLogs newEmailLog = new EmailLogs();
        newEmailLog.setEmailFrom("new@example.com");
        newEmailLog.setEmailTo("target@example.com");
        newEmailLog.setModuleName("Invoice");

        // Act
        emailLogsDao.persist(newEmailLog);

        // Assert
        verify(entityManager).persist(newEmailLog);
        verify(entityManager).flush();
        verify(entityManager).refresh(newEmailLog);
    }

    @Test
    @DisplayName("Should update existing email log successfully")
    void updateModifiesExistingEmailLog() {
        // Arrange
        testEmailLog.setModuleName("Payment");
        when(entityManager.merge(testEmailLog)).thenReturn(testEmailLog);

        // Act
        EmailLogs result = emailLogsDao.update(testEmailLog);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getModuleName()).isEqualTo("Payment");
        verify(entityManager).merge(testEmailLog);
    }

    @Test
    @DisplayName("Should delete email log when it is managed")
    void deleteRemovesEmailLogWhenManaged() {
        // Arrange
        when(entityManager.contains(testEmailLog)).thenReturn(true);

        // Act
        emailLogsDao.delete(testEmailLog);

        // Assert
        verify(entityManager).contains(testEmailLog);
        verify(entityManager).remove(testEmailLog);
    }

    @Test
    @DisplayName("Should merge and delete email log when it is not managed")
    void deleteRemovesEmailLogWhenNotManaged() {
        // Arrange
        when(entityManager.contains(testEmailLog)).thenReturn(false);
        when(entityManager.merge(testEmailLog)).thenReturn(testEmailLog);

        // Act
        emailLogsDao.delete(testEmailLog);

        // Assert
        verify(entityManager).contains(testEmailLog);
        verify(entityManager).merge(testEmailLog);
        verify(entityManager).remove(testEmailLog);
    }

    @Test
    @DisplayName("Should execute query with filters and return results")
    void executeQueryWithFiltersReturnsResults() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        List<EmailLogs> expectedResults = Arrays.asList(testEmailLog);

        when(entityManager.createQuery(anyString(), eq(EmailLogs.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        // Act
        List<EmailLogs> results = emailLogsDao.executeQuery(filters);

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        assertThat(results.get(0)).isEqualTo(testEmailLog);
        verify(typedQuery).setParameter("deleteFlag", false);
    }

    @Test
    @DisplayName("Should execute query with pagination and return results")
    void executeQueryWithPaginationReturnsResults() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("moduleName").condition("=:moduleName").value("Invoice").build()
        );
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);
        paginationModel.setSortingCol("emailDate");
        paginationModel.setOrder("DESC");

        List<EmailLogs> expectedResults = Arrays.asList(testEmailLog);

        when(entityManager.createQuery(anyString(), eq(EmailLogs.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.setFirstResult(0)).thenReturn(typedQuery);
        when(typedQuery.setMaxResults(10)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        // Act
        List<EmailLogs> results = emailLogsDao.executeQuery(filters, paginationModel);

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
            DbFilter.builder().dbCoulmnName("moduleName").condition("=:moduleName").value("Invoice").build()
        );
        List<EmailLogs> results = Arrays.asList(testEmailLog, createTestEmailLog(), createTestEmailLog());

        when(entityManager.createQuery(anyString(), eq(EmailLogs.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(results);

        // Act
        Integer count = emailLogsDao.getResultCount(filters);

        // Assert
        assertThat(count).isEqualTo(3);
    }

    @Test
    @DisplayName("Should return zero count when no results found")
    void getResultCountReturnsZeroWhenNoResults() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );

        when(entityManager.createQuery(anyString(), eq(EmailLogs.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        Integer count = emailLogsDao.getResultCount(filters);

        // Assert
        assertThat(count).isEqualTo(0);
    }

    @Test
    @DisplayName("Should execute named query and return results")
    void executeNamedQueryReturnsResults() {
        // Arrange
        String namedQuery = "EmailLogs.findAll";
        List<EmailLogs> expectedResults = Arrays.asList(testEmailLog);

        when(entityManager.createNamedQuery(namedQuery, EmailLogs.class)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        // Act
        List<EmailLogs> results = emailLogsDao.executeNamedQuery(namedQuery);

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        verify(entityManager).createNamedQuery(namedQuery, EmailLogs.class);
    }

    @Test
    @DisplayName("Should return entity manager instance")
    void getEntityManagerReturnsInstance() {
        // Act
        EntityManager result = emailLogsDao.getEntityManager();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(entityManager);
    }

    @Test
    @DisplayName("Should dump all email logs data")
    void dumpDataReturnsAllEmailLogs() {
        // Arrange
        List<EmailLogs> expectedResults = Arrays.asList(testEmailLog, createTestEmailLog());

        when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        when(criteriaBuilder.createQuery(EmailLogs.class)).thenReturn(criteriaQuery);
        when(criteriaQuery.from(EmailLogs.class)).thenReturn(root);
        when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        // Act
        List<EmailLogs> results = emailLogsDao.dumpData();

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(2);
    }

    @Test
    @DisplayName("Should handle empty filters in executeQuery")
    void executeQueryWithEmptyFiltersReturnsAllResults() {
        // Arrange
        List<DbFilter> emptyFilters = new ArrayList<>();
        List<EmailLogs> expectedResults = Arrays.asList(testEmailLog);

        when(entityManager.createQuery(anyString(), eq(EmailLogs.class))).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        // Act
        List<EmailLogs> results = emailLogsDao.executeQuery(emptyFilters);

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
    }

    @Test
    @DisplayName("Should handle null value in filter")
    void executeQuerySkipsNullValueFilters() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("emailFrom").condition("=:emailFrom").value(null).build()
        );

        when(entityManager.createQuery(anyString(), eq(EmailLogs.class))).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<EmailLogs> results = emailLogsDao.executeQuery(filters);

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
            DbFilter.builder().dbCoulmnName("moduleName").condition("=:moduleName").value("Invoice").build()
        );

        when(entityManager.createQuery(anyString(), eq(EmailLogs.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmailLog));

        // Act
        List<EmailLogs> results = emailLogsDao.executeQuery(filters);

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        verify(typedQuery).setParameter("deleteFlag", false);
        verify(typedQuery).setParameter("moduleName", "Invoice");
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

        when(entityManager.createQuery(anyString(), eq(EmailLogs.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmailLog));

        // Act
        List<EmailLogs> results = emailLogsDao.executeQuery(filters, paginationModel);

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

        when(entityManager.createQuery(anyString(), eq(EmailLogs.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmailLog));

        // Act
        List<EmailLogs> results = emailLogsDao.executeQuery(filters, null);

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

        when(entityManager.createQuery(anyString(), eq(EmailLogs.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(null);

        // Act
        Integer count = emailLogsDao.getResultCount(filters);

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
        paginationModel.setSortingCol("emailDate");
        paginationModel.setOrder("DESC");

        when(entityManager.createQuery(anyString(), eq(EmailLogs.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmailLog));

        // Act
        List<EmailLogs> results = emailLogsDao.executeQuery(filters, paginationModel);

        // Assert
        assertThat(results).isNotNull();
        verify(entityManager).createQuery(anyString(), eq(EmailLogs.class));
    }

    @Test
    @DisplayName("Should filter email logs by module name")
    void executeQueryFiltersByModuleName() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("moduleName").condition("=:moduleName").value("Invoice").build()
        );

        when(entityManager.createQuery(anyString(), eq(EmailLogs.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmailLog));

        // Act
        List<EmailLogs> results = emailLogsDao.executeQuery(filters);

        // Assert
        assertThat(results).isNotNull();
        assertThat(results.get(0).getModuleName()).isEqualTo("Invoice");
        verify(typedQuery).setParameter("moduleName", "Invoice");
    }

    @Test
    @DisplayName("Should filter email logs by email sender")
    void executeQueryFiltersByEmailFrom() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("emailFrom").condition("=:emailFrom").value("sender@example.com").build()
        );

        when(entityManager.createQuery(anyString(), eq(EmailLogs.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmailLog));

        // Act
        List<EmailLogs> results = emailLogsDao.executeQuery(filters);

        // Assert
        assertThat(results).isNotNull();
        assertThat(results.get(0).getEmailFrom()).isEqualTo("sender@example.com");
        verify(typedQuery).setParameter("emailFrom", "sender@example.com");
    }

    @Test
    @DisplayName("Should filter email logs by email recipient")
    void executeQueryFiltersByEmailTo() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("emailTo").condition("=:emailTo").value("recipient@example.com").build()
        );

        when(entityManager.createQuery(anyString(), eq(EmailLogs.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmailLog));

        // Act
        List<EmailLogs> results = emailLogsDao.executeQuery(filters);

        // Assert
        assertThat(results).isNotNull();
        assertThat(results.get(0).getEmailTo()).isEqualTo("recipient@example.com");
        verify(typedQuery).setParameter("emailTo", "recipient@example.com");
    }

    @Test
    @DisplayName("Should skip invalid sorting column with spaces")
    void executeQuerySkipsInvalidSortingColumn() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("email Date");  // Contains space - should be skipped

        when(entityManager.createQuery(anyString(), eq(EmailLogs.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmailLog));

        // Act
        List<EmailLogs> results = emailLogsDao.executeQuery(filters, paginationModel);

        // Assert
        assertThat(results).isNotNull();
    }

    private EmailLogs createTestEmailLog() {
        EmailLogs emailLog = new EmailLogs();
        emailLog.setId(1);
        emailLog.setEmailFrom("sender@example.com");
        emailLog.setEmailTo("recipient@example.com");
        emailLog.setModuleName("Invoice");
        emailLog.setBaseUrl("https://example.com");
        emailLog.setEmailDate(LocalDateTime.now());
        emailLog.setCreatedBy(1);
        emailLog.setCreatedDate(LocalDateTime.now());
        emailLog.setDeleteFlag(false);
        emailLog.setVersionNumber(1);
        return emailLog;
    }
}
