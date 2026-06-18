package com.thitiphatx.secondhand.model;

public class UnautorizedException extends RuntimeException {
    public UnautorizedException(String message) {
        super(message);
    }
}
