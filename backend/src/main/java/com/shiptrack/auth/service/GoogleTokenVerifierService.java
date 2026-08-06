package com.shiptrack.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import com.shiptrack.auth.dto.GoogleTokenInfoResponse;

@Service
public class GoogleTokenVerifierService {

    @Value("${google.client.id:}")
    private String googleClientId;

    private final RestTemplate restTemplate = new RestTemplate();

    public GoogleTokenInfoResponse verify(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            return null;
        }

        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;

        try {
            GoogleTokenInfoResponse response = restTemplate.getForObject(url, GoogleTokenInfoResponse.class);

            if (response == null || response.getSub() == null || response.getEmail() == null) {
                System.err.println("Google token verification: incomplete response from tokeninfo endpoint");
                return null;
            }

            if (!"true".equalsIgnoreCase(response.getEmail_verified())) {
                System.err.println("Google token verification: email not verified for " + response.getEmail());
                return null;
            }

            if (googleClientId == null || googleClientId.isBlank()) {
                System.err.println("Google token verification: google.client.id is not configured on the backend — "
                        + "set it in application.properties, otherwise ANY Google account (from any app) could "
                        + "sign in here. Rejecting until it's configured.");
                return null;
            }

            if (!googleClientId.equals(response.getAud())) {
                System.err.println("Google token verification: aud mismatch (token was issued for a different "
                        + "client ID) — rejecting.");
                return null;
            }

            return response;
        } catch (HttpStatusCodeException e) {
            // Google returns 400 for expired/malformed/invalid tokens
            System.err.println("Google token verification failed: HTTP " + e.getStatusCode()
                    + " — " + e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            System.err.println("Google token verification error: " + e.getClass().getSimpleName()
                    + " — " + e.getMessage());
            return null;
        }
    }

}