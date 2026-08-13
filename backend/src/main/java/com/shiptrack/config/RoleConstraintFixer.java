package com.shiptrack.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class RoleConstraintFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public RoleConstraintFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        String roles = String.join(",",
                java.util.Arrays.stream(com.shiptrack.auth.entity.Role.values())
                        .map(r -> "'" + r.name() + "'")
                        .toList());

        jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
        jdbcTemplate.execute(
                "ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (" + roles + "))");
    }
}
