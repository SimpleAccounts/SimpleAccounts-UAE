package com.simpleaccounts.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/**
 * Spring Security 6 Configuration
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class WebSecurityConfig {

	private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

	private final CustomUserDetailsService customUserDetailsService;

	private final JwtRequestFilter jwtRequestFilter;

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public AuthenticationProvider authenticationProvider() {
		DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
		authProvider.setUserDetailsService(customUserDetailsService);
		authProvider.setPasswordEncoder(passwordEncoder());
		return authProvider;
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
		return authConfig.getAuthenticationManager();
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
			.csrf(csrf -> csrf
				.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
				.ignoringRequestMatchers(
					new AntPathRequestMatcher("/rest/**"),
					new AntPathRequestMatcher("/public/**"),
					new AntPathRequestMatcher("/auth/**")
				)
			)
			.authorizeHttpRequests(auth -> auth
				.requestMatchers("/auth/**").permitAll()
				.requestMatchers("/rest/company/register").permitAll()
				.requestMatchers("/rest/company/getHealthCheck").permitAll()
				.requestMatchers("/rest/company/getTimeZoneList").permitAll()
				.requestMatchers("/rest/company/getCompanyCount").permitAll()
				.requestMatchers("/rest/company/getCurrency").permitAll()
				.requestMatchers("/rest/company/getCountry").permitAll()
				.requestMatchers("/rest/company/getState").permitAll()
				.requestMatchers("/rest/company/getCompanyType").permitAll()
				.requestMatchers("/public/**").permitAll()
				.requestMatchers("/rest/config/getReleaseNumber").permitAll()
				.requestMatchers("/rest/config/getreleasenumber").permitAll()
				// SpringDoc OpenAPI endpoints
				.requestMatchers("/swagger-ui/**").permitAll()
				.requestMatchers("/swagger-ui.html").permitAll()
				.requestMatchers("/v3/api-docs/**").permitAll()
				.requestMatchers("/swagger-resources/**").permitAll()
				.requestMatchers("/webjars/**").permitAll()
				.requestMatchers("/rest/**").authenticated()
				.anyRequest().permitAll()
			)
			.exceptionHandling(ex -> ex
				.authenticationEntryPoint(jwtAuthenticationEntryPoint)
			)
			.sessionManagement(session -> session
				.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
			)
			.authenticationProvider(authenticationProvider())
			.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}
