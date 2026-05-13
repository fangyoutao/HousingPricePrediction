package com.hsbc.market.controller;

import com.hsbc.market.model.Property;
import com.hsbc.market.service.MarketService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class MarketController {

    private final MarketService marketService;

    public MarketController(MarketService marketService) {
        this.marketService = marketService;
    }

    @GetMapping("/properties")
    public ResponseEntity<List<Property>> getProperties(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) @Min(1) @Max(10) Integer minBedrooms,
            @RequestParam(required = false) @Min(1) @Max(10) Integer maxBedrooms) {

        List<Property> result = marketService.getFilteredProperties(
                minPrice, maxPrice, minBedrooms, maxBedrooms);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(marketService.getAggregateStats());
    }

    @PostMapping("/what-if")
    public ResponseEntity<Map<String, Object>> whatIf(@Valid @RequestBody WhatIfRequest request) {
        double predictedPrice = marketService.predictWhatIf(
                request.squareFootage(),
                request.bedrooms(),
                request.bathrooms(),
                request.yearBuilt(),
                request.lotSize(),
                request.distanceToCityCenter(),
                request.schoolRating()
        );
        return ResponseEntity.ok(Map.of(
                "predictedPrice", Math.round(predictedPrice * 100.0) / 100.0,
                "currency", "USD"
        ));
    }

    record WhatIfRequest(
            @Min(100) double squareFootage,
            @Min(1) @Max(10) int bedrooms,
            @Min(0) double bathrooms,
            @Min(1800) int yearBuilt,
            @Min(0) double lotSize,
            @Min(0) double distanceToCityCenter,
            @Min(0) @Max(10) double schoolRating
    ) {}
}
