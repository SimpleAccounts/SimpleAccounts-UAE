/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.rest;

import com.simplevat.constant.DatatableSortingFilterConstant;

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
		if (pageNo == null) {
			pageNo = 0;
		} else {
			pageNo = pageNo * getPageSize();
		}
		return pageNo;
	}

	public Integer getPageSize() {
		if (pageSize == null) {
			pageSize = 10;
		}
		return pageSize;
	}
}
