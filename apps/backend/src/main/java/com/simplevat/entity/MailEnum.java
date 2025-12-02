package com.simplevat.entity;

import com.simplevat.constant.CommonColumnConstants;

public enum MailEnum {


    FORGOT_PASSWORD("Forgot your password? Don't worry",
            "<p>Dear ${user},</p><br/><p> Your password is reset successfully, your new password is : <pre>${newPassword}</pre> </p> <br/> Thank you."),
    SIGN_UP_VERIFICATION(CommonColumnConstants.WELCOME_TO_SIMPLEACCOUNTS,
            "<p>Dear ${user},</p><br/><p>Thank you for joining us at SimpleAccounts. </p> <br/> Thank you."),
    INVOICE_PDF(CommonColumnConstants.WELCOME_TO_SIMPLEACCOUNTS,
            "<p>Dear ${user},</p><br/><p>Please pay your bill. </p> <br/> Thank you."),
    NEW_USER_CREATED(CommonColumnConstants.WELCOME_TO_SIMPLEACCOUNTS,
            "<p>Dear ${user},</p><br/><p>Your user account created successfully </p> <br/> Thank you.");

    private String subject;
    private String body;

    MailEnum(String subject, String body) {
        this.subject = subject;
        this.body = body;
    }

    public String getSubject() {
        return subject;
    }

    public String getBody() {
        return body;
    }
}
