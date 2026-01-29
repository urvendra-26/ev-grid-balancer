import pandas as pd
import numpy as np

# Base load from your real data
base_load = 2049

# Create date range for 1 year
dates = pd.date_range(start="2025-01-01", end="2025-12-31", freq="D")

data = []

for i, date in enumerate(dates):
    # Weekly pattern (weekend lower load)
    weekly_factor = 0.9 if date.weekday() >= 5 else 1.0

    # Seasonal pattern (summer higher load)
    month = date.month
    if month in [4,5,6]:
        seasonal_factor = 1.15
    elif month in [11,12,1]:
        seasonal_factor = 0.95
    else:
        seasonal_factor = 1.0

    # Random noise
    noise = np.random.normal(0, 50)

    load = base_load * weekly_factor * seasonal_factor + noise
    data.append([date.date(), round(load, 2)])

df = pd.DataFrame(data, columns=["ds", "y"])

# Save back to the SAME file Prophet uses
df.to_csv("dataset/daily_load_india.csv", index=False)

print("1-year daily dataset generated")
print(df.head())
print(df.tail())
