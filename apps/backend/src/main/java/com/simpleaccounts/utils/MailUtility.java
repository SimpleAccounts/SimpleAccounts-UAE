package com.simpleaccounts.utils;

//import com.itextpdf.html2pdf.HtmlConverter;
import lombok.RequiredArgsConstructor;
import com.itextpdf.html2pdf.HtmlConverter;
import com.simpleaccounts.constant.ConfigurationConstants;
import com.simpleaccounts.entity.Configuration;
import com.simpleaccounts.entity.Mail;
import com.simpleaccounts.integration.MailIntegration;
import com.simpleaccounts.rest.MailController.EmailContentModel;
import com.simpleaccounts.service.ConfigurationService;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.OutputStream;
import java.util.*;
import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMultipart;
import javax.mail.util.ByteArrayDataSource;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 * @author h
 */
@Component
@RequiredArgsConstructor
public class MailUtility {
	private static final Logger LOGGER = LoggerFactory.getLogger(MailUtility.class);

	private final MailIntegration MailIntegration;

	private final ConfigurationService configurationService;

	private final Environment env;

	public static final String INVOICE_REFEREBCE_NO = "Invoice_Reference_Number";
	public static final String CN_REFERENCE_NO = "cn_referene_no";
	public static final String INVOICE_DATE = "Invoice_Date";
	public static final String INVOICE_LABEL = "Invoice_Label";
	public static final String INVOICE_DUE_DATE = "Invoice_Due_Date";
	public static final String COMPANY_CITY = "Company_city";
	public static final String EXCHANGE_RATE = "Exchange_Rate";
	public static final String CONTACT_EMAIL = "conatct_email";
	public static final String INVOICE_NAME = "Invoice_Name";
	public static final String COMPANY_REGISTRATION_NO = "companyRegistrationNo";
	public static final String INVOICE_DISCOUNT = "Invoice_Discount";
	public static final String CONTRACT_PO_NUMBER = "contract_Po_Number";
	public static final String CREDIT_NOTE_NUMBER = "Credit_note_number";
	public static final String CONTACT_NAME = "Contact_Name";
	public static final String CREDIT_NOTE_CONTACT_NAME = "CN_Contact_Name";
	public static final String PROJECT_NAME = "Project_Name";
	public static final String INVOICE_AMOUNT = "Invoice_Amount";
	public static final String CN_AMOUNT = "CN_amount";
	public static final String DUE_AMOUNT = "Due_Amount";
	public static final String SENDER_NAME = "Sender_Name";
	public static final String COMPANY_NAME = "Company_Name";
	public static final String SUB_TOTAL = "Sub_Total";
	public static final String CN_SUB_TOTAL = "Cn_Sub_Total";
	public static final String MOBILE_NUMBER = "Mobile_Number";
	public static final String CONTACT_ADDRESS = "Contact_Address";
	public static final String CONTACT_COUNTRY = "contactCountry";
	public static final String CONTACT_STATE = "Contact_State";
	public static final String CONTACT_CITY = "Contact_City";
	public static final String INVOICE_DUE_PERIOD = "Invoice_Due_Period";
	public static final String INVOICE_VAT_AMOUNT = "Invoice_Vat_Amount";
	public static final String CREDIT_NOTE_VAT_AMOUNT = "Credit_Note_Vat_Amount";
	public static final String PRODUCT = "PRODUCT";
	public static final String CN_PRODUCT = "CN_PRODUCT";
	public static final String QUANTITY = "Quantity";
	public static final String CN_QUANTITY = "CN_Quantity";
	public static final String UNIT_TYPE = "unitType";
	public static final String CN_UNIT_TYPE = "Cn_unitType";
	public static final String UNIT_PRICE = "Unit_Price";
	public static final String CN_UNIT_PRICE = "CN_Unit_Price";
	public static final String DISCOUNT = "Discount";
	public static final String CN_DISCOUNT = "CnDiscount";
	public static final String CREDIT_NOTE_DISCOUNT = "CreditNoteDiscount";
	public static final String EXCISE_AMOUNT = "Excise_Amount";
	public static final String CN_EXCISE_AMOUNT = "Cn_Excise_Amount";
	public static final String TOTAL = "Total";
	public static final String CN_TOTAL = "CnTotal";
	public static final String TOTAL_NET = "Total_Net";
	public static final String VAT_TYPE="Vat_Type";
	public static final String CN_VAT_TYPE="Cn_Vat_Type";
	public static final String DESCRIPTION="description";
	public static final String APPLICATION_PDF = "application/pdf";
	public static final String TEXT_HTML = "text/html";
	public static final String CN_DESCRIPTION="Cn_description";
	public static final String  COMPANYLOGO = "companylogo";
	public static final String CURRENCY = "currency";
	public static final String COMPANY_ADDRESS_LINE1 = "companyAddressLine1";
	public static final String COMPANY_ADDRESS_LINE2 = "companyAddressLine2";
	public static final String COMPANY_POST_ZIP_CODE = "companyPostZipCode";
	public static final String COMPANY_COUNTRY_CODE = "companyCountryCode";
	public static final String COMPANY_STATE_REGION = "companyStateRegion";
	public static final String VAT_NUMBER = "vatNumber";
	public static final String COMPANY_MOBILE_NUMBER ="phoneNumber";
	public static final String VAT_REGISTRATION_NUMBER = "vatRegistrationNumber";
	public static final String STATUS ="status";
	public static final String NOTES = "notes";
	public static final String POST_ZIP_CODE ="postZipCode";
	public static final String VAT_ID = "vatCategory";
	public static final String TOTAL_EXCISE_AMOUNT = "totalExciseAmount";
	public static final String CN_TOTAL_EXCISE_AMOUNT = "CntotalExciseAmount";
	public static final String INVOICE_LINEITEM_VAT_AMOUNT = "invoiceLineItemVatAmount";
	public static final String CN_VAT_AMOUNT = "CnVatAmount";
	public static final String INVOICE_REPORT = "Invoice.pdf";
	public static final String PAYSLIP_REPORT = "Payslip.pdf";
	public static final String QUOTATION_REPORT = "Quotation.pdf";
	public static final String CREDIT_NOTE_REPORT = "CreditNote.pdf";
	public static final String INVOICE_LINEITEM_EXCISE_TAX = "invoiceLineItemExciseTax";
	public static final String CN_LINEITEM_EXCISE_TAX = "creditNoteLineItemExciseTax";
	public static final String TAXABLE_AMOUNT = "taxableAmount";
	public static final String TAX_AMOUNT = "taxAmount";
	public static final String CONTACT_ADDRESS_LINE1 = "contactAddressLine1";
	public static final String CONTACT_ADDRESS_LINE2 = "contactAddressLine2";

