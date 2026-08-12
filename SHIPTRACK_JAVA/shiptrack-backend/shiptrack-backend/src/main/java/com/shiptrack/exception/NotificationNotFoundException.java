package com.shiptrack.exception;

public class NotificationNotFoundException extends RuntimeException {

    public NotificationNotFoundException(String message) {
        super(message);
    }

}