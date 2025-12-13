/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest.transactioncategorycontroller;

import com.simpleaccounts.constant.ChartOfAccountCategoryCodeEnum;
import com.simpleaccounts.constant.DefaultTypeConstant;
import com.simpleaccounts.constant.TransactionCategoryCodeEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.repository.*;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.SingleLevelDropDownModel;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

/**
 *
 * @author daynil
 */
@Service
@RequiredArgsConstructor
public class TranscationCategoryHelper {

	private final TransactionCategoryService transactionCategoryService;

	private final VatCategoryService vatCategoryService;

	private final ChartOfAccountService transactionTypeService;

	private final EmployeeTransactioncategoryService employeeTransactioncategoryService;

	private final EmployeeService employeeService;

	private final JournalLineItemService journalLineItemService;

	private final JournalLineItemRepository journalLineItemRepository;

	private final InvoiceLineitemRepository invoiceLineitemRepository;

	private final ExpenseRepository expenseRepository;

	private final ProductLineItemRepository productLineItemRepository;

	public TransactionCategory getEntity(TransactionCategoryBean transactionCategoryBean) {
		TransactionCategory transactionCategory = new TransactionCategory();
		if (transactionCategoryBean.getDefaltFlag() != null && !transactionCategoryBean.getDefaltFlag().isEmpty()) {
			transactionCategory.setDefaltFlag(transactionCategoryBean.getDefaltFlag().charAt(0));
		} else {
			transactionCategory.setDefaltFlag(DefaultTypeConstant.NO);
		}
		if (transactionCategoryBean.getParentTransactionCategory() != null) {
			transactionCategory.setParentTransactionCategory(
					transactionCategoryService.findByPK(transactionCategoryBean.getParentTransactionCategory()));
		}
		if (transactionCategoryBean.getTransactionCategoryId() != null
				&& transactionCategoryBean.getTransactionCategoryId() > 0) {
			transactionCategory.setTransactionCategoryId(transactionCategoryBean.getTransactionCategoryId());
		}
		transactionCategory
				.setTransactionCategoryDescription(transactionCategoryBean.getTransactionCategoryDescription());
		transactionCategory.setTransactionCategoryName(transactionCategoryBean.getTransactionCategoryDescription() +" - "+transactionCategoryBean.getTransactionCategoryName());
		transactionCategory.setEditableFlag(Boolean.TRUE);
		transactionCategory.setSelectableFlag(Boolean.TRUE);
		if (transactionCategoryBean.getChartOfAccount() != null) {
			ChartOfAccount chartOfAccount = transactionTypeService
					.findByPK(transactionCategoryBean.getChartOfAccount());
			transactionCategory.setChartOfAccount(chartOfAccount);

			transactionCategory.setTransactionCategoryCode(
					transactionCategoryService.getNxtTransactionCatCodeByChartOfAccount(chartOfAccount));

		}
		if (transactionCategoryBean.getVatCategory() != null) {
			transactionCategory.setVatCategory(vatCategoryService.findByPK(transactionCategoryBean.getVatCategory()));
		}
		if (transactionCategoryBean.getVersionNumber() != null) {
			transactionCategory.setVersionNumber(transactionCategoryBean.getVersionNumber());
		} else {
			transactionCategory.setVersionNumber(0);
		}
		return transactionCategory;
	}

