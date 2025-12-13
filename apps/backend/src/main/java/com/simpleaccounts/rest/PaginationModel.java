/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;

import lombok.Data;

/**
 *
 * @author uday
 */
	@Data
	public class PaginationModel {
		private Integer pageNo;
		private Integer pageSize;
		private String order;
	private String sortingCol;
	private boolean paginationDisable;

	public String getOrder() {
		if (order == null || (order != null && order.isEmpty())) {
			order = DatatableSortingFilterConstant.DEFAULT_SORTING_ORDER;
		}
		return order;
	}

	public String getSortingCol() {
		if (sortingCol == null || (sortingCol != null && sortingCol.isEmpty())) {
			sortingCol = "-1";
		}
		return sortingCol;
	}

		public Integer getPageNo() {
			int pageNumber = pageNo == null ? 0 : pageNo;
			if (pageNumber < 0) {
				return 0;
			}

			int size = getPageSize();
			long offset = (long) pageNumber * (long) size;
			if (offset > Integer.MAX_VALUE) {
				return Integer.MAX_VALUE;
			}
			return (int) offset;
		}

		public Integer getPageSize() {
			if (pageSize == null || pageSize <= 0) {
				return 10;
			}
			int maxPageSize = 1000;
			return Math.min(pageSize, maxPageSize);
		}
	}
