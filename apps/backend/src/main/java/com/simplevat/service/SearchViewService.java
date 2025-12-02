/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.service;

import com.simplevat.entity.SearchView;
import java.util.List;

/**
 *
 * @author admin
 */
public abstract class SearchViewService extends SimpleVatService<Integer, SearchView> {

    public abstract List<SearchView> getSearchedItem(String searchToken);
}
