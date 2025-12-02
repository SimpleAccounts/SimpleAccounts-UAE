/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.service.impl;

import com.simplevat.dao.Dao;
import com.simplevat.dao.SearchViewDao;
import com.simplevat.entity.SearchView;
import com.simplevat.service.SearchViewService;
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
