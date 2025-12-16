package com.simpleaccounts.rest.companycontroller;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

import com.simpleaccounts.aop.LogExecutionTime;
import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.configcontroller.SimpleAccountsConfigModel;
import com.simpleaccounts.constant.*;
import com.simpleaccounts.constant.dbfilter.CompanyFilterEnum;
import com.simpleaccounts.constant.dbfilter.StateFilterEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.BankAccountStatus;
import com.simpleaccounts.entity.bankaccount.BankAccountType;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.repository.CompanyTypeRepository;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.bankaccountcontroller.BankAccountRestHelper;
import com.simpleaccounts.rest.currencyconversioncontroller.CurrencyConversionResponseModel;
import com.simpleaccounts.rest.usercontroller.UserModel;
import com.simpleaccounts.rest.usercontroller.UserRestHelper;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import com.simpleaccounts.utils.EmailSender;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.text.StringEscapeUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Slf4j
@RestController
@RequestMapping("/rest/company")
@SuppressWarnings("java:S131")
@RequiredArgsConstructor
public class CompanyController {
	private static final String MSG_UPDATED_SUCCESSFULLY = "Updated Successfully";

	private final CountryService countryService;

	private final EmaiLogsService emaiLogsService;

	private final StateService stateService;

	private final BankAccountService bankAccountService;

	private final TransactionCategoryService transactionCategoryService;

	protected final JournalService journalService;

	private final CoacTransactionCategoryService coacTransactionCategoryService;

	private final BankAccountStatusService bankAccountStatusService;

	private final CompanyService companyService;

	private final CurrencyService currencyService;

	private final CompanyTypeService companyTypeService;

	private final IndustryTypeService industryTypeService;

	private final JwtTokenUtil jwtTokenUtil;

	private final CompanyRestHelper companyRestHelper;

	private final CompanyTypeRepository companyTypeRepository;

	private final RoleService roleService;

	private final UserService userService;

	private final CurrencyExchangeService currencyExchangeService;

	private final BankAccountTypeService bankAccountTypeService;

	private final UserRestHelper userRestHelper;

	private final EmailSender emailSender;

	@Value("${cors.allowed.origins:*}")
	private String allowedOriginsConfig;

	private final BankAccountRestHelper bankRestHelper;

	private final UserService userServiceNew;

	/**
	 * @Deprecated
	 **/
	
