package com.nested.app.client.tarrakki;

import com.nested.app.client.mf.dto.AddAddressRequest;
import com.nested.app.client.mf.dto.BankAccountRequest;
import com.nested.app.client.mf.dto.BankResponse;
import com.nested.app.client.mf.dto.CreateInvestorRequest;
import com.nested.app.client.mf.dto.CreateInvestorResponse;
import com.nested.app.client.mf.dto.EntityResponse;
import com.nested.app.client.mf.dto.FATCAUploadRequest;
import com.nested.app.client.mf.dto.NomineeRequest;
import com.nested.app.client.mf.dto.NomineeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class InvestorAPIClient implements com.nested.app.client.mf.InvestorAPIClient {
  private static final String INVESTOR_API_URL = "/investors";
  private final TarrakkiAPI tarrakkiAPI;

  @Override
  public Mono<CreateInvestorResponse> createInvestor(CreateInvestorRequest request) {
    return tarrakkiAPI
        .withAuth()
        .post()
        .uri(INVESTOR_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(CreateInvestorResponse.class);
  }

  @Override
  public Mono<Void> updateFATCA(FATCAUploadRequest dto) {
    return null;
  }

  /**
   * Adds a bank account for an investor
   *
   * @param investorRef Tarrakki investor reference ID
   * @param accountType Account type (savings/current)
   * @param accountNumber Bank account number
   * @param ifsc IFSC code // * @param verificationDocument Document type (cancelled_cheque,
   *     bank_statement, etc.) // * @param file File to upload
   * @return BankResponse with bank_id
   */
  @Override
  public Mono<BankResponse> addBankAccount(BankAccountRequest request) {

    try {
      return tarrakkiAPI
          .withAuth()
          .post()
          .uri(INVESTOR_API_URL + "/" + request.getInvestorID() + "/banks")
          .contentType(MediaType.MULTIPART_FORM_DATA)
          .bodyValue(request)
          .retrieve()
          .bodyToMono(BankResponse.class);
    } catch (Exception e) {
      return Mono.error(new RuntimeException("Failed to upload bank document", e));
    }
  }

  @Override
  public Mono<EntityResponse> addAddress(AddAddressRequest request) {
    return null;
  }

  @Override
  public Mono<EntityResponse> addMobileNumber(String investorRef, String mobileNumber) {
    return null;
  }

  @Override
  public Mono<EntityResponse> addEmail(String investorRef, String email) {
    return null;
  }

  @Override
  public Mono<Void> uploadSignature(String investorRef, MultipartFile file) {
    return null;
  }

  /**
   * Uploads a document for an investor
   *
   * @param investorRef Tarrakki investor reference ID
   * @param documentType Document type (signature, photo, etc.)
   * @param file File to upload
   * @return Empty Mono on success
   */
  @Override
  public Mono<EntityResponse> uploadDocumentForInvestor(
      String investorRef, String documentType, MultipartFile file) {

    try {
      MultipartBodyBuilder builder = new MultipartBodyBuilder();
      builder.part("document_type", documentType);
      builder.part("file", file.getResource());

      return tarrakkiAPI
          .withAuth()
          .post()
          .uri(INVESTOR_API_URL + "/" + investorRef + "/documents")
          .contentType(MediaType.MULTIPART_FORM_DATA)
          .bodyValue(builder.build())
          .retrieve()
          .bodyToMono(EntityResponse.class);
    } catch (Exception e) {
      return Mono.error(new RuntimeException("Failed to upload document", e));
    }
  }

  /**
   * Adds nominees for an investor
   *
   * @param investorRef Tarrakki investor reference ID
   * @param request Nominee request with nominees list and auth_ref (OTP ID)
   * @return NomineeResponse with nominee_id
   */
  @Override
  public Mono<NomineeResponse> addNominees(String investorRef, NomineeRequest request) {
    return tarrakkiAPI
        .withAuth()
        .post()
        .uri(INVESTOR_API_URL + "/" + investorRef + "/nominees")
        .contentType(MediaType.APPLICATION_JSON)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(NomineeResponse.class);
  }
}
