package com.simpleaccounts.rest.companycontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Country;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.State;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.repository.CompanyTypeRepository;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.bankaccountcontroller.BankAccountRestHelper;
import com.simpleaccounts.rest.usercontroller.UserRestHelper;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.BankAccountStatusService;
import com.simpleaccounts.service.BankAccountTypeService;
import com.simpleaccounts.service.CoacTransactionCategoryService;
import com.simpleaccounts.service.CompanyService;
import com.simpleaccounts.service.CompanyTypeService;
import com.simpleaccounts.service.CountryService;
import com.simpleaccounts.service.CurrencyExchangeService;
import com.simpleaccounts.service.CurrencyService;
import com.simpleaccounts.service.EmaiLogsService;
import com.simpleaccounts.service.IndustryTypeService;
import com.simpleaccounts.service.JournalService;
import com.simpleaccounts.service.RoleService;
import com.simpleaccounts.service.StateService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("CompanyController Unit Tests")
class CompanyControllerTest {

    private MockMvc mockMvc;

    @Mock private CountryService countryService;
    @Mock private EmaiLogsService emaiLogsService;
    @Mock private StateService stateService;
    @Mock private BankAccountService bankAccountService;
    @Mock private TransactionCategoryService transactionCategoryService;
    @Mock private JournalService journalService;
    @Mock private CoacTransactionCategoryService coacTransactionCategoryService;
    @Mock private BankAccountStatusService bankAccountStatusService;
    @Mock private CompanyService companyService;
    @Mock private CurrencyService currencyService;
    @Mock private CompanyTypeService companyTypeService;
    @Mock private IndustryTypeService industryTypeService;
    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private CompanyRestHelper companyRestHelper;
    @Mock private CompanyTypeRepository companyTypeRepository;
    @Mock private RoleService roleService;
    @Mock private UserService userService;
    @Mock private CurrencyExchangeService currencyExchangeService;
    @Mock private BankAccountTypeService bankAccountTypeService;
    @Mock private UserRestHelper userRestHelper;
    @Mock private BankAccountRestHelper bankRestHelper;
    @Mock private UserService userServiceNew;
    @Mock private Environment env;

