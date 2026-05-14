package com.hsbc.market.service;

import com.hsbc.market.model.Property;
import com.opencsv.CSVReader;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.InputStreamReader;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MarketService {

    private final List<Property> properties = new ArrayList<>();
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${model.api.base-url:http://localhost:8000}")
    private String modelApiBaseUrl;

    @PostConstruct
    public void init() {
        loadData();
    }

    private void loadData() {
        try (var reader = new CSVReader(new InputStreamReader(
                Objects.requireNonNull(getClass().getResourceAsStream("/house_data.csv"))))) {

            reader.readNext(); // skip header
            String[] parts;
            while ((parts = reader.readNext()) != null) {
                if (parts.length < 9) continue;
                Property p = new Property(
                        Integer.parseInt(parts[0].trim()),
                        Double.parseDouble(parts[1].trim()),
                        Integer.parseInt(parts[2].trim()),
                        Double.parseDouble(parts[3].trim()),
                        Integer.parseInt(parts[4].trim()),
                        Double.parseDouble(parts[5].trim()),
                        Double.parseDouble(parts[6].trim()),
                        Double.parseDouble(parts[7].trim()),
                        Double.parseDouble(parts[8].trim())
                );
                properties.add(p);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to load house data", e);
        }
    }

    @Cacheable("stats")
    public Map<String, Object> getAggregateStats() {
        DoubleSummaryStatistics priceStats = properties.stream()
                .mapToDouble(Property::getPrice)
                .summaryStatistics();

        DoubleSummaryStatistics sqftStats = properties.stream()
                .mapToDouble(Property::getSquareFootage)
                .summaryStatistics();

        Map<Integer, Long> bedroomsDistribution = properties.stream()
                .collect(Collectors.groupingBy(Property::getBedrooms, Collectors.counting()));

        Map<Integer, Long> yearDistribution = properties.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getYearBuilt() / 10 * 10,
                        Collectors.counting()));

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalProperties", properties.size());
        stats.put("avgPrice", Math.round(priceStats.getAverage() * 100.0) / 100.0);
        stats.put("minPrice", priceStats.getMin());
        stats.put("maxPrice", priceStats.getMax());
        stats.put("medianPrice", calculateMedian(
                properties.stream().mapToDouble(Property::getPrice).sorted().toArray()));
        stats.put("avgSquareFootage", Math.round(sqftStats.getAverage() * 100.0) / 100.0);
        stats.put("avgBedrooms", Math.round(
                properties.stream().mapToDouble(Property::getBedrooms).average().orElse(0) * 10.0) / 10.0);
        stats.put("avgBathrooms", Math.round(
                properties.stream().mapToDouble(Property::getBathrooms).average().orElse(0) * 10.0) / 10.0);
        stats.put("avgSchoolRating", Math.round(
                properties.stream().mapToDouble(Property::getSchoolRating).average().orElse(0) * 100.0) / 100.0);
        stats.put("bedroomsDistribution", bedroomsDistribution);
        stats.put("yearDecadeDistribution", yearDistribution);
        return stats;
    }

    @Cacheable(value = "filteredProperties",
            key = "#minPrice + '-' + #maxPrice + '-' + #minBedrooms + '-' + #maxBedrooms")
    public List<Property> getFilteredProperties(Double minPrice, Double maxPrice,
                                                Integer minBedrooms, Integer maxBedrooms) {
        return properties.stream()
                .filter(p -> minPrice == null || p.getPrice() >= minPrice)
                .filter(p -> maxPrice == null || p.getPrice() <= maxPrice)
                .filter(p -> minBedrooms == null || p.getBedrooms() >= minBedrooms)
                .filter(p -> maxBedrooms == null || p.getBedrooms() <= maxBedrooms)
                .collect(Collectors.toList());
    }

    public double predictWhatIf(double squareFootage, int bedrooms, double bathrooms,
                                int yearBuilt, double lotSize, double distanceToCityCenter,
                                double schoolRating) {
        Map<String, Object> innerFeatures = new LinkedHashMap<>();
        innerFeatures.put("square_footage", squareFootage);
        innerFeatures.put("bedrooms", bedrooms);
        innerFeatures.put("bathrooms", bathrooms);
        innerFeatures.put("year_built", yearBuilt);
        innerFeatures.put("lot_size", lotSize);
        innerFeatures.put("distance_to_city_center", distanceToCityCenter);
        innerFeatures.put("school_rating", schoolRating);

        Map<String, Object> body = Map.of("features", innerFeatures);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(
                modelApiBaseUrl + "/predict", entity, Map.class);

        if (response == null || !response.containsKey("predicted_price")) {
            throw new RuntimeException("Invalid response from model API");
        }
        return ((Number) response.get("predicted_price")).doubleValue();
    }

    private double calculateMedian(double[] sortedValues) {
        int n = sortedValues.length;
        if (n == 0) return 0;
        if (n % 2 == 0) return (sortedValues[n / 2 - 1] + sortedValues[n / 2]) / 2.0;
        return sortedValues[n / 2];
    }
}
