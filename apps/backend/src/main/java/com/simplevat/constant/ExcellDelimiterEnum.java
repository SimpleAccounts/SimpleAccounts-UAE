package com.simplevat.constant;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import com.simplevat.rest.EnumDropdownModel;

import lombok.Getter;

public enum ExcellDelimiterEnum {

	TAB("TAB", "Tab"), SEMICOLON("SEMICOLON", "Semicolon"), COMMA("COMMA", "Comma"), SPACE("SPACE", "Space"),
	OTHER("OTHER", "Other");

	@Getter
	String dbColumnName;

	@Getter
	String displayName;

	private ExcellDelimiterEnum(String dbColumnName, String displayName) {
		this.dbColumnName = dbColumnName;
		this.displayName = displayName;
	}

	public static List<EnumDropdownModel> getDropdownList() {
		List<EnumDropdownModel> enumDropdownModels = new ArrayList<>();
		Stream.of(ExcellDelimiterEnum.values()).forEach(excellDelimiterEnum -> enumDropdownModels
				.add(new EnumDropdownModel(excellDelimiterEnum.name(), excellDelimiterEnum.displayName)));
		return enumDropdownModels;
	}

}
