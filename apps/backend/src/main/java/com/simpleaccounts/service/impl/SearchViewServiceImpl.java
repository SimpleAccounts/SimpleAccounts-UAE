/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.SearchViewDao;
import com.simpleaccounts.entity.SearchView;
import com.simpleaccounts.service.SearchViewService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author admin
 */
@Service("searchViewService")
@Transactional
public class SearchViewServiceImpl extends SearchViewService {

    @Autowired
    private SearchViewDao searchViewDao;

    @Override
    public List<SearchView> getSearchedItem(String searchToken) {
        return searchViewDao.getSearchedItem(searchToken);
    }

    @Override
    protected Dao<Integer, SearchView> getDao() {
        return searchViewDao;
    }

}
