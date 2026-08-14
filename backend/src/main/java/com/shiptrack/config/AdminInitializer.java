package com.shiptrack.config;

import com.shiptrack.entity.User;
import com.shiptrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        String adminEmail = "raju@gmail.com";

        if (!userRepository.existsByEmail(adminEmail)) {

            User admin = User.builder()
                    .name("Raju")
                    .email(adminEmail)
                    .phone("9999999999")
                    .password(passwordEncoder.encode("admin1234"))
                    .role("ADMIN")
                    .build();

            userRepository.save(admin);

            System.out.println();
            System.out.println("======================================");
            System.out.println(" ShipTrack-Pro Admin Created");
            System.out.println(" Email    : raju@gmail.com");
            System.out.println(" Password : admin1234");
            System.out.println("======================================");
            System.out.println();

        } else {

            System.out.println();
            System.out.println("Admin account already exists.");
            System.out.println();

        }

        String supportEmail = "support@shiptrack.com";

        if (!userRepository.existsByEmail(supportEmail)) {

            User support = User.builder()
                    .name("Support Team")
                    .email(supportEmail)
                    .phone("9876543210")
                    .password(passwordEncoder.encode("support1234"))
                    .role("SUPPORT_ASSISTANT")
                    .build();

            userRepository.save(support);

            System.out.println();
            System.out.println("======================================");
            System.out.println(" ShipTrack-Pro Support Assistant Created");
            System.out.println(" Email    : support@shiptrack.com");
            System.out.println(" Password : support1234");
            System.out.println("======================================");
            System.out.println();

        } else {

            System.out.println();
            System.out.println("Support assistant account already exists.");
            System.out.println();

        }

        String deliveryEmail = "delivery@shiptrack.com";

        if (!userRepository.existsByEmail(deliveryEmail)) {

            User delivery = User.builder()
                    .name("Delivery Team")
                    .email(deliveryEmail)
                    .phone("9123456780")
                    .password(passwordEncoder.encode("delivery1234"))
                    .role("DELIVERY_OPERATOR")
                    .build();

            userRepository.save(delivery);

            System.out.println();
            System.out.println("======================================");
            System.out.println(" ShipTrack-Pro Delivery Operator Created");
            System.out.println(" Email    : delivery@shiptrack.com");
            System.out.println(" Password : delivery1234");
            System.out.println("======================================");
            System.out.println();

        } else {

            System.out.println();
            System.out.println("Delivery operator account already exists.");
            System.out.println();

        }
    }
}