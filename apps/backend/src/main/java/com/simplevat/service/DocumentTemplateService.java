/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.service;

import com.simplevat.entity.DocumentTemplate;

/**
 *
 * @author daynil
 */
public abstract class DocumentTemplateService extends SimpleVatService <Integer, DocumentTemplate>{
 
       public abstract DocumentTemplate getDocumentTemplateById(Integer documentTemplateId);
}
