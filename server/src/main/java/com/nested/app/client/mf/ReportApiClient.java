package com.nested.app.client.mf;

import com.nested.app.client.finprimitives.EntityResponse;
import com.nested.app.client.mf.dto.SchemeWiseReportResponse;
import reactor.core.publisher.Mono;

public interface ReportApiClient {
  Mono<EntityResponse<SchemeWiseReportResponse>> fetchSchemeWiseReport(String accountRef);
}
