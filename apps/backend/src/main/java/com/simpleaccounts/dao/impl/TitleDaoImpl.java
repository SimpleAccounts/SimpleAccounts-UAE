package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.TitleDao;
import com.simpleaccounts.entity.Title;
import java.util.List;
import org.springframework.stereotype.Repository;

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
