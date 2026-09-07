from datetime import datetime, timezone
from typing import Dict, List
import math
import random
import time

import numpy as np
from fastapi import FastAPI, Query
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest

app = FastAPI(
    title="AI Digital Twin API",
    version="1.0.0",
    description="Real-time machine digital twin with telemetry, anomaly detection and health scoring."
)

ASSET_ID = "MACHINE-001"

class TwinState(BaseModel):
    asset_id: str
    timestamp: str
    temperature_c: float
    vibration_mm_s: float
    pressure_bar: float
    rpm: float
    power_kw: float
    health_score: float
    anomaly_score: float
    status: str

def generate_telemetry(step: int = 0, anomaly: bool = False) -> Dict[str, float]:
    """Generate a time-dependent machine state for the live twin stream."""
    phase = step * 0.12

    temperature = 68 + 3.5 * math.sin(phase) + random.gauss(0, 0.7)
    vibration = 2.4 + 0.25 * math.sin(phase * 1.7) + random.gauss(0, 0.06)
    pressure = 7.1 + 0.35 * math.sin(phase * 0.8) + random.gauss(0, 0.05)
    rpm = 1450 + 55 * math.sin(phase * 0.6) + random.gauss(0, 8)
    power = 18.5 + 1.8 * math.sin(phase * 0.9) + random.gauss(0, 0.25)

    if anomaly:
        temperature += 18
        vibration += 2.0
        pressure -= 1.0
        rpm += 180
        power += 5.5

    return {
        "temperature_c": temperature,
        "vibration_mm_s": vibration,
        "pressure_bar": pressure,
        "rpm": rpm,
        "power_kw": power,
    }

# Train the anomaly detector on normal operating telemetry.
training = np.array([
    [
        generate_telemetry(i)["temperature_c"],
        generate_telemetry(i)["vibration_mm_s"],
        generate_telemetry(i)["pressure_bar"],
        generate_telemetry(i)["rpm"],
        generate_telemetry(i)["power_kw"],
    ]
    for i in range(700)
])

model = IsolationForest(
    n_estimators=200,
    contamination=0.03,
    random_state=42
)
model.fit(training)

history: List[TwinState] = []
step_counter = 0

def build_twin_state(force_anomaly: bool = False) -> TwinState:
    global step_counter
    telemetry = generate_telemetry(step_counter, anomaly=force_anomaly)
    step_counter += 1

    features = np.array([[
        telemetry["temperature_c"],
        telemetry["vibration_mm_s"],
        telemetry["pressure_bar"],
        telemetry["rpm"],
        telemetry["power_kw"],
    ]])

    raw_score = float(model.decision_function(features)[0])
    prediction = int(model.predict(features)[0])

    # Convert the detector output into a simple 0-100 health score.
    health_score = float(np.clip(50 + raw_score * 120, 0, 100))
    status = "ANOMALY" if prediction == -1 else "NORMAL"

    state = TwinState(
        asset_id=ASSET_ID,
        timestamp=datetime.now(timezone.utc).isoformat(),
        **telemetry,
        health_score=round(health_score, 2),
        anomaly_score=round(raw_score, 4),
        status=status,
    )

    history.append(state)
    if len(history) > 100:
        history.pop(0)

    return state

@app.get("/health")
def health():
    return {"service": "ai-digital-twin", "status": "running"}

@app.get("/twin/current", response_model=TwinState)
def current_twin():
    return build_twin_state()

@app.get("/twin/history", response_model=List[TwinState])
def twin_history(limit: int = Query(default=20, ge=1, le=100)):
    if not history:
        build_twin_state()
    return history[-limit:]

@app.get("/twin/simulate-anomaly", response_model=TwinState)
def simulate_anomaly():
    """Generate one intentionally abnormal machine state for a live demo."""
    return build_twin_state(force_anomaly=True)

@app.get("/twin/stream")
def twin_stream(samples: int = Query(default=10, ge=1, le=60), interval: float = Query(default=1.0, ge=0.1, le=5.0)):
    """Return a short replayable stream of twin states."""
    states = []
    for _ in range(samples):
        states.append(build_twin_state())
        time.sleep(interval)
    return states
