package com.simpleaccounts.rest.purchase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.constant.InvoicePurchaseStatusConstant;
import com.simpleaccounts.criteria.ProjectCriteria;
import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.CurrencyConversion;
import com.simpleaccounts.entity.Project;
import com.simpleaccounts.entity.Purchase;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.helper.PurchaseRestControllerHelper;
import com.simpleaccounts.model.PurchaseRestModel;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.service.CurrencyService;
import com.simpleaccounts.service.ProjectService;
import com.simpleaccounts.service.PurchaseService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.VatCategoryService;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(PurchaseRestController.class)
@AutoConfigureMockMvc(addFilters = false)
class PurchaseRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private PurchaseService purchaseService;
    @MockBean private ProjectService projectService;
    @MockBean private UserService userServiceNew;
    @MockBean private VatCategoryService vatCategoryService;
    @MockBean private TransactionCategoryService transactionCategoryService;
    @MockBean private CurrencyService currencyService;
    @MockBean private PurchaseRestControllerHelper purchaseControllerRestHelper;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    private List<Purchase> samplePurchases;

    @BeforeEach
    void setUp() {
        samplePurchases = new ArrayList<>();

        Purchase purchase1 = new Purchase();
        purchase1.setPurchaseId(1);
        purchase1.setStatus(InvoicePurchaseStatusConstant.PAID);

        Purchase purchase2 = new Purchase();
        purchase2.setPurchaseId(2);
        purchase2.setStatus(InvoicePurchaseStatusConstant.UNPAID);

        Purchase purchase3 = new Purchase();
        purchase3.setPurchaseId(3);
        purchase3.setStatus(InvoicePurchaseStatusConstant.PARTIALPAID);

        samplePurchases.add(purchase1);
        samplePurchases.add(purchase2);
        samplePurchases.add(purchase3);
    }

    @Test
    void populatePurchasesShouldReturnAllPurchases() throws Exception {
        when(purchaseService.getAllPurchase()).thenReturn(samplePurchases);
        when(purchaseControllerRestHelper.getPurchaseModel(any())).thenReturn(new PurchaseRestModel());

        mockMvc.perform(get("/rest/purchase/populatepurchases"))
                .andExpect(status().isOk());

        verify(purchaseService).getAllPurchase();
        verify(purchaseControllerRestHelper).getPurchaseModel(any());
    }

    @Test
    void populatePurchasesShouldHandleNullPurchaseList() throws Exception {
        when(purchaseService.getAllPurchase()).thenReturn(null);

        mockMvc.perform(get("/rest/purchase/populatepurchases"))
                .andExpect(status().isOk());

        verify(purchaseService).getAllPurchase();
    }

    @Test
    void populatePurchasesShouldHandleException() throws Exception {
        when(purchaseService.getAllPurchase()).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(get("/rest/purchase/populatepurchases"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void viewOrEditPurchaseShouldReturnPurchase() throws Exception {
        Purchase purchase = new Purchase();
        purchase.setPurchaseId(1);

        PurchaseRestModel model = new PurchaseRestModel();
        model.setPurchaseId(1);

        when(purchaseService.findByPK(1)).thenReturn(purchase);
        when(purchaseControllerRestHelper.getPurchaseModel(purchase)).thenReturn(model);

        mockMvc.perform(get("/rest/purchase/vieworedit")
                        .param("purchaseId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.purchaseId").value(1));

        verify(purchaseService).findByPK(1);
    }

    @Test
    void viewOrEditPurchaseShouldHandleException() throws Exception {
        when(purchaseService.findByPK(1)).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(get("/rest/purchase/vieworedit")
                        .param("purchaseId", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void deletePurchaseShouldDeleteExistingPurchase() throws Exception {
        Purchase purchase = new Purchase();
        purchase.setPurchaseId(1);
        purchase.setDeleteFlag(false);

        when(purchaseService.findByPK(1)).thenReturn(purchase);

        mockMvc.perform(delete("/rest/purchase/delete")
                        .param("purchaseId", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Deleted Successfully")));

        ArgumentCaptor<Purchase> captor = ArgumentCaptor.forClass(Purchase.class);
        verify(purchaseService).update(captor.capture());
        assertThat(captor.getValue().getDeleteFlag()).isTrue();
    }

    @Test
    void deletePurchaseShouldHandleException() throws Exception {
        when(purchaseService.findByPK(1)).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(delete("/rest/purchase/delete")
                        .param("purchaseId", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void deletePurchasesShouldDeleteMultiplePurchases() throws Exception {
        mockMvc.perform(delete("/rest/purchase/deletes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ids\":[1,2,3]}"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Deleted Successfully")));

        verify(purchaseService).deleteByIds(any());
    }

    @Test
    void deletePurchasesShouldHandleException() throws Exception {
        when(purchaseService.deleteByIds(any())).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(delete("/rest/purchase/deletes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ids\":[1,2,3]}"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void allPaidPurchaseShouldReturnOnlyPaidPurchases() throws Exception {
        when(purchaseService.getAllPurchase()).thenReturn(samplePurchases);
        when(purchaseControllerRestHelper.getPurchaseModel(any())).thenReturn(new PurchaseRestModel());

        mockMvc.perform(get("/rest/purchase/allpaidpurchase"))
                .andExpect(status().isOk());

        verify(purchaseService).getAllPurchase();
    }

    @Test
    void allPaidPurchaseShouldHandleException() throws Exception {
        when(purchaseService.getAllPurchase()).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(get("/rest/purchase/allpaidpurchase"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void allUnPaidPurchaseShouldReturnOnlyUnpaidPurchases() throws Exception {
        when(purchaseService.getAllPurchase()).thenReturn(samplePurchases);
        when(purchaseControllerRestHelper.getPurchaseModel(any())).thenReturn(new PurchaseRestModel());

        mockMvc.perform(get("/rest/purchase/allunpaidpurchase"))
                .andExpect(status().isOk());

        verify(purchaseService).getAllPurchase();
    }

    @Test
    void allUnPaidPurchaseShouldHandleException() throws Exception {
        when(purchaseService.getAllPurchase()).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(get("/rest/purchase/allunpaidpurchase"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void allPartialPaidPurchaseShouldReturnOnlyPartiallyPaidPurchases() throws Exception {
        when(purchaseService.getAllPurchase()).thenReturn(samplePurchases);
        when(purchaseControllerRestHelper.getPurchaseModel(any())).thenReturn(new PurchaseRestModel());

        mockMvc.perform(get("/rest/purchase/allpartialpaidpurchase"))
                .andExpect(status().isOk());

        verify(purchaseService).getAllPurchase();
    }

    @Test
    void allPartialPaidPurchaseShouldHandleException() throws Exception {
        when(purchaseService.getAllPurchase()).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(get("/rest/purchase/allpartialpaidpurchase"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getClaimantsShouldReturnUserList() throws Exception {
        List<User> users = Arrays.asList(new User(), new User());
        when(userServiceNew.executeNamedQuery("findAllUsers")).thenReturn(users);

        mockMvc.perform(get("/rest/purchase/claimants"))
                .andExpect(status().isOk());

        verify(userServiceNew).executeNamedQuery("findAllUsers");
    }

    @Test
    void getClaimantsShouldHandleException() throws Exception {
        when(userServiceNew.executeNamedQuery("findAllUsers")).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(get("/rest/purchase/claimants"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getCategoryShouldReturnTransactionCategories() throws Exception {
        List<TransactionCategory> categories = Arrays.asList(
                new TransactionCategory(),
                new TransactionCategory()
        );

        when(transactionCategoryService.findTransactionCategoryListByParentCategory(any())).thenReturn(categories);

        mockMvc.perform(get("/rest/purchase/categories"))
                .andExpect(status().isOk());

        verify(transactionCategoryService).findTransactionCategoryListByParentCategory(any());
    }

    @Test
    void getCategoryShouldHandleException() throws Exception {
        when(transactionCategoryService.findTransactionCategoryListByParentCategory(any()))
                .thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(get("/rest/purchase/categories"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getCurrencyShouldReturnCurrencies() throws Exception {
        List<Currency> currencies = Arrays.asList(new Currency(), new Currency());
        when(currencyService.getCurrencies()).thenReturn(currencies);

        mockMvc.perform(get("/rest/purchase/currencys"))
                .andExpect(status().isOk());

        verify(currencyService).getCurrencies();
    }

    @Test
    void getCurrencyShouldReturnNotFoundWhenEmpty() throws Exception {
        when(currencyService.getCurrencies()).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/purchase/currencys"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getCurrencyShouldHandleException() throws Exception {
        when(currencyService.getCurrencies()).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(get("/rest/purchase/currencys"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void projectsShouldReturnProjects() throws Exception {
        List<Project> projects = Arrays.asList(new Project(), new Project());
        when(projectService.getProjectsByCriteria(any())).thenReturn(projects);

        mockMvc.perform(get("/rest/purchase/projects")
                        .param("projectName", "Test"))
                .andExpect(status().isOk());

        ArgumentCaptor<ProjectCriteria> captor = ArgumentCaptor.forClass(ProjectCriteria.class);
        verify(projectService).getProjectsByCriteria(captor.capture());
        assertThat(captor.getValue().getProjectName()).isEqualTo("Test");
        assertThat(captor.getValue().getActive()).isTrue();
    }

    @Test
    void projectsShouldHandleEmptySearchQuery() throws Exception {
        List<Project> projects = Arrays.asList(new Project());
        when(projectService.getProjectsByCriteria(any())).thenReturn(projects);

        mockMvc.perform(get("/rest/purchase/projects")
                        .param("projectName", ""))
                .andExpect(status().isOk());

        verify(projectService).getProjectsByCriteria(any());
    }

    @Test
    void projectsShouldHandleException() throws Exception {
        when(projectService.getProjectsByCriteria(any())).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(get("/rest/purchase/projects")
                        .param("projectName", "Test"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void vatCategorysShouldReturnVatCategories() throws Exception {
        List<VatCategory> vatCategories = Arrays.asList(new VatCategory(), new VatCategory());
        when(vatCategoryService.getVatCategoryList()).thenReturn(vatCategories);

        mockMvc.perform(get("/rest/purchase/vatcategories")
                        .param("vatSearchString", "Standard"))
                .andExpect(status().isOk());

        verify(vatCategoryService).getVatCategoryList();
    }

    @Test
    void vatCategorysShouldHandleException() throws Exception {
        when(vatCategoryService.getVatCategoryList()).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(get("/rest/purchase/vatcategories")
                        .param("vatSearchString", "Standard"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void exchangeRateShouldReturnExchangeRateString() throws Exception {
        Currency currency = new Currency();
        currency.setCurrencyIsoCode("USD");

        Company company = new Company();
        Currency baseCurrency = new Currency();
        baseCurrency.setCurrencyIsoCode("AED");
        company.setCurrencyCode(baseCurrency);

        User user = new User();
        user.setCompany(company);

        CurrencyConversion conversion = new CurrencyConversion();
        conversion.setExchangeRate(new BigDecimal("3.67"));

        when(currencyService.findByPK(1)).thenReturn(currency);
        when(userServiceNew.findByPK(10)).thenReturn(user);
        when(currencyService.getCurrencyRateFromCurrencyConversion(1)).thenReturn(conversion);

        mockMvc.perform(get("/rest/purchase/getexchangerate")
                        .param("currencyCode", "1")
                        .param("userId", "10"))
                .andExpect(status().isOk());

        verify(currencyService).getCurrencyRateFromCurrencyConversion(1);
    }

    @Test
    void exchangeRateShouldHandleNullConversion() throws Exception {
        Currency currency = new Currency();
        currency.setCurrencyIsoCode("USD");

        when(currencyService.findByPK(1)).thenReturn(currency);
        when(currencyService.getCurrencyRateFromCurrencyConversion(1)).thenReturn(null);

        mockMvc.perform(get("/rest/purchase/getexchangerate")
                        .param("currencyCode", "1")
                        .param("userId", "10"))
                .andExpect(status().isOk());
    }

    @Test
    void exchangeRateShouldHandleException() throws Exception {
        when(currencyService.findByPK(anyInt())).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(get("/rest/purchase/getexchangerate")
                        .param("currencyCode", "1")
                        .param("userId", "10"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void updateVatPercentageShouldProcessRequest() throws Exception {
        mockMvc.perform(post("/rest/purchase/updatevatpercentage"))
                .andExpect(status().isOk());
    }

    @Test
    void populatePurchasesShouldCountPurchaseStatuses() throws Exception {
        when(purchaseService.getAllPurchase()).thenReturn(samplePurchases);
        when(purchaseControllerRestHelper.getPurchaseModel(any())).thenReturn(new PurchaseRestModel());

        mockMvc.perform(get("/rest/purchase/populatepurchases"))
                .andExpect(status().isOk());

        verify(purchaseControllerRestHelper).getPurchaseModel(any());
    }

    @Test
    void deletePurchaseShouldSetDeleteFlagToTrue() throws Exception {
        Purchase purchase = new Purchase();
        purchase.setPurchaseId(1);
        purchase.setDeleteFlag(false);

        when(purchaseService.findByPK(1)).thenReturn(purchase);

        mockMvc.perform(delete("/rest/purchase/delete")
                        .param("purchaseId", "1"))
                .andExpect(status().isOk());

        ArgumentCaptor<Purchase> captor = ArgumentCaptor.forClass(Purchase.class);
        verify(purchaseService).update(captor.capture());
        assertThat(captor.getValue().getDeleteFlag()).isTrue();
    }

    @Test
    void populatePurchasesShouldHandleEmptyList() throws Exception {
        when(purchaseService.getAllPurchase()).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/purchase/populatepurchases"))
                .andExpect(status().isOk());

        verify(purchaseService).getAllPurchase();
    }

    @Test
    void projectsShouldSetActiveFlagTrue() throws Exception {
        when(projectService.getProjectsByCriteria(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/purchase/projects")
                        .param("projectName", "Test"))
                .andExpect(status().isOk());

        ArgumentCaptor<ProjectCriteria> captor = ArgumentCaptor.forClass(ProjectCriteria.class);
        verify(projectService).getProjectsByCriteria(captor.capture());
        assertThat(captor.getValue().getActive()).isTrue();
    }
}
