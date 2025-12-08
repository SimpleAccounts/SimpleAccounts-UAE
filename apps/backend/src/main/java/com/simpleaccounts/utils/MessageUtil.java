package com.simpleaccounts.utils;


import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
@Slf4j
public class MessageUtil implements ApplicationContextAware {

	  private static ApplicationContext appContext;
	    private static ReloadableResourceBundleMessageSource messageSource;

	    @Override
	    // Setting static field is intentional for ApplicationContextAware pattern to enable static access
	    @SuppressWarnings("java:S2696")
	    public void setApplicationContext(ApplicationContext appContext) {
	    	MessageUtil.appContext = appContext;
	    }

	    public static String getMessage(String key) {
	    	if (messageSource == null)
	    		messageSource = appContext.getBean(ReloadableResourceBundleMessageSource.class);
	    	Locale locale = LocaleContextHolder.getLocale();
	    	if (!locale.getLanguage().equals("en"))
	    		log.debug("The local is not supported " + locale.getLanguage() );
	    	locale = Locale.US;
	    	messageSource.setDefaultEncoding("UTF-8");
	    	return messageSource.getMessage(key, null, locale);
	    }
}
