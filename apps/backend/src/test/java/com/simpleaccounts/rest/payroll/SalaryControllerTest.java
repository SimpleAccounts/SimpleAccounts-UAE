package com.simpleaccounts.rest.payroll;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.model.SalaryPersistModel;
import com.simpleaccounts.rest.payroll.service.Impl.SalaryServiceImpl;
import com.simpleaccounts.rest.payroll.service.SalaryService;
import com.simpleaccounts.rest.payroll.service.SalaryTemplateService;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.EmploymentService;
import com.simpleaccounts.service.UserService;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(SalaryController.class)
@AutoConfigureMockMvc(addFilters = false)
class SalaryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean private JwtTokenUtil jwtTokenUtil;
    @MockBean private UserService userService;
    @MockBean private SalaryRestHelper salaryRestHelper;
    @MockBean private EmploymentService employmentService;
    @MockBean private SalaryTemplateService salaryTemplateService;
    @MockBean private SalaryService salaryService;
    @MockBean private SalaryServiceImpl salaryServiceImpl;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    @Test
    void getSalaryPerMonthListShouldReturnSalaryList() throws Exception {
        SalaryListPerMonthResponseModel responseModel = new SalaryListPerMonthResponseModel();
        responseModel.setTotalCount(10);
        responseModel.setSalaryList(new ArrayList<>());

        when(salaryRestHelper.getSalaryPerMonthList(any(SalaryPerMonthRequestModel.class))).thenReturn(responseModel);

        mockMvc.perform(get("/rest/Salary/getSalaryPerMonthList")
                        .param("month", "1")
                        .param("year", "2024"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").value(10));

        verify(salaryRestHelper).getSalaryPerMonthList(any(SalaryPerMonthRequestModel.class));
    }

    @Test
    void getSalaryPerMonthListShouldHandleEmptyList() throws Exception {
        SalaryListPerMonthResponseModel responseModel = new SalaryListPerMonthResponseModel();
        responseModel.setTotalCount(0);
        responseModel.setSalaryList(Collections.emptyList());

        when(salaryRestHelper.getSalaryPerMonthList(any())).thenReturn(responseModel);

        mockMvc.perform(get("/rest/Salary/getSalaryPerMonthList")
                        .param("month", "3")
                        .param("year", "2024"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").value(0));
    }

    @Test
    void getSalaryPerMonthListShouldReturnInternalServerErrorOnException() throws Exception {
        when(salaryRestHelper.getSalaryPerMonthList(any())).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/rest/Salary/getSalaryPerMonthList")
                        .param("month", "1")
                        .param("year", "2024"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getSalaryPerMonthListShouldAcceptMonthAndYearParameters() throws Exception {
        SalaryListPerMonthResponseModel responseModel = new SalaryListPerMonthResponseModel();
        responseModel.setTotalCount(5);

        when(salaryRestHelper.getSalaryPerMonthList(any())).thenReturn(responseModel);

        mockMvc.perform(get("/rest/Salary/getSalaryPerMonthList")
                        .param("month", "12")
                        .param("year", "2023"))
                .andExpect(status().isOk());

        verify(salaryRestHelper).getSalaryPerMonthList(any());
    }

    @Test
    void getIncompleteEmployeeListShouldReturnIncompleteEmployees() throws Exception {
        IncompleteEmployeeResponseModel responseModel = new IncompleteEmployeeResponseModel();
        responseModel.setTotalCount(3);
        responseModel.setIncompleteEmployeeList(new ArrayList<>());

        when(salaryRestHelper.getIncompleteEmployeeList()).thenReturn(responseModel);

        mockMvc.perform(get("/rest/Salary/getIncompleteEmployeeList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").value(3));

        verify(salaryRestHelper).getIncompleteEmployeeList();
    }

    @Test
    void getIncompleteEmployeeListShouldHandleNoIncompleteEmployees() throws Exception {
        IncompleteEmployeeResponseModel responseModel = new IncompleteEmployeeResponseModel();
        responseModel.setTotalCount(0);
        responseModel.setIncompleteEmployeeList(Collections.emptyList());

        when(salaryRestHelper.getIncompleteEmployeeList()).thenReturn(responseModel);

        mockMvc.perform(get("/rest/Salary/getIncompleteEmployeeList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").value(0));
    }

    @Test
    void getIncompleteEmployeeListShouldReturnInternalServerErrorOnException() throws Exception {
        when(salaryRestHelper.getIncompleteEmployeeList()).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(get("/rest/Salary/getIncompleteEmployeeList"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void generateSalaryShouldReturnSuccessStatus() throws Exception {
        when(salaryRestHelper.generateSalary(any(SalaryPersistModel.class), any(HttpServletRequest.class)))
                .thenReturn("Salary generated successfully");

        mockMvc.perform(post("/rest/Salary/generateSalary")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("month", "1")
                        .param("year", "2024")
                        .param("employeeIds", "1,2,3"))
                .andExpect(status().isOk());

        verify(salaryRestHelper).generateSalary(any(SalaryPersistModel.class), any(HttpServletRequest.class));
    }

    @Test
    void generateSalaryShouldReturnInternalServerErrorOnException() throws Exception {
        when(salaryRestHelper.generateSalary(any(), any())).thenThrow(new RuntimeException("Generation failed"));

        mockMvc.perform(post("/rest/Salary/generateSalary")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("month", "1")
                        .param("year", "2024"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void generateSalaryShouldProcessSalaryPersistModel() throws Exception {
        when(salaryRestHelper.generateSalary(any(), any())).thenReturn("Success");

        mockMvc.perform(post("/rest/Salary/generateSalary")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("month", "3")
                        .param("year", "2024")
                        .param("employeeIds", "10,20,30"))
                .andExpect(status().isOk());

        verify(salaryRestHelper).generateSalary(any(SalaryPersistModel.class), any(HttpServletRequest.class));
    }

    @Test
    void getSalariesByEmployeeIdShouldReturnSalarySlip() throws Exception {
        SalarySlipModel salarySlipModel = new SalarySlipModel();
        salarySlipModel.setEmployeeId(1);
        salarySlipModel.setEmployeeName("John Doe");
        salarySlipModel.setBasicSalary(5000.0);

        when(salaryService.getSalaryByEmployeeId(eq(1), eq("2024-01"))).thenReturn(salarySlipModel);

        mockMvc.perform(get("/rest/Salary/getSalariesByEmployeeId")
                        .param("id", "1")
                        .param("salaryDate", "2024-01")
                        .param("sendMail", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value(1))
                .andExpect(jsonPath("$.employeeName").value("John Doe"))
                .andExpect(jsonPath("$.basicSalary").value(5000.0));

        verify(salaryService).getSalaryByEmployeeId(1, "2024-01");
        verify(salaryRestHelper, never()).sendPayslipEmail(any(), any(), any(), any(), any());
    }

    @Test
    void getSalariesByEmployeeIdShouldSendEmailWhenRequested() throws Exception {
        SalarySlipModel salarySlipModel = new SalarySlipModel();
        salarySlipModel.setEmployeeId(2);

        when(salaryService.getSalaryByEmployeeId(eq(2), eq("2024-02"))).thenReturn(salarySlipModel);

        mockMvc.perform(get("/rest/Salary/getSalariesByEmployeeId")
                        .param("id", "2")
                        .param("salaryDate", "2024-02")
                        .param("startDate", "2024-02-01")
                        .param("endDate", "2024-02-28")
                        .param("sendMail", "true"))
                .andExpect(status().isOk());

        verify(salaryRestHelper).sendPayslipEmail(eq(salarySlipModel), eq(2), eq("2024-02-01"),
                                                   eq("2024-02-28"), any(HttpServletRequest.class));
    }

    @Test
    void getSalariesByEmployeeIdShouldNotSendEmailWhenSendMailIsFalse() throws Exception {
        SalarySlipModel salarySlipModel = new SalarySlipModel();
        salarySlipModel.setEmployeeId(3);

        when(salaryService.getSalaryByEmployeeId(3, "2024-03")).thenReturn(salarySlipModel);

        mockMvc.perform(get("/rest/Salary/getSalariesByEmployeeId")
                        .param("id", "3")
                        .param("salaryDate", "2024-03")
                        .param("sendMail", "false"))
                .andExpect(status().isOk());

        verify(salaryRestHelper, never()).sendPayslipEmail(any(), any(), any(), any(), any());
    }

    @Test
    void getSalariesByEmployeeIdShouldReturnInternalServerErrorOnException() throws Exception {
        when(salaryService.getSalaryByEmployeeId(any(), any())).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(get("/rest/Salary/getSalariesByEmployeeId")
                        .param("id", "1")
                        .param("salaryDate", "2024-01")
                        .param("sendMail", "false"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getSalariesByEmployeeIdShouldHandleOptionalStartAndEndDate() throws Exception {
        SalarySlipModel salarySlipModel = new SalarySlipModel();
        salarySlipModel.setEmployeeId(5);

        when(salaryService.getSalaryByEmployeeId(5, "2024-05")).thenReturn(salarySlipModel);

        mockMvc.perform(get("/rest/Salary/getSalariesByEmployeeId")
                        .param("id", "5")
                        .param("salaryDate", "2024-05")
                        .param("sendMail", "false"))
                .andExpect(status().isOk());

        verify(salaryService).getSalaryByEmployeeId(5, "2024-05");
    }

    @Test
    void getEmployeeTcShouldReturnEmployeeTransactionList() throws Exception {
        List<Object> transactionList = Arrays.asList("Transaction1", "Transaction2");

        when(salaryServiceImpl.getEmployeeTransactions(eq(1), eq("2024-01-01"), eq("2024-01-31")))
                .thenReturn(transactionList);

        mockMvc.perform(get("/rest/Salary/getEmployeeTc")
                        .param("employeeId", "1")
                        .param("startDate", "2024-01-01")
                        .param("endDate", "2024-01-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));

        verify(salaryServiceImpl).getEmployeeTransactions(1, "2024-01-01", "2024-01-31");
    }

    @Test
    void getEmployeeTcShouldHandleEmptyList() throws Exception {
        when(salaryServiceImpl.getEmployeeTransactions(any(), any(), any())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/Salary/getEmployeeTc")
                        .param("employeeId", "2")
                        .param("startDate", "2024-02-01")
                        .param("endDate", "2024-02-28"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getEmployeeTcShouldReturnNotFoundWhenListIsNull() throws Exception {
        when(salaryServiceImpl.getEmployeeTransactions(any(), any(), any())).thenReturn(null);

        mockMvc.perform(get("/rest/Salary/getEmployeeTc")
                        .param("employeeId", "3"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getEmployeeTcShouldHandleOptionalParameters() throws Exception {
        List<Object> transactionList = Arrays.asList("Transaction");

        when(salaryServiceImpl.getEmployeeTransactions(eq(null), eq(null), eq(null))).thenReturn(transactionList);

        mockMvc.perform(get("/rest/Salary/getEmployeeTc"))
                .andExpect(status().isOk());

        verify(salaryServiceImpl).getEmployeeTransactions(null, null, null);
    }

    @Test
    void getEmployeeTcShouldHandleOnlyEmployeeId() throws Exception {
        List<Object> transactionList = new ArrayList<>();

        when(salaryServiceImpl.getEmployeeTransactions(eq(10), eq(null), eq(null))).thenReturn(transactionList);

        mockMvc.perform(get("/rest/Salary/getEmployeeTc")
                        .param("employeeId", "10"))
                .andExpect(status().isOk());

        verify(salaryServiceImpl).getEmployeeTransactions(10, null, null);
    }

    @Test
    void getSalarySlipListShouldReturnSlipList() throws Exception {
        SalarySlipListtResponseModel responseModel = new SalarySlipListtResponseModel();
        responseModel.setTotalCount(5);
        responseModel.setSalarySlipList(new ArrayList<>());

        when(salaryRestHelper.getSalarySlipList(eq(1))).thenReturn(responseModel);

        mockMvc.perform(get("/rest/Salary/getSalarySlipList")
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").value(5));

        verify(salaryRestHelper).getSalarySlipList(1);
    }

    @Test
    void getSalarySlipListShouldHandleEmptySlipList() throws Exception {
        SalarySlipListtResponseModel responseModel = new SalarySlipListtResponseModel();
        responseModel.setTotalCount(0);
        responseModel.setSalarySlipList(Collections.emptyList());

        when(salaryRestHelper.getSalarySlipList(2)).thenReturn(responseModel);

        mockMvc.perform(get("/rest/Salary/getSalarySlipList")
                        .param("id", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").value(0));
    }

    @Test
    void getSalarySlipListShouldReturnInternalServerErrorOnException() throws Exception {
        when(salaryRestHelper.getSalarySlipList(any())).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(get("/rest/Salary/getSalarySlipList")
                        .param("id", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getSalarySlipListShouldAcceptEmployeeIdParameter() throws Exception {
        SalarySlipListtResponseModel responseModel = new SalarySlipListtResponseModel();
        responseModel.setTotalCount(3);

        when(salaryRestHelper.getSalarySlipList(99)).thenReturn(responseModel);

        mockMvc.perform(get("/rest/Salary/getSalarySlipList")
                        .param("id", "99"))
                .andExpect(status().isOk());

        verify(salaryRestHelper).getSalarySlipList(99);
    }

    @Test
    void generateSalaryShouldHandleMultipleEmployees() throws Exception {
        when(salaryRestHelper.generateSalary(any(), any())).thenReturn("Batch salary generated");

        mockMvc.perform(post("/rest/Salary/generateSalary")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("month", "6")
                        .param("year", "2024")
                        .param("employeeIds", "1,2,3,4,5"))
                .andExpect(status().isOk());

        verify(salaryRestHelper).generateSalary(any(), any());
    }

    @Test
    void getSalariesByEmployeeIdShouldSendEmailWithDateRange() throws Exception {
        SalarySlipModel salarySlipModel = new SalarySlipModel();
        salarySlipModel.setEmployeeId(10);
        salarySlipModel.setEmployeeName("Jane Smith");

        when(salaryService.getSalaryByEmployeeId(10, "2024-06")).thenReturn(salarySlipModel);

        mockMvc.perform(get("/rest/Salary/getSalariesByEmployeeId")
                        .param("id", "10")
                        .param("salaryDate", "2024-06")
                        .param("startDate", "2024-06-01")
                        .param("endDate", "2024-06-30")
                        .param("sendMail", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value(10));

        verify(salaryRestHelper).sendPayslipEmail(eq(salarySlipModel), eq(10),
                                                   eq("2024-06-01"), eq("2024-06-30"), any());
    }

    @Test
    void getSalaryPerMonthListShouldHandleDifferentMonths() throws Exception {
        for (int month = 1; month <= 12; month++) {
            SalaryListPerMonthResponseModel responseModel = new SalaryListPerMonthResponseModel();
            responseModel.setTotalCount(month);

            when(salaryRestHelper.getSalaryPerMonthList(any())).thenReturn(responseModel);

            mockMvc.perform(get("/rest/Salary/getSalaryPerMonthList")
                            .param("month", String.valueOf(month))
                            .param("year", "2024"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalCount").value(month));
        }
    }
}
