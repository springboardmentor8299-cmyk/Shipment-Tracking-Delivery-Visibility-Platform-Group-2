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
        private JwtAuthFilter jwtAuthFilter;

        @Autowired
        private CustomUserDetailsService customUserDetailsService;

        @Autowired
        private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

        @Autowired
        private CustomAccessDeniedHandler customAccessDeniedHandler;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http
                                .cors(cors -> {
                                })
                                .csrf(csrf -> csrf.disable())
                                .authorizeHttpRequests(auth -> auth

                                                .requestMatchers("/api/auth/**").permitAll()

                                                .requestMatchers("/error").permitAll()

                                                .requestMatchers("/uploads/**").permitAll()

                                                .requestMatchers("/api/admin/pod", "/api/admin/pod/**")
                                                .hasAnyRole("ADMIN", "LOGISTICS_OPERATOR", "DRIVER")

                                                .requestMatchers("/api/admin/routes/**")
                                                .hasAnyRole("ADMIN", "LOGISTICS_OPERATOR")

                                                .requestMatchers("/api/customer/**")
                                                .hasRole("CUSTOMER")

                                                .requestMatchers("/api/admin/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers("/api/business/**")
                                                .hasRole("BUSINESS_CLIENT")

                                                .requestMatchers("/api/operator/**")
                                                .hasAnyRole("LOGISTICS_OPERATOR", "ADMIN")

                                                .requestMatchers("/api/driver/**")
                                                .hasAnyRole("DRIVER", "ADMIN")

                                                .requestMatchers("/api/support/**")
                                                .hasAnyRole(
                                                                "SUPPORT_AGENT",
                                                                "ADMIN")

                                                .requestMatchers("/api/shipments/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "BUSINESS_CLIENT",
                                                                "LOGISTICS_OPERATOR",
                                                                "SUPPORT_AGENT",
                                                                "CUSTOMER",
                                                                "DRIVER")

                                                .anyRequest()
                                                .authenticated())

                                .authenticationProvider(authenticationProvider())

                                .exceptionHandling(exceptions -> exceptions
                                                // Not authenticated at all (missing/expired/invalid token) -> 401 with
                                                // a real reason.
                                                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                                                // Authenticated but wrong role -> 403 with a real reason.
                                                .accessDeniedHandler(customAccessDeniedHandler))

                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                .addFilterBefore(jwtAuthFilter,
                                                UsernamePasswordAuthenticationFilter.class)

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

                DaoAuthenticationProvider provider = new DaoAuthenticationProvider();

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