package com.simpleaccounts.support;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Test fixture builder for Invoice entities.
 * Provides fluent API for creating test invoices with sensible defaults.
 */
public class InvoiceFixture {

    private Integer id;
    private String referenceNumber = "INV-TEST-001";
    private LocalDate invoiceDate = LocalDate.now();
    private LocalDate invoiceDueDate = LocalDate.now().plusDays(30);
    private BigDecimal totalAmount = new BigDecimal("1000.00");
    private BigDecimal totalVatAmount = new BigDecimal("50.00");
    private BigDecimal dueAmount = new BigDecimal("1050.00");
    private BigDecimal discount = BigDecimal.ZERO;
    private double discountPercentage = 0.0;
    private Integer status = 1; // Draft
    private Integer type = 2; // Customer Invoice
    private Integer createdBy = 1;
    private LocalDateTime createdDate = LocalDateTime.now();
    private Boolean deleteFlag = false;
    private Boolean editFlag = true;
    private String notes;
    private String currencyCode = "AED";
    private BigDecimal exchangeRate = BigDecimal.ONE;
    private Integer contactId;
    private Integer projectId;
    private List<LineItemData> lineItems = new ArrayList<>();

    public static InvoiceFixture aCustomerInvoice() {
        return new InvoiceFixture().withType(2);
    }

    public static InvoiceFixture aSupplierInvoice() {
        return new InvoiceFixture().withType(1);
    }

    public static InvoiceFixture aQuotation() {
        return new InvoiceFixture().withType(3);
    }

    public static InvoiceFixture aCreditNote() {
        return new InvoiceFixture().withType(4);
    }

    public InvoiceFixture withId(Integer id) {
        this.id = id;
        return this;
    }

