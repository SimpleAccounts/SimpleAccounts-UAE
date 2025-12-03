package com.simpleaccounts.service;

import com.simpleaccounts.entity.Language;
import java.util.List;

/**
 * Created by mohsin on 3/11/2017.
 */
public abstract class LanguageService extends SimpleAccountsService<Integer,Language> {

	public abstract List<Language> getLanguages();

	public abstract Language getLanguage(Integer languageId);
    
	public abstract Language getDefaultLanguage();
}
