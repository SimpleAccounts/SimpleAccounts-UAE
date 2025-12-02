package com.simplevat.rest;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaginationResponseModel {

	private Integer count;
	private Object data;

}
