/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest.purchase;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import static com.simpleaccounts.constant.ErrorConstant.ERROR;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.InvoicePurchaseStatusConstant;
import com.simpleaccounts.constant.TransactionCategoryConsatant;
import com.simpleaccounts.criteria.ProjectCriteria;
import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.CurrencyConversion;
import com.simpleaccounts.entity.Project;
import com.simpleaccounts.entity.Purchase;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.helper.PurchaseRestControllerHelper;
import com.simpleaccounts.model.PurchaseItemRestModel;
import com.simpleaccounts.model.PurchaseRestModel;
import com.simpleaccounts.service.CurrencyService;
import com.simpleaccounts.service.ProjectService;
import com.simpleaccounts.service.PurchaseService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.VatCategoryService;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import static com.simpleaccounts.constant.ErrorConstant.ERROR;

/**
 *
 * @author daynil
 */
@RestController
@RequestMapping("/rest/purchase")
@RequiredArgsConstructor
public class PurchaseRestController {
	private final Logger logger = LoggerFactory.getLogger(PurchaseRestController.class);
	private final PurchaseService purchaseService;

	private final ProjectService projectService;
	private final UserService userServiceNew;

	private final VatCategoryService vatCategoryService;

	private final TransactionCategoryService transactionCategoryService;

	private final CurrencyService currencyService;

	private final PurchaseRestControllerHelper purchaseControllerRestHelper;

