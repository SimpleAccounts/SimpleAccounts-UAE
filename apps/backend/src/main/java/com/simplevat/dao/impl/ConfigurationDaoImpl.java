/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao.impl;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.ConfigurationDao;
import com.simplevat.entity.Configuration;

import java.util.ArrayList;
import java.util.List;
import javax.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

/**
 *
 * @author daynil
 */
@Repository
public class ConfigurationDaoImpl extends AbstractDao<Integer, Configuration> implements ConfigurationDao {

	@Override
	public Configuration getConfigurationByName(String cofigurationName) {
		TypedQuery<Configuration> query = getEntityManager().createNamedQuery("Configuration.findByName",
				Configuration.class);
		query.setParameter("name", cofigurationName);
		List<Configuration> configurationList = query.getResultList();
		if (configurationList != null && !configurationList.isEmpty()) {
			return configurationList.get(0);
		}
		return null;
	}

	@Override
	public List<Configuration> getConfigurationList() {
		TypedQuery<Configuration> query = getEntityManager().createQuery("SELECT c FROM Configuration c",
				Configuration.class);
		List<Configuration> configurationList = query.getResultList();
		if (configurationList != null && !configurationList.isEmpty()) {
			return configurationList;
		}
		return new ArrayList<>();
	}

}
