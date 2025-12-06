package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
@DisplayName("EmployeeDesignationDaoImpl Unit Tests")
class EmployeeDesignationDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<EmployeeDesignation> typedQuery;

    @InjectMocks
    private EmployeeDesignationDaoImpl employeeDesignationDao;

    private EmployeeDesignation testEmployeeDesignation;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(employeeDesignationDao, "entityManager", entityManager);
        testEmployeeDesignation = createTestEmployeeDesignation();
    }

    @Test
    @DisplayName("Should get employee designation dropdown with results")
    void getEmployeeDesignationDropdownReturnsDropdownList() {
        // Arrange
        List<EmployeeDesignation> designations = Arrays.asList(
            createDesignation(1, "Manager"),
            createDesignation(2, "Developer"),
            createDesignation(3, "Tester")
        );

        when(entityManager.createQuery(anyString(), eq(EmployeeDesignation.class))).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(designations);

        // Act
        List<DropdownObjectModel> results = employeeDesignationDao.getEmployeeDesignationDropdown();

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(3);
        assertThat(results.get(0).getId()).isEqualTo(1);
        assertThat(results.get(0).getValue()).isEqualTo("Manager");
        assertThat(results.get(1).getValue()).isEqualTo("Developer");
        assertThat(results.get(2).getValue()).isEqualTo("Tester");
        verify(entityManager).createQuery(anyString(), eq(EmployeeDesignation.class));
    }

    @Test
    @DisplayName("Should return empty list when no employee designations exist")
    void getEmployeeDesignationDropdownReturnsEmptyListWhenNoResults() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(EmployeeDesignation.class))).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<DropdownObjectModel> results = employeeDesignationDao.getEmployeeDesignationDropdown();

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when employee designations result is null")
    void getEmployeeDesignationDropdownHandlesNullResult() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(EmployeeDesignation.class))).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(null);

        // Act
        List<DropdownObjectModel> results = employeeDesignationDao.getEmployeeDesignationDropdown();

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).isEmpty();
    }

    @Test
    @DisplayName("Should get parent employee designation dropdown with results")
    void getParentEmployeeDesignationForDropdownReturnsDropdownList() {
        // Arrange
        List<EmployeeDesignation> designations = Arrays.asList(
            createDesignationWithoutParent(1, "CEO"),
            createDesignationWithoutParent(2, "CTO")
        );

        when(entityManager.createQuery(anyString(), eq(EmployeeDesignation.class))).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(designations);

        // Act
        List<DropdownObjectModel> results = employeeDesignationDao.getParentEmployeeDesignationForDropdown();

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(2);
        assertThat(results.get(0).getId()).isEqualTo(1);
        assertThat(results.get(0).getValue()).isEqualTo("CEO");
        assertThat(results.get(1).getValue()).isEqualTo("CTO");
    }

    @Test
    @DisplayName("Should return empty list when no parent designations exist")
    void getParentEmployeeDesignationForDropdownReturnsEmptyListWhenNoResults() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(EmployeeDesignation.class))).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<DropdownObjectModel> results = employeeDesignationDao.getParentEmployeeDesignationForDropdown();

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when parent designations result is null")
    void getParentEmployeeDesignationForDropdownHandlesNullResult() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(EmployeeDesignation.class))).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(null);

        // Act
        List<DropdownObjectModel> results = employeeDesignationDao.getParentEmployeeDesignationForDropdown();

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).isEmpty();
    }

    @Test
    @DisplayName("Should get employee designation list with pagination")
    void getEmployeeDesignationListReturnsPagedResults() {
        // Arrange
        Map<Object, Object> filterDataMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);

        List<EmployeeDesignation> designations = Arrays.asList(testEmployeeDesignation);

        when(entityManager.createQuery(anyString(), eq(EmployeeDesignation.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.setFirstResult(any(Integer.class))).thenReturn(typedQuery);
        when(typedQuery.setMaxResults(any(Integer.class))).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(designations);

        // Act
        PaginationResponseModel response = employeeDesignationDao.getEmployeeDesignationList(filterDataMap, paginationModel);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getData()).isNotNull();
        assertThat(response.getCount()).isGreaterThanOrEqualTo(0);
    }

    @Test
    @DisplayName("Should get employee designation list with null filter map")
    void getEmployeeDesignationListHandlesNullFilterMap() {
        // Arrange
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);

        List<EmployeeDesignation> designations = Arrays.asList(testEmployeeDesignation);

        when(entityManager.createQuery(anyString(), eq(EmployeeDesignation.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.setFirstResult(any(Integer.class))).thenReturn(typedQuery);
        when(typedQuery.setMaxResults(any(Integer.class))).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(designations);

        // Act
        PaginationResponseModel response = employeeDesignationDao.getEmployeeDesignationList(null, paginationModel);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getData()).isNotNull();
    }

    @Test
    @DisplayName("Should find employee designation by primary key when it exists")
    void findByPKReturnsEmployeeDesignationWhenExists() {
        // Arrange
        Integer id = 1;
        when(entityManager.find(EmployeeDesignation.class, id)).thenReturn(testEmployeeDesignation);

        // Act
        EmployeeDesignation result = employeeDesignationDao.findByPK(id);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(testEmployeeDesignation.getId());
        assertThat(result.getDesignationName()).isEqualTo("Senior Developer");
        verify(entityManager).find(EmployeeDesignation.class, id);
    }

    @Test
    @DisplayName("Should return null when employee designation does not exist")
    void findByPKReturnsNullWhenNotExists() {
        // Arrange
        Integer id = 999;
        when(entityManager.find(EmployeeDesignation.class, id)).thenReturn(null);

        // Act
        EmployeeDesignation result = employeeDesignationDao.findByPK(id);

        // Assert
        assertThat(result).isNull();
        verify(entityManager).find(EmployeeDesignation.class, id);
    }

    @Test
    @DisplayName("Should persist new employee designation successfully")
    void persistSavesNewEmployeeDesignation() {
        // Arrange
        EmployeeDesignation newDesignation = new EmployeeDesignation();
        newDesignation.setDesignationName("Junior Developer");

        // Act
        employeeDesignationDao.persist(newDesignation);

        // Assert
        verify(entityManager).persist(newDesignation);
        verify(entityManager).flush();
        verify(entityManager).refresh(newDesignation);
    }

    @Test
    @DisplayName("Should update existing employee designation successfully")
    void updateModifiesExistingEmployeeDesignation() {
        // Arrange
        testEmployeeDesignation.setDesignationName("Lead Developer");
        when(entityManager.merge(testEmployeeDesignation)).thenReturn(testEmployeeDesignation);

        // Act
        EmployeeDesignation result = employeeDesignationDao.update(testEmployeeDesignation);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getDesignationName()).isEqualTo("Lead Developer");
        verify(entityManager).merge(testEmployeeDesignation);
    }

    @Test
    @DisplayName("Should delete employee designation when it is managed")
    void deleteRemovesEmployeeDesignationWhenManaged() {
        // Arrange
        when(entityManager.contains(testEmployeeDesignation)).thenReturn(true);

        // Act
        employeeDesignationDao.delete(testEmployeeDesignation);

        // Assert
        verify(entityManager).contains(testEmployeeDesignation);
        verify(entityManager).remove(testEmployeeDesignation);
    }

    @Test
    @DisplayName("Should merge and delete employee designation when not managed")
    void deleteRemovesEmployeeDesignationWhenNotManaged() {
        // Arrange
        when(entityManager.contains(testEmployeeDesignation)).thenReturn(false);
        when(entityManager.merge(testEmployeeDesignation)).thenReturn(testEmployeeDesignation);

        // Act
        employeeDesignationDao.delete(testEmployeeDesignation);

        // Assert
        verify(entityManager).contains(testEmployeeDesignation);
        verify(entityManager).merge(testEmployeeDesignation);
        verify(entityManager).remove(testEmployeeDesignation);
    }

    @Test
    @DisplayName("Should execute query with filters and return results")
    void executeQueryWithFiltersReturnsResults() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        List<EmployeeDesignation> expectedResults = Arrays.asList(testEmployeeDesignation);

        when(entityManager.createQuery(anyString(), eq(EmployeeDesignation.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        // Act
        List<EmployeeDesignation> results = employeeDesignationDao.executeQuery(filters);

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        assertThat(results.get(0)).isEqualTo(testEmployeeDesignation);
        verify(typedQuery).setParameter("deleteFlag", false);
    }

    @Test
    @DisplayName("Should execute query with pagination and return results")
    void executeQueryWithPaginationReturnsResults() {
        // Arrange
        List<DbFilter> filters = Arrays.asList(
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);
        paginationModel.setSortingCol("designationName");
        paginationModel.setOrder("ASC");

        List<EmployeeDesignation> expectedResults = Arrays.asList(testEmployeeDesignation);

        when(entityManager.createQuery(anyString(), eq(EmployeeDesignation.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.setFirstResult(0)).thenReturn(typedQuery);
        when(typedQuery.setMaxResults(10)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        // Act
        List<EmployeeDesignation> results = employeeDesignationDao.executeQuery(filters, paginationModel);

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
            DbFilter.builder().dbCoulmnName("deleteFlag").condition("=:deleteFlag").value(false).build()
        );
        List<EmployeeDesignation> results = Arrays.asList(testEmployeeDesignation, createTestEmployeeDesignation());

        when(entityManager.createQuery(anyString(), eq(EmployeeDesignation.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(results);

        // Act
        Integer count = employeeDesignationDao.getResultCount(filters);

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

        when(entityManager.createQuery(anyString(), eq(EmployeeDesignation.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        Integer count = employeeDesignationDao.getResultCount(filters);

        // Assert
        assertThat(count).isEqualTo(0);
    }

    @Test
    @DisplayName("Should execute named query and return results")
    void executeNamedQueryReturnsResults() {
        // Arrange
        String namedQuery = "EmployeeDesignation.findAll";
        List<EmployeeDesignation> expectedResults = Arrays.asList(testEmployeeDesignation);

        when(entityManager.createNamedQuery(namedQuery, EmployeeDesignation.class)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        // Act
        List<EmployeeDesignation> results = employeeDesignationDao.executeNamedQuery(namedQuery);

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        verify(entityManager).createNamedQuery(namedQuery, EmployeeDesignation.class);
    }

    @Test
    @DisplayName("Should return entity manager instance")
    void getEntityManagerReturnsInstance() {
        // Act
        EntityManager result = employeeDesignationDao.getEntityManager();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(entityManager);
    }

    @Test
    @DisplayName("Should dump all employee designation data")
    void dumpDataReturnsAllEmployeeDesignations() {
        // Arrange
        List<EmployeeDesignation> expectedResults = Arrays.asList(testEmployeeDesignation, createTestEmployeeDesignation());

        when(entityManager.createQuery(anyString())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(expectedResults);

        // Act
        List<EmployeeDesignation> results = employeeDesignationDao.dumpData();

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(2);
    }

    @Test
    @DisplayName("Should get employee designation dropdown ordered by ID")
    void getEmployeeDesignationDropdownOrderedById() {
        // Arrange
        List<EmployeeDesignation> designations = Arrays.asList(
            createDesignation(1, "Manager"),
            createDesignation(2, "Developer"),
            createDesignation(3, "Tester")
        );

        when(entityManager.createQuery(anyString(), eq(EmployeeDesignation.class))).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(designations);

        // Act
        List<DropdownObjectModel> results = employeeDesignationDao.getEmployeeDesignationDropdown();

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(3);
        assertThat(results.get(0).getId()).isEqualTo(1);
        assertThat(results.get(1).getId()).isEqualTo(2);
        assertThat(results.get(2).getId()).isEqualTo(3);
    }

    @Test
    @DisplayName("Should filter out deleted designations from dropdown")
    void getEmployeeDesignationDropdownExcludesDeleted() {
        // Arrange
        List<EmployeeDesignation> designations = Arrays.asList(
            createDesignation(1, "Manager")
        );

        when(entityManager.createQuery(anyString(), eq(EmployeeDesignation.class))).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(designations);

        // Act
        List<DropdownObjectModel> results = employeeDesignationDao.getEmployeeDesignationDropdown();

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        // Verify query contains deleteFlag filter
        verify(entityManager).createQuery(anyString(), eq(EmployeeDesignation.class));
    }

    @Test
    @DisplayName("Should filter parent designations with null parent ID")
    void getParentEmployeeDesignationForDropdownFiltersNullParentId() {
        // Arrange
        List<EmployeeDesignation> designations = Arrays.asList(
            createDesignationWithoutParent(1, "CEO")
        );

        when(entityManager.createQuery(anyString(), eq(EmployeeDesignation.class))).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(designations);

        // Act
        List<DropdownObjectModel> results = employeeDesignationDao.getParentEmployeeDesignationForDropdown();

        // Assert
        assertThat(results).isNotNull();
        assertThat(results).hasSize(1);
        // Verify query contains parentId=null filter
        verify(entityManager).createQuery(anyString(), eq(EmployeeDesignation.class));
    }

    private EmployeeDesignation createTestEmployeeDesignation() {
        EmployeeDesignation designation = new EmployeeDesignation();
        designation.setId(1);
        designation.setDesignationName("Senior Developer");
        designation.setDesignationId(100);
        designation.setParentId(10);
        designation.setCreatedBy(1);
        designation.setCreatedDate(LocalDateTime.now());
        designation.setDeleteFlag(false);
        designation.setVersionNumber(1);
        return designation;
    }

    private EmployeeDesignation createDesignation(Integer id, String name) {
        EmployeeDesignation designation = new EmployeeDesignation();
        designation.setId(id);
        designation.setDesignationName(name);
        designation.setDeleteFlag(false);
        return designation;
    }

    private EmployeeDesignation createDesignationWithoutParent(Integer id, String name) {
        EmployeeDesignation designation = new EmployeeDesignation();
        designation.setId(id);
        designation.setDesignationName(name);
        designation.setParentId(null);
        designation.setDeleteFlag(false);
        return designation;
    }
}
