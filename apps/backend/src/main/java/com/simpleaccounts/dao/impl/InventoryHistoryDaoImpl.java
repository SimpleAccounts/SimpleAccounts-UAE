package com.simpleaccounts.dao.impl;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.InventoryHistoryDao;
import com.simpleaccounts.entity.InventoryHistory;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.rest.InventoryController.InventoryRevenueModel;
import com.simpleaccounts.rest.InventoryController.TopInventoryRevenueModel;
import com.simpleaccounts.utils.DateUtils;
import java.math.BigDecimal;
import java.util.*;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class InventoryHistoryDaoImpl extends AbstractDao<Integer, InventoryHistory> implements InventoryHistoryDao {
    private final DateUtils dateUtil;
   public InventoryHistory getHistoryByInventoryId(Integer invoiceId){
       TypedQuery<InventoryHistory> query = getEntityManager().createNamedQuery(
               "getHistoryByInventoryId", InventoryHistory.class);
       query.setParameter("inventoryId", invoiceId);
       List<InventoryHistory> result= query.getResultList();
       return query.getSingleResult();
   }
    public InventoryRevenueModel getTotalRevenueForInventory(){
        Date date = new Date();
        InventoryRevenueModel inventoryRevenueModel=new InventoryRevenueModel();

        Date startDate = DateUtils.getStartDate(DateUtils.Duration.THIS_MONTH, TimeZone.getDefault(), date);
       Date endDate = DateUtils.getEndDate(DateUtils.Duration.THIS_MONTH, TimeZone.getDefault(), date);
        inventoryRevenueModel.setTotalRevenueMonthly(getTotalRevenue(startDate, endDate));

        startDate = DateUtils.getStartDate(DateUtils.Duration.LAST_3_MONTHS, TimeZone.getDefault(), date);

        inventoryRevenueModel.setTotalRevenueQuarterly(getTotalRevenue(startDate, endDate));

        startDate = DateUtils.getStartDate(DateUtils.Duration.LAST_6_MONTHS, TimeZone.getDefault(), date);

        inventoryRevenueModel.setTotalRevenueSixMonthly(getTotalRevenue(startDate, endDate));

        startDate = DateUtils.getStartDate(DateUtils.Duration.YEARLY, TimeZone.getDefault(), date);

        inventoryRevenueModel.setTotalRevenueYearly(getTotalRevenue(startDate, endDate));

        return inventoryRevenueModel;
    }

    private BigDecimal getTotalRevenue(Date startDate, Date endDate) {
        TypedQuery<Double> query = getEntityManager().createNamedQuery("getTotalRevenue", Double.class);
        query.setParameter(CommonColumnConstants.START_DATE, dateUtil.get(startDate));
        query.setParameter(CommonColumnConstants.END_DATE, dateUtil.get(endDate));
        query.setMaxResults(1);
        Double result = query.getSingleResult();
        if (result != null)
            return BigDecimal.valueOf(result);
    return  BigDecimal.ZERO;
    }

    private BigDecimal getTotalQtySold(Date startDate, Date endDate) {
        TypedQuery<BigDecimal> query = getEntityManager().createNamedQuery("getTotalQtySold", BigDecimal.class);
        query.setParameter(CommonColumnConstants.START_DATE, dateUtil.get(startDate));
        query.setParameter(CommonColumnConstants.END_DATE, dateUtil.get(endDate));
        query.setMaxResults(1);
        return query.getSingleResult();
    }
    public InventoryRevenueModel getTotalQuantitySoldForInventory(){
        Date date = new Date();
        InventoryRevenueModel inventoryRevenueModel=new InventoryRevenueModel();

        Date startDate = DateUtils.getStartDate(DateUtils.Duration.THIS_MONTH, TimeZone.getDefault(), date);
        Date endDate = DateUtils.getEndDate(DateUtils.Duration.THIS_MONTH, TimeZone.getDefault(), date);
        inventoryRevenueModel.setTotalQtySoldMonthly(getTotalQtySold(startDate, endDate));

        startDate = DateUtils.getStartDate(DateUtils.Duration.LAST_3_MONTHS, TimeZone.getDefault(), date);

        inventoryRevenueModel.setTotalQtySoldQuarterly(getTotalQtySold(startDate, endDate));

        startDate = DateUtils.getStartDate(DateUtils.Duration.LAST_6_MONTHS, TimeZone.getDefault(), date);

        inventoryRevenueModel.setTotalQtySoldSixMonthly(getTotalQtySold(startDate, endDate));

        startDate = DateUtils.getStartDate(DateUtils.Duration.YEARLY, TimeZone.getDefault(), date);

        inventoryRevenueModel.setTotalQtySoldYearly(getTotalQtySold(startDate, endDate));

        return inventoryRevenueModel;
    }
    public TopInventoryRevenueModel getTopSellingProductsForInventory(){
        Date date = new Date();
       TopInventoryRevenueModel topInventoryRevenueModel =  new TopInventoryRevenueModel();

        Date startDate = DateUtils.getStartDate(DateUtils.Duration.THIS_MONTH, TimeZone.getDefault(), date);
        Date endDate = DateUtils.getEndDate(DateUtils.Duration.THIS_MONTH, TimeZone.getDefault(), date);
        topInventoryRevenueModel.setTopSellingProductsMonthly(getTopSellingProducts(startDate, endDate,topInventoryRevenueModel.getTopSellingProductsMonthly()));

        startDate = DateUtils.getStartDate(DateUtils.Duration.LAST_3_MONTHS, TimeZone.getDefault(), date);

        topInventoryRevenueModel.setTopSellingProductsQuarterly(getTopSellingProducts(startDate, endDate,topInventoryRevenueModel.getTopSellingProductsQuarterly()));

        startDate = DateUtils.getStartDate(DateUtils.Duration.LAST_6_MONTHS, TimeZone.getDefault(), date);

        topInventoryRevenueModel.setTopSellingProductsSixMonthly(getTopSellingProducts(startDate, endDate,topInventoryRevenueModel.getTopSellingProductsSixMonthly()));

        startDate = DateUtils.getStartDate(DateUtils.Duration.YEARLY, TimeZone.getDefault(), date);

       topInventoryRevenueModel.setTopSellingProductsYearly(getTopSellingProducts(startDate, endDate,topInventoryRevenueModel.getTopSellingProductsYearly()));

        return topInventoryRevenueModel;
    }
    private Map<String,BigDecimal> getTopSellingProducts(Date startDate, Date endDate,Map<String,BigDecimal> resultMap) {
        Query query = getEntityManager().createQuery("SELECT SUM(inh.quantity) as qty, inh.productId.productName as prodcutname FROM InventoryHistory inh where inh.invoice.type=2 AND inh.createdDate BETWEEN :startDate and :endDate GROUP BY inh.productId, inh.productId.productName order by qty desc ");
        query.setParameter(CommonColumnConstants.START_DATE, dateUtil.get(startDate));
        query.setParameter(CommonColumnConstants.END_DATE, dateUtil.get(endDate));
        query.setMaxResults(5);
        List resultList =  query.getResultList();
        if (resultList!=null  && !resultList.isEmpty()){
            for (Object object:resultList){
                Object[] row = (Object[]) object;
                String productName= (String) row[1];
                BigDecimal quantity= BigDecimal.valueOf((double) row[0]);
                resultMap.put(productName,quantity);
            }
        }

        return resultMap;
    }
    public TopInventoryRevenueModel getTopProfitGeneratingProductsForInventory(){
        Date date = new Date();
        TopInventoryRevenueModel topInventoryRevenueModel =  new TopInventoryRevenueModel();

        Date startDate = DateUtils.getStartDate(DateUtils.Duration.THIS_MONTH, TimeZone.getDefault(), date);
        Date endDate = DateUtils.getEndDate(DateUtils.Duration.THIS_MONTH, TimeZone.getDefault(), date);
        topInventoryRevenueModel.setTotalProfitMonthly(getProfit(startDate, endDate,topInventoryRevenueModel.getTotalProfitMonthly()));

        startDate = DateUtils.getStartDate(DateUtils.Duration.LAST_3_MONTHS, TimeZone.getDefault(), date);

        topInventoryRevenueModel.setTotalProfitQuarterly(getProfit(startDate, endDate,topInventoryRevenueModel.getTotalProfitQuarterly()));

        startDate = DateUtils.getStartDate(DateUtils.Duration.LAST_6_MONTHS, TimeZone.getDefault(), date);

        topInventoryRevenueModel.setTotalProfitSixMonthly(getProfit(startDate, endDate,topInventoryRevenueModel.getTotalProfitSixMonthly()));

        startDate = DateUtils.getStartDate(DateUtils.Duration.YEARLY, TimeZone.getDefault(), date);

        topInventoryRevenueModel.setTotalProfitYearly(getProfit(startDate, endDate,topInventoryRevenueModel.getTotalProfitYearly()));

        return topInventoryRevenueModel;
    }
    private Map<String,BigDecimal> getProfit(Date startDate, Date endDate,Map<String,BigDecimal> resultMap) {
        Query query = getEntityManager().createQuery("SELECT SUM(inh.quantity)*AVG(inh.unitSellingPrice)  - SUM(inh.quantity)*AVG(inh.unitCost) AS profit , inh.productId.productName as prodcutname FROM InventoryHistory inh where inh.invoice.type=2 AND inh.createdDate BETWEEN :startDate and :endDate GROUP BY inh.productId, inh.productId.productName order by profit desc ");
        query.setParameter(CommonColumnConstants.START_DATE, dateUtil.get(startDate));
        query.setParameter(CommonColumnConstants.END_DATE, dateUtil.get(endDate));
        query.setMaxResults(10);
        List resultList = query.getResultList();
        if (resultList != null && !resultList.isEmpty()) {
            for (Object object : resultList) {
                Object[] row = (Object[]) object;
                String productName = (String) row[1];
                BigDecimal quantity = BigDecimal.valueOf((double) row[0]);
                resultMap.put(productName, quantity);
            }

        }
        return resultMap;
    }
    public TopInventoryRevenueModel getLowSellingProductsForInventory() {
        Date date = new Date();
        TopInventoryRevenueModel topInventoryRevenueModel =  new TopInventoryRevenueModel();

        Date startDate = DateUtils.getStartDate(DateUtils.Duration.THIS_MONTH, TimeZone.getDefault(), date);
        Date endDate = DateUtils.getEndDate(DateUtils.Duration.THIS_MONTH, TimeZone.getDefault(), date);
        topInventoryRevenueModel.setLowSellingProductsMonthly(getLowSellingProducts(startDate, endDate,topInventoryRevenueModel.getLowSellingProductsMonthly()));

        startDate = DateUtils.getStartDate(DateUtils.Duration.LAST_3_MONTHS, TimeZone.getDefault(), date);

        topInventoryRevenueModel.setLowSellingProductsQuarterly(getLowSellingProducts(startDate, endDate,topInventoryRevenueModel.getLowSellingProductsQuarterly()));

        startDate = DateUtils.getStartDate(DateUtils.Duration.LAST_6_MONTHS, TimeZone.getDefault(), date);

        topInventoryRevenueModel.setLowSellingProductsSixMonthly(getLowSellingProducts(startDate, endDate,topInventoryRevenueModel.getLowSellingProductsSixMonthly()));

        startDate = DateUtils.getStartDate(DateUtils.Duration.YEARLY, TimeZone.getDefault(), date);

        topInventoryRevenueModel.setLowSellingProductsYearly(getLowSellingProducts(startDate, endDate,topInventoryRevenueModel.getLowSellingProductsYearly()));

        return topInventoryRevenueModel;
    }
    private Map<String,BigDecimal> getLowSellingProducts(Date startDate, Date endDate,Map<String,BigDecimal> resultMap) {
       Query query = getEntityManager().createQuery("SELECT SUM(inh.quantity) as qty, inh.productId.productName as prodcutname FROM InventoryHistory inh where inh.invoice.type=2 AND inh.createdDate BETWEEN :startDate and :endDate GROUP BY inh.productId, inh.productId.productName order by qty asc ");
        query.setParameter(CommonColumnConstants.START_DATE, dateUtil.get(startDate));
        query.setParameter(CommonColumnConstants.END_DATE, dateUtil.get(endDate));
        query.setMaxResults(5);
        List resultList =  query.getResultList();
        if (resultList!=null  && !resultList.isEmpty()){
            for (Object object:resultList){
                Object[] row = (Object[]) object;
                String productName= (String) row[1];
                BigDecimal quantity= BigDecimal.valueOf((double) row[0]);
                resultMap.put(productName,quantity);
            }
        }
        return resultMap;
    }
   public List<InventoryHistory> getHistory(Integer productId, Integer supplierId){
       Query query= getEntityManager().createQuery("SELECT ih FROM InventoryHistory ih WHERE ih.productId.productID=:productId AND ih.supplierId.contactId=:supplierId ORDER BY ih.createdDate");
       query.setParameter("productId",productId);
       query.setParameter("supplierId",supplierId);
      return query.getResultList();
   }
}
