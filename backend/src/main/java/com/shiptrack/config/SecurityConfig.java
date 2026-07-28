package com.shiptrack.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

import com.shiptrack.auth.service.CustomUserDetailsService;


@Configuration
public class SecurityConfig {

    @Autowired
    private  JwtAuthFilter jwtAuthFilter;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {        

        http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())
          .authorizeHttpRequests(auth -> auth

                .requestMatchers("/api/auth/**").permitAll()

                .requestMatchers("/api/customer/**")
                .hasRole("CUSTOMER")

                .requestMatchers("/api/admin/**")
                .hasRole("ADMIN")

                .requestMatchers("/api/business/**")
                .hasRole("BUSINESS_CLIENT")

                .requestMatchers("/api/operator/**")
                .hasRole("LOGISTICS_OPERATOR")

                .requestMatchers("/api/support/**")
                .hasRole("SUPPORT_AGENT")

                .requestMatchers("/api/shipments/**")
                .hasAnyRole(
                        "ADMIN",
                        "BUSINESS_CLIENT",
                        "LOGISTICS_OPERATOR",
                        "SUPPORT_AGENT",
                        "CUSTOMER"
                )

                .anyRequest()
                .authenticated()
            )

            .authenticationProvider(authenticationProvider())

            .sessionManagement(session ->
                                     session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)                                  //JWT doesn't use sessions. Every request carries its own token.So we tell Spring, Don't create sessions.This is exactly how modern REST APIs work
          )

            .addFilterBefore(jwtAuthFilter,
                    UsernamePasswordAuthenticationFilter.class)                                                 //This line is the heart of JWT Security

            .formLogin(form -> form.disable())
            .httpBasic(httpBasic -> httpBasic.disable());

            

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();

        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    @Bean
    AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }
}