package com.nested.app.entity;

import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "reverse_penny_drops")
public class ReversePennyDrop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String referenceId;

    @Column
    private String transactionId;

    @Column
    private String transactionNote;

    @Column
    private Long userId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ReversePennyDropStatus status = ReversePennyDropStatus.PENDING;

    public enum ReversePennyDropStatus {
        PENDING("pending"),
        COMPLETED("completed"),
        FAILED("failed"),
        CANCELLED("cancelled");

        private final String value;

        ReversePennyDropStatus(String value) {
            this.value = value;
        }

        @JsonValue
        public String getValue() {
            return value;
        }
    }

}
