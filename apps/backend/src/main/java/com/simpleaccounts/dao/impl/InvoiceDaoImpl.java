package com.simpleaccounts.dao.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Collections;
import java.util.Map;
import java.util.TimeZone;

import javax.persistence.Query;
import javax.persistence.TypedQuery;

import com.simpleaccounts.constant.*;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.model.EarningDetailsModel;
import com.simpleaccounts.model.VatReportModel;
import com.simpleaccounts.model.VatReportResponseModel;
import com.simpleaccounts.rest.InvoiceOverDueModel;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.rest.financialreport.VatReportFilingRepository;
import com.simpleaccounts.rest.financialreport.VatReportFilingRequestModel;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.DateFormatUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.InvoiceFilterEnum;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.InvoiceDao;
import com.simpleaccounts.dao.JournalDao;
import com.simpleaccounts.dao.JournalLineItemDao;
import com.simpleaccounts.model.OverDueAmountDetailsModel;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.utils.DateUtils;

@Repository
public class InvoiceDaoImpl extends AbstractDao<Integer, Invoice> implements InvoiceDao {

	@Autowired
	private DateUtils dateUtil;

	@Autowired
	private DateFormatUtil dateUtils;

	@Autowired
	private DatatableSortingFilterConstant datatableUtil;

	@Autowired
	private JournalDao journalDao;

	@Autowired
	private JournalLineItemDao journalLineItemDao;

	@Autowired
	private TransactionCategoryService transactionCategoryService;

	@Autowired
	private VatReportFilingRepository vatReportFilingRepository;

	@Autowired
	private UserService userService;

