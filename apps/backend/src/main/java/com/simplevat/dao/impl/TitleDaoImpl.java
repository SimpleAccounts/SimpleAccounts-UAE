package com.simplevat.dao.impl;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.simplevat.dao.TitleDao;
import com.simplevat.entity.Title;
import com.simplevat.dao.AbstractDao;

/**
 * Created by mohsin on 3/12/2017.
 */
@Repository
public class TitleDaoImpl extends AbstractDao<Integer, Title> implements TitleDao {

	@Override
	public List<Title> getTitles() {
		return this.executeNamedQuery("allTitles");
	}
}
