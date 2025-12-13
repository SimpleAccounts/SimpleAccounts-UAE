package com.simpleaccounts.rest.companycontroller;

import com.simpleaccounts.entity.*;
import com.simpleaccounts.repository.ExpenseRepository;
import com.simpleaccounts.repository.InvoiceRepository;
import com.simpleaccounts.repository.ProductRepository;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
import com.simpleaccounts.rest.financialreport.VatReportFilingRepository;
import com.simpleaccounts.rfq_po.PoQuatation;
import com.simpleaccounts.rfq_po.PoQuatationRepository;
import com.simpleaccounts.service.*;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import static com.simpleaccounts.constant.ErrorConstant.ERROR;

@Component
@RequiredArgsConstructor
public class CompanyRestHelper{
	
	private final Logger logger = LoggerFactory.getLogger(CompanyRestHelper.class);
	
	private final IndustryTypeService industryTypeService;

	private final CountryService countryService;

	private final CompanyTypeService companyTypeService;

	private final StateService stateService;

	private final CurrencyService currencyService;

	private final UserService userService;

	private final InvoiceRepository invoiceRepository;

	private final ExpenseRepository expenseRepository;

	private final CreditNoteRepository creditNoteRepository;

	private final VatReportFilingRepository vatReportFilingRepository;

	private final PoQuatationRepository poQuatationRepository;

	private final ContactService contactService;

	private final ProductRepository productRepository;

	public List<CompanyListModel> getModelList(List<Company> companyList) {
		List<CompanyListModel> coModelList = new ArrayList<>();
		if (companyList != null && !companyList.isEmpty()) {
			for (Company company : companyList) {

				CompanyListModel companyModel = new CompanyListModel();

				companyModel.setId(company.getCompanyId());
				companyModel.setCompanyName(company.getCompanyName());
				companyModel.setPhoneNumber(company.getPhoneNumber());

				coModelList.add(companyModel);
			}
		}
		return coModelList;
	}

