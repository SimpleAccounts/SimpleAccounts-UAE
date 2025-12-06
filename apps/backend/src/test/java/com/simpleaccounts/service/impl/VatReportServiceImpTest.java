package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.VatReportFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.VatReportsDao;
import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("VatReportServiceImp Tests")
class VatReportServiceImpTest {

    @Mock
    private VatReportsDao vatReportsDao;

    @InjectMocks
    private VatReportServiceImp vatReportService;

    private VatReportFiling testVatReport;
    private Integer vatReportId;

    @BeforeEach
    void setUp() {
        vatReportId = 1;
        testVatReport = createTestVatReport(vatReportId);
    }

    private VatReportFiling createTestVatReport(Integer id) {
        VatReportFiling vatReport = new VatReportFiling();
        vatReport.setId(id);
        vatReport.setCreatedDate(LocalDateTime.now());
        vatReport.setLastUpdateDate(LocalDateTime.now());
        vatReport.setDeleteFlag(false);
        vatReport.setVersionNumber(1);
        return vatReport;
    }

    @Nested
    @DisplayName("getDao() Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return VatReportsDao instance")
        void shouldReturnVatReportsDao() {
            Dao<Integer, VatReportFiling> result = vatReportService.getDao();

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(vatReportsDao);
            assertThat(result).isInstanceOf(VatReportsDao.class);
        }

        @Test
        @DisplayName("Should return same DAO instance on multiple calls")
        void shouldReturnSameDaoInstanceOnMultipleCalls() {
            Dao<Integer, VatReportFiling> result1 = vatReportService.getDao();
            Dao<Integer, VatReportFiling> result2 = vatReportService.getDao();

            assertThat(result1).isSameAs(result2);
            assertThat(result1).isEqualTo(vatReportsDao);
        }

        @Test
        @DisplayName("Should not return null")
        void shouldNotReturnNull() {
            assertThat(vatReportService.getDao()).isNotNull();
        }

