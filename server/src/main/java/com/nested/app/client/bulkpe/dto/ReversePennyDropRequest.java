package com.nested.app.client.bulkpe.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ReversePennyDropRequest {

    @JsonProperty("reference_id")
    String referenceId;

    @JsonProperty("transcation_note")
    String transcationNote;
}
