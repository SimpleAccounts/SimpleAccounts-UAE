package com.simplevat.utils;

import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class InvoiceNumberUtil {
    public String fetchSuffixFromString(String stringValue) {
        String specialCharactersString = "!@#$%&*'+,-./:;=?^_`|";
        String string = stringValue.trim();
        String suffix = "";
        for (int i = (string.length() - 1); i >= 0; i--) {
            char chrs = string.charAt(i);
            if ((Character.isAlphabetic(chrs)) || (specialCharactersString.contains(Character.toString(chrs)))){
                break;
            }
            if (Character.isDigit(chrs))
                suffix = chrs + suffix;
        }
        return suffix;
    }

    public String fetchPrefixFromString(String stringValue) {
        String specialCharactersString = "!@#$%&*'+,-./:;=?^_`|";
        String string = stringValue.trim();
        String prefix = "";
        for (int i = (string.length() - 1); i >= 0; i--) {
            char chrs = string.charAt(i);
            if ((Character.isAlphabetic(chrs)) || (specialCharactersString.contains(Character.toString(chrs)))) {
                prefix = chrs + prefix;
            }
        }
        return prefix;
    }
}