	public void triggerEmailOnBackground(String subject, String body, MimeMultipart mimeMultipart, String fromEmailId,
			String fromName, String[] toMailAddress, boolean isHtml) {
		Thread t = new Thread(new Runnable() {
			@Override
			public void run() {
				try {
					Mail mail = new Mail();
					mail.setFrom(fromEmailId);
					mail.setFromName(fromName);
					mail.setTo(toMailAddress);
					mail.setSubject(subject);
					mail.setBody(body);

					MimeMultipart mimeMultipart1=new MimeMultipart();
					try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

						byte[] bytes = writePdf(outputStream,body);

						DataSource dataSource = new ByteArrayDataSource(bytes, "APPLICATION_PDF");
						DataSource dataSource1 = new ByteArrayDataSource(body.getBytes(),"application");

						MimeBodyPart pdfBodyPart = new MimeBodyPart();
						MimeBodyPart contentBodyPart = new MimeBodyPart();

						pdfBodyPart.setDataHandler(new DataHandler(dataSource));
						contentBodyPart.setContent(body,"TEXT_HTML");

						pdfBodyPart.setFileName(INVOICE_REPORT);

						mimeMultipart1.addBodyPart(contentBodyPart);
						mimeMultipart1.addBodyPart(pdfBodyPart);

					} catch(Exception ex) {
						ex.printStackTrace();
					}

					MailIntegration.sendHtmlEmail(mimeMultipart1, mail,
							getJavaMailSender(configurationService.getConfigurationList()), isHtml);
				} catch (Exception ex) {
					LOGGER.error("Error", ex);
				}
			}
		});
		t.start();
	}

	/**
	 *This Method is used for mails-with-PDF
	 * @param subject
	 * @param mailcontent
	 * @param pdfBody
	 * @param mimeMultipart
	 * @param fromEmailId
	 * @param fromName
	 * @param toMailAddress
	 * @param isHtml
	 */
	public void triggerEmailOnBackground2(String subject, String mailcontent,String pdfBody, MimeMultipart mimeMultipart, String fromEmailId,
										 String fromName, String[] toMailAddress, boolean isHtml) {
		Thread t = new Thread(new Runnable() {
			@Override
			public void run() {
				try {
					Mail mail = new Mail();
					mail.setFrom(fromEmailId);
					mail.setFromName(fromName);
					mail.setTo(toMailAddress);
					mail.setSubject(subject);
					mail.setBody(pdfBody);

					MimeMultipart mimeMultipart1=new MimeMultipart();
					try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

						byte[] bytes = writePdf(outputStream,pdfBody);

						DataSource dataSource = new ByteArrayDataSource(bytes, "APPLICATION_PDF");

						MimeBodyPart pdfBodyPart = new MimeBodyPart();
						MimeBodyPart contentBodyPart = new MimeBodyPart();

						pdfBodyPart.setDataHandler(new DataHandler(dataSource));
						contentBodyPart.setContent(mailcontent,"TEXT_HTML");

						if(subject.contains("CREDIT NOTE")) {
							pdfBodyPart.setFileName(CREDIT_NOTE_REPORT);
						}
							else if (subject.contains("Payslip")) {
								pdfBodyPart.setFileName(PAYSLIP_REPORT);
							}
							else if(subject.contains("QUOTATION")){
							pdfBodyPart.setFileName(QUOTATION_REPORT);
						}
						else {
							pdfBodyPart.setFileName(INVOICE_REPORT);
						}

						mimeMultipart1.addBodyPart(contentBodyPart);
						mimeMultipart1.addBodyPart(pdfBodyPart);

					} catch(Exception ex) {
						ex.printStackTrace();
					}

					MailIntegration.sendHtmlEmail(mimeMultipart1, mail,
							getJavaMailSender(configurationService.getConfigurationList()), isHtml);
				} catch (Exception ex) {
					LOGGER.error("Error", ex);
				}
			}
		});
		t.start();
	}
	public static byte[] writePdf(OutputStream outputStream,String body) throws Exception {
		try (ByteArrayOutputStream buffer = new ByteArrayOutputStream()) {
			HtmlConverter.convertToPdf(body, buffer);

			return buffer.toByteArray();
		}
	}

	public static JavaMailSender getJavaMailSender(List<Configuration> configurationList) {
		MailConfigurationModel mailDefaultConfigurationModel = getEMailConfigurationList(configurationList);
		return getJavaMailSender(mailDefaultConfigurationModel);
	}

	public static JavaMailSender getDefaultJavaMailSender() {
		return getJavaMailSender(getDefaultEmailConfigurationList());
	}

	public static JavaMailSender getJavaMailSender(MailConfigurationModel mailConfigurationModel) {
		JavaMailSenderImpl sender = new JavaMailSenderImpl();
		sender.setProtocol("smtp");
		sender.setHost(mailConfigurationModel.getMailhost() != null ? mailConfigurationModel.getMailhost() : System.getenv("SIMPLEACCOUNTS_SMTP_AUTH"));
		sender.setPort(mailConfigurationModel.getMailport() != null ? Integer.parseInt(mailConfigurationModel.getMailport()) :Integer.parseInt(System.getenv("SIMPLEACCOUNTS_SMTP_PORT")));
		sender.setUsername(mailConfigurationModel.getMailusername() != null ? mailConfigurationModel.getMailusername() : System.getenv("SIMPLEACCOUNTS_SMTP_USER"));
		sender.setPassword(mailConfigurationModel.getMailpassword() != null ? mailConfigurationModel.getMailpassword() : System.getenv("SIMPLEACCOUNTS_SMTP_PASS"));
		Properties mailProps = new Properties();
		mailProps.put("mail.smtps.auth",mailConfigurationModel.getMailsmtpAuth() != null ? mailConfigurationModel.getMailsmtpAuth() : System.getenv("SIMPLEACCOUNTS_SMTP_AUTH"));
		mailProps.put("mail.transport.protocol", "smtp");
		mailProps.put("mail.smtps.host", mailConfigurationModel.getMailhost() != null ? mailConfigurationModel.getMailhost() : System.getenv("SIMPLEACCOUNTS_SMTP_HOST"));
		mailProps.put("mail.smtp.starttls.enable",mailConfigurationModel.getMailstmpStartTLSEnable() != null ? mailConfigurationModel.getMailstmpStartTLSEnable(): System.getenv("SIMPLEACCOUNTS_SMTP_STARTTLS_ENABLE"));
		mailProps.put("mail.smtp.debug", "false");
		mailProps.put("mail.smtp.port",mailConfigurationModel.getMailport() != null ? mailConfigurationModel.getMailport() : System.getenv("SIMPLEACCOUNTS_SMTP_PORT"));

		mailProps.put("mail.smtp.starttls.enable prop", "true");
		mailProps.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
		mailProps.put("mail.smtp.ssl.checkserveridentity", true);
		sender.setJavaMailProperties(mailProps);
		return sender;
	}

	public static MailConfigurationModel getEMailConfigurationList(List<Configuration> configurationList) {
		MailConfigurationModel mailDefaultConfigurationModel = getDefaultEmailConfigurationList();

		if (isDbConfigAvailable(configurationList)) {

			Optional<Configuration> config = configurationList.stream()
					.filter(mailConfiguration -> mailConfiguration.getName().equals(ConfigurationConstants.MAIL_HOST))
					.findAny();
			if (config.isPresent()) {
				mailDefaultConfigurationModel.setMailhost(config.get().getValue());
			}

			config = configurationList.stream()
					.filter(mailConfiguration -> mailConfiguration.getName().equals(ConfigurationConstants.MAIL_PORT))
					.findAny();
			if (config.isPresent()) {
				mailDefaultConfigurationModel.setMailport(config.get().getValue());
			}
			config = configurationList.stream().filter(
					mailConfiguration -> mailConfiguration.getName().equals(ConfigurationConstants.MAIL_USERNAME))
					.findAny();
			if (config.isPresent()) {
				mailDefaultConfigurationModel.setMailusername(config.get().getValue());
			}

			config = configurationList.stream().filter(
					mailConfiguration -> mailConfiguration.getName().equals(ConfigurationConstants.MAIL_PASSWORD))
					.findAny();
			if (config.isPresent()) {
				mailDefaultConfigurationModel.setMailpassword(config.get().getValue());
			}

			config = configurationList.stream().filter(
					mailConfiguration -> mailConfiguration.getName().equals(ConfigurationConstants.MAIL_SMTP_AUTH))
					.findAny();
			if (config.isPresent()) {
				mailDefaultConfigurationModel.setMailsmtpAuth(config.get().getValue());
			}

			config = configurationList.stream().filter(
					mailConfiguration -> mailConfiguration.getName().equals(ConfigurationConstants.MAIL_API_KEY))
					.findAny();
			if (config.isPresent()) {
				mailDefaultConfigurationModel.setMailApiKey(config.get().getValue());
			}

			config = configurationList.stream().filter(mailConfiguration -> mailConfiguration.getName()
					.equals(ConfigurationConstants.MAIL_SMTP_STARTTLS_ENABLE)).findAny();
			if (config.isPresent()) {
				mailDefaultConfigurationModel.setMailstmpStartTLSEnable(config.get().getValue());
			}
		}
		return mailDefaultConfigurationModel;
	}

	public static MailConfigurationModel getDefaultEmailConfigurationList() {
		MailConfigurationModel mailDefaultConfigurationModel = new MailConfigurationModel();
		mailDefaultConfigurationModel.setMailhost(System.getenv("SIMPLEACCOUNTS_SMTP_HOST"));
		mailDefaultConfigurationModel.setMailport(System.getenv("SIMPLEACCOUNTS_SMTP_PORT"));
		mailDefaultConfigurationModel.setMailusername(System.getenv("SIMPLEACCOUNTS_SMTP_USER"));
		mailDefaultConfigurationModel.setMailpassword(System.getenv("SIMPLEACCOUNTS_SMTP_PASS"));
		mailDefaultConfigurationModel.setMailsmtpAuth(System.getenv("SIMPLEACCOUNTS_SMTP_AUTH"));
		mailDefaultConfigurationModel.setMailApiKey(System.getenv("SIMPLEACCOUNTS_API_KEY"));
		mailDefaultConfigurationModel.setMailstmpStartTLSEnable(System.getenv("SIMPLEACCOUNTS_SMTP_STARTTLS_ENABLE"));
		return mailDefaultConfigurationModel;
	}

	public String create(Map<String, String> dataMap, String data) {
		for (String key : dataMap.keySet()) {
			if (dataMap.containsKey(key) && dataMap.get(key) != null)
				data = data.replace(key, dataMap.get(key));
		}
		return data;
	}

	public Map<String, String> getInvoiceEmailParamMap() {

		Map<String, String> dataMap = new HashMap<>();
		dataMap.put(CN_PRODUCT,"{Cn_product}");
		dataMap.put(CREDIT_NOTE_NUMBER,"{creditNoteNumber}");
		dataMap.put(CREDIT_NOTE_CONTACT_NAME,"{CN_contactName}");
		dataMap.put(INVOICE_REFEREBCE_NO, "{invoicingReferencePattern}");
		dataMap.put(CN_REFERENCE_NO,"{referenceNo}");
		dataMap.put(COMPANY_CITY,"{companyCity}");
		dataMap.put(COMPANY_REGISTRATION_NO,"{companyRegistrationNo}");
		dataMap.put(CONTACT_EMAIL,"{contactEmail}");
		dataMap.put(EXCHANGE_RATE,"{exchangeRate}");
		dataMap.put(INVOICE_LABEL, "{invoiceLabel}");
		dataMap.put(INVOICE_NAME, "{InvoiceName}");
		dataMap.put(INVOICE_DATE, "{invoiceDate}");
		dataMap.put(INVOICE_DUE_DATE, "{invoiceDueDate}");
		dataMap.put(INVOICE_DISCOUNT, "{invoiceDiscount}");
		dataMap.put(CONTRACT_PO_NUMBER, "{contractPoNumber}");
		dataMap.put(CONTACT_NAME, "{contactName}");
		dataMap.put(PROJECT_NAME, "{projectName}");
		dataMap.put(INVOICE_AMOUNT, "{invoiceAmount}");
		dataMap.put(CN_AMOUNT, "{CNAmount}");
		dataMap.put(DUE_AMOUNT, "{dueAmount}");
		dataMap.put(SENDER_NAME, "{senderName}");
		dataMap.put(COMPANY_NAME, "{companyName}");
		dataMap.put(PROJECT_NAME, "{projectName}");
		dataMap.put(INVOICE_AMOUNT, "{invoiceAmount}");
		dataMap.put(DUE_AMOUNT, "{dueAmount}");
		dataMap.put(SUB_TOTAL, "{subTotal}");
		dataMap.put(CN_SUB_TOTAL, "{CnsubTotal}");
		dataMap.put(MOBILE_NUMBER, "{mobileNumber}");
		dataMap.put(CONTACT_ADDRESS, "{contactAddress}");
		dataMap.put(CONTACT_COUNTRY, "{contactCountry}");
		dataMap.put(CONTACT_STATE, "{contactState}");
		dataMap.put(CONTACT_CITY, "{contactCity}");
		dataMap.put(INVOICE_DUE_PERIOD, "{invoiceDuePeriod}");
		dataMap.put(INVOICE_VAT_AMOUNT, "{invoiceVatAmount}");
		dataMap.put(CREDIT_NOTE_VAT_AMOUNT, "{CreditNoteVatAmount}");
		dataMap.put(PRODUCT, "{product}");
		dataMap.put(QUANTITY, "{quantity}");
		dataMap.put(CN_QUANTITY, "{Cnquantity}");
		dataMap.put(UNIT_TYPE, "{unitType}");
		dataMap.put(CN_UNIT_TYPE, "{CnunitType}");
		dataMap.put(UNIT_PRICE, "{unitPrice}");
		dataMap.put(CN_UNIT_PRICE,"{cnUnitPrice}");
		dataMap.put(DISCOUNT, "{discount}");
		dataMap.put(CN_DISCOUNT,"{Cndiscount}");
		dataMap.put(CREDIT_NOTE_DISCOUNT,"{CreditNoteDiscount}");
		dataMap.put(EXCISE_AMOUNT, "{exciseAmount}");
		dataMap.put(CN_EXCISE_AMOUNT, "{CnexciseAmount}");
		dataMap.put(TOTAL, "{total}");
		dataMap.put(CN_TOTAL, "{Cntotal}");
		dataMap.put(TOTAL_NET, "{totalNet}");
		dataMap.put(VAT_TYPE,"{vatType}");
		dataMap.put(CN_VAT_TYPE,"{CnvatType}");
		dataMap.put(DESCRIPTION,"{description}");
		dataMap.put(CN_DESCRIPTION,"{cnDescription}");
		dataMap.put(COMPANYLOGO,"{companylogo}");
		dataMap.put(CURRENCY,"{currency}");
		dataMap.put(COMPANY_ADDRESS_LINE1,"{companyAddressLine1}");
		dataMap.put(COMPANY_ADDRESS_LINE2,"{companyAddressLine2}");
		dataMap.put(COMPANY_POST_ZIP_CODE,"{companyPostZipCode}");
		dataMap.put(COMPANY_COUNTRY_CODE,"{companyCountryCode}");
		dataMap.put(COMPANY_STATE_REGION,"{companyStateRegion}");
		dataMap.put(VAT_NUMBER,"{vatNumber}");
		dataMap.put(COMPANY_MOBILE_NUMBER,"{phoneNumber}");
		dataMap.put(VAT_REGISTRATION_NUMBER,"{vatRegistrationNumber}");
		dataMap.put(STATUS,"{status}");
		dataMap.put(NOTES,"{notes}");
		dataMap.put(POST_ZIP_CODE,"{postZipCode}");
		dataMap.put(VAT_ID,"{vatCategory}");
		dataMap.put(EXCISE_TAX,"{exciseCategory}");
		dataMap.put(TOTAL_EXCISE_AMOUNT,"{totalExciseAmount}");
		dataMap.put(CN_TOTAL_EXCISE_AMOUNT,"{CntotalExciseAmount}");
		dataMap.put(INVOICE_LINEITEM_VAT_AMOUNT,"{invoiceLineItemVatAmount}");
		dataMap.put(CN_VAT_AMOUNT,"{CnVatAmount}");
		dataMap.put(INVOICE_LINEITEM_EXCISE_TAX,"{invoiceLineItemExciseTax}");
		dataMap.put(CN_LINEITEM_EXCISE_TAX,"{CnLineItemExciseTax}");
		dataMap.put(TAXABLE_AMOUNT,"{taxableAmount}");
		dataMap.put(TAX_AMOUNT,"{taxAmount}");
		dataMap.put(CONTACT_ADDRESS_LINE1,"{contactAddressLine1}");
		dataMap.put(CONTACT_ADDRESS_LINE2,"{contactAddressLine2}");

		return dataMap;
	}

	private static boolean isDbConfigAvailable(List<Configuration> configurationList) {
		int mailConfigCount = 0;
		if (configurationList != null && !configurationList.isEmpty()) {
			for (Configuration configuration : configurationList) {
				if (configuration.getName().equals(ConfigurationConstants.MAIL_HOST) && configuration.getValue() != null
						&& !configuration.getValue().isEmpty()) {
					mailConfigCount++;

				} else if (configuration.getName().equals(ConfigurationConstants.MAIL_PORT)
						&& configuration.getValue() != null && !configuration.getValue().isEmpty()) {
					mailConfigCount++;

				} else if (configuration.getName().equals(ConfigurationConstants.MAIL_USERNAME)
						&& configuration.getValue() != null && !configuration.getValue().isEmpty()) {
					mailConfigCount++;

				} else if (configuration.getName().equals(ConfigurationConstants.MAIL_PASSWORD)
						&& configuration.getValue() != null && !configuration.getValue().isEmpty()) {
					mailConfigCount++;

				} else if (configuration.getName().equals(ConfigurationConstants.MAIL_SMTP_AUTH)
						&& configuration.getValue() != null && !configuration.getValue().isEmpty()) {
					mailConfigCount++;

				} else if (configuration.getName().equals(ConfigurationConstants.MAIL_API_KEY)
						&& configuration.getValue() != null && !configuration.getValue().isEmpty()) {
					mailConfigCount++;

				} else if (configuration.getName().equals(ConfigurationConstants.MAIL_SMTP_STARTTLS_ENABLE)
						&& configuration.getValue() != null && !configuration.getValue().isEmpty()) {
					mailConfigCount++;

				}
			}
		}
		return (mailConfigCount == 7);
	}
	public static final String RFQ_NO = "RFQ_Number";
	public static final String RFQ_RECEIVE_DATE = "RFQ_RECEIVE_DATE";
	public static final String RFQ_EXPIRY_DATE = "RFQ_EXPIRY_DATE";
	public static final String SUPPLIER_NAME = "SUPPLIER_Name";
	public static final String RFQ_AMOUNT = "RFQ_Amount";
	public static final String RFQ_VAT_AMOUNT = "RFQ_VAT_Amount";
	public static final String PO_NO = "PO_Number";
	public static final String PO_APPROVE_DATE = "PO_APPROVE_DATE";
	public static final String PO_RECEIVE_DATE = "PO_RECEIVE_DATE";
	public static final String PO_AMOUNT = "PO_AMOUNT";
	public static final String PO_VAT_AMOUNT = "PO_VAT_AMOUNT";
	public static final String GRN_NUMBER = "GRN_NUMBER";
	public static final String GRN_REMARKS="Grn_Remarks";
	public static final String GRN_RECEIVE_DATE="Grn_Receive_Date";
	public static final String QUOTATION_NO = "QUOTATION_Number";
	public static final String QUOTATION_CREATED_DATE = "QUOTATION_CREATED_DATE";
	public static final String QUOTATION_EXPIRATION_DATE = "QUOTATION_EXPIRATION_DATE";
	public static final String QUOTATION_UNTAXED_AMOUNT = "QUOTATION_UNTAXED_AMOUNT";
	public static final String QUOTATION_TOTAL_VAT_AMOUNT = "QUOTATION_TOTAL_VAT_Amount";
	public static final String CUSTOMER_NAME = "CUSTOMER_NAME";
	public static final String QUOTATION_PAYMENT_TERMS = "QUOTATION_PAYMENT_TERMS";
	public static final String QUOTATION_TERMS_AND_CONDITION = "QUOTATION_TERMS_AND_CONDITION";
	public static final String QUOTATION_SUB_TOTAL = "QUOTATION_SUB_TOTAL";
	public static final String EXCISE_TAX = "exciseCategory";
	public static final String VAT_AMOUNT = "vatAmount";

	public Map<String, String> getRfqEmailParamMap() {
		Map<String, String> dataMap = new HashMap<>();
		dataMap.put(RFQ_NO,"{rfqNumber}");
		dataMap.put(RFQ_EXPIRY_DATE,"{rfqExpiryDate}");
		dataMap.put(RFQ_RECEIVE_DATE,"{rfqReceiveDate}");
		dataMap.put(SUPPLIER_NAME,"{supplierName}");
		dataMap.put(RFQ_AMOUNT,"{rfqAmount}");
		dataMap.put(RFQ_VAT_AMOUNT,"{rfqVatAmount}");
		dataMap.put(PRODUCT, "{product}");
		dataMap.put(QUANTITY, "{quantity}");
		dataMap.put(UNIT_TYPE, "{unitType}");
		dataMap.put(UNIT_PRICE, "{unitPrice}");
		dataMap.put(EXCISE_AMOUNT, "{exciseAmount}");
		dataMap.put(SENDER_NAME, "{senderName}");

		dataMap.put(COMPANY_NAME, "{companyName}");
		dataMap.put(SUB_TOTAL, "{subTotal}");
		dataMap.put(VAT_TYPE,"{vatType}");
		dataMap.put(TOTAL, "{total}");
		dataMap.put(DESCRIPTION,"{description}");
		dataMap.put(COMPANYLOGO,"{companylogo}");
		dataMap.put(CURRENCY,"{currency}");
		dataMap.put(COMPANY_ADDRESS_LINE1,"{companyAddressLine1}");
		dataMap.put(COMPANY_ADDRESS_LINE2,"{companyAddressLine2}");
		dataMap.put(COMPANY_POST_ZIP_CODE,"{companyPostZipCode}");
		dataMap.put(COMPANY_COUNTRY_CODE,"{companyCountryCode}");
		dataMap.put(COMPANY_STATE_REGION,"{companyStateRegion}");
		dataMap.put(VAT_NUMBER,"{vatNumber}");
		dataMap.put(COMPANY_MOBILE_NUMBER,"{phoneNumber}");

		dataMap.put(CONTACT_COUNTRY, "{contactCountry}");
		dataMap.put(CONTACT_STATE, "{contactState}");
		dataMap.put(POST_ZIP_CODE,"{postZipCode}");
		dataMap.put(VAT_REGISTRATION_NUMBER,"{vatRegistrationNumber}");
		dataMap.put(STATUS,"{status}");
		dataMap.put(MOBILE_NUMBER, "{mobileNumber}");
		dataMap.put(NOTES,"{notes}");
		dataMap.put(EXCISE_TAX,"{exciseCategory}");
		dataMap.put(TOTAL_EXCISE_AMOUNT,"{totalExciseAmount}");
		dataMap.put(TOTAL_NET,"{totalNet}");
		dataMap.put(VAT_AMOUNT,"{vatAmount}");
		dataMap.put(CONTACT_ADDRESS_LINE1,"{contactAddressLine1}");
		dataMap.put(CONTACT_ADDRESS_LINE2,"{contactAddressLine2}");
		return dataMap;
	}
	public Map<String, String> getPoEmailParamMap() {
		Map<String, String> dataMap = new HashMap<>();
		dataMap.put(PO_NO,"{poNumber}");
		dataMap.put(PO_APPROVE_DATE,"{poApproveDate}");
		dataMap.put(PO_RECEIVE_DATE,"{poReceiveDate}");
		dataMap.put(PO_AMOUNT,"{poAmount}");
		dataMap.put(PO_VAT_AMOUNT,"{poVatAmount}");
		dataMap.put(PRODUCT, "{product}");
		dataMap.put(UNIT_PRICE, "{unitPrice}");
		dataMap.put(EXCISE_AMOUNT, "{exciseAmount}");
		dataMap.put(QUANTITY, "{quantity}");
		dataMap.put(UNIT_TYPE, "{unitType}");
		dataMap.put(SENDER_NAME, "{senderName}");
		dataMap.put(COMPANY_NAME, "{companyName}");
		dataMap.put(SUPPLIER_NAME,"{supplierName}");
		dataMap.put(SUB_TOTAL, "{subTotal}");
		dataMap.put(VAT_TYPE,"{vatType}");
		dataMap.put(TOTAL_NET, "{totalNet}");
		dataMap.put(TOTAL, "{total}");
		dataMap.put(DESCRIPTION,"{description}");
		dataMap.put(COMPANYLOGO,"{companylogo}");
		dataMap.put(CURRENCY,"{currency}");
		dataMap.put(COMPANY_ADDRESS_LINE1,"{companyAddressLine1}");
		dataMap.put(COMPANY_ADDRESS_LINE2,"{companyAddressLine2}");
		dataMap.put(COMPANY_POST_ZIP_CODE,"{companyPostZipCode}");
		dataMap.put(COMPANY_COUNTRY_CODE,"{companyCountryCode}");
		dataMap.put(COMPANY_STATE_REGION,"{companyStateRegion}");
		dataMap.put(VAT_NUMBER,"{vatNumber}");
		dataMap.put(COMPANY_MOBILE_NUMBER,"{phoneNumber}");

		dataMap.put(CONTACT_COUNTRY, "{contactCountry}");
		dataMap.put(CONTACT_STATE, "{contactState}");
		dataMap.put(POST_ZIP_CODE,"{postZipCode}");
		dataMap.put(VAT_REGISTRATION_NUMBER,"{vatRegistrationNumber}");
		dataMap.put(STATUS,"{status}");
		dataMap.put(MOBILE_NUMBER, "{mobileNumber}");
		dataMap.put(NOTES,"{notes}");
		dataMap.put(EXCISE_TAX,"{exciseCategory}");
		dataMap.put(TOTAL_EXCISE_AMOUNT,"{totalExciseAmount}");
		dataMap.put(VAT_AMOUNT,"{vatAmount}");
		dataMap.put(CONTACT_ADDRESS_LINE1,"{contactAddressLine1}");
		dataMap.put(CONTACT_ADDRESS_LINE2,"{contactAddressLine2}");
		return dataMap;
	}
	public Map<String, String> getGRNEmailParamMap() {
		Map<String, String> dataMap = new HashMap<>();

		dataMap.put(GRN_REMARKS,"{grnRemarks}");
		dataMap.put(GRN_RECEIVE_DATE,"{grnReceiveDate}");
		dataMap.put(PRODUCT, "{product}");
		dataMap.put(GRN_NUMBER,"{grnNumber}");
		dataMap.put(DESCRIPTION,"{description}");
		dataMap.put(QUANTITY, "{quantity}");
		dataMap.put(UNIT_TYPE, "{unitType}");
		dataMap.put(UNIT_PRICE, "{unitPrice}");
		dataMap.put(SUPPLIER_NAME, "{supplierName}");
		dataMap.put(COMPANY_NAME, "{companyName}");
		dataMap.put(SUB_TOTAL, "{subTotal}");
		dataMap.put(VAT_TYPE,"{vatType}");
		dataMap.put(TOTAL, "{total}");
		dataMap.put(TOTAL_NET,"{totalNet}");
		dataMap.put(COMPANYLOGO,"{companylogo}");
		dataMap.put(CURRENCY,"{currency}");
		dataMap.put(COMPANY_ADDRESS_LINE1,"{companyAddressLine1}");
		dataMap.put(COMPANY_ADDRESS_LINE2,"{companyAddressLine2}");
		dataMap.put(COMPANY_POST_ZIP_CODE,"{companyPostZipCode}");
		dataMap.put(COMPANY_COUNTRY_CODE,"{companyCountryCode}");
		dataMap.put(COMPANY_STATE_REGION,"{companyStateRegion}");
		dataMap.put(VAT_NUMBER,"{vatNumber}");
		dataMap.put(COMPANY_MOBILE_NUMBER,"{phoneNumber}");

		dataMap.put(CONTACT_COUNTRY, "{contactCountry}");
		dataMap.put(CONTACT_STATE, "{contactState}");
		dataMap.put(POST_ZIP_CODE,"{postZipCode}");
		dataMap.put(VAT_REGISTRATION_NUMBER,"{vatRegistrationNumber}");
		dataMap.put(STATUS,"{status}");
		dataMap.put(MOBILE_NUMBER, "{mobileNumber}");
		dataMap.put(CONTACT_ADDRESS_LINE1,"{contactAddressLine1}");
		dataMap.put(CONTACT_ADDRESS_LINE2,"{contactAddressLine2}");
		return dataMap;
	}
	public Map<String, String> getQuotationEmailParamMap() {
		Map<String, String> dataMap = new HashMap<>();
		dataMap.put(QUOTATION_NO,"{QuotationNumber}");
		dataMap.put(DISCOUNT, "{discount}");
		dataMap.put(INVOICE_DISCOUNT, "{invoiceDiscount}");
		dataMap.put(QUOTATION_CREATED_DATE,"{quotationcreatedDate}");
		dataMap.put(QUOTATION_EXPIRATION_DATE,"{quotationExpiration}");
		dataMap.put(SUPPLIER_NAME,"{supplierName}");
		dataMap.put(QUOTATION_UNTAXED_AMOUNT,"untaxedAmount");
		dataMap.put(QUOTATION_TOTAL_VAT_AMOUNT,"{totalVatAmount}");
		dataMap.put(PRODUCT, "{product}");
		dataMap.put(QUANTITY, "{quantity}");
		dataMap.put(UNIT_TYPE, "{unitType}");
		dataMap.put(UNIT_PRICE, "{unitPrice}");
		dataMap.put(SENDER_NAME, "{senderName}");
		dataMap.put(COMPANY_NAME, "{companyName}");
		dataMap.put(SUB_TOTAL, "{subTotal}");
		dataMap.put(VAT_TYPE,"{vatType}");
		dataMap.put(TOTAL, "{total}");
		dataMap.put(TOTAL_NET,"{totalNet}");
		dataMap.put(CUSTOMER_NAME,"{customerName}");
		dataMap.put(QUOTATION_PAYMENT_TERMS,"{paymentTerms}");
		dataMap.put(QUOTATION_TERMS_AND_CONDITION,"{termsAndCondition}");
		dataMap.put(QUOTATION_SUB_TOTAL,"{subTotal}");
		dataMap.put(COMPANYLOGO,"{companylogo}");
		dataMap.put(CURRENCY,"{currency}");
		dataMap.put(COMPANY_ADDRESS_LINE1,"{companyAddressLine1}");
		dataMap.put(COMPANY_ADDRESS_LINE2,"{companyAddressLine2}");
		dataMap.put(COMPANY_POST_ZIP_CODE,"{companyPostZipCode}");
		dataMap.put(COMPANY_COUNTRY_CODE,"{companyCountryCode}");
		dataMap.put(COMPANY_STATE_REGION,"{companyStateRegion}");
		dataMap.put(VAT_NUMBER,"{vatNumber}");
		dataMap.put(COMPANY_MOBILE_NUMBER,"{phoneNumber}");
		dataMap.put(CONTACT_COUNTRY, "{contactCountry}");
		dataMap.put(CONTACT_STATE, "{contactState}");
		dataMap.put(POST_ZIP_CODE,"{postZipCode}");
		dataMap.put(VAT_REGISTRATION_NUMBER,"{vatRegistrationNumber}");
		dataMap.put(MOBILE_NUMBER, "{mobileNumber}");
		dataMap.put(CONTACT_ADDRESS_LINE1,"{contactAddressLine1}");
		dataMap.put(CONTACT_ADDRESS_LINE2,"{contactAddressLine2}");
		dataMap.put(STATUS,"{status}");
		dataMap.put(NOTES,"{notes}");
		dataMap.put(TOTAL_EXCISE_AMOUNT,"{totalExciseAmount}");
		dataMap.put(VAT_AMOUNT,"{vatAmount}");
		dataMap.put(DESCRIPTION,"{description}");
		dataMap.put(EXCISE_TAX,"{exciseCategory}");
		dataMap.put(EXCISE_AMOUNT, "{exciseAmount}");

		return dataMap;
	}
	public void triggerEmailOnBackground3(String subject, String mailcontent, String pdfBody, List<MultipartFile> multiparts, String fromEmailId,
										  String fromName, String[] toMailAddress, boolean isHtml,
										  String[] pdfFilesStrings, List<File> files,
										  Map<String,byte[]> fileMetaData, EmailContentModel emailContentModel) {
		List<MimeMultipart> mimeMultiparts=new ArrayList<>();
		Thread t = new Thread(new Runnable() {
			@Override
			public void run() {
				try {
					Mail mail = new Mail();
					mail.setFrom(fromEmailId);
					mail.setFromName(fromName);
					mail.setTo(emailContentModel.getTo_emails());
					if(emailContentModel.getCc_emails()!=null)
						mail.setCc(emailContentModel.getCc_emails());
					if(emailContentModel.getBcc_emails()!=null)
						mail.setBcc(emailContentModel.getBcc_emails());
					mail.setSubject(subject);
					mail.setBody(mailcontent);
					MimeMultipart mimeMultipart1=new MimeMultipart();
					try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

						MimeBodyPart contentBodyPart = new MimeBodyPart();
						contentBodyPart.setContent(mailcontent,"TEXT_HTML");
						mimeMultipart1.addBodyPart(contentBodyPart);
						for(Map.Entry<String,byte[]> fileMeta :fileMetaData.entrySet()){
							String fileName = fileMeta.getKey();
							DataSource dataSource = new ByteArrayDataSource(fileMeta.getValue(), "APPLICATION_PDF");
							MimeBodyPart pdfBodyPart = new MimeBodyPart();
							pdfBodyPart.setDataHandler(new DataHandler(dataSource));
							pdfBodyPart.setFileName(fileName);
							mimeMultipart1.addBodyPart(pdfBodyPart);
						}
						//primary email
						if(emailContentModel.getAttachPrimaryPdf().booleanValue()==Boolean.TRUE){
							byte[] bytes = writePdf(outputStream,pdfBody);
							DataSource dataSource = new ByteArrayDataSource(bytes, "APPLICATION_PDF");
							MimeBodyPart pdfBodyPart = new MimeBodyPart();
							pdfBodyPart.setDataHandler(new DataHandler(dataSource));
							if(subject.contains("Payslip"))
								pdfBodyPart.setFileName(PAYSLIP_REPORT);
							else
								pdfBodyPart.setFileName(subject+""+".pdf");
							mimeMultipart1.addBodyPart(pdfBodyPart);
						}
						mimeMultiparts.add(mimeMultipart1);
					} catch(Exception ex) {
						ex.printStackTrace();
					}
					MailIntegration.sendHtmlEmails(mimeMultiparts, mail,
							getJavaMailSender(configurationService.getConfigurationList()), isHtml,files);
				} catch (Exception ex) {
					LOGGER.error("Error", ex);
				}
			}
		});
		t.start();
	}
}
