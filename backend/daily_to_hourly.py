import pandas as pd
import json

# Load daily prediction from Prophet
df = pd.read_csv("dataset/daily_prediction.csv")
daily_load = df.iloc[0]["yhat"]

# Fixed hourly distribution profile (realistic grid pattern)
hourly_weights = {
    0: 0.03, 1: 0.02, 2: 0.02, 3: 0.02,
    4: 0.03, 5: 0.04,
    6: 0.06, 7: 0.07, 8: 0.08,
    9: 0.07, 10: 0.06, 11: 0.06,
    12: 0.07, 13: 0.07,
    14: 0.06, 15: 0.06,
    16: 0.07, 17: 0.08,
    18: 0.09, 19: 0.10,
    20: 0.08, 21: 0.06,
    22: 0.04, 23: 0.03
}

def load_level(value):
    if value < 70:
        return "LOW"
    elif value < 120:
        return "MEDIUM"
    else:
        return "HIGH"

output = []

for hour, weight in hourly_weights.items():
    hourly_load = daily_load * weight

    output.append({
        "hour": hour,
        "predicted_load": round(hourly_load, 2),
        "load_level": load_level(hourly_load)
    })

# Save to the SAME file the frontend already uses
with open("../frontend/public/prediction_with_load_levels.json", "w") as f:
    json.dump(output, f, indent=2)

print("Hourly prediction JSON generated successfully")
