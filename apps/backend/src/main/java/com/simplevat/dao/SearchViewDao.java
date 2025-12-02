/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao;

import com.simplevat.entity.SearchView;
import java.util.List;

/**
 *
 * @author admin
 */
public interface SearchViewDao extends Dao<Integer, SearchView>{
    
    List<SearchView> getSearchedItem(String searchToken);
    
}