	public CompanyModel getModel(Company company) {

		CompanyModel companyModel = new CompanyModel();

		companyModel.setCompanyName(company.getCompanyName());
		companyModel.setCompanyRegistrationNumber(company.getCompanyRegistrationNumber());
		companyModel.setVatRegistrationNumber(company.getVatNumber());
		companyModel.setPhoneNumber(company.getPhoneNumber());
		companyModel.setEmailAddress(company.getEmailAddress());
		companyModel.setWebsite(company.getWebsite());
		companyModel.setCompanyRevenueBudget(company.getCompanyRevenueBudget());
		companyModel.setCompanyExpenseBudget(company.getCompanyExpenseBudget());
		companyModel.setInvoicingAddressLine1(company.getInvoicingAddressLine1());
		companyModel.setInvoicingAddressLine2(company.getInvoicingAddressLine2());
		companyModel.setInvoicingAddressLine3(company.getInvoicingAddressLine3());
		companyModel.setInvoicingCity(company.getInvoicingCity());
		companyModel.setInvoicingStateRegion(company.getInvoicingStateRegion());
		companyModel.setInvoicingPoBoxNumber(company.getInvoicingPoBoxNumber());
		companyModel.setInvoicingPostZipCode(company.getInvoicingPostZipCode());
		companyModel.setDateFormat(company.getDateFormat());
		companyModel.setCompanyAddressLine1(company.getCompanyAddressLine1());
		companyModel.setCompanyAddressLine2(company.getCompanyAddressLine2());
		companyModel.setCompanyAddressLine3(company.getCompanyAddressLine3());
		companyModel.setCompanyCity(company.getCompanyCity());
		companyModel.setIsDesignatedZone(company.getIsDesignatedZone());
		companyModel.setIsRegisteredVat(company.getIsRegisteredVat());
		companyModel.setCompanyStateRegion(company.getCompanyStateRegion());
		companyModel.setGenerateSif(company.getGenerateSif());
		companyModel.setCompanyPoBoxNumber(company.getCompanyPoBoxNumber());
		companyModel.setCompanyPostZipCode(company.getCompanyPostZipCode());
		companyModel.setFax(company.getFax());

		if (company.getCompanyTypeCode() != null) {
			companyModel.setCompanyTypeCode(company.getCompanyTypeCode().getId());
		}
		if (company.getIndustryTypeCode() != null) {
			companyModel.setIndustryTypeCode(company.getCompanyTypeCode().getId());
		}
		if (company.getCurrencyCode() != null) {
			companyModel.setCurrencyCode(company.getCurrencyCode().getCurrencyCode());
		}
		if (company.getMobileNumber() != null){
			companyModel.setTelephoneNumber(company.getMobileNumber());
		}
		if (company.getInvoicingCountryCode() != null) {
			companyModel.setInvoicingCountryCode(company.getInvoicingCountryCode().getCountryCode());
		}
		if(company.getCompanyStateCode() != null){
			companyModel.setCompanyStateCode(company.getCompanyStateCode().getId());
			companyModel.setCompanyStateName(company.getCompanyStateCode().getStateName());
		}
		if (company.getCompanyCountryCode() != null) {
			companyModel.setCompanyCountryCode(company.getCompanyCountryCode().getCountryCode());
			companyModel.setCompanyCountryName(company.getCompanyCountryCode().getCountryName());
		}
		if(company.getVatRegistrationDate() != null){
			Date date = Date.from(company.getVatRegistrationDate().atZone(ZoneId.systemDefault()).toInstant());
			companyModel.setVatRegistrationDate(date);
		}
		if (company.getCompanyLogo() != null) {
			companyModel.setCompanyLogoByteArray(company.getCompanyLogo());
		}
		companyModel.setCompanyBankCode(company.getCompanyBankCode() != null ? company.getCompanyBankCode() : "");
		companyModel.setCompanyNumber(company.getCompanyNumber() != null ? company.getCompanyNumber() : "");

		List<Invoice> invoiceList = invoiceRepository.findAllByDeleteFlag(Boolean.FALSE);
		List<Expense> expenseList = expenseRepository.findAllByDeleteFlag(Boolean.FALSE);
		List<CreditNote> creditNoteList = creditNoteRepository.findByDeleteFlag(Boolean.FALSE);
		List<VatReportFiling> vatReportFilingList = vatReportFilingRepository.findAll();
		List<PoQuatation> poQuatationList = poQuatationRepository.findByDeleteFlag(Boolean.FALSE);
		List<Product> productList = productRepository.findAllByDeleteFlag(Boolean.FALSE);
		if
		(!invoiceList.isEmpty() || !expenseList.isEmpty() || !creditNoteList.isEmpty() || !vatReportFilingList.isEmpty()
				|| !poQuatationList.isEmpty() || !productList.isEmpty()) { companyModel.setIsVatEditable(Boolean.FALSE); }
		else {
			companyModel.setIsVatEditable(Boolean.TRUE);
		}
		return companyModel;
	}

	public Company getEntity(CompanyModel companyModel, Integer userId) {
		Company company = new Company();
		if (userId != null) {
			User user = userService.findByPK(userId);
			// XXX : assumption company allways present
			company = user.getCompany();
		}

		company.setCompanyName(companyModel.getCompanyName());
		company.setCompanyRegistrationNumber(companyModel.getCompanyRegistrationNumber());
		company.setVatNumber(companyModel.getVatRegistrationNumber());
		company.setFax(companyModel.getFax());
		company.setMobileNumber(companyModel.getMobileNumber());
		if (companyModel.getTelephoneNumber() != null) {
			company.setMobileNumber(companyModel.getTelephoneNumber());
		}
		if (companyModel.getCompanyTypeCode() != null) {
			company.setCompanyTypeCode(companyTypeService.findByPK(companyModel.getCompanyTypeCode()));
		}
		if (companyModel.getIndustryTypeCode() != null) {
			company.setIndustryTypeCode(industryTypeService.findByPK(companyModel.getIndustryTypeCode()));
		}
		if (companyModel.getCurrencyCode() != null) {
			company.setCurrencyCode(currencyService.findByPK(companyModel.getCurrencyCode()));
			currencyService.updateCurrencyProfile(companyModel.getCurrencyCode());
			currencyService.updateCurrency(companyModel.getCurrencyCode());
		}

		company.setWebsite(companyModel.getWebsite());
		company.setEmailAddress(companyModel.getEmailAddress());
		company.setPhoneNumber(companyModel.getPhoneNumber());

		company.setCompanyExpenseBudget(companyModel.getCompanyExpenseBudget());
		company.setCompanyRevenueBudget(companyModel.getCompanyRevenueBudget());

		company.setInvoicingAddressLine1(companyModel.getInvoicingAddressLine1());
		company.setInvoicingAddressLine2(companyModel.getInvoicingAddressLine2());
		company.setInvoicingAddressLine3(companyModel.getInvoicingAddressLine3());
		company.setInvoicingCity(companyModel.getInvoicingCity());
		company.setInvoicingStateRegion(companyModel.getInvoicingStateRegion());
		if (companyModel.getInvoicingCountryCode() != null) {
			company.setInvoicingCountryCode(countryService.findByPK(companyModel.getInvoicingCountryCode()));
		}
		company.setInvoicingPoBoxNumber(companyModel.getInvoicingPoBoxNumber());
		company.setInvoicingPostZipCode(companyModel.getInvoicingPostZipCode());
		company.setDateFormat(companyModel.getDateFormat());

		company.setCompanyAddressLine1(companyModel.getCompanyAddressLine1());
		company.setCompanyAddressLine2(companyModel.getCompanyAddressLine2());
		company.setCompanyAddressLine3(companyModel.getCompanyAddressLine3());
		company.setCompanyCity(companyModel.getCompanyCity());
		company.setCompanyStateRegion(companyModel.getCompanyStateRegion());
		if (companyModel.getCompanyCountryCode() != null) {
			company.setCompanyCountryCode(countryService.findByPK(companyModel.getCompanyCountryCode()));
		}
		company.setIsRegisteredVat(companyModel.getIsRegisteredVat());
		company.setCompanyPoBoxNumber(companyModel.getCompanyPoBoxNumber());
		company.setCompanyPostZipCode(companyModel.getCompanyPostZipCode());
		if (companyModel.getCompanyLogoChange() != null && companyModel.getCompanyLogoChange()) {
			try {
				company.setCompanyLogo((companyModel.getCompanyLogo() != null) ? companyModel.getCompanyLogo().getBytes() : null);
			} catch (IOException e) {
				logger.error(ERROR, e);
			}
		}
		return company;
	}

