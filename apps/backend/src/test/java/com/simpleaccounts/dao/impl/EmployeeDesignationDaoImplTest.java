package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.entity.EmployeeDesignation;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
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
@DisplayName("EmployeeDesignationDaoImpl Unit Tests")
class EmployeeDesignationDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<EmployeeDesignation> typedQuery;

    @Mock
    private TypedQuery<Long> countQuery;

    @Mock
    private CriteriaBuilder criteriaBuilder;

    @Mock
    private CriteriaQuery<EmployeeDesignation> criteriaQuery;

    @Mock
    private CriteriaQuery<Long> countCriteriaQuery;

    @Mock
    private Root<EmployeeDesignation> root;

    @Mock
    private Predicate predicate;

    @Mock
    private Path<Object> path;

    @InjectMocks
    private EmployeeDesignationDaoImpl employeeDesignationDao;

    private EmployeeDesignation testDesignation;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(employeeDesignationDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(employeeDesignationDao, "entityClass", EmployeeDesignation.class);
        testDesignation = createTestDesignation(1, "Manager", null);

        lenient().when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        lenient().when(criteriaBuilder.createQuery(EmployeeDesignation.class)).thenReturn(criteriaQuery);
        lenient().when(criteriaQuery.from(EmployeeDesignation.class)).thenReturn(root);
        lenient().when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
        lenient().when(root.get(anyString())).thenReturn(path);
        lenient().when(criteriaBuilder.equal(any(), any())).thenReturn(predicate);

        lenient().when(criteriaBuilder.createQuery(Long.class)).thenReturn(countCriteriaQuery);
        lenient().when(countCriteriaQuery.from(EmployeeDesignation.class)).thenReturn(root);
        lenient().when(entityManager.createQuery(countCriteriaQuery)).thenReturn(countQuery);
        lenient().when(countQuery.getSingleResult()).thenReturn(0L);
    }

    @Test
    @DisplayName("Should return employee designations for dropdown")
    void getEmployeeDesignationDropdownReturnsDropdownModels() {
        List<EmployeeDesignation> designations = Arrays.asList(
            createTestDesignation(1, "Manager", null),
            createTestDesignation(2, "Developer", null),
            createTestDesignation(3, "Analyst", null)
        );

        String expectedQuery = "SELECT ed FROM EmployeeDesignation ed Where  ed.deleteFlag!=true order by ed.id ASC ";
        when(entityManager.createQuery(expectedQuery, EmployeeDesignation.class)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(designations);

        List<DropdownObjectModel> result = employeeDesignationDao.getEmployeeDesignationDropdown();

        assertThat(result).isNotNull().hasSize(3);
        assertThat(result.get(0).getValue()).isEqualTo(1);
        assertThat(result.get(0).getLabel()).isEqualTo("Manager");
        assertThat(result.get(1).getLabel()).isEqualTo("Developer");
        assertThat(result.get(2).getLabel()).isEqualTo("Analyst");
    }

    @Test
    @DisplayName("Should return empty list when no designations exist")
    void getEmployeeDesignationDropdownReturnsEmptyListWhenNoDesignations() {
        String expectedQuery = "SELECT ed FROM EmployeeDesignation ed Where  ed.deleteFlag!=true order by ed.id ASC ";
        when(entityManager.createQuery(expectedQuery, EmployeeDesignation.class)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Collections.emptyList());

        List<DropdownObjectModel> result = employeeDesignationDao.getEmployeeDesignationDropdown();

        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when designations list is null")
    void getEmployeeDesignationDropdownReturnsEmptyListWhenNull() {
        String expectedQuery = "SELECT ed FROM EmployeeDesignation ed Where  ed.deleteFlag!=true order by ed.id ASC ";
        when(entityManager.createQuery(expectedQuery, EmployeeDesignation.class)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(null);

        List<DropdownObjectModel> result = employeeDesignationDao.getEmployeeDesignationDropdown();

        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should return parent employee designations for dropdown")
    void getParentEmployeeDesignationForDropdownReturnsParentDesignations() {
        List<EmployeeDesignation> parentDesignations = Arrays.asList(
            createTestDesignation(1, "CEO", null),
            createTestDesignation(2, "Director", null)
        );

        String expectedQuery = "SELECT ed FROM EmployeeDesignation ed Where ed.parentId=null AND ed.deleteFlag!=true  order by ed.id ASC ";
        when(entityManager.createQuery(expectedQuery, EmployeeDesignation.class)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(parentDesignations);

        List<DropdownObjectModel> result = employeeDesignationDao.getParentEmployeeDesignationForDropdown();

        assertThat(result).isNotNull().hasSize(2);
        assertThat(result.get(0).getLabel()).isEqualTo("CEO");
        assertThat(result.get(1).getLabel()).isEqualTo("Director");
    }

    @Test
    @DisplayName("Should return empty list when no parent designations exist")
    void getParentEmployeeDesignationForDropdownReturnsEmptyListWhenNoParents() {
        String expectedQuery = "SELECT ed FROM EmployeeDesignation ed Where ed.parentId=null AND ed.deleteFlag!=true  order by ed.id ASC ";
        when(entityManager.createQuery(expectedQuery, EmployeeDesignation.class)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Collections.emptyList());

        List<DropdownObjectModel> result = employeeDesignationDao.getParentEmployeeDesignationForDropdown();

        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should return employee designation list with pagination")
    void getEmployeeDesignationListReturnsListWithPagination() {
        Map<Object, Object> filterDataMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);
        paginationModel.setSortingCol("designationName");
        paginationModel.setOrder("ASC");

        List<EmployeeDesignation> designations = Arrays.asList(testDesignation);

        when(countQuery.getSingleResult()).thenReturn(1L);
        when(typedQuery.getResultList()).thenReturn(designations);

        PaginationResponseModel result = employeeDesignationDao.getEmployeeDesignationList(filterDataMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(1);
        assertThat(result.getData()).isNotNull();
    }

    @Test
    @DisplayName("Should return empty result when no designations found")
    void getEmployeeDesignationListReturnsEmptyResult() {
        Map<Object, Object> filterDataMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();

        when(countQuery.getSingleResult()).thenReturn(0L);
        when(typedQuery.getResultList()).thenReturn(Collections.emptyList());

        PaginationResponseModel result = employeeDesignationDao.getEmployeeDesignationList(filterDataMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should apply delete flag filter in designation list")
    void getEmployeeDesignationListAppliesDeleteFlagFilter() {
        Map<Object, Object> filterDataMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();

        List<EmployeeDesignation> nonDeletedDesignations = Arrays.asList(
            createTestDesignation(1, "Manager", null),
            createTestDesignation(2, "Developer", null)
        );

        when(countQuery.getSingleResult()).thenReturn(2L);
        when(typedQuery.getResultList()).thenReturn(nonDeletedDesignations);

        PaginationResponseModel result = employeeDesignationDao.getEmployeeDesignationList(filterDataMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should find designation by primary key")
    void findByPKReturnsDesignationWhenExists() {
        Integer id = 1;
        when(entityManager.find(EmployeeDesignation.class, id)).thenReturn(testDesignation);

        EmployeeDesignation result = employeeDesignationDao.findByPK(id);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getDesignationName()).isEqualTo("Manager");
        verify(entityManager).find(EmployeeDesignation.class, id);
    }

    @Test
    @DisplayName("Should return null when designation not found by primary key")
    void findByPKReturnsNullWhenNotFound() {
        Integer id = 999;
        when(entityManager.find(EmployeeDesignation.class, id)).thenReturn(null);

        EmployeeDesignation result = employeeDesignationDao.findByPK(id);

        assertThat(result).isNull();
        verify(entityManager).find(EmployeeDesignation.class, id);
    }

    @Test
    @DisplayName("Should persist new designation")
    void persistSavesNewDesignation() {
        EmployeeDesignation newDesignation = createTestDesignation(null, "New Role", null);

        employeeDesignationDao.persist(newDesignation);

        verify(entityManager).persist(newDesignation);
        verify(entityManager).flush();
        verify(entityManager).refresh(newDesignation);
    }

    @Test
    @DisplayName("Should update existing designation")
    void updateModifiesExistingDesignation() {
        testDesignation.setDesignationName("Senior Manager");
        when(entityManager.merge(testDesignation)).thenReturn(testDesignation);

        EmployeeDesignation result = employeeDesignationDao.update(testDesignation);

        assertThat(result).isNotNull();
        assertThat(result.getDesignationName()).isEqualTo("Senior Manager");
        verify(entityManager).merge(testDesignation);
    }

    @Test
    @DisplayName("Should delete designation when managed")
    void deleteRemovesDesignationWhenManaged() {
        when(entityManager.contains(testDesignation)).thenReturn(true);

        employeeDesignationDao.delete(testDesignation);

        verify(entityManager).contains(testDesignation);
        verify(entityManager).remove(testDesignation);
    }

    @Test
    @DisplayName("Should merge and delete designation when not managed")
    void deleteRemovesDesignationWhenNotManaged() {
        when(entityManager.contains(testDesignation)).thenReturn(false);
        when(entityManager.merge(testDesignation)).thenReturn(testDesignation);

        employeeDesignationDao.delete(testDesignation);

        verify(entityManager).contains(testDesignation);
        verify(entityManager).merge(testDesignation);
        verify(entityManager).remove(testDesignation);
    }

    @Test
    @DisplayName("Should handle hierarchical designations correctly")
    void handlesHierarchicalDesignations() {
        EmployeeDesignation parentDesignation = createTestDesignation(1, "Director", null);
        EmployeeDesignation childDesignation = createTestDesignation(2, "Manager", 1);

        List<EmployeeDesignation> allDesignations = Arrays.asList(parentDesignation, childDesignation);

        String query = "SELECT ed FROM EmployeeDesignation ed Where  ed.deleteFlag!=true order by ed.id ASC ";
        when(entityManager.createQuery(query, EmployeeDesignation.class)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(allDesignations);

        List<DropdownObjectModel> result = employeeDesignationDao.getEmployeeDesignationDropdown();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(DropdownObjectModel::getLabel)
            .containsExactly("Director", "Manager");
    }

    @Test
    @DisplayName("Should only return parent designations with null parentId")
    void getParentDesignationsExcludesChildDesignations() {
        EmployeeDesignation parentOnly = createTestDesignation(1, "CEO", null);

        String expectedQuery = "SELECT ed FROM EmployeeDesignation ed Where ed.parentId=null AND ed.deleteFlag!=true  order by ed.id ASC ";
        when(entityManager.createQuery(expectedQuery, EmployeeDesignation.class)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(parentOnly));

        List<DropdownObjectModel> result = employeeDesignationDao.getParentEmployeeDesignationForDropdown();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getLabel()).isEqualTo("CEO");
    }

    @Test
    @DisplayName("Should handle large list of designations")
    void handlesLargeListOfDesignations() {
        List<EmployeeDesignation> largeList = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            largeList.add(createTestDesignation(i, "Designation " + i, null));
        }

        String expectedQuery = "SELECT ed FROM EmployeeDesignation ed Where  ed.deleteFlag!=true order by ed.id ASC ";
        when(entityManager.createQuery(expectedQuery, EmployeeDesignation.class)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(largeList);

        List<DropdownObjectModel> result = employeeDesignationDao.getEmployeeDesignationDropdown();

        assertThat(result).hasSize(100);
    }

    private EmployeeDesignation createTestDesignation(Integer id, String name, Integer parentId) {
        EmployeeDesignation designation = new EmployeeDesignation();
        designation.setId(id);
        designation.setDesignationName(name);
        designation.setParentId(parentId);
        designation.setDeleteFlag(false);
        designation.setCreatedBy(1);
        designation.setCreatedDate(LocalDateTime.now());
        return designation;
    }
}
