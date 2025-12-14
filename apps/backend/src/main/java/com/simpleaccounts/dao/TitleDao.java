package com.simpleaccounts.dao;

import com.simpleaccounts.entity.Title;
import java.util.List;

/**
 * Created by mohsin on 3/12/2017.
 */
public interface TitleDao extends Dao<Integer, Title> {

    List<Title> getTitles();
}
