package com.simpleaccounts.utils;

import com.simpleaccounts.constant.ErrorConstant;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.service.ConfigurationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.simpleaccounts.constant.EmailConstant;

import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.PasswordAuthentication;
import javax.mail.Message;
import javax.mail.Transport;

import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.util.Properties;

/**
 *
 * @author S@urabh
 */
	@Component
	@SuppressWarnings("java:S115")
	@RequiredArgsConstructor
public class EmailSender {

	private final Logger logger = LoggerFactory.getLogger(EmailSender.class);
	private final ConfigurationService configurationService;
	private final Environment env;
	public void send(String recipients, String subject, String content, String fromEmail,String fromName,  boolean html)
			throws MessagingException {
		MailConfigurationModel mailDefaultConfigurationModel = MailUtility
				.getEMailConfigurationList(configurationService.getConfigurationList());
		final String username = mailDefaultConfigurationModel.getMailusername() != null ? mailDefaultConfigurationModel.getMailusername()
				: System.getenv("SIMPLEACCOUNTS_SMTP_USER");
		final String password = mailDefaultConfigurationModel.getMailpassword() != null ? mailDefaultConfigurationModel.getMailpassword()
				: System.getenv("SIMPLEACCOUNTS_SMTP_PASS");
		Properties prop = new Properties();
		prop.put("mail.smtp.host", mailDefaultConfigurationModel.getMailhost() != null ? mailDefaultConfigurationModel.getMailhost()
				: System.getenv("SIMPLEACCOUNTS_SMTP_HOST"));
			prop.put("mail.smtp.port", mailDefaultConfigurationModel.getMailport() != null ? mailDefaultConfigurationModel.getMailport()
					: System.getenv("SIMPLEACCOUNTS_SMTP_PORT"));
			prop.put("mail.smtp.auth", mailDefaultConfigurationModel.getMailsmtpAuth() != null ? mailDefaultConfigurationModel.getMailsmtpAuth()
					: System.getenv("SIMPLEACCOUNTS_SMTP_AUTH"));
	//		prop.put("mail.smtp.socketFactory.port", "465");
			prop.put("mail.smtp.starttls.enable", mailDefaultConfigurationModel.getMailstmpStartTLSEnable() != null ? mailDefaultConfigurationModel.getMailstmpStartTLSEnable()
					: System.getenv("SIMPLEACCOUNTS_SMTP_STARTTLS_ENABLE"));
			prop.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
			prop.put("mail.smtp.ssl.checkserveridentity", "true");

		Session session;
		session = Session.getInstance(prop, new javax.mail.Authenticator() {
			protected PasswordAuthentication getPasswordAuthentication() {
				return new PasswordAuthentication(username, password);
			}
		});

		try {
			Message message = new MimeMessage(session);
			InternetAddress internetAddress=new InternetAddress();
			internetAddress.setAddress(fromEmail);
			internetAddress.setPersonal(fromName);
			message.setFrom(internetAddress);
			message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipients));
			message.setSubject(subject);
			if (!html) {
				message.setText(content);
				} else {
					message.setContent(content, "text/html");
				}
				Transport.send(message);
			} catch (MessagingException e) {
				logger.error(ErrorConstant.ERROR, e);
			} catch (UnsupportedEncodingException e) {
				logger.error("Error sending email", e);
		}
	}

	public final static String RESET_PASSWORD = "<!DOCTYPE html>\n" +
			"<html>\n" +
			"   <head>\n" +
			"      <title>Embedded Style Sheet</title>\n" +
			"      <style>\n" +
			"         .outer {\n" +
			"         width: 600px;\n" +
			"         height: auto;\n" +
			"         margin: 50px auto;\n" +
			"\t\tpadding-top:10px;\n" +
			"\t\tpadding-bottom:10px;\n" +
			"         background-color: #f8f8ff;\n" +
			"         border-radius:30px;\n" +
			"         }\n" +
			"         .center {\n" +
			"         font-size:40px;\n" +
			"         text-align: center;\n" +
			"         color:#1f65d7;\n" +
			"         }\n" +
			"         .left{\n" +
			"         font-size:20px;\n" +
			"         text-align:left;\n" +
			"         }\n" +
			"         .upper{\n" +
			"         text-align:center;\n" +
			"         }\n" +
			"      </style>\n" +
			"   </head>\n" +
			"   <body>\n" +
			"      <div class=\"outer\">\n" +
			"         <div class=\"upper\">\n" +
			"            <img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/03/SimpleAccounts-03-e1614669064808.png \"height=\"100\" width=\"350\">\n" +
			"         </div>\n" +
			"\t\t <div align= \"center \" >\n" +
			"\t\t <h1 style= \"margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px; \">Reset Your Password</h1> \n" +
			"\t\t </div>\n" +
			"         <div style=\"max-width:560px; margin:auto; padding:0 5%\">\n" +
			"            <div style=\"padding:30px 0; color:#000000; line-height:1.7; font-size:17px; font-family: Arial, Helvetica, sans-serif; border-top:1px solid #1f65d7\">\n" +
			"               <p style= \"margin: 0; \"> Hi {UserName} ! " +
			"										<br/> We have received a request to reset the password of your account. Let us guide you to reset your password in few clicks.</p> \n" +
			"            </div>\n" +
			"            <div align= \"center \"  style= \"border-radius: 6px;background-color:#1a82e2;margin-left:20%;margin-right:20%;width:60%\">\n" +
			"           <a href= \"LINK\" target= \"_blank \" style= \"display: inline-block; padding: 16px 36px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px; \">Click here to reset your password !</a> \n" +
			"          </div>\n" +
			"          <div align= \"center \"  style= \"border-radius: 6px;margin-top:10px\">\n" +
			"            <p style= \"margin: 0; \">If that doesn't work, copy and paste the following link in your browser:</p> \n" +
			"          </div>\n" +
			"          <div  align= \"center \"  style= \"border-radius: 6px;margin-top:25px;margin-bottom:25px;\">\n" +
			"           <p style= \"margin: 0; \"><a href= \"LINK\" target= \"_blank \">LINK</a></p> \n" +
			"\t\t  </div>\n" +
			"            <div class=\"center\"  style=\"width:auto;font-size:16px;background-color:#113964; border-radius:10px;\">\n" +
			"               <br>\n" +
			"               <a style=\"color:#ffffff\" href= \"https://www.simpleaccounts.io/about-us/\">About Us</a>\n" +
			"               &nbsp; &nbsp;\n" +
			"               <a style=\"color:#ffffff\" href= \"https://www.simpleaccounts.io/contacts/\">Contact Us</a>\n" +
			"               &nbsp; &nbsp;\n" +
			"               <a style=\"color:#ffffff\" href= \"https://www.simpleaccounts.io/privacy-policy/\">Privacy Policy</a>\n" +
			"               <br><br>\n" +
			"               <div id=\"softlab_soc_icon_wrap_60fc08a430bad\" class=\"softlab_module_social aleft with_bg add_box_shadow\" style=\"margin-left:-6px; margin-right:-6px;\">\n" +
			"                  <a id=\"soc_icon_60fc08a430be81\" href=\"https://twitter.com/SimpleAccounts_\" title=\"Twitter\"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Twitter-original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";>\n" +
			"                  </a>\n" +
			"                  <a href= \"https://www.facebook.com/simpleAccounts/\"  title= \"Facebook \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Facebook-original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a>\n" +
			"                  <a  href= \"https://www.linkedin.com/company/simpleaccounts\"  title= \"linkedin \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/LinkedIn-Original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a>\n" +
			"                  <a  href= \"https://www.youtube.com/channel/UC_0Riyw8jQ--UW-A7oXtlKw\"  title= \"Youtube \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Youtube-original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a>\n" +
			"                  <a href= \"https://www.instagram.com/simpleaccounts_/\"  title= \"Instagram \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Instagram-original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a>\n" +
			"               </div>\n" +
			"               <br>\n" +
			"               <p style=\"color:#ffffff\" >\n" +
			"                  Copyright © 2023  <a style= \"font-weight:bold;color:#ffffff\"  href= \"https://www.simpleaccounts.io/\">SimpleAccounts</a> All Rights Reserved. \n" +
			"               </p>\n" +
			"               <br>\n" +
			"            </div>\n" +
			"         </div>\n" +
			"      </div>\n" +
			"   </body>\n" +
			"</html>";

	public final static String NEW_PASSWORD = "<!DOCTYPE html>\n" +
			"<html>\n" +
			"<head>\n" +
			"  <title>Embedded Style Sheet</title>\n" +
			"  <style>\n" +
			"        .outer {\n" +
			"            width: 600px;\n" +
			"            height: 720px;\n" +
			"            margin: 50px auto;\n" +
			"            padding-top: 50px;\n" +
			"            background-color: #f8f8ff;\n" +
			"          border-radius:30px;\n" +
			"        }\n" +
			"         \n" +
			".center {\n" +
			" \n" +
			"font-size:40px;\n" +
			"text-align: center;\n" +
			" color:#1f65d7;\n" +
			"}\n" +
			"          .left{\n" +
			"            font-size:20px;\n" +
			"            text-align:left;\n" +
			"            \n" +
			"          }\n" +
			"          \n" +
			"          .upper{\n" +
			"             text-align:center;\n" +
			"          }\n" +
			"       \n" +
			"        </style>\n" +
			"</head>\n" +
			"<body>\n" +
			"\n" +
			"\n" +
			"<div class=\"outer\">\n" +
			"\n" +
			"  <div class=\"center\">\n" +
			"      <img src= \"https://res.cloudinary.com/dn4vn7lyg/image/upload/v1689774455/Simple_Accounts_logo_71a4ad6ad0.png \" alt= \"Logo \" width= \"60% \" >  \n" +
			"  </div>\n" +
			"  <div style=\"max-width:560px; margin:auto; padding:0 5%;background-color: ghostwhite;\">\n" +
			" <table border= \"0 \" cellpadding= \"0 \" cellspacing= \"0 \" width= \"100% \"align= \"center\"> \n" +
			"\t\t\t   <tr>   \n" +
			"\t\t\t      <td align= \"center\" >   \n" +
			"\t\t\t       <table border= \"0 \" cellpadding= \"0 \" cellspacing= \"0 \" width= \"100% \" style= \"max-width: 600px; \">   \n" +
			"\t\t\t         <tr>   \n" +
			"\t\t\t            <td bgcolor= \"ghostwhite \" style= \"padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf; \">   \n" +
			"\n" +
			"\t\t\t            </td>   \n" +
			"\t\t\t         </tr>   \n" +
			"\t\t\t       </table>   \n" +
			"\t\t\t       \n" +
			"\t\t\t      </td>   \n" +
			"\t\t\t    </tr>   \n" +
			"\t\t\t  \n" +
			"\t\t\t    <tr>   \n" +
			"\t\t\t      <td  >   \n" +
			"\t\t\t     \n" +
			"\t\t\t        <table border= \"0 \" cellpadding= \"0 \" cellspacing= \"0 \" width= \"100% \" style= \"max-width: 600px; \">   \n" +
			"\t\t\t   \n" +
			"\t\t\t        \n" +
			"\t\t\t          <tr>   \n" +
			"\t\t\t            <td bgcolor= \"ghostwhite \" style= \"padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; \">   \n" +
			"\t\t\t              <p style= \"margin: 0; \">\n" +
			"  Hi {UserName} !<br/> <br/>" +
			"{SenderName} has invited you to use SimpleAccounts to collaborate with them. Use the button below to set your password and get started:  </p>   \n" +
			"\t\t\t            </td>   \n" +
			"\t\t\t          </tr>   \n" +
			"\t\t\t          \n" +
			"\t\t\t          <tr>   \n" +
			"\t\t\t            <td align= \"center\" bgcolor= \"ghostwhite \">   \n" +
			"\t\t\t              <table border= \"0 \" cellpadding= \"0 \" cellspacing= \"0 \" width= \"51% \" align= \"center\">  \n" +
			"\t\t\t                <tr>   \n" +
			"\t\t\t                  <td align= \"center \" bgcolor= \"ghostwhite\" style= \"padding: 12px; \">  \n" +
			"\t\t\t                    <table border= \"0 \" cellpadding= \"0 \" cellspacing= \"0 \">   \n" +
			"\t\t\t                      <tr>  \n" +
			" <td align= \"center \" bgcolor= \"#1a82e2 \">   \n" +
			"\t\t\t                         \n" +
			"\t\t\t                        </td> \t\t\t\t\t\t\t\t  \n" +
			"\t\t\t                        <td align= \"center \" bgcolor= \"#1a82e2 \" style= \"border-radius: 6px; \">   \n" +
			"\t\t\t                          <a href= \"LINK\" target= \"_blank \" style= \"display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px; \">Click to Create Password</a>   \n" +
			"\t\t\t                        </td>   \n" +
			"\t\t\t                      </tr>   \n" +
			"\t\t\t                    </table>   \n" +
			"\t\t\t                  </td>   \n" +
			"\t\t\t                </tr>   \n" +
			"\t\t\t              </table>   \n" +
			"\t\t\t            </td>   \n" +
			"\t\t\t          </tr>   \n" +
			"\t\t\t      \n" +
			"\t\t\t          <tr>   \n" +
			"\t\t\t            <td align= \"center\" bgcolor= \"ghostwhite\" style= \"padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; \">   \n" +
			"\t\t\t              <p style= \"margin: 0; \">If that doesn't work, copy and paste the following link in your browser:</p>   \n" +
			"\t\t\t              <p style= \"margin: 0; \"><a href= \"LINK\" target= \"_blank \">LINK</a></p>   \n" +
			"\t\t\t            </td>   \n" +
			"\t\t\t          </tr>   \n" +
			"\t\t\t         \n" +
			"\t\t\t   \n" +
			"\t\t\t        </table>   \n" +
			"\t\t\t     \n" +
			"\t\t\t      </td>   \n" +
			"\t\t\t    </tr>   \n" +
			"\t\t\t   \n" +
			"\t\t\t   \n" +
			"\t\t\t  </table>   \n" +
			"\n" +
			"\n" +
			"    <div class=\"center\"  style=\"width:auto;font-size:16px;background-color:#113964; border-radius:10px;margin:10px\">\n" +
			"\n" +
			"      <br>\n" +
			"      <a style=\"color:#ffffff\" href= \"https://www.simpleaccounts.io/about-us/\">About Us</a>\n" +
			"      &nbsp; &nbsp;\n" +
			"      <a style=\"color:#ffffff\" href= \"https://www.simpleaccounts.io/contacts/\">Contact Us</a>\n" +
			"      &nbsp; &nbsp;\n" +
			"      <a style=\"color:#ffffff\" href= \"https://www.simpleaccounts.io/privacy-policy/\">Privacy Policy</a>\n" +
			"      <br><br>\n" +
			"      <div id=\"softlab_soc_icon_wrap_60fc08a430bad\" class=\"softlab_module_social aleft with_bg add_box_shadow\" style=\"margin-left:-6px; margin-right:-6px;\">\n" +
			"        <a id=\"soc_icon_60fc08a430be81\" href=\"https://twitter.com/SimpleAccounts_\" title=\"Twitter\"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Twitter-original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";>\n" +
			"        </a>\n" +
			"        <a href= \"https://www.facebook.com/simpleAccounts/\"  title= \"Facebook \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Facebook-original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a>\n" +
			"        <a  href= \"https://www.linkedin.com/company/simpleaccounts\"  title= \"linkedin \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/LinkedIn-Original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a>\n" +
			"\n" +
			"        <a  href= \"https://www.youtube.com/channel/UC_0Riyw8jQ--UW-A7oXtlKw\"  title= \"Youtube \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Youtube-original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a>\n" +
			"\n" +
			"        <a href= \"https://www.instagram.com/simpleaccounts_/\"  title= \"Instagram \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Instagram-original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a>\n" +
			"\n" +
			"\n" +
			"      </div>\n" +
			"      <br>\n" +
			"      <p style=\"color:#ffffff\" >\n" +
			"        Copyright © 2023  <a style= \"font-weight:bold;color:#ffffff\"  href= \"https://www.simpleaccounts.io/\">SimpleAccounts</a> All Rights Reserved. </p>\n" +
			"      <br>\n" +
			"    </div>\n" +
			"\t\n" +
			"  </div>\n" +
			"</div>\n" +
			"\n" +
			"</body>\n" +
			"</html>";

	public final static String NEW_USER =
			"<!DOCTYPE html>\n" +
					"<html ><head>\n" +
					"    <title>SimpleAccounts Welcome Email</title><style type=\"text/css\">\n" +
					"  @import url(https://fonts.googleapis.com/css?family=Droid+Sans);\n" +
					"img {\n" +
					"    max-width: 600px;\n" +
					"    outline: none;\n" +
					"    text-decoration: none;\n" +
					"    -ms-interpolation-mode: bicubic;\n" +
					"  }\n" +
					"  a {\n" +
					"    text-decoration: none;\n" +
					"    border: 0;\n" +
					"    outline: none;\n" +
					"    color: #bbbbbb;\n" +
					"  }\n" +
					"\n" +
					"  a img {\n" +
					"    border: none;\n" +
					"  }\n" +
					"td, h1, h2, h3  {\n" +
					"    font-family:Roboto,RobotoDraft,Helvetica,Arial,sans-serif;\n" +
					"    font-weight: 500;\n" +
					"  }\n" +
					" td {\n" +
					"    text-align: center;\n" +
					"  }\n" +
					" body {\n" +
					"    -webkit-font-smoothing:antialiased;\n" +
					"    -webkit-text-size-adjust:none;\n" +
					"    width: 100%;\n" +
					"    height: 80%;\n" +
					"    color: #37302d;\n" +
					"    background: #ffffff;\n" +
					"    font-size: 16px;\n" +
					"  }\n" +
					" table {\n" +
					"    border-collapse: collapse !important;\n" +
					"  }\n" +
					"  .headline {\n" +
					"    color:#004080;\n" +
					"    font-size: 30px;\n" +
					"  }\n" +
					".force-full-width {\n" +
					"  width: 100% !important;\n" +
					" }\n" +
					" .p{\n" +
					"    font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif !important;\n" +
					"    font-size:16px;\n" +
					"    }\n" +
					"  </style><style media=\"screen\" type=\"text/css\">\n" +
					"      @media screen {\n" +
					"         \n" +
					"        td, h1, h2, h3 {\n" +
					"          font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif !important;\n" +
					"        }\n" +
					"      }\n" +
					"  </style><style media=\"only screen and (max-width: 480px)\" type=\"text/css\">\n" +
					"    /* Mobile styles */\n" +
					"    @media only screen and (max-width: 480px) {\n" +
					"     table[class=\"w320\"] {\n" +
					"        width: 260px !important;\n" +
					"      }\n" +
					"}\n" +
					"  </style><style type=\"text/css\"></style></head><body bgcolor=\"#ffffff\" class=\"body\" style=\"padding:0; margin:0; display:block; background:#ffffff; -webkit-text-size-adjust:none\">\n" +
					"<table align=\"center\" cellpadding=\"0\" cellspacing=\"0\" height=\"100%\" width=\"100%\">\n" +
					"<tbody><tr>\n" +
					"<td align=\"center\" bgcolor=\"#ffffff\" class=\"\" valign=\"top\" width=\"100%\">\n" +
					"<center><table cellpadding=\"0\" cellspacing=\"0\" class=\"w320\" style=\"margin: 0 auto;\" width=\"600\">\n" +
					"<tbody><tr>\n" +
					"<td align=\"center\"  valign=\"top\"><table cellpadding=\"0\" cellspacing=\"0\" style=\"margin: 0 auto;\" width=\"100%\">\n" +
					"<tbody><tr>\n" +
					"<td style=\"font-size: 30px; text-align:center;\"></td>\n" +
					"</tr>\n" +
					"</tbody></table>\n" +
					"<table bgcolor=\"#e0eaf6\" cellpadding=\"0\" cellspacing=\"0\" class=\"\" style=\"margin: 0 auto;\" width=\"90%\" height=\"50px\">\n" +
					"<tbody><tr>\n" +
					"<td><br>\n" +
					"  <img class=\"default_logo\" src=\"https://www.simpleaccounts.io/wp-content/uploads/2021/03/SimpleAccounts-03-e1614669064808.png\" alt=\"SimpleAccounts-Logo\" height=\"120\"  width=\"430\">\n" +
					"<br></td>\n" +
					"</tr>\n" +
					"  <tr><td class=\"headline\"><b>Welcome {userName} !</b></td></tr>\n" +
					"  <tr><td><br><b>Email :</b> {userEmail}</td></tr>\n" +
					"  <tr><td><br><b>Password :</b> {password}</td></tr>\n" +
					"<tr>\n" +
					"<td>\n" +
					"<center><table cellpadding=\"0\" cellspacing=\"0\" style=\"margin: 0 auto;\" width=\"75%\"><tbody><tr>\n" +
					"<td style=\"color:#003366;\"><br><hr><br>\n" +
					"We're delighted to have you on board\n" +
					"<br><br>\n" +
					" SimpleAccounts all-in-one accounting software\n" +
					"  <br>\n" +
					"  <br>\n" +
					"  <tr>\n" +
					"                                                            <td align=\"center\" class=\"button\">\n" +
					"                                                            <table align=\"center\" cellpadding=\"0\" cellspacing=\"0\" width=\"200\">\n" +
					"                                                                <tbody>\n" +
					"                                                                    <tr>\n" +
					"                                                                        <td align=\"center\" bgcolor=\" #2064d8\" class=\"cta\" height=\"40\" style=\"border-radius:20px;  width=\"180\"><a href={loginUrl}\n" +
					" style=\"font-family:Lato, Arial, sans-serif, Trebuchet MS; font-size:14px; line-height:38px; color:#ffffff; text-align: center; text-decoration: none !important; padding-bottom:1px; width:100%; font-weight:bold; display:inline-block\" target=\"_blank\"><span style=\"color: #ffffff\">Login</span></a></td>\n" +
					"                                                                    </tr>\n" +
					"                                                                    <tr>\n" +
					"    <td class=\"\" ><br>Our technical supporting team will assist you with anything you need </td>\n" +
					"  </tr>\n" +
					"\n" +
					"  <tr>\n" +
					"<td>\n" +
					"<center><table cellpadding=\"0\" cellspacing=\"0\" style=\"margin: 0 auto;\" width=\"75%\"><tbody><tr>\n" +
					"<td style=\"color:#003366;\">  <tr>\n" +
					"                                                            <td align=\"center\" class=\"button\">\n" +
					"                                                            <table align=\"center\" cellpadding=\"0\" cellspacing=\"0\" width=\"200\">\n" +
					"                                                                <tbody>\n" +
					"                                                                    <tr>\n" +
					"\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<br>                 <br>\n" +
					"\n" +
					"                                                                        <td align=\"center\" bgcolor=\"#00cc99\" class=\"cta\" height=\"40\" style=\"border-radius:20px; width=\"180\"><a href=\"https://www.simpleaccounts.io/\" \n" +
					" style=\"font-family:Lato, Arial, sans-serif, Trebuchet MS; font-size:14px; line-height:38px; color:#ffffff; text-align: center; text-decoration: none !important; padding-bottom:1px; width:100%; font-weight:bold; display:inline-block\" target=\"_blank\"><span style=\"color: #ffffff\">Need Any Help?</span></a></td>\n" +
					"                                                                    </tr>\n" +
					"                                                                </tbody>\n" +
					"                                                            </table>\n" +
					"                                                            </td>\n" +
					"                                                        </tr>\n" +
					"                                                    </td>\n" +
					"                                                  </tr>\n" +
					"</td>\n" +
					"</tr>\n" +
					"</tbody></table></center>\n" +
					"</td>\n" +
					"</tr>\n" +
					"  \n" +
					"                                                                </tbody>\n" +
					"                                                            </table>\n" +
					"                                                            </td>\n" +
					"                                                        </tr>\n" +
					"<tr>\n" +
					"<td>\n" +
					"<br>\n" +
					"<br>\n" +
					"</td>\n" +
					"</tr>\n" +
					"</tbody></table>\n" +
					"<table bgcolor=\"#113964\" cellpadding=\"0\" cellspacing=\"0\" class=\"force-full-width\" style=\"margin: 0 auto;\">\n" +
					"<tbody><tr><td style=\"background-color:#ccccff;\"></td></tr>\n" +
					"<tr>\n" +
					"<td style=\"color:#bbbbbb; font-size:12px;\"></td>\n" +
					"</tr>\n" +
					"<tr>\n" +
					" <td style=\"color:#bbbbbb; font-size:12px;\"><br>\n" +
					"<br>\n" +
					"<a href= \"https://www.simpleaccounts.io/about-us/\">About Us</a>  \n" +
					"\t\t\t\t\t&nbsp; &nbsp;  \n" +
					"\t\t\t\t\t<a href= \"https://www.simpleaccounts.io/contacts/\">Contact Us</a> \n" +
					"\t\t\t\t\t&nbsp; &nbsp;  \n" +
					"\t\t\t\t\t<a href= \"https://www.simpleaccounts.io/privacy-policy/\">Privacy Policy</a> \n" +
					"<br><br>\n" +
					"<div id=\"softlab_soc_icon_wrap_60fc08a430bad\" class=\"softlab_module_social aleft with_bg add_box_shadow\" style=\"margin-left:-6px; margin-right:-6px;\">\n" +
					"   <a id=\"soc_icon_60fc08a430be81\" href=\"https://twitter.com/SimpleAccounts_ \" title=\"Twitter\"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Twitter-original.png\" style= \"font-size:12px; width:26px; height:26px; line-height:26px; margin-left:6px; margin-right:6px; margin-bottom:6px \";> \n" +
					"  </a>\n" +
					"  <a href= \"https://www.facebook.com/simpleAccounts/\"  title= \"Facebook \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Facebook-original.png\" style= \"font-size:12px; width:26px; height:26px; line-height:26px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a> \n" +
					"    <a  href= \"https://www.linkedin.com/company/simpleaccounts\"  title= \"linkedin \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/LinkedIn-Original.png\" style= \"font-size:12px; width:26px; height:26px; line-height:26px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a> \n" +
					"\t\t\t\t\t \n" +
					"\t\t\t\t\t  <a  href= \"https://www.youtube.com/channel/UC_0Riyw8jQ--UW-A7oXtlKw\"  title= \"Youtube \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Youtube-original.png\" style= \"font-size:12px; width:26px; height:26px; line-height:26px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a> \n" +
					"\t\t\t\t\t \n" +
					"\t\t\t\t\t  <a href= \"https://www.instagram.com/simpleaccounts_/\"  title= \"Instagram \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Instagram-original.png\" style= \"font-size:12px; width:26px; height:26px; line-height:26px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a> \n" +
					"\n" +
					" </div>\n" +
					"<br>\n" +
					"  <br>\n" +
					"Copyright © 2023  <a style= \"font-weight:bold; font-color:#ffffff\"  href= \"https://www.simpleaccounts.io/\">SimpleAccounts</a> All Rights Reserved. \n" +
					"<br>\n" +
					"<br></td>\n" +
					"</tr>\n" +
					"</tbody></table></td>\n" +
					"</tr>\n" +
					"</tbody></table></center>\n" +
					"</td>\n" +
					"</tr>\n" +
					"</tbody></table>\n" +
					"</body></html>";
	public final static String THANK_YOU_MAIL_BODY ="<!DOCTYPE html>\n" +
			"<html>\n" +
			"    <head>\n" +
			"        <title>Embedded Style Sheet</title>\n" +
			"        <style>\n" +
			"        .outer {\n" +
			"            width: 600px;\n" +
			"            height: 720px;\n" +
			"            margin: 50px auto;\n" +
			"            padding-top: 50px;\n" +
			"            background-color: #f8f8ff;\n" +
			"          border-radius:30px;\n" +
			"        }\n" +
			"         \n" +
			".center {\n" +
			" \n" +
			"font-size:40px;\n" +
			"text-align: center;\n" +
			" color:#1f65d7;\n" +
			"}\n" +
			"          .left{\n" +
			"            font-size:20px;\n" +
			"            text-align:left;\n" +
			"            \n" +
			"          }\n" +
			"          \n" +
			"          .upper{\n" +
			"             text-align:center;\n" +
			"          }\n" +
			"       \n" +
			"        </style>\n" +
			"    </head>\n" +
			"    <body>\n" +
			"      \n" +
			"      \n" +
			"        <div class=\"outer\">\n" +
			"      <div class=\"upper\">\n" +
			"            <img src='{companylogo}'style=\"width:120px;height:80px\">\n" +
			"          </div>\n" +
			"         <div class=\"center\">\n" +
			"           <p><b>Payment{paymode}</b></p>\n" +
			"</div>\n" +
			"            <div style=\"max-width:560px; margin:auto; padding:0 5%\">\n" +
			"\t\t\t<div style=\"padding:30px 0; color:#000000; line-height:1.7; font-size:17px; font-family: Arial, Helvetica, sans-serif; border-top:1px solid #1f65d7\">\n" +
			"\t\t\tDear {name}, <br><br>Thank you for your payment. We appreciate your promptness in making payments. We do look forward to continue doing business with you!<br></div>\n" +
			"  <div class=\"left\">\n" +
			"           <p>Thank You!</p>\n" +
			"</div>            \n" +
			"<div style=\"padding:3%; border-radius:20px; background: #3678e2; border:1px solid #fff; color:#ffffff\">\n" +
			"<div style=\"padding:0 3% 3%; border-bottom:1px solid #ffffff; text-align:center\">\n" +
			"<h3 style=\"margin-bottom:0;font-family: Helvetica, sans-serif; font-size:17px;\">Payment {paymode}</h3>\n" +
			"<h2 style=\"color:#ffffff; margin-top:10px\">{amount}</h2></div>\n" +
			"<div style=\"margin:auto; max-width:350px; padding:3 % 3% 0\"><p>\n" +
			"<span style=\"width:40%; padding-left:10%;font-family: Helvetica, sans-serif;float:left; font-size:17px\">Invoice No</span>\n" +
			"<span style=\"width:40%; padding-left:10%;font-family: Helvetica, sans-serif;float:left;font-size:17px\"><b>{number}</b>\n" +
			"</span></p>\n" +
			"<p><span style=\"width:40%; padding-left:10%;font-family: Helvetica, sans-serif; float:left;font-size:17px\">Payment Date</span>\n" +
			"<span style=\"width:40%;font-family: Helvetica, sans-serif;font-size:17px; padding-left:10%\"><b>{date}</b></span>\n" +
			"</p></div>\n" +
			"</div>\n" +
			"\n" +
			"              <div class=\"center\"  style=\"width:auto;font-size:16px;background-color:#113964; border-radius:10px;margin:10px\">\n" +
			"        \n" +
			"<br>\n" +
			"<a style=\"color:#ffffff\" href= \"https://www.simpleaccounts.io/about-us/\">About Us</a>  \n" +
			"                    &nbsp; &nbsp;  \n" +
			"                    <a style=\"color:#ffffff\" href= \"https://www.simpleaccounts.io/contacts/\">Contact Us</a> \n" +
			"                    &nbsp; &nbsp;  \n" +
			"                    <a style=\"color:#ffffff\" href= \"https://www.simpleaccounts.io/privacy-policy/\">Privacy Policy</a> \n" +
			"<br><br>\n" +
			"<div id=\"softlab_soc_icon_wrap_60fc08a430bad\" class=\"softlab_module_social aleft with_bg add_box_shadow\" style=\"margin-left:-6px; margin-right:-6px;\">\n" +
			"   <a id=\"soc_icon_60fc08a430be81\" href=\"https://twitter.com/SimpleAccounts_ \" title=\"Twitter\"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Twitter-original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";> \n" +
			"  </a>\n" +
			"  <a href= \"https://www.facebook.com/simpleAccounts/\"  title= \"Facebook \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Facebook-original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a> \n" +
			"    <a  href= \"https://www.linkedin.com/company/simpleaccounts\"  title= \"linkedin \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/LinkedIn-Original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a> \n" +
			"                     \n" +
			"                      <a  href= \"https://www.youtube.com/channel/UC_0Riyw8jQ--UW-A7oXtlKw\"  title= \"Youtube \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Youtube-original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a> \n" +
			"                     \n" +
			"                      <a href= \"https://www.instagram.com/simpleaccounts_/\"  title= \"Instagram \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Instagram-original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a> \n" +
			"\n" +
			"\n" +
			" </div>\n" +
			"<br>\n" +
			"  <p style=\"color:#ffffff\" >\n" +
			"Copyright © 2023  <a style= \"font-weight:bold;color:#ffffff\"  href= \"https://www.simpleaccounts.io/\">SimpleAccounts</a> All Rights Reserved. </p>\n" +
			"<br>\n" +
			" </div>\n" +
			"  </div>\n" +
			" </div>\n" +
			"\n" +
			"    </body>\n" +
			"</html>";

	public final static String invitationmailBody ="<!DOCTYPE html>\n" +
			"<html>\n" +
			"<head>\n" +
			"    <title>Embedded Style Sheet</title>\n" +
			"    <style>\n" +
			"        .outer {\n" +
			"            width: 600px;\n" +
			"            height: 720px;\n" +
			"            margin: 50px auto;\n" +
			"            padding-top: 50px;\n" +
			"            background-color: #f8f8ff;\n" +
			"            border-radius:30px;\n" +
			"            padding-bottom: 120px;\n"+
			"        }\n" +
			"\n" +
			"        .center {\n" +
			"\n" +
			"            font-size:40px;\n" +
			"            text-align: center;\n" +
			"            color:#1f65d7;\n" +
			"        }\n" +
			"        .left{\n" +
			"            font-size:20px;\n" +
			"            text-align:left;\n" +
			"\n" +
			"        }\n" +
			"\n" +
			"        .upper{\n" +
			"            text-align:center;\n" +
			"        }\n" +
			"\n" +
			"    </style>\n" +
			"</head>\n" +
			"<body>\n" +
			"\n" +
			"\n" +
			"<div class=\"outer\">\n" +
			"    <div class=\"upper\">\n" +
			"        <img src=\"https://www.simpleaccounts.io/wp-content/uploads/2021/03/SimpleAccounts-03-e1614669064808.png\" alt= \"Logo \" width= \"60% \">\n" +
			"    </div>\n" +
			"\n" +
			"    <div style=\"max-width:560px; margin:auto; padding:0 5%\">\n" +
			"        <div style=\"padding:30px 0; color:#000000; line-height:1.7; font-size:17px; font-family: Arial, Helvetica, sans-serif; border-top:1px solid #1f65d7\">\n" +
			"            Hi {name}, <br><br>Welcome to SimpleAccounts!<br><br>\n" +
			"            Thank you for joining us. Now you can manage all your accounting-related matters with ease.<br><br>\n" +
			"            Click on the link below to get started - <br>\n" +
			"           <a href=\"https://www.simpleaccounts.io/\">https://www.simpleaccounts.io/</a> <br><br>\n" +
			"            If you have any queries, feel free to contact us anytime on -<br>\n" +
			"            <b>Email :</b> <a href=\"info@simpleaccounts.io\">info@simpleaccounts.io</a> <br>\n" +
			"            <b>Phone : +971(0) 565 610 010</b>\n" +
			"\n" +
			"            <br></div>\n" +
			"        <div class=\"left\">\n" +
			"            <p>Thank You!</p>\n" +
			"        </div>\n" +
			"\n" +
			"        <div class=\"center\"  style=\"width:auto;font-size:16px;background-color:#113964; border-radius:10px;margin:10px\">\n" +
			"\n" +
			"            <br>\n" +
			"            <a style=\"color:#ffffff\" href= \"https://www.simpleaccounts.io/about-us/\">About Us</a>\n" +
			"            &nbsp; &nbsp;\n" +
			"            <a style=\"color:#ffffff\" href= \"https://www.simpleaccounts.io/contacts/\">Contact Us</a>\n" +
			"            &nbsp; &nbsp;\n" +
			"            <a style=\"color:#ffffff\" href= \"https://www.simpleaccounts.io/privacy-policy/\">Privacy Policy</a>\n" +
			"            <br><br>\n" +
			"            <div id=\"softlab_soc_icon_wrap_60fc08a430bad\" class=\"softlab_module_social aleft with_bg add_box_shadow\" style=\"margin-left:-6px; margin-right:-6px;\">\n" +
			"                <a id=\"soc_icon_60fc08a430be81\" href=\"https://twitter.com/SimpleAccounts_\" title=\"Twitter\"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Twitter-original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";>\n" +
			"                </a>\n" +
			"                <a href= \"https://www.facebook.com/simpleAccounts/\"  title= \"Facebook \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Facebook-original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a>\n" +
			"                <a  href= \"https://www.linkedin.com/company/simpleaccounts\"  title= \"linkedin \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/LinkedIn-Original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a>\n" +
			"\n" +
			"                <a  href= \"https://www.youtube.com/channel/UC_0Riyw8jQ--UW-A7oXtlKw\"  title= \"Youtube \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Youtube-original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a>\n" +
			"\n" +
			"                <a href= \"https://www.instagram.com/simpleaccounts_/\"  title= \"Instagram \"><img src= \"https://www.simpleaccounts.io/wp-content/uploads/2021/07/Instagram-original.png\" style= \"font-size:12px; width:30px; height:30px; line-height:30px; margin-left:6px; margin-right:6px; margin-bottom:6px \";></a>\n" +
			"\n" +
			"\n" +
			"            </div>\n" +
			"            <br>\n" +
			"            <p style=\"color:#ffffff\" >\n" +
			"                Copyright © 2023  <a style= \"font-weight:bold;color:#ffffff\"  href= \"https://www.simpleaccounts.io/\">SimpleAccounts</a> All Rights Reserved. </p>\n" +
			"            <br>\n" +
			"        </div>\n" +
			"    </div>\n" +
			"</div>\n" +
			"\n" +
			"</body>\n" +
			"</html>";
}
