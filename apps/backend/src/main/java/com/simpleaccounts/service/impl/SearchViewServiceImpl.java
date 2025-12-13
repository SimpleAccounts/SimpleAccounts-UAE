/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.dao.SearchViewDao;
import com.simpleaccounts.entity.SearchView;
import com.simpleaccounts.service.SearchViewService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author admin
 */
@Service("searchViewService")
@Transactional
@RequiredArgsConstructor
public class SearchViewServiceImpl extends SearchViewService {

    private final SearchViewDao searchViewDao;

    @Override
    public List<SearchView> getSearchedItem(String searchToken) {
        return searchViewDao.getSearchedItem(searchToken);
    }

    @Override
    protected Dao<Integer, SearchView> getDao() {
        return searchViewDao;
    }

}
