/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.rest.transactioncategorycontroller;

import java.util.*;
import java.util.stream.Collectors;

import com.simplevat.constant.ChartOfAccountCategoryCodeEnum;
import com.simplevat.constant.PostingReferenceTypeEnum;
import com.simplevat.constant.TransactionCategoryCodeEnum;
import com.simplevat.entity.*;
import com.simplevat.repository.*;
import com.simplevat.repository.ExpenseRepository;
import com.simplevat.service.*;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simplevat.constant.DefaultTypeConstant;
import com.simplevat.entity.bankaccount.ChartOfAccount;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.SingleLevelDropDownModel;
import com.simplevat.service.bankaccount.ChartOfAccountService;

/**
 *
 * @author daynil
 */
@Service
public class TranscationCategoryHelper {

	@Autowired
	private TransactionCategoryService transactionCategoryService;

	@Autowired
	private VatCategoryService vatCategoryService;

	@Autowired
	private ChartOfAccountService transactionTypeService;

	@Autowired
	private EmployeeTransactioncategoryService employeeTransactioncategoryService;

	@Autowired
	private EmployeeService employeeService;

	@Autowired
	private JournalLineItemService journalLineItemService;

	@Autowired
	private JournalLineItemRepository journalLineItemRepository;

	@Autowired
	private InvoiceLineitemRepository invoiceLineitemRepository;

	@Autowired
	private ExpenseRepository expenseRepository;

	@Autowired
	private ProductLineItemRepository productLineItemRepository;

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
//				if (transactionCategory.getChartOfAccount().getChartOfAccountCode().equalsIgnoreCase(ChartOfAccountCategoryCodeEnum.BANK.getCode())
//						|| transactionCategory.getTransactionCategoryCode()
//						.equalsIgnoreCase(TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_ASSETS.getCode()) ||
//						transactionCategory.getTransactionCategoryCode()
//								.equalsIgnoreCase(TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_LIABILITIES.getCode()))
//					continue;
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

				if (transactionCategory.getEditableFlag() == true){
					List<JournalLineItem> journalLineItemListEntries = journalLineItemRepository.findAllByTransactionCategory(transactionCategory);
					if(journalLineItemListEntries!=null && journalLineItemListEntries.size()!=0)
						transactionCategoryModel.setEditableFlag(false);
					else{
						List<InvoiceLineItem> invoiceLineItemList = invoiceLineitemRepository.findAllByTrnsactioncCategory(transactionCategory);
						invoiceLineItemList = invoiceLineItemList.stream()
								.filter(invoiceLineItem -> invoiceLineItem.getInvoice().getDeleteFlag()!= true )
								.collect(Collectors.toList());

						if(invoiceLineItemList!=null && invoiceLineItemList.size()!=0)
							transactionCategoryModel.setEditableFlag(false);
						else {
							List<Expense> expenseList = expenseRepository.findAllByTransactionCategory(transactionCategory);
							if (expenseList!=null && expenseList.size()!=0)
								transactionCategoryModel.setEditableFlag(false);
							else {
								List<ProductLineItem> productLineItems = productLineItemRepository.findAllByTransactioncategory(transactionCategory);
								productLineItems = productLineItems.stream()
										.filter(productLineItem -> productLineItem.getProduct().getDeleteFlag()!= true )
										.collect(Collectors.toList());
								if (productLineItems!=null && productLineItems.size()!=0)
									transactionCategoryModel.setEditableFlag(false);
							}
						}

					}
				}else
					transactionCategoryModel.setEditableFlag(transactionCategory.getEditableFlag());
					transactionCategoryModelList.add(transactionCategoryModel);
			}
		}
		// Collections.reverse(transactionCategoryModelList);
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
			List<ChartOfAccount> categoryList = new ArrayList<>();
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
		Map<Object, Object> chartOfAccountDropdownModelList = new HashMap<>();
		Map<Integer, List<TransactionCategory>> idTrnxCatListMap = new HashMap<>();
		List<TransactionCategory> transactionCategoryList = new ArrayList<>();
		for (TransactionCategory trnxCat : transactionCatList) {
//			if (trnxCat.getChartOfAccount().getChartOfAccountCode().equalsIgnoreCase(ChartOfAccountCategoryCodeEnum.CASH.getCode()))
//				continue;
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
			chartOfAccountDropdownModelList.put(parentCategory, dropDownModelList);
			modelList.add(new SingleLevelDropDownModel(parentCategory, dropDownModelList));
		}
		return modelList;
	}
	public List<SingleLevelDropDownModel> getSingleLevelDropDownModelListForManualJournal(List<TransactionCategory> transactionCatList) {
		List<SingleLevelDropDownModel> modelList = new ArrayList<>();
		Map<Object, Object> chartOfAccountDropdownModelList = new HashMap<>();
		Map<Integer, List<TransactionCategory>> idTrnxCatListMap = new HashMap<>();
		List<TransactionCategory> transactionCategoryList = new ArrayList<>();
		transactionCatList = transactionCatList.stream().filter(transactionCategory ->
				!transactionCategory.getTransactionCategoryCode().equals(TransactionCategoryCodeEnum.PETTY_CASH.getCode()))
				.filter(transactionCategory ->  !transactionCategory.getChartOfAccount().getChartOfAccountCode().equals(ChartOfAccountCategoryCodeEnum.BANK.getCode())).collect(Collectors.toList());
		Map<String,Object> map = new HashMap<>();
		map.put("deleteFlag",Boolean.FALSE);
	     List<EmployeeTransactionCategoryRelation> employeeTransactionCategoryRelationList = employeeTransactioncategoryService.findByAttributes(map);
//		 if (employeeTransactionCategoryRelationList.size()>0)
//			 for (EmployeeTransactionCategoryRelation employeeTransactionCategoryRelation:employeeTransactionCategoryRelationList){
//				 transactionCatList.remove(employeeTransactionCategoryRelation.getTransactionCategory());
//			 }


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
			chartOfAccountDropdownModelList.put(parentCategory, dropDownModelList);
			modelList.add(new SingleLevelDropDownModel(parentCategory, dropDownModelList));
		}
		return modelList;
	}

	public List<DropdownModel> getEmployeeTransactionCategory(List<TransactionCategory> transactionCategoryList){
		List<SingleLevelDropDownModel> response  = new ArrayList<>();
		String parentCategory = "";
		List<DropdownModel> dropDownModelList = new ArrayList<>();
		for (TransactionCategory transactionCategory:transactionCategoryList){

			Map<String, Object> param = new HashMap<>();
			param.put("transactionCategory", transactionCategory);
			List<EmployeeTransactionCategoryRelation> employeeTransactionCategoryRelationList=employeeTransactioncategoryService.findByAttributes(param);

			//added check for Inactive Employee TC's
			if(employeeTransactionCategoryRelationList.size()!=0
					&& employeeTransactionCategoryRelationList.get(0).getEmployee().getIsActive()==true) {
				parentCategory = transactionCategory.getChartOfAccount().getChartOfAccountName();
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
