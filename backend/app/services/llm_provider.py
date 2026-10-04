import os
import json
import logging
from typing import Optional, Dict, Any, Tuple
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

class LLMProviderService:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
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

    def get_status(self) -> Dict[str, Any]:
        provider = self.get_active_provider()
        return {
            "configured": provider is not None,
            "provider": provider,
            "model": settings.LLM_MODEL or (
                "gemini-1.5-flash" if provider == "gemini" else
                "gpt-4o-mini" if provider == "openai" else
                "claude-3-5-haiku" if provider == "anthropic" else
                "llama3" if provider == "ollama" else "None"
            ),
            "instructions": "Set GEMINI_API_KEY or OPENAI_API_KEY in environment or .env file to enable live neural LLM reasoning." if not provider else "Connected and operational."
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
                "No live LLM provider API key (`GEMINI_API_KEY` or `OPENAI_API_KEY`) is currently configured in your environment.\n\n"
                "To enable real generative AI reasoning, cognitive synthesis, and autonomous task structuring:\n"
                "1. Add `GEMINI_API_KEY=your_key` or `OPENAI_API_KEY=your_key` to your `.env` file.\n"
                "2. Restart the server.\n\n"
                "In the meantime, your Digital Twin state, goal matrix, memory search, and custom avatar remain fully functional.",
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
            logger.error(f"Error invoking LLM provider {provider}: {e}")
            return (
                f"⚠️ Error communicating with LLM provider ({provider}): {str(e)}.\n"
                "Please verify your API key and network connectivity.",
                None
            )

        return ("No response generated from provider.", None)

    async def _call_gemini(self, system: str, prompt: str) -> Tuple[str, Optional[Dict[str, Any]]]:
        model = settings.LLM_MODEL or "gemini-1.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.gemini_key}"
        
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"System Directive:\n{system}\n\nUser Query:\n{prompt}"}]}
            ],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 1024
            }
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            return self._parse_response_and_action(raw_text)

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
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["choices"][0]["message"]["content"]
            return self._parse_response_and_action(raw_text)

    async def _call_anthropic(self, system: str, prompt: str) -> Tuple[str, Optional[Dict[str, Any]]]:
        model = settings.LLM_MODEL or "claude-3-5-haiku-20241022"
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.anthropic_key,
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
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["content"][0]["text"]
            return self._parse_response_and_action(raw_text)

    async def _call_ollama(self, system: str, prompt: str) -> Tuple[str, Optional[Dict[str, Any]]]:
        base_url = self.ollama_url.rstrip("/")
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
        import re
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
