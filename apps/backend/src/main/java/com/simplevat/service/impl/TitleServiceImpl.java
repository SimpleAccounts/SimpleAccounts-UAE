package com.simplevat.service.impl;

import com.simplevat.dao.TitleDao;
import com.simplevat.entity.Title;
import com.simplevat.service.TitleService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by mohsin on 3/12/2017.
 */
@Service
public class TitleServiceImpl extends TitleService<Integer, Title> {

    @Autowired
    private TitleDao dao;

    @Override
    public List<Title> getTitles() {
        return dao.getTitles();
    }

    @Override
    public TitleDao getDao() {
        return dao;
    }
}
