package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.entity.DocumentTemplate;
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
@DisplayName("DocumentTemplateDaoImpl Unit Tests")
class DocumentTemplateDaoImplTest {

  @Mock private EntityManager entityManager;

  @Mock private TypedQuery<DocumentTemplate> typedQuery;
  @Mock private CriteriaBuilder criteriaBuilder;
  @Mock private CriteriaQuery<DocumentTemplate> criteriaQuery;
  @Mock private Root<DocumentTemplate> root;

  @InjectMocks private DocumentTemplateDaoImpl documentTemplateDao;

  private DocumentTemplate testDocumentTemplate;

  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(documentTemplateDao, "entityManager", entityManager);
    testDocumentTemplate = createTestDocumentTemplate();
  }

  @Test
  @DisplayName("Should get document template by ID when it exists")
  void getDocumentTemplateByIdReturnsTemplateWhenExists() {
    // Arrange
    Integer id = 1;
    when(entityManager.find(DocumentTemplate.class, id)).thenReturn(testDocumentTemplate);

    // Act
    DocumentTemplate result = documentTemplateDao.getDocumentTemplateById(id);

    // Assert
    assertThat(result).isNotNull();
    assertThat(result.getId()).isEqualTo(testDocumentTemplate.getId());
    assertThat(result.getName()).isEqualTo("Invoice Template");
    verify(entityManager).find(DocumentTemplate.class, id);
  }

  @Test
  @DisplayName("Should return null when document template ID does not exist")
  void getDocumentTemplateByIdReturnsNullWhenNotExists() {
    // Arrange
    Integer id = 999;
    when(entityManager.find(DocumentTemplate.class, id)).thenReturn(null);

    // Act
    DocumentTemplate result = documentTemplateDao.getDocumentTemplateById(id);

    // Assert
    assertThat(result).isNull();
    verify(entityManager).find(DocumentTemplate.class, id);
  }

  @Test
  @DisplayName("Should handle null ID in getDocumentTemplateById")
  void getDocumentTemplateByIdHandlesNullId() {
    // Arrange
    when(entityManager.find(DocumentTemplate.class, null)).thenReturn(null);

    // Act
    DocumentTemplate result = documentTemplateDao.getDocumentTemplateById(null);

    // Assert
    assertThat(result).isNull();
    verify(entityManager).find(DocumentTemplate.class, null);
  }

  @Test
  @DisplayName("Should find document template by primary key when it exists")
  void findByPKReturnsDocumentTemplateWhenExists() {
    // Arrange
    Integer id = 1;
    when(entityManager.find(DocumentTemplate.class, id)).thenReturn(testDocumentTemplate);

    // Act
    DocumentTemplate result = documentTemplateDao.findByPK(id);

    // Assert
    assertThat(result).isNotNull();
    assertThat(result.getId()).isEqualTo(id);
    verify(entityManager).find(DocumentTemplate.class, id);
  }

  @Test
  @DisplayName("Should persist new document template successfully")
  void persistSavesNewDocumentTemplate() {
    // Arrange
    DocumentTemplate newTemplate = new DocumentTemplate();
    newTemplate.setName("New Template");
    newTemplate.setType(1);

    // Act
    documentTemplateDao.persist(newTemplate);

    // Assert
    verify(entityManager).persist(newTemplate);
    verify(entityManager).flush();
    verify(entityManager).refresh(newTemplate);
  }

  @Test
  @DisplayName("Should update existing document template successfully")
  void updateModifiesExistingDocumentTemplate() {
    // Arrange
    testDocumentTemplate.setName("Updated Template");
    when(entityManager.merge(testDocumentTemplate)).thenReturn(testDocumentTemplate);

    // Act
    DocumentTemplate result = documentTemplateDao.update(testDocumentTemplate);

    // Assert
    assertThat(result).isNotNull();
    assertThat(result.getName()).isEqualTo("Updated Template");
    verify(entityManager).merge(testDocumentTemplate);
  }

  @Test
  @DisplayName("Should delete document template when it is managed")
  void deleteRemovesDocumentTemplateWhenManaged() {
    // Arrange
    when(entityManager.contains(testDocumentTemplate)).thenReturn(true);

    // Act
    documentTemplateDao.delete(testDocumentTemplate);

    // Assert
    verify(entityManager).contains(testDocumentTemplate);
    verify(entityManager).remove(testDocumentTemplate);
  }

  @Test
  @DisplayName("Should merge and delete document template when not managed")
  void deleteRemovesDocumentTemplateWhenNotManaged() {
    // Arrange
    when(entityManager.contains(testDocumentTemplate)).thenReturn(false);
    when(entityManager.merge(testDocumentTemplate)).thenReturn(testDocumentTemplate);

    // Act
    documentTemplateDao.delete(testDocumentTemplate);

    // Assert
    verify(entityManager).contains(testDocumentTemplate);
    verify(entityManager).merge(testDocumentTemplate);
    verify(entityManager).remove(testDocumentTemplate);
  }

  @Test
  @DisplayName("Should execute query with filters and return results")
  void executeQueryWithFiltersReturnsResults() {
    // Arrange
    List<DbFilter> filters =
        Arrays.asList(
            DbFilter.builder()
                .dbCoulmnName("deleteFlag")
                .condition("=:deleteFlag")
                .value(false)
                .build());
    List<DocumentTemplate> expectedResults = Arrays.asList(testDocumentTemplate);

    when(entityManager.createQuery(anyString(), eq(DocumentTemplate.class))).thenReturn(typedQuery);
    when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(expectedResults);

    // Act
    List<DocumentTemplate> results = documentTemplateDao.executeQuery(filters);

    // Assert
    assertThat(results).isNotNull();
    assertThat(results).hasSize(1);
    assertThat(results.get(0)).isEqualTo(testDocumentTemplate);
  }

  @Test
  @DisplayName("Should execute query with pagination and return results")
  void executeQueryWithPaginationReturnsResults() {
    // Arrange
    List<DbFilter> filters =
        Arrays.asList(DbFilter.builder().dbCoulmnName("type").condition("=:type").value(1).build());
    PaginationModel paginationModel = new PaginationModel();
    paginationModel.setPageNo(0);
    paginationModel.setPageSize(10);
    paginationModel.setSortingCol("name");
    paginationModel.setOrder("ASC");

    List<DocumentTemplate> expectedResults = Arrays.asList(testDocumentTemplate);

    when(entityManager.createQuery(anyString(), eq(DocumentTemplate.class))).thenReturn(typedQuery);
    when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
    when(typedQuery.setFirstResult(0)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(10)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(expectedResults);

    // Act
    List<DocumentTemplate> results = documentTemplateDao.executeQuery(filters, paginationModel);

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
    List<DbFilter> filters =
        Arrays.asList(
            DbFilter.builder()
                .dbCoulmnName("deleteFlag")
                .condition("=:deleteFlag")
                .value(false)
                .build());
    List<DocumentTemplate> results =
        Arrays.asList(testDocumentTemplate, createTestDocumentTemplate());

    when(entityManager.createQuery(anyString(), eq(DocumentTemplate.class))).thenReturn(typedQuery);
    when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(results);

    // Act
    Integer count = documentTemplateDao.getResultCount(filters);

    // Assert
    assertThat(count).isEqualTo(2);
  }

  @Test
  @DisplayName("Should return zero count when no results found")
  void getResultCountReturnsZeroWhenNoResults() {
    // Arrange
    List<DbFilter> filters =
        Arrays.asList(
            DbFilter.builder()
                .dbCoulmnName("deleteFlag")
                .condition("=:deleteFlag")
                .value(false)
                .build());

    when(entityManager.createQuery(anyString(), eq(DocumentTemplate.class))).thenReturn(typedQuery);
    when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

    // Act
    Integer count = documentTemplateDao.getResultCount(filters);

    // Assert
    assertThat(count).isZero();
  }

  @Test
  @DisplayName("Should execute named query and return results")
  void executeNamedQueryReturnsResults() {
    // Arrange
    String namedQuery = "DocumentTemplate.findAll";
    List<DocumentTemplate> expectedResults = Arrays.asList(testDocumentTemplate);

    when(entityManager.createNamedQuery(namedQuery, DocumentTemplate.class)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(expectedResults);

    // Act
    List<DocumentTemplate> results = documentTemplateDao.executeNamedQuery(namedQuery);

    // Assert
    assertThat(results).isNotNull();
    assertThat(results).hasSize(1);
    verify(entityManager).createNamedQuery(namedQuery, DocumentTemplate.class);
  }

  @Test
  @DisplayName("Should execute named query findByName")
  void executeNamedQueryFindByName() {
    // Arrange
    String namedQuery = "DocumentTemplate.findByName";
    List<DocumentTemplate> expectedResults = Arrays.asList(testDocumentTemplate);

    when(entityManager.createNamedQuery(namedQuery, DocumentTemplate.class)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(expectedResults);

    // Act
    List<DocumentTemplate> results = documentTemplateDao.executeNamedQuery(namedQuery);

    // Assert
    assertThat(results).isNotNull();
    assertThat(results).hasSize(1);
    assertThat(results.get(0).getName()).isEqualTo("Invoice Template");
  }

  @Test
  @DisplayName("Should execute named query findByType")
  void executeNamedQueryFindByType() {
    // Arrange
    String namedQuery = "DocumentTemplate.findByType";
    List<DocumentTemplate> expectedResults = Arrays.asList(testDocumentTemplate);

    when(entityManager.createNamedQuery(namedQuery, DocumentTemplate.class)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(expectedResults);

    // Act
    List<DocumentTemplate> results = documentTemplateDao.executeNamedQuery(namedQuery);

    // Assert
    assertThat(results).isNotNull();
    assertThat(results).hasSize(1);
    assertThat(results.get(0).getType()).isEqualTo(1);
  }

  @Test
  @DisplayName("Should return entity manager instance")
  void getEntityManagerReturnsInstance() {
    // Act
    EntityManager result = documentTemplateDao.getEntityManager();

    // Assert
    assertThat(result).isNotNull();
    assertThat(result).isEqualTo(entityManager);
  }

  @Test
  @DisplayName("Should dump all document template data")
  void dumpDataReturnsAllDocumentTemplates() {
    // Arrange
    List<DocumentTemplate> expectedResults =
        Arrays.asList(testDocumentTemplate, createTestDocumentTemplate());

    when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
    when(criteriaBuilder.createQuery(DocumentTemplate.class)).thenReturn(criteriaQuery);
    when(criteriaQuery.from(DocumentTemplate.class)).thenReturn(root);
    when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(expectedResults);

    // Act
    List<DocumentTemplate> results = documentTemplateDao.dumpData();

    // Assert
    assertThat(results).isNotNull();
    assertThat(results).hasSize(2);
  }

  @Test
  @DisplayName("Should handle empty filters in executeQuery")
  void executeQueryWithEmptyFiltersReturnsAllResults() {
    // Arrange
    List<DbFilter> emptyFilters = new ArrayList<>();
    List<DocumentTemplate> expectedResults = Arrays.asList(testDocumentTemplate);

    when(entityManager.createQuery(anyString(), eq(DocumentTemplate.class))).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(expectedResults);

    // Act
    List<DocumentTemplate> results = documentTemplateDao.executeQuery(emptyFilters);

    // Assert
    assertThat(results).isNotNull();
    assertThat(results).hasSize(1);
  }

  @Test
  @DisplayName("Should handle multiple filters correctly")
  void executeQueryWithMultipleFilters() {
    // Arrange
    List<DbFilter> filters =
        Arrays.asList(
            DbFilter.builder()
                .dbCoulmnName("deleteFlag")
                .condition("=:deleteFlag")
                .value(false)
                .build(),
            DbFilter.builder().dbCoulmnName("type").condition("=:type").value(1).build());

    when(entityManager.createQuery(anyString(), eq(DocumentTemplate.class))).thenReturn(typedQuery);
    when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(Arrays.asList(testDocumentTemplate));

    // Act
    List<DocumentTemplate> results = documentTemplateDao.executeQuery(filters);

    // Assert
    assertThat(results).isNotNull();
    assertThat(results).hasSize(1);
    verify(typedQuery).setParameter("deleteFlag", false);
    verify(typedQuery).setParameter("type", 1);
  }

  @Test
  @DisplayName("Should handle pagination disabled flag")
  void executeQueryWithPaginationDisabled() {
    // Arrange
    List<DbFilter> filters =
        Arrays.asList(
            DbFilter.builder()
                .dbCoulmnName("deleteFlag")
                .condition("=:deleteFlag")
                .value(false)
                .build());
    PaginationModel paginationModel = new PaginationModel();
    paginationModel.setPaginationDisable(true);

    when(entityManager.createQuery(anyString(), eq(DocumentTemplate.class))).thenReturn(typedQuery);
    when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(Arrays.asList(testDocumentTemplate));

    // Act
    List<DocumentTemplate> results = documentTemplateDao.executeQuery(filters, paginationModel);

    // Assert
    assertThat(results).isNotNull();
    verify(typedQuery, times(0)).setFirstResult(any(Integer.class));
    verify(typedQuery, times(0)).setMaxResults(any(Integer.class));
  }

  @Test
  @DisplayName("Should get document template by ID with zero ID")
  void getDocumentTemplateByIdWithZeroId() {
    // Arrange
    Integer zeroId = 0;
    when(entityManager.find(DocumentTemplate.class, zeroId)).thenReturn(null);

    // Act
    DocumentTemplate result = documentTemplateDao.getDocumentTemplateById(zeroId);

    // Assert
    assertThat(result).isNull();
    verify(entityManager).find(DocumentTemplate.class, zeroId);
  }

  @Test
  @DisplayName("Should get document template by ID with negative ID")
  void getDocumentTemplateByIdWithNegativeId() {
    // Arrange
    Integer negativeId = -1;
    when(entityManager.find(DocumentTemplate.class, negativeId)).thenReturn(null);

    // Act
    DocumentTemplate result = documentTemplateDao.getDocumentTemplateById(negativeId);

    // Assert
    assertThat(result).isNull();
    verify(entityManager).find(DocumentTemplate.class, negativeId);
  }

  @Test
  @DisplayName("Should return correct count when result list is null")
  void getResultCountReturnsZeroWhenResultIsNull() {
    // Arrange
    List<DbFilter> filters =
        Arrays.asList(
            DbFilter.builder()
                .dbCoulmnName("deleteFlag")
                .condition("=:deleteFlag")
                .value(false)
                .build());

    when(entityManager.createQuery(anyString(), eq(DocumentTemplate.class))).thenReturn(typedQuery);
    when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(null);

    // Act
    Integer count = documentTemplateDao.getResultCount(filters);

    // Assert
    assertThat(count).isEqualTo(0);
  }

  @Test
  @DisplayName("Should handle null value in filter")
  void executeQuerySkipsNullValueFilters() {
    // Arrange
    List<DbFilter> filters =
        Arrays.asList(
            DbFilter.builder().dbCoulmnName("name").condition("=:name").value(null).build());

    when(entityManager.createQuery(anyString(), eq(DocumentTemplate.class))).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

    // Act
    List<DocumentTemplate> results = documentTemplateDao.executeQuery(filters);

    // Assert
    assertThat(results).isNotNull();
    verify(typedQuery, times(0)).setParameter(anyString(), any());
  }

  @Test
  @DisplayName("Should handle sorting column in pagination")
  void executeQueryWithSortingColumn() {
    // Arrange
    List<DbFilter> filters =
        Arrays.asList(
            DbFilter.builder()
                .dbCoulmnName("deleteFlag")
                .condition("=:deleteFlag")
                .value(false)
                .build());
    PaginationModel paginationModel = new PaginationModel();
    paginationModel.setSortingCol("name");
    paginationModel.setOrder("DESC");

    when(entityManager.createQuery(anyString(), eq(DocumentTemplate.class))).thenReturn(typedQuery);
    when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(Arrays.asList(testDocumentTemplate));

    // Act
    List<DocumentTemplate> results = documentTemplateDao.executeQuery(filters, paginationModel);

    // Assert
    assertThat(results).isNotNull();
    verify(entityManager).createQuery(anyString(), eq(DocumentTemplate.class));
  }

  private DocumentTemplate createTestDocumentTemplate() {
    DocumentTemplate template = new DocumentTemplate();
    template.setId(1);
    template.setName("Invoice Template");
    template.setType(1);
    template.setTemplate(new byte[] {1, 2, 3, 4, 5});
    template.setOrderSequence(1);
    template.setCreatedBy(1);
    template.setCreatedDate(LocalDateTime.now());
    template.setDeleteFlag(false);
    template.setVersionNumber(1);
    return template;
  }
}
