package com.nested.app.client.mf;

import com.nested.app.client.mf.dto.AddAddressRequest;
import com.nested.app.client.mf.dto.BankAccountRequest;
import com.nested.app.client.mf.dto.BankResponse;
import com.nested.app.client.mf.dto.CreateAccountRequest;
import com.nested.app.client.mf.dto.CreateInvestorRequest;
import com.nested.app.client.mf.dto.CreateInvestorResponse;
import com.nested.app.client.mf.dto.EntityResponse;
import com.nested.app.client.mf.dto.FileDto;
import com.nested.app.client.mf.dto.Nominee;
import jakarta.validation.constraints.Email;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

public interface InvestorAPIClient {
  Mono<CreateInvestorResponse> createInvestor(CreateInvestorRequest request);

  Mono<EntityResponse> createInvestmentAccount(CreateAccountRequest createAccountRequest);

  Mono<BankResponse> addBankAccount(BankAccountRequest request);

  Mono<Void> addPrimaryBankAccount(String accountID, String bankAccountID);

  Mono<EntityResponse> addAddress(AddAddressRequest request);

  Mono<EntityResponse> addMobileNumber(String investorRef, String mobileNumber);

  Mono<EntityResponse> addEmail(String investorRef, @Email String email);

  Mono<Void> uploadSignature(String investorRef, MultipartFile file);

  Mono<EntityResponse> uploadDocument(String documentType, MultipartFile file);

  Mono<FileDto> fetchDocument(String fileId);

  Mono<EntityResponse> addNominees(String investorRef, Nominee request);

  Mono<EntityResponse> updateNominees(String investorRef, Nominee request);

  Mono<List<EntityResponse>> fetchAllNominees(String investorRef);
}
