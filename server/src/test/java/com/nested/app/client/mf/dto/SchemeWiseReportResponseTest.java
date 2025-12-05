package com.nested.app.client.mf.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class SchemeWiseReportResponseTest {

  @Test
  void testDeserializeSchemeWiseReportResponse() throws Exception {
    String json =
        """
                {
                    "rows": [
                        [
                            "INF109KC1TY0",
                            "ICICI Prudential Retirement Fund Hybrid Conservative Plan Growth",
                            "REGULAR",
                            "GROWTH",
                            "2025-12-06",
                            17.8394,
                            50000.00,
                            50113.95,
                            113.95,
                            0.23,
                            17.7988,
                            2809.1724,
                            5.85
                        ]
                    ],
                    "columns": [
                        "isin",
                        "scheme_name",
                        "plan_type",
                        "investment_option",
                        "as_on",
                        "nav",
                        "invested_amount",
                        "current_value",
                        "unrealized_gain",
                        "absolute_return",
                        "average_buying_value",
                        "units",
                        "xirr"
                    ]
                }
                """;

    ObjectMapper objectMapper = new ObjectMapper();
    SchemeWiseReportResponse response =
        objectMapper.readValue(json, SchemeWiseReportResponse.class);

    assertNotNull(response);
    assertNotNull(response.getRows());
    assertEquals(1, response.getRows().size());
    assertEquals(13, response.getColumns().size());

    SchemeWiseReportResponse.SchemeWiseReport report = response.getRows().get(0);
    assertEquals("INF109KC1TY0", report.getIsin());
    assertEquals(
        "ICICI Prudential Retirement Fund Hybrid Conservative Plan Growth", report.getSchemeName());
    assertEquals("REGULAR", report.getPlanType());
    assertEquals("GROWTH", report.getInvestmentOption());
    assertEquals("2025-12-06", report.getAsOn());
    assertEquals(new BigDecimal("17.8394"), report.getNav());
    assertEquals(new BigDecimal("50000.00"), report.getInvestedAmount());
    assertEquals(new BigDecimal("50113.95"), report.getCurrentValue());
    assertEquals(new BigDecimal("113.95"), report.getUnrealizedGain());
    assertEquals(new BigDecimal("0.23"), report.getAbsoluteReturn());
    assertEquals(new BigDecimal("17.7988"), report.getAverageBuyingValue());
    assertEquals(new BigDecimal("2809.1724"), report.getUnits());
    assertEquals(new BigDecimal("5.85"), report.getXirr());
  }
}
