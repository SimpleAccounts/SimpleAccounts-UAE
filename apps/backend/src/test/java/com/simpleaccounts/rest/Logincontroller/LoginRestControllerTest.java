package com.simpleaccounts.rest.Logincontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.PasswordHistory;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.model.JwtRequest;
import com.simpleaccounts.repository.PasswordHistoryRepository;
import com.simpleaccounts.repository.UserJpaRepository;
import com.simpleaccounts.rest.usercontroller.UserRestHelper;
import com.simpleaccounts.service.EmaiLogsService;
import com.simpleaccounts.service.UserService;
import java.time.LocalDateTime;
import java.util.*;
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
 * Unit tests for LoginRestController.
 */
@ExtendWith(MockitoExtension.class)
class LoginRestControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private UserService userService;

    @Mock
    private EmaiLogsService emaiLogsService;

    @Mock
    private UserRestHelper userRestHelper;

    @Mock
    private PasswordHistoryRepository passwordHistoryRepository;

    @Mock
    private UserJpaRepository userJpaRepository;

    @InjectMocks
    private LoginRestController loginRestController;

    private User testUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(loginRestController).build();
        objectMapper = new ObjectMapper();

        testUser = new User();
        testUser.setUserId(1);
        testUser.setUserEmail("test@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setDeleteFlag(false);
        testUser.setIsActive(true);
    }

    // ========== forgotPassword Tests ==========

    @Test
    void shouldReturnOkWhenForgotPasswordForValidUser() throws Exception {
        JwtRequest request = new JwtRequest("test@example.com", null, "http://localhost");
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("userEmail", "test@example.com");

        when(userService.findByAttributes(any())).thenReturn(Collections.singletonList(testUser));
        doNothing().when(userService).updateForgotPasswordToken(any(), any());

        mockMvc.perform(post("/public/forgotPassword")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnUnauthorizedWhenUserNotFound() throws Exception {
        JwtRequest request = new JwtRequest("nonexistent@example.com", null, "http://localhost");

        when(userService.findByAttributes(any())).thenReturn(Collections.emptyList());

        mockMvc.perform(post("/public/forgotPassword")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturnUnauthorizedWhenUserListIsNull() throws Exception {
        JwtRequest request = new JwtRequest("test@example.com", null, "http://localhost");

        when(userService.findByAttributes(any())).thenReturn(null);

        mockMvc.perform(post("/public/forgotPassword")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldSkipDeletedUserInForgotPassword() throws Exception {
        JwtRequest request = new JwtRequest("deleted@example.com", null, "http://localhost");

        User deletedUser = new User();
        deletedUser.setUserId(2);
        deletedUser.setUserEmail("deleted@example.com");
        deletedUser.setDeleteFlag(true);

        when(userService.findByAttributes(any())).thenReturn(Collections.singletonList(deletedUser));

        mockMvc.perform(post("/public/forgotPassword")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    // ========== resetPassword Tests ==========

    @Test
    void shouldReturnOkWhenResetPasswordSuccess() throws Exception {
        ResetPasswordModel resetModel = new ResetPasswordModel();
        resetModel.setToken("valid-token");
        resetModel.setPassword("newPassword123");

        testUser.setForgotPasswordToken("valid-token");
        testUser.setForgotPasswordTokenExpiryDate(LocalDateTime.now().plusHours(1));

        when(userJpaRepository.findUsersByForgotPasswordToken("valid-token"))
                .thenReturn(Collections.singletonList(testUser));
        when(passwordHistoryRepository.findPasswordHistoriesByUser(any()))
                .thenReturn(Collections.emptyList());
        when(userRestHelper.saveUserCredential(any(), any())).thenReturn(null);

        mockMvc.perform(post("/public/resetPassword")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resetModel)))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnUnauthorizedWhenTokenNotFound() throws Exception {
        ResetPasswordModel resetModel = new ResetPasswordModel();
        resetModel.setToken("invalid-token");
        resetModel.setPassword("newPassword123");

        when(userJpaRepository.findUsersByForgotPasswordToken("invalid-token"))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(post("/public/resetPassword")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resetModel)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturnUnauthorizedWhenTokenExpired() throws Exception {
        ResetPasswordModel resetModel = new ResetPasswordModel();
        resetModel.setToken("expired-token");
        resetModel.setPassword("newPassword123");

        testUser.setForgotPasswordToken("expired-token");
        testUser.setForgotPasswordTokenExpiryDate(LocalDateTime.now().minusHours(1)); // Expired

        when(userJpaRepository.findUsersByForgotPasswordToken("expired-token"))
                .thenReturn(Collections.singletonList(testUser));

        mockMvc.perform(post("/public/resetPassword")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resetModel)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturnNotAcceptableWhenPasswordAlreadyUsed() throws Exception {
        ResetPasswordModel resetModel = new ResetPasswordModel();
        resetModel.setToken("valid-token");
        resetModel.setPassword("usedPassword");

        testUser.setForgotPasswordToken("valid-token");
        testUser.setForgotPasswordTokenExpiryDate(LocalDateTime.now().plusHours(1));

        PasswordHistory passwordHistory = new PasswordHistory();
        // Encode 'usedPassword' with BCrypt for matching
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder =
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        passwordHistory.setPassword(encoder.encode("usedPassword"));

        when(userJpaRepository.findUsersByForgotPasswordToken("valid-token"))
                .thenReturn(Collections.singletonList(testUser));
        when(passwordHistoryRepository.findPasswordHistoriesByUser(any()))
                .thenReturn(Collections.singletonList(passwordHistory));

        mockMvc.perform(post("/public/resetPassword")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resetModel)))
                .andExpect(status().isNotAcceptable());
    }

    @Test
    void shouldReturnUnauthorizedWhenUserListNull() throws Exception {
        ResetPasswordModel resetModel = new ResetPasswordModel();
        resetModel.setToken("some-token");
        resetModel.setPassword("newPassword");

        when(userJpaRepository.findUsersByForgotPasswordToken("some-token"))
                .thenReturn(null);

        mockMvc.perform(post("/public/resetPassword")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resetModel)))
                .andExpect(status().isUnauthorized());
    }

    // ========== Edge Cases ==========

    @Test
    void shouldHandleEmptyUsername() throws Exception {
        JwtRequest request = new JwtRequest("", null, "http://localhost");

        when(userService.findByAttributes(any())).thenReturn(Collections.emptyList());

        mockMvc.perform(post("/public/forgotPassword")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldHandleNullToken() throws Exception {
        ResetPasswordModel resetModel = new ResetPasswordModel();
        resetModel.setToken(null);
        resetModel.setPassword("newPassword");

        when(userJpaRepository.findUsersByForgotPasswordToken(null))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(post("/public/resetPassword")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resetModel)))
                .andExpect(status().isUnauthorized());
    }
}
