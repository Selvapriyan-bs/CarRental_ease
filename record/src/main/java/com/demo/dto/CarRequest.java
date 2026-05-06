package com.demo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CarRequest {
    @NotBlank
    private String model;

    @NotBlank
    private String brand;

    @Min(1886)
    @Max(2026)
    private Integer year;

    @DecimalMin("0.0")
    private Double pricePerDay;
}
