/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.service.impl;

import com.simplevat.dao.Dao;
import com.simplevat.dao.DocumentTemplateDao;
import com.simplevat.entity.DocumentTemplate;
import com.simplevat.service.DocumentTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author daynil
 */

@Service
@Transactional
public class DocumentTemplateServiceImpl extends DocumentTemplateService {

    @Autowired
    private DocumentTemplateDao dao;

    @Override
    public DocumentTemplate getDocumentTemplateById(Integer documentTemplateId) {
        return dao.getDocumentTemplateById(documentTemplateId);

    }

    @Override
    protected Dao<Integer, DocumentTemplate> getDao() {
        return dao;
    }
}
