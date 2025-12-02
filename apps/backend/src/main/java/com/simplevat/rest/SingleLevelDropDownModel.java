package com.simplevat.rest;

import java.io.Serializable;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SingleLevelDropDownModel implements Serializable {

	private String label;
	private List<DropdownModel> options;
}
