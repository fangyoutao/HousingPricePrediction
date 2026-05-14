"""
Train a linear regression model on the housing dataset.
"""
import os
import pickle
import pandas as pd
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

DATA_PATH = os.environ.get(
    "TRAIN_DATA_PATH",
    os.path.join(os.path.dirname(__file__), "..", "..", "House Price Dataset.csv"),
)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "app", "model.pkl")

FEATURES = [
    "square_footage", "bedrooms", "bathrooms",
    "year_built", "lot_size", "distance_to_city_center", "school_rating",
]
TARGET = "price"


def main():
    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df)} rows")

    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Ridge with standardization handles multicollinearity,
    # producing stable coefficients with intuitive (positive) signs.
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = Ridge(alpha=1.0, random_state=42)
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)

    metrics = {
        "r2_score": round(r2_score(y_test, y_pred), 4),
        "mean_absolute_error": round(mean_absolute_error(y_test, y_pred), 2),
        "root_mean_squared_error": round(np.sqrt(mean_squared_error(y_test, y_pred)), 2),
        "training_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
    }

    # Transform coefficients back to original scale for interpretability
    coefs = model.coef_ / scaler.scale_
    intercept = round(model.intercept_ - np.dot(coefs, scaler.mean_), 4)
    coefficients = dict(zip(FEATURES, [round(c, 4) for c in coefs]))

    payload = {
        "model": model,
        "scaler": scaler,
        "features": FEATURES,
        "coefficients": coefficients,
        "intercept": intercept,
        "metrics": metrics,
    }

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(payload, f)

    print(f"Model saved to {MODEL_PATH}")
    print(f"R2 = {metrics['r2_score']}")
    print(f"MAE = {metrics['mean_absolute_error']}")
    print(f"RMSE = {metrics['root_mean_squared_error']}")
    print("Coefficients:", coefficients)
    print(f"Intercept: {intercept}")


if __name__ == "__main__":
    main()
