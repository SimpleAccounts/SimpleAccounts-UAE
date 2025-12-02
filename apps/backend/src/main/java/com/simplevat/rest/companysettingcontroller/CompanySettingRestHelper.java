package com.simplevat.rest.companysettingcontroller;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.simplevat.constant.ConfigurationConstants;
import com.simplevat.entity.Configuration;
import com.simplevat.service.ConfigurationService;

@Component
public class CompanySettingRestHelper {

	@Autowired
	private ConfigurationService configurationService;

	public CompanySettingModel getModel() {

		List<Configuration> configurationList = configurationService.getConfigurationList();

		if (configurationList != null && !configurationList.isEmpty()) {
			CompanySettingModel companySettingModel = new CompanySettingModel();

			return getCompanySettingModel(configurationList, companySettingModel);
		}
		return null;
	}

	private CompanySettingModel getCompanySettingModel(List<Configuration> configurationList, CompanySettingModel companySettingModel) {
		Optional<Configuration> config = configurationList.stream()
				.filter(mailConfiguration -> mailConfiguration.getName().equals(ConfigurationConstants.MAIL_HOST))
				.findAny();
		if (config.isPresent()) {
			companySettingModel.setMailingHost(config.get().getValue());
		}
		config = configurationList.stream()
				.filter(mailConfiguration -> mailConfiguration.getName().equals(ConfigurationConstants.LOGGED_IN_USER_FLAG))
				.findAny();
		if (config.isPresent()) {
			if (config.get().getValue().equals("true"))
				companySettingModel.setLoggedInUserEmailFlag(Boolean.TRUE);
			else
				companySettingModel.setLoggedInUserEmailFlag(Boolean.FALSE);
		}

		config = configurationList.stream()
				.filter(mailConfiguration -> mailConfiguration.getName().equals(ConfigurationConstants.FROM_EMAIL_ADDRESS))
				.findAny();
		if (config.isPresent()) {
			companySettingModel.setFromEmailAddress(config.get().getValue());
		}
		config = configurationList.stream()
				.filter(mailConfiguration -> mailConfiguration.getName().equals(ConfigurationConstants.MAIL_PORT))
				.findAny();
		if (config.isPresent()) {
			companySettingModel.setMailingPort(config.get().getValue());
		}

		config = configurationList.stream().filter(
						mailConfiguration -> mailConfiguration.getName().equals(ConfigurationConstants.MAIL_USERNAME))
				.findAny();
		if (config.isPresent()) {
			companySettingModel.setMailingUserName(config.get().getValue());
		}

		config = configurationList.stream().filter(
						mailConfiguration -> mailConfiguration.getName().equals(ConfigurationConstants.MAIL_PASSWORD))
				.findAny();
		if (config.isPresent()) {
			companySettingModel.setMailingPassword(config.get().getValue());
		}

		config = configurationList.stream().filter(
						mailConfiguration -> mailConfiguration.getName().equals(ConfigurationConstants.MAIL_SMTP_AUTH))
				.findAny();
		if (config.isPresent()) {
			companySettingModel.setMailingSmtpAuthorization(config.get().getValue());
		}

		config = configurationList.stream().filter(
						mailConfiguration -> mailConfiguration.getName().equals(ConfigurationConstants.MAIL_API_KEY))
				.findAny();
		if (config.isPresent()) {
			companySettingModel.setMailApiKey(config.get().getValue());

		}
		config = configurationList.stream().filter(mailConfiguration -> mailConfiguration.getName()
				.equals(ConfigurationConstants.MAIL_SMTP_STARTTLS_ENABLE)).findAny();
		if (config.isPresent()) {
			companySettingModel.setMailingSmtpStarttlsEnable(config.get().getValue());
		}

		config = configurationList.stream().filter(mailConfiguration -> mailConfiguration.getName()
				.equals(ConfigurationConstants.INVOICE_MAIL_TAMPLATE_SUBJECT)).findAny();
		if (config.isPresent()) {
			companySettingModel.setInvoiceMailingSubject(config.get().getValue());
		}

		config = configurationList.stream().filter(mailConfiguration -> mailConfiguration.getName()
				.equals(ConfigurationConstants.INVOICE_MAIL_TAMPLATE_BODY)).findAny();
		if (config.isPresent()) {
			companySettingModel.setInvoiceMailingBody(config.get().getValue());
		}

		config = configurationList.stream().filter(mailConfiguration -> mailConfiguration.getName()
				.equals(ConfigurationConstants.INVOICING_REFERENCE_PATTERN)).findAny();
		if (config.isPresent()) {
			companySettingModel.setInvoicingReferencePattern(config.get().getValue());
		}

		return companySettingModel;
	}

