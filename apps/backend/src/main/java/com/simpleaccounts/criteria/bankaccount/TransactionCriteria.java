package com.simpleaccounts.criteria.bankaccount;

import lombok.Getter;
import lombok.Setter;

import com.simpleaccounts.criteria.AbstractCriteria;
import com.simpleaccounts.criteria.SortOrder;
import com.simpleaccounts.entity.bankaccount.BankAccount;


@Getter
@Setter
public class TransactionCriteria extends AbstractCriteria {

	public enum OrderBy {

		NAME                ("name", OrderByType.STRING),
        CANONICAL_NAME      ("canonicalName", OrderByType.STRING),
        ID                  ("transactionId", OrderByType.STRING),;

		private final String columnName;

		private final OrderByType columnType;

		OrderBy(String columnName, OrderByType columnType) {
			this.columnName = columnName;
			this.columnType = columnType;
		}

		public String getColumnName() {
			return columnName;
		}

		public OrderByType getColumnType() {
			return columnType;
		}
	}

	private Integer transactionId;
	
	private BankAccount bankAccount;

	private Boolean active;

	private OrderBy orderBy = OrderBy.ID;

	private SortOrder sortOrder = SortOrder.ASC;
	    
}
