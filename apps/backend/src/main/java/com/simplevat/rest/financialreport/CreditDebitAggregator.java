package com.simplevat.rest.financialreport;

public class CreditDebitAggregator {
    private Double creditAmount;
    private Double debitAmount;
    private String transactionCategoryCode;
    private String transactionCategoryName;


    public CreditDebitAggregator(Double creditAmount, Double debitAmount, String transactionCategoryCode, String transactionCategoryName) {
        this.creditAmount = creditAmount;
        this.debitAmount = debitAmount;
        this.transactionCategoryCode = transactionCategoryCode;
        this.transactionCategoryName = transactionCategoryName;
    }

    public Double getCreditAmount() {
        return creditAmount;
    }

    public Double getDebitAmount() {
        return debitAmount;
    }

    public Double getTotalAmount()
    {
        return creditAmount+debitAmount;
    }
    public Double getActualAmount()
    {
        if (creditAmount>debitAmount){
        Double differenceAmount= creditAmount-debitAmount;
        return differenceAmount;
        }
        else{
            Double differenceAmount=debitAmount-creditAmount;
        return differenceAmount;
        }

    }

    public String getTransactionCategoryCode() {
        return transactionCategoryCode;
    }

    public String getTransactionCategoryName() {
        return transactionCategoryName;
    }
}
