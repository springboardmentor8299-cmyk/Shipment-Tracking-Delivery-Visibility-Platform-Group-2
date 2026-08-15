package com.shiptrack.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * The "users_role_check" DB constraint was created (by hand, outside of
 * Hibernate) before {@link com.shiptrack.auth.entity.Role} grew the DRIVER
 * value. Hibernate's ddl-auto=update never edits existing CHECK constraints,
 * so without this the DB and the Role enum can silently drift apart again
 * any time a new role is added -- inserts fail with a raw Postgres
 * constraint-violation error instead of a normal validation message.
 *
 * This keeps the constraint in sync with Role.java on every startup, on
 * any environment/DB, without needing a migration tool.
 */
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
