package com.simpleaccounts.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

	private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

	private final CustomUserDetailsService customUserDetailsService;

	private final JwtRequestFilter jwtRequestFilter;

	@Autowired
	public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {

		auth.userDetailsService(customUserDetailsService).passwordEncoder(passwordEncoder());
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	@Override
	public AuthenticationManager authenticationManagerBean() throws Exception {
		return super.authenticationManagerBean();
	}

	@Override
	protected void configure(HttpSecurity httpSecurity) throws Exception {

		httpSecurity
				.csrf()
				.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
				.ignoringAntMatchers("/rest/**", "/public/**")
				.and()
				// dont authenticate this particular request
				.authorizeRequests().// all other requests need to be authenticated
			//antMatchers("/config/getreleasenumber").permitAll().
					antMatchers("/rest/company/register").permitAll().
				antMatchers("/rest/company/getHealthCheck").permitAll().
				antMatchers("/rest/company/getTimeZoneList").permitAll().
				antMatchers("/rest/company/getCompanyCount").permitAll().
				antMatchers("/rest/company/getCurrency").permitAll().
				antMatchers("/rest/company/getCountry").permitAll().
				antMatchers("/rest/company/getState").permitAll().
				antMatchers("/rest/company/getCompanyType").permitAll().
				antMatchers("/public/**").permitAll().
				antMatchers("/rest/company/getSimpleAccountsreleasenumber").permitAll().
				antMatchers("/rest/**").authenticated().and().

				exceptionHandling().authenticationEntryPoint(jwtAuthenticationEntryPoint).and().sessionManagement()
					.sessionCreationPolicy(SessionCreationPolicy.STATELESS);

		// Add a filter to validate the tokens with every request
		httpSecurity.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
	}
}
