package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.nested.app.client.mf.dto.SchemeWiseReportResponse.SchemeWiseReport;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class SchemeWiseReportDeserializer extends JsonDeserializer<SchemeWiseReportResponse> {

  @Override
  public SchemeWiseReportResponse deserialize(JsonParser jp, DeserializationContext ctxt)
      throws IOException {
    JsonNode node = jp.getCodec().readTree(jp);

    JsonNode rowsNode = node.get("rows");
    JsonNode columnsNode = node.get("columns");

    List<String> columns = new ArrayList<>();
    if (columnsNode != null && columnsNode.isArray()) {
      for (JsonNode column : columnsNode) {
        columns.add(column.asText());
      }
    }

    List<SchemeWiseReport> reports = new ArrayList<>();
    if (rowsNode != null && rowsNode.isArray()) {
      for (JsonNode row : rowsNode) {
        if (row.isArray()) {
          SchemeWiseReport report = new SchemeWiseReport();

          // Map array values to SchemeWiseReport fields based on column order
          for (int i = 0; i < row.size() && i < columns.size(); i++) {
            JsonNode value = row.get(i);
            String columnName = columns.get(i);

            switch (columnName) {
              case "isin":
                report.setIsin(value.isNull() ? null : value.asText());
                break;
              case "scheme_name":
                report.setSchemeName(value.isNull() ? null : value.asText());
                break;
              case "plan_type":
                report.setPlanType(value.isNull() ? null : value.asText());
                break;
              case "investment_option":
                report.setInvestmentOption(value.isNull() ? null : value.asText());
                break;
              case "as_on":
                report.setAsOn(value.isNull() ? null : value.asText());
                break;
              case "nav":
                report.setNav(value.isNull() ? null : new BigDecimal(value.asText()));
                break;
              case "invested_amount":
                report.setInvestedAmount(value.isNull() ? null : new BigDecimal(value.asText()));
                break;
              case "current_value":
                report.setCurrentValue(value.isNull() ? null : new BigDecimal(value.asText()));
                break;
              case "unrealized_gain":
                report.setUnrealizedGain(value.isNull() ? null : new BigDecimal(value.asText()));
                break;
              case "absolute_return":
                report.setAbsoluteReturn(value.isNull() ? null : new BigDecimal(value.asText()));
                break;
              case "average_buying_value":
                report.setAverageBuyingValue(
                    value.isNull() ? null : new BigDecimal(value.asText()));
                break;
              case "units":
                report.setUnits(value.isNull() ? null : new BigDecimal(value.asText()));
                break;
              case "xirr":
                report.setXirr(value.isNull() ? null : new BigDecimal(value.asText()));
                break;
            }
          }

          reports.add(report);
        }
      }
    }

    return new SchemeWiseReportResponse(reports, columns);
  }
}
