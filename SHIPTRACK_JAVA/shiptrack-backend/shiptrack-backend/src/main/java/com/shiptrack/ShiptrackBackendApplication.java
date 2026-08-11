package com.shiptrack;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableMethodSecurity
public class ShiptrackBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ShiptrackBackendApplication.class, args);
	}

}
