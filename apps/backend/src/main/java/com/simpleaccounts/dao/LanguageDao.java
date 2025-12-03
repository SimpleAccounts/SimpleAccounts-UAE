package com.simpleaccounts.dao;

import com.simpleaccounts.entity.Language;
import java.util.List;

/**
 * Created by mohsin on 3/2/2017.
 */
public interface LanguageDao extends Dao<Integer, Language> {

    Language getLanguageById(Integer languageId);

    List<Language> getLanguages();

    Language getDefaultLanguage();
}
