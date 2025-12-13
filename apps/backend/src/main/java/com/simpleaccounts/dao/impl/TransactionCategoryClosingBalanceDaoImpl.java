package com.simpleaccounts.dao.impl;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.TransactionCategoryBalanceFilterEnum;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.TransactionCategoryClosingBalanceDao;
import com.simpleaccounts.entity.TransactionCategoryClosingBalance;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.model.VatReportModel;
import com.simpleaccounts.model.VatReportResponseModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.rest.financialreport.FinancialReportRequestModel;
import com.simpleaccounts.utils.DateFormatUtil;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TransactionCategoryClosingBalanceDaoImpl extends AbstractDao<Integer, TransactionCategoryClosingBalance>
        implements TransactionCategoryClosingBalanceDao {
    private final DateFormatUtil dateUtil;
    private static final Logger LOGGER = LoggerFactory.getLogger(TransactionCategoryClosingBalanceDaoImpl.class);

    public List<TransactionCategoryClosingBalance> getList(ReportRequestModel reportRequestModel)
    {
        LocalDateTime fromDate = null;
        LocalDateTime toDate = null;
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(CommonColumnConstants.DD_MM_YYYY);
            LocalDate localDate = LocalDate.parse(reportRequestModel.getStartDate(), formatter);
             fromDate = localDate.atStartOfDay();

        } catch (Exception e) {
            LOGGER.error("Exception is ", e);
        }
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(CommonColumnConstants.DD_MM_YYYY);
            LocalDate localDate = LocalDate.parse(reportRequestModel.getEndDate(), formatter);
            toDate = localDate.atStartOfDay();

        } catch (Exception e) {
            LOGGER.error(ERROR, e);
        }

        String queryStr = "select cb from TransactionCategoryClosingBalance cb where cb.deleteFlag = false and cb.closingBalanceDate " +
                "BETWEEN :startDate and :endDate order by cb.closingBalanceDate DESC  ";

        TypedQuery<TransactionCategoryClosingBalance> query = getEntityManager().createQuery(queryStr, TransactionCategoryClosingBalance.class);
        if (fromDate != null) {
            query.setParameter(CommonColumnConstants.START_DATE, fromDate);
        }
        if (toDate != null) {
            query.setParameter(CommonColumnConstants.END_DATE, toDate);
        }
        List<TransactionCategoryClosingBalance> list = query.getResultList();
        return list != null && !list.isEmpty() ? list : null;
    }

    public List<TransactionCategoryClosingBalance> getListByChartOfAccountIds(ReportRequestModel reportRequestModel)
    {
        LocalDateTime fromDate = null;
        LocalDateTime toDate = null;
        String dateClause = " <= :endDate ";
        String chartOfAccountCodes = reportRequestModel.getChartOfAccountCodes();
        try {
            if(reportRequestModel.getStartDate()!=null) {
                fromDate = dateUtil.getDateStrAsLocalDateTime(reportRequestModel.getStartDate(), CommonColumnConstants.DD_MM_YYYY);
                dateClause = " BETWEEN :startDate and :endDate ";
            }
        } catch (Exception e) {
            LOGGER.error("Exception is ", e);
        }
        try {
            toDate = dateUtil.getDateStrAsLocalDateTime(reportRequestModel.getEndDate(), CommonColumnConstants.DD_MM_YYYY);
        } catch (Exception e) {
            LOGGER.error(ERROR, e);
        }

        String queryStr = "select cb from TransactionCategoryClosingBalance cb where cb.deleteFlag = false and cb.closingBalanceDate " +dateClause+
                " and cb.transactionCategory.chartOfAccount.chartOfAccountCode in :accountCodes order by cb.closingBalanceDate DESC  ";

        TypedQuery<TransactionCategoryClosingBalance> query = getEntityManager().createQuery(queryStr, TransactionCategoryClosingBalance.class);
        if (fromDate != null) {
            query.setParameter(CommonColumnConstants.START_DATE, fromDate);
        }
        if (toDate != null) {
            query.setParameter(CommonColumnConstants.END_DATE, toDate);
        }

        List<String> accountCodesList = new ArrayList<>();
        if (chartOfAccountCodes != null && !chartOfAccountCodes.isEmpty()) {
            String[] codes = chartOfAccountCodes.split(",");
            for (String code : codes) {
                accountCodesList.add(code.trim().replace("'", ""));
            }
        }
        query.setParameter("accountCodes", accountCodesList);

        List<TransactionCategoryClosingBalance> list = query.getResultList();
        return list != null && !list.isEmpty() ? list : null;
    }
    @Override
    public PaginationResponseModel getAll(Map<TransactionCategoryBalanceFilterEnum, Object> filterMap) {
        List<DbFilter> dbFilters = new ArrayList<>();
        filterMap.forEach(
                (productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
                        .condition(productFilter.getCondition()).value(value).build()));
        PaginationResponseModel response = new PaginationResponseModel();
        response.setCount(this.getResultCount(dbFilters));
        response.setData(this.executeQuery(dbFilters, null));
        return response;
    }

    public List<TransactionCategoryClosingBalance> getClosingBalanceForTimeRange(LocalDateTime closingBalanceStartDate, LocalDateTime closingBalanceEndDate,
                                                                                 TransactionCategory transactionCategory)
    {
        TypedQuery<TransactionCategoryClosingBalance> query = getEntityManager().createNamedQuery("getListByFrmToDate", TransactionCategoryClosingBalance.class);
        query.setParameter(CommonColumnConstants.START_DATE, closingBalanceStartDate);
        query.setParameter(CommonColumnConstants.END_DATE, closingBalanceEndDate);
        query.setParameter(CommonColumnConstants.TRANSACTION_CATEGORY, transactionCategory);
        List<TransactionCategoryClosingBalance> transactionCategoryClosingBalanceList = query.getResultList();
        return transactionCategoryClosingBalanceList != null && !transactionCategoryClosingBalanceList.isEmpty() ? transactionCategoryClosingBalanceList : null;
    }

    public List<TransactionCategoryClosingBalance> getClosingBalanceGreaterThanCurrentDate(LocalDateTime closingBalanceEndDate,
                                                                                 TransactionCategory transactionCategory)
    {
        TypedQuery<TransactionCategoryClosingBalance> query = getEntityManager().createNamedQuery("getListByFrmDate", TransactionCategoryClosingBalance.class);
        query.setParameter(CommonColumnConstants.END_DATE, closingBalanceEndDate);
        query.setParameter(CommonColumnConstants.TRANSACTION_CATEGORY, transactionCategory);
        List<TransactionCategoryClosingBalance> transactionCategoryClosingBalanceList = query.getResultList();
        return transactionCategoryClosingBalanceList != null && !transactionCategoryClosingBalanceList.isEmpty() ?
                transactionCategoryClosingBalanceList : new ArrayList<TransactionCategoryClosingBalance>();
    }

    public TransactionCategoryClosingBalance getClosingBalanceLessThanCurrentDate( LocalDateTime closingBalanceEndDate,
                                                                                         TransactionCategory transactionCategory)
    {
        TypedQuery<TransactionCategoryClosingBalance> query = getEntityManager().createNamedQuery("getListByForDate", TransactionCategoryClosingBalance.class);
        query.setParameter(CommonColumnConstants.END_DATE, closingBalanceEndDate);
        query.setParameter(CommonColumnConstants.TRANSACTION_CATEGORY, transactionCategory);
        List<TransactionCategoryClosingBalance> transactionCategoryClosingBalanceList = query.getResultList();
        return transactionCategoryClosingBalanceList != null && !transactionCategoryClosingBalanceList.isEmpty() ?
                transactionCategoryClosingBalanceList.get(0) : null;
    }
    public TransactionCategoryClosingBalance getLastClosingBalanceByDate(TransactionCategory category)
    {
        TypedQuery<TransactionCategoryClosingBalance> query = getEntityManager().createNamedQuery("getLastClosingBalanceByDate", TransactionCategoryClosingBalance.class);
        query.setParameter(CommonColumnConstants.TRANSACTION_CATEGORY, category);
        List<TransactionCategoryClosingBalance> transactionCategoryClosingBalanceList = query.getResultList();
        return transactionCategoryClosingBalanceList != null && !transactionCategoryClosingBalanceList.isEmpty() ?
                transactionCategoryClosingBalanceList.get(0) :null;
    }
    public TransactionCategoryClosingBalance getFirstClosingBalanceByDate(TransactionCategory category)
    {
        TypedQuery<TransactionCategoryClosingBalance> query = getEntityManager().createNamedQuery("getLastClosingBalanceByDate", TransactionCategoryClosingBalance.class);
        query.setParameter(CommonColumnConstants.TRANSACTION_CATEGORY, category);
        List<TransactionCategoryClosingBalance> transactionCategoryClosingBalanceList = query.getResultList();
        return transactionCategoryClosingBalanceList != null && !transactionCategoryClosingBalanceList.isEmpty() ?
                transactionCategoryClosingBalanceList.get(transactionCategoryClosingBalanceList.size()-1) :null;
    }

    @Override
    public List<VatReportModel> getListByplaceOfSupply(FinancialReportRequestModel reportRequestModel){
        LocalDateTime startDate = dateUtil.getDateStrAsLocalDateTime(reportRequestModel.getStartDate(), CommonColumnConstants.DD_MM_YYYY);
        LocalDateTime endDate = dateUtil.getDateStrAsLocalDateTime(reportRequestModel.getEndDate(), CommonColumnConstants.DD_MM_YYYY);
        Query query = getEntityManager().createQuery("SELECT SUM(il.subTotal*i.exchangeRate) AS TOTAL_AMOUNT,SUM(il.vatAmount*i.exchangeRate) AS TOTAL_VAT_AMOUNT, i.placeOfSupplyId.id AS PLACE_OF_SUPPLY_ID,i.placeOfSupplyId.placeOfSupply AS PLACE_OF_SUPPLY_NAME FROM Invoice i, PlaceOfSupply p,InvoiceLineItem il " +
                "WHERE i.id = il.invoice.id AND i.type= 2 AND i.placeOfSupplyId.id = p.id and il.vatCategory.id in (1) and il.vatCategory.id not in (3)  and i.totalVatAmount > 0 " +
                "AND i.status not in (2) AND i.deleteFlag=false AND i.invoiceDate between :startDate AND :endDate GROUP By i.placeOfSupplyId.id,i.placeOfSupplyId.placeOfSupply");
                query.setParameter("startDate",startDate.toLocalDate());
        query.setParameter("endDate",endDate.toLocalDate());
        List<Object> list = query.getResultList();
        if(list!=null&& !list.isEmpty()) {
            return getVatModalFromDB(list);
        } else {
            return new ArrayList<>();
        }
    }

    @Override
    public  void sumOfTotalAmountExce(FinancialReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel){
        LocalDateTime startDate = dateUtil.getDateStrAsLocalDateTime(reportRequestModel.getStartDate(), CommonColumnConstants.DD_MM_YYYY);
        LocalDateTime endDate = dateUtil.getDateStrAsLocalDateTime(reportRequestModel.getEndDate(), CommonColumnConstants.DD_MM_YYYY);
        TypedQuery<BigDecimal> query =getEntityManager().createQuery( "SELECT SUM(il.subTotal*i.exchangeRate) AS TOTAL_AMOUNT " +
                " FROM Invoice i,InvoiceLineItem  il WHERE i.status not in (2) and i.id = il.invoice.id and il.vatCategory.id in (3) and i.type=2 and i.invoiceDate between :startDate AND :endDate ",BigDecimal.class);
        query.setParameter("startDate",startDate.toLocalDate());
        query.setParameter("endDate",endDate.toLocalDate());
        BigDecimal totalExemptAmount = query.getSingleResult();
        vatReportResponseModel.setExemptSupplies(totalExemptAmount);

    }
    @Override
    public BigDecimal getTotalZeroVatAmount(){
        String queryStr = "SELECT SUM(i.totalAmount) AS TOTAL_AMOUNT FROM Invoice i, PlaceOfSupply p WHERE i.type=2 and " +
                "i.totalVatAmount = 0";
        List<Object> list = getEntityManager().createQuery(queryStr).getResultList();

        if(list!=null&& !list.isEmpty()) {
            Object[] row = (Object[]) list.get(0);
            return (BigDecimal) row[0];
        }
        else
            return BigDecimal.ZERO;
    }

    private List<VatReportModel> getVatModalFromDB(List<Object> list) {
        List<VatReportModel> vatReportModelList = new ArrayList<>();
        for (Object object : list)
        {
            Object[] row = (Object[]) object;
            VatReportModel vatReportModel = new VatReportModel();
            vatReportModel.setTotalAmount((BigDecimal) row[0]);
            vatReportModel.setTotalVatAmount((BigDecimal) row[1]);

            vatReportModel.setPlaceOfSupplyId((Integer) row[2]);
            vatReportModel.setPlaceOfSupplyName((String) row[3]);
            vatReportModelList.add(vatReportModel);
        }
        return vatReportModelList;
    }

    @Override
    public BigDecimal sumOfTotalAmountClosingBalance(FinancialReportRequestModel reportRequestModel, String lastMonth){
        TypedQuery<BigDecimal> query =getEntityManager().createQuery( "SELECT SUM(tcb.closingBalance)  " +
                " FROM TransactionCategoryClosingBalance tcb WHERE  FUNCTION('TO_CHAR', tcb.effectiveDate, 'YYYY-MM') = :lastMonth  ",BigDecimal.class);
        query.setParameter("lastMonth",lastMonth);
        return query.getSingleResult();
    }
}