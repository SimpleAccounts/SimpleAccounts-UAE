package com.simpleaccounts.service.impl;


import com.simpleaccounts.dao.LanguageDao;
import com.simpleaccounts.entity.Language;
import com.simpleaccounts.service.LanguageService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Created by mohsin on 3/11/2017.
 */
@Service
@RequiredArgsConstructor
public class LanguageServiceImpl extends LanguageService {

    private final LanguageDao languageDao;

    @Override
    public List<Language> getLanguages() {
        return getDao().getLanguages();
    }

    @Override
    public Language getLanguage(Integer languageId) {
        return getDao().getLanguageById(languageId);
    }

    @Override
    public Language getDefaultLanguage() {
        return getDao().getDefaultLanguage();
    }

	@Override
	public LanguageDao getDao() {
		return languageDao;
	}
}
