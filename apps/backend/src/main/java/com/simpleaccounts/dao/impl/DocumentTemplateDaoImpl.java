/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.DocumentTemplateDao;
import com.simpleaccounts.entity.DocumentTemplate;
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
