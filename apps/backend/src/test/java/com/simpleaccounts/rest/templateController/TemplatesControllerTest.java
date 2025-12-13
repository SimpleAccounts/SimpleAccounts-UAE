package com.simpleaccounts.rest.templateController;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.MailThemeTemplatesService;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.Query;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

/**
 * Unit tests for TemplatesController.
 */
@ExtendWith(MockitoExtension.class)
class TemplatesControllerTest {

    private MockMvc mockMvc;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private EntityManager entityManager;

    @Mock
    private MailThemeTemplatesService mailThemeTemplatesService;

    @Mock
    private Query query;

    @InjectMocks
    private TemplatesController templatesController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(templatesController).build();
    }

    // ========== updateMailTemplateTheme Tests ==========

    @Test
    void shouldUpdateMailTemplateThemeSuccessfully() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        doNothing().when(mailThemeTemplatesService).updateMailTheme(1);

        mockMvc.perform(post("/rest/templates/updateMailTemplateTheme")
                .param("templateId", "1")
                .header("Authorization", "Bearer valid-token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Email template Theme Updated Successful"));

        verify(mailThemeTemplatesService, times(1)).updateMailTheme(1);
    }

    @Test
    void shouldHandleUpdateMailTemplateThemeWithDifferentTemplateId() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        doNothing().when(mailThemeTemplatesService).updateMailTheme(5);

        mockMvc.perform(post("/rest/templates/updateMailTemplateTheme")
                .param("templateId", "5")
                .header("Authorization", "Bearer valid-token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Email template Theme Updated Successful"));

        verify(mailThemeTemplatesService, times(1)).updateMailTheme(5);
    }

    @Test
    void shouldReturnInternalServerErrorWhenUpdateFails() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        doThrow(new RuntimeException("Database error")).when(mailThemeTemplatesService).updateMailTheme(any());

        mockMvc.perform(post("/rest/templates/updateMailTemplateTheme")
                .param("templateId", "1")
                .header("Authorization", "Bearer valid-token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    // ========== getTemplateDropdown Tests ==========

    @Test
    void shouldGetTemplateDropdownSuccessfully() throws Exception {
        List<Object> queryResults = new ArrayList<>();
        queryResults.add(new Object[]{1, true});
        queryResults.add(new Object[]{2, false});
        queryResults.add(new Object[]{3, true});

        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.getResultList()).thenReturn(queryResults);

        mockMvc.perform(get("/rest/templates/getTemplateDropdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].templateId").value(1))
                .andExpect(jsonPath("$[0].templateEnable").value(true))
                .andExpect(jsonPath("$[1].templateId").value(2))
                .andExpect(jsonPath("$[1].templateEnable").value(false));
    }

    @Test
    void shouldGetEmptyTemplateDropdown() throws Exception {
        List<Object> emptyResults = new ArrayList<>();

        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.getResultList()).thenReturn(emptyResults);

        mockMvc.perform(get("/rest/templates/getTemplateDropdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void shouldReturnInternalServerErrorWhenGetDropdownFails() throws Exception {
        when(entityManager.createQuery(anyString())).thenThrow(new RuntimeException("Query error"));

        mockMvc.perform(get("/rest/templates/getTemplateDropdown"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void shouldGetSingleTemplateInDropdown() throws Exception {
        List<Object> singleResult = new ArrayList<>();
        singleResult.add(new Object[]{1, true});

        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.getResultList()).thenReturn(singleResult);

        mockMvc.perform(get("/rest/templates/getTemplateDropdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].templateId").value(1));
    }

    @Test
    void shouldHandleAllTemplatesDisabled() throws Exception {
        List<Object> disabledTemplates = new ArrayList<>();
        disabledTemplates.add(new Object[]{1, false});
        disabledTemplates.add(new Object[]{2, false});

        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.getResultList()).thenReturn(disabledTemplates);

        mockMvc.perform(get("/rest/templates/getTemplateDropdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].templateEnable").value(false))
                .andExpect(jsonPath("$[1].templateEnable").value(false));
    }

    // ========== Integration Tests ==========

    @Test
    void shouldVerifyJwtTokenUtilCalled() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        doNothing().when(mailThemeTemplatesService).updateMailTheme(1);

        mockMvc.perform(post("/rest/templates/updateMailTemplateTheme")
                .param("templateId", "1")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(jwtTokenUtil, times(1)).getUserIdFromHttpRequest(any());
    }

    @Test
    void shouldVerifyMailThemeTemplatesServiceCalled() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        doNothing().when(mailThemeTemplatesService).updateMailTheme(2);

        mockMvc.perform(post("/rest/templates/updateMailTemplateTheme")
                .param("templateId", "2")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(mailThemeTemplatesService, times(1)).updateMailTheme(2);
    }

    @Test
    void shouldVerifyEntityManagerQueryCreated() throws Exception {
        List<Object> results = new ArrayList<>();
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.getResultList()).thenReturn(results);

        mockMvc.perform(get("/rest/templates/getTemplateDropdown"))
                .andExpect(status().isOk());

        verify(entityManager, times(1)).createQuery(anyString());
    }

    // ========== Edge Cases ==========

    @Test
    void shouldHandleZeroTemplateId() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        doNothing().when(mailThemeTemplatesService).updateMailTheme(0);

        mockMvc.perform(post("/rest/templates/updateMailTemplateTheme")
                .param("templateId", "0")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void shouldHandleLargeTemplateId() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        doNothing().when(mailThemeTemplatesService).updateMailTheme(Integer.MAX_VALUE);

        mockMvc.perform(post("/rest/templates/updateMailTemplateTheme")
                .param("templateId", String.valueOf(Integer.MAX_VALUE))
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void shouldHandleNegativeTemplateId() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        doNothing().when(mailThemeTemplatesService).updateMailTheme(-1);

        mockMvc.perform(post("/rest/templates/updateMailTemplateTheme")
                .param("templateId", "-1")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
