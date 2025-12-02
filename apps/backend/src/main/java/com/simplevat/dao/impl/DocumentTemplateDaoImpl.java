/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao.impl;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.DocumentTemplateDao;
import com.simplevat.entity.DocumentTemplate;
import org.springframework.stereotype.Repository;

/**
 *
 * @author daynil
 */
@Repository
public class DocumentTemplateDaoImpl extends AbstractDao<Integer, DocumentTemplate> implements DocumentTemplateDao{

    
    
    @Override
    public DocumentTemplate getDocumentTemplateById(Integer documentTemplateId) {        
      
        return findByPK(documentTemplateId);  
    }

    
}
