package com.simpleaccounts.rest;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaginationResponseModel {

	private Integer count;
	
	@JsonProperty("totalRecords")
	private Integer totalRecords;
	
	private Object data;
	
	public PaginationResponseModel(Integer count, Object data) {
		this.count = count;
		this.totalRecords = count;
		this.data = data;
	}
	
	public void setCount(Integer count) {
		this.count = count;
		this.totalRecords = count;
	}

}