	public List<TransactionCategoryModel> getListModel(Object transactionCategories) {
		List<TransactionCategoryModel> transactionCategoryModelList = new ArrayList<>();

		if (transactionCategories != null) {
			for (TransactionCategory transactionCategory : (List<TransactionCategory>) transactionCategories) {

				TransactionCategoryModel transactionCategoryModel = new TransactionCategoryModel();
				BeanUtils.copyProperties(transactionCategory, transactionCategoryModel);
				if (transactionCategory.getChartOfAccount() != null) {
					transactionCategoryModel
							.setTransactionTypeId(transactionCategory.getChartOfAccount().getChartOfAccountId());
					transactionCategoryModel
							.setTransactionTypeName(transactionCategory.getChartOfAccount().getChartOfAccountName());
				}
				if (transactionCategory.getParentTransactionCategory() != null) {
					transactionCategoryModel.setParentTransactionCategoryId(
							transactionCategory.getParentTransactionCategory().getTransactionCategoryId());
					transactionCategoryModel.setTransactionCategoryName(transactionCategory.getTransactionCategoryName());
				}
				if (transactionCategory.getVatCategory() != null) {
					transactionCategoryModel.setVatCategoryId(transactionCategory.getVatCategory().getId());
				}

					if (Boolean.TRUE.equals(transactionCategory.getEditableFlag())){
					List<JournalLineItem> journalLineItemListEntries = journalLineItemRepository.findAllByTransactionCategory(transactionCategory);
					if(journalLineItemListEntries!=null && !journalLineItemListEntries.isEmpty())
						transactionCategoryModel.setEditableFlag(false);
					else{
						List<InvoiceLineItem> invoiceLineItemList = invoiceLineitemRepository.findAllByTrnsactioncCategory(transactionCategory);
						invoiceLineItemList = invoiceLineItemList.stream()
								.filter(invoiceLineItem -> invoiceLineItem.getInvoice().getDeleteFlag()!= true )
								.collect(Collectors.toList());

						if(invoiceLineItemList!=null && !invoiceLineItemList.isEmpty())
							transactionCategoryModel.setEditableFlag(false);
						else {
							List<Expense> expenseList = expenseRepository.findAllByTransactionCategory(transactionCategory);
							if (expenseList!=null && !expenseList.isEmpty())
								transactionCategoryModel.setEditableFlag(false);
							else {
								List<ProductLineItem> productLineItems = productLineItemRepository.findAllByTransactioncategory(transactionCategory);
								productLineItems = productLineItems.stream()
										.filter(productLineItem -> productLineItem.getProduct().getDeleteFlag()!= true )
										.collect(Collectors.toList());
								if (productLineItems!=null && !productLineItems.isEmpty())
									transactionCategoryModel.setEditableFlag(false);
							}
						}

					}
				}else
					transactionCategoryModel.setEditableFlag(transactionCategory.getEditableFlag());
					transactionCategoryModelList.add(transactionCategoryModel);
			}
		}

		return transactionCategoryModelList;
	}

	public List<TransactionCategoryExportModel> getExportListModel(List<TransactionCategory> transactionCategories) {
		List<TransactionCategoryExportModel> transactionCategoryExportModelList = new ArrayList<>();

		if (transactionCategories != null) {
			for (TransactionCategory transactionCategory : transactionCategories) {
				TransactionCategoryExportModel transactionCategoryExportModel = new TransactionCategoryExportModel();
				transactionCategoryExportModel.setTransactionCategoryId(transactionCategory.getTransactionCategoryId());
				transactionCategoryExportModel.setTransactionCategoryName(transactionCategory.getTransactionCategoryName());

				if(transactionCategory.getChartOfAccount() !=null && transactionCategory.getChartOfAccount().getChartOfAccountName() !=null) {
					transactionCategoryExportModel.setTransactionTypeName(transactionCategory.getChartOfAccount().getChartOfAccountName());
				}
				transactionCategoryExportModel.setTransactionCategoryCode(transactionCategory.getTransactionCategoryCode());
				transactionCategoryExportModelList.add(transactionCategoryExportModel);
			}
		}
		return transactionCategoryExportModelList;
	}

