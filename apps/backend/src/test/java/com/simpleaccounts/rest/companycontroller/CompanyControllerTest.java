package com.simpleaccounts.rest.companycontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.BankAccountType;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.repository.CompanyTypeRepository;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.bankaccountcontroller.BankAccountRestHelper;
import com.simpleaccounts.rest.currencyconversioncontroller.CurrencyConversionResponseModel;
import com.simpleaccounts.rest.usercontroller.UserRestHelper;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.BankAccountStatusService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.env.Environment;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(CompanyController.class)
@AutoConfigureMockMvc(addFilters = false)
class CompanyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private CountryService countryService;
    @MockBean private EmaiLogsService emaiLogsService;
    @MockBean private StateService stateService;
    @MockBean private BankAccountService bankAccountService;
    @MockBean private TransactionCategoryService transactionCategoryService;
    @MockBean private JournalService journalService;
    @MockBean private CoacTransactionCategoryService coacTransactionCategoryService;
    @MockBean private BankAccountStatusService bankAccountStatusService;
    @MockBean private CompanyService companyService;
    @MockBean private CurrencyService currencyService;
    @MockBean private CompanyTypeService companyTypeService;
    @MockBean private IndustryTypeService industryTypeService;
    @MockBean private JwtTokenUtil jwtTokenUtil;
    @MockBean private CompanyRestHelper companyRestHelper;
    @MockBean private CompanyTypeRepository companyTypeRepository;
    @MockBean private RoleService roleService;
    @MockBean private UserService userService;
    @MockBean private CurrencyExchangeService currencyExchangeService;
    @MockBean private BankAccountTypeService bankAccountTypeService;
    @MockBean private UserRestHelper userRestHelper;
    @MockBean private BankAccountRestHelper bankRestHelper;
    @MockBean private CustomUserDetailsService customUserDetailsService;
    @MockBean private Environment env;

    @Test
    void getCompanyListShouldReturnCompanies() throws Exception {
        List<Company> companyList = Arrays.asList(new Company(), new Company());
        List<CompanyListModel> modelList = Arrays.asList(new CompanyListModel(), new CompanyListModel());

        when(companyService.getCompanyList(any())).thenReturn(companyList);
        when(companyRestHelper.getModelList(companyList)).thenReturn(modelList);

        mockMvc.perform(get("/rest/company/getList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));

        verify(companyService).getCompanyList(any());
        verify(companyRestHelper).getModelList(companyList);
    }

    @Test
    void getCompanyListShouldReturnNotFoundWhenNull() throws Exception {
        when(companyService.getCompanyList(any())).thenReturn(null);

        mockMvc.perform(get("/rest/company/getList"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getCompaniesForDropdownShouldReturnDropdownList() throws Exception {
        List<DropdownModel> dropdownList = Arrays.asList(
            new DropdownModel(1, "Company 1"),
            new DropdownModel(2, "Company 2")
        );

        when(companyService.getCompaniesForDropdown()).thenReturn(dropdownList);

        mockMvc.perform(get("/rest/company/getCompaniesForDropdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void deleteCompanyShouldSetDeleteFlag() throws Exception {
        Company company = new Company();
        company.setCompanyId(1);
        company.setDeleteFlag(false);

        when(companyService.findByPK(1)).thenReturn(company);

        mockMvc.perform(delete("/rest/company/delete").param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Deleted Successfully")));

        verify(companyService).findByPK(1);
        verify(companyService).update(company);
    }

    @Test
    void deleteCompanyShouldReturnInternalServerErrorOnException() throws Exception {
        when(companyService.findByPK(1)).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(delete("/rest/company/delete").param("id", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void deleteCompaniesShouldDeleteMultiple() throws Exception {
        mockMvc.perform(delete("/rest/company/deletes")
                        .contentType("application/json")
                        .content("{\"ids\":[1,2,3]}"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Companies Deleted successfully")));

        verify(companyService).deleteByIds(any());
    }

    @Test
    void deleteCompaniesShouldReturnErrorOnException() throws Exception {
        when(companyService.deleteByIds(any())).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(delete("/rest/company/deletes")
                        .contentType("application/json")
                        .content("{\"ids\":[1,2,3]}"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(Matchers.containsString("Cannot Delete")));
    }

    @Test
    void getCompanyDetailsShouldReturnCompanyForLoggedInUser() throws Exception {
        User user = new User();
        user.setUserId(1);
        Company company = new Company();
        company.setCompanyId(1);
        company.setCompanyName("Test Company");
        user.setCompany(company);

        CompanyModel companyModel = new CompanyModel();
        companyModel.setCompanyId(1);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(user);
        when(companyRestHelper.getModel(company)).thenReturn(companyModel);

        mockMvc.perform(get("/rest/company/getCompanyDetails"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyId").value(1));
    }

    @Test
    void getCompanyDetailsShouldReturnNotFoundWhenUserNotFound() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(null);

        mockMvc.perform(get("/rest/company/getCompanyDetails"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getCompanyCountShouldReturnOneWhenCompanyExists() throws Exception {
        Company company = new Company();
        when(companyService.getCompany()).thenReturn(company);

        mockMvc.perform(get("/rest/company/getCompanyCount"))
                .andExpect(status().isOk())
                .andExpect(content().string("1"));
    }

    @Test
    void getCompanyCountShouldReturnZeroWhenNoCompany() throws Exception {
        when(companyService.getCompany()).thenReturn(null);

        mockMvc.perform(get("/rest/company/getCompanyCount"))
                .andExpect(status().isOk())
                .andExpect(content().string("0"));
    }

    @Test
    void getTimeZoneListShouldReturnTimeZones() throws Exception {
        List<String> timeZones = Arrays.asList("UTC", "EST", "PST");
        when(companyRestHelper.getTimeZoneList()).thenReturn(timeZones);

        mockMvc.perform(get("/rest/company/getTimeZoneList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    void saveShouldPersistNewCompany() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(companyRestHelper.getEntity(any(), eq(1))).thenReturn(new Company());

        mockMvc.perform(post("/rest/company/save")
                        .param("companyName", "Test Company"))
                .andExpect(status().isOk());

        verify(companyService).persist(any(Company.class));
    }

    @Test
    void registerShouldReturnErrorWhenCompanyExists() throws Exception {
        Company existingCompany = new Company();
        when(companyService.getCompany()).thenReturn(existingCompany);

        mockMvc.perform(post("/rest/company/register")
                        .param("firstName", "John")
                        .param("lastName", "Doe")
                        .param("email", "john@example.com")
                        .param("password", "password123"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Company Already Exist")));
    }

    @Test
    void getCountryShouldReturnCountryList() throws Exception {
        List<Country> countries = Arrays.asList(new Country(), new Country());
        when(countryService.getCountries()).thenReturn(countries);

        mockMvc.perform(get("/rest/company/getCountry"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getCountryShouldReturnNotFoundWhenEmpty() throws Exception {
        when(countryService.getCountries()).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/company/getCountry"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getStateShouldReturnStateList() throws Exception {
        Country country = new Country();
        State state1 = new State();
        state1.setId(1);
        state1.setStateName("State1");

        List<State> states = Arrays.asList(state1);
        when(countryService.getCountry(1)).thenReturn(country);
        when(stateService.getstateList(any())).thenReturn(states);

        mockMvc.perform(get("/rest/company/getState").param("countryCode", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void updateShouldUpdateCompany() throws Exception {
        Company company = new Company();
        company.setCompanyId(1);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(companyRestHelper.getEntity(any(), eq(1))).thenReturn(company);

        mockMvc.perform(post("/rest/company/update")
                        .param("companyId", "1")
                        .param("companyName", "Updated Company"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Updated Successfully")));

        verify(companyService).update(any(Company.class));
    }

    @Test
    void getCurrenciesShouldReturnCurrencyList() throws Exception {
        List<Currency> currencies = Arrays.asList(new Currency(), new Currency());
        when(currencyService.getCurrenciesProfile()).thenReturn(currencies);

        mockMvc.perform(get("/rest/company/getCurrency"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getCurrenciesShouldReturnNoContentWhenEmpty() throws Exception {
        when(currencyService.getCurrenciesProfile()).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/company/getCurrency"))
                .andExpect(status().isNoContent());
    }

    @Test
    void getHealthCheckShouldReturnSuccessWhenConnectionValid() throws Exception {
        when(companyService.getDbConncection()).thenReturn(1);

        mockMvc.perform(get("/rest/company/getHealthCheck"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("HealthCheck successful"))
                .andExpect(jsonPath("$.statusCode").value(200));
    }

    @Test
    void getHealthCheckShouldReturnFailedWhenConnectionInvalid() throws Exception {
        when(companyService.getDbConncection()).thenReturn(null);

        mockMvc.perform(get("/rest/company/getHealthCheck"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("HealthCheck failed"));
    }

    @Test
    void getCompanyCurrencyShouldReturnCurrency() throws Exception {
        Currency currency = new Currency();
        currency.setCurrencyCode("USD");
        currency.setCurrencyName("US Dollar");
        currency.setCurrencyIsoCode("USD");
        currency.setCurrencySymbol("$");

        when(companyService.getCompanyCurrency()).thenReturn(currency);

        mockMvc.perform(get("/rest/company/getCompanyCurrency"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currencyCode").value("USD"))
                .andExpect(jsonPath("$.currencySymbol").value("$"));
    }

    @Test
    void getCompanyCurrencyShouldReturnNotFoundWhenNull() throws Exception {
        when(companyService.getCompanyCurrency()).thenReturn(null);

        mockMvc.perform(get("/rest/company/getCompanyCurrency"))
                .andExpect(status().isNotFound())
                .andExpect(content().string(Matchers.containsString("Currency Not Found")));
    }

    @Test
    void getByIdShouldReturnCompany() throws Exception {
        Company company = new Company();
        company.setCompanyId(1);
        company.setCompanyName("Test Company");

        CompanyModel model = new CompanyModel();
        model.setCompanyId(1);

        when(companyService.findByPK(1)).thenReturn(company);
        when(companyRestHelper.getModel(company)).thenReturn(model);

        mockMvc.perform(get("/rest/company/getById").param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyId").value(1));
    }

    @Test
    void getByIdShouldReturnNotFoundWhenCompanyDoesNotExist() throws Exception {
        when(companyService.findByPK(1)).thenReturn(null);

        mockMvc.perform(get("/rest/company/getById").param("id", "1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getCompanyTypeShouldReturnCompanyTypes() throws Exception {
        CompanyType type1 = new CompanyType();
        type1.setId(1);
        type1.setCompanyTypeName("LLC");

        CompanyType type2 = new CompanyType();
        type2.setId(2);
        type2.setCompanyTypeName("Corporation");

        when(companyTypeRepository.findAll()).thenReturn(Arrays.asList(type1, type2));

        mockMvc.perform(get("/rest/company/getCompanyType"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void updateCompanyDetailsForPayrollRunShouldUpdate() throws Exception {
        User user = new User();
        Company company = new Company();
        user.setCompany(company);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(user);

        mockMvc.perform(post("/rest/company/updateCompanyDetailsForPayrollRun")
                        .param("companyBankCode", "BANK123")
                        .param("companyNumber", "123456"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Updated Successfully")));

        verify(companyService).update(company);
    }

    @Test
    void getSimpleAccountsReleaseNumberShouldReturnReleaseNumber() throws Exception {
        when(env.getProperty("SIMPLEACCOUNTS_RELEASE")).thenReturn("v1.2.3");

        mockMvc.perform(get("/rest/company/getSimpleAccountsreleasenumber"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.simpleAccountsRelease").value("v1.2.3"));
    }

    @Test
    void getSimpleAccountsReleaseNumberShouldReturnUnknownWhenNotSet() throws Exception {
        when(env.getProperty("SIMPLEACCOUNTS_RELEASE")).thenReturn(null);

        mockMvc.perform(get("/rest/company/getSimpleAccountsreleasenumber"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.simpleAccountsRelease").value("Unknown"));
    }

    @Test
    void updateSifSettingsShouldUpdateGenerateSif() throws Exception {
        User user = new User();
        Company company = new Company();
        user.setCompany(company);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(user);

        mockMvc.perform(post("/rest/company/updateSifSettings")
                        .param("generateSif", "true"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Updated Successfully")));

        verify(companyService).update(company);
    }
}