    @InjectMocks
    private CompanyController companyController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(companyController).build();
    }

    @Test
    @DisplayName("Should return company list")
    void getCompanyListReturnsList() throws Exception {
        List<Company> companies = Arrays.asList(
            createCompany(1, "Company A"),
            createCompany(2, "Company B")
        );
        List<CompanyListModel> models = new ArrayList<>();

        when(companyService.getCompanyList(any()))
            .thenReturn(companies);
        when(companyRestHelper.getModelList(companies))
            .thenReturn(models);

        mockMvc.perform(get("/rest/company/getList"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return not found when company list is null")
    void getCompanyListReturnsNotFound() throws Exception {
        when(companyService.getCompanyList(any()))
            .thenReturn(null);

        mockMvc.perform(get("/rest/company/getList"))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should return companies for dropdown")
    void getCompaniesForDropdownReturnsList() throws Exception {
        List<DropdownModel> dropdownList = Arrays.asList(
            new DropdownModel(1, "Company A"),
            new DropdownModel(2, "Company B")
        );

        when(companyService.getCompaniesForDropdown())
            .thenReturn(dropdownList);

        mockMvc.perform(get("/rest/company/getCompaniesForDropdown"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return company details for logged in user")
    void getCompanyDetailsReturnsCompanyModel() throws Exception {
        User user = createUser(1, "Test", "User", "test@test.com");
        Company company = createCompany(1, "Test Company");
        user.setCompany(company);
        CompanyModel companyModel = new CompanyModel();
        companyModel.setCompanyId(1);
        companyModel.setCompanyName("Test Company");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any()))
            .thenReturn(1);
        when(userService.findByPK(1))
            .thenReturn(user);
        when(companyRestHelper.getModel(company))
            .thenReturn(companyModel);

        mockMvc.perform(get("/rest/company/getCompanyDetails"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return not found when user not found for company details")
    void getCompanyDetailsReturnsNotFoundWhenUserNotFound() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any()))
            .thenReturn(1);
        when(userService.findByPK(1))
            .thenReturn(null);

        mockMvc.perform(get("/rest/company/getCompanyDetails"))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should return company count when company exists")
    void getCompanyCountReturnsOneWhenCompanyExists() throws Exception {
        Company company = createCompany(1, "Test Company");

        when(companyService.getCompany())
            .thenReturn(company);

        mockMvc.perform(get("/rest/company/getCompanyCount"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return zero when no company exists")
    void getCompanyCountReturnsZeroWhenNoCompany() throws Exception {
        when(companyService.getCompany())
            .thenReturn(null);

        mockMvc.perform(get("/rest/company/getCompanyCount"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return time zone list")
    void getTimeZoneListReturnsZones() throws Exception {
        List<String> timeZones = Arrays.asList(
            "Asia/Dubai",
            "Asia/Kolkata",
            "UTC"
        );

        when(companyRestHelper.getTimeZoneList())
            .thenReturn(timeZones);

        mockMvc.perform(get("/rest/company/getTimeZoneList"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should delete company successfully")
    void deleteCompanySucceeds() throws Exception {
        Company company = createCompany(1, "Test Company");

        when(companyService.findByPK(1))
            .thenReturn(company);

        mockMvc.perform(delete("/rest/company/delete").param("id", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return country list")
    void getCountryReturnsList() throws Exception {
        List<Country> countries = Arrays.asList(
            createCountry(1, "United Arab Emirates", "AE"),
            createCountry(2, "Saudi Arabia", "SA")
        );

        when(countryService.getCountries())
            .thenReturn(countries);

        mockMvc.perform(get("/rest/company/getCountry"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return not found when no countries")
    void getCountryReturnsNotFoundWhenEmpty() throws Exception {
        when(countryService.getCountries())
            .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/company/getCountry"))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should return state list by country")
    void getStateReturnsList() throws Exception {
        Country country = createCountry(1, "United Arab Emirates", "AE");
        List<State> states = Arrays.asList(
            createState(1, "Dubai"),
            createState(2, "Abu Dhabi")
        );

        when(countryService.getCountry(1))
            .thenReturn(country);
        when(stateService.getstateList(any()))
            .thenReturn(states);

        mockMvc.perform(get("/rest/company/getState").param("countryCode", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return currencies list")
    void getCurrenciesReturnsList() throws Exception {
        List<Currency> currencies = Arrays.asList(
            createCurrency(1, "UAE Dirham", "AED"),
            createCurrency(2, "US Dollar", "USD")
        );

        when(currencyService.getCurrenciesProfile())
            .thenReturn(currencies);

        mockMvc.perform(get("/rest/company/getCurrency"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return no content when no currencies")
    void getCurrenciesReturnsNoContentWhenEmpty() throws Exception {
        when(currencyService.getCurrenciesProfile())
            .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/company/getCurrency"))
            .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Should return health check status")
    void getHealthCheckReturnsStatus() throws Exception {
        when(companyService.getDbConncection())
            .thenReturn(1);

        mockMvc.perform(get("/rest/company/getHealthCheck"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return health check failed when no db connection")
    void getHealthCheckReturnsFailedWhenNoConnection() throws Exception {
        when(companyService.getDbConncection())
            .thenReturn(null);

        mockMvc.perform(get("/rest/company/getHealthCheck"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return company currency")
    void getCompanyCurrencyReturnsCurrency() throws Exception {
        Currency currency = createCurrency(1, "UAE Dirham", "AED");

        when(companyService.getCompanyCurrency())
            .thenReturn(currency);

        mockMvc.perform(get("/rest/company/getCompanyCurrency"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return not found when company currency not found")
    void getCompanyCurrencyReturnsNotFound() throws Exception {
        when(companyService.getCompanyCurrency())
            .thenReturn(null);

        mockMvc.perform(get("/rest/company/getCompanyCurrency"))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should return company by ID")
    void getByIdReturnsCompany() throws Exception {
        Company company = createCompany(1, "Test Company");
        CompanyModel model = new CompanyModel();
        model.setCompanyId(1);
        model.setCompanyName("Test Company");

        when(companyService.findByPK(1))
            .thenReturn(company);
        when(companyRestHelper.getModel(company))
            .thenReturn(model);

        mockMvc.perform(get("/rest/company/getById").param("id", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return not found when company not found by ID")
    void getByIdReturnsNotFoundWhenNotFound() throws Exception {
        when(companyService.findByPK(999))
            .thenReturn(null);

        mockMvc.perform(get("/rest/company/getById").param("id", "999"))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should return company type list")
    void getCompanyTypeReturnsList() throws Exception {
        when(companyTypeRepository.findAll())
            .thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/company/getCompanyType"))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should return SimpleAccounts release number")
    void getSimpleAccountsReleaseNumberReturnsConfig() throws Exception {
        when(env.getProperty("SIMPLEACCOUNTS_RELEASE"))
            .thenReturn("1.0.0");

        mockMvc.perform(get("/rest/company/getSimpleAccountsreleasenumber"))
            .andExpect(status().isOk());
    }

    private Company createCompany(Integer id, String name) {
        Company company = new Company();
        company.setCompanyId(id);
        company.setCompanyName(name);
        company.setDeleteFlag(false);
        company.setCreatedDate(LocalDateTime.now());
        company.setCreatedBy(1);
        return company;
    }

    private User createUser(Integer id, String firstName, String lastName, String email) {
        User user = new User();
        user.setUserId(id);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setUserEmail(email);
        user.setDeleteFlag(false);
        user.setIsActive(true);
        user.setCreatedDate(LocalDateTime.now());
        user.setCreatedBy(1);
        return user;
    }

    private Country createCountry(Integer code, String name, String isoCode) {
        Country country = new Country();
        country.setCountryCode(code);
        country.setCountryName(name);
        country.setCountryIsoCode(isoCode);
        return country;
    }

    private State createState(Integer id, String name) {
        State state = new State();
        state.setId(id);
        state.setStateName(name);
        return state;
    }

    private Currency createCurrency(Integer code, String name, String isoCode) {
        Currency currency = new Currency();
        currency.setCurrencyCode(code);
        currency.setCurrencyName(name);
        currency.setCurrencyIsoCode(isoCode);
        return currency;
    }
}
