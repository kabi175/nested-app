package com.nested.app.client.tarrakki;

import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.nested.app.client.tarrakki.dto.BankResponse;
import com.nested.app.client.tarrakki.dto.InvestorResponse;
import com.nested.app.client.tarrakki.dto.NomineeRequest;
import com.nested.app.client.tarrakki.dto.NomineeResponse;
import com.nested.app.client.tarrakki.dto.TarrakkiInvestorRequest;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class InvestorAPIClient {
  private final TarrakkiAPI tarrakkiAPI;

  private static final String INVESTOR_API_URL = "/investors";

  public Mono<InvestorResponse> createInvestor(TarrakkiInvestorRequest request) {
    return tarrakkiAPI
        .withAuth()
        .post()
        .uri(INVESTOR_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(InvestorResponse.class);
  }

  /**
   * Adds a bank account for an investor
   *
   * @param investorRef Tarrakki investor reference ID
   * @param accountType Account type (savings/current)
   * @param accountNumber Bank account number
   * @param ifsc IFSC code
   * @param verificationDocument Document type (cancelled_cheque, bank_statement, etc.)
   * @param file File to upload
   * @return BankResponse with bank_id
   */
  public Mono<BankResponse> addBankForInvestor(
      String investorRef,
      String accountType,
      String accountNumber,
      String ifsc,
      String verificationDocument,
      MultipartFile file) {

    try {
      MultipartBodyBuilder builder = new MultipartBodyBuilder();
      builder.part("account_type", accountType);
      builder.part("account_number", accountNumber);
      builder.part("ifsc", ifsc);
      builder.part("verification_document", verificationDocument);
      builder.part("file", file.getResource());

      return tarrakkiAPI
          .withAuth()
          .post()
          .uri(INVESTOR_API_URL + "/" + investorRef + "/banks")
          .contentType(MediaType.MULTIPART_FORM_DATA)
          .bodyValue(builder.build())
          .retrieve()
          .bodyToMono(BankResponse.class);
    } catch (Exception e) {
      return Mono.error(new RuntimeException("Failed to upload bank document", e));
    }
  }

  /**
   * Uploads a document for an investor
   *
   * @param investorRef Tarrakki investor reference ID
   * @param documentType Document type (signature, photo, etc.)
   * @param file File to upload
   * @return Empty Mono on success
   */
  public Mono<Void> uploadDocumentForInvestor(
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
          .bodyToMono(Void.class);
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
  public Mono<NomineeResponse> addNomineesForInvestor(String investorRef, NomineeRequest request) {
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
