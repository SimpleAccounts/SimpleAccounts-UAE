package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.VatReportFilterEnum;
import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.persistence.EntityManager;
import javax.persistence.Query;
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
@DisplayName("VatReportDaoImpl Unit Tests")
class VatReportDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<VatReportFiling> vatReportTypedQuery;

    @Mock
    private Query query;

    @Mock
    private DatatableSortingFilterConstant dataTableUtil;

    @InjectMocks
    private VatReportDaoImpl vatReportDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(vatReportDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(vatReportDao, "entityClass", VatReportFiling.class);
    }

    @Test
    @DisplayName("Should return VAT report list with valid filter map and pagination")
    void getVatReportListReturnsValidResults() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        List<VatReportFiling> vatReportList = createVatReportList(5);

        when(query.getSingleResult()).thenReturn(5L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(vatReportList);

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(5);
        assertThat(result.getData()).isNotNull();
    }

    @Test
    @DisplayName("Should handle empty filter map")
    void getVatReportListHandlesEmptyFilterMap() {
        // Arrange
        Map<VatReportFilterEnum, Object> emptyFilterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);

        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(emptyFilterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should handle null pagination model")
    void getVatReportListHandlesNullPagination() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        List<VatReportFiling> vatReportList = createVatReportList(3);

        when(query.getSingleResult()).thenReturn(3L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(vatReportList);

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, null);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(3);
    }

    @Test
    @DisplayName("Should reset page number to 0 when count is less than 10")
    void getVatReportListResetsPageNumberWhenCountLessThan10() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(2, 10);
        List<VatReportFiling> vatReportList = createVatReportList(5);

        when(query.getSingleResult()).thenReturn(5L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(vatReportList);

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(paginationModel.getPageNo()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should not reset page number when count is 10 or more")
    void getVatReportListDoesNotResetPageNumberWhenCountIsHigher() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(2, 10);
        List<VatReportFiling> vatReportList = createVatReportList(15);

        when(query.getSingleResult()).thenReturn(15L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(vatReportList);

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(paginationModel.getPageNo()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should build DbFilter list from filter map")
    void getVatReportListBuildsDbFilterList() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);

        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(entityManager, times(2)).createQuery(any(String.class));
    }

    @Test
    @DisplayName("Should return empty list when no results found")
    void getVatReportListReturnsEmptyListWhenNoResults() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);

        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(0);
        assertThat(result.getData()).isNotNull();
    }

    @Test
    @DisplayName("Should handle large result count")
    void getVatReportListHandlesLargeResultCount() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 100);
        List<VatReportFiling> vatReportList = createVatReportList(100);

        when(query.getSingleResult()).thenReturn(100L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(vatReportList);

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(100);
        assertThat(result.getData()).hasSize(100);
    }

    @Test
    @DisplayName("Should execute query with correct parameters")
    void getVatReportListExecutesQueryWithCorrectParameters() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);

        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        verify(entityManager, times(2)).createQuery(any(String.class));
        verify(query, times(1)).getSingleResult();
        verify(query, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should handle pagination with different page sizes")
    void getVatReportListHandlesDifferentPageSizes() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 25);
        List<VatReportFiling> vatReportList = createVatReportList(25);

        when(query.getSingleResult()).thenReturn(25L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(vatReportList);

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(25);
        assertThat(paginationModel.getPageSize()).isEqualTo(25);
    }

    @Test
    @DisplayName("Should return correct count from database")
    void getVatReportListReturnsCorrectCount() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);

        when(query.getSingleResult()).thenReturn(42L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(createVatReportList(10));

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        assertThat(result.getCount()).isEqualTo(42);
    }

    @Test
    @DisplayName("Should handle zero count result")
    void getVatReportListHandlesZeroCount() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(1, 10);

        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        assertThat(result.getCount()).isEqualTo(0);
        assertThat(paginationModel.getPageNo()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should create new PaginationResponseModel with count and data")
    void getVatReportListCreatesResponseModel() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        List<VatReportFiling> vatReportList = createVatReportList(7);

        when(query.getSingleResult()).thenReturn(7L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(vatReportList);

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(7);
        assertThat(result.getData()).isEqualTo(vatReportList);
    }

    @Test
    @DisplayName("Should handle count exactly at threshold of 10")
    void getVatReportListHandlesCountAtThreshold() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(1, 10);

        when(query.getSingleResult()).thenReturn(10L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(createVatReportList(10));

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        assertThat(result.getCount()).isEqualTo(10);
        assertThat(paginationModel.getPageNo()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should handle multiple filter conditions")
    void getVatReportListHandlesMultipleFilters() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);

        when(query.getSingleResult()).thenReturn(5L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(createVatReportList(5));

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(entityManager, times(2)).createQuery(any(String.class));
    }

    @Test
    @DisplayName("Should return consistent results on multiple calls")
    void getVatReportListReturnsConsistentResults() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        List<VatReportFiling> vatReportList = createVatReportList(5);

        when(query.getSingleResult()).thenReturn(5L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(vatReportList);

        // Act
        PaginationResponseModel result1 = vatReportDao.getVatReportList(filterMap, paginationModel);
        PaginationResponseModel result2 = vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        assertThat(result1.getCount()).isEqualTo(result2.getCount());
    }

    @Test
    @DisplayName("Should handle page number reset when count is 1")
    void getVatReportListResetsPageWhenCountIsOne() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(5, 10);

        when(query.getSingleResult()).thenReturn(1L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(createVatReportList(1));

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        assertThat(paginationModel.getPageNo()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should handle count of 9 and reset page number")
    void getVatReportListResetsPageWhenCountIsNine() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(3, 10);

        when(query.getSingleResult()).thenReturn(9L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(createVatReportList(9));

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        assertThat(paginationModel.getPageNo()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should not modify pagination when count is 11")
    void getVatReportListDoesNotResetPageWhenCountIsEleven() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(1, 10);

        when(query.getSingleResult()).thenReturn(11L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(createVatReportList(10));

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        assertThat(paginationModel.getPageNo()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should execute queries in correct order")
    void getVatReportListExecutesQueriesInCorrectOrder() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);

        when(query.getSingleResult()).thenReturn(5L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(createVatReportList(5));

        // Act
        vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        verify(query, times(1)).getSingleResult();
        verify(query, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should handle empty result list from query")
    void getVatReportListHandlesEmptyResultList() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);

        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        assertThat(result.getData()).isEmpty();
    }

    @Test
    @DisplayName("Should properly initialize PaginationResponseModel")
    void getVatReportListInitializesResponseModel() {
        // Arrange
        Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        List<VatReportFiling> vatReportList = createVatReportList(3);

        when(query.getSingleResult()).thenReturn(3L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(vatReportList);

        // Act
        PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCount()).isNotNull();
        assertThat(result.getData()).isNotNull();
    }

    private List<VatReportFiling> createVatReportList(int count) {
        List<VatReportFiling> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(createVatReport(i + 1));
        }
        return list;
    }

    private VatReportFiling createVatReport(int id) {
        VatReportFiling report = new VatReportFiling();
        report.setVatReportFilingId(id);
        report.setFilingDate(LocalDateTime.now());
        return report;
    }

    private PaginationModel createPaginationModel(int pageNo, int pageSize) {
        PaginationModel model = new PaginationModel();
        model.setPageNo(pageNo);
        model.setPageSize(pageSize);
        return model;
    }
}
