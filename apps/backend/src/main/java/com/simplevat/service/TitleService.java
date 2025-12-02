package com.simplevat.service;

import java.util.List;

/**
 * Created by mohsin on 3/12/2017.
 */
public abstract class TitleService<Integer, Title> extends SimpleVatService<Integer, Title> {

	public abstract List<Title> getTitles();
}
