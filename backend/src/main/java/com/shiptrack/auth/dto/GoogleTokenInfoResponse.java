package com.shiptrack.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleTokenInfoResponse {

    private String sub;

    private String email;

    private String email_verified;

    private String name;

    private String aud;

}