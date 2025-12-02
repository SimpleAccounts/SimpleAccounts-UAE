/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.rest.vatcontroller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.simplevat.entity.User;
import com.simplevat.service.ProductService;
import com.simplevat.service.UserService;
import com.simplevat.utils.MessageUtil;
import com.simplevat.utils.SimpleVatMessage;
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

import com.simplevat.aop.LogRequest;
import com.simplevat.bank.model.DeleteModel;
import com.simplevat.constant.dbfilter.VatCategoryFilterEnum;
import com.simplevat.entity.VatCategory;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.VatCategoryService;

import io.swagger.annotations.ApiOperation;

import static com.simplevat.constant.ErrorConstant.ERROR;

/**
 *
 * @author Sonu
 * @author saurabhg 2/1/2020
 */
@RestController
@RequestMapping(value = "/rest/vat")
public class VatController{
	private final Logger logger = LoggerFactory.getLogger(VatController.class);
	@Autowired
	private VatCategoryService vatCategoryService;

	@Autowired
	private VatCategoryRestHelper vatCategoryRestHelper;

	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	@Autowired
	private ProductService productService;

	@Autowired
	private UserService userService;

	@LogRequest
	@ApiOperation(value = "Get Vat Category List")
	@GetMapping(value = "getList")
	public ResponseEntity<PaginationResponseModel> getVatList(VatCategoryRequestFilterModel filterModel,
															  HttpServletRequest request) {
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		User user = userService.findByPK(userId);


		Map<VatCategoryFilterEnum, Object> filterDataMap = new EnumMap<>(VatCategoryFilterEnum.class);
//		if(user.getRole().getRoleCode()!=1) {
//			filterDataMap.put(VatCategoryFilterEnum.USER_ID, userId);
//		}
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
	public ResponseEntity<?> delete(@RequestParam(value = "id") Integer id) {
		SimpleVatMessage message= null;
		VatCategory vatCategory = vatCategoryService.findByPK(id);
		if (vatCategory != null) {
			vatCategory.setDeleteFlag(true);
			vatCategoryService.update(vatCategory, vatCategory.getId());
		} else {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
		message = new SimpleVatMessage("0041",
				MessageUtil.getMessage("vat.category.deleted.successful.msg.0041"), false);
		return new ResponseEntity<>(message,HttpStatus.OK);

	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete Vat Category in Bulk")
	@DeleteMapping(value = "/deletes")
	public ResponseEntity<?> deletes(@RequestBody DeleteModel ids) {
		try {
			SimpleVatMessage message= null;
			vatCategoryService.deleteByIds(ids.getIds());
			message = new SimpleVatMessage("0041",
					MessageUtil.getMessage("vat.category.deleted.successful.msg.0041"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {
			SimpleVatMessage message= null;
			message = new SimpleVatMessage("",
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
	public ResponseEntity<?> save(@RequestBody VatCategoryRequestModel vatCatRequestModel, HttpServletRequest request) {
		SimpleVatMessage message= null;
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
		message = new SimpleVatMessage("0042",
				MessageUtil.getMessage("vat.category.created.successful.msg.0042"), false);
		return new ResponseEntity<>(message,HttpStatus.OK);
	}
	
	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Update Vat Category")
	@PostMapping(value = "/update")
	public ResponseEntity<?> update(@RequestBody VatCategoryRequestModel vatCatRequestModel, HttpServletRequest request) {
		try {
			SimpleVatMessage message= null;
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			VatCategory vatCategory = vatCategoryRestHelper.getEntity(vatCatRequestModel);
			vatCategory.setLastUpdateDate(LocalDateTime.now());
			vatCategory.setLastUpdateBy(userId);
			vatCategoryService.update(vatCategory);
			message = new SimpleVatMessage("0043",
					MessageUtil.getMessage("vat.category.updated.successful.msg.0043"), false);
			return new ResponseEntity<>(message,HttpStatus.OK);
		} catch (Exception e) {SimpleVatMessage message= null;
			message = new SimpleVatMessage("",
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
