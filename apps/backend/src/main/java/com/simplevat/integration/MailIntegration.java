package com.simplevat.integration;

import java.io.File;
import java.util.List;

import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.InputStreamSource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.stereotype.Component;

import com.simplevat.entity.Mail;
import com.simplevat.entity.MailAttachment;

/**
 * Created by Utkarsh Bhavsar on 28/05/17.
 */
@Component
public class MailIntegration {

	private final Logger logger = LoggerFactory.getLogger(MailIntegration.class);

	private static final String UTF_8 = "UTF-8";

	private void sendEmail(final Mail mail, List<MailAttachment> mailAttachmentList, JavaMailSender javaMailSender,
			boolean html){
		MimeMessagePreparator preparator = mimeMessage -> {
			MimeMessageHelper mimeMessagePreparator = new MimeMessageHelper(mimeMessage, true, UTF_8);
			mimeMessagePreparator.setTo(mail.getTo());
			mimeMessagePreparator.setFrom(new InternetAddress(mail.getFrom(), mail.getFromName()));
			if (mail.getBcc() != null) {
				mimeMessagePreparator.setBcc(mail.getBcc());
			}
			if (mail.getCc() != null) {
				mimeMessagePreparator.setCc(mail.getCc());
			}
			mimeMessagePreparator.setText(mail.getBody(), html);
			mimeMessagePreparator.setSubject(mail.getSubject());
			if (mailAttachmentList != null && !mailAttachmentList.isEmpty()) {
				for (MailAttachment mailAttachment : mailAttachmentList) {
					if (mailAttachment.getAttachmentObject() instanceof InputStreamSource) {
						mimeMessagePreparator.addAttachment(mailAttachment.getAttachmentName(),
								(InputStreamSource) mailAttachment.getAttachmentObject());
					}
				}
			}
		};
		javaMailSender.send(preparator);
	}

	private void sendEmail(final Mail mail, JavaMailSender javaMailSender, boolean html) {

		MimeMessagePreparator preparator = mimeMessage -> {
			MimeMessageHelper mimeMessagePreparator = new MimeMessageHelper(mimeMessage, true, UTF_8);
			mimeMessagePreparator.setTo(mail.getTo());
			mimeMessagePreparator.setFrom(new InternetAddress(mail.getFrom(), mail.getFromName()));
			mimeMessagePreparator.setText(mail.getBody(), html);
			mimeMessagePreparator.setSubject(mail.getSubject());
		};
		javaMailSender.send(preparator);
	}

	public void sendHtmlEmail(final MimeMultipart mimeMultipart, final Mail mail, JavaMailSender javaMailSender,boolean isHtml)
	{
		MimeMessagePreparator preparator = mimeMessage -> {
			MimeMessageHelper mimeMessagePreparator = new MimeMessageHelper(mimeMessage, true, UTF_8);
			mimeMessagePreparator.setTo(mail.getTo());
			mimeMessagePreparator.setFrom(new InternetAddress(mail.getFrom(), mail.getFromName()));
			mimeMessagePreparator.setText(mail.getBody(), isHtml);
			mimeMessagePreparator.setSubject(mail.getSubject());
			if (mimeMultipart != null) {
				mimeMessagePreparator.getMimeMessage().setContent(mimeMultipart);
			}
		};
		javaMailSender.send(preparator);
		logger.info("Email send to =" +mail );
	}
	public void sendHtmlEmails(final List<MimeMultipart> mimeMultiparts, final Mail mail, JavaMailSender javaMailSender,boolean isHtml,List<File> attachments) {

		try {

			MimeMessage mimeMessage = javaMailSender.createMimeMessage();

			// use the true flag to indicate you need a multipart message
			MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
			helper.setTo(mail.getTo());
			helper.setFrom(new InternetAddress(mail.getFrom(), mail.getFromName()));
			helper.setText(mail.getBody(), isHtml);
			helper.setSubject(mail.getSubject());
			if(mail.getBcc()!=null)
				helper.setBcc(mail.getBcc());
			if(mail.getCc()!=null)
				helper.setCc(mail.getCc());

			if (mimeMultiparts != null) {
				for (MimeMultipart mimeMultipart : mimeMultiparts) {
					mimeMessage.setContent(mimeMultipart);
				}
			}
			javaMailSender.send(mimeMessage);
		}catch(Exception e){
			e.printStackTrace();
		}
		//javaMailSender.send(preparator);
		logger.info("Email send to =" +mail );
	}
	public void sendHtmlMail(final Mail mail, List<MailAttachment> mailAttachmentList, JavaMailSender javaMailSender)
			{
		sendEmail(mail, mailAttachmentList, javaMailSender, true);
	}

	public void sendHtmlMail(final Mail mail, JavaMailSender javaMailSender){
		sendEmail(mail, javaMailSender, true);
	}
}
