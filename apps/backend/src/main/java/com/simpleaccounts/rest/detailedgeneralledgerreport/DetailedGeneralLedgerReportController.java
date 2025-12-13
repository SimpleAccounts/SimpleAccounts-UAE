package com.simpleaccounts.rest.detailedgeneralledgerreport;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.TransactionCategoryClosingBalanceService;
import com.simpleaccounts.service.UserService;
import io.swagger.annotations.ApiOperation;
import java.util.*;
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
@RequestMapping("/rest/detailedGeneralLedgerReport")
@RequiredArgsConstructor
public class DetailedGeneralLedgerReportController {

	private final Logger logger = LoggerFactory.getLogger(DetailedGeneralLedgerReportController.class);

	private final DetailedGeneralLedgerRestHelper detailedGeneralLedgerRestHelper;

	private final UserService userService;

	private final JwtTokenUtil jwtTokenUtil;

	private final TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;

	@LogRequest
	@ApiOperation(value = "Get list of DateFormat")
	@GetMapping(value = "/getList")
		public ResponseEntity<List> getDateFormat(ReportRequestModel reportRequestModel,
												  HttpServletRequest request) {
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
