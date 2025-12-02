/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao;

import com.simplevat.entity.DocumentTemplate;

/**
 *
 * @author daynil
 */
public interface DocumentTemplateDao extends Dao<Integer, DocumentTemplate> {
    public DocumentTemplate getDocumentTemplateById(Integer documentTemplateId);
}
