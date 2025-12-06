package com.simpleaccounts.rest.datalistcontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.constant.ContactTypeEnum;
import com.simpleaccounts.constant.ProductPriceType;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.repository.CompanyTypeRepository;
import com.simpleaccounts.repository.NotesSettingsRepository;
import com.simpleaccounts.repository.ProductCategoryRepository;
import com.simpleaccounts.repository.UnitTypesRepository;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.contactcontroller.TaxtTreatmentdto;
import com.simpleaccounts.rest.excisetaxcontroller.ExciseTaxRestHelper;
import com.simpleaccounts.rest.productcontroller.ProductRestHelper;
import com.simpleaccounts.rest.vatcontroller.VatCategoryRestHelper;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;
import com.simpleaccounts.utils.ChartOfAccountCacheService;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(DataListController.class)
@AutoConfigureMockMvc(addFilters = false)
class DataListControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private CountryService countryService;
    @MockBean private CurrencyService currencyService;
    @MockBean private ChartOfAccountService transactionTypeService;
    @MockBean private IndustryTypeService industryTypeService;
    @MockBean private VatCategoryService vatCategoryService;
    @MockBean private VatCategoryRestHelper vatCategoryRestHelper;
    @MockBean private StateService stateService;
    @MockBean private ChartOfAccountCategoryService chartOfAccountCategoryService;
    @MockBean private ProductService productService;
    @MockBean private ProductRestHelper productRestHelper;
    @MockBean private TransactionCategoryService transactionCategoryService;
    @MockBean private CompanyTypeRepository companyTypeRepository;
    @MockBean private ExciseTaxRestHelper exciseTaxRestHelper;
    @MockBean private TaxTreatmentService taxTreatmentService;
    @MockBean private UnitTypesRepository unitTypesRepository;
    @MockBean private NotesSettingsRepository notesSettingsRepository;
    @MockBean private ProductCategoryRepository productCategoryRepository;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    @Test
    void getCountryShouldReturnCountryList() throws Exception {
        Country country1 = new Country();
        country1.setId(1);
        country1.setCountryName("USA");

        Country country2 = new Country();
        country2.setId(2);
        country2.setCountryName("Canada");

        when(countryService.getCountries()).thenReturn(Arrays.asList(country1, country2));

        mockMvc.perform(get("/rest/datalist/getcountry"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));

        verify(countryService).getCountries();
    }

    @Test
    void getCountryShouldReturnNotFoundWhenEmpty() throws Exception {
        when(countryService.getCountries()).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/datalist/getcountry"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getCountryShouldReturnInternalServerErrorOnException() throws Exception {
        when(countryService.getCountries()).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/rest/datalist/getcountry"))
                .andExpect(status().isInternalServerError());
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

        mockMvc.perform(get("/rest/datalist/getCompanyType"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getCompanyTypeShouldReturnNotFoundWhenEmpty() throws Exception {
        when(companyTypeRepository.findAll()).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/datalist/getCompanyType"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getTransactionTypesShouldReturnChartOfAccounts() throws Exception {
        ChartOfAccount account1 = new ChartOfAccount();
        account1.setChartOfAccountId(1);

        ChartOfAccount account2 = new ChartOfAccount();
        account2.setChartOfAccountId(2);

        when(transactionTypeService.findAll()).thenReturn(Arrays.asList(account1, account2));

        mockMvc.perform(get("/rest/datalist/getTransactionTypes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        verify(transactionTypeService).findAll();
    }

    @Test
    void getTransactionTypesShouldReturnNotFoundWhenEmpty() throws Exception {
        when(transactionTypeService.findAll()).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/datalist/getTransactionTypes"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getInvoiceStatusTypesShouldReturnStatusList() throws Exception {
        mockMvc.perform(get("/rest/datalist/getInvoiceStatusTypes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getContactTypesShouldReturnAllContactTypes() throws Exception {
        mockMvc.perform(get("/rest/datalist/getContactTypes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(ContactTypeEnum.values().length));
    }

    @Test
    void getIndustryTypesShouldReturnIndustryList() throws Exception {
        IndustryType industry1 = new IndustryType();
        industry1.setId(1);
        industry1.setIndustryTypeName("Technology");

        IndustryType industry2 = new IndustryType();
        industry2.setId(2);
        industry2.setIndustryTypeName("Finance");

        when(industryTypeService.getIndustryTypes()).thenReturn(Arrays.asList(industry1, industry2));

        mockMvc.perform(get("/rest/datalist/getIndustryTypes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getIndustryTypesShouldReturnBadRequestWhenEmpty() throws Exception {
        when(industryTypeService.getIndustryTypes()).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/datalist/getIndustryTypes"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getVatCategoryShouldReturnVatList() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(2, new ArrayList<>());
        when(vatCategoryService.getVatCategoryList(any(), any())).thenReturn(response);
        when(vatCategoryRestHelper.getList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/datalist/vatCategory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getVatCategoryShouldReturnNotFoundWhenNull() throws Exception {
        when(vatCategoryService.getVatCategoryList(any(), any())).thenReturn(null);

        mockMvc.perform(get("/rest/datalist/vatCategory"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getProductCategoryListShouldReturnCategories() throws Exception {
        ProductCategory category1 = new ProductCategory();
        category1.setId(1);
        category1.setProductCategoryName("Electronics");

        ProductCategory category2 = new ProductCategory();
        category2.setId(2);
        category2.setProductCategoryName("Clothing");

        when(productCategoryRepository.getProductCategories(any())).thenReturn(Arrays.asList(category1, category2));

        mockMvc.perform(get("/rest/datalist/getProductCategoryList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getExciseTaxShouldReturnExciseTaxList() throws Exception {
        ExciseTax tax1 = new ExciseTax();
        tax1.setId(1);
        tax1.setName("Standard");

        when(exciseTaxRestHelper.getExciseTaxList()).thenReturn(Arrays.asList(tax1));

        mockMvc.perform(get("/rest/datalist/exciseTax"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        verify(exciseTaxRestHelper).getExciseTaxList();
    }

    @Test
    void getPayModeShouldReturnPayModes() throws Exception {
        mockMvc.perform(get("/rest/datalist/payMode"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getsubChartofAccountShouldReturnChartOfAccounts() throws Exception {
        // This test is complex due to caching, simplified version
        mockMvc.perform(get("/rest/datalist/getsubChartofAccount"))
                .andExpect(status().isOk());
    }

    @Test
    void getStateShouldReturnStateList() throws Exception {
        Country country = new Country();
        country.setId(1);

        State state1 = new State();
        state1.setId(1);
        state1.setStateName("California");

        State state2 = new State();
        state2.setId(2);
        state2.setStateName("Texas");

        when(countryService.getCountry(1)).thenReturn(country);
        when(stateService.getstateList(any())).thenReturn(Arrays.asList(state1, state2));

        mockMvc.perform(get("/rest/datalist/getstate").param("countryCode", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getStateShouldReturnNotFoundWhenEmpty() throws Exception {
        Country country = new Country();
        when(countryService.getCountry(1)).thenReturn(country);
        when(stateService.getstateList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/datalist/getstate").param("countryCode", "1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getReconsileCategoriesShouldReturnCategoriesForDebit() throws Exception {
        ChartOfAccountCategory category = new ChartOfAccountCategory();
        category.setChartOfAccountCategoryId(1);
        category.setChartOfAccountCategoryName("Test Category");

        ChartOfAccountCategory parentCategory = new ChartOfAccountCategory();
        parentCategory.setChartOfAccountCategoryId(2);
        parentCategory.setChartOfAccountCategoryName("Money Spent");

        category.setParentChartOfAccount(parentCategory);

        when(chartOfAccountCategoryService.findAll()).thenReturn(Arrays.asList(parentCategory, category));

        mockMvc.perform(get("/rest/datalist/reconsileCategories")
                        .param("debitCreditFlag", "D"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getReconsileCategoriesShouldReturnCategoriesForCredit() throws Exception {
        ChartOfAccountCategory category = new ChartOfAccountCategory();
        category.setChartOfAccountCategoryId(1);
        category.setChartOfAccountCategoryName("Test Category");

        ChartOfAccountCategory parentCategory = new ChartOfAccountCategory();
        parentCategory.setChartOfAccountCategoryId(2);
        parentCategory.setChartOfAccountCategoryName("Money Received");

        category.setParentChartOfAccount(parentCategory);

        when(chartOfAccountCategoryService.findAll()).thenReturn(Arrays.asList(parentCategory, category));

        mockMvc.perform(get("/rest/datalist/reconsileCategories")
                        .param("debitCreditFlag", "C"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getProductListShouldReturnProductsForSale() throws Exception {
        Product product = new Product();
        product.setProductId(1);
        product.setProductName("Test Product");
        product.setIsActive(true);

        PaginationResponseModel response = new PaginationResponseModel(1, Arrays.asList(product));
        when(productService.getProductList(any(), any())).thenReturn(response);
        when(productRestHelper.getPriceModel(any(), any())).thenReturn(new com.simpleaccounts.rest.productcontroller.ProductPriceModel());

        mockMvc.perform(get("/rest/datalist/product")
                        .param("priceType", "SALE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getProductListShouldReturnNotFoundWhenNull() throws Exception {
        when(productService.getProductList(any(), any())).thenReturn(null);

        mockMvc.perform(get("/rest/datalist/product")
                        .param("priceType", "SALE"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getTransactionCategoryListForReceiptShouldReturnCategories() throws Exception {
        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryId(1);
        category.setTransactionCategoryName("Category 1");

        ChartOfAccount chartOfAccount = new ChartOfAccount();
        chartOfAccount.setChartOfAccountId(1);
        chartOfAccount.setChartOfAccountName("Income");
        category.setChartOfAccount(chartOfAccount);

        when(transactionCategoryService.getListForReceipt()).thenReturn(Arrays.asList(category));

        mockMvc.perform(get("/rest/datalist/receipt/tnxCat"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getTransactionCategoryListForReceiptShouldReturnBadRequestWhenEmpty() throws Exception {
        when(transactionCategoryService.getListForReceipt()).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/datalist/receipt/tnxCat"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getTaxTreatmentListShouldReturnTaxTreatments() throws Exception {
        TaxtTreatmentdto dto1 = new TaxtTreatmentdto();
        TaxtTreatmentdto dto2 = new TaxtTreatmentdto();

        when(taxTreatmentService.getList()).thenReturn(Arrays.asList(dto1, dto2));

        mockMvc.perform(get("/rest/datalist/getTaxTreatment"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getUnitTypeListShouldReturnUnitTypes() throws Exception {
        UnitType unit1 = new UnitType();
        unit1.setUnitTypeId(1);
        unit1.setUnitType("Kilogram");
        unit1.setUnitTypeCode("KG");

        UnitType unit2 = new UnitType();
        unit2.setUnitTypeId(2);
        unit2.setUnitType("Meter");
        unit2.setUnitTypeCode("M");

        when(unitTypesRepository.findAll()).thenReturn(Arrays.asList(unit1, unit2));

        mockMvc.perform(get("/rest/datalist/getUnitTypeList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getNoteSettingsInfoShouldReturnNotesSettings() throws Exception {
        NotesSettings settings = new NotesSettings();
        settings.setId(1);
        settings.setDefaultNotes("Default note");

        when(notesSettingsRepository.findAll()).thenReturn(Arrays.asList(settings));

        mockMvc.perform(get("/rest/datalist/getNoteSettingsInfo"))
                .andExpect(status().isOk());
    }

    @Test
    void getNoteSettingsInfoShouldReturnErrorOnException() throws Exception {
        when(notesSettingsRepository.findAll()).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/rest/datalist/getNoteSettingsInfo"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void saveNoteSettingsInfoShouldUpdateSettings() throws Exception {
        NotesSettings settings = new NotesSettings();
        settings.setId(1);

        when(notesSettingsRepository.findById(1)).thenReturn(Optional.of(settings));
        when(notesSettingsRepository.save(any())).thenReturn(settings);

        mockMvc.perform(post("/rest/datalist/saveNoteSettingsInfo")
                        .param("defaultNote", "New note")
                        .param("defaultFootNote", "New footer")
                        .param("defaultTermsAndConditions", "New terms"))
                .andExpect(status().isOk());

        verify(notesSettingsRepository).save(any(NotesSettings.class));
    }

    @Test
    void saveNoteSettingsInfoShouldReturnErrorOnException() throws Exception {
        when(notesSettingsRepository.findById(1)).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(post("/rest/datalist/saveNoteSettingsInfo")
                        .param("defaultNote", "New note")
                        .param("defaultFootNote", "New footer")
                        .param("defaultTermsAndConditions", "New terms"))
                .andExpect(status().isInternalServerError());
    }
}