    public InvoiceFixture withReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
        return this;
    }

    public InvoiceFixture withInvoiceDate(LocalDate invoiceDate) {
        this.invoiceDate = invoiceDate;
        return this;
    }

    public InvoiceFixture withDueDate(LocalDate dueDate) {
        this.invoiceDueDate = dueDate;
        return this;
    }

    public InvoiceFixture withTotalAmount(BigDecimal amount) {
        this.totalAmount = amount;
        return this;
    }

    public InvoiceFixture withTotalAmount(String amount) {
        this.totalAmount = new BigDecimal(amount);
        return this;
    }

    public InvoiceFixture withVatAmount(BigDecimal vatAmount) {
        this.totalVatAmount = vatAmount;
        return this;
    }

    public InvoiceFixture withVatAmount(String vatAmount) {
        this.totalVatAmount = new BigDecimal(vatAmount);
        return this;
    }

    public InvoiceFixture withDiscount(BigDecimal discount) {
        this.discount = discount;
        return this;
    }

    public InvoiceFixture withDiscountPercentage(double percentage) {
        this.discountPercentage = percentage;
        return this;
    }

    public InvoiceFixture withStatus(Integer status) {
        this.status = status;
        return this;
    }

    public InvoiceFixture asDraft() {
        this.status = 1;
        return this;
    }

    public InvoiceFixture asApproved() {
        this.status = 3;
        return this;
    }

    public InvoiceFixture asPaid() {
        this.status = 6;
        this.dueAmount = BigDecimal.ZERO;
        return this;
    }

    public InvoiceFixture asOverdue() {
        this.status = 3;
        this.invoiceDueDate = LocalDate.now().minusDays(30);
        return this;
    }

    public InvoiceFixture withType(Integer type) {
        this.type = type;
        return this;
    }

    public InvoiceFixture withCreatedBy(Integer createdBy) {
        this.createdBy = createdBy;
        return this;
    }

    public InvoiceFixture withCurrency(String currencyCode, BigDecimal exchangeRate) {
        this.currencyCode = currencyCode;
        this.exchangeRate = exchangeRate;
        return this;
    }

    public InvoiceFixture withContact(Integer contactId) {
        this.contactId = contactId;
        return this;
    }

    public InvoiceFixture withProject(Integer projectId) {
        this.projectId = projectId;
        return this;
    }

    public InvoiceFixture withNotes(String notes) {
        this.notes = notes;
        return this;
    }

    public InvoiceFixture deleted() {
        this.deleteFlag = true;
        return this;
    }

    public InvoiceFixture withLineItem(String description, BigDecimal quantity, BigDecimal unitPrice, BigDecimal vatRate) {
        lineItems.add(new LineItemData(description, quantity, unitPrice, vatRate));
        return this;
    }

    public InvoiceFixture withLineItem(String description, String quantity, String unitPrice, String vatRate) {
        lineItems.add(new LineItemData(description, new BigDecimal(quantity), new BigDecimal(unitPrice), new BigDecimal(vatRate)));
        return this;
    }

    // Build methods for different representations
    public InvoiceData build() {
        return new InvoiceData(
            id, referenceNumber, invoiceDate, invoiceDueDate,
            totalAmount, totalVatAmount, dueAmount, discount, discountPercentage,
            status, type, createdBy, createdDate, deleteFlag, editFlag,
            notes, currencyCode, exchangeRate, contactId, projectId, lineItems
        );
    }

    // Data class to hold invoice data without JPA dependencies
    public static class InvoiceData {
        public final Integer id;
        public final String referenceNumber;
        public final LocalDate invoiceDate;
        public final LocalDate invoiceDueDate;
        public final BigDecimal totalAmount;
        public final BigDecimal totalVatAmount;
        public final BigDecimal dueAmount;
        public final BigDecimal discount;
        public final double discountPercentage;
        public final Integer status;
        public final Integer type;
        public final Integer createdBy;
        public final LocalDateTime createdDate;
        public final Boolean deleteFlag;
        public final Boolean editFlag;
        public final String notes;
        public final String currencyCode;
        public final BigDecimal exchangeRate;
        public final Integer contactId;
        public final Integer projectId;
        public final List<LineItemData> lineItems;

        public InvoiceData(Integer id, String referenceNumber, LocalDate invoiceDate, LocalDate invoiceDueDate,
                          BigDecimal totalAmount, BigDecimal totalVatAmount, BigDecimal dueAmount,
                          BigDecimal discount, double discountPercentage, Integer status, Integer type,
                          Integer createdBy, LocalDateTime createdDate, Boolean deleteFlag, Boolean editFlag,
                          String notes, String currencyCode, BigDecimal exchangeRate,
                          Integer contactId, Integer projectId, List<LineItemData> lineItems) {
            this.id = id;
            this.referenceNumber = referenceNumber;
            this.invoiceDate = invoiceDate;
            this.invoiceDueDate = invoiceDueDate;
            this.totalAmount = totalAmount;
            this.totalVatAmount = totalVatAmount;
            this.dueAmount = dueAmount;
            this.discount = discount;
            this.discountPercentage = discountPercentage;
            this.status = status;
            this.type = type;
            this.createdBy = createdBy;
            this.createdDate = createdDate;
            this.deleteFlag = deleteFlag;
            this.editFlag = editFlag;
            this.notes = notes;
            this.currencyCode = currencyCode;
            this.exchangeRate = exchangeRate;
            this.contactId = contactId;
            this.projectId = projectId;
            this.lineItems = lineItems;
        }

        public BigDecimal getGrandTotal() {
            return totalAmount.add(totalVatAmount).subtract(discount);
        }
    }

    public static class LineItemData {
        public final String description;
        public final BigDecimal quantity;
        public final BigDecimal unitPrice;
        public final BigDecimal vatRate;

        public LineItemData(String description, BigDecimal quantity, BigDecimal unitPrice, BigDecimal vatRate) {
            this.description = description;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
            this.vatRate = vatRate;
        }

        public BigDecimal getSubTotal() {
            return quantity.multiply(unitPrice);
        }

        public BigDecimal getVatAmount() {
            return getSubTotal().multiply(vatRate).divide(new BigDecimal("100"));
        }

        public BigDecimal getTotal() {
            return getSubTotal().add(getVatAmount());
        }
    }
}
