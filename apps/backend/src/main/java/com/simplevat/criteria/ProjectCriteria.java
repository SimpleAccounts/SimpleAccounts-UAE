package com.simplevat.criteria;

import lombok.Getter;
import lombok.Setter;

/**
 * Created by Utkarsh Bhavsar on 21/03/17.
 */
@Getter
@Setter
public class ProjectCriteria extends AbstractCriteria {

    public enum OrderBy {

        NAME                ("name", OrderByType.STRING),
        CANONICAL_NAME      ("canonicalName", OrderByType.STRING),
        ID                  ("projectId", OrderByType.STRING),;

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

    private Integer projectId;

    private Boolean active;

    private OrderBy orderBy = OrderBy.ID;

    private SortOrder sortOrder = SortOrder.ASC;
    
    private String projectName;

}
