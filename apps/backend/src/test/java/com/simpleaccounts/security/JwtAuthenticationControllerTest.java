package com.simpleaccounts.security;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.model.JwtRequest;

@RunWith(MockitoJUnitRunner.class)
public class JwtAuthenticationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @InjectMocks
    private JwtAuthenticationController controller;

    @Before
    public void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    public void testCreateAuthenticationToken() throws Exception {
        // Arrange
        String username = "testuser";
        String password = "password";
        String fakeToken = "fake-jwt-token";

        JwtRequest request = new JwtRequest();
        request.setUsername(username);
        request.setPassword(password);

        CustomUserDetails userDetails = new CustomUserDetails();
        userDetails.setUsername(username);
        userDetails.setPassword(password);

        when(authenticationManager.authenticate(any())).thenReturn(null);
        when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);
        when(jwtTokenUtil.generateToken(userDetails)).thenReturn(fakeToken);

        // Act & Assert
        mockMvc.perform(post("/auth/token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(fakeToken));
    }

    @Test
    public void testAuthenticationFailure() throws Exception {
        // Arrange
        JwtRequest request = new JwtRequest();
        request.setUsername("user");
        request.setPassword("wrongpass");

        when(authenticationManager.authenticate(any()))
            .thenThrow(new BadCredentialsException("INVALID_CREDENTIALS"));

        try {
            controller.createAuthenticationToken(request);
            fail("Expected exception for invalid credentials");
        } catch (Exception ex) {
            assertTrue("Should wrap INVALID_CREDENTIALS message",
                ex.getMessage().contains("INVALID_CREDENTIALS"));
        }
    }

    @Test
    public void testDisabledUserAuthenticationFailure() throws Exception {
        JwtRequest request = new JwtRequest();
        request.setUsername("disabled-user");
        request.setPassword("password");

        when(authenticationManager.authenticate(any()))
            .thenThrow(new DisabledException("USER_DISABLED"));

        try {
            controller.createAuthenticationToken(request);
            fail("Expected disabled user exception");
        } catch (Exception ex) {
            assertTrue("Should wrap USER_DISABLED message",
                ex.getMessage().contains("USER_DISABLED"));
        }
    }
}
