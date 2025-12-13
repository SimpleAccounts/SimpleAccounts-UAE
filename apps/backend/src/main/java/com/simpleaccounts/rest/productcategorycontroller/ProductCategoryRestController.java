package com.simpleaccounts.rest.productcategorycontroller;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.dbfilter.ProductCategoryFilterEnum;
import com.simpleaccounts.entity.ProductCategory;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.ProductCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import io.swagger.annotations.ApiOperation;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
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
import com.simpleaccounts.constant.dbfilter.ProductCategoryFilterEnum;
import com.simpleaccounts.entity.ProductCategory;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.ProductCategoryService;
import com.simpleaccounts.service.UserService;

import io.swagger.annotations.ApiOperation;

/**
 *
 * @author saurabhg 26/12/19
 */
@RestController
@RequestMapping(value = "/rest/productcategory")
@RequiredArgsConstructor
public class ProductCategoryRestController {
	private final Logger logger = LoggerFactory.getLogger(ProductCategoryRestController.class);
	private final ProductCategoryService productCategoryService;

	private final JwtTokenUtil jwtTokenUtil;

	private final UserService userServiceNew;

	private final ProductCategoryRestHelper productCategoryRestHelper;

	private final UserService userService;

	@LogRequest
	@ApiOperation(value = "Get All Product Categories for the Loggedin User and the Master data")
	@GetMapping(value = "/getList")
	public ResponseEntity<PaginationResponseModel> getAllProductCategory(ProductCategoryFilterModel filterModel, HttpServletRequest request) {
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		User user = userService.findByPK(userId);

		Map<ProductCategoryFilterEnum, Object> filterDataMap = new HashMap<>();
		if(user.getRole().getRoleCode()!=1) {
			filterDataMap.put(ProductCategoryFilterEnum.USER_ID, filterModel.getUserId());
		}
		filterDataMap.put(ProductCategoryFilterEnum.PRODUCT_CATEGORY_CODE, filterModel.getProductCategoryCode());
		filterDataMap.put(ProductCategoryFilterEnum.PRODUCT_CATEGORY_NAME, filterModel.getProductCategoryName());

		filterDataMap.put(ProductCategoryFilterEnum.DELETE_FLAG, false);

		PaginationResponseModel response = productCategoryService.getProductCategoryList(filterDataMap, filterModel);
		if (response != null) {
			response.setData(productCategoryRestHelper.getListModel(response.getData()));
			return new ResponseEntity<>(response, HttpStatus.OK);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "Get Product Category By ID")
	@GetMapping(value = "/getById")
	public ResponseEntity<ProductCategoryListModel> getProductCategoryById(@RequestParam("id") Integer id) {
		ProductCategory productCategory = productCategoryService.findByPK(id);
		return new ResponseEntity<>(productCategoryRestHelper.getRequestModel(productCategory), HttpStatus.OK);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Product Category")
	@DeleteMapping(value = "/delete")
	public ResponseEntity<Object> deleteTransactionCategory(@RequestParam("id") Integer id) {
		SimpleAccountsMessage message= null;
		ProductCategory productCategories = productCategoryService.findByPK(id);
		if (productCategories == null) {
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
		productCategories.setDeleteFlag(Boolean.TRUE);
		productCategoryService.update(productCategories, id);
		message = new SimpleAccountsMessage("0038",
				MessageUtil.getMessage("product.category.deleted.successful.msg.0038"), false);
		return new ResponseEntity<>(message,HttpStatus.OK);

	}
	
	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Product Category In Bulk")
	@DeleteMapping(value = "/deletes")
	public ResponseEntity<Object> deleteTransactionCategories(@RequestBody DeleteModel ids) {
		try {
			SimpleAccountsMessage message= null;
			productCategoryService.deleteByIds(ids.getIds());
			message = new SimpleAccountsMessage("0038",
					MessageUtil.getMessage("product.category.deleted.successful.msg.0038"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);

		} catch (Exception e) {SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("delete.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Add New Product Category")
	@PostMapping(value = "/save")
	public ResponseEntity<Object> save(@RequestBody ProductCategoryListModel productCategoryModel, HttpServletRequest request) {
		try {
			SimpleAccountsMessage message= null;
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			User user = userServiceNew.findByPK(userId);
			ProductCategory selectedProductCategory = productCategoryRestHelper.getEntity(productCategoryModel);
			selectedProductCategory.setCreatedBy(user.getUserId());
			selectedProductCategory.setCreatedDate(LocalDateTime.now());
			productCategoryService.persist(selectedProductCategory);
			message = new SimpleAccountsMessage("0039",
					MessageUtil.getMessage("product.category.created.successful.msg.0039"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("create.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Update Product Category")
	@PostMapping(value = "/update")
	public ResponseEntity<Object> update(@RequestBody ProductCategoryListModel productCategoryModel,
			HttpServletRequest request) {
		try {
			SimpleAccountsMessage message= null;
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			User user = userServiceNew.findByPK(userId);
			ProductCategory selectedProductCategory = productCategoryService.findByPK(productCategoryModel.getId());
			selectedProductCategory.setProductCategoryCode(productCategoryModel.getProductCategoryCode());
			selectedProductCategory.setProductCategoryName(productCategoryModel.getProductCategoryName());
			productCategoryModel.setLastUpdateBy(user.getUserId());
			productCategoryModel.setLastUpdateDate(LocalDateTime.now());
			productCategoryService.update(selectedProductCategory);
			message = new SimpleAccountsMessage("0040",
					MessageUtil.getMessage("product.category.updated.successful.msg.0040"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("update.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
