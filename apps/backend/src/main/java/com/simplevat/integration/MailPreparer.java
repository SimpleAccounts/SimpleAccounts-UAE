package com.simplevat.integration;

import com.simplevat.entity.Mail;
import com.simplevat.entity.MailEnum;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.text.StrSubstitutor;

import java.util.HashMap;
import java.util.Map;

public final class MailPreparer {

	private static final String USER_PLACEHOLDER = "user";
	private static final String NEW_PASSWORD = "newPassword";

	public static String resolveTemplate(String content, Map<String, String> templateVars) {
		if (StringUtils.isEmpty(content)) {
			return content;
		}
		StrSubstitutor contentSubstitutor = new StrSubstitutor(templateVars, "${", "}");
		return contentSubstitutor.replace(content);
	}

	public static Mail generateForgotPasswordMail(String from, String fromName, String[] receiverMail,
			String receiverName, String newPassword, MailEnum mailEnum) {

		Map<String, String> placeHolders = preparePlaceholders(receiverName, newPassword);
		Mail mail = new Mail();
		mail.setFrom(from);
		mail.setFromName(fromName);
		mail.setTo(receiverMail);
		mail.setSubject(resolveTemplate(mailEnum.getSubject(), placeHolders));
		mail.setBody(resolveTemplate(mailEnum.getBody(), placeHolders));
		return mail;
	}

	private static Map<String, String> preparePlaceholders(String toName, String newPassword) {
		Map<String, String> placeHolders = new HashMap<>();
		placeHolders.put(USER_PLACEHOLDER, toName);
		placeHolders.put(NEW_PASSWORD, newPassword);
		return placeHolders;
	}

	private MailPreparer() {
	}
}
