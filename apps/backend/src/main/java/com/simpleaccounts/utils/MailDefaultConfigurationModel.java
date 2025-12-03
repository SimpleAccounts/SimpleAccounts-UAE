/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.utils;

import java.io.Serializable;
import lombok.Data;

/**
 *
 * @author h
 */
@Data
public class MailDefaultConfigurationModel implements Serializable {

    String mailhost = System.getenv("SIMPLEACCOUNTS_SMTP_HOST");
    String mailport = System.getenv("SIMPLEACCOUNTS_SMTP_PORT");
    String mailusername = System.getenv("SIMPLEACCOUNTS_SMTP_USER");
    String mailpassword = System.getenv("SIMPLEACCOUNTS_SMTP_PASS");
    String mailsmtpAuth = System.getenv("SIMPLEACCOUNTS_SMTP_AUTH");
    String mailstmpStartTLSEnable = System.getenv("SIMPLEACCOUNTS_SMTP_STARTTLS_ENABLE");
}
