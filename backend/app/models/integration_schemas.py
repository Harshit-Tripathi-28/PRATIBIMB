"""
PRATIBIMB External Integration Schemas:
Defines extensible provider contracts for external context ingestion.
NOTE: Marked as EXTERNAL DEPENDENCY — REQUIRES CREDENTIAL/CONFIGURATION.
"""

from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

class ExternalIntegrationStatus(BaseModel):
    provider: Literal["google_calendar", "github", "notion", "slack", "apple_health", "whoop", "oura"]
    connected: bool = False
    status_label: str = "EXTERNAL DEPENDENCY — REQUIRES CREDENTIAL/CONFIGURATION"
    last_synced: Optional[str] = None
    configured_scopes: List[str] = Field(default_factory=list)

class IntegrationSyncEvent(BaseModel):
    provider: str
    event_type: str
    payload: Dict[str, Any]
    timestamp: str
