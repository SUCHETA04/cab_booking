package com.app.cabbooking.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Value("${SPRING_DATASOURCE_URL:}")
    private String dbUrl;

    @Value("${SPRING_DATASOURCE_USERNAME:}")
    private String username;

    @Value("${SPRING_DATASOURCE_PASSWORD:}")
    private String password;

    @Bean
    public DataSource dataSource() {
        if (dbUrl == null || dbUrl.isEmpty()) {
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl("jdbc:postgresql://localhost:5432/cab_booking");
            config.setUsername("postgres");
            config.setPassword("postgres");
            config.setDriverClassName("org.postgresql.Driver");
            return new HikariDataSource(config);
        }

        HikariConfig config = new HikariConfig();
        
        // If the URL comes from Render as postgres:// or postgresql://, convert it
        if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
            String cleanUrl = dbUrl.replace("postgres://", "").replace("postgresql://", "");
            
            // Render URLs usually have credentials embedded in them: user:pass@host:port/db
            if (cleanUrl.contains("@")) {
                String[] parts = cleanUrl.split("@");
                String[] credentials = parts[0].split(":");
                config.setUsername(credentials[0]);
                if (credentials.length > 1) {
                    config.setPassword(credentials[1]);
                }
                config.setJdbcUrl("jdbc:postgresql://" + parts[1]);
            } else {
                config.setJdbcUrl("jdbc:postgresql://" + cleanUrl);
                config.setUsername(username);
                config.setPassword(password);
            }
        } else {
            // Already jdbc format
            config.setJdbcUrl(dbUrl);
            config.setUsername(username);
            config.setPassword(password);
        }

        config.setDriverClassName("org.postgresql.Driver");
        return new HikariDataSource(config);
    }
}