        @Test
        @DisplayName("Should return correct DAO type")
        void shouldReturnCorrectDaoType() {
            Dao<Integer, VatReportFiling> dao = vatReportService.getDao();
            assertThat(dao).isInstanceOf(VatReportsDao.class);
        }
    }

    @Nested
    @DisplayName("getVatReportList() Tests")
    class GetVatReportListTests {

        @Test
        @DisplayName("Should get VAT report list with filter and pagination")
        void shouldGetVatReportListWithFilterAndPagination() {
            Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
            filterMap.put(VatReportFilterEnum.VAT_REPORT_ID, 1);
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNumber(1);
            paginationModel.setRecordPerPage(10);

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            expectedResponse.setRecords(Arrays.asList(testVatReport));
            expectedResponse.setTotalRecords(1L);

            when(vatReportsDao.getVatReportList(filterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = vatReportService.getVatReportList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            assertThat(result).isSameAs(expectedResponse);
            assertThat(result.getTotalRecords()).isEqualTo(1L);
            verify(vatReportsDao, times(1)).getVatReportList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should handle empty filter map")
        void shouldHandleEmptyFilterMap() {
            Map<VatReportFilterEnum, Object> emptyFilterMap = new HashMap<>();
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNumber(1);
            paginationModel.setRecordPerPage(20);

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(vatReportsDao.getVatReportList(emptyFilterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = vatReportService.getVatReportList(emptyFilterMap, paginationModel);

            assertThat(result).isNotNull();
            verify(vatReportsDao, times(1)).getVatReportList(emptyFilterMap, paginationModel);
        }

        @Test
        @DisplayName("Should handle null filter map")
        void shouldHandleNullFilterMap() {
            PaginationModel paginationModel = new PaginationModel();

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(vatReportsDao.getVatReportList(null, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = vatReportService.getVatReportList(null, paginationModel);

            assertThat(result).isNotNull();
            verify(vatReportsDao, times(1)).getVatReportList(null, paginationModel);
        }

        @Test
        @DisplayName("Should handle null pagination model")
        void shouldHandleNullPaginationModel() {
            Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(vatReportsDao.getVatReportList(filterMap, null))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = vatReportService.getVatReportList(filterMap, null);

            assertThat(result).isNotNull();
            verify(vatReportsDao, times(1)).getVatReportList(filterMap, null);
        }

        @Test
        @DisplayName("Should handle both null filter and pagination")
        void shouldHandleBothNullFilterAndPagination() {
            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(vatReportsDao.getVatReportList(null, null))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = vatReportService.getVatReportList(null, null);

            assertThat(result).isNotNull();
            verify(vatReportsDao, times(1)).getVatReportList(null, null);
        }

        @Test
        @DisplayName("Should handle multiple filter criteria")
        void shouldHandleMultipleFilterCriteria() {
            Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
            filterMap.put(VatReportFilterEnum.VAT_REPORT_ID, 1);
            filterMap.put(VatReportFilterEnum.COMPANY_ID, 100);
            filterMap.put(VatReportFilterEnum.FROM_DATE, LocalDateTime.now().minusDays(30));
            filterMap.put(VatReportFilterEnum.TO_DATE, LocalDateTime.now());

            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNumber(1);
            paginationModel.setRecordPerPage(10);

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(vatReportsDao.getVatReportList(filterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = vatReportService.getVatReportList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            verify(vatReportsDao, times(1)).getVatReportList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should handle different page numbers")
        void shouldHandleDifferentPageNumbers() {
            Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNumber(5);
            paginationModel.setRecordPerPage(25);

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(vatReportsDao.getVatReportList(filterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = vatReportService.getVatReportList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            verify(vatReportsDao, times(1)).getVatReportList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should handle large page sizes")
        void shouldHandleLargePageSizes() {
            Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNumber(1);
            paginationModel.setRecordPerPage(1000);

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(vatReportsDao.getVatReportList(filterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = vatReportService.getVatReportList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            verify(vatReportsDao, times(1)).getVatReportList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should return empty list when no records found")
        void shouldReturnEmptyListWhenNoRecordsFound() {
            Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
            filterMap.put(VatReportFilterEnum.VAT_REPORT_ID, 999);
            PaginationModel paginationModel = new PaginationModel();

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            expectedResponse.setRecords(Collections.emptyList());
            expectedResponse.setTotalRecords(0L);

            when(vatReportsDao.getVatReportList(filterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = vatReportService.getVatReportList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            assertThat(result.getRecords()).isEmpty();
            assertThat(result.getTotalRecords()).isZero();
        }

        @Test
        @DisplayName("Should return multiple records")
        void shouldReturnMultipleRecords() {
            Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
            PaginationModel paginationModel = new PaginationModel();

            List<VatReportFiling> reports = Arrays.asList(
                    createTestVatReport(1),
                    createTestVatReport(2),
                    createTestVatReport(3)
            );

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            expectedResponse.setRecords(reports);
            expectedResponse.setTotalRecords(3L);

            when(vatReportsDao.getVatReportList(filterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = vatReportService.getVatReportList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            assertThat(result.getRecords()).hasSize(3);
            assertThat(result.getTotalRecords()).isEqualTo(3L);
        }

        @Test
        @DisplayName("Should handle filter by company ID")
        void shouldHandleFilterByCompanyId() {
            Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
            filterMap.put(VatReportFilterEnum.COMPANY_ID, 500);
            PaginationModel paginationModel = new PaginationModel();

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(vatReportsDao.getVatReportList(filterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = vatReportService.getVatReportList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            verify(vatReportsDao, times(1)).getVatReportList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should handle filter by date range")
        void shouldHandleFilterByDateRange() {
            Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
            filterMap.put(VatReportFilterEnum.FROM_DATE, LocalDateTime.now().minusDays(60));
            filterMap.put(VatReportFilterEnum.TO_DATE, LocalDateTime.now());
            PaginationModel paginationModel = new PaginationModel();

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(vatReportsDao.getVatReportList(filterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = vatReportService.getVatReportList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            verify(vatReportsDao, times(1)).getVatReportList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should handle page number zero")
        void shouldHandlePageNumberZero() {
            Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNumber(0);
            paginationModel.setRecordPerPage(10);

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(vatReportsDao.getVatReportList(filterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = vatReportService.getVatReportList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            verify(vatReportsDao, times(1)).getVatReportList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should handle negative page number")
        void shouldHandleNegativePageNumber() {
            Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNumber(-1);
            paginationModel.setRecordPerPage(10);

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(vatReportsDao.getVatReportList(filterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = vatReportService.getVatReportList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            verify(vatReportsDao, times(1)).getVatReportList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should delegate to DAO correctly")
        void shouldDelegateToDaoCorrectly() {
            Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
            filterMap.put(VatReportFilterEnum.VAT_REPORT_ID, 123);
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNumber(2);
            paginationModel.setRecordPerPage(15);

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(vatReportsDao.getVatReportList(eq(filterMap), eq(paginationModel)))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = vatReportService.getVatReportList(filterMap, paginationModel);

            assertThat(result).isSameAs(expectedResponse);
            verify(vatReportsDao, times(1)).getVatReportList(eq(filterMap), eq(paginationModel));
        }

        @Test
        @DisplayName("Should handle filter with status")
        void shouldHandleFilterWithStatus() {
            Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
            filterMap.put(VatReportFilterEnum.STATUS, "FILED");
            PaginationModel paginationModel = new PaginationModel();

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(vatReportsDao.getVatReportList(filterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = vatReportService.getVatReportList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            verify(vatReportsDao, times(1)).getVatReportList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should handle large result set")
        void shouldHandleLargeResultSet() {
            Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNumber(1);
            paginationModel.setRecordPerPage(100);

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            expectedResponse.setTotalRecords(10000L);

            when(vatReportsDao.getVatReportList(filterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = vatReportService.getVatReportList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            assertThat(result.getTotalRecords()).isEqualTo(10000L);
        }
    }

    @Nested
    @DisplayName("Service Behavior Tests")
    class ServiceBehaviorTests {

        @Test
        @DisplayName("Should be annotated with @Service")
        void shouldBeAnnotatedWithService() {
            assertThat(vatReportService).isNotNull();
            assertThat(vatReportService.getClass().isAnnotationPresent(
                    org.springframework.stereotype.Service.class)).isTrue();
        }

        @Test
        @DisplayName("Should extend VatReportService")
        void shouldExtendVatReportService() {
            assertThat(vatReportService)
                    .isInstanceOf(com.simpleaccounts.service.VatReportService.class);
        }

        @Test
        @DisplayName("Should have correct service name")
        void shouldHaveCorrectServiceName() {
            org.springframework.stereotype.Service annotation =
                    vatReportService.getClass().getAnnotation(
                            org.springframework.stereotype.Service.class);
            assertThat(annotation.value()).isEqualTo("VatReportService");
        }

        @Test
        @DisplayName("Should have VatReportsDao autowired")
        void shouldHaveVatReportsDaoAutowired() {
            assertThat(vatReportService.getDao()).isNotNull();
        }
    }

    @Nested
    @DisplayName("Integration Tests")
    class IntegrationTests {

        @Test
        @DisplayName("Should work with consecutive calls")
        void shouldWorkWithConsecutiveCalls() {
            Map<VatReportFilterEnum, Object> filterMap1 = new HashMap<>();
            filterMap1.put(VatReportFilterEnum.VAT_REPORT_ID, 1);
            Map<VatReportFilterEnum, Object> filterMap2 = new HashMap<>();
            filterMap2.put(VatReportFilterEnum.VAT_REPORT_ID, 2);

            PaginationModel paginationModel = new PaginationModel();
            PaginationResponseModel response1 = new PaginationResponseModel();
            PaginationResponseModel response2 = new PaginationResponseModel();

            when(vatReportsDao.getVatReportList(filterMap1, paginationModel))
                    .thenReturn(response1);
            when(vatReportsDao.getVatReportList(filterMap2, paginationModel))
                    .thenReturn(response2);

            PaginationResponseModel result1 = vatReportService.getVatReportList(filterMap1, paginationModel);
            PaginationResponseModel result2 = vatReportService.getVatReportList(filterMap2, paginationModel);

            assertThat(result1).isSameAs(response1);
            assertThat(result2).isSameAs(response2);
            verify(vatReportsDao, times(1)).getVatReportList(filterMap1, paginationModel);
            verify(vatReportsDao, times(1)).getVatReportList(filterMap2, paginationModel);
        }

        @Test
        @DisplayName("Should handle repeated calls with same parameters")
        void shouldHandleRepeatedCallsWithSameParameters() {
            Map<VatReportFilterEnum, Object> filterMap = new HashMap<>();
            PaginationModel paginationModel = new PaginationModel();
            PaginationResponseModel expectedResponse = new PaginationResponseModel();

            when(vatReportsDao.getVatReportList(filterMap, paginationModel))
                    .thenReturn(expectedResponse);

            vatReportService.getVatReportList(filterMap, paginationModel);
            vatReportService.getVatReportList(filterMap, paginationModel);
            vatReportService.getVatReportList(filterMap, paginationModel);

            verify(vatReportsDao, times(3)).getVatReportList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should maintain DAO instance across calls")
        void shouldMaintainDaoInstanceAcrossCalls() {
            Dao<Integer, VatReportFiling> dao1 = vatReportService.getDao();
            Dao<Integer, VatReportFiling> dao2 = vatReportService.getDao();
            Dao<Integer, VatReportFiling> dao3 = vatReportService.getDao();

            assertThat(dao1).isSameAs(dao2).isSameAs(dao3);
        }
    }
}
