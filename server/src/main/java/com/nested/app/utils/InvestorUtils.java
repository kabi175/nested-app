package com.nested.app.utils;

import com.nested.app.client.bulkpe.dto.PrefillResponse;
import com.nested.app.entity.Address;
import com.nested.app.entity.Investor;

import java.sql.Date;

public class InvestorUtils {

    public static Investor toInvestor(PrefillResponse.DataBlock data) {
        Investor investor = new Investor();

        // Split name into first and last name safely
        String[] names = data.getName().split(" ", 2);
        investor.setFirstName(names[0]);
        if (names.length > 1) investor.setLastName(names[1]);

        investor.setClientCode(data.getReference());
        investor.setEmail(data.getEmailInfo() != null && !data.getEmailInfo().isEmpty()
                ? data.getEmailInfo().getFirst().getEmailAddress()
                : null);

        // Gender
        if ("M".equalsIgnoreCase(data.getPersonalInfo().getGender())) {
            investor.setGender(Investor.Gender.MALE);
        } else if ("F".equalsIgnoreCase(data.getPersonalInfo().getGender())) {
            investor.setGender(Investor.Gender.FEMALE);
        }

        // DOB
        if (data.getPersonalInfo().getDob() != null) {
            investor.setDateOfBirth(Date.valueOf(data.getPersonalInfo().getDob()));
        }

        // PAN Number
        if (data.getIdentityInfo() != null &&
                data.getIdentityInfo().getPanNumber() != null &&
                !data.getIdentityInfo().getPanNumber().isEmpty()) {
            investor.setPanNumber(data.getIdentityInfo().getPanNumber().getFirst().getIdNumber());
        }

        // Address (taking first for now, could loop)
        if (data.getAddressInfo() != null && !data.getAddressInfo().isEmpty()) {
            Address address = new Address();
            PrefillResponse.AddressInfo addr = data.getAddressInfo().getFirst();
            address.setAddressLine(addr.getAddress());
            address.setPinCode(addr.getPostal());
            address.setState(addr.getState());
            investor.setAddress(address);
        }

        return investor;
    }
}
