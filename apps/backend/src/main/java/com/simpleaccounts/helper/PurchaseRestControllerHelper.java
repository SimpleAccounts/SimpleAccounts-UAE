package com.simpleaccounts.helper;

import com.simpleaccounts.constant.InvoicePurchaseStatusConstant;
import com.simpleaccounts.entity.Purchase;
import com.simpleaccounts.entity.PurchaseLineItem;
import com.simpleaccounts.model.PurchaseItemRestModel;
import com.simpleaccounts.model.PurchaseRestModel;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import lombok.NonNull;
import org.springframework.stereotype.Component;

@Component
public class PurchaseRestControllerHelper {

	public Purchase getPurchase(PurchaseRestModel model) {
		Purchase purchase = new Purchase();
		purchase.setPurchaseId(model.getPurchaseId());
		purchase.setUser(model.getUser());
		purchase.setCreatedBy(model.getCreatedBy());
		purchase.setCreatedDate(model.getCreatedDate());
		purchase.setCurrency(model.getCurrency());
		purchase.setDeleteFlag(model.getDeleteFlag());
		purchase.setPurchaseAmount(model.getPurchaseAmount());
		purchase.setPurchaseDueAmount(model.getPurchaseDueAmount());
		purchase.setPurchaseDueOn(model.getPurchaseDueOn());
		if (model.getPurchaseDate() != null) {
			LocalDateTime purchaseDate = Instant.ofEpochMilli(model.getPurchaseDate().getTime())
					.atZone(ZoneId.systemDefault()).toLocalDateTime();
			purchase.setPurchaseDate(purchaseDate);
		}
		if (model.getPurchaseDueDate() != null) {
			LocalDateTime purchaseDueDate = Instant.ofEpochMilli(model.getPurchaseDueDate().getTime())
					.atZone(ZoneId.systemDefault()).toLocalDateTime();
			purchase.setPurchaseDueDate(purchaseDueDate);
		}
		purchase.setPurchaseDescription(model.getPurchaseDescription());
		purchase.setLastUpdateDate(model.getLastUpdateDate());
		purchase.setLastUpdateBy(model.getLastUpdateBy());
		purchase.setProject(model.getProject());
		purchase.setReceiptAttachmentDescription(model.getReceiptAttachmentDescription());
		purchase.setReceiptAttachmentPath(model.getReceiptAttachmentPath());
		purchase.setReceiptNumber(model.getReceiptNumber());
		purchase.setTransactionCategory(model.getTransactionCategory());
		purchase.setTransactionType(model.getTransactionType());
		purchase.setVersionNumber(model.getVersionNumber());
		purchase.setPurchaseContact(model.getPurchaseContact());
		purchase.setStatus(model.getStatus());
		purchase.setPaymentMode(model.getPaymentMode());
		final Collection<PurchaseLineItem> items = model.getPurchaseItems().stream()
				.map(item -> convertToLineItem(item, purchase)).collect(Collectors.toList());
		purchase.setPurchaseLineItems(items);

		return purchase;
	}

	@NonNull
	private PurchaseLineItem convertToLineItem(@NonNull final PurchaseItemRestModel model,
			@NonNull final Purchase purchase) {

		final PurchaseLineItem item = new PurchaseLineItem();
		if (model.getId() > 0) {
			item.setPurchaseLineItemId(model.getId());
		}
		item.setPurchaseLineItemDescription(model.getDescription());
		item.setPurchaseLineItemQuantity(model.getQuatity());
		item.setPurchaseLineItemUnitPrice(model.getUnitPrice());
		item.setPurchaseLineItemVat(model.getVatId());
		item.setVersionNumber(model.getVersionNumber());
		item.setPurchaseLineItemProductService(model.getProductService());
		item.setPurchase(purchase);
		return item;
	}

