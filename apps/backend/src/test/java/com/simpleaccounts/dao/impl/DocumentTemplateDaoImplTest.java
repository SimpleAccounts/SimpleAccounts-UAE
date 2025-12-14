package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
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
@DisplayName("DocumentTemplateDaoImpl Unit Tests")
class DocumentTemplateDaoImplTest {

  @Mock private EntityManager entityManager;

  @Mock private TypedQuery<DocumentTemplate> typedQuery;
  @Mock private TypedQuery<Long> countQuery;
  @Mock private CriteriaBuilder criteriaBuilder;
  @Mock private CriteriaQuery<DocumentTemplate> criteriaQuery;
  @Mock private CriteriaQuery<Long> countCriteriaQuery;
  @Mock private Root<DocumentTemplate> root;
  @Mock private Predicate predicate;
  @Mock private Path<Object> path;

  @InjectMocks private DocumentTemplateDaoImpl documentTemplateDao;

  private DocumentTemplate testDocumentTemplate;

  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(documentTemplateDao, "entityManager", entityManager);
    testDocumentTemplate = createTestDocumentTemplate();

    lenient().when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
    lenient().when(criteriaBuilder.createQuery(DocumentTemplate.class)).thenReturn(criteriaQuery);
    lenient().when(criteriaQuery.from(DocumentTemplate.class)).thenReturn(root);
    lenient().when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
    lenient().when(root.get(anyString())).thenReturn(path);
    lenient().when(criteriaBuilder.equal(any(), any())).thenReturn(predicate);

    lenient().when(criteriaBuilder.createQuery(Long.class)).thenReturn(countCriteriaQuery);
    lenient().when(countCriteriaQuery.from(DocumentTemplate.class)).thenReturn(root);
    lenient().when(entityManager.createQuery(countCriteriaQuery)).thenReturn(countQuery);
    
