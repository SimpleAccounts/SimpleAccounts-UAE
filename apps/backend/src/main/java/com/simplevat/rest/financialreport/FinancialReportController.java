package com.simplevat.rest.financialreport;

import java.util.EnumMap;
import java.util.Map;

import com.simplevat.aop.LogRequest;
import com.simplevat.constant.dbfilter.VatCategoryFilterEnum;
import com.simplevat.entity.User;
import com.simplevat.model.TrialBalanceResponseModel;
import com.simplevat.model.VatReportResponseModel;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.simplevat.constant.dbfilter.DateFormatFilterEnum;

import io.swagger.annotations.ApiOperation;

import javax.servlet.http.HttpServletRequest;

import static com.simplevat.constant.ErrorConstant.ERROR;

@RestController
@RequestMapping("/rest/financialReport")
public class FinancialReportController {

	private final Logger logger = LoggerFactory.getLogger(FinancialReportController.class);

	@Autowired
	private FinancialReportRestHelper financialReportRestHelper;

	@Autowired
	private UserService userService;

	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	@LogRequest
	@ApiOperation(value = "Get Profit and Loss Report")
	@GetMapping(value = "/profitandloss")
	public ResponseEntity<ProfitAndLossResponseModel> getFormat(FinancialReportRequestModel reportRequestModel,
																HttpServletRequest request) {
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		User user = userService.findByPK(userId);
		Map<DateFormatFilterEnum, Object> filterDataMap = new EnumMap<>(DateFormatFilterEnum.class);
		if (user.getRole().getRoleCode() != 1) {
			filterDataMap.put(DateFormatFilterEnum.USER_ID, userId);
		}
		filterDataMap.put(DateFormatFilterEnum.DELETE_FLAG, false);
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
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		User user = userService.findByPK(userId);
		Map<DateFormatFilterEnum, Object> filterDataMap = new EnumMap<>(DateFormatFilterEnum.class);
		if (user.getRole().getRoleCode() != 1) {
			filterDataMap.put(DateFormatFilterEnum.USER_ID, userId);
		}
		filterDataMap.put(DateFormatFilterEnum.DELETE_FLAG, false);
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
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		User user = userService.findByPK(userId);
		Map<DateFormatFilterEnum, Object> filterDataMap = new EnumMap<>(DateFormatFilterEnum.class);
		if (user.getRole().getRoleCode() != 1) {
			filterDataMap.put(DateFormatFilterEnum.USER_ID, userId);
		}
		filterDataMap.put(DateFormatFilterEnum.DELETE_FLAG, false);
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
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		User user = userService.findByPK(userId);
		Map<DateFormatFilterEnum, Object> filterDataMap = new EnumMap<>(DateFormatFilterEnum.class);
		if (user.getRole().getRoleCode() != 1) {
			filterDataMap.put(DateFormatFilterEnum.USER_ID, userId);
		}
			filterDataMap.put(DateFormatFilterEnum.DELETE_FLAG, false);
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
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		User user = userService.findByPK(userId);
		Map<DateFormatFilterEnum, Object> filterDataMap = new EnumMap<>(DateFormatFilterEnum.class);
		if (user.getRole().getRoleCode() != 1) {
			filterDataMap.put(DateFormatFilterEnum.USER_ID, userId);
		}
		filterDataMap.put(DateFormatFilterEnum.DELETE_FLAG, false);
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





