package com.simplevat.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.simplevat.constant.CommonStatusEnum;
import com.simplevat.entity.VatReportFiling;
import com.simplevat.rest.financialreport.VatReportFilingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simplevat.constant.ContactTypeEnum;
import com.simplevat.constant.PostingReferenceTypeEnum;
import com.simplevat.constant.dbfilter.InvoiceFilterEnum;
import com.simplevat.dao.CustomerInvoiceReceiptDao;
import com.simplevat.dao.Dao;
import com.simplevat.dao.InvoiceDao;
import com.simplevat.dao.JournalDao;
import com.simplevat.dao.JournalLineItemDao;
import com.simplevat.dao.SupplierInvoicePaymentDao;
import com.simplevat.entity.Invoice;
import com.simplevat.entity.JournalLineItem;
import com.simplevat.model.EarningDetailsModel;
import com.simplevat.model.OverDueAmountDetailsModel;
import com.simplevat.model.VatReportResponseModel;
import com.simplevat.repository.InvoiceRepository;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simplevat.rest.financialreport.AmountDetailRequestModel;
import com.simplevat.rest.financialreport.VatReportFilingRequestModel;
import com.simplevat.rest.invoice.dto.InvoiceAmoutResultSet;
import com.simplevat.rest.invoice.dto.VatAmountDto;
import com.simplevat.service.InvoiceService;
import com.simplevat.service.JournalLineItemService;
import com.simplevat.utils.ChartUtil;
import com.simplevat.utils.DateUtils;

@Service("SupplierInvoiceService")
public class InvoiceServiceImpl extends InvoiceService {
	private final Logger logger = LoggerFactory.getLogger(InvoiceServiceImpl.class);

	@Autowired
	private InvoiceDao supplierInvoiceDao;

	@Autowired
	ChartUtil util;

	@Autowired
	DateUtils dateUtils;

	@Autowired
	private JournalDao journalDao;

	@Autowired
	private JournalLineItemDao journalLineItemDao;

	@Autowired
	private CustomerInvoiceReceiptDao customerInvoiceReceiptDao;

	@Autowired
	private SupplierInvoicePaymentDao supplierInvoicePaymentDao;
	
	@Autowired
	private InvoiceRepository invoiceRepository;
	
	@Autowired
	private JournalLineItemService journalLineItemService;

	@Autowired
	private VatReportFilingRepository vatReportFilingRepository;

	@Override
	protected Dao<Integer, Invoice> getDao() {
		return supplierInvoiceDao;
	}

	@Override
	public PaginationResponseModel getInvoiceList(Map<InvoiceFilterEnum, Object> map, PaginationModel paginationModel) {
		return supplierInvoiceDao.getInvoiceList(map, paginationModel);
	}

	@Override
	public void deleteByIds(List<Integer> ids) {
		supplierInvoiceDao.deleteByIds(ids);
	}

	@Override
	public List<DropdownModel> getInvoicesForDropdown(Integer type) {
		return supplierInvoiceDao.getInvoicesForDropdown(type);
	}

	@Override
	public Integer  getLastInvoiceNo(Integer invoiceType) {

		Invoice invoice = supplierInvoiceDao.getLastInvoice(invoiceType);
		if (invoice != null) {
			try {
				String referenceNumber = invoice.getReferenceNumber();
				if(referenceNumber!=null && (referenceNumber.contains("INV")||referenceNumber.contains("SUP")))
					referenceNumber=referenceNumber.substring(referenceNumber.indexOf("-")+1);
				return Integer.valueOf(referenceNumber) + 1;
			} catch (Exception e) {
				return 0;
			}
		}
		return 1;
	}

	@Override
	public List<Invoice> getInvoiceList(int mounthCount) {
		return supplierInvoiceDao.getInvoiceList(util.getStartDate(Calendar.MONTH, -mounthCount).getTime(),
				util.getEndDate().getTime());

	}

	/**
	 * @author zain/Muzammil for getting overdueamount created on:28/03/2020
	 * 
	 * @param @see com.simplevat.constant.ContactTypeEnum
	 * 
	 * 
	 */

	@Override
	public OverDueAmountDetailsModel getOverDueAmountDetails(Integer type) {
    return supplierInvoiceDao.getOverDueAmountDetails(type);
	}
	@Override
	public EarningDetailsModel getTotalEarnings(){
		return supplierInvoiceDao.getTotalEarnings();
	}

