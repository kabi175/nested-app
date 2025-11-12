package com.nested.app.client.finprimitives;

import com.nested.app.client.mf.dto.AddAddressRequest;
import com.nested.app.client.mf.dto.BankAccountRequest;
import com.nested.app.client.mf.dto.BankResponse;
import com.nested.app.client.mf.dto.CreateInvestorRequest;
import com.nested.app.client.mf.dto.CreateInvestorResponse;
import com.nested.app.client.mf.dto.EntityResponse;
import com.nested.app.client.mf.dto.FATCAUploadRequest;
import com.nested.app.client.mf.dto.FileDto;
import com.nested.app.client.mf.dto.NomineeRequest;
import com.nested.app.client.mf.dto.NomineeResponse;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

@Service
@Primary
@RequiredArgsConstructor
public class InvestorAPIClient implements com.nested.app.client.mf.InvestorAPIClient {
  private static final String INVESTOR_API_URL = "/v2/investor_profiles";
  private static final String BANK_API_URL = "/v2/bank_accounts";
  private static final String ADDRESS_API_URL = "/v2/addresses";
  private static final String EMAIL_API_URL = "/v2/email_addresses";
  private static final String MOBILE_API_URL = "/v2/phone_numbers";

  private final FinPrimitivesAPI api;

  @Override
  public Mono<CreateInvestorResponse> createInvestor(CreateInvestorRequest request) {
    return api.withAuth()
        .post()
        .uri(INVESTOR_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(CreateInvestorResponse.class)
        .map(
            r -> {
              Mono.zip(
                      addEmail(r.getId(), request.getEmail()),
                      addMobileNumber(r.getId(), request.getMobileNumber()))
                  .block();
              return r;
            });
  }

  @Override
  public Mono<Void> updateFATCA(FATCAUploadRequest request) {
    return api.withAuth()
        .post()
        .uri(INVESTOR_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(Void.class);
  }

  @Override
  public Mono<BankResponse> addBankAccount(BankAccountRequest request) {
    return api.withAuth()
        .post()
        .uri(BANK_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(BankResponse.class);
  }

  @Override
  public Mono<EntityResponse> addAddress(AddAddressRequest request) {
    return api.withAuth()
        .post()
        .uri(ADDRESS_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(EntityResponse.class);
  }

  @Override
  public Mono<EntityResponse> addMobileNumber(String investorRef, String mobileNumber) {
    var isd = "91";
    if (mobileNumber.startsWith("+")) {
      mobileNumber = mobileNumber.substring(1);
    }

    if (mobileNumber.length() > 10) {
      isd = mobileNumber.substring(0, mobileNumber.length() - 10);
      mobileNumber = mobileNumber.substring(mobileNumber.length() - 10);
    }

    var request = Map.of("profile", investorRef, "isd", isd, "number", mobileNumber);
    return api.withAuth()
        .post()
        .uri(MOBILE_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(EntityResponse.class);
  }

  @Override
  public Mono<EntityResponse> addEmail(String investorRef, String email) {
    var request = Map.of("profile", investorRef, "email", email);
    return api.withAuth()
        .post()
        .uri(EMAIL_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(EntityResponse.class);
  }

  @Override
  public Mono<Void> uploadSignature(String investorRef, MultipartFile file) {
    var entity = uploadDocument("signature", file).block();

    if (entity == null) {
      return Mono.error(new RuntimeException("Failed to upload signature document"));
    }

    var request = Map.of("id", investorRef, "signature", entity.getId());

    return api.withAuth()
        .patch()
        .uri(INVESTOR_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(Void.class);
  }

  @Override
  public Mono<EntityResponse> uploadDocument(String documentType, MultipartFile file) {

    if (file.getContentType() == null) {
      return Mono.error(new IllegalArgumentException("File content type cannot be null"));
    }

    var builder = new MultipartBodyBuilder();
    builder.part("purpose", documentType);
    builder
        .part("file", file.getResource())
        .filename(file.getName())
        .contentType(MediaType.parseMediaType(file.getContentType()));
    return api.withAuth()
        .post()
        .uri("/files")
        .bodyValue(builder.build())
        .retrieve()
        .bodyToMono(EntityResponse.class);
  }

  @Override
  public Mono<FileDto> fetchDocument(String fileId) {
    return api.withAuth().get().uri("/files/" + fileId).retrieve().bodyToMono(FileDto.class);
  }

  @Override
  public Mono<NomineeResponse> addNominees(String investorRef, NomineeRequest request) {
    return null;
  }
}
