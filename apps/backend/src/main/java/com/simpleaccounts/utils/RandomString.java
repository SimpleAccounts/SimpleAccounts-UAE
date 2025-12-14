package com.simpleaccounts.utils;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;

@Component
public class RandomString {

	private static final SecureRandom SECURE_RANDOM = new SecureRandom();

	// function to generate a random string of length n
	public String getAlphaNumericString(int n) {

		// chose a Character random from this String
		String alphaNumericString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "0123456789" + "abcdefghijklmnopqrstuvxyz";

		// create StringBuffer size of alphaNumericString
		StringBuilder sb = new StringBuilder(n);

		for (int i = 0; i < n; i++) {

			int index = SECURE_RANDOM.nextInt(alphaNumericString.length());

			// add Character one by one in end of sb
			sb.append(alphaNumericString.charAt(index));
		}

		return sb.toString();
	}
}