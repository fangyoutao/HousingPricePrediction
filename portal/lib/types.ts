export interface HouseFeatures {
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
  distance_to_city_center: number;
  school_rating: number;
}

export interface PredictResponse {
  predicted_price: number;
  currency: string;
}

export interface PredictHistoryRecord {
  id: number;
  features: HouseFeatures;
  predicted_price: number;
  created_at: string;
}

export interface ModelInfo {
  coefficients: Record<string, number>;
  intercept: number;
  metrics: {
    r2_score: number;
    mean_absolute_error: number;
    root_mean_squared_error: number;
    training_samples: number;
    test_samples: number;
  };
  features: string[];
}

export interface MarketStats {
  totalProperties: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  medianPrice: number;
  avgSquareFootage: number;
  avgBedrooms: number;
  avgBathrooms: number;
  avgSchoolRating: number;
  bedroomsDistribution: Record<string, number>;
  yearDecadeDistribution: Record<string, number>;
}

export interface PropertyData {
  id: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  lotSize: number;
  distanceToCityCenter: number;
  schoolRating: number;
  price: number;
}

export interface WhatIfRequest extends HouseFeatures {}

export interface WhatIfResponse {
  predictedPrice: number;
  currency: string;
}