	@LogRequest
	@LogExecutionTime
	@GetMapping(value = "/getList")
	public ResponseEntity<List<CompanyListModel>> getCompanyList(HttpServletRequest request) {
		try {
			Map<CompanyFilterEnum, Object> filterMap = new EnumMap<>(CompanyFilterEnum.class);
			filterMap.put(CompanyFilterEnum.DELETE_FLAG, false);
			List<Company> companyList = companyService.getCompanyList(filterMap);
			if (companyList == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			return new ResponseEntity<>(companyRestHelper.getModelList(companyList), HttpStatus.OK);
		} catch (Exception e) {
			log.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@LogExecutionTime
	@GetMapping(value = "/getCompaniesForDropdown")
	public ResponseEntity<List<DropdownModel>> getCompaniesForDropdown() {
		return new ResponseEntity<>(companyService.getCompaniesForDropdown(), HttpStatus.OK);
	}

	/**
	 * @Deprecated
	 **/
	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@LogExecutionTime
	@DeleteMapping(value = "/delete")
	public ResponseEntity<String> deleteCompany(@RequestParam(value = "id") Integer id) {
		try {
			Company company = companyService.findByPK(id);
			if (company != null) {
				company.setDeleteFlag(Boolean.TRUE);
				companyService.update(company);
			}
			return new ResponseEntity<>("Deleted Successfully", HttpStatus.OK);
		} catch (Exception e) {
			log.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @Deprecated
	 */
	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@LogExecutionTime
	@DeleteMapping(value = "/deletes")
	public ResponseEntity<String> deleteCompanies(@RequestBody DeleteModel ids) {
		try {
			companyService.deleteByIds(ids.getIds());
			return new ResponseEntity<>("Companies Deleted successfully", HttpStatus.OK);
		} catch (Exception e) {
			log.error(ERROR, e);
		}
		return new ResponseEntity<>("Cannot Delete The companies", HttpStatus.INTERNAL_SERVER_ERROR);

	}

	@LogRequest
	@LogExecutionTime
	@GetMapping(value = "/getCompanyDetails")
	public ResponseEntity<CompanyModel> getCompanyById(HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

			User user = userService.findByPK(userId);
			if (user == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			} else {
				return new ResponseEntity<>(companyRestHelper.getModel(user.getCompany()), HttpStatus.OK);
			}
		} catch (Exception e) {
			log.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@LogExecutionTime
	@GetMapping(value = "/getCompanyCount")
	public ResponseEntity<Integer> getCompanyCount(HttpServletRequest request) {
		try {
			Company company = companyService.getCompany();
			if (company == null) {
				return new ResponseEntity<>(0, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(1, HttpStatus.OK);
			}
		} catch (Exception e) {
			log.error(ERROR, e);
			// Return 0 on error to allow registration screen to appear
			// This is safer than returning 500 with no body, which causes XML parsing errors
			return new ResponseEntity<>(0, HttpStatus.OK);
		}
	}

	@LogRequest
	@LogExecutionTime
	@GetMapping(value = "/getTimeZoneList")
	public ResponseEntity<List<String>> getGetTimeZoneList(HttpServletRequest request) {
		try {
			return new ResponseEntity<List<String>>(companyRestHelper.getTimeZoneList(), HttpStatus.OK);
		} catch (Exception e) {
			log.error(ERROR, e);
			// Return empty list on error instead of 500 with no body
			return new ResponseEntity<>(Collections.emptyList(), HttpStatus.OK);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@LogExecutionTime
	@PostMapping(value = "/save")
	public ResponseEntity<String> save(@ModelAttribute CompanyModel companyModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			Company company = companyRestHelper.getEntity(companyModel, userId);
			company.setCreatedBy(userId);
			company.setCreatedDate(LocalDateTime.now());
			company.setDeleteFlag(Boolean.FALSE);
			companyService.persist(company);
			return new ResponseEntity<>(HttpStatus.OK);
		} catch (Exception e) {
			log.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@LogExecutionTime
	@PostMapping(value = "/register")
	public ResponseEntity<String> save(@ModelAttribute RegistrationModel registrationModel,
			HttpServletRequest request) {
		log.info("Registration request received for company: {}", 
			registrationModel != null ? sanitizeForLog(registrationModel.getCompanyName()) : "null");
		
		// Validate request
		if (registrationModel == null) {
			log.error("Registration failed: registration model is null");
			return new ResponseEntity<>("Invalid registration data", HttpStatus.BAD_REQUEST);
		}
		
		try {
			// Check if company already exists
			Company existingCompany = companyService.getCompany();
			if (existingCompany != null) {
				log.warn("Registration rejected: company already exists");
				return new ResponseEntity<>("Company Already Exist", HttpStatus.OK);
			}
			
			// Encode password
			String password = registrationModel.getPassword();
			String encodedPassword = null;
			if (password != null && !password.trim().isEmpty()) {
				BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
				encodedPassword = passwordEncoder.encode(password);
				registrationModel.setPassword(encodedPassword);
			} else {
				log.warn("Password is null or empty");
			}

			// Create user
			User user = new User();
			user.setFirstName(registrationModel.getFirstName());
			user.setLastName(registrationModel.getLastName());
			user.setUserEmail(registrationModel.getEmail());
			if (registrationModel.getTimeZone() != null)
				user.setUserTimezone(registrationModel.getTimeZone());
			user.setRole(roleService.findByPK(1));
			user.setCreatedDate(LocalDateTime.now());
			user.setIsActive(true);
			user.setPassword(encodedPassword);
			user.setForgotPasswordToken(null);
			user.setForgotPasswordTokenExpiryDate(null);
			user.setProfileImageBinary(null); // Explicitly set to null to avoid bytea/oid type mismatch
			userService.persist(user);
			log.info("User created with ID: {}", user.getUserId());
			
			// Save user credential
			userRestHelper.saveUserCredential(user, encodedPassword);

			// Create company
			Company company = companyRestHelper.registerCompany(registrationModel);
			if (company == null) {
				throw new RuntimeException("Company registration failed: null returned");
			}
			
			// Validate currency
			if (company.getCurrencyCode() == null || company.getCurrencyCode().getCurrencyCode() == null) {
				throw new RuntimeException("Currency code is required but was null");
			}
			
			Integer currencyCodeValue = company.getCurrencyCode().getCurrencyCode();
			currencyService.updateCurrencyProfile(currencyCodeValue);
			
			// Create currency conversion
			CurrencyConversion currencyConversion = new CurrencyConversion();
			Currency currency = currencyService.findByPK(currencyCodeValue);
			if (currency == null) {
				throw new RuntimeException("Currency not found for code: " + currencyCodeValue);
			}
			currencyConversion.setCurrencyCode(currency);
			currencyConversion.setCurrencyCodeConvertedTo(currency);
			currencyConversion.setExchangeRate(BigDecimal.ONE);
			currencyConversion.setCreatedDate(LocalDateTime.now());
			currencyExchangeService.persist(currencyConversion);
			
			// Persist company
			company.setCreatedBy(user.getUserId());
			company.setCreatedDate(LocalDateTime.now());
			company.setDeleteFlag(Boolean.FALSE);
			companyService.persist(company);
			log.info("Company created with ID: {}", company.getCompanyId());
			
			// Link user to company
			user.setCompany(company);
			userService.update(user);
			
			// Setup user password
			UserModel selecteduser = new UserModel();
			selecteduser.setEmail(registrationModel.getEmail());
			selecteduser.setUrl(registrationModel.getLoginUrl());
			selecteduser.setPassword(registrationModel.getPassword());
			
			// Create password token and attempt to send email
			String passwordToken = userService.createPassword(user, selecteduser, null);

			// Check if SMTP is configured - if not, we'll include the password link in response
			boolean smtpConfigured = emailSender.isSmtpConfigured();
			String passwordResetLink = null;
			if (!smtpConfigured && passwordToken != null) {
				// Validate and sanitize URL to prevent XSS
				String loginUrl = selecteduser.getUrl();
				if (loginUrl != null && isValidUrl(loginUrl)) {
					passwordResetLink = loginUrl + "/new-password?token=" + passwordToken;
					log.info("SMTP not configured. Password reset link generated for user: {}", sanitizeForLog(selecteduser.getEmail()));
				} else {
					log.warn("Invalid login URL provided: {}", sanitizeForLog(loginUrl));
					// Use a default safe URL or omit the link
					passwordResetLink = null;
				}
			}

			// Create email log
			EmailLogs emailLogs = new EmailLogs();
			emailLogs.setEmailDate(LocalDateTime.now());
			emailLogs.setEmailTo(selecteduser.getEmail());
			emailLogs.setEmailFrom(selecteduser.getEmail());
			emailLogs.setCreatedDate(LocalDateTime.now());
			emailLogs.setCreatedBy(user.getUserId());
			String baseUrl = ServletUriComponentsBuilder.fromRequestUri(request)
					.replacePath(null)
					.build()
					.toUriString();
			emailLogs.setBaseUrl(baseUrl);
			emailLogs.setModuleName("REGISTER");
			emaiLogsService.persist(emailLogs);
			
			// Create petty cash account
			BankAccount pettyCash = new BankAccount();
			pettyCash.setBankName("PettyCash");
			pettyCash.setBankAccountName(company.getCompanyName());
			BankAccountType bankAccountType = bankAccountTypeService.getBankAccountType(3);
			pettyCash.setBankAccountType(bankAccountType);
			pettyCash.setCreatedBy(user.getUserId());
			pettyCash.setCreatedDate(LocalDateTime.now());
			pettyCash.setBankAccountCurrency(company.getCurrencyCode());
			pettyCash.setPersonalCorporateAccountInd('C');
			pettyCash.setOpeningBalance(BigDecimal.ZERO);
			pettyCash.setCurrentBalance(BigDecimal.ZERO);
			pettyCash.setOpeningDate(LocalDateTime.now());
			pettyCash.setAccountNumber("NA");
			BankAccountStatus bankAccountStatus = bankAccountStatusService.getBankAccountStatusByName("ACTIVE");
			pettyCash.setBankAccountStatus(bankAccountStatus);

			if (pettyCash.getTransactionCategory() == null) {
				TransactionCategory bankCategory = transactionCategoryService
						.findTransactionCategoryByTransactionCategoryCode(
								TransactionCategoryCodeEnum.PETTY_CASH.getCode());
				pettyCash.setTransactionCategory(bankCategory);
			}
			bankAccountService.persist(pettyCash);

			// Create journal entries
			TransactionCategory category = transactionCategoryService
					.findByPK(pettyCash.getTransactionCategory().getTransactionCategoryId());
			TransactionCategory transactionCategory = getValidTransactionCategory(category);
			// Use String.equalsIgnoreCase directly to avoid deprecated StringUtils method
			boolean isDebit = transactionCategory.getTransactionCategoryCode() != null &&
					transactionCategory.getTransactionCategoryCode().equalsIgnoreCase(
							TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_LIABILITIES.getCode());

			List<JournalLineItem> journalLineItemList = new ArrayList<>();
			Journal journal = new Journal();
			
			JournalLineItem journalLineItem1 = new JournalLineItem();
			journalLineItem1.setTransactionCategory(category);
			if (isDebit) {
				journalLineItem1.setDebitAmount(pettyCash.getOpeningBalance());
			} else {
				journalLineItem1.setCreditAmount(pettyCash.getOpeningBalance());
			}
			journalLineItem1.setReferenceType(PostingReferenceTypeEnum.PETTY_CASH);
			journalLineItem1.setReferenceId(category.getTransactionCategoryId());
			journalLineItem1.setCreatedBy(user.getUserId());
			journalLineItem1.setExchangeRate(BigDecimal.ONE);
			journalLineItem1.setJournal(journal);
			journalLineItemList.add(journalLineItem1);

			JournalLineItem journalLineItem2 = new JournalLineItem();
			journalLineItem2.setTransactionCategory(transactionCategory);
			if (!isDebit) {
				journalLineItem2.setDebitAmount(pettyCash.getOpeningBalance());
			} else {
				journalLineItem2.setCreditAmount(pettyCash.getOpeningBalance());
			}
			journalLineItem2.setReferenceType(PostingReferenceTypeEnum.PETTY_CASH);
			journalLineItem2.setReferenceId(transactionCategory.getTransactionCategoryId());
			journalLineItem2.setCreatedBy(user.getUserId());
			journalLineItem2.setExchangeRate(BigDecimal.ONE);
			journalLineItem2.setJournal(journal);
			journalLineItemList.add(journalLineItem2);

			journal.setJournalLineItems(journalLineItemList);
			journal.setCreatedBy(user.getUserId());
			journal.setPostingReferenceType(PostingReferenceTypeEnum.PETTY_CASH);
			journal.setJournalDate(LocalDate.now());
			journal.setTransactionDate(LocalDate.now());
			journalService.persist(journal);
			
			coacTransactionCategoryService.addCoacTransactionCategory(
					pettyCash.getTransactionCategory().getChartOfAccount(), pettyCash.getTransactionCategory());

			// Build response message
			String responseMessage;
			if (passwordResetLink != null) {
				// SMTP not configured - include password link in response
				// HTML encode the URL to prevent XSS
				String encodedUrl = StringEscapeUtils.escapeHtml4(passwordResetLink);
				responseMessage = "Registration successful. Email could not be sent (SMTP not configured).\n" +
						"Please use this link to set your password:\n" + encodedUrl;
			} else {
				responseMessage = "Registration successful";
			}
			log.info("Registration completed successfully for company: {}", sanitizeForLog(company.getCompanyName()));
			return new ResponseEntity<>(responseMessage, HttpStatus.OK);
		} catch (Exception e) {
			// Sanitize user input to prevent log injection
			// registrationModel cannot be null here due to earlier null check
			String sanitizedCompanyName = sanitizeForLog(registrationModel.getCompanyName());
			String sanitizedEmail = sanitizeForLog(registrationModel.getEmail());
			log.error("Registration failed for company: {}, email: {}", sanitizedCompanyName, sanitizedEmail);
			log.error("Error during company registration: ", e);
			
			// Return generic error message to prevent information exposure
			String errorMessage = "Registration failed. Please try again or contact support.";
			
			// Set CORS headers - validate origin against whitelist
			HttpHeaders headers = new HttpHeaders();
			String origin = request.getHeader("Origin");
			String allowedOrigin = determineAllowedOrigin(origin);
			if (!allowedOrigin.isEmpty()) {
				headers.set("Access-Control-Allow-Origin", allowedOrigin);
			}
			headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
			headers.set("Access-Control-Allow-Headers", "x-requested-with, authorization, content-type");
			headers.set("Access-Control-Allow-Credentials", "true");
			return new ResponseEntity<>(errorMessage, headers, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Sanitize user input for logging to prevent log injection attacks
	 * @param value The value to sanitize
	 * @return Sanitized value safe for logging
	 */
	private static String sanitizeForLog(String value) {
		if (value == null) {
			return "null";
		}
		// Remove newlines, carriage returns, and tabs to prevent log injection
		return value.replace('\n', '_').replace('\r', '_').replace('\t', '_');
	}

	/**
	 * Validates URL to prevent XSS attacks
	 * @param url The URL to validate
	 * @return true if URL is safe, false otherwise
	 */
	private static boolean isValidUrl(String url) {
		if (url == null || url.trim().isEmpty()) {
			return false;
		}
		// Check for dangerous characters that could be used for XSS
		String dangerousChars = "<>\"'&";
		for (char c : dangerousChars.toCharArray()) {
			if (url.indexOf(c) >= 0) {
				return false;
			}
		}
		// Basic URL format validation - must start with http:// or https://
		String trimmed = url.trim().toLowerCase();
		return trimmed.startsWith("http://") || trimmed.startsWith("https://");
	}

	/**
	 * Validates the Origin header against a whitelist of trusted origins
	 * to prevent Cross-site scripting (XSS) vulnerabilities.
	 * 
	 * @param origin The Origin header value from the request
	 * @return The validated origin if it's in the whitelist, "*" if wildcard is configured,
	 *         or an empty string if the origin is not trusted
	 */
	private String determineAllowedOrigin(String origin) {
		// Parse allowed origins from configuration
		Set<String> allowedOrigins = new HashSet<>();
		if (allowedOriginsConfig != null && !allowedOriginsConfig.trim().isEmpty()) {
			allowedOrigins = new HashSet<>(Arrays.asList(allowedOriginsConfig.split(",")));
		} else {
			allowedOrigins.add("*");
		}

		// If wildcard is configured, allow all origins
		if (allowedOrigins.contains("*")) {
			return "*";
		}

		// If the request origin is in the allowed list, return it
		if (origin != null && !origin.trim().isEmpty() && allowedOrigins.contains(origin)) {
			return origin;
		}

		// Origin not in whitelist - return empty string (no CORS header will be set)
		// This is safer than reflecting an untrusted origin
		return "";
	}

	@LogRequest
	@GetMapping(value = "/getCountry")
	public ResponseEntity<List<Country>> getCountry() {
		try {

			List<Country> countryList = countryService.getCountries();
			if (countryList != null && !countryList.isEmpty()) {
				return new ResponseEntity<>(countryList, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			log.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@GetMapping(value = "/getState")
	public ResponseEntity<List<DropdownModel>> getState(@RequestParam Integer countryCode) {
		try {

			Map<StateFilterEnum, Object> filterMap = new EnumMap<>(StateFilterEnum.class);
			filterMap.put(StateFilterEnum.COUNTRY, countryService.getCountry(countryCode));
			List<State> stateList = stateService.getstateList(filterMap);
			List<DropdownModel> modelList = new ArrayList<>();
			if (stateList != null && !stateList.isEmpty()) {
				for (State state : stateList)
					modelList.add(new DropdownModel(state.getId(), state.getStateName()));
				return new ResponseEntity<>(modelList, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(modelList, HttpStatus.OK);
			}
		} catch (Exception e) {
			log.error(ERROR, e);
			// Return empty list on error instead of 500 with no body
			return new ResponseEntity<>(Collections.emptyList(), HttpStatus.OK);
		}
	}

	private TransactionCategory getValidTransactionCategory(TransactionCategory transactionCategory) {
		String transactionCategoryCode = transactionCategory.getChartOfAccount().getChartOfAccountCode();
		ChartOfAccountCategoryCodeEnum chartOfAccountCategoryCodeEnum = ChartOfAccountCategoryCodeEnum
				.getChartOfAccountCategoryCodeEnum(transactionCategoryCode);
		if (chartOfAccountCategoryCodeEnum == null)
			return null;
		switch (chartOfAccountCategoryCodeEnum) {
		case EQUITY:
		case OTHER_LIABILITY:
		case OTHER_CURRENT_LIABILITIES:
			return transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(
					TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_ASSETS.getCode());
		default:
			return transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(
					TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_LIABILITIES.getCode());
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@LogExecutionTime
	@PostMapping(value = "/update")
	public ResponseEntity<String> update(@ModelAttribute CompanyModel companyModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			Company company = companyRestHelper.getEntity(companyModel, userId);
			company.setLastUpdateDate(LocalDateTime.now());
			company.setLastUpdatedBy(userId);
			if (companyModel.getCountryId() != null) {
				company.setCompanyCountryCode(countryService.getCountry(companyModel.getCountryId()));
			}
			if(companyModel.getStateId() != null){
				company.setCompanyStateCode(
						stateService.findByPK(companyModel.getStateId()));
			}
			if(companyModel.getCompanyStateCode() != null){
				company.setCompanyStateCode(
						stateService.findByPK(companyModel.getCompanyStateCode()));
			}
			if(companyModel.getIsDesignatedZone() != null){
				company.setIsDesignatedZone(companyModel.getIsDesignatedZone());
			}
			if(companyModel.getIsRegisteredVat() != null){
				company.setIsRegisteredVat(companyModel.getIsRegisteredVat());
			}
			if (companyModel.getVatRegistrationDate() != null) {
				Instant instant = Instant.ofEpochMilli(companyModel.getVatRegistrationDate().getTime());
				LocalDateTime vatRegistrationDate = LocalDateTime.ofInstant(instant,
						ZoneId.systemDefault());
				company.setVatRegistrationDate(vatRegistrationDate);
			}
			if(companyModel.getTaxRegistrationNumber() != null){
				company.setVatNumber(companyModel.getTaxRegistrationNumber());
			}
			companyService.update(company);
			currencyService.updateCurrencyProfile(company.getCurrencyCode().getCurrencyCode());
			if(companyModel.getCompanyName() !=null){
				BankAccount bankAccount = bankAccountService.getBankAccountById(10000);
				User user = userServiceNew.findByPK(userId);
				bankAccount.setBankAccountName(companyModel.getCompanyName());
				bankAccount.setLastUpdateDate(LocalDateTime.now());
				bankAccount.setLastUpdatedBy(user.getUserId());
				bankAccountService.update(bankAccount);
			}
			return new ResponseEntity<>(MSG_UPDATED_SUCCESSFULLY, HttpStatus.OK);
		} catch (Exception e) {
			log.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@LogExecutionTime
	@GetMapping(value = "/getCurrency")
	public ResponseEntity<List<Currency>> getCurrencies() {
		try {
			List<Currency> currencies = currencyService.getCurrenciesProfile();
			if (currencies != null && !currencies.isEmpty()) {
				return new ResponseEntity<>(currencies, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(Collections.emptyList(), HttpStatus.OK);
			}
		} catch (Exception e) {
			log.error(ErrorConstant.ERROR, e);
			// Return empty list on error instead of 500 with no body
			return new ResponseEntity<>(Collections.emptyList(), HttpStatus.OK);
		}
	}

	@LogRequest
	@LogExecutionTime
	@GetMapping(value = "/getHealthCheck")
	public ResponseEntity<Object> getDbConnection() {
		try {
			Integer company = companyService.getDbConncection();
			if (company == null) {
				HealthCheckApiResponseModel response = new HealthCheckApiResponseModel();
				response.setMessage("HealthCheck failed");
				response.setStatusCode(HttpStatus.OK.value());
				return new ResponseEntity<>(response, HttpStatus.OK);
			} else {
				HealthCheckApiResponseModel response = new HealthCheckApiResponseModel(); 
				response.setMessage("HealthCheck successful");
				response.setStatusCode(HttpStatus.OK.value());
				return new ResponseEntity<>(response, HttpStatus.OK);
			}
		} catch (Exception e) {
			log.error(ERROR, e);
				HealthCheckApiResponseModel response = new HealthCheckApiResponseModel();
			response.setMessage("Internal Server Error");
			response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
			return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@LogExecutionTime
	@GetMapping(value = "/getCompanyCurrency")
	public ResponseEntity<Object> getCurrencyConversionById() {
		Currency companyCurrency = companyService.getCompanyCurrency();
		if (companyCurrency != null) {

			CurrencyConversionResponseModel currencyConversionResponseModel = new CurrencyConversionResponseModel();
			currencyConversionResponseModel.setCurrencyCode(companyCurrency.getCurrencyCode());
			currencyConversionResponseModel.setCurrencyName(companyCurrency.getCurrencyName()+" - "+companyCurrency.getCurrencyIsoCode());
			currencyConversionResponseModel.setCurrencyIsoCode(companyCurrency.getCurrencyIsoCode());
			currencyConversionResponseModel.setDescription(companyCurrency.getDescription());
			currencyConversionResponseModel.setCurrencySymbol(companyCurrency.getCurrencySymbol());
			return new ResponseEntity<>(currencyConversionResponseModel, HttpStatus.OK);
		} 
			return new ResponseEntity<>("Currency Not Found", HttpStatus.NOT_FOUND);
	}

	@LogRequest
	@LogExecutionTime
	@GetMapping(value = "/getById")
	public ResponseEntity<CompanyModel> getById(@RequestParam(value = "id") Integer id) {
		try {
			log.debug("CompanyController::getById: Get Company by ID {}",id);
			Company company = companyService.findByPK(id);
			
			if (company == null) {
				log.debug("CompanyController::getById: Company Not found.");
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			log.debug("CompanyController::getById:Company name {}  found.",company.getCompanyName());
			return new ResponseEntity<>(companyRestHelper.getModel(company), HttpStatus.OK);
		} catch (Exception e) {
			log.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@GetMapping(value = "/getCompanyType")
	public ResponseEntity<List<DropdownModel>> getCompanyType() {
		try {
			List<CompanyType> companyList = companyTypeRepository.findAll();
			List<DropdownModel> dropdownModelList=new ArrayList<>();
			for (CompanyType companyType:
					companyList) {
				DropdownModel dropdownModel =new DropdownModel();
				dropdownModel.setLabel(companyType.getCompanyTypeName());
				dropdownModel.setValue(companyType.getId());
				dropdownModelList.add(dropdownModel);
			}
			if (dropdownModelList != null && ! dropdownModelList.isEmpty()) {
				return new ResponseEntity<>(dropdownModelList, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(Collections.emptyList(), HttpStatus.OK);
			}
		} catch (Exception e) {
			log.error(ERROR, e);
			// Return empty list on error instead of 500 with no body
			return new ResponseEntity<>(Collections.emptyList(), HttpStatus.OK);
		}
	}
	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@LogExecutionTime
	@PostMapping(value = "/updateCompanyDetailsForPayrollRun")
	public ResponseEntity<String> updateCompanyDetailsForPayrollRun(@ModelAttribute CompanyModel companyModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			Company company = new Company();
			if (userId != null) {
				User user = userService.findByPK(userId);
				// XXX : assumption company allways present
				company = user.getCompany();
			}
			company.setLastUpdateDate(LocalDateTime.now());
			company.setLastUpdatedBy(userId);
			if (companyModel.getCompanyBankCode() != null) {
				company.setCompanyBankCode(companyModel.getCompanyBankCode());
			}

			if(companyModel.getCompanyNumber() != null){
				company.setCompanyNumber(companyModel.getCompanyNumber());
			}
			companyService.update(company);
			return new ResponseEntity<>(MSG_UPDATED_SUCCESSFULLY, HttpStatus.OK);
		} catch (Exception e) {
			log.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	private final Environment env;

	/**
	 * Added for returning simpleaccounts release number
	 * @return
	 */
	@LogRequest
	@GetMapping(value = "/getSimpleAccountsreleasenumber")
	public ResponseEntity<SimpleAccountsConfigModel> getSimpleAccountsReleaseNumber(HttpServletRequest request)
	{

		SimpleAccountsConfigModel config = new SimpleAccountsConfigModel();
		String release = env.getProperty(ConfigurationConstants.SIMPLEACCOUNTS_RELEASE);
		if (release != null && !release.isEmpty()) {
			config.setSimpleAccountsRelease(release);
		} else {
			config.setSimpleAccountsRelease("Unknown");
		}
		return new ResponseEntity<>(config, HttpStatus.OK);
	}
	@LogRequest
	@PostMapping(value = "/updateSifSettings")
	public ResponseEntity<Object> update( @RequestParam(required = true, defaultValue = "true") boolean generateSif, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			Company company = new Company();
			if (userId != null) {
				User user = userService.findByPK(userId);
				company = user.getCompany();
					company.setGenerateSif(generateSif);
			}
			companyService.update(company);
			return new ResponseEntity<>(MSG_UPDATED_SUCCESSFULLY, HttpStatus.OK);
		} catch (Exception e) {
			log.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
