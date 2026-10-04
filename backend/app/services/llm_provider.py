import os
import json
import logging
import re
from typing import Optional, Dict, Any, Tuple, List
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

class LLMProviderService:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.gemini_model = settings.GEMINI_MODEL or "gemini-2.5-flash"
        self.openai_key = settings.OPENAI_API_KEY
        self.anthropic_key = settings.ANTHROPIC_API_KEY
        self.ollama_url = settings.OLLAMA_BASE_URL

    def get_active_provider(self) -> Optional[str]:
        if self.gemini_key:
            return "gemini"
        elif self.openai_key:
            return "openai"
        elif self.anthropic_key:
            return "anthropic"
        elif self.ollama_url:
            return "ollama"
        return None

    def is_configured(self) -> bool:
        return self.get_active_provider() is not None

    def get_active_model(self) -> str:
        provider = self.get_active_provider()
        if provider == "gemini":
            return settings.GEMINI_MODEL or settings.LLM_MODEL or "gemini-2.5-flash"
        elif provider == "openai":
            return settings.LLM_MODEL or "gpt-4o-mini"
        elif provider == "anthropic":
            return settings.LLM_MODEL or "claude-3-5-haiku-20241022"
        elif provider == "ollama":
            return settings.LLM_MODEL or "llama3"
        return "None"

    def get_status(self) -> Dict[str, Any]:
        provider = self.get_active_provider()
        model = self.get_active_model()
        return {
            "configured": provider is not None,
            "provider": provider,
            "model": model,
            "instructions": (
                "Connected and operational."
                if provider
                else "Set GEMINI_API_KEY or OPENAI_API_KEY in backend environment (.env) to enable live neural reasoning."
            ),
        }

    async def generate_response(
        self,
        system_prompt: str,
        user_message: str,
        context_summary: str
    ) -> Tuple[str, Optional[Dict[str, Any]]]:
        """
        Sends system prompt, user query, and context to active LLM.
        Returns: (text_response, structured_action_payload_or_None)
        """
        provider = self.get_active_provider()
        if not provider:
            return (
                "⚠️ **PRATIBIMB AI Core Standby Mode**\n\n"
                "No live LLM provider API key (`GEMINI_API_KEY` or `OPENAI_API_KEY`) is currently configured in your backend environment.\n\n"
                "To enable real generative AI reasoning and memory synthesis:\n"
                "1. Add `GEMINI_API_KEY=your_key` to your `backend/.env` file.\n"
                "2. Restart the backend service.\n\n"
                "Your Digital Twin state, goals, memories, habits, and customizable avatar remain fully active.",
                None
            )

        full_system = (
            f"{system_prompt}\n\n"
            f"CURRENT DIGITAL TWIN CONTEXT:\n{context_summary}\n\n"
            "If appropriate to propose an action, end your reply with an ACTION JSON block in this exact format:\n"
            "```action\n"
            "{\n"
            '  "type": "create_task" | "start_focus_session" | "create_goal",\n'
            '  "title": "Title of action",\n'
            '  "description": "Short explanation",\n'
            '  "payload": { ... }\n'
            "}\n"
            "```"
        )

        try:
            if provider == "gemini":
                return await self._call_gemini(full_system, user_message)
            elif provider == "openai":
                return await self._call_openai(full_system, user_message)
            elif provider == "anthropic":
                return await self._call_anthropic(full_system, user_message)
            elif provider == "ollama":
                return await self._call_ollama(full_system, user_message)
        except Exception as e:
            logger.error(f"Error invoking LLM provider {provider}: {type(e).__name__}")
            return (
                f"⚠️ Error communicating with AI Core ({provider}). Please check your connection.",
                None
            )

        return ("No response generated from AI provider.", None)

    async def _call_gemini(self, system: str, prompt: str) -> Tuple[str, Optional[Dict[str, Any]]]:
        """
        Calls Google Gemini API with robust header-based authentication,
        model negotiation, and friendly error mapping.
        """
        primary_model = settings.GEMINI_MODEL or settings.LLM_MODEL or "gemini-2.5-flash"
        
        # Candidate models list: primary configured model, followed by graceful fallbacks if Google returns 404
        candidates: List[str] = [primary_model]
        if "gemini-flash-latest" not in candidates:
            candidates.append("gemini-flash-latest")
        if "gemini-3.8-flash" not in candidates:
            candidates.append("gemini-3.8-flash")
        if "gemini-2.5-flash" not in candidates:
            candidates.append("gemini-2.5-flash")

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"System Directive:\n{system}\n\nUser Message:\n{prompt}"}]
                }
            ],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 1024
            }
        }

        headers = {
            "x-goog-api-key": self.gemini_key or "",
            "Content-Type": "application/json"
        }

        last_error_detail = ""

        async with httpx.AsyncClient(timeout=30.0) as client:
            for model_name in candidates:
                clean_model = model_name.replace("models/", "")
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{clean_model}:generateContent"
                
                try:
                    resp = await client.post(url, json=payload, headers=headers)
                    
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates_list = data.get("candidates", [])
                        if candidates_list and "content" in candidates_list[0]:
                            parts = candidates_list[0]["content"].get("parts", [])
                            if parts and "text" in parts[0]:
                                raw_text = parts[0]["text"]
                                return self._parse_response_and_action(raw_text)
                    
                    elif resp.status_code in (401, 403):
                        return (
                            "⚠️ **AI Core Authentication Error**: The configured Gemini API key is invalid or unauthorized. Please verify your credentials in `backend/.env`.",
                            None
                        )
                    elif resp.status_code == 429:
                        return (
                            "⚠️ **AI Core Rate Limited**: Google Gemini API quota or rate limit reached. Please wait a moment before sending another message.",
                            None
                        )
                    elif resp.status_code == 404:
                        # Model unavailable on this API key tier, attempt next candidate fallback
                        last_error_detail = f"Model {clean_model} unavailable (404)"
                        continue
                    elif resp.status_code >= 500:
                        last_error_detail = f"Gemini upstream server error ({resp.status_code})"
                        continue
                    else:
                        last_error_detail = f"Provider returned status {resp.status_code}"
                except httpx.TimeoutException:
                    last_error_detail = "Request timed out"
                    continue
                except Exception as e:
                    logger.error(f"Gemini connection error: {type(e).__name__}")
                    last_error_detail = "Network error"
                    continue

        return (
            f"⚠️ **AI Core Notice**: Unable to generate response from Gemini ({last_error_detail}). Please verify your network connection and API key permissions.",
            None
        )

    async def _call_openai(self, system: str, prompt: str) -> Tuple[str, Optional[Dict[str, Any]]]:
        model = settings.LLM_MODEL or "gpt-4o-mini"
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.4
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code in (401, 403):
                return ("⚠️ **AI Core Authentication Error**: Invalid OpenAI API key.", None)
            elif resp.status_code == 429:
                return ("⚠️ **AI Core Rate Limited**: OpenAI rate limit reached.", None)
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["choices"][0]["message"]["content"]
            return self._parse_response_and_action(raw_text)

    async def _call_anthropic(self, system: str, prompt: str) -> Tuple[str, Optional[Dict[str, Any]]]:
        model = settings.LLM_MODEL or "claude-3-5-haiku-20241022"
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.anthropic_key or "",
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": model,
            "max_tokens": 1024,
            "system": system,
            "messages": [{"role": "user", "content": prompt}]
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code in (401, 403):
                return ("⚠️ **AI Core Authentication Error**: Invalid Anthropic API key.", None)
            elif resp.status_code == 429:
                return ("⚠️ **AI Core Rate Limited**: Anthropic rate limit reached.", None)
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["content"][0]["text"]
            return self._parse_response_and_action(raw_text)

    async def _call_ollama(self, system: str, prompt: str) -> Tuple[str, Optional[Dict[str, Any]]]:
        base_url = (self.ollama_url or "http://localhost:11434").rstrip("/")
        url = f"{base_url}/api/generate"
        payload = {
            "model": settings.LLM_MODEL or "llama3",
            "prompt": f"{system}\n\nUser: {prompt}\nAssistant:",
            "stream": False
        }
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            raw_text = data.get("response", "")
            return self._parse_response_and_action(raw_text)

    def _parse_response_and_action(self, text: str) -> Tuple[str, Optional[Dict[str, Any]]]:
        action_payload = None
        cleaned_text = text

        action_match = re.search(r"```action\s*(\{.*?\})\s*```", text, re.DOTALL)
        if action_match:
            try:
                action_payload = json.loads(action_match.group(1))
                cleaned_text = text.replace(action_match.group(0), "").strip()
            except Exception as e:
                logger.warning(f"Failed to parse action json: {e}")

        return cleaned_text, action_payload

llm_service = LLMProviderService()
