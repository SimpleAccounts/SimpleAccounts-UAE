package com.simplevat.service;

import com.simplevat.entity.Language;
import java.util.List;

/**
 * Created by mohsin on 3/11/2017.
 */
public abstract class LanguageService extends SimpleVatService<Integer,Language> {

	public abstract List<Language> getLanguages();

	public abstract Language getLanguage(Integer languageId);
    
	public abstract Language getDefaultLanguage();
}
