package com.simpleaccounts.rest.productcontroller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.ProductPriceType;
import com.simpleaccounts.constant.ProductType;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.entity.UnitType;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.entity.CustomizeInvoiceTemplate;
import com.simpleaccounts.repository.ExciseTaxRepository;
import com.simpleaccounts.repository.UnitTypesRepository;
import com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller.CustomizeInvoiceTemplateService;
import com.simpleaccounts.service.*;
import com.simpleaccounts.utils.InvoiceNumberUtil;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductRestHelperTest {

    @InjectMocks
    private ProductRestHelper productRestHelper;

    @Mock private VatCategoryService vatCategoryService;
    @Mock private ProductService productService;
    @Mock private ProductCategoryService productCategoryService;
    @Mock private ProductWarehouseService productWarehouseService;
    @Mock private ProductLineItemService productLineItemService;
    @Mock private InventoryService inventoryService;
    @Mock private UnitTypesRepository unitTypesRepository;
    @Mock private JournalService journalService;
    @Mock private ContactService contactService;
    @Mock private TransactionCategoryService transactionCategoryService;
    @Mock private InventoryHistoryService inventoryHistoryService;
    @Mock private TransactionCategoryBalanceService transactionCategoryBalanceService;
    @Mock private CustomizeInvoiceTemplateService customizeInvoiceTemplateService;
    @Mock private InvoiceNumberUtil invoiceNumberUtil;
    @Mock private ExciseTaxRepository exciseTaxRepository;

    @Test
    void testGetEntity_CreateNewProduct() {
        // Arrange
        ProductRequestModel requestModel = new ProductRequestModel();
        requestModel.setProductID(null);
        requestModel.setProductName("Test Product");
        requestModel.setProductCode("PROD-001");
        requestModel.setProductType(ProductType.GOODS);
        requestModel.setProductPriceType(ProductPriceType.SALES);
        requestModel.setSalesUnitPrice(new BigDecimal("50.00"));
        requestModel.setSalesTransactionCategoryId(1);
        requestModel.setIsInventoryEnabled(false);
        requestModel.setUnitTypeId(40);

        UnitType mockUnitType = new UnitType();
        mockUnitType.setUnitTypeId(40);
        lenient().when(unitTypesRepository.findById(40)).thenReturn(Optional.of(mockUnitType));

        CustomizeInvoiceTemplate mockTemplate = new CustomizeInvoiceTemplate();
        lenient().when(customizeInvoiceTemplateService.getInvoiceTemplate(9)).thenReturn(mockTemplate);
        lenient().when(invoiceNumberUtil.fetchSuffixFromString(anyString())).thenReturn("001");

        TransactionCategory mockCategory = new TransactionCategory();
        lenient().when(transactionCategoryService.findByPK(1)).thenReturn(mockCategory);

        // Act
        Product result = productRestHelper.getEntity(requestModel);

        // Assert
        assertNotNull(result);
        assertEquals("Test Product", result.getProductName());
        assertEquals("PROD-001", result.getProductCode());
        assertEquals(ProductType.GOODS, result.getProductType());
        assertEquals(mockUnitType, result.getUnitType());
        assertEquals(1, result.getLineItemList().size());
        assertEquals(ProductPriceType.SALES, result.getLineItemList().get(0).getPriceType());
    }
}
