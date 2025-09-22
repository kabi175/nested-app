package com.nested.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@DiscriminatorValue("BUY")
@EqualsAndHashCode(callSuper = true)
public class BuyOrder extends Order {
    @Column(nullable = false)
    private Double amount;

    private double units;

}