    // Default count
    lenient().when(countQuery.getSingleResult()).thenReturn(0L);
  }

  @Test
  @DisplayName("Should get document template by ID when it exists")
  void getDocumentTemplateByIdReturnsTemplateWhenExists() {
    Integer id = 1;
    when(entityManager.find(DocumentTemplate.class, id)).thenReturn(testDocumentTemplate);
    DocumentTemplate result = documentTemplateDao.getDocumentTemplateById(id);
    assertThat(result).isNotNull();
    assertThat(result.getId()).isEqualTo(testDocumentTemplate.getId());
    verify(entityManager).find(DocumentTemplate.class, id);
  }

  @Test
  @DisplayName("Should return null when document template ID does not exist")
  void getDocumentTemplateByIdReturnsNullWhenNotExists() {
    Integer id = 999;
    when(entityManager.find(DocumentTemplate.class, id)).thenReturn(null);
    DocumentTemplate result = documentTemplateDao.getDocumentTemplateById(id);
    assertThat(result).isNull();
    verify(entityManager).find(DocumentTemplate.class, id);
  }

  @Test
  @DisplayName("Should handle null ID in getDocumentTemplateById")
  void getDocumentTemplateByIdHandlesNullId() {
    when(entityManager.find(DocumentTemplate.class, null)).thenReturn(null);
    DocumentTemplate result = documentTemplateDao.getDocumentTemplateById(null);
    assertThat(result).isNull();
    verify(entityManager).find(DocumentTemplate.class, null);
  }

  @Test
  @DisplayName("Should find document template by primary key when it exists")
  void findByPKReturnsDocumentTemplateWhenExists() {
    Integer id = 1;
    when(entityManager.find(DocumentTemplate.class, id)).thenReturn(testDocumentTemplate);
    DocumentTemplate result = documentTemplateDao.findByPK(id);
    assertThat(result).isNotNull();
    assertThat(result.getId()).isEqualTo(id);
    verify(entityManager).find(DocumentTemplate.class, id);
  }

  @Test
  @DisplayName("Should persist new document template successfully")
  void persistSavesNewDocumentTemplate() {
    DocumentTemplate newTemplate = new DocumentTemplate();
    newTemplate.setName("New Template");
    newTemplate.setType(1);
    documentTemplateDao.persist(newTemplate);
    verify(entityManager).persist(newTemplate);
    verify(entityManager).flush();
    verify(entityManager).refresh(newTemplate);
  }

  @Test
  @DisplayName("Should update existing document template successfully")
  void updateModifiesExistingDocumentTemplate() {
    testDocumentTemplate.setName("Updated Template");
    when(entityManager.merge(testDocumentTemplate)).thenReturn(testDocumentTemplate);
    DocumentTemplate result = documentTemplateDao.update(testDocumentTemplate);
    assertThat(result).isNotNull();
    assertThat(result.getName()).isEqualTo("Updated Template");
    verify(entityManager).merge(testDocumentTemplate);
  }

  @Test
  @DisplayName("Should delete document template when it is managed")
  void deleteRemovesDocumentTemplateWhenManaged() {
    when(entityManager.contains(testDocumentTemplate)).thenReturn(true);
    documentTemplateDao.delete(testDocumentTemplate);
    verify(entityManager).contains(testDocumentTemplate);
    verify(entityManager).remove(testDocumentTemplate);
  }

  @Test
  @DisplayName("Should merge and delete document template when not managed")
  void deleteRemovesDocumentTemplateWhenNotManaged() {
    when(entityManager.contains(testDocumentTemplate)).thenReturn(false);
    when(entityManager.merge(testDocumentTemplate)).thenReturn(testDocumentTemplate);
    documentTemplateDao.delete(testDocumentTemplate);
    verify(entityManager).contains(testDocumentTemplate);
    verify(entityManager).merge(testDocumentTemplate);
    verify(entityManager).remove(testDocumentTemplate);
  }

  @Test
  @DisplayName("Should execute query with filters and return results")
  void executeQueryWithFiltersReturnsResults() {
    List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build());
    List<DocumentTemplate> expectedResults = Arrays.asList(testDocumentTemplate);

    when(typedQuery.getResultList()).thenReturn(expectedResults);

    List<DocumentTemplate> results = documentTemplateDao.executeQuery(filters);

    assertThat(results).isNotNull().hasSize(1);
    assertThat(results.get(0)).isEqualTo(testDocumentTemplate);
  }

  @Test
  @DisplayName("Should execute query with pagination and return results")
  void executeQueryWithPaginationReturnsResults() {
    List<DbFilter> filters = Arrays.asList(DbFilter.builder().dbCoulmnName("type").condition("=:type").value(1).build());
    PaginationModel paginationModel = new PaginationModel();
    paginationModel.setPageNo(0);
    paginationModel.setPageSize(10);
    paginationModel.setSortingCol("name");
    paginationModel.setOrder("ASC");

    List<DocumentTemplate> expectedResults = Arrays.asList(testDocumentTemplate);

    when(typedQuery.setFirstResult(0)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(10)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(expectedResults);

    List<DocumentTemplate> results = documentTemplateDao.executeQuery(filters, paginationModel);

    assertThat(results).isNotNull().hasSize(1);
    verify(typedQuery).setFirstResult(0);
    verify(typedQuery).setMaxResults(10);
  }

  @Test
  @DisplayName("Should return result count with filters")
  void getResultCountReturnsCorrectCount() {
    List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build());

    when(countQuery.getSingleResult()).thenReturn(2L);

    Integer count = documentTemplateDao.getResultCount(filters);

    assertThat(count).isEqualTo(2);
  }

  @Test
  @DisplayName("Should return zero count when no results found")
  void getResultCountReturnsZeroWhenNoResults() {
    List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build());

    when(countQuery.getSingleResult()).thenReturn(0L);

    Integer count = documentTemplateDao.getResultCount(filters);

    assertThat(count).isZero();
  }

  @Test
  @DisplayName("Should execute named query and return results")
  void executeNamedQueryReturnsResults() {
    String namedQuery = "DocumentTemplate.findAll";
    List<DocumentTemplate> expectedResults = Arrays.asList(testDocumentTemplate);

    when(entityManager.createNamedQuery(namedQuery, DocumentTemplate.class)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(expectedResults);

    List<DocumentTemplate> results = documentTemplateDao.executeNamedQuery(namedQuery);

    assertThat(results).isNotNull().hasSize(1);
    verify(entityManager).createNamedQuery(namedQuery, DocumentTemplate.class);
  }

  @Test
  @DisplayName("Should execute named query findByName")
  void executeNamedQueryFindByName() {
    String namedQuery = "DocumentTemplate.findByName";
    List<DocumentTemplate> expectedResults = Arrays.asList(testDocumentTemplate);

    when(entityManager.createNamedQuery(namedQuery, DocumentTemplate.class)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(expectedResults);

    List<DocumentTemplate> results = documentTemplateDao.executeNamedQuery(namedQuery);

    assertThat(results).isNotNull().hasSize(1);
    assertThat(results.get(0).getName()).isEqualTo("Invoice Template");
  }

  @Test
  @DisplayName("Should execute named query findByType")
  void executeNamedQueryFindByType() {
    String namedQuery = "DocumentTemplate.findByType";
    List<DocumentTemplate> expectedResults = Arrays.asList(testDocumentTemplate);

    when(entityManager.createNamedQuery(namedQuery, DocumentTemplate.class)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(expectedResults);

    List<DocumentTemplate> results = documentTemplateDao.executeNamedQuery(namedQuery);

    assertThat(results).isNotNull().hasSize(1);
    assertThat(results.get(0).getType()).isEqualTo(1);
  }

  @Test
  @DisplayName("Should return entity manager instance")
  void getEntityManagerReturnsInstance() {
    EntityManager result = documentTemplateDao.getEntityManager();
    assertThat(result).isNotNull().isEqualTo(entityManager);
  }

  @Test
  @DisplayName("Should dump all document template data")
  void dumpDataReturnsAllDocumentTemplates() {
    List<DocumentTemplate> expectedResults = Arrays.asList(testDocumentTemplate, createTestDocumentTemplate());
    when(typedQuery.getResultList()).thenReturn(expectedResults);
    List<DocumentTemplate> results = documentTemplateDao.dumpData();
    assertThat(results).isNotNull().hasSize(2);
  }

  @Test
  @DisplayName("Should handle empty filters in executeQuery")
  void executeQueryWithEmptyFiltersReturnsAllResults() {
    List<DbFilter> emptyFilters = new ArrayList<>();
    List<DocumentTemplate> expectedResults = Arrays.asList(testDocumentTemplate);
    when(typedQuery.getResultList()).thenReturn(expectedResults);
    List<DocumentTemplate> results = documentTemplateDao.executeQuery(emptyFilters);
    assertThat(results).isNotNull().hasSize(1);
  }

  @Test
  @DisplayName("Should handle multiple filters correctly")
  void executeQueryWithMultipleFilters() {
    List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build(),
            DbFilter.builder().dbCoulmnName("type").condition("=:type").value(1).build());

    when(typedQuery.getResultList()).thenReturn(Arrays.asList(testDocumentTemplate));

    List<DocumentTemplate> results = documentTemplateDao.executeQuery(filters);

    assertThat(results).isNotNull().hasSize(1);
  }

  @Test
  @DisplayName("Should handle pagination disabled flag")
  void executeQueryWithPaginationDisabled() {
    List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build());
    PaginationModel paginationModel = new PaginationModel();
    paginationModel.setPaginationDisable(true);

    when(typedQuery.getResultList()).thenReturn(Arrays.asList(testDocumentTemplate));

    List<DocumentTemplate> results = documentTemplateDao.executeQuery(filters, paginationModel);

    assertThat(results).isNotNull();
    verify(typedQuery, times(0)).setFirstResult(any(Integer.class));
    verify(typedQuery, times(0)).setMaxResults(any(Integer.class));
  }

  @Test
  @DisplayName("Should get document template by ID with zero ID")
  void getDocumentTemplateByIdWithZeroId() {
    Integer zeroId = 0;
    when(entityManager.find(DocumentTemplate.class, zeroId)).thenReturn(null);
    DocumentTemplate result = documentTemplateDao.getDocumentTemplateById(zeroId);
    assertThat(result).isNull();
    verify(entityManager).find(DocumentTemplate.class, zeroId);
  }

  @Test
  @DisplayName("Should get document template by ID with negative ID")
  void getDocumentTemplateByIdWithNegativeId() {
    Integer negativeId = -1;
    when(entityManager.find(DocumentTemplate.class, negativeId)).thenReturn(null);
    DocumentTemplate result = documentTemplateDao.getDocumentTemplateById(negativeId);
    assertThat(result).isNull();
    verify(entityManager).find(DocumentTemplate.class, negativeId);
  }

  @Test
  @DisplayName("Should return correct count when result list is null")
  void getResultCountReturnsZeroWhenResultIsNull() {
    List<DbFilter> filters = Arrays.asList();
    when(countQuery.getSingleResult()).thenReturn(0L);
    Integer count = documentTemplateDao.getResultCount(filters);
    assertThat(count).isEqualTo(0);
  }

  @Test
  @DisplayName("Should handle null value in filter")
  void executeQuerySkipsNullValueFilters() {
    List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("name").condition("=:name").value(null).build());
    when(typedQuery.getResultList()).thenReturn(new ArrayList<>());
    List<DocumentTemplate> results = documentTemplateDao.executeQuery(filters);
    assertThat(results).isNotNull();
    verify(criteriaBuilder, times(0)).equal(any(), any());
  }

  @Test
  @DisplayName("Should handle sorting column in pagination")
  void executeQueryWithSortingColumn() {
    List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build());
    PaginationModel paginationModel = new PaginationModel();
    paginationModel.setSortingCol("name");
    paginationModel.setOrder("DESC");

    when(typedQuery.getResultList()).thenReturn(Arrays.asList(testDocumentTemplate));

    List<DocumentTemplate> results = documentTemplateDao.executeQuery(filters, paginationModel);

    assertThat(results).isNotNull();
    verify(criteriaQuery).orderBy(any(List.class));
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