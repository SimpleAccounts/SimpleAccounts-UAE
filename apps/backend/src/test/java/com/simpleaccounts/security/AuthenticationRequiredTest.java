package com.simpleaccounts.security;

import static org.junit.Assert.assertNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import javax.servlet.FilterChain;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Minimal smoke to prove that protected endpoints stay unauthenticated when no JWT is supplied.
 */
@RunWith(MockitoJUnitRunner.class)
public class AuthenticationRequiredTest {

    @InjectMocks
    private JwtRequestFilter jwtRequestFilter;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @Before
    public void setUp() {
        SecurityContextHolder.clearContext();
    }

    @Test
    public void shouldRequireAuthenticationHeaderForProtectedEndpoints() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        jwtRequestFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull("Missing JWT should leave SecurityContext empty",
            SecurityContextHolder.getContext().getAuthentication());
    }
}



