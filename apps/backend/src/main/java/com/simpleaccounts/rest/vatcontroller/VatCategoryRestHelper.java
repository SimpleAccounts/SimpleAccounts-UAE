package com.simpleaccounts.rest.vatcontroller;

import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.service.CompanyService;
import com.simpleaccounts.service.VatCategoryService;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class VatCategoryRestHelper {

	private final VatCategoryService vatCategoryService;

	private final CompanyService companyService;

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

					if(vatCategory.getId() != 10 ) {
						vatCatModel.setId(vatCategory.getId());
						vatCatModel.setVat(vatCategory.getVat());
						vatCatModel.setName(vatCategory.getName());

					vatCatModelList.add(vatCatModel);

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
