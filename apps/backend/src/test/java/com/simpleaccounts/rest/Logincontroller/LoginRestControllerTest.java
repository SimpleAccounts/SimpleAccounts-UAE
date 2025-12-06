package com.simpleaccounts.rest.Logincontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.EmailLogs;
import com.simpleaccounts.entity.PasswordHistory;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.model.JwtRequest;
import com.simpleaccounts.repository.PasswordHistoryRepository;
import com.simpleaccounts.repository.UserJpaRepository;
import com.simpleaccounts.rest.usercontroller.UserRestHelper;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.service.EmaiLogsService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.SimpleAccountsMessage;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(LoginRestController.class)
@AutoConfigureMockMvc(addFilters = false)
class LoginRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean private UserService userService;
    @MockBean private EmaiLogsService emaiLogsService;
    @MockBean private UserRestHelper userRestHelper;
    @MockBean private PasswordHistoryRepository passwordHistoryRepository;
    @MockBean private UserJpaRepository userJpaRepository;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    @Test
    void forgotPasswordShouldReturnOkWhenUserExists() throws Exception {
        JwtRequest jwtRequest = new JwtRequest();
        jwtRequest.setUsername("test@example.com");
        jwtRequest.setUrl("http://localhost:3000");

        User user = new User();
        user.setUserId(1);
        user.setUserEmail("test@example.com");
        user.setDeleteFlag(false);

        when(userService.findByAttributes(any(Map.class))).thenReturn(Arrays.asList(user));

        mockMvc.perform(post("/public/forgotPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(jwtRequest)))
                .andExpect(status().isOk());

        verify(userService).updateForgotPasswordToken(eq(user), eq(jwtRequest));
        verify(emaiLogsService).persist(any(EmailLogs.class));
    }

    @Test
    void forgotPasswordShouldReturnUnauthorizedWhenUserNotFound() throws Exception {
        JwtRequest jwtRequest = new JwtRequest();
        jwtRequest.setUsername("nonexistent@example.com");
        jwtRequest.setUrl("http://localhost:3000");

        when(userService.findByAttributes(any(Map.class))).thenReturn(null);

        mockMvc.perform(post("/public/forgotPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(jwtRequest)))
                .andExpect(status().isUnauthorized());

        verify(userService, never()).updateForgotPasswordToken(any(), any());
        verify(emaiLogsService, never()).persist(any());
    }

    @Test
    void forgotPasswordShouldReturnUnauthorizedWhenUserListIsEmpty() throws Exception {
        JwtRequest jwtRequest = new JwtRequest();
        jwtRequest.setUsername("test@example.com");
        jwtRequest.setUrl("http://localhost:3000");

        when(userService.findByAttributes(any(Map.class))).thenReturn(Collections.emptyList());

        mockMvc.perform(post("/public/forgotPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(jwtRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void forgotPasswordShouldSkipDeletedUsers() throws Exception {
        JwtRequest jwtRequest = new JwtRequest();
        jwtRequest.setUsername("test@example.com");
        jwtRequest.setUrl("http://localhost:3000");

        User deletedUser = new User();
        deletedUser.setUserId(1);
        deletedUser.setUserEmail("test@example.com");
        deletedUser.setDeleteFlag(true);

        when(userService.findByAttributes(any(Map.class))).thenReturn(Arrays.asList(deletedUser));

        mockMvc.perform(post("/public/forgotPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(jwtRequest)))
                .andExpect(status().isInternalServerError());

        verify(userService, never()).updateForgotPasswordToken(any(), any());
    }

    @Test
    void forgotPasswordShouldProcessMultipleUsersAndFindActiveOne() throws Exception {
        JwtRequest jwtRequest = new JwtRequest();
        jwtRequest.setUsername("test@example.com");
        jwtRequest.setUrl("http://localhost:3000");

        User deletedUser = new User();
        deletedUser.setUserId(1);
        deletedUser.setUserEmail("test@example.com");
        deletedUser.setDeleteFlag(true);

        User activeUser = new User();
        activeUser.setUserId(2);
        activeUser.setUserEmail("test@example.com");
        activeUser.setDeleteFlag(false);

        when(userService.findByAttributes(any(Map.class))).thenReturn(Arrays.asList(deletedUser, activeUser));

        mockMvc.perform(post("/public/forgotPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(jwtRequest)))
                .andExpect(status().isOk());

        verify(userService).updateForgotPasswordToken(eq(activeUser), eq(jwtRequest));
    }

    @Test
    void resetPasswordShouldReturnOkWhenTokenIsValid() throws Exception {
        ResetPasswordModel resetPasswordModel = new ResetPasswordModel();
        resetPasswordModel.setToken("valid-token-123");
        resetPasswordModel.setPassword("newPassword123");

        User user = new User();
        user.setUserId(1);
        user.setUserEmail("test@example.com");
        user.setForgotPasswordToken("valid-token-123");
        user.setForgotPasswordTokenExpiryDate(LocalDateTime.now().plusHours(1));

        SimpleAccountsMessage message = new SimpleAccountsMessage("", "Success", false);

        when(userJpaRepository.findUsersByForgotPasswordToken("valid-token-123")).thenReturn(Arrays.asList(user));
        when(passwordHistoryRepository.findPasswordHistoriesByUser(user)).thenReturn(null);
        when(userRestHelper.saveUserCredential(eq(user), any(String.class), any())).thenReturn(message);

        mockMvc.perform(post("/public/resetPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetPasswordModel)))
                .andExpect(status().isOk());

        verify(userService).persist(user);
        verify(userRestHelper).saveUserCredential(eq(user), any(String.class), any());
    }

    @Test
    void resetPasswordShouldReturnUnauthorizedWhenTokenNotFound() throws Exception {
        ResetPasswordModel resetPasswordModel = new ResetPasswordModel();
        resetPasswordModel.setToken("invalid-token");
        resetPasswordModel.setPassword("newPassword123");

        when(userJpaRepository.findUsersByForgotPasswordToken("invalid-token")).thenReturn(null);

        mockMvc.perform(post("/public/resetPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetPasswordModel)))
                .andExpect(status().isUnauthorized());

        verify(userService, never()).persist(any());
    }

    @Test
    void resetPasswordShouldReturnUnauthorizedWhenTokenIsExpired() throws Exception {
        ResetPasswordModel resetPasswordModel = new ResetPasswordModel();
        resetPasswordModel.setToken("expired-token");
        resetPasswordModel.setPassword("newPassword123");

        User user = new User();
        user.setUserId(1);
        user.setForgotPasswordToken("expired-token");
        user.setForgotPasswordTokenExpiryDate(LocalDateTime.now().minusHours(1));

        when(userJpaRepository.findUsersByForgotPasswordToken("expired-token")).thenReturn(Arrays.asList(user));

        mockMvc.perform(post("/public/resetPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetPasswordModel)))
                .andExpect(status().isUnauthorized());

        verify(userService, never()).persist(any());
    }

    @Test
    void resetPasswordShouldReturnUnauthorizedWhenUserListIsEmpty() throws Exception {
        ResetPasswordModel resetPasswordModel = new ResetPasswordModel();
        resetPasswordModel.setToken("valid-token");
        resetPasswordModel.setPassword("newPassword123");

        when(userJpaRepository.findUsersByForgotPasswordToken("valid-token")).thenReturn(Collections.emptyList());

        mockMvc.perform(post("/public/resetPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetPasswordModel)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void resetPasswordShouldReturnNotAcceptableWhenPasswordAlreadyUsed() throws Exception {
        ResetPasswordModel resetPasswordModel = new ResetPasswordModel();
        resetPasswordModel.setToken("valid-token");
        resetPasswordModel.setPassword("oldPassword123");

        User user = new User();
        user.setUserId(1);
        user.setForgotPasswordToken("valid-token");
        user.setForgotPasswordTokenExpiryDate(LocalDateTime.now().plusHours(1));

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String encodedOldPassword = encoder.encode("oldPassword123");

        PasswordHistory passwordHistory = new PasswordHistory();
        passwordHistory.setPassword(encodedOldPassword);

        when(userJpaRepository.findUsersByForgotPasswordToken("valid-token")).thenReturn(Arrays.asList(user));
        when(passwordHistoryRepository.findPasswordHistoriesByUser(user)).thenReturn(Arrays.asList(passwordHistory));

        mockMvc.perform(post("/public/resetPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetPasswordModel)))
                .andExpect(status().isNotAcceptable())
                .andExpect(jsonPath("$.error").value(true));

        verify(userService, never()).persist(any());
    }

    @Test
    void resetPasswordShouldClearTokensAfterSuccessfulReset() throws Exception {
        ResetPasswordModel resetPasswordModel = new ResetPasswordModel();
        resetPasswordModel.setToken("valid-token");
        resetPasswordModel.setPassword("newPassword123");

        User user = new User();
        user.setUserId(1);
        user.setForgotPasswordToken("valid-token");
        user.setForgotPasswordTokenExpiryDate(LocalDateTime.now().plusHours(1));

        SimpleAccountsMessage message = new SimpleAccountsMessage("", "Success", false);

        when(userJpaRepository.findUsersByForgotPasswordToken("valid-token")).thenReturn(Arrays.asList(user));
        when(passwordHistoryRepository.findPasswordHistoriesByUser(user)).thenReturn(new ArrayList<>());
        when(userRestHelper.saveUserCredential(eq(user), any(String.class), any())).thenReturn(message);

        mockMvc.perform(post("/public/resetPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetPasswordModel)))
                .andExpect(status().isOk());

        verify(userService).persist(user);
        // Verify tokens were cleared
        assert user.getForgotPasswordToken() == null;
        assert user.getForgotPasswordTokenExpiryDate() == null;
    }

    @Test
    void resetPasswordShouldAcceptPasswordWhenNoPasswordHistoryExists() throws Exception {
        ResetPasswordModel resetPasswordModel = new ResetPasswordModel();
        resetPasswordModel.setToken("valid-token");
        resetPasswordModel.setPassword("newPassword123");

        User user = new User();
        user.setUserId(1);
        user.setForgotPasswordToken("valid-token");
        user.setForgotPasswordTokenExpiryDate(LocalDateTime.now().plusHours(1));

        SimpleAccountsMessage message = new SimpleAccountsMessage("", "Success", false);

        when(userJpaRepository.findUsersByForgotPasswordToken("valid-token")).thenReturn(Arrays.asList(user));
        when(passwordHistoryRepository.findPasswordHistoriesByUser(user)).thenReturn(null);
        when(userRestHelper.saveUserCredential(eq(user), any(String.class), any())).thenReturn(message);

        mockMvc.perform(post("/public/resetPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetPasswordModel)))
                .andExpect(status().isOk());

        verify(userService).persist(user);
    }

    @Test
    void resetPasswordShouldCheckMultiplePasswordHistoryEntries() throws Exception {
        ResetPasswordModel resetPasswordModel = new ResetPasswordModel();
        resetPasswordModel.setToken("valid-token");
        resetPasswordModel.setPassword("reusedPassword");

        User user = new User();
        user.setUserId(1);
        user.setForgotPasswordToken("valid-token");
        user.setForgotPasswordTokenExpiryDate(LocalDateTime.now().plusHours(1));

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        PasswordHistory history1 = new PasswordHistory();
        history1.setPassword(encoder.encode("oldPassword1"));

        PasswordHistory history2 = new PasswordHistory();
        history2.setPassword(encoder.encode("reusedPassword"));

        when(userJpaRepository.findUsersByForgotPasswordToken("valid-token")).thenReturn(Arrays.asList(user));
        when(passwordHistoryRepository.findPasswordHistoriesByUser(user)).thenReturn(Arrays.asList(history1, history2));

        mockMvc.perform(post("/public/resetPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetPasswordModel)))
                .andExpect(status().isNotAcceptable());

        verify(userService, never()).persist(any());
    }

    @Test
    void resetPasswordShouldReturnInternalServerErrorOnException() throws Exception {
        ResetPasswordModel resetPasswordModel = new ResetPasswordModel();
        resetPasswordModel.setToken("valid-token");
        resetPasswordModel.setPassword("newPassword123");

        when(userJpaRepository.findUsersByForgotPasswordToken("valid-token")).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(post("/public/resetPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetPasswordModel)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value(true));
    }

    @Test
    void resetPasswordShouldEncodePasswordBeforeSaving() throws Exception {
        ResetPasswordModel resetPasswordModel = new ResetPasswordModel();
        resetPasswordModel.setToken("valid-token");
        resetPasswordModel.setPassword("plainPassword");

        User user = new User();
        user.setUserId(1);
        user.setForgotPasswordToken("valid-token");
        user.setForgotPasswordTokenExpiryDate(LocalDateTime.now().plusHours(1));

        SimpleAccountsMessage message = new SimpleAccountsMessage("", "Success", false);

        when(userJpaRepository.findUsersByForgotPasswordToken("valid-token")).thenReturn(Arrays.asList(user));
        when(passwordHistoryRepository.findPasswordHistoriesByUser(user)).thenReturn(new ArrayList<>());
        when(userRestHelper.saveUserCredential(eq(user), any(String.class), any())).thenReturn(message);

        mockMvc.perform(post("/public/resetPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetPasswordModel)))
                .andExpect(status().isOk());

        verify(userService).persist(user);
        // Password should be encoded, not plain text
        assert !user.getPassword().equals("plainPassword");
    }

    @Test
    void forgotPasswordShouldCreateEmailLogWithCorrectFields() throws Exception {
        JwtRequest jwtRequest = new JwtRequest();
        jwtRequest.setUsername("test@example.com");
        jwtRequest.setUrl("http://localhost:3000/reset");

        User user = new User();
        user.setUserId(5);
        user.setUserEmail("test@example.com");
        user.setDeleteFlag(false);

        when(userService.findByAttributes(any(Map.class))).thenReturn(Arrays.asList(user));

        mockMvc.perform(post("/public/forgotPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(jwtRequest)))
                .andExpect(status().isOk());

        verify(emaiLogsService).persist(any(EmailLogs.class));
    }

    @Test
    void resetPasswordShouldCallSaveUserCredentialHelper() throws Exception {
        ResetPasswordModel resetPasswordModel = new ResetPasswordModel();
        resetPasswordModel.setToken("valid-token");
        resetPasswordModel.setPassword("newPassword123");

        User user = new User();
        user.setUserId(1);
        user.setForgotPasswordToken("valid-token");
        user.setForgotPasswordTokenExpiryDate(LocalDateTime.now().plusHours(1));

        SimpleAccountsMessage message = new SimpleAccountsMessage("123", "Password reset successful", false);

        when(userJpaRepository.findUsersByForgotPasswordToken("valid-token")).thenReturn(Arrays.asList(user));
        when(passwordHistoryRepository.findPasswordHistoriesByUser(user)).thenReturn(new ArrayList<>());
        when(userRestHelper.saveUserCredential(eq(user), any(String.class), any())).thenReturn(message);

        mockMvc.perform(post("/public/resetPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetPasswordModel)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("123"));

        verify(userRestHelper).saveUserCredential(eq(user), any(String.class), any());
    }
}
