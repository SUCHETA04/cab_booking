package com.app.cabbooking;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.app.cabbooking.models.ERole;
import com.app.cabbooking.models.Role;
import com.app.cabbooking.repository.RoleRepository;

@SpringBootApplication
public class CabBookingApplication {

	public static void main(String[] args) {
		SpringApplication.run(CabBookingApplication.class, args);
	}

    @Bean
    CommandLineRunner initDatabase(RoleRepository roleRepository) {
        return args -> {
            if (roleRepository.findByName(ERole.ROLE_RIDER).isEmpty()) {
                roleRepository.save(new Role(ERole.ROLE_RIDER));
            }
            if (roleRepository.findByName(ERole.ROLE_DRIVER).isEmpty()) {
                roleRepository.save(new Role(ERole.ROLE_DRIVER));
            }
            if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()) {
                roleRepository.save(new Role(ERole.ROLE_ADMIN));
            }
        };
    }
}
