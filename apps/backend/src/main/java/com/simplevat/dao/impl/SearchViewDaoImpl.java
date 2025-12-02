/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao.impl;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.SearchViewDao;
import com.simplevat.entity.SearchView;
import java.util.List;
import javax.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

/**
 *
 * @author admin
 */
@Repository(value = "searchViewDao")
public class SearchViewDaoImpl extends AbstractDao<Integer, SearchView> implements SearchViewDao {

    @Override
    public List<SearchView> getSearchedItem(String searchToken) {
        TypedQuery<SearchView> query = getEntityManager().createQuery("SELECT s FROM SearchView s WHERE s.name LIKE '%'||:searchToken||'%' OR s.description LIKE '%'||:searchToken||'%'", SearchView.class);
        query.setParameter("searchToken", searchToken);
        return query.getResultList();
    }

}
