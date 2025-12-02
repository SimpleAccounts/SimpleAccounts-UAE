/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.service.impl;

import com.simplevat.dao.ConfigurationDao;
import com.simplevat.dao.Dao;
import com.simplevat.entity.Configuration;
import com.simplevat.service.ConfigurationService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author daynil
 */
@Service
@Transactional
public class ConfigurationServiceImpl extends ConfigurationService {

    @Autowired
    private ConfigurationDao dao;

    @Override
    public Configuration getConfigurationByName(String cofigurationName) {
        return dao.getConfigurationByName(cofigurationName);
    }

    @Override
    protected Dao<Integer, Configuration> getDao() {

        return dao;
    }

    @Override
    public List<Configuration> getConfigurationList() {
        return dao.getConfigurationList();
    }

    @Override
    public void updateConfigurationList(List<Configuration> configurationList) {
        for (Configuration configuration : configurationList) {
            if (configuration.getId() != null) {
                dao.update(configuration);
            } else {
                dao.persist(configuration);
            }
        }
    }

}
