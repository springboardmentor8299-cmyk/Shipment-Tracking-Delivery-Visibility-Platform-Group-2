package com.shiptrack.notification.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import jakarta.annotation.PostConstruct;

// (vi) SMS notifications, backed by Twilio.
//
// Credentials are read from application.properties (twilio.account-sid /
// twilio.auth-token / twilio.from-number) — see application.properties.
// If they're not configured, Twilio.init is simply never called and
// sendSms() logs and no-ops instead of throwing, so the rest of the app
// (and the other two channels) keep working with no SMS provider set up.
@Service
public class SmsService {

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.from-number:}")
    private String fromNumber;

    private boolean configured;

    @PostConstruct
    public void init() {
        configured = accountSid != null && !accountSid.isBlank()
                && authToken != null && !authToken.isBlank()
                && fromNumber != null && !fromNumber.isBlank();

        if (configured) {
            Twilio.init(accountSid, authToken);
        } else {
            System.out.println(
                    "SmsService: twilio.account-sid / twilio.auth-token / twilio.from-number "
                            + "not set — SMS notifications are disabled (in-app + email still work).");
        }
    }

    public void sendSms(String toPhoneNumber, String body) {

        if (!configured) {
            return;
        }

        if (toPhoneNumber == null || toPhoneNumber.isBlank()) {
            return;
        }

        Message.creator(
                new PhoneNumber(toPhoneNumber),
                new PhoneNumber(fromNumber),
                body)
                .create();
    }
}
