"""
Digital Twin Simulation Engine:
Evaluates "What-If" cognitive and strategic scenarios by modeling time allocation,
existing skill representations, competing priorities, and probabilistic trajectory distributions.
"""

import uuid
from typing import Dict, Any, List
import numpy as np
from app.models.twin_schemas import DigitalTwin
from app.models.deep_learning_schemas import SimulationScenarioRequest, ScenarioOutcome
from app.deep_learning.representation.embedding_engine import embedding_engine

class SimulationEngine:
    def simulate_scenario(self, twin: DigitalTwin, request: SimulationScenarioRequest) -> ScenarioOutcome:
        scenario_id = f"sim-{uuid.uuid4().hex[:6]}"
        
        # 1. Evaluate baseline capacity
        available_hours = max(5.0, request.allocated_hours_per_week)
        weeks = max(1, request.duration_weeks)
        total_hours = available_hours * weeks

        # 2. Match focus domain against existing skills & goals
        domain_vec = embedding_engine.generate_dense_embedding(request.focus_domain)
        
        skills_text = " ".join(twin.profile.skills)
        skills_vec = embedding_engine.generate_dense_embedding(skills_text)
        prior_affinity = embedding_engine.compute_cosine_similarity(domain_vec, skills_vec)

        # 3. Probabilistic Goal Delta & Skill Acquisition Calculation
        # Base learning curve with diminishing returns: delta = max_gain * (1 - e^(-total_hours / constant))
        base_progress_gain = int(min(90, 100 * (1 - np.exp(-total_hours / 120.0))))
        skill_score = round(float(min(98.0, 35.0 + prior_affinity * 30.0 + (total_hours / 180.0) * 35.0)), 1)

        # 4. Cognitive load and burnout risk
        burnout_risk = 0.15
        if available_hours > 25.0:
            burnout_risk += 0.45
            load_proj = "Overloaded"
        elif available_hours > 15.0:
            burnout_risk += 0.20
            load_proj = "Challenging"
        elif available_hours > 8.0:
            load_proj = "Optimal"
        else:
            load_proj = "Underutilized"

        if twin.state.energy_level < 50:
            burnout_risk += 0.2

        burnout_risk = round(min(0.95, max(0.05, burnout_risk)), 2)
        momentum_score = round(float(max(10.0, min(99.0, (base_progress_gain * 0.6) + (1.0 - burnout_risk) * 40.0))), 1)

        # 5. Tradeoffs and Catalysts synthesis
        tradeoffs = [
            f"Requires reserving ~{available_hours:.1f} hrs/week, potentially reducing throughput on secondary projects.",
            f"High intensity ({weeks} weeks) requires scheduled deload weeks to maintain cognitive baseline."
        ]
        if request.competing_priorities_adjustment:
            tradeoffs.append(f"Mitigation: {request.competing_priorities_adjustment}")

        catalysts = [
            f"Prior skill overlap with '{twin.profile.skills[0] if twin.profile.skills else 'Technical core'}' accelerates initial ramp-up.",
            f"Projected completion probability of core milestones: ~{int(base_progress_gain * 0.95)}%.",
            f"Consistency multiplier improves habit streak index by +{int(weeks * 1.5)}%."
        ]

        ai_synthesis = (
            f"Simulating a {weeks}-week dedicated focus block on '{request.focus_domain}' at {available_hours} hrs/week. "
            f"Given your current cognitive baseline ({twin.state.energy_level}% Energy, {twin.behavior.cognitive_load} load), "
            f"this scenario yields an estimated +{base_progress_gain}% milestone advancement with a momentum rating of {momentum_score}/100. "
            f"Burnout risk is currently rated {burnout_risk*100:.0f}% ({load_proj})."
        )

        return ScenarioOutcome(
            scenario_id=scenario_id,
            scenario_title=request.scenario_title,
            estimated_goal_progress_delta=base_progress_gain,
            estimated_skill_acquisition_score=skill_score,
            cognitive_load_projection=load_proj,
            burnout_risk_score=burnout_risk,
            momentum_score=momentum_score,
            projected_tradeoffs=tradeoffs,
            positive_catalysts=catalysts,
            ai_synthesis=ai_synthesis
        )

simulation_engine = SimulationEngine()