	public List<String> getTimeZoneList() {
		List<String> timeZoneList = new ArrayList<>();
		String[] ids = TimeZone.getAvailableIDs();
		for (String id : ids) {
			timeZoneList.add(TimeZone.getTimeZone(id).getID());
		}
     return timeZoneList;
	}

    public Company registerCompany(RegistrationModel registrationModel) {
		Company company = new Company();
		company.setCompanyName(registrationModel.getCompanyName());
		if (registrationModel.getCompanyTypeCode() != null) {
			company.setCompanyTypeCode(companyTypeService.findByPK(registrationModel.getCompanyTypeCode()));
		}
		if (registrationModel.getIndustryTypeCode() != null) {
			company.setIndustryTypeCode(industryTypeService.findByPK(registrationModel.getIndustryTypeCode()));
		}
		if (registrationModel.getCurrencyCode() != null) {
			company.setCurrencyCode(currencyService.findByPK(registrationModel.getCurrencyCode()));
		}
		if (registrationModel.getCountryId() != null) {
			company.setCompanyCountryCode(countryService.getCountry(registrationModel.getCountryId()));
		}
		if(registrationModel.getStateId() != null){
			company.setCompanyStateCode(
					stateService.findByPK(registrationModel.getStateId()));
		}
		if(registrationModel.getPhoneNumber()!=null){
			company.setPhoneNumber(registrationModel.getPhoneNumber());
		}

		if(registrationModel.getIsDesignatedZone() != null){
			company.setIsDesignatedZone(registrationModel.getIsDesignatedZone());
		}
		if(registrationModel.getIsRegisteredVat() != null){
			company.setIsRegisteredVat(registrationModel.getIsRegisteredVat());
		}
		if (registrationModel.getVatRegistrationDate() != null) {
			Instant instant = Instant.ofEpochMilli(registrationModel.getVatRegistrationDate().getTime());
			LocalDateTime vatRegistrationDate = LocalDateTime.ofInstant(instant,
					ZoneId.systemDefault());
			company.setVatRegistrationDate(vatRegistrationDate);
		}
		if(registrationModel.getTaxRegistrationNumber() != null){
			company.setVatNumber(registrationModel.getTaxRegistrationNumber());
		}
		if(registrationModel.getCompanyAddressLine1() != null){
			company.setCompanyAddressLine1(registrationModel.getCompanyAddressLine1());
		}
		if(registrationModel.getCompanyAddressLine2() != null){
			company.setCompanyAddressLine2(registrationModel.getCompanyAddressLine2());
		}
        return company;
    }
}
