package com.simpleaccounts.rest.migrationcontroller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.entity.Company;
import com.simpleaccounts.rest.migration.model.ContactsModel;
import com.simpleaccounts.rest.migration.model.VendorsModel;
import com.simpleaccounts.rest.migration.model.ItemModel;
import com.simpleaccounts.rest.migration.model.InvoiceModel;
import com.simpleaccounts.rest.migration.model.BillModel;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.CompanyService;
import com.simpleaccounts.service.CountryService;
import com.simpleaccounts.service.StateService;
import com.simpleaccounts.service.migrationservices.FileStorageService;
import com.simpleaccounts.service.migrationservices.MigrationService;
import com.simpleaccounts.service.migrationservices.SimpleAccountMigrationService;
import com.simpleaccounts.service.migrationservices.ZohoMigrationService;
import com.simpleaccounts.utils.FileHelper;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import javax.servlet.ServletContext;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(MigrationController.class)
@AutoConfigureMockMvc(addFilters = false)
class MigrationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private JwtTokenUtil jwtTokenUtil;
    @MockBean private FileHelper fileHelper;
    @MockBean private CountryService countryService;
    @MockBean private StateService stateService;
    @MockBean private MigrationService migrationService;
    @MockBean private ZohoMigrationService zohoMigrationService;
    @MockBean private SimpleAccountMigrationService simpleAccountMigrationService;
    @MockBean private CompanyService companyService;
    @MockBean private FileStorageService fileStorageService;
    @MockBean private ResourceLoader resourceLoader;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    @TestConfiguration
    static class MigrationTestConfig {
        @Bean
        String basePath() {
            return "migration-files";
        }
    }

    @Test
    void saveAccountStartDateShouldPersistDate() throws Exception {
        Company company = new Company();
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(companyService.getCompany()).thenReturn(company);

        mockMvc.perform(post("/rest/migration/saveAccountStartDate")
                        .param("accountStartDate", String.valueOf(new Date().getTime())))
                .andExpect(status().isOk());

        ArgumentCaptor<Company> captor = ArgumentCaptor.forClass(Company.class);
        verify(companyService).update(captor.capture());
        assertThat(captor.getValue().getAccountStartDate()).isNotNull();
    }

    @Test
    void getListShouldReturnProductsList() throws Exception {
        ServletContext servletContext = org.mockito.Mockito.mock(ServletContext.class);
        when(servletContext.getRealPath("/")).thenReturn("/tmp");
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

        mockMvc.perform(get("/rest/migration/list"))
                .andExpect(status().isOk());
    }

    @Test
    void getListShouldHandleException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(get("/rest/migration/list"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getVersionListByProductNameShouldReturnVersions() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

        mockMvc.perform(get("/rest/migration/getVersionListByPrioductName")
                        .param("productName", "QuickBooks"))
                .andExpect(status().isOk());
    }

    @Test
    void getVersionListByProductNameShouldHandleException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(get("/rest/migration/getVersionListByPrioductName")
                        .param("productName", "QuickBooks"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void saveMigratedDataShouldProcessMigration() throws Exception {
        Company company = new Company();
        company.setAccountStartDate(LocalDateTime.of(2024, 1, 1, 0, 0));

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(companyService.getCompany()).thenReturn(company);
        when(migrationService.processTheMigratedData(anyString(), anyString(), anyString(), any(), anyString(), any()))
                .thenReturn(new ArrayList<>());
        when(zohoMigrationService.rollBackMigratedData(anyString())).thenReturn("Success");

        mockMvc.perform(post("/rest/migration/migrate")
                        .param("name", "QuickBooks")
                        .param("version", "2021"))
                .andExpect(status().isOk());

        verify(migrationService).processTheMigratedData(anyString(), anyString(), anyString(), any(), anyString(), any());
    }

    @Test
    void saveMigratedDataShouldReturnBadRequestForInvalidData() throws Exception {
        Company company = new Company();
        company.setAccountStartDate(LocalDateTime.of(2024, 1, 1, 0, 0));

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(companyService.getCompany()).thenReturn(company);

        mockMvc.perform(post("/rest/migration/migrate")
                        .param("name", "")
                        .param("version", ""))
                .andExpect(status().isOk());
    }

    @Test
    void saveMigratedDataShouldHandleException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(post("/rest/migration/migrate")
                        .param("name", "QuickBooks")
                        .param("version", "2021"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void uploadFolderShouldUploadFiles() throws Exception {
        MockMultipartFile file1 = new MockMultipartFile(
                "files", "test1.csv", MediaType.TEXT_PLAIN_VALUE, "test data".getBytes());
        MockMultipartFile file2 = new MockMultipartFile(
                "files", "test2.csv", MediaType.TEXT_PLAIN_VALUE, "test data 2".getBytes());

        when(zohoMigrationService.deleteMigratedFiles(anyString())).thenReturn("Success");
        when(fileHelper.saveMultiFile(anyString(), any())).thenReturn(new ArrayList<>());

        mockMvc.perform(multipart("/rest/migration/uploadFolder")
                        .file(file1)
                        .file(file2))
                .andExpect(status().isOk());

        verify(fileHelper).saveMultiFile(anyString(), any());
    }

    @Test
    void uploadFolderShouldHandleException() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "files", "test.csv", MediaType.TEXT_PLAIN_VALUE, "test data".getBytes());

        when(zohoMigrationService.deleteMigratedFiles(anyString())).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(multipart("/rest/migration/uploadFolder")
                        .file(file))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void listOfTransactionCategoryShouldReturnCategories() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(migrationService.getTransactionCategory()).thenReturn(new TransactionCategoryListResponseModel());

        mockMvc.perform(get("/rest/migration/listOfTransactionCategory"))
                .andExpect(status().isOk());

        verify(migrationService).getTransactionCategory();
    }

    @Test
    void listOfTransactionCategoryShouldHandleException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(get("/rest/migration/listOfTransactionCategory"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getCsvFileDataShouldReturnContactsData() throws Exception {
        List<ContactsModel> contacts = Arrays.asList(new ContactsModel());
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(zohoMigrationService.getCsvFileDataForIContacts(anyString(), eq("Contacts.csv")))
                .thenReturn(contacts);

        mockMvc.perform(get("/rest/migration/getFileData")
                        .param("fileName", "Contacts.csv"))
                .andExpect(status().isOk());

        verify(zohoMigrationService).getCsvFileDataForIContacts(anyString(), eq("Contacts.csv"));
    }

    @Test
    void getCsvFileDataShouldReturnVendorsData() throws Exception {
        List<VendorsModel> vendors = Arrays.asList(new VendorsModel());
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(zohoMigrationService.getCsvFileDataForIVendors(anyString(), eq("Vendors.csv")))
                .thenReturn(vendors);

        mockMvc.perform(get("/rest/migration/getFileData")
                        .param("fileName", "Vendors.csv"))
                .andExpect(status().isOk());

        verify(zohoMigrationService).getCsvFileDataForIVendors(anyString(), eq("Vendors.csv"));
    }

    @Test
    void getCsvFileDataShouldReturnItemData() throws Exception {
        List<ItemModel> items = Arrays.asList(new ItemModel());
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(zohoMigrationService.getCsvFileDataForItem(anyString(), eq("Item.csv")))
                .thenReturn(items);

        mockMvc.perform(get("/rest/migration/getFileData")
                        .param("fileName", "Item.csv"))
                .andExpect(status().isOk());

        verify(zohoMigrationService).getCsvFileDataForItem(anyString(), eq("Item.csv"));
    }

    @Test
    void getCsvFileDataShouldReturnInvoiceData() throws Exception {
        List<InvoiceModel> invoices = Arrays.asList(new InvoiceModel());
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(zohoMigrationService.getCsvFileDataForInvoice(anyString(), eq("Invoice.csv")))
                .thenReturn(invoices);

        mockMvc.perform(get("/rest/migration/getFileData")
                        .param("fileName", "Invoice.csv"))
                .andExpect(status().isOk());

        verify(zohoMigrationService).getCsvFileDataForInvoice(anyString(), eq("Invoice.csv"));
    }

    @Test
    void getCsvFileDataShouldReturnBillData() throws Exception {
        List<BillModel> bills = Arrays.asList(new BillModel());
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(zohoMigrationService.getCsvFileDataForBill(anyString(), eq("Bill.csv")))
                .thenReturn(bills);

        mockMvc.perform(get("/rest/migration/getFileData")
                        .param("fileName", "Bill.csv"))
                .andExpect(status().isOk());

        verify(zohoMigrationService).getCsvFileDataForBill(anyString(), eq("Bill.csv"));
    }

    @Test
    void getCsvFileDataShouldReturnNoDataForUnknownFile() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

        mockMvc.perform(get("/rest/migration/getFileData")
                        .param("fileName", "Unknown.csv"))
                .andExpect(status().isOk());
    }

    @Test
    void getCsvFileDataShouldHandleException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(get("/rest/migration/getFileData")
                        .param("fileName", "Contacts.csv"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getListOfAllFilesNamesShouldReturnFileNames() throws Exception {
        List<String> fileNames = Arrays.asList("Contacts.csv", "Vendors.csv", "Items.csv");
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(migrationService.getUploadedFilesNames(anyString())).thenReturn(fileNames);

        mockMvc.perform(get("/rest/migration/getListOfAllFiles"))
                .andExpect(status().isOk());

        verify(migrationService).getUploadedFilesNames(anyString());
    }

    @Test
    void getListOfAllFilesNamesShouldReturnNoFilesMessage() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(migrationService.getUploadedFilesNames(anyString())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/migration/getListOfAllFiles"))
                .andExpect(status().isOk());
    }

    @Test
    void getListOfAllFilesNamesShouldHandleIOException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(migrationService.getUploadedFilesNames(anyString())).thenThrow(new IOException("IO Error"));

        mockMvc.perform(get("/rest/migration/getListOfAllFiles"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void deleteFilesByFilesNamesShouldDeleteFiles() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(migrationService.deleteFiles(anyString(), any())).thenReturn(new ArrayList<>());

        mockMvc.perform(delete("/rest/migration/deleteFiles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fileNames\":[\"test1.csv\",\"test2.csv\"]}"))
                .andExpect(status().isOk());

        verify(migrationService).deleteFiles(anyString(), any());
    }

    @Test
    void getMigrationSummaryShouldReturnSummary() throws Exception {
        Company company = new Company();
        company.setAccountStartDate(LocalDateTime.of(2024, 1, 1, 0, 0));

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(companyService.getCompany()).thenReturn(company);
        when(migrationService.getMigrationSummary(anyString(), any(), anyString()))
                .thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/migration/getMigrationSummary"))
                .andExpect(status().isOk());

        verify(migrationService).getMigrationSummary(anyString(), any(), anyString());
    }

    @Test
    void rollbackMigratedDataShouldRollback() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(zohoMigrationService.rollBackMigratedData(anyString())).thenReturn("Rollback successful");

        mockMvc.perform(delete("/rest/migration/rollbackMigratedData"))
                .andExpect(status().isOk());

        verify(zohoMigrationService).rollBackMigratedData(anyString());
    }

    @Test
    void rollbackMigratedDataShouldHandleException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(delete("/rest/migration/rollbackMigratedData"))
                .andExpect(status().isOk());
    }

    @Test
    void downloadFileShouldReturnResource() throws Exception {
        Resource mockResource = org.mockito.Mockito.mock(Resource.class);
        when(fileStorageService.loadFileAsResource("test.csv")).thenReturn(mockResource);
        when(mockResource.getFilename()).thenReturn("test.csv");

        mockMvc.perform(get("/rest/migration/downloadFile/test.csv"))
                .andExpect(status().isOk());

        verify(fileStorageService).loadFileAsResource("test.csv");
    }
}
