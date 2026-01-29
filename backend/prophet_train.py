import pandas as pd
from prophet import Prophet

# Load daily data
df = pd.read_csv("dataset/daily_load_india.csv")
df["ds"] = pd.to_datetime(df["ds"])

# Load festivals
holidays = pd.read_csv("dataset/indian_festivals.csv")
holidays["ds"] = pd.to_datetime(holidays["ds"])

# Create Prophet model
model = Prophet(
    holidays=holidays,
    weekly_seasonality=True,
    yearly_seasonality=True
)

# Train model
model.fit(df)

# Predict next 1 day
future = model.make_future_dataframe(periods=1)
forecast = model.predict(future)

# Save prediction
forecast[["ds", "yhat"]].tail(1).to_csv(
    "dataset/daily_prediction.csv",
    index=False
)

print("Prophet model trained and prediction saved")
