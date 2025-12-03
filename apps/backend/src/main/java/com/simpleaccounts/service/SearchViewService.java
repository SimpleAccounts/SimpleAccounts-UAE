/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.service;

import com.simpleaccounts.entity.SearchView;
import java.util.List;

/**
 *
 * @author admin
 */
public abstract class SearchViewService extends SimpleAccountsService<Integer, SearchView> {

    public abstract List<SearchView> getSearchedItem(String searchToken);
}
