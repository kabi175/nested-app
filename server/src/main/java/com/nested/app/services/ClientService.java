package com.nested.app.services;

import com.nested.app.entity.BankDetail;
import com.nested.app.entity.Client;

import java.net.URL;
import java.util.Optional;

/**
 * Service interface for managing clients and related data.
 *
 * flow:
 * 1. Iniate KYC.
 * 2. If KYC is pending, provide a URL to redirect the client for KYC completion.
 * 3. If KYC is completed, return the status.
 * 4. If KYC failed, retry iniateKYC.
 * 5. Register new clients.
 */
public interface ClientService {

    /**
     * Initiate KYC process for the given client.
     * @param client - Client for whom KYC needs to be initiated.
     * @return URL to redirect the client for KYC completion in case of fresh KYC registration, null if KYC is already completed.
     */
    Optional<URL> iniateKYC(Client client);

    /**
     * Check the KYC status of the given client.
     * @param client
     * @return - enum KYCStatus indicating the current status of KYC.
     */
    KYCStatus kyc(Client client);


    /**
     * Register a new client in the system.
     * @param client
     * @return
     */
    Client registerClient(Client client);

    /**
     * Add a bank detail to the given client in the system. Also adds the entry in DB.
     * @param client
     * @param bankDetail
     */
    void addBankDetail(Client client, BankDetail bankDetail);

    /**
     * Delete a bank detail from the given client in the system. Also removes the entry from DB.
     * @param client
     * @param bankDetail
     */
    void deleteBankDetail(Client client, BankDetail bankDetail);


    public static enum KYCStatus {
        PENDING, COMPLETED, FAILED
    }
}
