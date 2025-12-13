package com.simpleaccounts.rest.InvoiceScannerContoller;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.constant.*;
import com.simpleaccounts.dao.ContactDao;
import com.simpleaccounts.dao.CurrencyDao;
import com.simpleaccounts.dao.ProductDao;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.repository.ProductRepository;
import com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller.CustomizeInvoiceTemplateService;
import com.simpleaccounts.rest.invoicecontroller.InvoiceLineItemModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRequestModel;
import com.simpleaccounts.rest.productcontroller.ProductRequestModel;
import com.simpleaccounts.rest.productcontroller.ProductRestHelper;
import com.simpleaccounts.service.ProductService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JSONExpenseParser {

    private final  ProductRepository productRepository;

    private final CurrencyConversionRepository currencyConversionRepository;

    private final CurrencyDao currencyDao;
    private final ProductDao productDao;

    private final ContactDao contactDao;
    private final ProductService productService;
    private final CustomizeInvoiceTemplateService customizeInvoiceTemplateService;
    private final ProductRestHelper productRestHelper;

    private static final String AMOUNT_DUE = "AmountDue";
    private static final String VALUE = "value";
    private static final String AMOUNT = "amount";
    private static final String CURRENCY_SYMBOL = "currency_symbol";
    private static final String CURRENCY_CODE = "currency_code";
    private static final String CUSTOMER_NAME = "CustomerName";
    private static final String DUE_DATE = "DueDate";
    private static final String INVOICE_DATE = "InvoiceDate";
    private static final String INVOICE_TOTAL = "InvoiceTotal";
    private static final String LINE_ITEMS = "Items";
    private static final String LINE_ITEM_AMOUNT = "Amount";
    private static final String LINE_ITEM_DESCRIPTION = "Description";
    private static final String LINE_ITEM_QUANTITY = "Quantity";
    private static final String LINE_ITEM_TAX = "Tax";
    private static final String LINE_ITEM_UNIT_PRICE = "UnitPrice";
    private static final String LINE_ITEM_UNIT_TYPE = "Unit";
    private static final String PAYMENT_TERMS = "PaymentTerm";
    private static final String SUB_TOTAL = "SubTotal";
    private static final String TOTAL_DISCOUNT = "TotalDiscount";
    private static final String TOTAL_TAX = "TotalTax";

    public void parseInvoice(String jsonString, InvoiceRequestModel requestModel, List<InvoiceLineItemModel> invoiceLineItemModelList ){
        try{
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonObject = objectMapper.readTree(jsonString);
        if(jsonObject.get(0).has(AMOUNT_DUE)){
            if(jsonObject.get(0).get(AMOUNT_DUE).has(AMOUNT)){
                requestModel.setDueAmount(jsonObject.get(0).get(AMOUNT_DUE).get(AMOUNT).decimalValue());
            }
            if(jsonObject.get(0).get(AMOUNT_DUE).has(CURRENCY_SYMBOL)){
                requestModel.setCurrencySymbol(jsonObject.get(0).get(AMOUNT_DUE).get(CURRENCY_SYMBOL).textValue());
            }
            if(jsonObject.get(0).get(AMOUNT_DUE).has(CURRENCY_CODE)){
                requestModel.setCurrencyIsoCode(jsonObject.get(0).get(AMOUNT_DUE).get(CURRENCY_CODE).textValue());
                Map<String, Object> param = new HashMap<>();
                param.put("currencyIsoCode", jsonObject.get(0).get(AMOUNT_DUE).get(CURRENCY_CODE).textValue());
                List<Currency> currencyList = currencyDao.findByAttributes(param);
                if(currencyList != null && !currencyList.isEmpty()) {
                    requestModel.setCurrencyCode(currencyList.get(0).getCurrencyCode());
                    CurrencyConversion currencyConversion = currencyConversionRepository.findByCurrencyCode(currencyList.get(0));
                    if(currencyConversion != null){
                        requestModel.setExchangeRate(currencyConversion.getExchangeRate());
                    }
                    else{
                        requestModel.setExchangeRate(BigDecimal.valueOf(1));
                    }
                }
            }
        }
            if(jsonObject.get(0).has(CUSTOMER_NAME)){
                requestModel.setContactName(jsonObject.get(0).get(CUSTOMER_NAME).get(VALUE).textValue());
                Map<String, Object> param = new HashMap<>();
                param.put("firstName", jsonObject.get(0).get(CUSTOMER_NAME).get(VALUE).textValue());
                List<Contact> contactList = contactDao.findByAttributes(param);
                if(contactList != null &&!contactList.isEmpty()){
                    requestModel.setContactId(contactList.get(0).getContactId());
                }
                else{
                    //create contact

                }
            }
            if(jsonObject.get(0).has(DUE_DATE)){
                requestModel.setDueDate(jsonObject.get(0).get(DUE_DATE).get(VALUE).textValue());
            }
            if(jsonObject.get(0).has(INVOICE_DATE)){
                requestModel.setDate(jsonObject.get(0).get(INVOICE_DATE).get(VALUE).textValue());
            }
            if(jsonObject.get(0).has(INVOICE_TOTAL)){
                requestModel.setTotalAmount(jsonObject.get(0).get(INVOICE_DATE).get(VALUE).decimalValue());
            }
            if(jsonObject.get(0).has(LINE_ITEMS)){
                if(jsonObject.get(0).get(LINE_ITEMS).isArray()){
                    for (JsonNode jsonNode : jsonObject.get(0).get(LINE_ITEMS)) {
                        InvoiceLineItemModel invoiceLineItemModel = new InvoiceLineItemModel();
                        if(jsonNode.has(LINE_ITEM_AMOUNT)){
                            if(jsonNode.get(LINE_ITEM_AMOUNT).has(AMOUNT)){
                                invoiceLineItemModel.setSubTotal(jsonNode.get(LINE_ITEM_AMOUNT).get(AMOUNT).decimalValue());
                            }
                        }
                        if(jsonNode.has(LINE_ITEM_DESCRIPTION)){
                            if (jsonNode.get(LINE_ITEM_DESCRIPTION).has(VALUE)) {
                                invoiceLineItemModel.setProductName(jsonNode.get(LINE_ITEM_DESCRIPTION).get(VALUE).textValue());
                            }
                            if(invoiceLineItemModel.getProductName()!=null){
                                Map<String, Object> param = new HashMap<>();
                                param.put("productName", invoiceLineItemModel.getProductName());
                                List<Product> productList = productDao.findByAttributes(param);
                                if(productList!=null && !productList.isEmpty()){
                                    invoiceLineItemModel.setProductId(productList.get(0).getProductID());
                                }
                                else {
                                    //create product
                                    ProductRequestModel productRequestModel = new ProductRequestModel();
                                    productRequestModel.setIsActive(true);
                                    productRequestModel.setIsInventoryEnabled(false);
                                    productRequestModel.setProductName(jsonNode.get(LINE_ITEM_DESCRIPTION).get(VALUE).textValue());
                                    productRequestModel.setProductPriceType(ProductPriceType.PURCHASE);
                                    productRequestModel.setProductType(ProductType.GOODS);
                                    productRequestModel.setPurchaseTransactionCategoryId(49);
                                    productRequestModel.setPurchaseUnitPrice(jsonNode.get(LINE_ITEM_UNIT_PRICE).get(AMOUNT).decimalValue());
                                    productRequestModel.setSalesTransactionCategoryId(84);
                                    productRequestModel.setTransactionCategoryId(150);
                                    productRequestModel.setVatCategoryId(1);
                                    productRequestModel.setVatIncluded(false);
                                    String nxtInvoiceNo = customizeInvoiceTemplateService.getLastInvoice(9);
                                    productRequestModel.setProductCode(nxtInvoiceNo);
                                    Product product = productRestHelper.getEntity(productRequestModel);
                                    product.setCreatedDate(LocalDateTime.now());
                                    product.setDeleteFlag(Boolean.FALSE);
                                    product.setIsInventoryEnabled(productRequestModel.getIsInventoryEnabled());
                                    productService.persist(product);
                                    invoiceLineItemModel.setProductId(product.getProductID());

                                }
                            }
                        }
                        if(jsonNode.has(LINE_ITEM_QUANTITY)){
                            if(jsonNode.get(LINE_ITEM_QUANTITY).has(VALUE)){
                                invoiceLineItemModel.setQuantity(jsonNode.get(LINE_ITEM_QUANTITY).get(VALUE).intValue());
                            }
                        }
                        if(jsonNode.has(LINE_ITEM_TAX)){
                            if(jsonNode.get(LINE_ITEM_TAX).has(AMOUNT)){
                                invoiceLineItemModel.setVatAmount(jsonNode.get(LINE_ITEM_TAX).get(AMOUNT).decimalValue());

                            }
                        }
                        if(jsonNode.has(LINE_ITEM_UNIT_PRICE)){
                            if(jsonNode.get(LINE_ITEM_UNIT_PRICE).has(AMOUNT)){
                                invoiceLineItemModel.setUnitPrice(jsonNode.get(LINE_ITEM_UNIT_PRICE).get(AMOUNT).decimalValue());

                            }
                        }
                        if(jsonNode.has(LINE_ITEM_UNIT_TYPE)){
                            if(jsonNode.get(LINE_ITEM_UNIT_TYPE).has(AMOUNT)){
                                invoiceLineItemModel.setUnitType(jsonNode.get(LINE_ITEM_UNIT_TYPE).get(AMOUNT).textValue());

                            }
                        }
                        invoiceLineItemModel.setVatCategoryId("1");
                        invoiceLineItemModel.setTransactionCategoryId(49);
                        invoiceLineItemModel.setTransactionCategoryLabel("Cost Of Goods Sold");
                        invoiceLineItemModel.setDiscountType(DiscountType.FIXED);
                        invoiceLineItemModelList.add(invoiceLineItemModel);
                    }
                    }
            }

            if(jsonObject.get(0).has(SUB_TOTAL)) {
                if (jsonObject.get(0).get(SUB_TOTAL).has(AMOUNT)) {
                    requestModel.setTotalAmount(jsonObject.get(0).get(SUB_TOTAL).get(AMOUNT).decimalValue());
                }
            }
            if(jsonObject.get(0).has(TOTAL_DISCOUNT)) {
                if (jsonObject.get(0).get(TOTAL_DISCOUNT).has(AMOUNT)) {
                    requestModel.setDiscount(jsonObject.get(0).get(TOTAL_DISCOUNT).get(AMOUNT).decimalValue());
                }
            }
            if(jsonObject.get(0).has(TOTAL_TAX)) {
                if (jsonObject.get(0).get(TOTAL_TAX).has(AMOUNT)) {
                    requestModel.setTotalVatAmount(jsonObject.get(0).get(TOTAL_TAX).get(AMOUNT).decimalValue());
                }
            }
            String nxtInvoiceNo = customizeInvoiceTemplateService.getLastInvoice(1);
            requestModel.setReferenceNumber(nxtInvoiceNo);
            requestModel.setType("1");

    }
        catch (Exception e) {
        }
        }

}
