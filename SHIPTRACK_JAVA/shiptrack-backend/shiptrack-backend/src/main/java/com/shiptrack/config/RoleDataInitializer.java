package com.shiptrack.config;

import com.shiptrack.entity.Role;
import com.shiptrack.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class RoleDataInitializer {

    private static final List<String> DEFAULT_ROLES = Arrays.asList(
            "ROLE_ADMIN",
            "ROLE_SUPPORT",
            "ROLE_CUSTOMER",
            "ROLE_DRIVER"
    );

    @Bean
    public CommandLineRunner seedRoles(RoleRepository roleRepository) {
        return args -> {
            for (String roleName : DEFAULT_ROLES) {
                if (roleRepository.findByName(roleName).isEmpty()) {
                    roleRepository.save(new Role(roleName));
                }
            }
        };
    }
}
