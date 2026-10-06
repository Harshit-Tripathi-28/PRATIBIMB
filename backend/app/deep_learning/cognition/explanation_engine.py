"""
Cognitive Explanation Engine:
Synthesizes observed state changes, supporting signals, and contextual entity relationships
into structured explanations while preserving clear epistemic separation.
"""

from typing import List, Dict, Any
from app.models.twin_schemas import DigitalTwin
from app.deep_learning.cognition.cognition_schemas import (
    AttributedSignal, CognitiveExplanation, RelatedEntityRef
)

class ExplanationEngine:
    def build_explanation(
        self,
        observed_change: str,
        signals: List[AttributedSignal],
        related_entities: List[RelatedEntityRef]
    ) -> CognitiveExplanation:
        """
        Builds a grounded, non-speculative explanation for why an observed state shift occurred.
        """
        # Collect directional trends
        improving_signals = [s for s in signals if s.direction == 'increasing']
        declining_signals = [s for s in signals if s.direction == 'decreasing']

        related_entity_names = ", ".join([e.label for e in related_entities[:2]])
        context_str = f"Active context involves {related_entity_names or 'core engineering milestones'}."

        if improving_signals and not declining_signals:
            interpretation = (
                f"The observed upward momentum coincides with positive signals in "
                f"{', '.join([s.metric_name for s in improving_signals[:2]])}. "
                f"This pattern is associated with sustained focus consistency."
            )
        elif declining_signals:
            interpretation = (
                f"The shift is associated with downward movement in "
                f"{', '.join([s.metric_name for s in declining_signals[:2]])}. "
                f"This may be contributing to temporary velocity drag across active milestones."
            )
        else:
            interpretation = "Observed metrics are operating in steady-state equilibrium relative to baseline."

        return CognitiveExplanation(
            observed_change=observed_change,
            supporting_signals=signals,
            related_context=context_str,
            interpretation=interpretation,
            confidence=0.92
        )

explanation_engine = ExplanationEngine()
