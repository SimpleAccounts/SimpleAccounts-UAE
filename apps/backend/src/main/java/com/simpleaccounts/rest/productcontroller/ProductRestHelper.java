package com.simpleaccounts.rest.productcontroller;

import java.math.BigDecimal;
import java.math.MathContext;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.constant.TransactionCategoryCodeEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.repository.ExciseTaxRepository;
import com.simpleaccounts.repository.UnitTypesRepository;
import com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller.CustomizeInvoiceTemplateService;
import com.simpleaccounts.service.*;
import com.simpleaccounts.utils.InvoiceNumberUtil;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simpleaccounts.constant.ProductPriceType;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductRestHelper {

	@Autowired
	VatCategoryService vatCategoryService;

	@Autowired
	ProductService productService;

	@Autowired
	ProductCategoryService productCategoryService;

	@Autowired
	ProductWarehouseService productWarehouseService;

	private final ProductLineItemService productLineItemService;

	private final InventoryService inventoryService;

	private final UnitTypesRepository unitTypesRepository;

	private final JournalService journalService;


	private final ContactService contactService;

	private final TransactionCategoryService transactionCategoryService;

	private final InventoryHistoryService inventoryHistoryService;

	private final TransactionCategoryBalanceService transactionCategoryBalanceService;

	private final CustomizeInvoiceTemplateService customizeInvoiceTemplateService;

	private final InvoiceNumberUtil invoiceNumberUtil;

	private final ExciseTaxRepository exciseTaxRepository;
	public Product getEntity(ProductRequestModel productModel) {
		Product product = new Product();
		if (productModel.getProductID() != null) {
			product = productService.findByPK(productModel.getProductID());
		}
		if(productModel.getUnitTypeId()!=null)
		{
			Optional<UnitType> optionalUnitType = unitTypesRepository.findById(productModel.getUnitTypeId());
			product.setUnitType(optionalUnitType.orElseGet(() -> unitTypesRepository.findById(40).orElse(null)));
		} else {
			product.setUnitType(unitTypesRepository.findById(40).orElse(null));
		}
		product.setProductName(productModel.getProductName());

		if (productModel.getVatCategoryId() != null) {
			VatCategory vatCategory = vatCategoryService.findByPK(productModel.getVatCategoryId());
			product.setVatCategory(vatCategory);
		}
		product.setProductCode(productModel.getProductCode());
		//for autogenerate product code
		CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(9);
		if (productModel.getProductID() == null){
			String suffix = invoiceNumberUtil.fetchSuffixFromString(productModel.getProductCode());
			template.setSuffix(Integer.parseInt(suffix));
			String prefix = product.getProductCode().substring(0, product.getProductCode().lastIndexOf(suffix));
			template.setPrefix(prefix);
			customizeInvoiceTemplateService.persist(template);
		}

		if (productModel.getProductWarehouseId() != null) {
			ProductWarehouse productWarehouse = productWarehouseService.findByPK(productModel.getProductWarehouseId());
			product.setProductWarehouse(productWarehouse);
		}
		if (productModel.getProductCategoryId() != null) {
			ProductCategory productCategory = productCategoryService.findByPK(productModel.getProductCategoryId());
			product.setProductCategory(productCategory);
		}
		if (productModel.getExciseTaxCheck()!=null){
			product.setExciseStatus(productModel.getExciseTaxCheck());
		}
		product.setIsInventoryEnabled(productModel.getIsInventoryEnabled());
		product.setIsActive(productModel.getIsActive());
		product.setVatIncluded(productModel.getVatIncluded());
		product.setProductType(productModel.getProductType());
		product.setCreatedBy(productModel.getCreatedBy());
		product.setPriceType(productModel.getProductPriceType());
		product.setAvgPurchaseCost(productModel.getPurchaseUnitPrice());
		if(productModel.getExciseTaxId()!=null){
			ExciseTax exciseTax=exciseTaxRepository.findById(productModel.getExciseTaxId());
			product.setExciseTax(exciseTax);

			if(productModel.getExciseType()!=null){
				product.setExciseType(productModel.getExciseType());
				BigDecimal finalexciseAmount=BigDecimal.ZERO;

				//Exclusive
				if(Boolean.TRUE.equals(productModel.getExciseType())) {
					 finalexciseAmount=productModel.getSalesUnitPrice().multiply(exciseTax.getExcisePercentage().divide(BigDecimal.valueOf(100.00))) ;
				}
				else
				//Inclusive
				if(Boolean.FALSE.equals(productModel.getExciseType())){
					if(exciseTax.getId()==1) {
					finalexciseAmount=productModel.getSalesUnitPrice().divide(BigDecimal.valueOf(2.00));
					}
					else
					if(exciseTax.getId()==2)
						finalexciseAmount=productModel.getSalesUnitPrice().divide(BigDecimal.valueOf(3.00), MathContext.DECIMAL128);
				}
					product.setExciseAmount(finalexciseAmount);
			}

		}else{
			product.setExciseTax(null);
			product.setExciseType(Boolean.FALSE);
			product.setExciseAmount(BigDecimal.ZERO);
		}
		List<ProductLineItem> lineItem = new ArrayList<>();
		Map<String, Object> param = new HashMap<>();
		isSalesValuePresnt(productModel, product, lineItem, param);
		isPurchaseValuePresnt(productModel, product, lineItem, param);

		if (!lineItem.isEmpty()) {
			product.setLineItemList(lineItem);
		}
		return product;
	}

	private void isPurchaseValuePresnt(ProductRequestModel productModel, Product product, List<ProductLineItem> lineItem, Map<String, Object> param) {
		if (ProductPriceType.isPurchaseValuePresnt(productModel.getProductPriceType())) {
			ProductLineItem item = new ProductLineItem();
			if (product.getProductID() != null) {
				param.put("product", product);
				param.put("priceType", ProductPriceType.PURCHASE);
				List<ProductLineItem> itemList = productLineItemService.findByAttributes(param);
				item = itemList != null && !itemList.isEmpty() ? itemList.get(0) : new ProductLineItem();
			}
			item.setUnitPrice(productModel.getPurchaseUnitPrice());
			item.setCreatedBy(productModel.getCreatedBy());
			item.setDeleteFlag(false);
			item.setDescription(productModel.getPurchaseDescription());
			item.setTransactioncategory(
					transactionCategoryService.findByPK(productModel.getPurchaseTransactionCategoryId()));
			item.setProduct(product);
			item.setPriceType(ProductPriceType.PURCHASE);
			lineItem.add(item);
		}
	}

	private void isSalesValuePresnt(ProductRequestModel productModel, Product product, List<ProductLineItem> lineItem, Map<String, Object> param) {
		if (ProductPriceType.isSalesValuePresnt(productModel.getProductPriceType())) {
			ProductLineItem item = new ProductLineItem();
			if (product.getProductID() != null) {
				param.put("product", product);
				param.put("priceType", ProductPriceType.SALES);
				List<ProductLineItem> itemList = productLineItemService.findByAttributes(param);
				item = itemList != null && !itemList.isEmpty() ? itemList.get(0) : new ProductLineItem();
			}
			item.setUnitPrice(productModel.getSalesUnitPrice());
			product.setUnitPrice(productModel.getSalesUnitPrice());
			item.setCreatedBy(productModel.getCreatedBy());
			item.setDeleteFlag(false);
			item.setDescription(productModel.getSalesDescription());
			product.setProductDescription(productModel.getSalesDescription());
			item.setTransactioncategory(
					transactionCategoryService.findByPK(productModel.getSalesTransactionCategoryId()));
			item.setProduct(product);
			item.setPriceType(ProductPriceType.SALES);
			lineItem.add(item);
		}
	}

	public ProductRequestModel getRequestModel(Product product) {
		ProductRequestModel productModel = new ProductRequestModel();

		BeanUtils.copyProperties(product, productModel);
		if (product.getVatCategory() != null) {
			productModel.setVatCategoryId(product.getVatCategory().getId());
		}
		if(product.getUnitType()!=null) {
			productModel.setUnitTypeId(product.getUnitType().getUnitTypeId());
		}
		if(product.getExciseTax() !=null) {
			productModel.setExciseType(product.getExciseType());
			productModel.setExciseTaxId(product.getExciseTax().getId());
		}
		if (product.getExciseStatus()!=null){
			productModel.setExciseTaxCheck(product.getExciseStatus());
		}
		if (product.getProductCategory() != null) {
			productModel.setProductCategoryId(product.getProductCategory().getId());
		}
		if (product.getProductWarehouse() != null) {
			productModel.setProductWarehouseId(product.getProductWarehouse().getWarehouseId());
		}
		if(product.getIsActive() != null){
			productModel.setIsActive(product.getIsActive());
		}
		if(product.getIsInventoryEnabled() != null){
			productModel.setIsInventoryEnabled(product.getIsInventoryEnabled());
		}
		productModel.setProductType(product.getProductType());
		productModel.setVatIncluded(product.getVatIncluded());
		productModel.setProductPriceType(product.getPriceType());

		if (product.getLineItemList() != null && !product.getLineItemList().isEmpty()) {
			for (ProductLineItem lineItem : product.getLineItemList()) {
				if (lineItem.getPriceType().equals(ProductPriceType.SALES)) {
					productModel.setSalesUnitPrice(lineItem.getUnitPrice());
					productModel.setSalesDescription(lineItem.getDescription());
					productModel.setSalesTransactionCategoryId(
							lineItem.getTransactioncategory().getTransactionCategoryId());
					productModel.setSalesTransactionCategoryLabel(
							lineItem.getTransactioncategory().getChartOfAccount().getChartOfAccountName());
				} else {
					productModel.setPurchaseUnitPrice(lineItem.getUnitPrice());
					productModel.setPurchaseDescription(lineItem.getDescription());
					productModel.setPurchaseTransactionCategoryId(
							lineItem.getTransactioncategory().getTransactionCategoryId());
					productModel.setPurchaseTransactionCategoryLabel(
							lineItem.getTransactioncategory().getChartOfAccount().getChartOfAccountName());
				}
			}
		}
		return productModel;
	}
	public ProductRequestModel getInventory(Inventory inventory){
		ProductRequestModel productRequestModel = new ProductRequestModel();
		if (inventory.getInventoryID()!=null){
			productRequestModel.setInventoryId(inventory.getInventoryID());
		}
		if (inventory.getProductId()!=null){
			productRequestModel.setProductID(inventory.getProductId().getProductID());
		}
		if (inventory.getSupplierId()!=null){
			productRequestModel.setContactId(inventory.getSupplierId().getContactId());
		}
		if (inventory.getReorderLevel()!=null){
			productRequestModel.setInventoryReorderLevel(inventory.getReorderLevel());
		}
		if (inventory.getUnitCost()!=null){
			productRequestModel.setPurchaseUnitPrice(BigDecimal.valueOf(inventory.getUnitCost()));
		}
		if (inventory.getPurchaseQuantity()!=null){
			productRequestModel.setInventoryQty(inventory.getPurchaseQuantity());
		}
		if (inventory.getUnitCost()!=null){
			productRequestModel.setInventoryPurchasePrice(inventory.getUnitCost());
		}
		productRequestModel.setTransactionCategoryName("InventoryAsset");
		productRequestModel.setTransactionCategoryId(150);
		return productRequestModel;
	}

	public ProductListModel getListModel(Product product) {
		ProductListModel productModel = new ProductListModel();
		productModel.setId(product.getProductID());
		productModel.setName(product.getProductName());
		if (product.getVatCategory() != null) {
			productModel.setVatCategoryId(product.getVatCategory().getId());
			productModel.setVatPercentage(product.getVatCategory().getName());
		}
		if (product.getProductCategory() != null) {
			productModel.setProductCategoryId(product.getProductCategory().getId());
		}
		if (product.getProductWarehouse() != null) {
			productModel.setProductWarehouseId(product.getProductWarehouse().getWarehouseId());
		}
		for (ProductLineItem lineItem : product.getLineItemList()) {
			if (!lineItem.getPriceType().equals(ProductPriceType.PURCHASE)) {
				productModel.setDescription(product.getDescription());
				productModel.setUnitPrice(product.getUnitPrice());
			}
		}
		productModel.setProductType(String.valueOf(product.getProductType()));
		productModel.setIsInventoryEnabled(product.getIsInventoryEnabled());
		productModel.setIsActive(product.getIsActive());
		productModel.setProductCode(product.getProductCode());
		productModel.setVatIncluded(product.getVatIncluded());
		if(product.getExciseTax() !=null) {
			productModel.setExciseTax(product.getExciseTax().getName());
			productModel.setExciseTaxId(product.getExciseTax().getId());
		}
		return productModel;
	}
	public InventoryListModel getInventoryListModel(Inventory inventory){
		InventoryListModel inventoryListModel = new InventoryListModel();
		if (inventory.getInventoryID()!=null){
			inventoryListModel.setInventoryId(inventory.getInventoryID());
		}
		if (inventory.getPurchaseQuantity()!=null) {
			inventoryListModel.setPurchaseOrder(inventory.getPurchaseQuantity());
		}
		//Changed as per ticket no Bug 2531: Inventory > Inventory Summary > Organization Name Is Not Showing
		if (inventory.getSupplierId()!=null){
			if(inventory.getSupplierId().getOrganization() != null  && !inventory.getSupplierId().getOrganization().isEmpty()){
				inventoryListModel.setSupplierName(inventory.getSupplierId().getOrganization());
			}else {
			inventoryListModel.setSupplierName(inventory.getSupplierId().getFirstName()+ " " +inventory.getSupplierId().getLastName());}
			inventoryListModel.setSupplierId(inventory.getSupplierId().getContactId());
		}
		if (inventory.getStockOnHand()!=null){
			inventoryListModel.setStockInHand(inventory.getStockOnHand());
		}
		if (inventory.getQuantitySold()!=null){
			inventoryListModel.setQuantitySold(inventory.getQuantitySold());
		}
		if (inventory.getProductId()!=null){
			inventoryListModel.setProductName(inventory.getProductId().getProductName());
		    inventoryListModel.setProductCode(inventory.getProductId().getProductCode());
		    inventoryListModel.setProductId(inventory.getProductId().getProductID());
		}

		return inventoryListModel;
	}

	public ProductPriceModel getPriceModel(Product product, ProductPriceType priceType) {
		ProductPriceModel productModel = new ProductPriceModel();
		productModel.setId(product.getProductID());
		productModel.setName(product.getProductName());
		if (product.getUnitType()!=null) {
			productModel.setUnitTypeId(product.getUnitType().getUnitTypeId());
			productModel.setUnitType(product.getUnitType().getUnitTypeCode());
		}else
		{
			productModel.setUnitTypeId(40);
			productModel.setUnitType("OTH");
		}
		if (product.getExciseTax()!=null){
			productModel.setIsExciseTaxExclusive(product.getExciseType());
			productModel.setExciseAmount(product.getExciseAmount());
			productModel.setExcisePercentage(product.getExciseTax().getExcisePercentage().toString());
			productModel.setExciseTaxId(product.getExciseTax().getId());
		}
		productModel.setDiscountType("FIXED");
		if (product.getIsInventoryEnabled()!=null && product.getIsInventoryEnabled()){
			productModel.setIsInventoryEnabled(product.getIsInventoryEnabled());
		}
		if (product.getVatCategory() != null) {
			productModel.setVatCategoryId(product.getVatCategory().getId());
			productModel.setVatPercentage(product.getVatCategory().getVatLabel());
		}
		if(product.getProductType()!=null){
			productModel.setProductType(product.getProductType().toString());
		}
			for (ProductLineItem lineItem : product.getLineItemList()) {
			if (lineItem.getPriceType().equals(priceType)) {
				productModel.setDescription(lineItem.getDescription());
				Inventory inventory = null;
			List<Inventory> inventoryProduct = inventoryService.getInventoryByProductId(product.getProductID());
				Integer stockOnHand = 0;
				for (Inventory inventoryProductForPurchase:inventoryProduct) {
					stockOnHand = stockOnHand + inventoryProductForPurchase.getStockOnHand();
					inventory = inventoryProductForPurchase;
				}

				if (inventory!=null && priceType.equals(ProductPriceType.PURCHASE)){
					productModel.setUnitPrice(BigDecimal.valueOf(inventory.getUnitCost()));
					productModel.setStockOnHand(stockOnHand);
				}
				else {
					productModel.setUnitPrice(lineItem.getUnitPrice());
					if (product.getIsInventoryEnabled()!=null && product.getIsInventoryEnabled()){
						productModel.setStockOnHand(stockOnHand);
					}
				}
				if (product.getIsInventoryEnabled()!=null && product.getIsInventoryEnabled().equals(Boolean.TRUE) &&
						lineItem.getPriceType().equals(ProductPriceType.PURCHASE)){
					productModel.setTransactionCategoryId(150);
					productModel.setTransactionCategoryLabel("stock");
				}
				else if (lineItem.getPriceType().equals(ProductPriceType.PURCHASE)){
					productModel.setTransactionCategoryId(lineItem.getTransactioncategory().getTransactionCategoryId());
					productModel.setTransactionCategoryLabel(lineItem.getTransactioncategory().getChartOfAccount().getChartOfAccountName());
				}
			}
			if(priceType.equals( ProductPriceType.SALES) && lineItem.getPriceType().equals(ProductPriceType.SALES))
			{
				productModel.setTransactionCategoryId(lineItem.getTransactioncategory().getTransactionCategoryId());
				productModel.setTransactionCategoryLabel(lineItem.getTransactioncategory().getChartOfAccount().getChartOfAccountName());
			}

		}
		return productModel;
	}

	@Transactional(rollbackFor = Exception.class)
	public void updateInventoryEntity(ProductRequestModel productRequestModel,Integer userId) {

		List<Inventory> inventoryProductList = null;
			if (productRequestModel.getProductID()!=null){
				Map<String, Object> param = new HashMap<>();
					param.put("productId", productRequestModel.getProductID());
					 inventoryProductList = inventoryService.findByAttributes(param);
					log.debug("inventoryList",inventoryProductList.size());

			}
			else if (productRequestModel.getInventoryId()!=null){
			Inventory inventory = inventoryService.findByPK(productRequestModel.getInventoryId());
				 inventoryProductList = new ArrayList<>();
				inventoryProductList.add(inventory);
			}
			if (!CollectionUtils.isEmpty(inventoryProductList)){
				for (Inventory inventory:inventoryProductList){
					if (productRequestModel.getContactId() != null) {
						// Check for supplier id From contact entity
						inventory.setSupplierId(contactService.getContactByID(productRequestModel.getContactId()).get());
					}
					if (productRequestModel.getInventoryQty() != null) {
						inventory.setPurchaseQuantity(productRequestModel.getInventoryQty());
					}
					if (productRequestModel.getInventoryQty() != null) {
						inventory.setStockOnHand(productRequestModel.getInventoryQty());
					}
					if (productRequestModel.getInventoryReorderLevel() != null) {
						inventory.setReorderLevel(productRequestModel.getInventoryReorderLevel());
					}
					if (productRequestModel.getInventoryPurchasePrice() != null) {
						inventory.setUnitCost(productRequestModel.getInventoryPurchasePrice());
					}

					if (productRequestModel.getSalesUnitPrice() != null) {
						String input1 = productRequestModel.getSalesUnitPrice().toString();
						BigDecimal a = new BigDecimal(input1);
						float sellingPrice = a.floatValue();
						inventory.setUnitSellingPrice(sellingPrice);
					}
					inventory.setCreatedBy(inventory.getCreatedBy());
					inventory.setCreatedDate(inventory.getCreatedDate());
					inventory.setLastUpdateDate(LocalDateTime.now());
					inventory.setLastUpdateBy(userId);
					inventoryService.update(inventory);

					InventoryHistory inventoryHistory = new InventoryHistory();
					//Fixed issue 1009
					inventoryHistory.setCreatedBy(userId);
					inventoryHistory.setCreatedDate(inventory.getCreatedDate());
					inventoryHistory.setTransactionDate(inventory.getCreatedDate().toLocalDate());
					inventoryHistory.setInventory(inventory);
					// Fixed issue for Work Item No: 1010
					if (inventory.getUnitSellingPrice() != null) {
						inventoryHistory.setUnitSellingPrice(inventory.getUnitSellingPrice());
					}
					if (inventory.getProductId() != null) {
						inventoryHistory.setProductId(inventory.getProductId());
					}
					if (inventory.getPurchaseQuantity() != null) {
						inventoryHistory.setQuantity(inventory.getPurchaseQuantity().floatValue());
					}
					if (inventory.getUnitCost() != null) {
						inventoryHistory.setUnitCost(inventory.getUnitCost());
					}
					if (inventory.getSupplierId() != null) {
						inventoryHistory.setSupplierId(inventory.getSupplierId());
					}
					inventoryHistoryService.persist(inventoryHistory);

					if (productRequestModel.getInventoryPurchasePrice()!=null && productRequestModel.getInventoryQty()!=null) {
						TransactionCategory category = transactionCategoryService.findByPK(productRequestModel.getTransactionCategoryId());
						boolean isDebit = false;
						BigDecimal openingBalance = BigDecimal.valueOf(productRequestModel.getInventoryPurchasePrice() * productRequestModel.getInventoryQty());
						List<JournalLineItem> journalLineItemList = new ArrayList<>();
						Journal journal = new Journal();
						JournalLineItem journalLineItem1 = new JournalLineItem();
						journalLineItem1.setTransactionCategory(category);
						if (isDebit) {
							journalLineItem1.setDebitAmount(openingBalance);
						} else {
							journalLineItem1.setCreditAmount(openingBalance);
						}
						journalLineItem1.setReferenceType(PostingReferenceTypeEnum.PURCHASE);
						journalLineItem1.setReferenceId(category.getTransactionCategoryId());
						journalLineItem1.setCreatedBy(userId);
						journalLineItem1.setJournal(journal);
						journalLineItemList.add(journalLineItem1);

						JournalLineItem journalLineItem2 = new JournalLineItem();

						if (!isDebit) {
							journalLineItem2.setDebitAmount(openingBalance);
						} else {
							journalLineItem2.setCreditAmount(openingBalance);
						}
						journalLineItem2.setReferenceType(PostingReferenceTypeEnum.PURCHASE);
						journalLineItem2.setTransactionCategory(transactionCategoryService
								.findTransactionCategoryByTransactionCategoryCode(
										TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_ASSETS.getCode()));
						journalLineItem2.setCreatedBy(userId);
						journalLineItem2.setJournal(journal);
						journalLineItemList.add(journalLineItem2);
						journal.setPostingReferenceType(PostingReferenceTypeEnum.PURCHASE);
						journal.setJournalDate(LocalDate.now());
						journal.setTransactionDate(inventory.getCreatedDate().toLocalDate());
						journal.setJournalLineItems(journalLineItemList);

						for (JournalLineItem journalLineItem : journalLineItemList) {
							transactionCategoryBalanceService.updateRunningBalance(journalLineItem);
						}
					}
				}
			}
	}

	private void updateEntity(ProductRequestModel productRequestModel, Inventory inventory) {
		if (productRequestModel.getInventoryQty() == 0) {
			inventory.setPurchaseQuantity(0);
			inventory.setStockOnHand(0);
			inventory.setQuantitySold(0);
		} else {
			inventory.setPurchaseQuantity(inventory.getPurchaseQuantity() + productRequestModel.getInventoryQty());
			inventory.setStockOnHand(inventory.getStockOnHand() + productRequestModel.getInventoryQty());
		}
	}

	@Transactional(rollbackFor = Exception.class)
	public void saveInventoryEntity(Product product, ProductRequestModel productRequestModel,Integer userId) {
		Inventory inventory = new Inventory();
		inventory.setProductId(product);
		inventory.setCreatedDate(LocalDateTime.now());
		inventory.setCreatedBy(userId);
		inventory.setLastUpdateDate(LocalDateTime.now());
		inventory.setLastUpdateBy(userId);
		if(productRequestModel.getContactId()!=null) {
			// Check for supplier id From contact entity
			Optional<Contact> contactOptional = contactService.getContactByID(productRequestModel.getContactId());
			if (contactOptional.isPresent()) {
				inventory.setSupplierId(contactOptional.get());
			}
		}
		if (productRequestModel.getInventoryQty()!=null) {
			inventory.setPurchaseQuantity(productRequestModel.getInventoryQty());
		}
		if (productRequestModel.getInventoryQty()!=null) {
			inventory.setStockOnHand(productRequestModel.getInventoryQty());
		}
		inventory.setQuantitySold(0);
		if (productRequestModel.getInventoryReorderLevel()!=null) {
			inventory.setReorderLevel(productRequestModel.getInventoryReorderLevel());
		}
		if (productRequestModel.getInventoryPurchasePrice()!=null) {
			inventory.setUnitCost(productRequestModel.getInventoryPurchasePrice());
		}
		if (productRequestModel.getSalesUnitPrice()!=null){
		String input1  = productRequestModel.getSalesUnitPrice().toString();
		BigDecimal a = new BigDecimal(input1);
		float sellingPrice = a.floatValue();


			inventory.setUnitSellingPrice(sellingPrice);
		}

		inventoryService.persist(inventory);
		TransactionCategory inventoryAssetCategory = transactionCategoryService.findByPK(productRequestModel.getTransactionCategoryId());
		boolean isDebit=true;
		if(productRequestModel.getInventoryPurchasePrice()!=null && productRequestModel.getInventoryQty()!=null) {
			BigDecimal openingBalance = BigDecimal.valueOf(productRequestModel.getInventoryPurchasePrice() * productRequestModel.getInventoryQty());
			List<JournalLineItem> journalLineItemList = new ArrayList<>();
			Journal journal = new Journal();
			JournalLineItem journalLineItem1 = new JournalLineItem();
			journalLineItem1.setTransactionCategory(inventoryAssetCategory);
			if (isDebit) {
				journalLineItem1.setDebitAmount(openingBalance);
			} else {
				journalLineItem1.setCreditAmount(openingBalance);
			}
			journalLineItem1.setReferenceType(PostingReferenceTypeEnum.PURCHASE);
			journalLineItem1.setReferenceId(inventoryAssetCategory.getTransactionCategoryId());
			journalLineItem1.setCreatedBy(userId);
			journalLineItem1.setJournal(journal);
			journalLineItemList.add(journalLineItem1);

			JournalLineItem journalLineItem2 = new JournalLineItem();

			if (!isDebit) {
				journalLineItem2.setDebitAmount(openingBalance);
			} else {
				journalLineItem2.setCreditAmount(openingBalance);
			}
			journalLineItem2.setReferenceType(PostingReferenceTypeEnum.PURCHASE);
			TransactionCategory category = transactionCategoryService
					.findTransactionCategoryByTransactionCategoryCode(
							TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_LIABILITIES.getCode());
			journalLineItem2.setTransactionCategory(category);
			journalLineItem2.setReferenceId(category.getTransactionCategoryId());

			journalLineItem2.setCreatedBy(userId);
			journalLineItem2.setJournal(journal);
			journalLineItemList.add(journalLineItem2);
			journal.setCreatedBy(userId);
			journal.setPostingReferenceType(PostingReferenceTypeEnum.PURCHASE);
			journal.setJournalDate(LocalDate.now());
			journal.setTransactionDate(inventory.getCreatedDate().toLocalDate());
			journal.setJournalLineItems(journalLineItemList);
			journalService.persist(journal);
			productService.update(product);

		}

		//TODO add inventory history row
		InventoryHistory inventoryHistory=new InventoryHistory();
		inventoryHistory.setCreatedBy(userId);
		inventoryHistory.setCreatedDate(inventory.getCreatedDate());
		inventoryHistory.setLastUpdateDate(LocalDateTime.now());
		inventoryHistory.setLastUpdateBy(userId);
		inventoryHistory.setTransactionDate(inventory.getCreatedDate().toLocalDate());
		inventoryHistory.setInventory(inventory);
		if (inventory.getProductId()!=null) {
			inventoryHistory.setProductId(inventory.getProductId());
		}
		if (inventory.getPurchaseQuantity()!=null) {
			inventoryHistory.setQuantity(inventory.getPurchaseQuantity().floatValue());
		}
		if (inventory.getUnitCost()!=null) {
			inventoryHistory.setUnitCost(inventory.getUnitCost());
		}
		if (inventory.getSupplierId()!=null) {
			inventoryHistory.setSupplierId(inventory.getSupplierId());
		}
		if (inventory.getUnitSellingPrice()!=null){
			inventoryHistory.setUnitSellingPrice(inventory.getUnitSellingPrice());
		}
		inventoryHistoryService.persist(inventoryHistory);
	}
}
