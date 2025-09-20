package com.nested.app.entity;

import com.nested.app.annotation.OneFieldOnly;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@DiscriminatorValue("SELL")
@OneFieldOnly(first = "amount", second = "units",
        message = "Either amount or units must be set, but not both")
public class SellOrder extends Order {

    @Min(1)
    private Double units;

    private String reason;
}