	@Override
	public PaginationResponseModel getInvoiceList(Map<InvoiceFilterEnum, Object> filterMap,
			PaginationModel paginationModel) {
		List<DbFilter> dbFilters = new ArrayList<>();
		filterMap.forEach(
				(productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
						.condition(productFilter.getCondition()).value(value).build()));
		paginationModel.setSortingCol(
				datatableUtil.getColName(paginationModel.getSortingCol(), DatatableSortingFilterConstant.INVOICE));
		PaginationResponseModel response = new PaginationResponseModel();
		response.setCount(this.getResultCount(dbFilters));
		response.setData(this.executeQuery(dbFilters, paginationModel));
		return response;
	}
	@Override
	public List<DropdownModel> getInvoicesForDropdown(Integer type) {
		//return getEntityManager().createNamedQuery("invoiceForDropdown", DropdownModel.class).getResultList();
		TypedQuery<DropdownModel> query = getEntityManager().createNamedQuery("invoiceForDropdown", DropdownModel.class);
		query.setParameter("type", type);
		return query.getResultList();
	}
	@Override
	public void deleteByIds(List<Integer> ids) {
		if (ids != null && !ids.isEmpty()) {
			for (Integer id : ids) {
				Invoice supplierInvoice = findByPK(id);
				supplierInvoice.setDeleteFlag(Boolean.TRUE);
				// find journal related to invoice and delete
				Map<String, Object> param = new HashMap<>();
				param.put("referenceType", PostingReferenceTypeEnum.INVOICE);
				param.put("referenceId", id);
				param.put("deleteFlag", false);
				List<JournalLineItem> lineItemList = journalLineItemDao.findByAttributes(param);

				if (lineItemList != null && !lineItemList.isEmpty()) {
					List<Integer> list = new ArrayList<>();
					list.add(lineItemList.get(0).getJournal().getId());
					journalDao.deleteByIds(list);
				}
				update(supplierInvoice);
			}
		}
	}
	@Override
	public Invoice getLastInvoice(Integer invoiceType) {
		TypedQuery<Invoice> query = getEntityManager().createNamedQuery("lastInvoice", Invoice.class);
		query.setParameter("type", invoiceType);
		query.setMaxResults(1);
		List<Invoice> invoiceList = query.getResultList();

		return invoiceList != null && !invoiceList.isEmpty() ? invoiceList.get(0) : null;
	}
	@Override
	public List<Invoice> getInvoiceList(Date startDate, Date endDate) {
		TypedQuery<Invoice> query = getEntityManager().createNamedQuery("activeInvoicesByDateRange", Invoice.class);
		query.setParameter(CommonColumnConstants.START_DATE, dateUtil.get(startDate).toLocalDate());
		query.setParameter(CommonColumnConstants.END_DATE, dateUtil.get(endDate).toLocalDate());
		List<Invoice> invoiceList = query.getResultList();
		return invoiceList != null ? invoiceList : Collections.emptyList();
	}
	@Override
	public EarningDetailsModel getTotalEarnings(){
		TypedQuery<BigDecimal> query = getEntityManager().createNamedQuery("getTotalPaidCustomerInvoice", BigDecimal.class);
		query.setParameter(CommonColumnConstants.CURRENT_DATE,dateUtil.get(new Date()));
		query.setMaxResults(1);
		BigDecimal paidCustomerInvoice = query.getSingleResult();
		Float paidCustomerInvoiceFloat = (float) 0;
		if (paidCustomerInvoice != null)
			paidCustomerInvoiceFloat = paidCustomerInvoice.floatValue();
		Date date = new Date();

		Date startDate = DateUtils.getStartDate(DateUtils.Duration.THIS_WEEK, TimeZone.getDefault(), date);
		Date endDate = DateUtils.getEndDate(DateUtils.Duration.THIS_WEEK, TimeZone.getDefault(), date);
		Float paidCustomerInvoiceAmountWeeklyFloat = getTotalEarningsWeeklyMonthly(startDate, endDate);

		startDate = DateUtils.getStartDate(DateUtils.Duration.THIS_MONTH, TimeZone.getDefault(), date);
		endDate = DateUtils.getEndDate(DateUtils.Duration.THIS_MONTH, TimeZone.getDefault(), date);
		Float totalEarningsAmountMonthlyFloat = getTotalEarningsWeeklyMonthly( startDate, endDate);

		return new EarningDetailsModel(paidCustomerInvoiceFloat, paidCustomerInvoiceAmountWeeklyFloat, totalEarningsAmountMonthlyFloat);
	}
	@Override
	public OverDueAmountDetailsModel getOverDueAmountDetails(Integer type) {
		Float overDueAmountFloat = (float) 0;
		Float overDueAmountWeeklyFloat = (float) 0;
		Float overDueAmountMonthlyFloat = (float) 0;
		Date date = new Date();
		if(type==2)
		{
			overDueAmountFloat = getOverDueCustomerAmount(type );
			Date startDate = DateUtils.getStartDate(DateUtils.Duration.THIS_WEEK, TimeZone.getDefault(), date);
			Date endDate = DateUtils.getEndDate(DateUtils.Duration.THIS_WEEK, TimeZone.getDefault(), date);
			overDueAmountWeeklyFloat = getOverDueCustomerAmountWeeklyMonthly(type, startDate, endDate);
			startDate = DateUtils.getStartDate(DateUtils.Duration.THIS_MONTH, TimeZone.getDefault(), date);
			endDate = DateUtils.getEndDate(DateUtils.Duration.THIS_MONTH, TimeZone.getDefault(), date);
			overDueAmountMonthlyFloat = getOverDueCustomerAmountWeeklyMonthly(type, startDate, endDate);
		}
		else{
			overDueAmountFloat = getOverDueSupplierAmount(type);
			Date startDate = DateUtils.getStartDate(DateUtils.Duration.THIS_WEEK, TimeZone.getDefault(), date);
			Date endDate = DateUtils.getEndDate(DateUtils.Duration.THIS_WEEK, TimeZone.getDefault(), date);
			overDueAmountWeeklyFloat = getOverDueSupplierAmountWeeklyMonthly(type, startDate, endDate);
			startDate = DateUtils.getStartDate(DateUtils.Duration.THIS_MONTH, TimeZone.getDefault(), date);
			endDate = DateUtils.getEndDate(DateUtils.Duration.THIS_MONTH, TimeZone.getDefault(), date);
			overDueAmountMonthlyFloat = getOverDueSupplierAmountWeeklyMonthly(type, startDate, endDate);
		}
		return new OverDueAmountDetailsModel(overDueAmountFloat, overDueAmountWeeklyFloat, overDueAmountMonthlyFloat);
	}
	private Float getOverDueSupplierAmount(Integer type) {
		TypedQuery<InvoiceOverDueModel> queryOverDue = getEntityManager().createNamedQuery("totalSupplierInvoiceAmount", InvoiceOverDueModel.class);
		queryOverDue.setParameter("type", type);
		queryOverDue.setParameter(CommonColumnConstants.CURRENT_DATE, LocalDateTime.now().truncatedTo(ChronoUnit.DAYS));
		queryOverDue.setParameter(CommonColumnConstants.REFERENCE_TYPE, PostingReferenceTypeEnum.INVOICE);
		//queryOverDue.setParameter("transactionCategory", transactionCategoryService.findByPK(84));
		queryOverDue.setMaxResults(1);
		Float overDueAmountFloat = (float)0;
		InvoiceOverDueModel invoiceOverDueModel = queryOverDue.getSingleResult();
		BigDecimal totalInvoiceAmount = invoiceOverDueModel.getDebitAmount();
		TypedQuery<BigDecimal> query = getEntityManager().createNamedQuery("totalInvoicePaymentAmount", BigDecimal.class);
		query.setParameter("type", type);
		query.setParameter(CommonColumnConstants.CURRENT_DATE, LocalDateTime.now().truncatedTo(ChronoUnit.DAYS));
		query.setParameter(CommonColumnConstants.REFERENCE_TYPE, PostingReferenceTypeEnum.PAYMENT);
		query.setParameter(CommonColumnConstants.TRANSACTION_CATEGORY, transactionCategoryService.findByPK(1));
		query.setMaxResults(1);
		BigDecimal totalInvoiceReceiptAmount = query.getSingleResult();
		if (totalInvoiceReceiptAmount != null && totalInvoiceAmount != null )
			overDueAmountFloat = totalInvoiceAmount.subtract(totalInvoiceReceiptAmount).floatValue();
		else if (totalInvoiceAmount != null)
			overDueAmountFloat = totalInvoiceAmount.floatValue();
		return overDueAmountFloat;
	}
	private Float getOverDueCustomerAmount(Integer type) {
		TypedQuery<InvoiceOverDueModel> queryOverDue = getEntityManager().createNamedQuery("totalCustomerInvoiceAmount", InvoiceOverDueModel.class);
		queryOverDue.setParameter("type", type);
		queryOverDue.setParameter(CommonColumnConstants.CURRENT_DATE, LocalDateTime.now().truncatedTo(ChronoUnit.DAYS));
		queryOverDue.setParameter(CommonColumnConstants.REFERENCE_TYPE, PostingReferenceTypeEnum.INVOICE);
		//queryOverDue.setParameter("transactionCategory", transactionCategoryService.findByPK(84));
		queryOverDue.setMaxResults(1);
		Float overDueAmountFloat = (float)0;
		InvoiceOverDueModel invoiceOverDueModel = queryOverDue.getSingleResult();
		BigDecimal totalInvoiceAmount = invoiceOverDueModel.getCreditAmount();
		TypedQuery<BigDecimal> query  = getEntityManager().createNamedQuery("totalInvoiceReceiptAmount", BigDecimal.class);
		query.setParameter("type", type);
		query.setParameter(CommonColumnConstants.CURRENT_DATE,LocalDateTime.now().truncatedTo(ChronoUnit.DAYS));
		query.setParameter(CommonColumnConstants.REFERENCE_TYPE, PostingReferenceTypeEnum.RECEIPT);
		query.setParameter(CommonColumnConstants.TRANSACTION_CATEGORY, transactionCategoryService.findByPK(2));
		query.setMaxResults(1);
		BigDecimal totalInvoiceReceiptAmount = query.getSingleResult();
		if (totalInvoiceReceiptAmount != null && totalInvoiceAmount != null ) {
			overDueAmountFloat = totalInvoiceAmount.subtract(totalInvoiceReceiptAmount).floatValue();
		} else if (totalInvoiceAmount != null) {
			overDueAmountFloat = totalInvoiceAmount.floatValue();
		}
		return overDueAmountFloat;
	}
	private Float getTotalEarningsWeeklyMonthly(Date startDate, Date endDate){
		TypedQuery<BigDecimal> query = getEntityManager().createNamedQuery("getPaidCustomerInvoiceEarningsWeeklyMonthly",
				BigDecimal.class);
		query.setParameter(CommonColumnConstants.START_DATE, dateUtil.get(startDate));
		query.setParameter(CommonColumnConstants.END_DATE, dateUtil.get(endDate));
		query.setMaxResults(1);
    	BigDecimal PaidCustomerInvoiceAmountMonthly = query.getSingleResult();
		Float paidCustomerInvoiceAmountFloat = (float) 0;
		if (PaidCustomerInvoiceAmountMonthly != null)
			paidCustomerInvoiceAmountFloat = PaidCustomerInvoiceAmountMonthly.floatValue();
		return paidCustomerInvoiceAmountFloat;
	}
	private Float getOverDueCustomerAmountWeeklyMonthly(Integer type, Date startDate, Date endDate) {
		TransactionCategory transactionCategory = transactionCategoryService.findByPK(84);
		BigDecimal overDueAmountMonthly = getTotalCustomerInvoiceAmountWeeklyMonthly(type, startDate,
				endDate,transactionCategory,PostingReferenceTypeEnum.INVOICE);
		Float overDueAmountFloat = (float) 0;
		transactionCategory = transactionCategoryService.findByPK(2);
		TypedQuery<BigDecimal> query = getEntityManager().createNamedQuery("totalInvoiceReceiptAmountWeeklyMonthly", BigDecimal.class);
		query.setParameter("type", type);
		query.setParameter(CommonColumnConstants.START_DATE, dateUtil.get(startDate) );
		query.setParameter(CommonColumnConstants.END_DATE, dateUtil.get(endDate));
		query.setParameter(CommonColumnConstants.REFERENCE_TYPE, PostingReferenceTypeEnum.RECEIPT);
		query.setParameter(CommonColumnConstants.TRANSACTION_CATEGORY, transactionCategoryService.findByPK(2));
		query.setMaxResults(1);
		BigDecimal totalInvoiceReceiptAmountMonthly = query.getSingleResult();
		if (totalInvoiceReceiptAmountMonthly != null && overDueAmountMonthly != null )
			overDueAmountFloat = overDueAmountMonthly.subtract(totalInvoiceReceiptAmountMonthly).floatValue();
		else if (overDueAmountMonthly != null)
			overDueAmountFloat = overDueAmountMonthly.floatValue();
		return overDueAmountFloat;

	}
	private BigDecimal getTotalCustomerInvoiceAmountWeeklyMonthly(Integer type, Date startDate, Date endDate,
														  TransactionCategory transactionCategory,PostingReferenceTypeEnum referenceTypeEnum) {
		TypedQuery<InvoiceOverDueModel> query = getEntityManager().createNamedQuery("totalCustomerInvoiceAmountWeeklyMonthly",
				InvoiceOverDueModel.class);
		query.setParameter("type", type);
		query.setParameter(CommonColumnConstants.START_DATE, dateUtil.get(startDate));
		query.setParameter(CommonColumnConstants.END_DATE, dateUtil.get(endDate));
		query.setParameter(CommonColumnConstants.REFERENCE_TYPE, referenceTypeEnum);
		//query.setParameter("transactionCategory", transactionCategory);
		query.setMaxResults(1);
		InvoiceOverDueModel invoiceOverDueModel= query.getSingleResult();
     	return type==1?invoiceOverDueModel.getDebitAmount():invoiceOverDueModel.getCreditAmount();
	}
	private BigDecimal getTotalSupplierInvoiceAmountWeeklyMonthly(Integer type, Date startDate, Date endDate,
														  TransactionCategory transactionCategory,PostingReferenceTypeEnum referenceTypeEnum) {
		TypedQuery<InvoiceOverDueModel> query = getEntityManager().createNamedQuery("totalSupplierInvoiceAmountWeeklyMonthly",
				InvoiceOverDueModel.class);
		query.setParameter("type", type);
		query.setParameter(CommonColumnConstants.START_DATE, dateUtil.get(startDate));
		query.setParameter(CommonColumnConstants.END_DATE, dateUtil.get(endDate));
		query.setParameter(CommonColumnConstants.REFERENCE_TYPE, referenceTypeEnum);
		//query.setParameter("transactionCategory", transactionCategory);
		query.setMaxResults(1);
		InvoiceOverDueModel invoiceOverDueModel= query.getSingleResult();
		return type==1?invoiceOverDueModel.getDebitAmount():invoiceOverDueModel.getCreditAmount();
	}
	private Float getOverDueSupplierAmountWeeklyMonthly(Integer type, Date startDate, Date endDate) {
		TransactionCategory transactionCategory = transactionCategoryService.findByPK(49);
		BigDecimal overDueAmountMonthly = getTotalSupplierInvoiceAmountWeeklyMonthly(type, startDate, endDate,
				transactionCategory,PostingReferenceTypeEnum.INVOICE);
		Float overDueAmountFloat = (float) 0;
		transactionCategory = transactionCategoryService.findByPK(1);
		TypedQuery<BigDecimal> query = getEntityManager().createNamedQuery("totalInvoicePaymentAmountWeeklyMonthly", BigDecimal.class);
		query.setParameter("type", type);
		query.setParameter(CommonColumnConstants.START_DATE, dateUtil.get(startDate));
		query.setParameter(CommonColumnConstants.END_DATE, dateUtil.get(endDate));
		query.setParameter(CommonColumnConstants.REFERENCE_TYPE, PostingReferenceTypeEnum.PAYMENT);
		query.setParameter(CommonColumnConstants.TRANSACTION_CATEGORY, transactionCategory);
		query.setMaxResults(1);
		BigDecimal totalInvoiceReceiptAmountMonthly = query.getSingleResult();
		if (totalInvoiceReceiptAmountMonthly != null && overDueAmountMonthly != null )
			overDueAmountFloat = overDueAmountMonthly.subtract(totalInvoiceReceiptAmountMonthly).floatValue();
		else if (overDueAmountMonthly != null)
			overDueAmountFloat = overDueAmountMonthly.floatValue();
		return overDueAmountFloat;
	}
	@Override
	public List<Invoice> getUnpaidInvoice(Integer contactId, ContactTypeEnum type) {
		TypedQuery<Invoice> query = getEntityManager().createNamedQuery("unpaidInvoices", Invoice.class);
		query.setParameter("status", Arrays.asList(
				new Integer[] { CommonStatusEnum.PARTIALLY_PAID.getValue(), CommonStatusEnum.POST.getValue() }));
		query.setParameter("id", contactId);
		query.setParameter("type", type.getValue());
		List<Invoice> invoiceList = query.getResultList();
		return invoiceList != null && !invoiceList.isEmpty() ? invoiceList : null;
	}
	@Override
	public List<Invoice> getSuggestionUnpaidInvoices(BigDecimal amount, Integer contactId, ContactTypeEnum type,
													 Integer currency, Integer userId){
		TypedQuery<Invoice> query;
		User user = userService.findByPK(userId);
		Integer companyCurrency = user.getCompany().getCurrencyCode().getCurrencyCode();

		if (!user.getRole().getRoleCode().equals(1)){

		 query = getEntityManager().createNamedQuery("suggestionUnpaidInvoices", Invoice.class);
		query.setParameter("status", Arrays.asList(new Integer[]{
				CommonStatusEnum.PARTIALLY_PAID.getValue(), CommonStatusEnum.POST.getValue()}));
		if (currency != null || !currency.equals(0)) {
			//query.setParameter("currency", currency );
			//below code updated mudassar fro #1960 & #1961
			query.setParameter("currency", Arrays.asList(new Integer[]{
					currency,  companyCurrency }));
		}
		query.setParameter("type", type.getValue());
		query.setParameter("id", contactId);
			query.setParameter("userId", userId);
	}
	else{
		   query = getEntityManager().createNamedQuery("suggestionUnpaidInvoicesAdmin", Invoice.class);
			query.setParameter("status", Arrays.asList(new Integer[]{
					CommonStatusEnum.PARTIALLY_PAID.getValue(), CommonStatusEnum.POST.getValue()}));
			if (currency != null || !currency.equals(0)) {
				//query.setParameter("currency", currency);
				//below code updated mudassar fro #1960 & #1961
				query.setParameter("currency", Arrays.asList(new Integer[]{currency, companyCurrency}));
			}
			query.setParameter("type", type.getValue());
			query.setParameter("id", contactId);
		}
		List<Invoice> invoiceList = query.getResultList();
		return invoiceList != null && !invoiceList.isEmpty() ? invoiceList : null;
	}
	@Override
	public List<Invoice> getSuggestionExplainedInvoices(BigDecimal amount, Integer contactId, ContactTypeEnum type, Integer currency,
														Integer userId) {
		TypedQuery<Invoice> query = getEntityManager().createNamedQuery("suggestionExplainedInvoices", Invoice.class);
		query.setParameter("status", Arrays.asList(new Integer[] {
				CommonStatusEnum.PARTIALLY_PAID.getValue(), CommonStatusEnum.POST.getValue() }));
		query.setParameter("currency", currency);
		query.setParameter("type", type.getValue());
		query.setParameter("id", contactId);
		query.setParameter("userId", userId);

		List<Invoice> invoiceList = query.getResultList();
		return invoiceList != null && !invoiceList.isEmpty() ? invoiceList : null;
	}
	@Override
	public Integer getTotalInvoiceCountByContactId(Integer contactId){
		Query query = getEntityManager().createQuery(
				"SELECT COUNT(i) FROM Invoice i WHERE i.contact.contactId =:contactId AND i.deleteFlag=false" );
		query.setParameter("contactId",contactId);
		List<Object> countList = query.getResultList();
		if (countList != null && !countList.isEmpty()) {
			return ((Long) countList.get(0)).intValue();
		}
		return null;
	}
	@Override
	public Integer getReceiptCountByCustInvoiceId(Integer invoiceId){
		Query query = getEntityManager().createQuery(
				"SELECT COUNT(c) FROM CustomerInvoiceReceipt c WHERE c.customerInvoice.id =:invoiceId AND c.deleteFlag=false" );
		query.setParameter("invoiceId",invoiceId);
		List<Object> countList = query.getResultList();
		if (countList != null && !countList.isEmpty()) {
			return ((Long) countList.get(0)).intValue();
		}
		return null;
	}
	@Override
	public Integer getReceiptCountBySupInvoiceId(Integer invoiceId){
		Query query = getEntityManager().createQuery(
				"SELECT COUNT(s) FROM SupplierInvoicePayment s WHERE s.supplierInvoice.id =:invoiceId AND s.deleteFlag=false" );
		query.setParameter("invoiceId",invoiceId);
		List<Object> countList = query.getResultList();
		if (countList != null && !countList.isEmpty()) {
			return ((Long) countList.get(0)).intValue();
		}
		return null;
	}
	@Override
	public void sumOfTotalAmountWithoutVat(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel){
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
		LocalDate startDate = LocalDate.parse(reportRequestModel.getStartDate(),formatter);
		LocalDate endDate = LocalDate.parse(reportRequestModel.getEndDate(),formatter);
		Boolean editFlag = Boolean.TRUE;
		VatReportFiling vatReportFiling = vatReportFilingRepository.getVatReportFilingByStartDateAndEndDate(startDate,endDate);
		if (vatReportFiling!=null){
			if (vatReportFiling.getStatus().equals(CommonStatusEnum.UN_FILED.getValue())){
				editFlag = Boolean.TRUE;
			}
			else {
				editFlag = Boolean.FALSE;
			}
		}
		TypedQuery<BigDecimal> query =getEntityManager().createQuery( "SELECT SUM(il.subTotal*i.exchangeRate) AS TOTAL_AMOUNT " +
				" FROM Invoice i,InvoiceLineItem  il WHERE i.status not in(2) AND i.type=2 and i.id = il.invoice.id and il.vatCategory.id in (2) AND i.editFlag=:editFlag AND i.invoiceDate between :startDate and :endDate",BigDecimal.class);
		query.setParameter(CommonColumnConstants.START_DATE,startDate);
		query.setParameter(CommonColumnConstants.END_DATE,endDate);
		query.setParameter("editFlag",editFlag);
		BigDecimal amountWithoutVat = query.getSingleResult();
		vatReportResponseModel.setZeroRatedSupplies(amountWithoutVat);
	}
	@Override
	public void getSumOfTotalAmountWithVat(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel){
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
		LocalDate startDate = LocalDate.parse(reportRequestModel.getStartDate(),formatter);
		LocalDate endDate = LocalDate.parse(reportRequestModel.getEndDate(),formatter);
		Boolean editFlag = Boolean.TRUE;
		VatReportFiling vatReportFiling = vatReportFilingRepository.getVatReportFilingByStartDateAndEndDate(startDate,endDate);
		if (vatReportFiling!=null){
			if (vatReportFiling.getStatus().equals(CommonStatusEnum.UN_FILED.getValue())){
				editFlag = Boolean.TRUE;
			}
			else {
				editFlag = Boolean.FALSE;
			}
		}
		String queryStr = "SELECT SUM(il.subTotal*i.exchangeRate) AS TOTAL_AMOUNT, SUM(il.vatAmount*i.exchangeRate) AS TOTAL_VAT_AMOUNT FROM Invoice i ,InvoiceLineItem il WHERE i.id = il.invoice.id AND i.status not in(2) AND i.type=1 AND i.isReverseChargeEnabled=false AND i.deleteFlag=false AND i.editFlag=:editFlag AND il.vatCategory.id in (1) AND i.invoiceDate between :startDate And :endDate AND i.totalVatAmount>"+BigDecimal.ZERO;
		List<Object> list = getEntityManager().createQuery(queryStr).setParameter("startDate",startDate).setParameter("endDate",endDate).setParameter("editFlag",editFlag).getResultList();
		if(list!=null&& list.size()>0) {
		List<VatReportModel> vatReportModelList = getVatModalFromDB(list);
		for(VatReportModel vatReportModel:vatReportModelList){
			vatReportResponseModel.setTotalAmountWithVatForSupplierInvoice(vatReportModel.getTotalAmountWithVatForSupplierInvoice()!=null ?vatReportModel.getTotalAmountWithVatForSupplierInvoice():BigDecimal.ZERO);
			vatReportResponseModel.setTotalVatAmountForSupplierInvoice(vatReportModel.getTotalVatAmountForSupplierInvoice()!=null?vatReportModel.getTotalVatAmountForSupplierInvoice():BigDecimal.ZERO);
		}
		}
	}
	@Override
	public void sumOfTotalAmountWithoutVatForRCM(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel){
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
		LocalDate startDate = LocalDate.parse(reportRequestModel.getStartDate(),formatter);
		LocalDate endDate = LocalDate.parse(reportRequestModel.getEndDate(),formatter);
		Boolean editFlag = Boolean.TRUE;
		VatReportFiling vatReportFiling = vatReportFilingRepository.getVatReportFilingByStartDateAndEndDate(startDate,endDate);
		if (vatReportFiling!=null){
			if (vatReportFiling.getStatus().equals(CommonStatusEnum.UN_FILED.getValue())){
				editFlag = Boolean.TRUE;
			}
			else {
				editFlag = Boolean.FALSE;
			}
		}
		TypedQuery<BigDecimal> query =getEntityManager().createQuery( "SELECT SUM(il.subTotal*i.exchangeRate) AS TOTAL_AMOUNT " +
				" FROM Invoice i,InvoiceLineItem  il WHERE i.id = il.invoice.id and il.vatCategory.id in (2) and i.status not in(2) AND i.type=1 and i.isReverseChargeEnabled=true AND i.editFlag=:editFlag AND i.invoiceDate between :startDate and :endDate AND i.totalVatAmount="+BigDecimal.ZERO,BigDecimal.class);
		query.setParameter(CommonColumnConstants.START_DATE,startDate);
		query.setParameter(CommonColumnConstants.END_DATE,endDate);
		query.setParameter("editFlag",editFlag);
		BigDecimal amountWithoutVat = query.getSingleResult();
//		vatReportResponseModel.setZeroRatedSupplies(amountWithoutVat);
	}
	@Override
	public void getSumOfTotalAmountWithVatForRCM(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel){
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
		LocalDate startDate = LocalDate.parse(reportRequestModel.getStartDate(),formatter);
		LocalDate endDate = LocalDate.parse(reportRequestModel.getEndDate(),formatter);
		Boolean editFlag = Boolean.TRUE;
		VatReportFiling vatReportFiling = vatReportFilingRepository.getVatReportFilingByStartDateAndEndDate(startDate,endDate);
		if (vatReportFiling!=null){
			if (vatReportFiling.getStatus().equals(CommonStatusEnum.UN_FILED.getValue())){
				editFlag = Boolean.TRUE;
			}
			else {
				editFlag = Boolean.FALSE;
			}
		}
		String queryStr = "SELECT SUM(i.totalAmount*i.exchangeRate) AS TOTAL_AMOUNT, SUM(i.totalVatAmount*i.exchangeRate) AS TOTAL_VAT_AMOUNT FROM Invoice i WHERE i.status not in(2) AND i.type=1 AND i.isReverseChargeEnabled=True AND i.deleteFlag=false AND i.editFlag=:editFlag AND i.invoiceDate BETWEEN :startDate AND :endDate AND i.totalVatAmount>"+BigDecimal.ZERO;
		List<Object> list = getEntityManager().createQuery(queryStr).setParameter("startDate",startDate).setParameter("endDate",endDate).setParameter("editFlag",editFlag).getResultList();
		if(list!=null&& list.size()>0) {
			List<VatReportModel> vatReportModelList = getVatModalRCMFromDB(list);
			for(VatReportModel vatReportModel:vatReportModelList){
				vatReportResponseModel.setReverseChargeProvisionsTotalAmount(vatReportModel.getReverseChargeProvisionsTotalAmount());
				vatReportResponseModel.setReverseChargeProvisionsVatAmount(vatReportModel.getReverseChargeProvisionsVatAmount());
			}
		}
		String expenseQuery = "SELECT SUM(e.expenseAmount*e.exchangeRate) AS TOTAL_AMOUNT, SUM(e.expenseVatAmount*e.exchangeRate) AS TOTAL_VAT_AMOUNT FROM Expense e WHERE e.status not in(1) AND e.isReverseChargeEnabled=True AND e.deleteFlag=false AND e.editFlag=:editFlag AND e.expenseDate BETWEEN :startDate AND :endDate AND e.vatCategory.id in (1,2)";
		List<Object> expenseList = getEntityManager().createQuery(expenseQuery).setParameter("startDate",startDate).setParameter("endDate",endDate).setParameter("editFlag",editFlag).getResultList();
		if(expenseList!=null&& expenseList.size()>0) {
			List<VatReportModel> vatReportModelList = getVatModalRCMFromDB(expenseList);
			for(VatReportModel vatReportModel:vatReportModelList){
				if (vatReportResponseModel.getReverseChargeProvisionsTotalAmount()!=null && vatReportResponseModel.getReverseChargeProvisionsVatAmount()!=null
				&& vatReportModel.getReverseChargeProvisionsTotalAmount()!=null && vatReportModel.getReverseChargeProvisionsVatAmount()!=null){
					vatReportResponseModel.setReverseChargeProvisionsTotalAmount(vatReportResponseModel.getReverseChargeProvisionsTotalAmount().add(vatReportModel.getReverseChargeProvisionsTotalAmount()));
					vatReportResponseModel.setReverseChargeProvisionsVatAmount(vatReportResponseModel.getReverseChargeProvisionsVatAmount().add(vatReportModel.getReverseChargeProvisionsVatAmount()));
				}
				else {
					vatReportResponseModel.setReverseChargeProvisionsTotalAmount(vatReportModel.getReverseChargeProvisionsTotalAmount());
					vatReportResponseModel.setReverseChargeProvisionsVatAmount(vatReportModel.getReverseChargeProvisionsVatAmount());

				}
				}
		}
	}
	private List<VatReportModel> getVatModalFromDB(List<Object> list) {
		List<VatReportModel> vatReportModelList = new ArrayList<>();
		for (Object object : list)
		{
			Object[] row = (Object[]) object;
			VatReportModel vatReportModel = new VatReportModel();
			vatReportModel.setTotalAmountWithVatForSupplierInvoice((BigDecimal) row[0]);
			vatReportModel.setTotalVatAmountForSupplierInvoice((BigDecimal) row[1]);
			vatReportModelList.add(vatReportModel);
		}
		return vatReportModelList;
	}
	private List<VatReportModel> getVatModalRCMFromDB(List<Object> list) {
		List<VatReportModel> vatReportModelList = new ArrayList<>();
		for (Object object : list)
		{
			Object[] row = (Object[]) object;
			VatReportModel vatReportModel = new VatReportModel();
			vatReportModel.setReverseChargeProvisionsTotalAmount((BigDecimal) row[0]);
			vatReportModel.setReverseChargeProvisionsVatAmount((BigDecimal) row[1]);
			vatReportModelList.add(vatReportModel);
		}
		return vatReportModelList;
	}
	public BigDecimal getTotalInputVatAmount(VatReportFilingRequestModel vatReportFilingRequestModel){
		LocalDateTime startDate = dateUtils.getDateStrAsLocalDateTime(vatReportFilingRequestModel.getStartDate(),
				CommonColumnConstants.DD_MM_YYYY);
		LocalDateTime endDate =dateUtils.getDateStrAsLocalDateTime(vatReportFilingRequestModel.getEndDate(),
				CommonColumnConstants.DD_MM_YYYY);
		TypedQuery<BigDecimal> query = getEntityManager().createNamedQuery("totalInputVatAmount",
				BigDecimal.class);
		query.setParameter(CommonColumnConstants.START_DATE,startDate);
		query.setParameter(CommonColumnConstants.END_DATE,endDate);
		BigDecimal bigDecimal=query.getSingleResult();
		return bigDecimal;
	}
	public BigDecimal getTotalOutputVatAmount(VatReportFilingRequestModel vatReportFilingRequestModel){
		LocalDateTime startDate = dateUtils.getDateStrAsLocalDateTime(vatReportFilingRequestModel.getStartDate(),
				CommonColumnConstants.DD_MM_YYYY);
		LocalDateTime endDate =dateUtils.getDateStrAsLocalDateTime(vatReportFilingRequestModel.getEndDate(),
				CommonColumnConstants.DD_MM_YYYY);
		TypedQuery<BigDecimal> query = getEntityManager().createNamedQuery("totalOutputVatAmount",
				BigDecimal.class);
		query.setParameter(CommonColumnConstants.START_DATE,startDate);
		query.setParameter(CommonColumnConstants.END_DATE,endDate);
		BigDecimal bigDecimal=query.getSingleResult();
		return bigDecimal;
	}
}