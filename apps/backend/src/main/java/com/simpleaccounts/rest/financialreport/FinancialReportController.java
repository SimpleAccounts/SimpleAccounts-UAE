package com.simpleaccounts.rest.financialreport;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.model.TrialBalanceResponseModel;
import com.simpleaccounts.model.VatReportResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.UserService;
import io.swagger.annotations.ApiOperation;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/rest/financialReport")
@RequiredArgsConstructor
public class FinancialReportController {

	private final Logger logger = LoggerFactory.getLogger(FinancialReportController.class);

	private final FinancialReportRestHelper financialReportRestHelper;

	private final UserService userService;

	private final JwtTokenUtil jwtTokenUtil;

	@LogRequest
	@ApiOperation(value = "Get Profit and Loss Report")
	@GetMapping(value = "/profitandloss")
	public ResponseEntity<ProfitAndLossResponseModel> getFormat(FinancialReportRequestModel reportRequestModel,
																HttpServletRequest request) {
		ProfitAndLossResponseModel profitAndLossResponseModel = financialReportRestHelper.getProfitAndLossReport(reportRequestModel);
		try {
			if (profitAndLossResponseModel == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(profitAndLossResponseModel, HttpStatus.OK);
	}

	@LogRequest
	@ApiOperation(value = "Get BalanceSheet Report")
	@GetMapping(value = "/balanceSheet")
	public ResponseEntity<BalanceSheetResponseModel> getFormatBalanceSheet(FinancialReportRequestModel reportRequestModel,
																		   HttpServletRequest request) {
		BalanceSheetResponseModel balanceSheetResponseModel = financialReportRestHelper.getBalanceSheetReport(reportRequestModel);

		try {
			if (balanceSheetResponseModel == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(balanceSheetResponseModel, HttpStatus.OK);
	}

	@LogRequest
	@ApiOperation(value = "GetTrial Balance Report")
	@GetMapping(value = "/trialBalanceReport")
	public ResponseEntity<TrialBalanceResponseModel> getTrialBalanceReport(FinancialReportRequestModel reportRequestModel,
																		   HttpServletRequest request) {
		TrialBalanceResponseModel trialBalanceResponseModel = financialReportRestHelper.getTrialBalanceReport(reportRequestModel);
		try {
			if (trialBalanceResponseModel == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(trialBalanceResponseModel, HttpStatus.OK);
	}

	@LogRequest
	@ApiOperation(value = "Get Vat Return Report")
	@GetMapping(value = "/vatReturnReport")
	public ResponseEntity<VatReportResponseModel> getvatReturnReport(FinancialReportRequestModel reportRequestModel,
																	 HttpServletRequest request) {
		VatReportResponseModel vatReportResponseModel = financialReportRestHelper.getVatReturnReport(reportRequestModel);
		try {
			if (vatReportResponseModel == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(vatReportResponseModel, HttpStatus.OK);
	}

	@LogRequest
	@ApiOperation(value = "Get CashFlow Report")
	@GetMapping(value = "/cashflow")
	public ResponseEntity<CashFlowResponseModel> getFormatCashFlow(FinancialReportRequestModel reportRequestModel,
																HttpServletRequest request) {
		CashFlowResponseModel cashFlowResponseModel = financialReportRestHelper.getCashFlowReport(reportRequestModel);
		try {
			if (cashFlowResponseModel == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(cashFlowResponseModel, HttpStatus.OK);
	}

}
