package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.TitleDao;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.entity.Title;
import com.simpleaccounts.service.TitleService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by mohsin on 3/12/2017.
 */
@Service
@RequiredArgsConstructor
public class TitleServiceImpl extends TitleService<Integer, Title> {

    private final TitleDao dao;

    @Override
    public List<Title> getTitles() {
        return dao.getTitles();
    }

    @Override
    public TitleDao getDao() {
        return dao;
    }
}
