package com.simplevat.criteria;

/**
 * Created by Utkarsh Bhavsar on 21/03/17.
 */
public abstract class AbstractCriteria {

    public enum OrderByType {
        NUMBER,
        STRING
    }

    protected Long start = null;

    protected Long limit = null;

    public abstract SortOrder getSortOrder();
    public abstract void setSortOrder(SortOrder sortOrder);

    public Long getStart() {
        return start;
    }

    public void setStart(Long start) {
        this.start = start;
    }

    public Long getLimit() {
        return limit;
    }

    public void setLimit(Long limit) {
        this.limit = limit;
    }
}