	public List<Configuration> getEntity(CompanySettingRequestModel companySettingReqModel) {

		if (companySettingReqModel != null) {

			List<Configuration> configList = getConfigurations(companySettingReqModel);
			Configuration config;

			config = configurationService.getConfigurationByName(ConfigurationConstants.MAIL_SMTP_AUTH);
			config.setValue(companySettingReqModel.getMailingSmtpAuthorization());
			if (companySettingReqModel.getFromEmailAddress()!=null){
				config = configurationService.getConfigurationByName(ConfigurationConstants.FROM_EMAIL_ADDRESS);
				config.setValue(companySettingReqModel.getFromEmailAddress());
				config.setDeleteFlag(false);
			}
			else{
				config = configurationService.getConfigurationByName(ConfigurationConstants.FROM_EMAIL_ADDRESS);
				config.setValue(null);
				config.setDeleteFlag(true);
			}
			config = configurationService.getConfigurationByName(ConfigurationConstants.LOGGED_IN_USER_FLAG);
			config.setValue(companySettingReqModel.getSetLoggedInUserEmail().toString());
			configList.add(config);

			config = configurationService.getConfigurationByName(ConfigurationConstants.MAIL_SMTP_STARTTLS_ENABLE);
			config.setValue(companySettingReqModel.getMailingSmtpStarttlsEnable());
			configList.add(config);

			invoiceMailingSubject(companySettingReqModel, configList);

			return configList;

		}
		return null;
	}

	private List<Configuration> getConfigurations(CompanySettingRequestModel companySettingReqModel) {
		List<Configuration> configList = new ArrayList<>();
		Configuration config = null;
		if (companySettingReqModel.getInvoiceMailingBody() != null
				&& !companySettingReqModel.getInvoiceMailingBody().isEmpty()) {
			config = configurationService.getConfigurationByName(ConfigurationConstants.INVOICE_MAIL_TAMPLATE_BODY);
			config.setValue(companySettingReqModel.getInvoiceMailingBody());
			configList.add(config);
		}

		if (companySettingReqModel.getInvoicingReferencePattern() != null
				&& !companySettingReqModel.getInvoicingReferencePattern().isEmpty()) {
			config = configurationService
					.getConfigurationByName(ConfigurationConstants.INVOICING_REFERENCE_PATTERN);
			config.setValue(companySettingReqModel.getInvoicingReferencePattern());
			configList.add(config);

		}

		if (companySettingReqModel.getMailingHost() != null && !companySettingReqModel.getMailingHost().isEmpty()) {
			config = configurationService.getConfigurationByName(ConfigurationConstants.MAIL_HOST);
			config.setValue(companySettingReqModel.getMailingHost());
			configList.add(config);

		}

		if (companySettingReqModel.getMailingPort() != null && !companySettingReqModel.getMailingPort().isEmpty()) {
			config = configurationService.getConfigurationByName(ConfigurationConstants.MAIL_PORT);
			config.setValue(companySettingReqModel.getMailingPort());
			configList.add(config);

		}

		if (companySettingReqModel.getMailingUserName() != null
				&& !companySettingReqModel.getMailingUserName().isEmpty()) {
			config = configurationService.getConfigurationByName(ConfigurationConstants.MAIL_USERNAME);
			config.setValue(companySettingReqModel.getMailingUserName());
			configList.add(config);

		}

		if (companySettingReqModel.getMailingPassword() != null
				&& !companySettingReqModel.getMailingPassword().isEmpty()) {
			config = configurationService.getConfigurationByName(ConfigurationConstants.MAIL_PASSWORD);
			config.setValue(companySettingReqModel.getMailingPassword());
			configList.add(config);

		}
		if (companySettingReqModel.getMailingHost() != null && !companySettingReqModel.getMailingHost().isEmpty()) {
			config = configurationService.getConfigurationByName(ConfigurationConstants.MAIL_API_KEY);
			config.setValue(companySettingReqModel.getMailingAPIKey());
			configList.add(config);
    	}
		return configList;
	}

	private void invoiceMailingSubject(CompanySettingRequestModel companySettingReqModel, List<Configuration> configList) {
		Configuration config;
		if (companySettingReqModel.getInvoiceMailingSubject() != null
				&& !companySettingReqModel.getInvoiceMailingSubject().isEmpty()) {
			config = configurationService
					.getConfigurationByName(ConfigurationConstants.INVOICE_MAIL_TAMPLATE_SUBJECT);
			config.setValue(companySettingReqModel.getInvoiceMailingSubject());
			configList.add(config);
		}
	}

}
