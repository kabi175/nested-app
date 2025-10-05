package com.nested.app.client.tarrakki.dto;

public record KycInitiateRequest(String name, String pan, String email, String mobile, String callbackUrl) {}