	public PurchaseRestModel getPurchaseModel(Purchase entity) {
		PurchaseRestModel purchaseModel = new PurchaseRestModel();

		purchaseModel.setPurchaseId(entity.getPurchaseId());
		purchaseModel.setUser(entity.getUser());
		purchaseModel.setCreatedBy(entity.getCreatedBy());
		purchaseModel.setCreatedDate(entity.getCreatedDate());
		purchaseModel.setCurrency(entity.getCurrency());
		purchaseModel.setDeleteFlag(entity.getDeleteFlag());
		purchaseModel.setPurchaseAmount(entity.getPurchaseAmount());
		purchaseModel.setPurchaseDueAmount(entity.getPurchaseDueAmount());
		purchaseModel.setPurchaseDueOn(entity.getPurchaseDueOn());
		purchaseModel.setPurchaseContact(entity.getPurchaseContact());
		if (entity.getPurchaseDate() != null) {
			Date purchaseDate = Date.from(entity.getPurchaseDate().atZone(ZoneId.systemDefault()).toInstant());
			purchaseModel.setPurchaseDate(purchaseDate);
		}
		if (entity.getPurchaseDueDate() != null) {
			Date purchaseDueDate = Date.from(entity.getPurchaseDueDate().atZone(ZoneId.systemDefault()).toInstant());
			purchaseModel.setPurchaseDueDate(purchaseDueDate);
		}
		purchaseModel.setPurchaseDescription(entity.getPurchaseDescription());
		purchaseModel.setLastUpdateDate(entity.getLastUpdateDate());
		purchaseModel.setLastUpdateBy(entity.getLastUpdateBy());
		purchaseModel.setProject(entity.getProject());
		purchaseModel.setReceiptAttachmentDescription(entity.getReceiptAttachmentDescription());
		purchaseModel.setReceiptAttachmentPath(entity.getReceiptAttachmentPath());
		purchaseModel.setReceiptNumber(entity.getReceiptNumber());
		purchaseModel.setTransactionCategory(entity.getTransactionCategory());
		purchaseModel.setTransactionType(entity.getTransactionType());
		purchaseModel.setVersionNumber(entity.getVersionNumber());
		purchaseModel.setReceiptAttachmentBinary(entity.getReceiptAttachmentBinary());
		purchaseModel.setStatus(entity.getStatus());
		if (entity.getStatus() == InvoicePurchaseStatusConstant.PAID) {
			purchaseModel.setStatusName("PAID");
		} else if (entity.getStatus() == InvoicePurchaseStatusConstant.PARTIALPAID) {
			purchaseModel.setStatusName("PARTIALPAID");
		} else if (entity.getStatus() == InvoicePurchaseStatusConstant.UNPAID) {
			purchaseModel.setStatusName("UNPAID");
		}
		purchaseModel.setPaymentMode(entity.getPaymentMode());

		final List<PurchaseItemRestModel> items = entity.getPurchaseLineItems().stream()
				.map(lineItem -> PurchaseRestControllerHelper.this.convertToItemModel(lineItem)).collect(Collectors.toList());
		purchaseModel.setPurchaseItems(items);
		return purchaseModel;
	}

	@NonNull
	public PurchaseItemRestModel convertToItemModel(@NonNull final PurchaseLineItem purchaseLineItem) {

		final PurchaseItemRestModel model = new PurchaseItemRestModel();

		model.setId(purchaseLineItem.getPurchaseLineItemId());
		model.setDescription(purchaseLineItem.getPurchaseLineItemDescription());
		model.setQuatity(purchaseLineItem.getPurchaseLineItemQuantity());
		model.setUnitPrice(purchaseLineItem.getPurchaseLineItemUnitPrice());
		model.setVatId(purchaseLineItem.getPurchaseLineItemVat());
		model.setProductService(purchaseLineItem.getPurchaseLineItemProductService());
		model.setVersionNumber(purchaseLineItem.getVersionNumber());
		this.updateSubTotal(model);
		return model;

	}

	private void updateSubTotal(@NonNull final PurchaseItemRestModel purchaseItemModel) {
		BigDecimal vatPer = new BigDecimal(BigInteger.ZERO);
		final int quantity = purchaseItemModel.getQuatity();
		final BigDecimal unitPrice = purchaseItemModel.getUnitPrice();
		if (purchaseItemModel.getVatId() != null) {
			vatPer = purchaseItemModel.getVatId().getVat();
		}
		if (null != unitPrice) {
			final BigDecimal amountWithoutTax = unitPrice.multiply(new BigDecimal(quantity));
			purchaseItemModel.setSubTotal(amountWithoutTax);

			if (vatPer != null && vatPer.compareTo(BigDecimal.ZERO) >= 1) {
				final BigDecimal amountWithTax = amountWithoutTax
						.add(amountWithoutTax.multiply(vatPer).multiply(BigDecimal.valueOf(0.01)));
				purchaseItemModel.setSubTotal(amountWithTax);
			}
		}
	}

}
