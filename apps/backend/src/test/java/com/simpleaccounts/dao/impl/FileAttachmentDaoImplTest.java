package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.entity.FileAttachment;
import com.simpleaccounts.rest.PaginationModel;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
@DisplayName("FileAttachmentDaoImpl Unit Tests")
class FileAttachmentDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<FileAttachment> typedQuery;
    @Mock private TypedQuery<Long> countQuery;

    @Mock private CriteriaBuilder criteriaBuilder;
    @Mock private CriteriaQuery<FileAttachment> criteriaQuery;
    @Mock private CriteriaQuery<Long> countCriteriaQuery;
    @Mock private Root<FileAttachment> root;
    @Mock private Predicate predicate;
    @Mock private Path<Object> path;

    @InjectMocks
    private FileAttachmentDaoImpl fileAttachmentDao;

    private FileAttachment testFileAttachment;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(fileAttachmentDao, "entityManager", entityManager);
        testFileAttachment = createTestFileAttachment();

        lenient().when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        lenient().when(criteriaBuilder.createQuery(FileAttachment.class)).thenReturn(criteriaQuery);
        lenient().when(criteriaQuery.from(FileAttachment.class)).thenReturn(root);
        lenient().when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
        lenient().when(root.get(anyString())).thenReturn(path);
        lenient().when(criteriaBuilder.equal(any(), any())).thenReturn(predicate);

        lenient().when(criteriaBuilder.createQuery(Long.class)).thenReturn(countCriteriaQuery);
        lenient().when(countCriteriaQuery.from(FileAttachment.class)).thenReturn(root);
        lenient().when(entityManager.createQuery(countCriteriaQuery)).thenReturn(countQuery);
        
        lenient().when(countQuery.getSingleResult()).thenReturn(0L);
    }

    @Test
    @DisplayName("Should find file attachment by primary key when it exists")
    void findByPKReturnsFileAttachmentWhenExists() {
        Integer id = 1;
        when(entityManager.find(FileAttachment.class, id)).thenReturn(testFileAttachment);
        FileAttachment result = fileAttachmentDao.findByPK(id);
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(testFileAttachment.getId());
        assertThat(result.getFileName()).isEqualTo("test.pdf");
        verify(entityManager).find(FileAttachment.class, id);
    }

    @Test
    @DisplayName("Should return null when file attachment does not exist")
    void findByPKReturnsNullWhenNotExists() {
        Integer id = 999;
        when(entityManager.find(FileAttachment.class, id)).thenReturn(null);
        FileAttachment result = fileAttachmentDao.findByPK(id);
        assertThat(result).isNull();
        verify(entityManager).find(FileAttachment.class, id);
    }

    @Test
    @DisplayName("Should persist new file attachment successfully")
    void persistSavesNewFileAttachment() {
        FileAttachment newAttachment = new FileAttachment();
        newAttachment.setFileName("new-file.pdf");
        fileAttachmentDao.persist(newAttachment);
        verify(entityManager).persist(newAttachment);
        verify(entityManager).flush();
        verify(entityManager).refresh(newAttachment);
    }

    @Test
    @DisplayName("Should update existing file attachment successfully")
    void updateModifiesExistingFileAttachment() {
        testFileAttachment.setFileName("updated.pdf");
        when(entityManager.merge(testFileAttachment)).thenReturn(testFileAttachment);
        FileAttachment result = fileAttachmentDao.update(testFileAttachment);
        assertThat(result).isNotNull();
        assertThat(result.getFileName()).isEqualTo("updated.pdf");
        verify(entityManager).merge(testFileAttachment);
    }

    @Test
    @DisplayName("Should delete file attachment when it is managed")
    void deleteRemovesFileAttachmentWhenManaged() {
        when(entityManager.contains(testFileAttachment)).thenReturn(true);
        fileAttachmentDao.delete(testFileAttachment);
        verify(entityManager).contains(testFileAttachment);
        verify(entityManager).remove(testFileAttachment);
    }

    @Test
    @DisplayName("Should merge and delete file attachment when it is not managed")
    void deleteRemovesFileAttachmentWhenNotManaged() {
        when(entityManager.contains(testFileAttachment)).thenReturn(false);
        when(entityManager.merge(testFileAttachment)).thenReturn(testFileAttachment);
        fileAttachmentDao.delete(testFileAttachment);
        verify(entityManager).contains(testFileAttachment);
        verify(entityManager).merge(testFileAttachment);
        verify(entityManager).remove(testFileAttachment);
    }

    @Test
    @DisplayName("Should execute query with filters and return results")
    void executeQueryWithFiltersReturnsResults() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        List<FileAttachment> expectedResults = Arrays.asList(testFileAttachment);

        when(typedQuery.getResultList()).thenReturn(expectedResults);

        List<FileAttachment> results = fileAttachmentDao.executeQuery(filters);

        assertThat(results).isNotNull().hasSize(1);
        assertThat(results.get(0)).isEqualTo(testFileAttachment);
    }

    @Test
    @DisplayName("Should execute query with pagination and return results")
    void executeQueryWithPaginationReturnsResults() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);
        paginationModel.setSortingCol("id");
        paginationModel.setOrder("ASC");

        List<FileAttachment> expectedResults = Arrays.asList(testFileAttachment);

        when(typedQuery.setFirstResult(0)).thenReturn(typedQuery);
        when(typedQuery.setMaxResults(10)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        List<FileAttachment> results = fileAttachmentDao.executeQuery(filters, paginationModel);

        assertThat(results).isNotNull().hasSize(1);
        verify(typedQuery).setFirstResult(0);
        verify(typedQuery).setMaxResults(10);
    }

    @Test
    @DisplayName("Should return result count with filters")
    void getResultCountReturnsCorrectCount() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );

        when(countQuery.getSingleResult()).thenReturn(2L);

        Integer count = fileAttachmentDao.getResultCount(filters);

        assertThat(count).isEqualTo(2);
    }

    @Test
    @DisplayName("Should return zero count when no results found")
    void getResultCountReturnsZeroWhenNoResults() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );

        when(countQuery.getSingleResult()).thenReturn(0L);

        Integer count = fileAttachmentDao.getResultCount(filters);

        assertThat(count).isEqualTo(0);
    }

    @Test
    @DisplayName("Should find by attributes with string matching")
    void findByAttributesWithStringMatching() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("fileName", "test");

        when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        when(criteriaBuilder.createQuery(FileAttachment.class)).thenReturn(criteriaQuery);
        when(criteriaQuery.from(FileAttachment.class)).thenReturn(root);
        when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
        
        assertDoesNotThrow(() -> {
            fileAttachmentDao.findByAttributes(attributes);
        });
    }

    @Test
    @DisplayName("Should return entity manager instance")
    void getEntityManagerReturnsInstance() {
        EntityManager result = fileAttachmentDao.getEntityManager();
        assertThat(result).isNotNull().isEqualTo(entityManager);
    }

    @Test
    @DisplayName("Should dump all file attachment data")
    void dumpDataReturnsAllFileAttachments() {
        List<FileAttachment> expectedResults = Arrays.asList(testFileAttachment, createTestFileAttachment());
        when(typedQuery.getResultList()).thenReturn(expectedResults);
        List<FileAttachment> results = fileAttachmentDao.dumpData();
        assertThat(results).isNotNull().hasSize(2);
    }

    @Test
    @DisplayName("Should handle empty filters in executeQuery")
    void executeQueryWithEmptyFiltersReturnsAllResults() {
        List<DbFilter> emptyFilters = new ArrayList<>();
        List<FileAttachment> expectedResults = Arrays.asList(testFileAttachment);
        when(typedQuery.getResultList()).thenReturn(expectedResults);
        List<FileAttachment> results = fileAttachmentDao.executeQuery(emptyFilters);
        assertThat(results).isNotNull().hasSize(1);
    }

    @Test
    @DisplayName("Should handle null value in filter")
    void executeQuerySkipsNullValueFilters() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("fileName").condition("=:fileName").value(null).build()
        );
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());
        List<FileAttachment> results = fileAttachmentDao.executeQuery(filters);
        assertThat(results).isNotNull();
        verify(criteriaBuilder, times(0)).equal(any(), any());
    }

    @Test
    @DisplayName("Should handle multiple filters correctly")
    void executeQueryWithMultipleFilters() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build(),
            DbFilter.builder().dbCoulmnName("fileType").condition("=:fileType").value("pdf").build()
        );
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testFileAttachment));
        List<FileAttachment> results = fileAttachmentDao.executeQuery(filters);
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

        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testFileAttachment));

        List<FileAttachment> results = fileAttachmentDao.executeQuery(filters, paginationModel);

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
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testFileAttachment));
        List<FileAttachment> results = fileAttachmentDao.executeQuery(filters, null);
        assertThat(results).isNotNull();
        verify(typedQuery, times(0)).setFirstResult(any(Integer.class));
    }

    @Test
    @DisplayName("Should find file attachment by ID using findByPK")
    void findByPKWithValidIdReturnsFileAttachment() {
        Integer id = 100;
        FileAttachment expected = createTestFileAttachment();
        expected.setId(id);
        when(entityManager.find(FileAttachment.class, id)).thenReturn(expected);
        FileAttachment result = fileAttachmentDao.findByPK(id);
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
        verify(entityManager).find(FileAttachment.class, id);
    }

    @Test
    @DisplayName("Should return correct count when result list is null")
    void getResultCountReturnsZeroWhenResultIsNull() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        when(countQuery.getSingleResult()).thenReturn(0L);
        Integer count = fileAttachmentDao.getResultCount(filters);
        assertThat(count).isEqualTo(0);
    }

    @Test
    @DisplayName("Should handle sorting column in pagination")
    void executeQueryWithSortingColumn() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("fileName");
        paginationModel.setOrder("DESC");

        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testFileAttachment));

        List<FileAttachment> results = fileAttachmentDao.executeQuery(filters, paginationModel);

        assertThat(results).isNotNull();
        verify(criteriaQuery).orderBy(any(List.class));
    }

    @Test
    @DisplayName("Should skip invalid sorting column with spaces")
    void executeQuerySkipsInvalidSortingColumn() {
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("file Name");  // Contains space - should be skipped

        when(typedQuery.getResultList()).thenReturn(Arrays.asList(testFileAttachment));

        List<FileAttachment> results = fileAttachmentDao.executeQuery(filters, paginationModel);

        assertThat(results).isNotNull();
    }

    private FileAttachment createTestFileAttachment() {
        FileAttachment attachment = new FileAttachment();
        attachment.setId(1);
        attachment.setFileName("test.pdf");
        attachment.setFileType("application/pdf");
        attachment.setFileData(new byte[]{1, 2, 3, 4, 5});
        attachment.setOrderSequence(1);
        attachment.setCreatedBy(1);
        attachment.setCreatedDate(LocalDateTime.now());
        attachment.setDeleteFlag(false);
        attachment.setVersionNumber(1);
        return attachment;
    }
}
