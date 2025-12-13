package com.simpleaccounts.rest.InventoryController;

import com.simpleaccounts.aop.LogRequest;
import lombok.RequiredArgsConstructor;
import static com.simpleaccounts.constant.ErrorConstant.ERROR;
import com.simpleaccounts.constant.dbfilter.InventoryFilterEnum;
import com.simpleaccounts.entity.Inventory;
import com.simpleaccounts.entity.InventoryHistory;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.productcontroller.*;
import com.simpleaccounts.rest.transactioncategorycontroller.TranscationCategoryHelper;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.InventoryHistoryService;
import com.simpleaccounts.service.InventoryService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import io.swagger.annotations.ApiOperation;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.util.*;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.util.*;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

@RestController
@RequestMapping(value = "/rest/inventory")
@RequiredArgsConstructor
public class InventoryController {
    private final Logger logger = LoggerFactory.getLogger(ProductRestController.class);
    private final TransactionCategoryService transactionCategoryService;
    private final InventoryService inventoryService;

    private final ProductRestHelper productRestHelper;

    private final TranscationCategoryHelper transcationCategoryHelper;

    private final JwtTokenUtil jwtTokenUtil;

    private final UserService userService;

    private final InventoryHistoryService inventoryHistoryService;

    
    @LogRequest
    @ApiOperation(value = "Get Inventory Product List")
    @GetMapping(value = "/getInventoryProductList")
    public ResponseEntity<PaginationResponseModel> getInventoryProductList(InventoryRequestFilterModel filterModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
            Map<InventoryFilterEnum, Object> filterDataMap = new EnumMap<>(InventoryFilterEnum.class);
            filterDataMap.put(InventoryFilterEnum.PURCHASE_ORDER, filterModel.getQuantityOrdered());
            filterDataMap.put(InventoryFilterEnum.STOCK_IN_HAND, filterModel.getStockInHand());
            filterDataMap.put(InventoryFilterEnum.QUANTITY_SOLD, filterModel.getQuantityOut());
            filterDataMap.put(InventoryFilterEnum.REORDER_LEVEL, filterModel.getReOrderLevel());
            PaginationResponseModel response = inventoryService.getInventoryList(filterDataMap, filterModel);
            List<InventoryListModel> inventoryListModel = new ArrayList<>();
            if (response == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            } else {
                if (response.getData() != null) {
                    for (Inventory inventory : (List<Inventory>) response.getData()) {
                        InventoryListModel model = productRestHelper.getInventoryListModel(inventory);
                        inventoryListModel.add(model);
                    }
                    response.setData(inventoryListModel);
                }
            }
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    
    @LogRequest
    @ApiOperation(value = "Get Product By ID")
    @GetMapping(value = "/getInventoryByProductId")
    public ResponseEntity<List<InventoryListModel>> getProductById(@RequestParam(value = "id") Integer id) {
        try {
           List<Inventory> inventoryProductList = inventoryService.getInventoryByProductId(id);
			List<InventoryListModel> inventoryProductListModel = new ArrayList<>();
			if (inventoryProductList!=null && inventoryProductList.size()!=0) {
                for (Inventory inventory : inventoryProductList) {
                    InventoryListModel inventoryListModel = new InventoryListModel();
                    if (inventory.getInventoryID()!=null){
                        inventoryListModel.setInventoryId(inventory.getInventoryID());
                    }
                    if (inventory.getProductId()!=null){
                        inventoryListModel.setProductId(inventory.getProductId().getProductID());
                        inventoryListModel.setProductCode(inventory.getProductId().getProductCode());
                        inventoryListModel.setProductName(inventory.getProductId().getProductName());
                    }
                   if (inventory.getSupplierId()!=null){
                       inventoryListModel.setSupplierId(inventory.getSupplierId().getContactId());
                       inventoryListModel.setSupplierName(inventory.getSupplierId().getFirstName() + " " + inventory.getSupplierId().getLastName());
                   }
                   if (inventory.getStockOnHand()!=null){
                       inventoryListModel.setStockInHand(inventory.getStockOnHand());
                   }
                   if(inventory.getQuantitySold()!=null){
                       inventoryListModel.setQuantitySold(inventory.getQuantitySold());
                   }
                    if (inventory.getPurchaseQuantity()!=null){
                        inventoryListModel.setPurchaseOrder(inventory.getPurchaseQuantity());
                    }
                    if (inventory.getReorderLevel()!=null){
                        inventoryListModel.setReOrderLevel(inventory.getReorderLevel());
                    }
                    inventoryProductListModel.add(inventoryListModel);
                }
            }
            return new ResponseEntity<>(inventoryProductListModel, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @LogRequest
    @ApiOperation(value = "Get Product By ID")
    @GetMapping(value = "/getInventoryById")
    public ResponseEntity<ProductRequestModel> getInventoryById(@RequestParam(value = "id") Integer id) {
        try {
            Inventory inventoryProduct = inventoryService.findByPK(id);
			if (inventoryProduct == null) {
				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
			}
            return new ResponseEntity<>(productRestHelper.getInventory(inventoryProduct), HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update Inventory")
    @PostMapping(value = "/update")
	public ResponseEntity<Object> update(@RequestBody ProductRequestModel productRequestModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            productRequestModel.setCreatedBy(userId);
            productRestHelper.updateInventoryEntity(productRequestModel,userId);

            SimpleAccountsMessage message = null;
            message = new SimpleAccountsMessage("0083",
                    MessageUtil.getMessage("inventory.updated.successful.msg.0083"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        } catch (Exception e) {
            SimpleAccountsMessage message = null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage("Updated.unsuccessful.msg"), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @LogRequest
    @ApiOperation(value = "Get Product Count For Inventory")
    @GetMapping(value = "/getProductCountForInventory")
    public ResponseEntity<Integer> getProductCountForInventory(){
        Integer response = inventoryService.getProductCountForInventory();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @LogRequest
    @ApiOperation(value = "Get Total Stock On Hand ")
    @GetMapping(value = "/getTotalStockOnHand")
    public ResponseEntity<Integer> getTotalStockOnHand(){
        Integer response = inventoryService.totalStockOnHand();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @LogRequest
    @ApiOperation(value = "Get Low Stock Product Count For Inventory")
    @GetMapping(value = "/getlowStockProductCountForInventory")
    public ResponseEntity<Integer> getlowStockProductCountForInventory(){
        Integer response = inventoryService.getlowStockProductCountForInventory();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Get Low Stock Product List For Inventory")
    @GetMapping(value = "/getlowStockProductListForInventory")
    public ResponseEntity<List<InventoryListModel>> getlowStockProductListForInventory(){
        List<Product> response = inventoryService.getlowStockProductListForInventory();
        List<InventoryListModel> inventoryListModel = new ArrayList<>();
        if (response == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            if (response != null) {

                for (Product inventory : response) {
                    InventoryListModel inventoryListModel1=new InventoryListModel();
                    inventoryListModel1.setProductName(inventory.getProductName());
                    inventoryListModel1.setProductCode(inventory.getProductCode());
                    inventoryListModel.add(inventoryListModel1);
                }
            }
        }
        return new ResponseEntity<>(inventoryListModel, HttpStatus.OK);
    }
    
    @LogRequest
    @ApiOperation(value = "Get Top Selling Product List For Inventory")
    @GetMapping(value = "/getTopSellingProductListForInventory")
    public ResponseEntity<List<InventoryListModel>> getTopSellingProductListForInventory(){
        List<InventoryListModel> response = inventoryService.getTopSellingProductListForInventory();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @LogRequest
    @ApiOperation(value = "Get Out Of Stock Product From Inventory ")
    @GetMapping(value = "/getOutOfStockCountOfInventory")
    public ResponseEntity<Integer> getOutOfStockCountOfInventory(){
        Integer response = inventoryService.getOutOfStockCountOfInventory();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @LogRequest
    @ApiOperation(value = "Get Total Inventory Value ")
    @GetMapping(value = "/getTotalInventoryValue")
    public ResponseEntity<BigDecimal> getTotalInventoryValue(){
        BigDecimal response = inventoryService.getTotalInventoryValue();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Get Total Revenue Of Inventory ")
    @GetMapping(value = "/getTotalRevenueOfInventory")
    public ResponseEntity<InventoryRevenueModel> getTotalRevenueForInventory(){
        InventoryRevenueModel response= inventoryHistoryService.getTotalRevenueForInventory();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @LogRequest
    @ApiOperation(value = "Get Total Quantity Sold For Inventory ")
    @GetMapping(value = "/getTotalQuantitySoldForInventory")
    public ResponseEntity<InventoryRevenueModel> getTotalQuantitySoldForInventory(){
        InventoryRevenueModel response= inventoryHistoryService.getTotalQuantitySoldForInventory();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @LogRequest
    @ApiOperation(value = "Get Top Selling Products For Inventory ")
    @GetMapping(value = "/getTopSellingProductsForInventory")
    public ResponseEntity<TopInventoryRevenueModel> getTopSellingProductsForInventory(){
        TopInventoryRevenueModel response= inventoryHistoryService.getTopSellingProductsForInventory();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @LogRequest
    @ApiOperation(value = "Get Top Profit Generating Products For Inventory ")
    @GetMapping(value = "/getTopProfitGeneratingProductsForInventory")
    public ResponseEntity<TopInventoryRevenueModel> getTopProfitGeneratingProductsForInventory(){
        TopInventoryRevenueModel response= inventoryHistoryService.getTopProfitGeneratingProductsForInventory();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @LogRequest
    @ApiOperation(value = "Get Low Selling Products For Inventory ")
    @GetMapping(value = "/getLowSellingProductsForInventory")
    public ResponseEntity<TopInventoryRevenueModel> getLowSellingProductsForInventory(){
        TopInventoryRevenueModel response= inventoryHistoryService.getLowSellingProductsForInventory();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @LogRequest
    @ApiOperation("Get Inventory History By ProductId And SupplierId")
    @GetMapping(value = "/getInventoryHistoryByProductIdAndSupplierId")
    public ResponseEntity<List<InventoryHistoryResponseModel>> getInventoryHistoryByProductIdAndSupplierId(Integer productId,Integer supplierId){
        List<InventoryHistory> resultList=inventoryHistoryService.getHistory(productId,supplierId);
        List<InventoryHistoryResponseModel> inventoryHistoryModelList =new  ArrayList<>();
        for (InventoryHistory result:resultList){
            InventoryHistoryResponseModel inventoryHistoryModel=new InventoryHistoryResponseModel();
//            inventoryHistoryModel.setDate(result.getTransactionDate());
            if (result.getTransactionDate()!= null) {
                ZoneId timeZone = ZoneId.systemDefault();
                Date date = Date.from(result.getTransactionDate().atStartOfDay(timeZone).toInstant());
                inventoryHistoryModel.setDate(date);
            }
            if (result.getInventory()!=null && result.getInvoice()!=null){
                inventoryHistoryModel.setQuantitySold(result.getQuantity().floatValue());
            }
            else {
                inventoryHistoryModel.setQuantitySold(0F);
            }
            inventoryHistoryModel.setStockOnHand(result.getInventory().getStockOnHand().floatValue());
            if (result.getProductId()!=null){
                inventoryHistoryModel.setProductId(result.getProductId().getProductID());
                inventoryHistoryModel.setProductCode(result.getProductId().getProductCode());
                inventoryHistoryModel.setProductname(result.getProductId().getProductName());
            }
            //Changed as per ticket no Bug 2531: Inventory > Inventory Summary > Organization Name Is Not Showing
            if (result.getSupplierId()!=null){
                inventoryHistoryModel.setSupplierId(result.getSupplierId().getContactId());
                if(result.getSupplierId().getOrganization() != null && !result.getSupplierId().getOrganization().isEmpty()){
                    inventoryHistoryModel.setSupplierName(result.getSupplierId().getOrganization());
                }else {
                    inventoryHistoryModel.setSupplierName(result.getSupplierId().getFirstName()+" "+result.getSupplierId().getLastName());
                }
            }
            if (result.getInvoice()!=null && result.getInvoice().getType()==2){
                inventoryHistoryModel.setCustomerId(result.getInvoice().getContact().getContactId());
                inventoryHistoryModel.setSupplierName(result.getInvoice().getContact().getFirstName());
                inventoryHistoryModel.setUnitSellingPrice(result.getUnitSellingPrice());
                inventoryHistoryModel.setTransactionType("Sales");
            }
            else {
                inventoryHistoryModel.setTransactionType("Purchase");
            }
            if (result.getQuantity()!=null){
                inventoryHistoryModel.setQuantity(result.getQuantity());
            }
            if (result.getUnitCost()!=null){
                inventoryHistoryModel.setUnitCost(result.getUnitCost());
            }
            if (result.getInvoice()!=null){
                inventoryHistoryModel.setInvoiceNumber(result.getInvoice().getReferenceNumber());
            }
            else{
                inventoryHistoryModel.setInvoiceNumber("Opening Stock");
            }
            if (result.getUnitSellingPrice()==null){
                inventoryHistoryModel.setUnitSellingPrice(BigDecimal.ZERO.floatValue());
            }
            else {
                inventoryHistoryModel.setUnitSellingPrice(result.getUnitSellingPrice());
            }
            inventoryHistoryModelList.add(inventoryHistoryModel);
        }
        return new ResponseEntity<>(inventoryHistoryModelList, HttpStatus.OK);
    }

}
