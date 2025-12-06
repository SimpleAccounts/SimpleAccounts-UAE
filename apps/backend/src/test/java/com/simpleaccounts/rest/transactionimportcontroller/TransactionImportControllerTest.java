package com.simpleaccounts.rest.transactionimportcontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.TransactionParsingSetting;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.model.TransactionModel;
import com.simpleaccounts.parserengine.CsvParser;
import com.simpleaccounts.parserengine.ExcelParser;
import com.simpleaccounts.rest.transactionparsingcontroller.TransactionParsingSettingDetailModel;
import com.simpleaccounts.rest.transactionparsingcontroller.TransactionParsingSettingRestHelper;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.TransactionParsingSettingService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.FileHelper;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

@ExtendWith(SpringExtension.class)
@WebMvcTest(TransactionImportController.class)
@AutoConfigureMockMvc(addFilters = false)
class TransactionImportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean private CsvParser csvParser;
    @MockBean private ExcelParser excelParser;
    @MockBean private FileHelper fileHelper;
    @MockBean private BankAccountService bankAccountService;
    @MockBean private TransactionService transactionService;
    @MockBean private UserService userServiceNew;
    @MockBean private TransactionParsingSettingService transactionParsingSettingService;
    @MockBean private TransactionParsingSettingRestHelper transactionParsingSettingRestHelper;
    @MockBean private TransactionImportRestHelper transactionImportRestHelper;
    @MockBean private JwtTokenUtil jwtTokenUtil;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    @Test
    void getBankAccountShouldReturnListWhenBankAccountsExist() throws Exception {
        List<BankAccount> bankAccounts = Arrays.asList(
            createBankAccount(1, "Bank Account 1"),
            createBankAccount(2, "Bank Account 2")
        );

        when(bankAccountService.getBankAccounts()).thenReturn(bankAccounts);

        mockMvc.perform(get("/rest/transactionimport/getbankaccountlist"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));

        verify(bankAccountService).getBankAccounts();
    }

    @Test
    void getBankAccountShouldReturnNotFoundWhenNoAccounts() throws Exception {
        when(bankAccountService.getBankAccounts()).thenReturn(null);

        mockMvc.perform(get("/rest/transactionimport/getbankaccountlist"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getBankAccountShouldReturnEmptyListWhenEmptyResult() throws Exception {
        when(bankAccountService.getBankAccounts()).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transactionimport/getbankaccountlist"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void downloadCsvShouldReturnFileContent() throws Exception {
        mockMvc.perform(get("/rest/transactionimport/downloadcsv"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.parseMediaType("application/octet-stream")));
    }

    @Test
    void getDateFormatListShouldReturnFormats() throws Exception {
        List<String> dateFormats = Arrays.asList("dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd");

        mockMvc.perform(get("/rest/transactionimport/getformatdate"))
                .andExpect(status().isOk());
    }

    @Test
    void getDateFormatListShouldReturnNotFoundWhenNull() throws Exception {
        mockMvc.perform(get("/rest/transactionimport/getformatdate"))
                .andExpect(status().isOk());
    }

    @Test
    void saveTransactionsShouldReturnBankId() throws Exception {
        List<TransactionModel> transactionList = Arrays.asList(
            createTransactionModel("Transaction 1"),
            createTransactionModel("Transaction 2")
        );

        String requestBody = objectMapper.writeValueAsString(transactionList);

        mockMvc.perform(post("/rest/transactionimport/saveimporttransaction")
                        .param("id", "1")
                        .param("bankId", "10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(content().string("10"));
    }

    @Test
    void importTransactionShouldReturnSuccessWhenValid() throws Exception {
        TransactionImportModel importModel = new TransactionImportModel();
        importModel.setBankAccountId(1);

        List<Transaction> transactions = Arrays.asList(
            new Transaction(),
            new Transaction()
        );

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(transactionImportRestHelper.getEntity(any())).thenReturn(transactions);
        when(transactionService.saveTransactions(transactions)).thenReturn("Success");

        mockMvc.perform(post("/rest/transactionimport/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(importModel)))
                .andExpect(status().isOk())
                .andExpect(content().string("Success"));

        verify(jwtTokenUtil).getUserIdFromHttpRequest(any());
        verify(transactionImportRestHelper).getEntity(any());
        verify(transactionService).saveTransactions(transactions);
    }

    @Test
    void importTransactionShouldReturnErrorWhenTransactionListNull() throws Exception {
        TransactionImportModel importModel = new TransactionImportModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(transactionImportRestHelper.getEntity(any())).thenReturn(null);

        mockMvc.perform(post("/rest/transactionimport/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(importModel)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void importTransactionShouldReturnErrorWhenStatusNull() throws Exception {
        TransactionImportModel importModel = new TransactionImportModel();

        List<Transaction> transactions = Arrays.asList(new Transaction());

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(transactionImportRestHelper.getEntity(any())).thenReturn(transactions);
        when(transactionService.saveTransactions(transactions)).thenReturn(null);

        mockMvc.perform(post("/rest/transactionimport/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(importModel)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void importTransaction2ShouldReturnSuccessWhenValid() throws Exception {
        TransactionImportModel importModel = new TransactionImportModel();
        importModel.setBankAccountId(1);

        List<Transaction> transactions = Arrays.asList(new Transaction());

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(transactionImportRestHelper.getEntityWithoutTemplate(any())).thenReturn(transactions);
        when(transactionService.saveTransactions(transactions)).thenReturn("Success");

        mockMvc.perform(post("/rest/transactionimport/savewithtemplate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(importModel)))
                .andExpect(status().isOk())
                .andExpect(content().string("Success"));

        verify(transactionImportRestHelper).getEntityWithoutTemplate(any());
    }

    @Test
    void importTransaction2ShouldReturnErrorWhenTransactionListNull() throws Exception {
        TransactionImportModel importModel = new TransactionImportModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(transactionImportRestHelper.getEntityWithoutTemplate(any())).thenReturn(null);

        mockMvc.perform(post("/rest/transactionimport/savewithtemplate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(importModel)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void parseTransactionShouldReturnParsedDataForCsv() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.csv",
            "text/csv",
            "test,data".getBytes()
        );

        TransactionParsingSetting parsingSetting = new TransactionParsingSetting();
        TransactionParsingSettingDetailModel model = new TransactionParsingSettingDetailModel();
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("data", "parsed data");

        when(transactionParsingSettingService.findByPK(1L)).thenReturn(parsingSetting);
        when(transactionParsingSettingRestHelper.getModel(parsingSetting)).thenReturn(model);
        when(fileHelper.getFileExtension("test.csv")).thenReturn("csv");
        when(csvParser.parseImportData(eq(model), any())).thenReturn(dataMap);

        mockMvc.perform(MockMvcRequestBuilders.multipart("/rest/transactionimport/parse")
                        .file(file)
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("parsed data"));

        verify(csvParser).parseImportData(eq(model), any());
    }

    @Test
    void parseTransactionShouldReturnParsedDataForExcel() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.xlsx",
            "application/vnd.ms-excel",
            "test data".getBytes()
        );

        TransactionParsingSetting parsingSetting = new TransactionParsingSetting();
        TransactionParsingSettingDetailModel model = new TransactionParsingSettingDetailModel();
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("data", "parsed excel data");

        when(transactionParsingSettingService.findByPK(1L)).thenReturn(parsingSetting);
        when(transactionParsingSettingRestHelper.getModel(parsingSetting)).thenReturn(model);
        when(fileHelper.getFileExtension("test.xlsx")).thenReturn("xlsx");
        when(excelParser.parseImportData(eq(model), any())).thenReturn(dataMap);

        mockMvc.perform(MockMvcRequestBuilders.multipart("/rest/transactionimport/parse")
                        .file(file)
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("parsed excel data"));

        verify(excelParser).parseImportData(eq(model), any());
    }

    @Test
    void parseTransactionShouldReturnErrorWhenParsingFails() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.csv",
            "text/csv",
            "test,data".getBytes()
        );

        TransactionParsingSetting parsingSetting = new TransactionParsingSetting();
        TransactionParsingSettingDetailModel model = new TransactionParsingSettingDetailModel();

        when(transactionParsingSettingService.findByPK(1L)).thenReturn(parsingSetting);
        when(transactionParsingSettingRestHelper.getModel(parsingSetting)).thenReturn(model);
        when(fileHelper.getFileExtension("test.csv")).thenReturn("csv");
        when(csvParser.parseImportData(eq(model), any())).thenReturn(null);

        mockMvc.perform(MockMvcRequestBuilders.multipart("/rest/transactionimport/parse")
                        .file(file)
                        .param("id", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void parseTransactionShouldHandleXlsExtension() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.xls",
            "application/vnd.ms-excel",
            "test data".getBytes()
        );

        TransactionParsingSetting parsingSetting = new TransactionParsingSetting();
        TransactionParsingSettingDetailModel model = new TransactionParsingSettingDetailModel();
        Map<String, Object> dataMap = new HashMap<>();

        when(transactionParsingSettingService.findByPK(1L)).thenReturn(parsingSetting);
        when(transactionParsingSettingRestHelper.getModel(parsingSetting)).thenReturn(model);
        when(fileHelper.getFileExtension("test.xls")).thenReturn("xls");
        when(excelParser.parseImportData(eq(model), any())).thenReturn(dataMap);

        mockMvc.perform(MockMvcRequestBuilders.multipart("/rest/transactionimport/parse")
                        .file(file)
                        .param("id", "1"))
                .andExpect(status().isOk());

        verify(excelParser).parseImportData(eq(model), any());
    }

    @Test
    void makeFileShouldParseCsvDataSuccessfully() throws Exception {
        TransactionImportRequestModel requestModel = new TransactionImportRequestModel();
        requestModel.setId(1);
        requestModel.setData("test,data\n1,2");

        TransactionParsingSetting parsingSetting = new TransactionParsingSetting();
        TransactionParsingSettingDetailModel model = new TransactionParsingSettingDetailModel();
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("parsed", "data");

        when(transactionParsingSettingService.findByPK(1L)).thenReturn(parsingSetting);
        when(transactionParsingSettingRestHelper.getModel(parsingSetting)).thenReturn(model);
        when(fileHelper.writeFile(any(), eq("sample.csv"))).thenReturn(null);
        when(csvParser.parseImportData(eq(model), any())).thenReturn(dataMap);

        mockMvc.perform(post("/rest/transactionimport/parseFile")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("id", "1")
                        .param("data", "test,data"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.parsed").value("data"));
    }

    @Test
    void makeFileShouldReturnErrorWhenParsingFails() throws Exception {
        TransactionImportRequestModel requestModel = new TransactionImportRequestModel();
        requestModel.setId(1);
        requestModel.setData("test,data");

        TransactionParsingSetting parsingSetting = new TransactionParsingSetting();
        TransactionParsingSettingDetailModel model = new TransactionParsingSettingDetailModel();

        when(transactionParsingSettingService.findByPK(1L)).thenReturn(parsingSetting);
        when(transactionParsingSettingRestHelper.getModel(parsingSetting)).thenReturn(model);
        when(fileHelper.writeFile(any(), eq("sample.csv"))).thenReturn(null);
        when(csvParser.parseImportData(eq(model), any())).thenReturn(null);

        mockMvc.perform(post("/rest/transactionimport/parseFile")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("id", "1")
                        .param("data", "test,data"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void makeFile2ShouldParseWithoutTemplateSuccessfully() throws Exception {
        TransactionImportRequestModel requestModel = new TransactionImportRequestModel();
        requestModel.setData("test,data");

        TransactionParsingSettingDetailModel model = new TransactionParsingSettingDetailModel();
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("result", "success");

        when(transactionParsingSettingRestHelper.getModel2(any())).thenReturn(model);
        when(fileHelper.writeFile(any(), eq("sample.csv"))).thenReturn(null);
        when(csvParser.parseImportData(eq(model), any())).thenReturn(dataMap);

        mockMvc.perform(post("/rest/transactionimport/parseFileWithoutTemplate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("success"));

        verify(transactionParsingSettingRestHelper).getModel2(any());
    }

    @Test
    void makeFile2ShouldReturnErrorWhenParsingFails() throws Exception {
        TransactionImportRequestModel requestModel = new TransactionImportRequestModel();
        requestModel.setData("test,data");

        TransactionParsingSettingDetailModel model = new TransactionParsingSettingDetailModel();

        when(transactionParsingSettingRestHelper.getModel2(any())).thenReturn(model);
        when(fileHelper.writeFile(any(), eq("sample.csv"))).thenReturn(null);
        when(csvParser.parseImportData(eq(model), any())).thenReturn(null);

        mockMvc.perform(post("/rest/transactionimport/parseFileWithoutTemplate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void saveTransactionsShouldHandleMultipleTransactions() throws Exception {
        List<TransactionModel> transactionList = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            transactionList.add(createTransactionModel("Transaction " + i));
        }

        String requestBody = objectMapper.writeValueAsString(transactionList);

        mockMvc.perform(post("/rest/transactionimport/saveimporttransaction")
                        .param("id", "1")
                        .param("bankId", "5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));
    }

    @Test
    void importTransactionShouldSetCreatedBy() throws Exception {
        TransactionImportModel importModel = new TransactionImportModel();
        List<Transaction> transactions = Arrays.asList(new Transaction());

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(42);
        when(transactionImportRestHelper.getEntity(any())).thenReturn(transactions);
        when(transactionService.saveTransactions(transactions)).thenReturn("Success");

        mockMvc.perform(post("/rest/transactionimport/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(importModel)))
                .andExpect(status().isOk());

        verify(jwtTokenUtil).getUserIdFromHttpRequest(any());
    }

    // Helper methods
    private BankAccount createBankAccount(int id, String name) {
        BankAccount account = new BankAccount();
        account.setBankAccountId(id);
        account.setAccountName(name);
        return account;
    }

    private TransactionModel createTransactionModel(String description) {
        TransactionModel model = new TransactionModel();
        model.setDescription(description);
        model.setTransactionDate("01/01/2024");
        model.setDebit("100.00");
        model.setCredit("");
        return model;
    }
}
