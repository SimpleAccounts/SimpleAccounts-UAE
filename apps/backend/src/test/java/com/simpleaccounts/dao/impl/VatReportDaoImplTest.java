package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.VatReportFilterEnum;
import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
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
    private DatatableSortingFilterConstant dataTableUtil;

    @Mock
    private TypedQuery<VatReportFiling> typedQuery;

    @Mock
    private TypedQuery<Long> countQuery;

    @Mock
    private CriteriaBuilder criteriaBuilder;

    @Mock
    private CriteriaQuery<VatReportFiling> criteriaQuery;

    @Mock
    private CriteriaQuery<Long> countCriteriaQuery;

    @Mock
    private Root<VatReportFiling> root;

    @InjectMocks
    private VatReportDaoImpl vatReportDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(vatReportDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(vatReportDao, "entityClass", VatReportFiling.class);
    }

    @Nested
    @DisplayName("getVatReportList Tests")
    class GetVatReportListTests {

        @Test
        @DisplayName("Should return VAT report list with pagination response")
        void getVatReportListReturnsPaginationResponse() {
            // Arrange
            Map<VatReportFilterEnum, Object> filterMap = new EnumMap<>(VatReportFilterEnum.class);
            filterMap.put(VatReportFilterEnum.DELETE_FLAG, false);
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNo(0);
            paginationModel.setPageSize(10);

            List<VatReportFiling> expectedList = createVatReportFilingList(5);

            when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
            when(criteriaBuilder.createQuery(VatReportFiling.class)).thenReturn(criteriaQuery);
            when(criteriaBuilder.createQuery(Long.class)).thenReturn(countCriteriaQuery);
            when(criteriaQuery.from(VatReportFiling.class)).thenReturn(root);
            when(countCriteriaQuery.from(VatReportFiling.class)).thenReturn(root);
            when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
            when(entityManager.createQuery(countCriteriaQuery)).thenReturn(countQuery);
            when(typedQuery.getResultList()).thenReturn(expectedList);
            when(countQuery.getSingleResult()).thenReturn(5L);

            // Act
            PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(5);
        }

        @Test
        @DisplayName("Should reset page number when count is less than 10")
        void getVatReportListResetsPageNoForSmallResults() {
            // Arrange
            Map<VatReportFilterEnum, Object> filterMap = new EnumMap<>(VatReportFilterEnum.class);
            filterMap.put(VatReportFilterEnum.DELETE_FLAG, false);
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNo(5);
            paginationModel.setPageSize(10);

            List<VatReportFiling> expectedList = createVatReportFilingList(3);

            when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
            when(criteriaBuilder.createQuery(VatReportFiling.class)).thenReturn(criteriaQuery);
            when(criteriaBuilder.createQuery(Long.class)).thenReturn(countCriteriaQuery);
            when(criteriaQuery.from(VatReportFiling.class)).thenReturn(root);
            when(countCriteriaQuery.from(VatReportFiling.class)).thenReturn(root);
            when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
            when(entityManager.createQuery(countCriteriaQuery)).thenReturn(countQuery);
            when(typedQuery.getResultList()).thenReturn(expectedList);
            when(countQuery.getSingleResult()).thenReturn(3L);

            // Act
            PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(3);
            // Page number should be reset to 0 for results less than 10
            assertThat(paginationModel.getPageNo()).isEqualTo(0);
        }

        @Test
        @DisplayName("Should handle null pagination model")
        void getVatReportListHandlesNullPaginationModel() {
            // Arrange
            Map<VatReportFilterEnum, Object> filterMap = new EnumMap<>(VatReportFilterEnum.class);
            filterMap.put(VatReportFilterEnum.DELETE_FLAG, false);

            List<VatReportFiling> expectedList = createVatReportFilingList(2);

            when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
            when(criteriaBuilder.createQuery(VatReportFiling.class)).thenReturn(criteriaQuery);
            when(criteriaBuilder.createQuery(Long.class)).thenReturn(countCriteriaQuery);
            when(criteriaQuery.from(VatReportFiling.class)).thenReturn(root);
            when(countCriteriaQuery.from(VatReportFiling.class)).thenReturn(root);
            when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
            when(entityManager.createQuery(countCriteriaQuery)).thenReturn(countQuery);
            when(typedQuery.getResultList()).thenReturn(expectedList);
            when(countQuery.getSingleResult()).thenReturn(2L);

            // Act
            PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, null);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(2);
        }

        @Test
        @DisplayName("Should return empty list when no VAT reports exist")
        void getVatReportListReturnsEmptyList() {
            // Arrange
            Map<VatReportFilterEnum, Object> filterMap = new EnumMap<>(VatReportFilterEnum.class);
            filterMap.put(VatReportFilterEnum.DELETE_FLAG, false);
            PaginationModel paginationModel = new PaginationModel();

            when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
            when(criteriaBuilder.createQuery(VatReportFiling.class)).thenReturn(criteriaQuery);
            when(criteriaBuilder.createQuery(Long.class)).thenReturn(countCriteriaQuery);
            when(criteriaQuery.from(VatReportFiling.class)).thenReturn(root);
            when(countCriteriaQuery.from(VatReportFiling.class)).thenReturn(root);
            when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
            when(entityManager.createQuery(countCriteriaQuery)).thenReturn(countQuery);
            when(typedQuery.getResultList()).thenReturn(new ArrayList<>());
            when(countQuery.getSingleResult()).thenReturn(0L);

            // Act
            PaginationResponseModel result = vatReportDao.getVatReportList(filterMap, paginationModel);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(0);
        }
    }

    private List<VatReportFiling> createVatReportFilingList(int count) {
        List<VatReportFiling> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(createVatReportFiling(i + 1));
        }
        return list;
    }

    private VatReportFiling createVatReportFiling(Integer id) {
        VatReportFiling filing = new VatReportFiling();
        filing.setId(id);
        filing.setVatNumber("VAT-" + id);
        filing.setStartDate(LocalDate.now().minusMonths(3));
        filing.setEndDate(LocalDate.now());
        filing.setTotalTaxPayable(BigDecimal.valueOf(1000));
        filing.setTotalTaxReclaimable(BigDecimal.ZERO);
        filing.setBalanceDue(BigDecimal.valueOf(1000));
        filing.setStatus(1);
        filing.setDeleteFlag(false);
        return filing;
    }
}
