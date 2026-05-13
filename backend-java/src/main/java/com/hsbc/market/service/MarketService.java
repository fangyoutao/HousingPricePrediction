package com.hsbc.market.service;

import com.hsbc.market.model.Property;
import jakarta.annotation.PostConstruct;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MarketService {

    private final List<Property> properties = new ArrayList<>();

    @PostConstruct
    public void loadData() {
        try (var reader = new BufferedReader(
                new InputStreamReader(
                        Objects.requireNonNull(getClass().getResourceAsStream("/house_data.csv"))))) {

            String header = reader.readLine(); // skip header
            String line;
            while ((line = reader.readLine()) != null && !line.isBlank()) {
                String[] parts = line.split(",");
                if (parts.length < 9) continue;

                Property p = new Property();
                p.setId(Integer.parseInt(parts[0].trim()));
                p.setSquareFootage(Double.parseDouble(parts[1].trim()));
                p.setBedrooms(Integer.parseInt(parts[2].trim()));
                p.setBathrooms(Double.parseDouble(parts[3].trim()));
                p.setYearBuilt(Integer.parseInt(parts[4].trim()));
                p.setLotSize(Double.parseDouble(parts[5].trim()));
                p.setDistanceToCityCenter(Double.parseDouble(parts[6].trim()));
                p.setSchoolRating(Double.parseDouble(parts[7].trim()));
                p.setPrice(Double.parseDouble(parts[8].trim()));
                properties.add(p);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to load house data", e);
        }
    }

    @Cacheable(value = "properties")
    public List<Property> getAllProperties() {
        return properties;
    }

    @Cacheable(value = "stats")
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
                        Collectors.counting()
                ));

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalProperties", properties.size());
        stats.put("avgPrice", Math.round(priceStats.getAverage() * 100.0) / 100.0);
        stats.put("minPrice", priceStats.getMin());
        stats.put("maxPrice", priceStats.getMax());
        stats.put("medianPrice", calculateMedian(properties.stream().mapToDouble(Property::getPrice).sorted().toArray()));
        stats.put("avgSquareFootage", Math.round(sqftStats.getAverage() * 100.0) / 100.0);
        stats.put("avgBedrooms", Math.round(properties.stream().mapToDouble(Property::getBedrooms).average().orElse(0) * 10.0) / 10.0);
        stats.put("avgBathrooms", Math.round(properties.stream().mapToDouble(Property::getBathrooms).average().orElse(0) * 10.0) / 10.0);
        stats.put("avgSchoolRating", Math.round(properties.stream().mapToDouble(Property::getSchoolRating).average().orElse(0) * 100.0) / 100.0);
        stats.put("bedroomsDistribution", bedroomsDistribution);
        stats.put("yearDecadeDistribution", yearDistribution);

        return stats;
    }

    @Cacheable(value = "filteredProperties", key = "T(java.util.Objects).toString(#minPrice, 'null') + '-' + T(java.util.Objects).toString(#maxPrice, 'null') + '-' + T(java.util.Objects).toString(#minBedrooms, 'null') + '-' + T(java.util.Objects).toString(#maxBedrooms, 'null')")
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
        // Rough estimation based on average price per square foot adjusted by features
        double avgPricePerSqft = properties.stream()
                .mapToDouble(p -> p.getPrice() / p.getSquareFootage())
                .average()
                .orElse(200.0);

        double basePrice = squareFootage * avgPricePerSqft;

        // Adjustments based on average differences
        double avgBathPerBed = properties.stream()
                .mapToDouble(p -> p.getBathrooms() / p.getBedrooms())
                .average()
                .orElse(0.5);
        double bathroomAdjustment = (bathrooms - bedrooms * avgBathPerBed) * 15000;

        double schoolAdjustment = (schoolRating - 7.5) * 25000;
        double distanceAdjustment = (10 - distanceToCityCenter) * 5000;
        double yearAdjustment = (yearBuilt - 1995) * 1500;

        return Math.max(50000, basePrice + bathroomAdjustment + schoolAdjustment + distanceAdjustment + yearAdjustment);
    }

    private double calculateMedian(double[] sortedValues) {
        int n = sortedValues.length;
        if (n == 0) return 0;
        if (n % 2 == 0) {
            return (sortedValues[n / 2 - 1] + sortedValues[n / 2]) / 2.0;
        }
        return sortedValues[n / 2];
    }
}
