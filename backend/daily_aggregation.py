import pandas as pd

# Load hourly data
df = pd.read_csv("dataset/load_data.csv")

# Convert timestamp to datetime
df["timestamp"] = pd.to_datetime(df["timestamp"])

# Extract date
df["date"] = df["timestamp"].dt.date

# Group by date and sum load
daily_df = df.groupby("date", as_index=False)["load"].sum()

# Rename columns to Prophet format
daily_df.columns = ["ds", "y"]

# Save to daily dataset
daily_df.to_csv("dataset/daily_load_india.csv", index=False)

print("Daily dataset created successfully")
print(daily_df.head())
