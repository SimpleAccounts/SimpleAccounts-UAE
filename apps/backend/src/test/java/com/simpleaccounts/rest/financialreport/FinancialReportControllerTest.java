package com.simpleaccounts.rest.financialreport;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
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
        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(11);
        when(userService.findByPK(11)).thenReturn(buildUser(1));
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
        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(22);
        when(userService.findByPK(22)).thenReturn(buildUser(2));
        when(financialReportRestHelper.getProfitAndLossReport(any())).thenReturn(null);

        ResponseEntity<ProfitAndLossResponseModel> response =
                controller.getFormat(new FinancialReportRequestModel(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getVatReturnReportShouldReturnOk() {
        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(33);
        when(userService.findByPK(33)).thenReturn(buildUser(3));
        VatReportResponseModel vatReport = new VatReportResponseModel();
        when(financialReportRestHelper.getVatReturnReport(any())).thenReturn(vatReport);

        ResponseEntity<com.simpleaccounts.model.VatReportResponseModel> response =
                controller.getvatReturnReport(new FinancialReportRequestModel(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(vatReport);
    }

    @Test
    void getVatReturnReportShouldReturnNotFoundWhenNull() {
        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(44);
        when(userService.findByPK(44)).thenReturn(buildUser(2));
        when(financialReportRestHelper.getVatReturnReport(any())).thenReturn(null);

        ResponseEntity<VatReportResponseModel> response =
                controller.getvatReturnReport(new FinancialReportRequestModel(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getTrialBalanceShouldPropagateHelperResponse() {
        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(55);
        when(userService.findByPK(55)).thenReturn(buildUser(1));
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
        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(66);
        when(userService.findByPK(66)).thenReturn(buildUser(3));
        when(financialReportRestHelper.getCashFlowReport(any())).thenReturn(null);

        ResponseEntity<CashFlowResponseModel> response =
                controller.getFormatCashFlow(new FinancialReportRequestModel(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(financialReportRestHelper, times(1)).getCashFlowReport(any());
    }

    private User buildUser(int roleCode) {
        Role role = new Role();
        role.setRoleCode(roleCode);
        User user = new User();
        user.setRole(role);
        return user;
    }
}









