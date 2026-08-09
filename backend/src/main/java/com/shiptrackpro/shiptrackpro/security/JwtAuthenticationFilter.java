package com.shiptrackpro.shiptrackpro.security;


import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;



@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {



    @Autowired
    private JwtService jwtService;





    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)

            throws ServletException, IOException {



        String authHeader = request.getHeader("Authorization");



        if(authHeader != null && authHeader.startsWith("Bearer ")) {



            try {



                String token = authHeader.substring(7);



                String email =
                        jwtService.extractEmail(token);



                String role =
                        jwtService.extractRole(token);





                UsernamePasswordAuthenticationToken authentication =

                        new UsernamePasswordAuthenticationToken(

                                email,

                                null,


                                List.of(
                                    new SimpleGrantedAuthority(
                                            "ROLE_" + role
                                    )
                                )

                        );







                authentication.setDetails(

                        new WebAuthenticationDetailsSource()

                                .buildDetails(request)

                );







                SecurityContextHolder

                        .getContext()

                        .setAuthentication(authentication);





            }

            catch(Exception e) {



                response.setStatus(
                        HttpServletResponse.SC_UNAUTHORIZED
                );


                response.getWriter()
                        .write("Invalid JWT Token");


                return;


            }


        }





        filterChain.doFilter(request, response);



    }



}