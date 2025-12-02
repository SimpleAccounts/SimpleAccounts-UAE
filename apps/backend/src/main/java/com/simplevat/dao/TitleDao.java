package com.simplevat.dao;

import java.util.List;

import com.simplevat.entity.Title;

/**
 * Created by mohsin on 3/12/2017.
 */
public interface TitleDao extends Dao<Integer, Title> {

    List<Title> getTitles();
}
