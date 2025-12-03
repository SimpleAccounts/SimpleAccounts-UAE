/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.service;

import com.simpleaccounts.entity.Configuration;
import java.util.List;

/**
 *
 * @author daynil
 */
public abstract class ConfigurationService extends SimpleAccountsService<Integer, Configuration> {

    public abstract Configuration getConfigurationByName(String cofigurationName);

    public abstract List<Configuration> getConfigurationList();

    public abstract void updateConfigurationList(List<Configuration> configurationList);

}