	public TransactionCategoryModel getModel(TransactionCategory transactionCategory) {
		TransactionCategoryModel transactionCategoryModel = new TransactionCategoryModel();
		BeanUtils.copyProperties(transactionCategory, transactionCategoryModel);
		if (transactionCategory.getChartOfAccount() != null) {
			transactionCategoryModel
					.setTransactionTypeId(transactionCategory.getChartOfAccount().getChartOfAccountId());
			transactionCategoryModel
					.setTransactionTypeName(transactionCategory.getChartOfAccount().getChartOfAccountName());
		}
		if (transactionCategory.getParentTransactionCategory() != null) {
			transactionCategoryModel.setParentTransactionCategoryId(
					transactionCategory.getParentTransactionCategory().getTransactionCategoryId());
		}
		if (transactionCategory.getVatCategory() != null) {
			transactionCategoryModel.setVatCategoryId(transactionCategory.getVatCategory().getId());
		}
		return transactionCategoryModel;
	}

	public Object getDropDownModelList(List<ChartOfAccount> list) {
		if (list != null && !list.isEmpty()) {
			Map<Object, Object> chartOfAccountDropdownModelList = new HashMap<>();
			Map<Integer, List<ChartOfAccount>> idTrnxCatListMap = new HashMap<>();
			List<ChartOfAccount> categoryList;
			for (ChartOfAccount trnxCat : list) {
				getParentChartOfAccount(idTrnxCatListMap, trnxCat);
			}

			for (Integer key : idTrnxCatListMap.keySet()) {

				String parentCategory = "";
				categoryList = idTrnxCatListMap.get(key);

				List<DropdownModel> dropDownModelList = new ArrayList<>();
				for (ChartOfAccount trnxCat : categoryList) {
					parentCategory = trnxCat.getParentChartOfAccount().getChartOfAccountName();
					dropDownModelList
							.add(new DropdownModel(trnxCat.getChartOfAccountId(), trnxCat.getChartOfAccountName()));
				}

				chartOfAccountDropdownModelList.put(parentCategory, dropDownModelList);
			}
			return chartOfAccountDropdownModelList;
		}
		return null;
	}

	private void getParentChartOfAccount(Map<Integer, List<ChartOfAccount>> idTrnxCatListMap, ChartOfAccount trnxCat) {
		List<ChartOfAccount> categoryList;
		if (trnxCat.getParentChartOfAccount() != null) {
			if (idTrnxCatListMap.containsKey(trnxCat.getParentChartOfAccount().getChartOfAccountId())) {
				categoryList = idTrnxCatListMap.get(trnxCat.getParentChartOfAccount().getChartOfAccountId());
				categoryList.add(trnxCat);
			} else {
				categoryList = new ArrayList<>();
				categoryList.add(trnxCat);
				idTrnxCatListMap.put(trnxCat.getParentChartOfAccount().getChartOfAccountId(), categoryList);
			}
		}
	}

