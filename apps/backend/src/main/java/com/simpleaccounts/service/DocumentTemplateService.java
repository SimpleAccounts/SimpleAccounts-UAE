/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.service;

import com.simpleaccounts.entity.DocumentTemplate;

/**
 *
 * @author daynil
 */
public abstract class DocumentTemplateService extends SimpleAccountsService <Integer, DocumentTemplate>{
 
       public abstract DocumentTemplate getDocumentTemplateById(Integer documentTemplateId);
}
