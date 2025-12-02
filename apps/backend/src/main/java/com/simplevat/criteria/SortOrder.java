package com.simplevat.criteria;

public enum SortOrder {

    DESC {
        @Override
        public SortOrder flip() {
            return ASC;
        }
    },

    ASC {
        @Override
        public SortOrder flip() {
            return DESC;
        }
    },;

    public abstract SortOrder flip();

}
