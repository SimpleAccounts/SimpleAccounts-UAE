package com.simplevat.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;
import com.simplevat.entity.Project;
import com.simplevat.entity.bankaccount.BankAccount;
import com.simplevat.entity.bankaccount.Transaction;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.entity.TransactionStatus;
import com.simplevat.entity.bankaccount.ChartOfAccount;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class TransactionRestModel implements Comparable<TransactionRestModel> {

	private Integer transactionId;
	private Date transactionDate;
	private String transactionDescription;
	private BigDecimal transactionAmount;
	private ChartOfAccount chartOfAccountId;
	private String receiptNumber;
	private Character debitCreditFlag;
	private Project project;
	private TransactionCategory explainedTransactionCategory;
	private String explainedTransactionDescription;
	private String explainedTransactionAttachementDescription;
	private byte[] explainedTransactionAttachement;
	private BankAccount bankAccount;
	private TransactionStatus transactionStatus;
	private BigDecimal currentBalance = new BigDecimal(0);
	private Integer createdBy = 0;
	private LocalDateTime createdDate;
	private Integer lastUpdatedBy;
	private LocalDateTime lastUpdateDate;
	private Boolean deleteFlag = false;
	private Integer versionNumber = 1;
	private Integer entryType;
	private Object refObject;
	private Integer referenceId;
	private Integer referenceType;
	private String referenceName;
	private String referenceTypeName;
	private Transaction parentTransaction;
	private List<TransactionRestModel> childTransactionList = new ArrayList<>();
	private boolean expandIcon;
	private String suggestedTransactionString;

	@Override
	public int compareTo(TransactionRestModel o) {
		return transactionDate.compareTo(o.transactionDate);
	}

	@Override
	public boolean equals(Object obj) {
		return super.equals(obj);
	}

	public boolean isParent() {
		return parentTransaction == null;
	}
	
	@Override
	public int hashCode() {
		return super.hashCode();
	}

}
