package com.simplevat.criteria.bankaccount;

import lombok.Getter;
import lombok.Setter;

import com.simplevat.criteria.AbstractCriteria;
import com.simplevat.criteria.SortOrder;


@Getter
@Setter
public class ChartOfAccountCriteria extends AbstractCriteria {

	public enum OrderBy {

		NAME                ("name", OrderByType.STRING),
        CANONICAL_NAME      ("canonicalName", OrderByType.STRING),
        ID                  ("ChartOfAccountId", OrderByType.STRING),
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

	private Integer chartOfAccountId;
	
	private Boolean active;

	private OrderBy orderBy = OrderBy.ORDER_SEQUENCE	;

	private SortOrder sortOrder = SortOrder.ASC;
	    
}
