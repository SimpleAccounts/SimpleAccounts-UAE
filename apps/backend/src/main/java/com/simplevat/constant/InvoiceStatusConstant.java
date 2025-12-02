package com.simplevat.constant;

public final class InvoiceStatusConstant {

    public static final int UNPAID = 1;
    public static final int PARTIALPAID = 2;
    public static final int PAID = 3;

    public static String getStatusName(int status) {
        switch (status) {
            case UNPAID:
                return "Unpaid";
            case PARTIALPAID:
                return "Partial Paid";
            case PAID:
                return "Paid";
            default:
                return "Unknown";
        }
    }

	private InvoiceStatusConstant() {
		// CREATED TO REMOVE SONAR ERROR
	}
}
