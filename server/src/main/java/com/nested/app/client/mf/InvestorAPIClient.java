package com.nested.app.client.mf;

import com.nested.app.client.mf.dto.AddAddressRequest;
import com.nested.app.client.mf.dto.BankAccountRequest;
import com.nested.app.client.mf.dto.BankResponse;
import com.nested.app.client.mf.dto.CreateInvestorRequest;
import com.nested.app.client.mf.dto.CreateInvestorResponse;
import com.nested.app.client.mf.dto.EntityResponse;
import com.nested.app.client.mf.dto.FATCAUploadRequest;
import com.nested.app.client.mf.dto.NomineeRequest;
import com.nested.app.client.mf.dto.NomineeResponse;
import jakarta.validation.constraints.Email;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

public interface InvestorAPIClient {
  Mono<CreateInvestorResponse> createInvestor(CreateInvestorRequest request);

  Mono<Void> updateFATCA(FATCAUploadRequest dto);

  Mono<BankResponse> addBankAccount(BankAccountRequest request);

  Mono<EntityResponse> addAddress(AddAddressRequest request);

  Mono<EntityResponse> addMobileNumber(String investorRef, String mobileNumber);

  Mono<EntityResponse> addEmail(String investorRef, @Email String email);

  Mono<Void> uploadSignature(String investorRef, MultipartFile file);

  Mono<EntityResponse> uploadDocumentForInvestor(
      String investorRef, String documentType, MultipartFile file);

  Mono<NomineeResponse> addNominees(String investorRef, NomineeRequest request);
}
