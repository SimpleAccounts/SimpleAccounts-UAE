package com.simplevat.dao.impl;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.simplevat.dao.LanguageDao;
import com.simplevat.entity.Language;
import com.simplevat.dao.AbstractDao;
import javax.persistence.TypedQuery;

/**
 * Created by mohsin on 3/2/2017.
 */
@Repository
public class LanguageDaoImpl extends AbstractDao<Integer, Language> implements LanguageDao {

    @Override
    public Language getLanguageById(Integer languageId) {
        return this.findByPK(languageId);
    }

    @Override
    public List<Language> getLanguages() {
       return this.executeNamedQuery("allLanguages");
    }

    @Override
    public Language getDefaultLanguage() {
        TypedQuery<Language> query = getEntityManager().createQuery("SELECT l FROM Language l where l.deleteFlag=false AND l.defaultFlag = 'Y' ORDER BY l.orderSequence ASC ", Language.class);
        return query.getSingleResult();
    }
}
