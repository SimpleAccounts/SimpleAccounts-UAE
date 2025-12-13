package com.simpleaccounts.dao;

import java.util.List;

import com.simpleaccounts.entity.Title;

/**
 * Created by mohsin on 3/12/2017.
 */
public interface TitleDao extends Dao<Integer, Title> {

    List<Title> getTitles();
}
