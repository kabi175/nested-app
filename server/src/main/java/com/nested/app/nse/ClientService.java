package com.nested.app.nse;

import com.nested.app.contect.ClientContext;
import com.nested.app.entity.BankDetail;
import com.nested.app.entity.Investor;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.util.Optional;

/**
 * Service interface for managing clients and related data.
 * flow:
 * 1. Iniate KYC.
 * 2. If KYC is pending, provide a URL to redirect the client for KYC completion.
 * 3. If KYC is completed, return the status.
 * 4. If KYC failed, retry iniateKYC.
 * 5. Register new clients.
 */
@Service
public abstract class ClientService {
    protected final ClientContext context;

    protected ClientService(ClientContext context) {
        this.context = context;
    }

    /**
     * Initiate KYC process for the given client.
     *
     * @return URL to redirect the client for KYC completion in case of fresh KYC registration, null if KYC is already completed.
     */
    abstract Optional<URL> iniateKYC();

    /**
     * Check the KYC status of the given client.
     *
     * @return - enum KYCStatus indicating the current status of KYC.
     */
    abstract Investor.KYCStatus kycStatus();


    /**
     * Register a new client in the system.
     *
     * @return - the registered Client object.
     */
    abstract Investor registerClient();

    /**
     * Add a bank detail to the given client in the system. Also adds the entry in DB.
     *
     * @param bankDetail - bank detail to be added.
     */
    abstract void addBankDetail(BankDetail bankDetail);

    /**
     * Delete a bank detail from the given client in the system. Also removes the entry from DB.
     *
     * @param bankDetail - bank detail to be removed.
     */
    abstract void deleteBankDetail(BankDetail bankDetail);


}
