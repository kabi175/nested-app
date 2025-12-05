package com.nested.app.client.mf;

import com.nested.app.client.finprimitives.EntityListResponse;
import com.nested.app.client.mf.dto.SchemeWiseReportResponse;
import reactor.core.publisher.Mono;

public interface ReportApiClient {
  Mono<EntityListResponse<SchemeWiseReportResponse>> fetchSchemeWiseReport(String accountRef);
}
