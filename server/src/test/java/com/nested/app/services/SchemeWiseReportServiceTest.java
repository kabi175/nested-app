package com.nested.app.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nested.app.client.finprimitives.EntityResponse;
import com.nested.app.client.mf.ReportApiClient;
import com.nested.app.client.mf.dto.SchemeWiseReportResponse;
import com.nested.app.entity.Investor;
import com.nested.app.repository.InvestorRepository;
import com.nested.app.services.SchemeWiseReportService.ReportFetchSummary;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
class SchemeWiseReportServiceTest {

  @Mock private ReportApiClient reportApiClient;

  @Mock private InvestorRepository investorRepository;

  @InjectMocks private SchemeWiseReportService schemeWiseReportService;

  private Investor investorWithAccountRef;
  private Investor investorWithoutAccountRef;

  @BeforeEach
  void setUp() {
    investorWithAccountRef = Investor.builder().id(1L).accountRef("ACC-001").ref("INV-001").build();

    investorWithoutAccountRef = Investor.builder().id(2L).accountRef(null).ref("INV-002").build();
  }

  @Test
  void shouldFetchReportsForAllEligibleInvestors() {
    // Given
    List<Investor> investors =
        List.of(investorWithAccountRef, createInvestor(3L, "ACC-003"), investorWithoutAccountRef);

    Page<Investor> page = new PageImpl<>(investors);

    EntityResponse<SchemeWiseReportResponse> mockResponse = new EntityResponse<>();

    when(investorRepository.findAll(any(Pageable.class))).thenReturn(page);
    when(reportApiClient.fetchSchemeWiseReport(anyString())).thenReturn(Mono.just(mockResponse));

    // When
    ReportFetchSummary summary = schemeWiseReportService.fetchReportsForAllInvestors();

    // Then
    assertThat(summary.totalProcessed()).isEqualTo(2); // Only 2 have accountRef
    assertThat(summary.successCount()).isEqualTo(2);
    assertThat(summary.failureCount()).isZero();
    assertThat(summary.successRate()).isEqualTo(100.0);

    verify(reportApiClient, times(2)).fetchSchemeWiseReport(anyString());
    verify(reportApiClient).fetchSchemeWiseReport("ACC-001");
    verify(reportApiClient).fetchSchemeWiseReport("ACC-003");
  }

  @Test
  void shouldHandleEmptyInvestorList() {
    // Given
    Page<Investor> emptyPage = new PageImpl<>(Collections.emptyList());
    when(investorRepository.findAll(any(Pageable.class))).thenReturn(emptyPage);

    // When
    ReportFetchSummary summary = schemeWiseReportService.fetchReportsForAllInvestors();

    // Then
    assertThat(summary.totalProcessed()).isZero();
    assertThat(summary.successCount()).isZero();
    assertThat(summary.failureCount()).isZero();

    verify(reportApiClient, never()).fetchSchemeWiseReport(anyString());
  }

  @Test
  void shouldSkipInvestorsWithoutAccountRef() {
    // Given
    List<Investor> investors =
        List.of(investorWithoutAccountRef, createInvestor(4L, ""), createInvestor(5L, "  "));

    Page<Investor> page = new PageImpl<>(investors);
    when(investorRepository.findAll(any(Pageable.class))).thenReturn(page);

    // When
    ReportFetchSummary summary = schemeWiseReportService.fetchReportsForAllInvestors();

    // Then
    assertThat(summary.totalProcessed()).isZero();
    verify(reportApiClient, never()).fetchSchemeWiseReport(anyString());
  }

  @Test
  void shouldContinueProcessingOnIndividualFailures() {
    // Given
    List<Investor> investors =
        List.of(
            investorWithAccountRef, createInvestor(3L, "ACC-003"), createInvestor(4L, "ACC-004"));

    EntityResponse<SchemeWiseReportResponse> mockResponse = new EntityResponse<>();

    Page<Investor> page = new PageImpl<>(investors);
    when(investorRepository.findAll(any(Pageable.class))).thenReturn(page);
    when(reportApiClient.fetchSchemeWiseReport("ACC-001")).thenReturn(Mono.just(mockResponse));
    when(reportApiClient.fetchSchemeWiseReport("ACC-003"))
        .thenReturn(Mono.error(new RuntimeException("API Error")));
    when(reportApiClient.fetchSchemeWiseReport("ACC-004")).thenReturn(Mono.just(mockResponse));

    // When
    ReportFetchSummary summary = schemeWiseReportService.fetchReportsForAllInvestors();

    // Then
    assertThat(summary.totalProcessed()).isEqualTo(3);
    assertThat(summary.successCount()).isEqualTo(2);
    assertThat(summary.failureCount()).isEqualTo(1);
    assertThat(summary.hasFailures()).isTrue();
    assertThat(summary.successRate()).isCloseTo(66.67, within(0.1));

    verify(reportApiClient, times(3)).fetchSchemeWiseReport(anyString());
  }

  @Test
  void shouldCalculateSuccessRateCorrectly() {
    // Given
    ReportFetchSummary summary = new ReportFetchSummary(100, 95, 5);

    // Then
    assertThat(summary.successRate()).isEqualTo(95.0);
    assertThat(summary.hasFailures()).isTrue();
  }

  @Test
  void shouldHandleZeroTotalForSuccessRate() {
    // Given
    ReportFetchSummary summary = new ReportFetchSummary(0, 0, 0);

    // Then
    assertThat(summary.successRate()).isEqualTo(0.0);
    assertThat(summary.hasFailures()).isFalse();
  }

  private Investor createInvestor(Long id, String accountRef) {
    return Investor.builder().id(id).accountRef(accountRef).ref("INV-" + id).build();
  }
}
