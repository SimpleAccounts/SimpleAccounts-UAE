package com.simpleaccounts.rest.purchase;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.constant.InvoicePurchaseStatusConstant;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.CurrencyConversion;
import com.simpleaccounts.entity.Project;
import com.simpleaccounts.entity.Purchase;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.helper.PurchaseRestControllerHelper;
import com.simpleaccounts.model.PurchaseRestModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.CurrencyService;
import com.simpleaccounts.service.ProjectService;
import com.simpleaccounts.service.PurchaseService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.VatCategoryService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("PurchaseRestController Unit Tests")
class PurchaseRestControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private PurchaseService purchaseService;

    @Mock
    private ProjectService projectService;

    @Mock
    private UserService userServiceNew;

    @Mock
    private VatCategoryService vatCategoryService;

    @Mock
    private TransactionCategoryService transactionCategoryService;

    @Mock
    private CurrencyService currencyService;

    @Mock
    private PurchaseRestControllerHelper purchaseControllerRestHelper;

    @InjectMocks
    private PurchaseRestController purchaseRestController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(purchaseRestController).build();
        objectMapper = new ObjectMapper();
    }

    @Nested
    @DisplayName("populatePurchases Tests")
    class PopulatePurchasesTests {

        @Test
        @DisplayName("Should return all purchases successfully")
        void populatePurchasesReturnsAllPurchases() throws Exception {
            // Arrange
            List<Purchase> purchases = createPurchaseList(5);
            List<PurchaseRestModel> purchaseModels = createPurchaseModelList(5);

            when(purchaseService.getAllPurchase()).thenReturn(purchases);
            for (int i = 0; i < purchases.size(); i++) {
                when(purchaseControllerRestHelper.getPurchaseModel(purchases.get(i)))
                        .thenReturn(purchaseModels.get(i));
            }

            // Act & Assert
            mockMvc.perform(get("/rest/purchase/populatepurchases"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return empty list when no purchases exist")
        void populatePurchasesReturnsEmptyList() throws Exception {
            // Arrange
            when(purchaseService.getAllPurchase()).thenReturn(new ArrayList<>());

            // Act & Assert
            mockMvc.perform(get("/rest/purchase/populatepurchases"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return empty list when purchases is null")
        void populatePurchasesReturnsEmptyWhenNull() throws Exception {
            // Arrange
            when(purchaseService.getAllPurchase()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/purchase/populatepurchases"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("viewOrEditPurchase Tests")
    class ViewOrEditPurchaseTests {

        @Test
        @DisplayName("Should return purchase by ID")
        void viewOrEditPurchaseReturnsPurchase() throws Exception {
            // Arrange
            Purchase purchase = createPurchase(1, new BigDecimal("1000.00"), InvoicePurchaseStatusConstant.UNPAID);
            PurchaseRestModel purchaseModel = createPurchaseModel(1, new BigDecimal("1000.00"));

            when(purchaseService.findByPK(1)).thenReturn(purchase);
            when(purchaseControllerRestHelper.getPurchaseModel(purchase)).thenReturn(purchaseModel);

            // Act & Assert
            mockMvc.perform(get("/rest/purchase/vieworedit")
                            .param("purchaseId", "1"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("deletePurchase Tests")
    class DeletePurchaseTests {

        @Test
        @DisplayName("Should delete purchase successfully")
        void deletePurchaseSucceeds() throws Exception {
            // Arrange
            Purchase purchase = createPurchase(1, new BigDecimal("1000.00"), InvoicePurchaseStatusConstant.UNPAID);

            when(purchaseService.findByPK(1)).thenReturn(purchase);

            // Act & Assert
            mockMvc.perform(delete("/rest/purchase/delete")
                            .param("purchaseId", "1"))
                    .andExpect(status().isOk());

            verify(purchaseService).update(any(Purchase.class));
        }
    }

    @Nested
    @DisplayName("allPaidPurchase Tests")
    class AllPaidPurchaseTests {

        @Test
        @DisplayName("Should return only paid purchases")
        void allPaidPurchaseReturnsPaidPurchases() throws Exception {
            // Arrange
            List<Purchase> allPurchases = createPurchaseList(5);
            allPurchases.get(0).setStatus(InvoicePurchaseStatusConstant.PAID);
            allPurchases.get(1).setStatus(InvoicePurchaseStatusConstant.PAID);
            allPurchases.get(2).setStatus(InvoicePurchaseStatusConstant.UNPAID);

            when(purchaseService.getAllPurchase()).thenReturn(allPurchases);
            when(purchaseControllerRestHelper.getPurchaseModel(any(Purchase.class)))
                    .thenReturn(createPurchaseModel(1, new BigDecimal("1000.00")));

            // Act & Assert
            mockMvc.perform(get("/rest/purchase/allpaidpurchase"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("allUnPaidPurchase Tests")
    class AllUnPaidPurchaseTests {

        @Test
        @DisplayName("Should return only unpaid purchases")
        void allUnPaidPurchaseReturnsUnpaidPurchases() throws Exception {
            // Arrange
            List<Purchase> allPurchases = createPurchaseList(5);
            allPurchases.get(0).setStatus(InvoicePurchaseStatusConstant.UNPAID);
            allPurchases.get(1).setStatus(InvoicePurchaseStatusConstant.UNPAID);
            allPurchases.get(2).setStatus(InvoicePurchaseStatusConstant.PAID);

            when(purchaseService.getAllPurchase()).thenReturn(allPurchases);
            when(purchaseControllerRestHelper.getPurchaseModel(any(Purchase.class)))
                    .thenReturn(createPurchaseModel(1, new BigDecimal("1000.00")));

            // Act & Assert
            mockMvc.perform(get("/rest/purchase/allunpaidpurchase"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("allPartialPaidPurchase Tests")
    class AllPartialPaidPurchaseTests {

        @Test
        @DisplayName("Should return only partially paid purchases")
        void allPartialPaidPurchaseReturnsPartiallyPaidPurchases() throws Exception {
            // Arrange
            List<Purchase> allPurchases = createPurchaseList(5);
            allPurchases.get(0).setStatus(InvoicePurchaseStatusConstant.PARTIALPAID);
            allPurchases.get(1).setStatus(InvoicePurchaseStatusConstant.PARTIALPAID);
            allPurchases.get(2).setStatus(InvoicePurchaseStatusConstant.PAID);

            when(purchaseService.getAllPurchase()).thenReturn(allPurchases);
            when(purchaseControllerRestHelper.getPurchaseModel(any(Purchase.class)))
                    .thenReturn(createPurchaseModel(1, new BigDecimal("1000.00")));

            // Act & Assert
            mockMvc.perform(get("/rest/purchase/allpartialpaidpurchase"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("getCategories Tests")
    class GetCategoriesTests {

        @Test
        @DisplayName("Should return transaction categories")
        void getCategoriesReturnsCategories() throws Exception {
            // Arrange
            List<TransactionCategory> categories = createTransactionCategoryList(3);

            when(transactionCategoryService.findTransactionCategoryListByParentCategory(any()))
                    .thenReturn(categories);

            // Act & Assert
            mockMvc.perform(get("/rest/purchase/categories"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("getCurrency Tests")
    class GetCurrencyTests {

        @Test
        @DisplayName("Should return currencies")
        void getCurrencyReturnsCurrencies() throws Exception {
            // Arrange
            List<Currency> currencies = createCurrencyList(3);

            when(currencyService.getCurrencies()).thenReturn(currencies);

            // Act & Assert
            mockMvc.perform(get("/rest/purchase/currencys"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when no currencies exist")
        void getCurrencyReturnsNotFound() throws Exception {
            // Arrange
            when(currencyService.getCurrencies()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/purchase/currencys"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return not found when currencies list is empty")
        void getCurrencyReturnsNotFoundWhenEmpty() throws Exception {
            // Arrange
            when(currencyService.getCurrencies()).thenReturn(new ArrayList<>());

            // Act & Assert
            mockMvc.perform(get("/rest/purchase/currencys"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("projects Tests")
    class ProjectsTests {

        @Test
        @DisplayName("Should return projects by search query")
        void projectsReturnsProjects() throws Exception {
            // Arrange
            List<Project> projects = createProjectList(3);

            when(projectService.getProjectsByCriteria(any())).thenReturn(projects);

            // Act & Assert
            mockMvc.perform(get("/rest/purchase/projects")
                            .param("projectName", "Test"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("vatCategorys Tests")
    class VatCategorysTests {

        @Test
        @DisplayName("Should return VAT categories")
        void vatCategorysReturnsCategories() throws Exception {
            // Arrange
            List<VatCategory> vatCategories = createVatCategoryList(3);

            when(vatCategoryService.getVatCategoryList()).thenReturn(vatCategories);

            // Act & Assert
            mockMvc.perform(get("/rest/purchase/vatcategories")
                            .param("vatSearchString", ""))
                    .andExpect(status().isOk());
        }
    }

    private List<Purchase> createPurchaseList(int count) {
        List<Purchase> purchases = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            purchases.add(createPurchase(i, new BigDecimal(100 * i), InvoicePurchaseStatusConstant.UNPAID));
        }
        return purchases;
    }

    private Purchase createPurchase(Integer id, BigDecimal amount, Integer status) {
        Purchase purchase = new Purchase();
        purchase.setPurchaseId(id);
        purchase.setPurchaseAmount(amount);
        purchase.setPurchaseDueAmount(amount);
        purchase.setStatus(status);
        purchase.setPurchaseDate(LocalDateTime.now());
        purchase.setPurchaseDueDate(LocalDateTime.now().plusDays(30));
        purchase.setDeleteFlag(false);
        purchase.setReceiptNumber("REC-" + id);
        purchase.setPurchaseDescription("Purchase " + id);

        Contact contact = new Contact();
        contact.setContactId(1);
        contact.setFirstName("Supplier");
        contact.setLastName(String.valueOf(id));
        purchase.setPurchaseContact(contact);

        return purchase;
    }

    private List<PurchaseRestModel> createPurchaseModelList(int count) {
        List<PurchaseRestModel> models = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            models.add(createPurchaseModel(i, new BigDecimal(100 * i)));
        }
        return models;
    }

    private PurchaseRestModel createPurchaseModel(Integer id, BigDecimal amount) {
        PurchaseRestModel model = new PurchaseRestModel();
        model.setPurchaseId(id);
        model.setPurchaseAmount(amount);
        model.setPurchaseDueAmount(amount);
        model.setReceiptNumber("REC-" + id);
        return model;
    }

    private List<TransactionCategory> createTransactionCategoryList(int count) {
        List<TransactionCategory> categories = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            TransactionCategory category = new TransactionCategory();
            category.setTransactionCategoryCode(i);
            category.setTransactionCategoryName("Category " + i);
            category.setDeleteFlag(false);
            categories.add(category);
        }
        return categories;
    }

    private List<Currency> createCurrencyList(int count) {
        List<Currency> currencies = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            Currency currency = new Currency();
            currency.setCurrencyCode(i);
            currency.setCurrencyName("Currency " + i);
            currency.setCurrencyIsoCode("CUR" + i);
            currencies.add(currency);
        }
        return currencies;
    }

    private List<Project> createProjectList(int count) {
        List<Project> projects = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            Project project = new Project();
            project.setProjectId(i);
            project.setProjectName("Project " + i);
            project.setProjectCode("PROJ00" + i);
            project.setActive(true);
            projects.add(project);
        }
        return projects;
    }

    private List<VatCategory> createVatCategoryList(int count) {
        List<VatCategory> categories = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            VatCategory vatCategory = new VatCategory();
            vatCategory.setId(i);
            vatCategory.setVatCategoryName("VAT " + (5 * i) + "%");
            vatCategory.setVat(new BigDecimal(5 * i));
            vatCategory.setDeleteFlag(false);
            categories.add(vatCategory);
        }
        return categories;
    }
}
