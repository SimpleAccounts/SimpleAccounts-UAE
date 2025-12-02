package com.simplevat.utils;

import lombok.Getter;
import lombok.Setter;

public class VatPageRequest {

	@Getter @Setter
	private int page;
	@Getter @Setter
	private int size;
	@Getter @Setter
	private String sortStr;
}
