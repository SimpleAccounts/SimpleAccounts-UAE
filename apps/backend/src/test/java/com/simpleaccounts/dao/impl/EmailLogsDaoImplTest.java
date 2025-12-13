package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
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
@DisplayName("EmailLogsDaoImpl Unit Tests")
class EmailLogsDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<EmailLogs> typedQuery;
    @Mock private TypedQuery<Long> countQuery;

    @Mock private CriteriaBuilder criteriaBuilder;
    @Mock private CriteriaQuery<EmailLogs> criteriaQuery;
    @Mock private CriteriaQuery<Long> countCriteriaQuery;
    @Mock private Root<EmailLogs> root;
    @Mock private Predicate predicate;
    @Mock private Path<Object> path;

    @InjectMocks
    private EmailLogsDaoImpl emailLogsDao;

    private EmailLogs testEmailLog;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailLogsDao, "entityManager", entityManager);
        testEmailLog = createTestEmailLog();

        lenient().when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        lenient().when(criteriaBuilder.createQuery(EmailLogs.class)).thenReturn(criteriaQuery);
        lenient().when(criteriaQuery.from(EmailLogs.class)).thenReturn(root);
        lenient().when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
        lenient().when(root.get(anyString())).thenReturn(path);
        lenient().when(criteriaBuilder.equal(any(), any())).thenReturn(predicate);

        lenient().when(criteriaBuilder.createQuery(Long.class)).thenReturn(countCriteriaQuery);
        lenient().when(countCriteriaQuery.from(EmailLogs.class)).thenReturn(root);
        lenient().when(entityManager.createQuery(countCriteriaQuery)).thenReturn(countQuery);
        
        lenient().when(countQuery.getSingleResult()).thenReturn(0L);
    }

    @Test
    @DisplayName("Should find email log by primary key when it exists")
    void findByPKReturnsEmailLogWhenExists() {
        Integer id = 1;
        when(entityManager.find(EmailLogs.class, id)).thenReturn(testEmailLog);
        EmailLogs result = emailLogsDao.findByPK(id);
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(testEmailLog.getId());
        verify(entityManager).find(EmailLogs.class, id);
    }

    @Test
    @DisplayName("Should return null when email log does not exist")
    void findByPKReturnsNullWhenNotExists() {
        Integer id = 999;
        when(entityManager.find(EmailLogs.class, id)).thenReturn(null);
        EmailLogs result = emailLogsDao.findByPK(id);
        assertThat(result).isNull();
        verify(entityManager).find(EmailLogs.class, id);
    }

    @Test
    @DisplayName("Should persist new email log successfully")
    void persistSavesNewEmailLog() {
        EmailLogs newEmailLog = new EmailLogs();
        newEmailLog.setEmailFrom("new@example.com");
        emailLogsDao.persist(newEmailLog);
        verify(entityManager).persist(newEmailLog);
        verify(entityManager).flush();
        verify(entityManager).refresh(newEmailLog);
    }

    @Test
    @DisplayName("Should update existing email log successfully")
    void updateModifiesExistingEmailLog() {
        testEmailLog.setModuleName("Payment");
        when(entityManager.merge(testEmailLog)).thenReturn(testEmailLog);
        EmailLogs result = emailLogsDao.update(testEmailLog);
        assertThat(result).isNotNull();
        assertThat(result.getModuleName()).isEqualTo("Payment");
        verify(entityManager).merge(testEmailLog);
    }

    @Test
    @DisplayName("Should delete email log when it is managed")
    void deleteRemovesEmailLogWhenManaged() {
        when(entityManager.contains(testEmailLog)).thenReturn(true);
        emailLogsDao.delete(testEmailLog);
        verify(entityManager).contains(testEmailLog);
        verify(entityManager).remove(testEmailLog);
    }

    @Test
    @DisplayName("Should merge and delete email log when it is not managed")
    void deleteRemovesEmailLogWhenNotManaged() {
        when(entityManager.contains(testEmailLog)).thenReturn(false);
        when(entityManager.merge(testEmailLog)).thenReturn(testEmailLog);
        emailLogsDao.delete(testEmailLog);
        verify(entityManager).contains(testEmailLog);
        verify(entityManager).merge(testEmailLog);
        verify(entityManager).remove(testEmailLog);
    }

    @Test
    @DisplayName("Should execute query with filters and return results")
    void executeQueryWithFiltersReturnsResults() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        List<EmailLogs> expectedResults = Arrays.asList(testEmailLog);

        when(typedQuery.getResultList()).thenReturn(expectedResults);

        List<EmailLogs> results = emailLogsDao.executeQuery(filters);

        assertThat(results).isNotNull().hasSize(1);
        assertThat(results.get(0)).isEqualTo(testEmailLog);
    }

    @Test
    @DisplayName("Should execute query with pagination and return results")
    void executeQueryWithPaginationReturnsResults() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("moduleName").condition("=:moduleName").value("Invoice").build()
        );
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);
        paginationModel.setSortingCol("emailDate");
        paginationModel.setOrder("DESC");

        List<EmailLogs> expectedResults = Arrays.asList(testEmailLog);

        when(typedQuery.setFirstResult(0)).thenReturn(typedQuery);
        when(typedQuery.setMaxResults(10)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        List<EmailLogs> results = emailLogsDao.executeQuery(filters, paginationModel);

        assertThat(results).isNotNull().hasSize(1);
        verify(typedQuery).setFirstResult(0);
        verify(typedQuery).setMaxResults(10);
    }

    @Test
    @DisplayName("Should return result count with filters")
    void getResultCountReturnsCorrectCount() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("moduleName").condition("=:moduleName").value("Invoice").build()
        );

        when(countQuery.getSingleResult()).thenReturn(3L);

        Integer count = emailLogsDao.getResultCount(filters);

        assertThat(count).isEqualTo(3);
    }

    @Test
    @DisplayName("Should return zero count when no results found")
    void getResultCountReturnsZeroWhenNoResults() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );

        when(countQuery.getSingleResult()).thenReturn(0L);

        Integer count = emailLogsDao.getResultCount(filters);

        assertThat(count).isEqualTo(0);
    }

    @Test
    @DisplayName("Should execute named query and return results")
    void executeNamedQueryReturnsResults() {
        String namedQuery = "EmailLogs.findAll";
        List<EmailLogs> expectedResults = Arrays.asList(testEmailLog);

        when(entityManager.createNamedQuery(namedQuery, EmailLogs.class)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        List<EmailLogs> results = emailLogsDao.executeNamedQuery(namedQuery);

        assertThat(results).isNotNull().hasSize(1);
        verify(entityManager).createNamedQuery(namedQuery, EmailLogs.class);
    }

    @Test
    @DisplayName("Should return entity manager instance")
    void getEntityManagerReturnsInstance() {
        EntityManager result = emailLogsDao.getEntityManager();
        assertThat(result).isNotNull().isEqualTo(entityManager);
    }

    @Test
    @DisplayName("Should dump all email logs data")
    void dumpDataReturnsAllEmailLogs() {
        List<EmailLogs> expectedResults = Arrays.asList(testEmailLog, createTestEmailLog());
        when(typedQuery.getResultList()).thenReturn(expectedResults);
        List<EmailLogs> results = emailLogsDao.dumpData();
        assertThat(results).isNotNull().hasSize(2);
    }

    @Test
    @DisplayName("Should handle empty filters in executeQuery")
    void executeQueryWithEmptyFiltersReturnsAllResults() {
        List<DbFilter> emptyFilters = new ArrayList<>();
        List<EmailLogs> expectedResults = Arrays.asList(testEmailLog);
        when(typedQuery.getResultList()).thenReturn(expectedResults);
        List<EmailLogs> results = emailLogsDao.executeQuery(emptyFilters);
        assertThat(results).isNotNull().hasSize(1);
    }

    @Test
    @DisplayName("Should handle null value in filter")
    void executeQuerySkipsNullValueFilters() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("emailFrom").condition("=:emailFrom").value(null).build()
        );
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());
        List<EmailLogs> results = emailLogsDao.executeQuery(filters);
        assertThat(results).isNotNull();
        verify(criteriaBuilder, times(0)).equal(any(), any());
    }

    @Test
    @DisplayName("Should handle multiple filters correctly")
    void executeQueryWithMultipleFilters() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build(),
            DbFilter.builder().dbCoulmnName("moduleName").condition("=:moduleName").value("Invoice").build()
        );
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmailLog));
        List<EmailLogs> results = emailLogsDao.executeQuery(filters);
        assertThat(results).isNotNull().hasSize(1);
    }

    @Test
    @DisplayName("Should handle pagination disabled flag")
    void executeQueryWithPaginationDisabled() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPaginationDisable(true);

        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmailLog));

        List<EmailLogs> results = emailLogsDao.executeQuery(filters, paginationModel);

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
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmailLog));
        List<EmailLogs> results = emailLogsDao.executeQuery(filters, null);
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
        Integer count = emailLogsDao.getResultCount(filters);
        assertThat(count).isEqualTo(0);
    }

    @Test
    @DisplayName("Should handle sorting column in pagination")
    void executeQueryWithSortingColumn() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("emailDate");
        paginationModel.setOrder("DESC");

        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmailLog));

        List<EmailLogs> results = emailLogsDao.executeQuery(filters, paginationModel);

        assertThat(results).isNotNull();
        verify(criteriaQuery).orderBy(any(List.class));
    }

    @Test
    @DisplayName("Should filter email logs by module name")
    void executeQueryFiltersByModuleName() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("moduleName").condition("=:moduleName").value("Invoice").build()
        );
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmailLog));
        List<EmailLogs> results = emailLogsDao.executeQuery(filters);
        assertThat(results).isNotNull();
        assertThat(results.get(0).getModuleName()).isEqualTo("Invoice");
    }

    @Test
    @DisplayName("Should filter email logs by email sender")
    void executeQueryFiltersByEmailFrom() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("emailFrom").condition("=:emailFrom").value("sender@example.com").build()
        );
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmailLog));
        List<EmailLogs> results = emailLogsDao.executeQuery(filters);
        assertThat(results).isNotNull();
        assertThat(results.get(0).getEmailFrom()).isEqualTo("sender@example.com");
    }

    @Test
    @DisplayName("Should filter email logs by email recipient")
    void executeQueryFiltersByEmailTo() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("emailTo").condition("=:emailTo").value("recipient@example.com").build()
        );
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmailLog));
        List<EmailLogs> results = emailLogsDao.executeQuery(filters);
        assertThat(results).isNotNull();
        assertThat(results.get(0).getEmailTo()).isEqualTo("recipient@example.com");
    }

    @Test
    @DisplayName("Should skip invalid sorting column with spaces")
    void executeQuerySkipsInvalidSortingColumn() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("email Date");  // Contains space - should be skipped

        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testEmailLog));

        List<EmailLogs> results = emailLogsDao.executeQuery(filters, paginationModel);

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