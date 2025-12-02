/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.utils;

import java.io.Serializable;
import lombok.Data;

/**
 *
 * @author h
 */
@Data
public class MailConfigurationModel implements Serializable {
        
    String mailhost;
    String mailport;
    String mailusername;
    String mailpassword;
    String mailsmtpAuth;
    String mailApiKey;
    String mailstmpStartTLSEnable;
 
    
}
