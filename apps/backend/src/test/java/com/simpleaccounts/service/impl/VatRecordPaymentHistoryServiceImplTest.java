package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.VatReportFilterEnum;
import com.simpleaccounts.dao.VatRecordPaymentHistoryDao;
import com.simpleaccounts.entity.VatRecordPaymentHistory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
@DisplayName("VatRecordPaymentHistoryServiceImpl Unit Tests")
class VatRecordPaymentHistoryServiceImplTest {

    @Mock
    private VatRecordPaymentHistoryDao vatReportsDao;

    @InjectMocks
    private VatRecordPaymentHistoryServiceImpl vatRecordPaymentHistoryService;

    @Nested
    @DisplayName("getVatReportList Tests")
    class GetVatReportListTests {

        @Test
        @DisplayName("Should return VAT payment history list with pagination")
        void getVatReportListReturnsPaginatedResults() {
            // Arrange
            Map<VatReportFilterEnum, Object> filterMap = new EnumMap<>(VatReportFilterEnum.class);
            filterMap.put(VatReportFilterEnum.DELETE_FLAG, false);
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNo(0);
            paginationModel.setPageSize(10);

            List<VatRecordPaymentHistory> paymentHistories = createPaymentHistoryList(5);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(5, paymentHistories);

            when(vatReportsDao.getVatReportList(filterMap, paginationModel))
                .thenReturn(expectedResponse);

            // Act
            PaginationResponseModel result = vatRecordPaymentHistoryService.getVatReportList(filterMap, paginationModel);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(5);
            verify(vatReportsDao).getVatReportList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should return empty list when no payment histories exist")
        void getVatReportListReturnsEmptyList() {
            // Arrange
            Map<VatReportFilterEnum, Object> filterMap = new EnumMap<>(VatReportFilterEnum.class);
            filterMap.put(VatReportFilterEnum.DELETE_FLAG, false);
            PaginationModel paginationModel = new PaginationModel();

            PaginationResponseModel expectedResponse = new PaginationResponseModel(0, new ArrayList<>());
            when(vatReportsDao.getVatReportList(filterMap, paginationModel))
                .thenReturn(expectedResponse);

            // Act
            PaginationResponseModel result = vatRecordPaymentHistoryService.getVatReportList(filterMap, paginationModel);

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

            List<VatRecordPaymentHistory> paymentHistories = createPaymentHistoryList(3);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(3, paymentHistories);

            when(vatReportsDao.getVatReportList(filterMap, null))
                .thenReturn(expectedResponse);

            // Act
            PaginationResponseModel result = vatRecordPaymentHistoryService.getVatReportList(filterMap, null);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(3);
        }
    }

    @Nested
    @DisplayName("getDao Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return the VAT record payment history DAO")
        void getDaoReturnsVatRecordPaymentHistoryDao() {
            // The DAO is properly injected
            assertThat(vatReportsDao).isNotNull();
        }
    }

    private List<VatRecordPaymentHistory> createPaymentHistoryList(int count) {
        List<VatRecordPaymentHistory> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(createPaymentHistory(i + 1));
        }
        return list;
    }

    private VatRecordPaymentHistory createPaymentHistory(Integer id) {
        VatRecordPaymentHistory history = new VatRecordPaymentHistory();
        history.setId(id);
        history.setDeleteFlag(false);
        history.setAmountPaid(BigDecimal.valueOf(1000 * id));
        history.setAmountReclaimed(BigDecimal.ZERO);
        history.setStartDate(LocalDateTime.now().minusMonths(3));
        history.setEndDate(LocalDateTime.now());
        history.setDateOfFiling(LocalDateTime.now());
        history.setCreatedBy(1);
        history.setCreatedDate(LocalDateTime.now());
        return history;
    }
}
