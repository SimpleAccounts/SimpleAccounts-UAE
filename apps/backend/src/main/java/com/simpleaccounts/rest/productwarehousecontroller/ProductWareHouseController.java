/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest.productwarehousecontroller;

import java.util.List;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.entity.ProductWarehouse;
import com.simpleaccounts.service.ProductWarehouseService;

import io.swagger.annotations.ApiOperation;

/**
 *
 * @author Sonu
 */
@RestController
@RequestMapping(value = "/rest/productwarehouse")
@RequiredArgsConstructor
public class ProductWareHouseController{

	private final  ProductWareHouseRestHelper productWareHouseRestHelper;

	private final ProductWarehouseService productWarehouseService;

	@LogRequest
	@ApiOperation(value = "get Ware House List")
	@GetMapping(value = "/getWareHouse")
	public ResponseEntity<List<ProductWarehouse>> getProductWarehouse() {
		List<ProductWarehouse> productWarehouseList = productWarehouseService.getProductWarehouseList();
		if (productWarehouseList == null) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
		return new ResponseEntity<>(productWarehouseList, HttpStatus.OK);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Save Ware House")
	@PostMapping(value = "/saveWareHouse")
	public ResponseEntity<String> createNewWarehouse(@RequestBody ProductWareHousePersistModel productWarehouseModel) {

		if (productWarehouseModel != null) {
			ProductWarehouse productWarehouse = productWareHouseRestHelper.getEntity(productWarehouseModel);
			productWarehouse.setDeleteFlag(Boolean.FALSE);
			productWarehouseService.persist(productWarehouse);
		}
		return new ResponseEntity<>("Saved Successfully",HttpStatus.OK);

	}

}
