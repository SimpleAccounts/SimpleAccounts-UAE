package com.simpleaccounts.rest.templateController;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.MailThemeTemplatesService;

import java.util.ArrayList;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.Query;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(TemplatesController.class)
@AutoConfigureMockMvc(addFilters = false)
class TemplatesControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private JwtTokenUtil jwtTokenUtil;
    @MockBean private EntityManager entityManager;
    @MockBean private MailThemeTemplatesService mailThemeTemplatesService;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    @Mock private Query mockQuery;

    @BeforeEach
    void setUp() {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
    }

    @Test
    void updateMailTemplateThemeShouldReturnSuccessMessage() throws Exception {
        mockMvc.perform(post("/rest/templates/updateMailTemplateTheme")
                        .param("templateId", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Email template Theme Updated Successful")));

        verify(jwtTokenUtil).getUserIdFromHttpRequest(any());
        verify(mailThemeTemplatesService).updateMailTheme(1);
    }

    @Test
    void updateMailTemplateThemeShouldHandleDifferentTemplateIds() throws Exception {
        mockMvc.perform(post("/rest/templates/updateMailTemplateTheme")
                        .param("templateId", "5"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Email template Theme Updated Successful")));

        verify(mailThemeTemplatesService).updateMailTheme(5);
    }

    @Test
    void updateMailTemplateThemeShouldReturnInternalServerErrorOnException() throws Exception {
        doThrow(new RuntimeException("Database error"))
                .when(mailThemeTemplatesService).updateMailTheme(anyInt());

        mockMvc.perform(post("/rest/templates/updateMailTemplateTheme")
                        .param("templateId", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void updateMailTemplateThemeShouldExtractUserIdFromRequest() throws Exception {
        mockMvc.perform(post("/rest/templates/updateMailTemplateTheme")
                        .param("templateId", "1"))
                .andExpect(status().isOk());

        verify(jwtTokenUtil).getUserIdFromHttpRequest(any());
    }

    @Test
    void getTemplateDropdownShouldReturnTemplateList() throws Exception {
        List<Object> resultList = new ArrayList<>();
        Object[] template1 = {1, true};
        Object[] template2 = {2, false};
        resultList.add(template1);
        resultList.add(template2);

        when(entityManager.createQuery(any(String.class))).thenReturn(mockQuery);
        when(mockQuery.getResultList()).thenReturn(resultList);

        mockMvc.perform(get("/rest/templates/getTemplateDropdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].templateId").value(1))
                .andExpect(jsonPath("$[0].templateEnable").value(true))
                .andExpect(jsonPath("$[1].templateId").value(2))
                .andExpect(jsonPath("$[1].templateEnable").value(false));

        verify(entityManager).createQuery(any(String.class));
    }

    @Test
    void getTemplateDropdownShouldHandleEmptyList() throws Exception {
        List<Object> emptyList = new ArrayList<>();

        when(entityManager.createQuery(any(String.class))).thenReturn(mockQuery);
        when(mockQuery.getResultList()).thenReturn(emptyList);

        mockMvc.perform(get("/rest/templates/getTemplateDropdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getTemplateDropdownShouldReturnInternalServerErrorOnException() throws Exception {
        when(entityManager.createQuery(any(String.class))).thenThrow(new RuntimeException("Query error"));

        mockMvc.perform(get("/rest/templates/getTemplateDropdown"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getTemplateDropdownShouldHandleSingleTemplate() throws Exception {
        List<Object> resultList = new ArrayList<>();
        Object[] template = {3, true};
        resultList.add(template);

        when(entityManager.createQuery(any(String.class))).thenReturn(mockQuery);
        when(mockQuery.getResultList()).thenReturn(resultList);

        mockMvc.perform(get("/rest/templates/getTemplateDropdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].templateId").value(3))
                .andExpect(jsonPath("$[0].templateEnable").value(true));
    }

    @Test
    void getTemplateDropdownShouldHandleMultipleTemplates() throws Exception {
        List<Object> resultList = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            Object[] template = {i, i % 2 == 0};
            resultList.add(template);
        }

        when(entityManager.createQuery(any(String.class))).thenReturn(mockQuery);
        when(mockQuery.getResultList()).thenReturn(resultList);

        mockMvc.perform(get("/rest/templates/getTemplateDropdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5));
    }

    @Test
    void updateMailTemplateThemeShouldHandleZeroTemplateId() throws Exception {
        mockMvc.perform(post("/rest/templates/updateMailTemplateTheme")
                        .param("templateId", "0"))
                .andExpect(status().isOk());

        verify(mailThemeTemplatesService).updateMailTheme(0);
    }

    @Test
    void updateMailTemplateThemeShouldHandleNegativeTemplateId() throws Exception {
        mockMvc.perform(post("/rest/templates/updateMailTemplateTheme")
                        .param("templateId", "-1"))
                .andExpect(status().isOk());

        verify(mailThemeTemplatesService).updateMailTheme(-1);
    }

    @Test
    void updateMailTemplateThemeShouldHandleLargeTemplateId() throws Exception {
        mockMvc.perform(post("/rest/templates/updateMailTemplateTheme")
                        .param("templateId", "999999"))
                .andExpect(status().isOk());

        verify(mailThemeTemplatesService).updateMailTheme(999999);
    }

    @Test
    void getTemplateDropdownShouldExecuteCorrectQuery() throws Exception {
        List<Object> resultList = new ArrayList<>();

        when(entityManager.createQuery(any(String.class))).thenReturn(mockQuery);
        when(mockQuery.getResultList()).thenReturn(resultList);

        mockMvc.perform(get("/rest/templates/getTemplateDropdown"))
                .andExpect(status().isOk());

        verify(entityManager).createQuery("SELECT m.templateId as templateId,m.templateEnable as templateEnable FROM MailThemeTemplates m GROUP BY m.templateId");
    }

    @Test
    void getTemplateDropdownShouldHandleAllEnabledTemplates() throws Exception {
        List<Object> resultList = new ArrayList<>();
        Object[] template1 = {1, true};
        Object[] template2 = {2, true};
        Object[] template3 = {3, true};
        resultList.add(template1);
        resultList.add(template2);
        resultList.add(template3);

        when(entityManager.createQuery(any(String.class))).thenReturn(mockQuery);
        when(mockQuery.getResultList()).thenReturn(resultList);

        mockMvc.perform(get("/rest/templates/getTemplateDropdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].templateEnable").value(true))
                .andExpect(jsonPath("$[1].templateEnable").value(true))
                .andExpect(jsonPath("$[2].templateEnable").value(true));
    }

    @Test
    void getTemplateDropdownShouldHandleAllDisabledTemplates() throws Exception {
        List<Object> resultList = new ArrayList<>();
        Object[] template1 = {1, false};
        Object[] template2 = {2, false};
        resultList.add(template1);
        resultList.add(template2);

        when(entityManager.createQuery(any(String.class))).thenReturn(mockQuery);
        when(mockQuery.getResultList()).thenReturn(resultList);

        mockMvc.perform(get("/rest/templates/getTemplateDropdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].templateEnable").value(false))
                .andExpect(jsonPath("$[1].templateEnable").value(false));
    }

    @Test
    void updateMailTemplateThemeShouldHandleServiceException() throws Exception {
        doThrow(new IllegalArgumentException("Invalid template ID"))
                .when(mailThemeTemplatesService).updateMailTheme(anyInt());

        mockMvc.perform(post("/rest/templates/updateMailTemplateTheme")
                        .param("templateId", "999"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getTemplateDropdownShouldHandleQueryExecutionException() throws Exception {
        when(entityManager.createQuery(any(String.class))).thenReturn(mockQuery);
        when(mockQuery.getResultList()).thenThrow(new RuntimeException("Query execution failed"));

        mockMvc.perform(get("/rest/templates/getTemplateDropdown"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void updateMailTemplateThemeShouldCallServiceWithCorrectParameter() throws Exception {
        int templateId = 42;

        mockMvc.perform(post("/rest/templates/updateMailTemplateTheme")
                        .param("templateId", String.valueOf(templateId)))
                .andExpect(status().isOk());

        verify(mailThemeTemplatesService).updateMailTheme(templateId);
    }

    @Test
    void getTemplateDropdownShouldReturnCorrectObjectStructure() throws Exception {
        List<Object> resultList = new ArrayList<>();
        Object[] template = {10, true};
        resultList.add(template);

        when(entityManager.createQuery(any(String.class))).thenReturn(mockQuery);
        when(mockQuery.getResultList()).thenReturn(resultList);

        mockMvc.perform(get("/rest/templates/getTemplateDropdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").exists())
                .andExpect(jsonPath("$[0].templateId").exists())
                .andExpect(jsonPath("$[0].templateEnable").exists());
    }

    @Test
    void updateMailTemplateThemeShouldHandleNullPointerException() throws Exception {
        doThrow(new NullPointerException("Null value encountered"))
                .when(mailThemeTemplatesService).updateMailTheme(anyInt());

        mockMvc.perform(post("/rest/templates/updateMailTemplateTheme")
                        .param("templateId", "1"))
                .andExpect(status().isInternalServerError());
    }
}
