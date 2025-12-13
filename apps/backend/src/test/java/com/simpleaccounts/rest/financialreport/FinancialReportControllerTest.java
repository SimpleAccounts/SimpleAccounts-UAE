package com.simpleaccounts.rest.financialreport;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.model.TrialBalanceResponseModel;
import com.simpleaccounts.model.VatReportResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.UserService;
import javax.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class FinancialReportControllerTest {

    @Mock
    private FinancialReportRestHelper financialReportRestHelper;
    @Mock
    private UserService userService;
    @Mock
    private JwtTokenUtil jwtTokenUtil;
    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private FinancialReportController controller;

    @Test
    void getProfitAndLossShouldReturnOkWhenReportExists() {
        ProfitAndLossResponseModel responseModel = new ProfitAndLossResponseModel();
        when(financialReportRestHelper.getProfitAndLossReport(any())).thenReturn(responseModel);

        ResponseEntity<ProfitAndLossResponseModel> response =
                controller.getFormat(new FinancialReportRequestModel(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(responseModel);
        verify(financialReportRestHelper).getProfitAndLossReport(any());
    }

    @Test
    void getProfitAndLossShouldReturnNotFoundWhenHelperReturnsNull() {
        when(financialReportRestHelper.getProfitAndLossReport(any())).thenReturn(null);

        ResponseEntity<ProfitAndLossResponseModel> response =
                controller.getFormat(new FinancialReportRequestModel(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getVatReturnReportShouldReturnOk() {
        VatReportResponseModel vatReport = new VatReportResponseModel();
        when(financialReportRestHelper.getVatReturnReport(any())).thenReturn(vatReport);

        ResponseEntity<com.simpleaccounts.model.VatReportResponseModel> response =
                controller.getvatReturnReport(new FinancialReportRequestModel(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(vatReport);
    }

    @Test
    void getVatReturnReportShouldReturnNotFoundWhenNull() {
        when(financialReportRestHelper.getVatReturnReport(any())).thenReturn(null);

        ResponseEntity<VatReportResponseModel> response =
                controller.getvatReturnReport(new FinancialReportRequestModel(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getTrialBalanceShouldPropagateHelperResponse() {
        TrialBalanceResponseModel model = new TrialBalanceResponseModel();
        when(financialReportRestHelper.getTrialBalanceReport(any())).thenReturn(model);

        ResponseEntity<TrialBalanceResponseModel> response =
                controller.getTrialBalanceReport(new FinancialReportRequestModel(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(model);
        verify(financialReportRestHelper).getTrialBalanceReport(any());
    }

    @Test
    void getCashFlowShouldReturnNotFoundWhenNull() {
        when(financialReportRestHelper.getCashFlowReport(any())).thenReturn(null);

        ResponseEntity<CashFlowResponseModel> response =
                controller.getFormatCashFlow(new FinancialReportRequestModel(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(financialReportRestHelper, times(1)).getCashFlowReport(any());
    }
}

