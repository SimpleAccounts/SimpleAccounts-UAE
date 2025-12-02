package com.simplevat.rest.vatcontroller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.simplevat.entity.Company;
import com.simplevat.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.simplevat.entity.VatCategory;
import com.simplevat.service.VatCategoryService;

@Component
public class VatCategoryRestHelper {

	@Autowired
	private VatCategoryService vatCategoryService;

	@Autowired CompanyService companyService;

	public VatCategory getEntity(VatCategoryRequestModel vatCatRequestModel) {

		if (vatCatRequestModel != null) {

			VatCategory vatCategory = new VatCategory();

			if (vatCatRequestModel.getId() != null) {
				vatCategory = vatCategoryService.findByPK(vatCatRequestModel.getId());
			}

			vatCategory.setName(vatCatRequestModel.getName());
			vatCategory.setVat(vatCatRequestModel.getVat());

			return vatCategory;
		}

		return null;
	}

	public List<VatCategoryModel> getList(Object vatCategories) {

		List<VatCategoryModel> vatCatModelList = new ArrayList<>();
		Company company = companyService.getCompany();
		if (vatCategories != null) {

			for (VatCategory vatCategory : (List<VatCategory>) vatCategories) {
				VatCategoryModel vatCatModel = new VatCategoryModel();

				//if(company.getIsRegisteredVat()!= null && company.getIsRegisteredVat()) {
					if(vatCategory.getId() != 10 ) {
						vatCatModel.setId(vatCategory.getId());
						vatCatModel.setVat(vatCategory.getVat());
						vatCatModel.setName(vatCategory.getName());

					vatCatModelList.add(vatCatModel);
					//}
				}
			}
			if(company.getIsRegisteredVat()!= null && !company.getIsRegisteredVat()) {
				VatCategoryModel vatCatModel = new VatCategoryModel();
				vatCatModel.setId(10);
				vatCatModel.setVat(BigDecimal.valueOf(0));
				vatCatModel.setName("N/A");
				vatCatModelList.add(vatCatModel);
			}
		}

		return vatCatModelList;
	}

	public VatCategoryModel getModel(VatCategory vatCategory) {

		if (vatCategory != null) {
			VatCategoryModel vatCatModel = new VatCategoryModel();

			vatCatModel.setId(vatCategory.getId());
			vatCatModel.setVat(vatCategory.getVat());
			vatCatModel.setName(vatCategory.getName());

			return vatCatModel;
		}

		return null;
	}

}
