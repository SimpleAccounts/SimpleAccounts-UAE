/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest.vatcontroller;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.dbfilter.VatCategoryFilterEnum;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.ProductService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.VatCategoryService;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import io.swagger.annotations.ApiOperation;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
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
 * @author Sonu
 * @author saurabhg 2/1/2020
 */
@RestController
@RequestMapping(value = "/rest/vat")
@RequiredArgsConstructor
public class VatController{
	private final Logger logger = LoggerFactory.getLogger(VatController.class);
	private final VatCategoryService vatCategoryService;

	private final VatCategoryRestHelper vatCategoryRestHelper;

	private final JwtTokenUtil jwtTokenUtil;

	private final ProductService productService;

	private final UserService userService;

	@LogRequest
	@ApiOperation(value = "Get Vat Category List")
	@GetMapping(value = "getList")
	public ResponseEntity<PaginationResponseModel> getVatList(VatCategoryRequestFilterModel filterModel,
															  HttpServletRequest request) {
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		User user = userService.findByPK(userId);

		Map<VatCategoryFilterEnum, Object> filterDataMap = new EnumMap<>(VatCategoryFilterEnum.class);

		filterDataMap.put(VatCategoryFilterEnum.VAT_CATEGORY_NAME, filterModel.getName());
		if (filterModel.getVatPercentage() != null && !filterModel.getVatPercentage().contentEquals("")) {
			filterDataMap.put(VatCategoryFilterEnum.VAT_RATE, new BigDecimal(filterModel.getVatPercentage()));
		}
		filterDataMap.put(VatCategoryFilterEnum.DELETE_FLAG, false);

		PaginationResponseModel respone = vatCategoryService.getVatCategoryList(filterDataMap, filterModel);
		if (respone != null) {
			List<VatCategoryModel> vatCatModelList =	vatCategoryRestHelper.getList(respone.getData());
			respone.setData(vatCatModelList);
			respone.setCount(vatCatModelList.size());
			return new ResponseEntity<>(respone, HttpStatus.OK);
		} else {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}

	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "delete Vat Category by Id")
	@DeleteMapping(value = "/delete")
		public ResponseEntity<Object> delete(@RequestParam(value = "id") Integer id) {
		SimpleAccountsMessage message= null;
		VatCategory vatCategory = vatCategoryService.findByPK(id);
		if (vatCategory != null) {
			vatCategory.setDeleteFlag(true);
			vatCategoryService.update(vatCategory, vatCategory.getId());
		} else {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
		message = new SimpleAccountsMessage("0041",
				MessageUtil.getMessage("vat.category.deleted.successful.msg.0041"), false);
		return new ResponseEntity<>(message,HttpStatus.OK);

	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Vat Category in Bulk")
	@DeleteMapping(value = "/deletes")
		public ResponseEntity<Object> deletes(@RequestBody DeleteModel ids) {
		try {
			SimpleAccountsMessage message= null;
			vatCategoryService.deleteByIds(ids.getIds());
			message = new SimpleAccountsMessage("0041",
					MessageUtil.getMessage("vat.category.deleted.successful.msg.0041"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("delete.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	@LogRequest
	@ApiOperation(value = "Get Vat Category By ID")
	@GetMapping(value = "/getById")
	public ResponseEntity<VatCategoryModel > getById(@RequestParam(value = "id") Integer id) {
		VatCategory vatCategory = vatCategoryService.findByPK(id);
		if (vatCategory != null) {
			return new ResponseEntity<>(vatCategoryRestHelper.getModel(vatCategory), HttpStatus.OK);

		} else {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Add New Vat Category")
	@PostMapping(value = "/save")
		public ResponseEntity<Object> save(@RequestBody VatCategoryRequestModel vatCatRequestModel, HttpServletRequest request) {
		SimpleAccountsMessage message= null;
		try {
			VatCategory vatCategory = vatCategoryRestHelper.getEntity(vatCatRequestModel);
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			vatCategory.setCreatedBy(userId);
			vatCategory.setCreatedDate(LocalDateTime.now());
			vatCategory.setCreatedDate(LocalDateTime.now());
			vatCategory.setDefaultFlag('N');
			vatCategory.setOrderSequence(1);
			vatCategory.setVersionNumber(1);
			vatCategoryService.persist(vatCategory);

		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
		message = new SimpleAccountsMessage("0042",
				MessageUtil.getMessage("vat.category.created.successful.msg.0042"), false);
		return new ResponseEntity<>(message,HttpStatus.OK);
	}
	
	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Update Vat Category")
	@PostMapping(value = "/update")
		public ResponseEntity<Object> update(@RequestBody VatCategoryRequestModel vatCatRequestModel, HttpServletRequest request) {
		try {
			SimpleAccountsMessage message= null;
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			VatCategory vatCategory = vatCategoryRestHelper.getEntity(vatCatRequestModel);
			vatCategory.setLastUpdateDate(LocalDateTime.now());
			vatCategory.setLastUpdateBy(userId);
			vatCategoryService.update(vatCategory);
			message = new SimpleAccountsMessage("0043",
					MessageUtil.getMessage("vat.category.updated.successful.msg.0043"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {SimpleAccountsMessage message= null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("update.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@LogRequest
	@ApiOperation(value = "Get Product Count For Vat ")
	@GetMapping(value = "/getProductCountsForVat")
	public ResponseEntity<Integer> getExplainedTransactionCount(@RequestParam int vatId){
		Integer response = productService.getTotalProductCountByVatId(vatId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
}
