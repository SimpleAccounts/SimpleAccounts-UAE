package com.simplevat.criteria;

import lombok.Getter;
import lombok.Setter;

/**
 *
 * @author hiren
 * @since 19 May, 2017 1:34:52 PM
 */
@Getter
@Setter
public class InvoiceCriteria extends AbstractCriteria {

    public enum OrderBy {

        NAME("name", OrderByType.STRING),
        CANONICAL_NAME("canonicalName", OrderByType.STRING),
        ID("invoiceId", OrderByType.STRING),
        ORDER_SEQUENCE("orderSequence", OrderByType.STRING);

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

    private Integer invoiceId;

    private Boolean active;

    private OrderBy orderBy = OrderBy.ORDER_SEQUENCE;

    private SortOrder sortOrder = SortOrder.ASC;

}
