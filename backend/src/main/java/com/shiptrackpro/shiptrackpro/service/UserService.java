package com.shiptrackpro.shiptrackpro.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shiptrackpro.shiptrackpro.dto.LoginRequest;
import com.shiptrackpro.shiptrackpro.dto.LoginResponse;
import com.shiptrackpro.shiptrackpro.entity.Role;
import com.shiptrackpro.shiptrackpro.entity.User;
import com.shiptrackpro.shiptrackpro.repository.UserRepository;
import com.shiptrackpro.shiptrackpro.security.JwtService;


@Service
public class UserService {


    @Autowired
    private UserRepository userRepository;


    @Autowired
    private JwtService jwtService;





    // Register User
    public User registerUser(User user) {


        if (userRepository.existsByEmail(user.getEmail())) {

            throw new RuntimeException(
                    "Email already exists!"
            );

        }


        // Default role for new users
        user.setRole(Role.CUSTOMER);


        return userRepository.save(user);

    }







    // Login User
    public LoginResponse loginUser(
            LoginRequest loginRequest
    ) {


        Optional<User> optionalUser =
                userRepository.findByEmail(
                        loginRequest.getEmail()
                );



        if (optionalUser.isEmpty()) {

            throw new RuntimeException(
                    "User not found!"
            );

        }



        User user = optionalUser.get();




        if (!user.getPassword()
                .equals(loginRequest.getPassword())) {


            throw new RuntimeException(
                    "Invalid password!"
            );

        }






        // Generate JWT Token with Email + Role
        String token =
                jwtService.generateToken(user);







        // Return Login Response
        return new LoginResponse(

                token,

                user.getEmail(),

                user.getFullName(),

                user.getRole().name()

        );

    }








    // Get User by Email
    public User getUserByEmail(
            String email
    ) {


        return userRepository.findByEmail(email)

                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );

    }



}