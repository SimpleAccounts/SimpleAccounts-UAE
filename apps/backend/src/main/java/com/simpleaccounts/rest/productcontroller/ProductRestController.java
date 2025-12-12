package com.simpleaccounts.rest.productcontroller;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import java.util.*;

import javax.servlet.http.HttpServletRequest;

import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.SingleLevelDropDownModel;
import com.simpleaccounts.rest.transactioncategorycontroller.TranscationCategoryHelper;
import com.simpleaccounts.service.*;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.ProductPriceType;
import com.simpleaccounts.constant.dbfilter.ORDERBYENUM;
import com.simpleaccounts.constant.dbfilter.ProductFilterEnum;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;

import io.swagger.annotations.ApiOperation;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

/**
 *
 * @author Sonu
 */
@RestController
@RequestMapping(value = "/rest/product")
@RequiredArgsConstructor
public class ProductRestController {
	private final Logger logger = LoggerFactory.getLogger(ProductRestController.class);
	private final ProductService productService;

	private final VatCategoryService vatCategoryService;

	private final ProductRestHelper productRestHelper;

	private final JwtTokenUtil jwtTokenUtil;

	private final InvoiceLineItemService invoiceLineItemService;

	private final TransactionCategoryService transactionCategoryService;

	@Autowired
	TranscationCategoryHelper transcationCategoryHelper;

	private final UserService userService;

