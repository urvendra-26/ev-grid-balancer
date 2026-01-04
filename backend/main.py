from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prediction import get_prediction

app = FastAPI()

# Allow your React frontend to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/predict")
def predict():
    pred = get_prediction()
    return {"prediction": pred}
