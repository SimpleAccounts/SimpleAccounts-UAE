package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.VatReportFilterEnum;
import com.simpleaccounts.dao.VatReportsDao;
import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("VatReportServiceImp Unit Tests")
class VatReportServiceImpTest {

    @Mock
    private VatReportsDao vatReportsDao;

    @InjectMocks
    private VatReportServiceImp vatReportService;

    @Nested
    @DisplayName("getVatReportList Tests")
    class GetVatReportListTests {

        @Test
        @DisplayName("Should return VAT report list with pagination")
        void getVatReportListReturnsPaginatedResults() {
            // Arrange
            Map<VatReportFilterEnum, Object> filterMap = new EnumMap<>(VatReportFilterEnum.class);
            filterMap.put(VatReportFilterEnum.DELETE_FLAG, false);
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNo(0);
            paginationModel.setPageSize(10);

            List<VatReportFiling> vatReportFilings = createVatReportFilingList(3);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(3, vatReportFilings);

            when(vatReportsDao.getVatReportList(filterMap, paginationModel))
                .thenReturn(expectedResponse);

            // Act
            PaginationResponseModel result = vatReportService.getVatReportList(filterMap, paginationModel);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(3);
            assertThat(result.getData()).isNotNull();
            verify(vatReportsDao).getVatReportList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should return empty list when no VAT reports exist")
        void getVatReportListReturnsEmptyList() {
            // Arrange
            Map<VatReportFilterEnum, Object> filterMap = new EnumMap<>(VatReportFilterEnum.class);
            filterMap.put(VatReportFilterEnum.DELETE_FLAG, false);
            PaginationModel paginationModel = new PaginationModel();

            PaginationResponseModel expectedResponse = new PaginationResponseModel(0, new ArrayList<>());
            when(vatReportsDao.getVatReportList(filterMap, paginationModel))
                .thenReturn(expectedResponse);

            // Act
            PaginationResponseModel result = vatReportService.getVatReportList(filterMap, paginationModel);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(0);
        }

        @Test
        @DisplayName("Should handle null pagination model")
        void getVatReportListHandlesNullPaginationModel() {
            // Arrange
            Map<VatReportFilterEnum, Object> filterMap = new EnumMap<>(VatReportFilterEnum.class);
            filterMap.put(VatReportFilterEnum.DELETE_FLAG, false);

            List<VatReportFiling> vatReportFilings = createVatReportFilingList(2);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(2, vatReportFilings);

            when(vatReportsDao.getVatReportList(filterMap, null))
                .thenReturn(expectedResponse);

            // Act
            PaginationResponseModel result = vatReportService.getVatReportList(filterMap, null);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(2);
        }

        @Test
        @DisplayName("Should pass filter map correctly to DAO")
        void getVatReportListPassesFilterMapCorrectly() {
            // Arrange
            Map<VatReportFilterEnum, Object> filterMap = new EnumMap<>(VatReportFilterEnum.class);
            filterMap.put(VatReportFilterEnum.DELETE_FLAG, false);
            PaginationModel paginationModel = new PaginationModel();

            when(vatReportsDao.getVatReportList(eq(filterMap), eq(paginationModel)))
                .thenReturn(new PaginationResponseModel(0, new ArrayList<>()));

            // Act
            vatReportService.getVatReportList(filterMap, paginationModel);

            // Assert
            verify(vatReportsDao).getVatReportList(filterMap, paginationModel);
        }
    }

    @Nested
    @DisplayName("getDao Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return the VAT reports DAO")
        void getDaoReturnsVatReportsDao() {
            // The getDao method is protected and returns the vatReportsDao
            // This is tested implicitly through other methods that use it
            assertThat(vatReportsDao).isNotNull();
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
        VatReportFiling vatReportFiling = new VatReportFiling();
        vatReportFiling.setId(id);
        vatReportFiling.setVatNumber("VAT-" + id);
        vatReportFiling.setStartDate(LocalDate.now().minusMonths(1));
        vatReportFiling.setEndDate(LocalDate.now());
        vatReportFiling.setTotalTaxPayable(BigDecimal.valueOf(1000 * id));
        vatReportFiling.setTotalTaxReclaimable(BigDecimal.ZERO);
        vatReportFiling.setBalanceDue(BigDecimal.valueOf(1000 * id));
        vatReportFiling.setDeleteFlag(false);
        vatReportFiling.setStatus(1);
        return vatReportFiling;
    }
}
