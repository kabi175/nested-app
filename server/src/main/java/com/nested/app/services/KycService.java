package com.nested.app.services;

import com.nested.app.client.tarrakki.KycClient;
import com.nested.app.contect.UserContext;
import com.nested.app.dto.ChildDTO;
import com.nested.app.entity.Child;
import com.nested.app.entity.User;
import com.nested.app.repository.InvestorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KycService {

    private final KycClient kycClient;
    private final UserContext userContext;
    private final InvestorRepository investorRepository;

    public String getKycStatus(){

        log.info("Getting kyc status of the investor");
        return "";
    }

    private User getCurrentUser() {
        User currentUser = userContext.getUser();
        if (currentUser == null) {
            throw new IllegalArgumentException("User not found in context");
        }
        return currentUser;
    }
}
