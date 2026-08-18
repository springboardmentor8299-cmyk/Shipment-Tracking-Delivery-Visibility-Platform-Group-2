package com.shiptrack.backend.security;

import com.shiptrack.backend.entity.User;
import com.shiptrack.backend.repository.UserRepository;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository repository;

    public CustomUserDetailsService(UserRepository repository) {
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = repository.findByEmail(email)
                .orElseGet(() -> repository.findByUsername(email)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email)));

        String rawRole = user.getRole() != null ? user.getRole().trim().toUpperCase() : "CUSTOMER";
        if (rawRole.startsWith("ROLE_")) {
            rawRole = rawRole.substring(5);
        }

        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + rawRole));

        if ("ADMIN".equals(rawRole)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMINISTRATOR"));
        } else if ("ADMINISTRATOR".equals(rawRole)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }
}