/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.ConfigurationDao;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.Configuration;
import com.simpleaccounts.service.ConfigurationService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author daynil
 */
@Service
@Transactional
@RequiredArgsConstructor
public class ConfigurationServiceImpl extends ConfigurationService {

    private final ConfigurationDao dao;

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