	@LogRequest
	@ApiOperation(value = "Get Product List")
	@GetMapping(value = "/getList")
	public ResponseEntity<PaginationResponseModel> getProductList(ProductRequestFilterModel filterModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			User user = userService.findByPK(userId);
			Map<ProductFilterEnum, Object> filterDataMap = new EnumMap<>(ProductFilterEnum.class);
			if(user.getRole().getRoleCode()!=1) {
				filterDataMap.put(ProductFilterEnum.USER_ID, userId);
			}
			filterDataMap.put(ProductFilterEnum.PRODUCT_NAME, filterModel.getName());
			filterDataMap.put(ProductFilterEnum.PRODUCT_CODE, filterModel.getProductCode());
			filterDataMap.put(ProductFilterEnum.DELETE_FLAG, false);
			if (filterModel.getVatPercentage() != null) {
				filterDataMap.put(ProductFilterEnum.PRODUCT_VAT_PERCENTAGE,
						vatCategoryService.findByPK(filterModel.getVatPercentage()));
			}
			if(filterModel.getOrder()!=null && filterModel.getOrder().equalsIgnoreCase("desc")) {
				filterDataMap.put(ProductFilterEnum.ORDER_BY, ORDERBYENUM.DESC);
			}
			else
				filterDataMap.put(ProductFilterEnum.ORDER_BY, ORDERBYENUM.ASC);

			if (filterModel.getProductPriceType() != null) {
				filterDataMap.put(ProductFilterEnum.PRODUCT_PRICE_TYPE,
						Arrays.asList(filterModel.getProductPriceType(), ProductPriceType.BOTH));
			}
			PaginationResponseModel response = productService.getProductList(filterDataMap, filterModel);
			List<ProductListModel> productListModels = new ArrayList<>();
			if (response == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			} else {
				if (response.getData() != null) {
					for (Product product : (List<Product>) response.getData()) {
						ProductListModel model = productRestHelper.getListModel(product);
						productListModels.add(model);
					}
					response.setData(productListModels);
				}
			}
			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	
	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Product By ID")
	@DeleteMapping(value = "/delete")
	public ResponseEntity<Object> deleteProduct(@RequestParam(value = "id") Integer id) {
		try {
			SimpleAccountsMessage message = null;
			Product product = productService.findByPK(id);
			if (product != null) {
				productService.deleteByIds(Arrays.asList(id));
			}
			message = new SimpleAccountsMessage("0035",
					MessageUtil.getMessage("product.deleted.successful.msg.0035"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("delete.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Product in Bulk")
	@DeleteMapping(value = "/deletes")
	public ResponseEntity<Object> deleteProducts(@RequestBody DeleteModel ids) {
		try {
			SimpleAccountsMessage message = null;
			productService.deleteByIds(ids.getIds());
			message = new SimpleAccountsMessage("0035",
					MessageUtil.getMessage("product.deleted.successful.msg.0035"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("delete.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	@LogRequest
	@ApiOperation(value = "Get Product By ID")
	@GetMapping(value = "/getProductById")
	public ResponseEntity<ProductRequestModel> getProductById(@RequestParam(value = "id") Integer id) {
		try {
			Product product = productService.findByPK(id);
			return new ResponseEntity<>(productRestHelper.getRequestModel(product), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Add New Product")
	@PostMapping(value = "/save")
	public ResponseEntity<Object> save(@RequestBody ProductRequestModel productRequestModel, HttpServletRequest request) {
		try {
			Map<String, Object> map = new HashMap<>();
			map.put("productCode", productRequestModel.getProductCode());
			List<Product> existingProductCode = productService.findByAttributes(map);
			if (existingProductCode!=null && !existingProductCode.isEmpty()){
				return new ResponseEntity<>("Product Code Already Exist", HttpStatus.OK);
			}
			SimpleAccountsMessage message= null;
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			productRequestModel.setCreatedBy(userId);
			Product product = productRestHelper.getEntity(productRequestModel);
			product.setCreatedDate(LocalDateTime.now());
			product.setDeleteFlag(Boolean.FALSE);
			product.setIsInventoryEnabled(productRequestModel.getIsInventoryEnabled());
			productService.persist(product);
			if(Boolean.TRUE.equals(product.getIsInventoryEnabled()))
			{
			productRestHelper.saveInventoryEntity(product,productRequestModel,userId);
			}
			message = new SimpleAccountsMessage("0036",
					MessageUtil.getMessage("product.created.successful.msg.0036"), false);
					return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("create.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Update Product")
	@PostMapping(value = "/update")
	public ResponseEntity<Object> update(@RequestBody ProductRequestModel productRequestModel, HttpServletRequest request) {
		try {
			SimpleAccountsMessage message= null;
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			productRequestModel.setCreatedBy(userId);
			Product product = productRestHelper.getEntity(productRequestModel);
			product.setLastUpdateDate(LocalDateTime.now());
			if(productRequestModel.getIsInventoryEnabled()!=null){
				product.setIsInventoryEnabled(productRequestModel.getIsInventoryEnabled());
			}
			product.setLastUpdatedBy(userId);
			productService.update(product);
			if(product.getIsInventoryEnabled()!=null &&  Boolean.TRUE.equals(product.getIsInventoryEnabled()))
			{
			 productRestHelper.updateInventoryEntity(productRequestModel,userId);
			}
			message = new SimpleAccountsMessage("0037",
					MessageUtil.getMessage("product.updated.successful.msg.0037"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("update.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@ApiOperation(value = "Get Invoices Count For Product")
	@GetMapping(value = "/getInvoicesCountForProduct")
	public ResponseEntity<Integer> getExplainedTransactionCount(@RequestParam int productId){
		Integer response = invoiceLineItemService.getTotalInvoiceCountByProductId(productId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
	
	@LogRequest
	@ApiOperation(value = "Get Transaction category For Product")
	@GetMapping(value = "/getTransactionCategoryListForSalesProduct")
	public ResponseEntity<Object> getTransactionCategoryListForProduct(){
		List<SingleLevelDropDownModel> response  = new ArrayList<>();
		List<TransactionCategory> transactionCategoryList = transactionCategoryService.getTransactionCategoryListForSalesProduct();
        if (transactionCategoryList!=null){
			response = transcationCategoryHelper.getSinleLevelDropDownModelList(transactionCategoryList);
		}


		return new ResponseEntity<>(response, HttpStatus.OK);
	}
	
	@LogRequest
	@ApiOperation(value = "Get Transaction category For Product")
	@GetMapping(value = "/getTransactionCategoryListForPurchaseProduct")
	public ResponseEntity<Object> getTransactionCategoryListForPurchaseProduct(){
		List<SingleLevelDropDownModel> response  = new ArrayList<>();
		List<TransactionCategory> transactionCategoryList = transactionCategoryService.getTransactionCategoryListForPurchaseProduct();
		if (transactionCategoryList!=null){
			response = transcationCategoryHelper.getSinleLevelDropDownModelList(transactionCategoryList);
		}
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
	
	@LogRequest
	@ApiOperation(value = "Get Transaction category For Inventory")
	@GetMapping(value = "/getTransactionCategoryListForInventory")
	public ResponseEntity<Object> getTransactionCategoryListForInventory(){
		List<DropdownModel> response  = new ArrayList<>();
		List<TransactionCategory> transactionCategoryList = transactionCategoryService.getTransactionCategoryListForInventory();
		if (transactionCategoryList!=null){
			DropdownModel dropdownModel = new DropdownModel(transactionCategoryList.get(0).getTransactionCategoryId(),
					transactionCategoryList.get(0).getTransactionCategoryName());
			response.add(dropdownModel);
		}
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
}
