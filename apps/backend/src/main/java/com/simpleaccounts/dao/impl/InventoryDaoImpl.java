package com.simpleaccounts.dao.impl;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.InventoryFilterEnum;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.InventoryDao;
import com.simpleaccounts.entity.Inventory;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.productcontroller.InventoryListModel;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

/**
 * Created By Zain Khan On 24-02-2021
 */

@Repository
@RequiredArgsConstructor
public class InventoryDaoImpl extends AbstractDao<Integer, Inventory> implements InventoryDao {

    private final DatatableSortingFilterConstant dataTableUtil;

    @Override
    public PaginationResponseModel getInventoryList(Map<InventoryFilterEnum, Object> filterMap,
                                                    PaginationModel paginationModel) {
        List<DbFilter> dbFilters = new ArrayList<>();
        filterMap.forEach(
                (productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
                        .condition(productFilter.getCondition()).value(value).build()));
        if (paginationModel != null)
            paginationModel.setSortingCol(
                    dataTableUtil.getColName(paginationModel.getSortingCol(), DatatableSortingFilterConstant.INVENTORY));
        return new PaginationResponseModel(this.getResultCount(dbFilters),
                this.executeQuery(dbFilters, paginationModel));
    }

    /**
     * Zain Khan
     * @param productId
     * @return This method will return  product from the Inventory
     */
    @Override
    public List<Inventory> getProductByProductId(Integer productId) {
        TypedQuery<Inventory> query = getEntityManager().createNamedQuery(
                "getInventoryProductById", Inventory.class);
        query.setParameter(CommonColumnConstants.PRODUCT_ID, productId);
        List<Inventory> product = query.getResultList();
        return product;
    }
    /**
     * Zain Khan
     * @param productId
     * @return This method will return  product from the Inventory
     */
    public List<Inventory> getInventoryByProductId(Integer productId) {
        TypedQuery<Inventory> query = getEntityManager().createNamedQuery(
                "getInventoryProductById", Inventory.class);
        query.setParameter(CommonColumnConstants.PRODUCT_ID, productId);
        List<Inventory> result= query.getResultList();
        return result;
    }
    public Integer getProductCountForInventory() {
        Query query = getEntityManager().createQuery(
                "SELECT COUNT(DISTINCT productId ) FROM Inventory ");
        List<Object> countList = query.getResultList();
        if (countList != null && !countList.isEmpty()) {
            return ((Long) countList.get(0)).intValue();
        }
        return null;
    }
    /**
     * Zain Khan
     *
     * @return This method will return  totalStockOnHand from Inventory
     */
    @Override
    public Integer totalStockOnHand() {
        Query query = getEntityManager().createQuery(" SELECT  SUM(i.stockOnHand) AS StockOnHand FROM Inventory i");
        Long count = (Long) query.getSingleResult();
        if (count != null ) {
            return count.intValue();
        }
        return 0;
    }
    public Integer getlowStockProductCountForInventory() {
        Query query = getEntityManager().createQuery(" SELECT COUNT(i.productId) FROM Inventory i WHERE i.stockOnHand <=i.reorderLevel");
        List<Object> countList = query.getResultList();
        if (countList != null && !countList.isEmpty()) {
            return ((Long) countList.get(0)).intValue();
        }
        return null;
    }
    public List<Product> getlowStockProductListForInventory() {
        TypedQuery<Product> query = getEntityManager().createNamedQuery(
                "getInventoryLowProduct", Product.class);
        List<Product> product = query.getResultList();
        return product;
    }
    public List<InventoryListModel> getTopSellingProductListForInventory() {
        List<InventoryListModel> list = new ArrayList<>();
        Query query = getEntityManager().createQuery("SELECT  i.productId, SUM(i.quantitySold) AS TotalQuantity FROM Inventory i GROUP BY i.productId  ORDER BY SUM(i.quantitySold) DESC ");
        query.setFirstResult(0);
        query.setMaxResults(5);
        List<Object> product = query.getResultList();
        for (Object object : product) {
            Object[] row = (Object[]) object;
            InventoryListModel inventoryListModel = new InventoryListModel();
            Product product1 = ((Product) row[0]);
            inventoryListModel.setProductName(product1.getProductName());
            Long quantitySold = ((Long) row[1]);
            inventoryListModel.setQuantitySold(quantitySold.intValue());
            list.add(inventoryListModel);
        }
        return list;
    }
    public Inventory getInventoryByProductIdAndSupplierId(Integer productId, Integer supplierId){
        TypedQuery<Inventory> query = getEntityManager().createNamedQuery(
                "getInventoryByProductIdAndSupplierId", Inventory.class);
        query.setParameter(CommonColumnConstants.PRODUCT_ID, productId);
        query.setParameter("supplierId",supplierId);
        return query.getSingleResult();
    }
    public Integer getOutOfStockCountOfInventory(){
        Query query = getEntityManager().createQuery(" SELECT i.productId.productID FROM Inventory i GROUP BY i.productId.productID HAVING SUM(i.stockOnHand)=0");
        return query.getResultList().size();
    }
    public BigDecimal getTotalInventoryValue(){
        Query query = getEntityManager().createQuery("SELECT SUM(i.stockOnHand*i.productId.avgPurchaseCost) FROM Inventory i");
       Object querySingleResult = query.getSingleResult();
       BigDecimal result = BigDecimal.ZERO;
       result = (BigDecimal) querySingleResult;
       if(result!=null)
          return result ;
       return BigDecimal.ZERO;
    }
    public Integer getTotalInventoryCountForContact(int contactId){
        Query query = getEntityManager().createQuery(
                "SELECT COUNT(i) FROM Inventory i WHERE i.supplierId.contactId =:contactId" );
        query.setParameter("contactId",contactId);
        List<Object> countList = query.getResultList();
        if (countList != null && !countList.isEmpty()) {
            return ((Long) countList.get(0)).intValue();
        }
        return null;

    }
}
