package com.simplevat.rest.productcategorycontroller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import com.simplevat.entity.ProductCategory;

@Component
public class ProductCategoryRestHelper {

	public List<ProductCategoryListModel> getListModel(Object productCategoryList) {
		List<ProductCategoryListModel> ProductCategoryListModels = new ArrayList();

		if (productCategoryList != null) {
			for (ProductCategory productCategory : (List<ProductCategory>) productCategoryList) {
				ProductCategoryListModel productCategoryModel = new ProductCategoryListModel();
				BeanUtils.copyProperties(productCategory, productCategoryModel);
				ProductCategoryListModels.add(productCategoryModel);
			}
		}
		return ProductCategoryListModels;
	}

	public ProductCategoryListModel getRequestModel(ProductCategory productCategory) {
		ProductCategoryListModel productCategoryModel = null;

		if (productCategory != null) {
			productCategoryModel = new ProductCategoryListModel();
			BeanUtils.copyProperties(productCategory, productCategoryModel);
		}
		return productCategoryModel;
	}

	public ProductCategory getEntity(ProductCategoryListModel productCategoryModel) {
		if (productCategoryModel != null) {
			ProductCategory productCategory = new ProductCategory();
			BeanUtils.copyProperties(productCategoryModel, productCategory);
			return productCategory;
		}
		return null;
	}
}
