package com.simplevat.rest.detailedgeneralledgerreport;

import java.util.*;

import com.simplevat.entity.*;
import com.simplevat.entity.bankaccount.Transaction;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.rest.DropdownModel;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.TransactionCategoryClosingBalanceService;
import com.simplevat.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.simplevat.aop.LogRequest;
import com.simplevat.constant.dbfilter.DateFormatFilterEnum;

import io.swagger.annotations.ApiOperation;

import javax.servlet.http.HttpServletRequest;

import static com.simplevat.constant.ErrorConstant.ERROR;

@RestController
@RequestMapping("/rest/detailedGeneralLedgerReport")
public class DetailedGeneralLedgerReportController {

	private final Logger logger = LoggerFactory.getLogger(DetailedGeneralLedgerReportController.class);

	@Autowired
	private DetailedGeneralLedgerRestHelper detailedGeneralLedgerRestHelper;

	@Autowired
	private UserService userService;

	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	@Autowired
	TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;

	@LogRequest
	@ApiOperation(value = "Get list of DateFormat")
	@GetMapping(value = "/getList")
	public ResponseEntity<List> getDateFormat(ReportRequestModel reportRequestModel,
											  HttpServletRequest request) {
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		User user = userService.findByPK(userId);

		Map<DateFormatFilterEnum, Object> filterDataMap = new EnumMap<>(DateFormatFilterEnum.class);
		if(user.getRole().getRoleCode()!=1) {
			filterDataMap.put(DateFormatFilterEnum.USER_ID, userId);
		}
		filterDataMap.put(DateFormatFilterEnum.DELETE_FLAG, false);
		List list = detailedGeneralLedgerRestHelper.getDetailedGeneralLedgerReport(reportRequestModel);
		try {
			if (list == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(list, HttpStatus.OK);
	}

	/**
	 * Get Transaction category list that are in use
	 *
	 *
	 * @return List of Transaction categorydata list
	 */
	@LogRequest
	@ApiOperation(value = "Get Transaction category list that are in use")
	@GetMapping(value = "/getUsedTransactionCatogery")
	public ResponseEntity<List<DropdownModel>> getUsedTransactionCatogery(
			ReportRequestModel reportRequestModel,HttpServletRequest request) {

			try {
				List<DropdownModel> response  = new ArrayList<>();
				List<TransactionCategoryClosingBalance> closingBalanceList = transactionCategoryClosingBalanceService.getList(reportRequestModel);
				if (closingBalanceList!=null){
					response = getCatogerylist(closingBalanceList);
				}
				Set<DropdownModel> set = new LinkedHashSet<>(response);
				List<DropdownModel> responseList  = new ArrayList<>();
				responseList.clear();
				responseList.addAll(set);
					return new ResponseEntity<>(responseList, HttpStatus.OK);

		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

		public List<DropdownModel> getCatogerylist(Object transactionCatogery){
			List<DropdownModel> responseList = new ArrayList<>();
			if (transactionCatogery!=null){
				for (TransactionCategoryClosingBalance transactionCategory:(List<TransactionCategoryClosingBalance>) transactionCatogery){
					DropdownModel dropdownModel = new DropdownModel();
					if (transactionCategory.getTransactionCategory().getTransactionCategoryName()!=null){
						dropdownModel.setLabel(transactionCategory.getTransactionCategory().getTransactionCategoryName());
					}
					if (transactionCategory.getId() !=null){
						dropdownModel.setValue(transactionCategory.getTransactionCategory().getTransactionCategoryId());
					}
					if(transactionCategory.getTransactionCategory().getParentTransactionCategory() != null){
						TransactionCategory parent = transactionCategory.getTransactionCategory().getParentTransactionCategory();
						DropdownModel parentModel = new DropdownModel();
						if (parent.getTransactionCategoryName()!=null){
							parentModel.setLabel(parent.getTransactionCategoryName());
						}
						if (parent.getTransactionCategoryId() !=null){
							parentModel.setValue(parent.getTransactionCategoryId());
						}
						if(!responseList.contains(parentModel)) {
							responseList.add(parentModel);
						}
					}
					responseList.add(dropdownModel);
				}
			}
			return responseList;
		}

}