	/**
	 * @author $@urabh for deleting journal belongs to invoice created on:15/05/2020
	 */
	@Override
	public Invoice deleteJournaForInvoice(Invoice invoice) {

		try {
			// find journal related to invoice and delete
			Map<String, Object> param = new HashMap<>();
			param.put("referenceType", PostingReferenceTypeEnum.INVOICE);
			param.put("referenceId", invoice.getId());
			param.put("deleteFlag", false);
			List<JournalLineItem> lineItemList = journalLineItemDao.findByAttributes(param);

			if (lineItemList != null && !lineItemList.isEmpty()) {
				List<Integer> list = new ArrayList<>();
				list.add(lineItemList.get(0).getJournal().getId());
				journalDao.deleteByIds(list);
			}

		} catch (Exception e) {
			logger.error(e.getMessage());
		}
		return invoice;
	}

	/**
	 * @author $@urabh : get invoice based on status created on:20/05/2020
	 * @param @see InvoiceStatusEnum
	 * @return list invoiceList
	 */
	@Override
	public List<Invoice> getUnpaidInvoice(Integer contactId, ContactTypeEnum type) {
		return supplierInvoiceDao.getUnpaidInvoice(contactId, type);
	}
	@Override
	public List<Invoice> getSuggestionInvoices(BigDecimal amount, Integer contactId, ContactTypeEnum type, Integer currency,
											   Integer userId) {
		return supplierInvoiceDao.getSuggestionUnpaidInvoices(amount, contactId, type,currency,userId);
	}

	@Override
	public List<Invoice> getSuggestionExplainedInvoices(BigDecimal amount, Integer contactId, ContactTypeEnum type, Integer currency,
                                                        Integer userId) {
		return supplierInvoiceDao.getSuggestionExplainedInvoices(amount, contactId, type, currency,userId);
	}

	@Override
	public Integer getTotalInvoiceCountByContactId(Integer contactId){
		return supplierInvoiceDao.getTotalInvoiceCountByContactId(contactId);
	}

	@Override
	public Integer getReceiptCountByCustInvoiceId(Integer invoiceId){
		return supplierInvoiceDao.getReceiptCountByCustInvoiceId(invoiceId);

	}
	@Override
	public Integer getReceiptCountBySupInvoiceId(Integer invoiceId){
		return supplierInvoiceDao.getReceiptCountBySupInvoiceId(invoiceId);

	}
	@Override
	public  void getSumOfTotalAmountWithVat(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel){
		 supplierInvoiceDao.getSumOfTotalAmountWithVat( reportRequestModel,vatReportResponseModel);
	}
	@Override
	public void sumOfTotalAmountWithoutVat(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel){
		 supplierInvoiceDao.sumOfTotalAmountWithoutVat(reportRequestModel,vatReportResponseModel);
	}
	@Override
	public  void sumOfTotalAmountWithoutVatForRCM(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel){
		supplierInvoiceDao.sumOfTotalAmountWithoutVatForRCM( reportRequestModel,vatReportResponseModel);
	}
	@Override
	public void getSumOfTotalAmountWithVatForRCM(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel){
		supplierInvoiceDao.getSumOfTotalAmountWithVatForRCM(reportRequestModel,vatReportResponseModel);
	}
	@Override
	public  BigDecimal getTotalInputVatAmount(VatReportFilingRequestModel vatReportFilingRequestModel){
		return supplierInvoiceDao.getTotalInputVatAmount(vatReportFilingRequestModel);
	}
	@Override
	public BigDecimal getTotalOutputVatAmount(VatReportFilingRequestModel vatReportFilingRequestModel){
		return supplierInvoiceDao.getTotalOutputVatAmount(vatReportFilingRequestModel);
	}

