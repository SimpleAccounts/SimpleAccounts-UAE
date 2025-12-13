package com.simpleaccounts.rest.datalistcontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.repository.CompanyTypeRepository;
import com.simpleaccounts.repository.NotesSettingsRepository;
import com.simpleaccounts.repository.ProductCategoryRepository;
import com.simpleaccounts.repository.UnitTypesRepository;
import com.simpleaccounts.rest.excisetaxcontroller.ExciseTaxRestHelper;
import com.simpleaccounts.rest.productcontroller.ProductRestHelper;
import com.simpleaccounts.rest.vatcontroller.VatCategoryRestHelper;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

/**
 * Unit tests for DataListController.
 */
@ExtendWith(MockitoExtension.class)
class DataListControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CountryService countryService;
    @Mock
    private CurrencyService currencyService;
    @Mock
    private ChartOfAccountService transactionTypeService;
    @Mock
    private IndustryTypeService industryTypeService;
    @Mock
    private VatCategoryService vatCategoryService;
    @Mock
    private VatCategoryRestHelper vatCategoryRestHelper;
    @Mock
    private StateService stateService;
    @Mock
    private ChartOfAccountCategoryService chartOfAccountCategoryService;
    @Mock
    private ProductService productService;
    @Mock
    private ProductRestHelper productRestHelper;
    @Mock
    private TransactionCategoryService transactionCategoryService;
    @Mock
    private CompanyTypeRepository companyTypeRepository;
    @Mock
    private ExciseTaxRestHelper exciseTaxRestHelper;
    @Mock
    private TaxTreatmentService taxTreatmentService;
    @Mock
    private UnitTypesRepository unitTypesRepository;
    @Mock
    private NotesSettingsRepository notesSettingsRepository;
    @Mock
    private ProductCategoryRepository productCategoryRepository;

    @InjectMocks
    private DataListController dataListController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(dataListController).build();
    }

    // ========== getCountry Tests ==========

    @Test
    void shouldGetCountryListSuccessfully() throws Exception {
        Country country1 = new Country();
        country1.setId(1);
        country1.setCountryName("United Arab Emirates");

        Country country2 = new Country();
        country2.setId(2);
        country2.setCountryName("Saudi Arabia");

        when(countryService.getCountries()).thenReturn(Arrays.asList(country1, country2));

        mockMvc.perform(get("/rest/datalist/getcountry"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void shouldReturnNotFoundWhenNoCountries() throws Exception {
        when(countryService.getCountries()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/datalist/getcountry"))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnNotFoundWhenCountryListNull() throws Exception {
        when(countryService.getCountries()).thenReturn(null);

        mockMvc.perform(get("/rest/datalist/getcountry"))
                .andExpect(status().isNotFound());
    }

    // ========== getCompanyType Tests ==========

    @Test
    void shouldGetCompanyTypeListSuccessfully() throws Exception {
        CompanyType companyType1 = new CompanyType();
        companyType1.setId(1);
        companyType1.setCompanyTypeName("LLC");

        CompanyType companyType2 = new CompanyType();
        companyType2.setId(2);
        companyType2.setCompanyTypeName("Sole Proprietorship");

        when(companyTypeRepository.findAll()).thenReturn(Arrays.asList(companyType1, companyType2));

        mockMvc.perform(get("/rest/datalist/getCompanyType"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].label").value("LLC"))
                .andExpect(jsonPath("$[1].label").value("Sole Proprietorship"));
    }

    @Test
    void shouldReturnNotFoundWhenNoCompanyTypes() throws Exception {
        when(companyTypeRepository.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/datalist/getCompanyType"))
                .andExpect(status().isNotFound());
    }

    // ========== getTransactionTypes Tests ==========

    @Test
    void shouldGetTransactionTypesSuccessfully() throws Exception {
        ChartOfAccount account = new ChartOfAccount();
        account.setChartOfAccountId(1);
        account.setChartOfAccountName("Assets");

        when(transactionTypeService.findAll()).thenReturn(Collections.singletonList(account));

        mockMvc.perform(get("/rest/datalist/getTransactionTypes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void shouldReturnNotFoundWhenNoTransactionTypes() throws Exception {
        when(transactionTypeService.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/datalist/getTransactionTypes"))
                .andExpect(status().isNotFound());
    }

    // ========== getInvoiceStatusTypes Tests ==========

    @Test
    void shouldGetInvoiceStatusTypesSuccessfully() throws Exception {
        mockMvc.perform(get("/rest/datalist/getInvoiceStatusTypes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // ========== getContactTypes Tests ==========

    @Test
    void shouldGetContactTypesSuccessfully() throws Exception {
        mockMvc.perform(get("/rest/datalist/getContactTypes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // ========== getIndustryTypes Tests ==========

    @Test
    void shouldGetIndustryTypesSuccessfully() throws Exception {
        IndustryType industry1 = new IndustryType();
        industry1.setId(1);
        industry1.setIndustryTypeName("Technology");

        IndustryType industry2 = new IndustryType();
        industry2.setId(2);
        industry2.setIndustryTypeName("Healthcare");

        when(industryTypeService.getIndustryTypes()).thenReturn(Arrays.asList(industry1, industry2));

        mockMvc.perform(get("/rest/datalist/getIndustryTypes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void shouldReturnBadRequestWhenNoIndustryTypes() throws Exception {
        when(industryTypeService.getIndustryTypes()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/datalist/getIndustryTypes"))
                .andExpect(status().isBadRequest());
    }

    // ========== getPayMode Tests ==========

    @Test
    void shouldGetPayModeSuccessfully() throws Exception {
        mockMvc.perform(get("/rest/datalist/payMode"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // ========== getState Tests ==========

    @Test
    void shouldGetStateListSuccessfully() throws Exception {
        Country country = new Country();
        country.setId(1);

        State state1 = new State();
        state1.setId(1);
        state1.setStateName("Dubai");

        State state2 = new State();
        state2.setId(2);
        state2.setStateName("Abu Dhabi");

        when(countryService.getCountry(1)).thenReturn(country);
        when(stateService.getstateList(any())).thenReturn(Arrays.asList(state1, state2));

        mockMvc.perform(get("/rest/datalist/getstate")
                .param("countryCode", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void shouldReturnNotFoundWhenNoStates() throws Exception {
        Country country = new Country();
        country.setId(1);

        when(countryService.getCountry(1)).thenReturn(country);
        when(stateService.getstateList(any())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/datalist/getstate")
                .param("countryCode", "1"))
                .andExpect(status().isNotFound());
    }

    // ========== getUnitTypeList Tests ==========

    @Test
    void shouldGetUnitTypeListSuccessfully() throws Exception {
        UnitType unit1 = new UnitType();
        unit1.setUnitTypeId(1);
        unit1.setUnitType("Piece");
        unit1.setUnitTypeCode("PC");
        unit1.setUnitTypeStatus(true);

        UnitType unit2 = new UnitType();
        unit2.setUnitTypeId(2);
        unit2.setUnitType("Kilogram");
        unit2.setUnitTypeCode("KG");
        unit2.setUnitTypeStatus(true);

        when(unitTypesRepository.findAll()).thenReturn(Arrays.asList(unit1, unit2));

        mockMvc.perform(get("/rest/datalist/getUnitTypeList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    // ========== getTaxTreatment Tests ==========

    @Test
    void shouldGetTaxTreatmentListSuccessfully() throws Exception {
        when(taxTreatmentService.getList()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/datalist/getTaxTreatment"))
                .andExpect(status().isOk());
    }

    // ========== getProductCategoryList Tests ==========

    @Test
    void shouldGetProductCategoryListSuccessfully() throws Exception {
        ProductCategory category1 = new ProductCategory();
        category1.setId(1);
        category1.setProductCategoryName("Electronics");

        ProductCategory category2 = new ProductCategory();
        category2.setId(2);
        category2.setProductCategoryName("Furniture");

        when(productCategoryRepository.getProductCategories(any())).thenReturn(Arrays.asList(category1, category2));

        mockMvc.perform(get("/rest/datalist/getProductCategoryList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // ========== getNoteSettingsInfo Tests ==========

    @Test
    void shouldGetNoteSettingsInfoSuccessfully() throws Exception {
        NotesSettings notesSettings = new NotesSettings();
        notesSettings.setDefaultNotes("Default note");
        notesSettings.setDefaultFootNotes("Default footer");

        when(notesSettingsRepository.findAll()).thenReturn(Collections.singletonList(notesSettings));

        mockMvc.perform(get("/rest/datalist/getNoteSettingsInfo"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnInternalServerErrorWhenNoteSettingsNotFound() throws Exception {
        when(notesSettingsRepository.findAll()).thenThrow(new RuntimeException("No notes found"));

        mockMvc.perform(get("/rest/datalist/getNoteSettingsInfo"))
                .andExpect(status().isInternalServerError());
    }

    // ========== Edge Cases ==========

    @Test
    void shouldHandleExceptionInGetCountry() throws Exception {
        when(countryService.getCountries()).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/rest/datalist/getcountry"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void shouldHandleExceptionInGetCompanyType() throws Exception {
        when(companyTypeRepository.findAll()).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/rest/datalist/getCompanyType"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void shouldHandleExceptionInGetTransactionTypes() throws Exception {
        when(transactionTypeService.findAll()).thenThrow(new RuntimeException("Service error"));

        mockMvc.perform(get("/rest/datalist/getTransactionTypes"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void shouldHandleExceptionInGetIndustryTypes() throws Exception {
        when(industryTypeService.getIndustryTypes()).thenThrow(new RuntimeException("Service error"));

        mockMvc.perform(get("/rest/datalist/getIndustryTypes"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void shouldHandleExceptionInGetState() throws Exception {
        when(countryService.getCountry(anyInt())).thenThrow(new RuntimeException("Country not found"));

        mockMvc.perform(get("/rest/datalist/getstate")
                .param("countryCode", "999"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void shouldHandleExceptionInGetUnitTypeList() throws Exception {
        when(unitTypesRepository.findAll()).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/rest/datalist/getUnitTypeList"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void shouldHandleExceptionInGetTaxTreatment() throws Exception {
        when(taxTreatmentService.getList()).thenThrow(new RuntimeException("Service error"));

        mockMvc.perform(get("/rest/datalist/getTaxTreatment"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void shouldHandleExceptionInGetProductCategoryList() throws Exception {
        when(productCategoryRepository.getProductCategories(any())).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/rest/datalist/getProductCategoryList"))
                .andExpect(status().isInternalServerError());
    }
}