	@LogRequest
	@GetMapping(value = "/populatepurchases")
	public ResponseEntity<List<PurchaseRestModel>> populatePurchases() {
		List<PurchaseRestModel> purchaseModels = new ArrayList<>();
		try {
			int totalPurchases = 0;
			int totalPaid = 0;
			int totalPartiallyPaid = 0;
			int totalUnPaid = 0;
			if (purchaseService.getAllPurchase() != null) {
				for (Purchase purchase : purchaseService.getAllPurchase()) {
					if (purchase.getStatus() != null) {

						switch (purchase.getStatus()) {
							case InvoicePurchaseStatusConstant.PAID:
								totalPaid++;
								break;
							case InvoicePurchaseStatusConstant.PARTIALPAID:
								totalPartiallyPaid++;
								break;
							case InvoicePurchaseStatusConstant.UNPAID:
								totalUnPaid++;
								break;
							default:
								break;
							}
					}
					totalPurchases++;
					PurchaseRestModel model = purchaseControllerRestHelper.getPurchaseModel(purchase);
					purchaseModels.add(model);
				}
			}
			return new ResponseEntity<>(purchaseModels, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@LogRequest
	@GetMapping(value = "/vieworedit")
	public ResponseEntity<PurchaseRestModel> viewOrEditPurchase(@RequestParam("purchaseId") Integer purchaseId) {
		try {
			PurchaseRestModel selectedPurchaseModel;
			Purchase purchase = purchaseService.findByPK(purchaseId);
			selectedPurchaseModel = purchaseControllerRestHelper.getPurchaseModel(purchase);
			return new ResponseEntity<>(selectedPurchaseModel, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@DeleteMapping(value = "/delete")
	public ResponseEntity<String> deletePurchase(@RequestParam("purchaseId") Integer purchaseId) {
		try {
			Purchase purchase = purchaseService.findByPK(purchaseId);
			purchase.setDeleteFlag(true);
			purchaseService.update(purchase);
			return new ResponseEntity<>("Deleted Successfully",HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@DeleteMapping(value = "/deletes")
	public ResponseEntity<String> deletePurchases(@RequestBody DeleteModel purchaseIds) {
		try {
			purchaseService.deleteByIds(purchaseIds.getIds());
			return new ResponseEntity<>("Deleted Successfully",HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	}

	@LogRequest
	@GetMapping(value = "/allpaidpurchase")
	public ResponseEntity<List<PurchaseRestModel>> allPaidPurchase() {
		try {
			List<PurchaseRestModel> purchaseModels = new ArrayList<>();
			for (Purchase purchase : purchaseService.getAllPurchase()) {
				if (purchase.getStatus() != null && purchase.getStatus() == InvoicePurchaseStatusConstant.PAID) {
					purchaseModels.add(purchaseControllerRestHelper.getPurchaseModel(purchase));
				}
			}
			return new ResponseEntity<>(purchaseModels, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@LogRequest
	@GetMapping(value = "/allunpaidpurchase")
	public ResponseEntity<List<PurchaseRestModel>> allUnPaidPurchase() {
		try {
			List<PurchaseRestModel> purchaseModels = new ArrayList<>();
			for (Purchase purchase : purchaseService.getAllPurchase()) {
				if (purchase.getStatus() != null && purchase.getStatus() == InvoicePurchaseStatusConstant.UNPAID) {
					purchaseModels.add(purchaseControllerRestHelper.getPurchaseModel(purchase));
				}
			}
			return new ResponseEntity<>(purchaseModels, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@LogRequest
	@GetMapping(value = "/allpartialpaidpurchase")
	public ResponseEntity<List<PurchaseRestModel>> allPartialPaidPurchase() {
		try {
			List<PurchaseRestModel> purchaseModels = new ArrayList<>();
			for (Purchase purchase : purchaseService.getAllPurchase()) {
				if (purchase.getStatus() != null && purchase.getStatus() == InvoicePurchaseStatusConstant.PARTIALPAID) {
					purchaseModels.add(purchaseControllerRestHelper.getPurchaseModel(purchase));
				}
			}
			return new ResponseEntity<>(purchaseModels, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@LogRequest
	@GetMapping(value = "/claimants")
	public ResponseEntity getClaimants() {
		try {
			return new ResponseEntity(userServiceNew.executeNamedQuery("findAllUsers"), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@LogRequest
	@GetMapping(value = "/categories")
	public ResponseEntity<List<TransactionCategory>> getCategory() {
		try {
			List<TransactionCategory> transactionCategoryList = transactionCategoryService
					.findTransactionCategoryListByParentCategory(
							TransactionCategoryConsatant.TRANSACTION_CATEGORY_PURCHASE);
			return new ResponseEntity<>(transactionCategoryList, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * @Deprecated
	 * @return
	 */
	@LogRequest
	@GetMapping(value = "/currencys")
	public ResponseEntity<List<Currency>> getCurrency() {
		try {
			List<Currency> currencies = currencyService.getCurrencies();
			if (currencies != null && !currencies.isEmpty()) {
				return new ResponseEntity<>(currencies, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@GetMapping(value = "/projects")
	public ResponseEntity<List<Project>> projects(@RequestParam("projectName") String searchQuery) {
		try {
			ProjectCriteria criteria = new ProjectCriteria();
			criteria.setActive(Boolean.TRUE);
			if (searchQuery != null && !searchQuery.isEmpty()) {
				criteria.setProjectName(searchQuery);
			}
			List<Project> projects = projectService.getProjectsByCriteria(criteria);
			return new ResponseEntity<>(projects, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@LogRequest
	@GetMapping(value = "/vatcategories")
	public ResponseEntity<List<VatCategory>> vatCategorys(@RequestParam("vatSearchString") String searchQuery){
		try {
			return new ResponseEntity<>(vatCategoryService.getVatCategoryList(), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@LogRequest
	@GetMapping(value = "/getexchangerate")
	public ResponseEntity exchangeRate(@RequestParam("currencyCode") Integer currencyCode,
			@RequestParam("userId") Integer userId) {
		try {
			String exchangeRateString = "";
			CurrencyConversion currencyConversion;
			Currency currency = currencyService.findByPK(currencyCode);
			Company company = userServiceNew.findByPK(userId).getCompany();
			currencyConversion = currencyService.getCurrencyRateFromCurrencyConversion(currencyCode);
			if (currencyConversion != null) {
					exchangeRateString = "1 "
							+ currency.getCurrencyIsoCode() + " = " + new BigDecimal(BigInteger.ONE)
									.divide(currencyConversion.getExchangeRate(), 9, RoundingMode.HALF_UP)
							+ " " + company.getCurrencyCode().getCurrencyIsoCode();

			}
			return new ResponseEntity(exchangeRateString, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}
	
	@LogRequest
    @PostMapping(value = "/updatevatpercentage")
	public void updateVatPercentage(PurchaseItemRestModel purchaseItemModel, PurchaseRestModel purchaseRestModel) {
		if (purchaseItemModel.getProductService() != null) {
			if (purchaseItemModel.getProductService().getVatCategory() != null) {
				VatCategory vatCategory = purchaseItemModel.getProductService().getVatCategory();
				purchaseItemModel.setVatId(vatCategory);
			} else {
				purchaseItemModel.setVatId(vatCategoryService.getDefaultVatCategory());
			}
				if (Boolean.TRUE.equals(purchaseItemModel.getProductService().getVatIncluded())) {
					if (purchaseItemModel.getProductService().getVatCategory() != null) {
						BigDecimal unit = (purchaseItemModel.getProductService().getUnitPrice().divide(
								purchaseItemModel.getProductService().getVatCategory().getVat().add(new BigDecimal(100)), 5,
							RoundingMode.HALF_UP)).multiply(new BigDecimal(100));
					purchaseItemModel.setUnitPrice(unit);
				}
			} else {
				purchaseItemModel.setUnitPrice(purchaseItemModel.getProductService().getUnitPrice());
			}
			purchaseItemModel.setDescription(purchaseItemModel.getProductService().getProductDescription());
		}

	}

	public void updateSubTotal(final PurchaseItemRestModel itemModel) {
		final int quantity = itemModel.getQuatity();
		final BigDecimal unitPrice = itemModel.getUnitPrice();
		if (null != unitPrice) {
			final BigDecimal amountWithoutTax = unitPrice.multiply(new BigDecimal(quantity));
			itemModel.setSubTotal(amountWithoutTax);
		}
	}
	public void addInvoiceItemOnProductSelect(PurchaseRestModel purchaseRestModel) {
		if (validateInvoiceItem(purchaseRestModel)) {
			addLineItem(purchaseRestModel);
		}
	}

	private boolean validateInvoiceItem(PurchaseRestModel purchaseRestModel) {

		boolean validated = true;
		for (int i = 0; i < purchaseRestModel.getPurchaseItems().size() - 1; i++) {
			PurchaseItemRestModel lastItem = purchaseRestModel.getPurchaseItems().get(i);
			StringBuilder validationMessage = new StringBuilder("Please enter ");
			if (lastItem.getUnitPrice() == null) {
				validationMessage.append("Unit Price ");
				validated = false;
			}
			if (validated && lastItem.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
				validationMessage = new StringBuilder("Unit price should be greater than 0 ");
				validated = false;
			}
			if (lastItem.getQuatity() < 1) {
				if (!validated) {
					validationMessage.append("and ");
				}
				validationMessage.append("Quantity should be greater than 0 ");
				validated = false;
			}
			if (!validated) {
				validationMessage.append("in expense items.");
			}
		}
		return validated;
	}

	public void addLineItem(PurchaseRestModel purchaseRestModel) {
		PurchaseItemRestModel purchaseItemModel = new PurchaseItemRestModel();
		VatCategory vatCategory = vatCategoryService.getDefaultVatCategory();
		purchaseItemModel.setVatId(vatCategory);
		purchaseItemModel.setUnitPrice(BigDecimal.ZERO);
		purchaseRestModel.addPurchaseItem(purchaseItemModel);
	}

}