	@Override
	public List<VatAmountDto> getAmountDetails(AmountDetailRequestModel amountDetailRequestModel) {
		List<VatAmountDto> amoutDtoList = new ArrayList<>();
		List <InvoiceAmoutResultSet> invoiceQueryResultList = new ArrayList<>();
		List <InvoiceAmoutResultSet> expenseQueryResultList = new ArrayList<>();
		Boolean editFlag = Boolean.TRUE;
		VatReportFiling vatReportFiling = vatReportFilingRepository.getVatReportFilingByStartDateAndEndDate(amountDetailRequestModel.getStartDate(),amountDetailRequestModel.getEndDate());
		if (vatReportFiling!=null){
			if (vatReportFiling.getStatus().equals(CommonStatusEnum.UN_FILED.getValue())){
				editFlag = Boolean.TRUE;
			}
			else {
				editFlag = Boolean.FALSE;
			}
		}
		switch (amountDetailRequestModel.getPlaceOfSyply()){
		case 1: case 2: case 3: case 4: case 5: case 6: case 7:

			invoiceQueryResultList = invoiceRepository.getAmountDetails(amountDetailRequestModel.getPlaceOfSyply(),amountDetailRequestModel.getStartDate(),amountDetailRequestModel.getEndDate(),editFlag);
			break;
	    case 8:
			List <InvoiceAmoutResultSet> invoiceQueryResultListForReverseCharge = invoiceRepository.getReverseChargeProvisions(amountDetailRequestModel.getStartDate(),amountDetailRequestModel.getEndDate(),editFlag);
			List <InvoiceAmoutResultSet> ExpenseQueryResultListForReverseCharge = invoiceRepository.getReverseChargeForExpense(amountDetailRequestModel.getStartDate(),amountDetailRequestModel.getEndDate(),editFlag);
			invoiceQueryResultList = contList(invoiceQueryResultListForReverseCharge);
			expenseQueryResultList = contList(ExpenseQueryResultListForReverseCharge);
	    	break;
	    case 9:
			invoiceQueryResultList = invoiceRepository.getZeroRatedSupplies(amountDetailRequestModel.getStartDate(),amountDetailRequestModel.getEndDate(),editFlag);
	    	break;
	    case 10:
			invoiceQueryResultList = invoiceRepository.getExemptSupplies(amountDetailRequestModel.getStartDate(),amountDetailRequestModel.getEndDate(),editFlag);
	    	break;
	    case 11:
	    	List <InvoiceAmoutResultSet> InvoiceQueryResultList = invoiceRepository.geStanderdRatedInvoice(amountDetailRequestModel.getStartDate(),amountDetailRequestModel.getEndDate(),editFlag);
			List <InvoiceAmoutResultSet> ExpenseQueryResultList = invoiceRepository.geStanderdRatedExpense(amountDetailRequestModel.getStartDate(),amountDetailRequestModel.getEndDate(),editFlag);
			invoiceQueryResultList = contList(InvoiceQueryResultList);
			expenseQueryResultList = contList(ExpenseQueryResultList);
	    	break;
		}
		logger.info("The InvoiceList Size {} ", invoiceQueryResultList.size());
		for (InvoiceAmoutResultSet invoiceResultSet : invoiceQueryResultList) {
			VatAmountDto amountDto = new VatAmountDto();
			BigDecimal amount = invoiceResultSet.getTotalAmount().subtract(invoiceResultSet.getTotalVatAmount());
			amountDto.setId(invoiceResultSet.getId());
			amountDto.setDate(invoiceResultSet.getInvoiceDate().toString());
			amountDto.setEntry(invoiceResultSet.getReferenceNumber());
			//amountDto.setTransactionType(getReferenceNumber(invoiceResultSet.getId()));
			amountDto.setAmount(amount);
			amountDto.setVatAmount(invoiceResultSet.getTotalVatAmount());
			amountDto.setCurrency(invoiceResultSet.getCurrency());
			amoutDtoList.add(amountDto);	
		}
			for (InvoiceAmoutResultSet invoiceResultSet : expenseQueryResultList) {
				VatAmountDto amountDto = new VatAmountDto();
				if (invoiceResultSet.getExclusiveVat().equals(Boolean.TRUE)){
					amountDto.setAmount(invoiceResultSet.getTotalAmount());
				}
				else {
					BigDecimal amount = invoiceResultSet.getTotalAmount().subtract(invoiceResultSet.getTotalVatAmount());
					amountDto.setAmount(amount);
				}
				amountDto.setId(invoiceResultSet.getId());
				amountDto.setDate(invoiceResultSet.getInvoiceDate().toString());
				amountDto.setEntry(invoiceResultSet.getReferenceNumber());
				//amountDto.setTransactionType(getReferenceNumber(invoiceResultSet.getId()));
				amountDto.setVatAmount(invoiceResultSet.getTotalVatAmount());
				amountDto.setCurrency(invoiceResultSet.getCurrency());
				amoutDtoList.add(amountDto);
		}
		return amoutDtoList;
	}

	/**
	 * 
	 * @param queryResultList
	 * @return resultList 
	 */
	private List<InvoiceAmoutResultSet> contList(List<InvoiceAmoutResultSet> queryResultList) {

		List<InvoiceAmoutResultSet> resultList  = new ArrayList<>();
		resultList.addAll(queryResultList);
		return resultList;
	}	

	/**
	 * 
	 * @param id
	 * @return transactionType
	 */
	private String getReferenceNumber(Integer id) {

		 String transactionType = null;
		 Map<String, Object> param = new HashMap<>();
	       param.put("referenceId", id);
		   param.put("referenceType", "INVOICE");
	       List<JournalLineItem> journalLineItemList = journalLineItemService.findByAttributes(param);
		
	       for (JournalLineItem journalLineItem:journalLineItemList){
	    	    transactionType =  journalLineItem.getReferenceType().toString();
	        }
		return transactionType;
	}


}