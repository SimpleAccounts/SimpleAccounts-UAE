package com.simplevat.constant;

public enum ProductPriceType {
	SALES, PURCHASE, BOTH;

	public static boolean isSalesValuePresnt(ProductPriceType productPriceType) {
		return productPriceType.equals(SALES) || productPriceType.equals(BOTH);
	}

	public static boolean isPurchaseValuePresnt(ProductPriceType productPriceType) {
		return productPriceType.equals(PURCHASE) || productPriceType.equals(BOTH);
	}
}
