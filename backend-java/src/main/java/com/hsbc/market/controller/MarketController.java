package com.hsbc.market.controller;

import com.hsbc.market.model.Property;
import com.hsbc.market.service.MarketService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
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

    @PostMapping("/what-if/batch")
    public ResponseEntity<List<Map<String, Object>>> whatIfBatch(
            @Valid @RequestBody List<@Valid WhatIfRequest> requests) {

        List<Map<String, Object>> featuresList = requests.stream()
                .map(r -> {
                    Map<String, Object> f = new LinkedHashMap<>();
                    f.put("square_footage", r.squareFootage());
                    f.put("bedrooms", r.bedrooms());
                    f.put("bathrooms", r.bathrooms());
                    f.put("year_built", r.yearBuilt());
                    f.put("lot_size", r.lotSize());
                    f.put("distance_to_city_center", r.distanceToCityCenter());
                    f.put("school_rating", r.schoolRating());
                    return f;
                })
                .collect(Collectors.toList());

        List<Double> prices = marketService.predictWhatIfBatch(featuresList);

        List<Map<String, Object>> results = prices.stream()
                .map(price -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("predictedPrice", Math.round(price * 100.0) / 100.0);
                    m.put("currency", "USD");
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(results);
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