	public List<SingleLevelDropDownModel> getSinleLevelDropDownModelList(List<TransactionCategory> transactionCatList) {
		List<SingleLevelDropDownModel>
				modelList = new ArrayList<>();
		Map<Integer, List<TransactionCategory>> idTrnxCatListMap = new HashMap<>();
		List<TransactionCategory> transactionCategoryList;
		for (TransactionCategory trnxCat : transactionCatList) {

			if (trnxCat.getChartOfAccount() != null) {
				if (idTrnxCatListMap.containsKey(trnxCat.getChartOfAccount().getChartOfAccountId())) {
					transactionCategoryList = idTrnxCatListMap.get(trnxCat.getChartOfAccount().getChartOfAccountId());
					transactionCategoryList.add(trnxCat);
				} else {
					transactionCategoryList = new ArrayList<>();
					transactionCategoryList.add(trnxCat);
					idTrnxCatListMap.put(trnxCat.getChartOfAccount().getChartOfAccountId(), transactionCategoryList);
				}
			}
		}

		for (Integer key : idTrnxCatListMap.keySet()) {
			String parentCategory = "";
			transactionCategoryList = idTrnxCatListMap.get(key);
			List<DropdownModel> dropDownModelList = new ArrayList<>();
			for (TransactionCategory trnxCat : transactionCategoryList) {
				parentCategory = trnxCat.getChartOfAccount().getChartOfAccountName();
				dropDownModelList.add(
						new DropdownModel(trnxCat.getTransactionCategoryId(), trnxCat.getTransactionCategoryName()));
			}
			modelList.add(new SingleLevelDropDownModel(parentCategory, dropDownModelList));
		}
		return modelList;
	}
	public List<SingleLevelDropDownModel> getSingleLevelDropDownModelListForManualJournal(List<TransactionCategory> transactionCatList) {
		List<SingleLevelDropDownModel> modelList = new ArrayList<>();
		Map<Integer, List<TransactionCategory>> idTrnxCatListMap = new HashMap<>();
		List<TransactionCategory> transactionCategoryList;
		transactionCatList = transactionCatList.stream().filter(transactionCategory ->
				!transactionCategory.getTransactionCategoryCode().equals(TransactionCategoryCodeEnum.PETTY_CASH.getCode()))
				.filter(transactionCategory ->  !transactionCategory.getChartOfAccount().getChartOfAccountCode().equals(ChartOfAccountCategoryCodeEnum.BANK.getCode())).collect(Collectors.toList());

		for (TransactionCategory trnxCat : transactionCatList) {
			if (trnxCat.getChartOfAccount() != null) {
				if (idTrnxCatListMap.containsKey(trnxCat.getChartOfAccount().getChartOfAccountId())) {
					transactionCategoryList = idTrnxCatListMap.get(trnxCat.getChartOfAccount().getChartOfAccountId());
					transactionCategoryList.add(trnxCat);
				} else {
					transactionCategoryList = new ArrayList<>();
					transactionCategoryList.add(trnxCat);
					idTrnxCatListMap.put(trnxCat.getChartOfAccount().getChartOfAccountId(), transactionCategoryList);
				}
			}
		}

		for (Integer key : idTrnxCatListMap.keySet()) {
			String parentCategory = "";
			transactionCategoryList = idTrnxCatListMap.get(key);
			List<DropdownModel> dropDownModelList = new ArrayList<>();
			for (TransactionCategory trnxCat : transactionCategoryList) {
				parentCategory = trnxCat.getChartOfAccount().getChartOfAccountName();
				dropDownModelList.add(
						new DropdownModel(trnxCat.getTransactionCategoryId(), trnxCat.getTransactionCategoryName()));
			}
			modelList.add(new SingleLevelDropDownModel(parentCategory, dropDownModelList));
		}
		return modelList;
	}

	public List<DropdownModel> getEmployeeTransactionCategory(List<TransactionCategory> transactionCategoryList){
		List<DropdownModel> dropDownModelList = new ArrayList<>();
		for (TransactionCategory transactionCategory:transactionCategoryList){

			Map<String, Object> param = new HashMap<>();
			param.put("transactionCategory", transactionCategory);
			List<EmployeeTransactionCategoryRelation> employeeTransactionCategoryRelationList=employeeTransactioncategoryService.findByAttributes(param);

			//added check for Inactive Employee TC's
				if(!employeeTransactionCategoryRelationList.isEmpty()
						&& Boolean.TRUE.equals(employeeTransactionCategoryRelationList.get(0).getEmployee().getIsActive())) {
					dropDownModelList.add(
							new DropdownModel(transactionCategory.getTransactionCategoryId(), transactionCategory.getTransactionCategoryName()));
			}//if
		}
		return dropDownModelList;
	}

	public List<DropdownModel> getCOACList(List<ChartOfAccountCategory> chartOfAccountCategories){
		List<DropdownModel> dropDownModelList = new ArrayList<>();
		for (ChartOfAccountCategory category:chartOfAccountCategories){
				dropDownModelList.add(
						new DropdownModel(category.getChartOfAccountCategoryId(), category.getChartOfAccountCategoryName()));
			}
		return dropDownModelList;
	}
}
