package com.simplevat.criteria.bankaccount;

import lombok.Getter;
import lombok.Setter;

import com.simplevat.criteria.AbstractCriteria;
import com.simplevat.criteria.SortOrder;
import com.simplevat.entity.bankaccount.BankAccount;


@Getter
@Setter
public class ImportedDraftTransactionCriteria extends AbstractCriteria {

	public enum OrderBy {

		NAME                ("name", OrderByType.STRING),
        CANONICAL_NAME      ("canonicalName", OrderByType.STRING),
        ID                  ("importedTransactionId", OrderByType.STRING),;

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

	private Integer importedTransactionId;

	private Boolean active;
	
	private BankAccount bankAccount;

	private OrderBy orderBy = OrderBy.ID;

	private SortOrder sortOrder = SortOrder.ASC;
	    
}
