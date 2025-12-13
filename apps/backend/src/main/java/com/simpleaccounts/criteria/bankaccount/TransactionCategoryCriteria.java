package com.simpleaccounts.criteria.bankaccount;

import com.simpleaccounts.criteria.AbstractCriteria;
import com.simpleaccounts.criteria.SortOrder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionCategoryCriteria extends AbstractCriteria {

	public enum OrderBy {

		NAME                ("name", OrderByType.STRING),
        CANONICAL_NAME      ("canonicalName", OrderByType.STRING),
        ID                  ("transactionId", OrderByType.STRING),
        ORDER_SEQUENCE      ("orderSequence", OrderByType.STRING);

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

	private Integer transactionCategoryId;
	
	private Boolean active;

	private OrderBy orderBy = OrderBy.ORDER_SEQUENCE;

	private SortOrder sortOrder = SortOrder.ASC;
	    
}
