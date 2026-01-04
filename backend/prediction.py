import numpy as np

def get_prediction():
    hours = list(range(24))
    load = np.random.randint(40, 100, size=24)  # Fake load values for now

    return [{"hour": h, "load": int(l)} for h, l in zip(hours, load)]
