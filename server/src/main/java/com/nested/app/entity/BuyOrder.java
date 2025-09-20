package com.nested.app.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("BUY")
public class BuyOrder extends Order {

}
