import type {
  CatalogItem,
  BackgroundPreset,
  SampleImage,
  TryOnResponse,
  BiometricAnalysis,
  SavedLook,
  SelectedLayerItem,
  DigitalTwin,
  UserProfile,
  Goal,
  Task,
  Habit,
  MemoryItem,
  Insight,
  FocusSession,
  AIAction,
  ChatResponse,
  DigitalTwinGraph,
  RecommendationItem,
  AuthResponse,
  OnboardingData,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const TOKEN_KEY = 'pratibimb_auth_token';

function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // ==========================================
  // AUTHENTICATION & SESSION
  // ==========================================
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string | null) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  async signup(data: { email: string; password: string; name: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    const authData: AuthResponse = await res.json();
    this.setToken(authData.token);
    return authData;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Invalid email or password' }));
      throw new Error(err.detail || 'Invalid email or password');
    }
    const authData: AuthResponse = await res.json();
    this.setToken(authData.token);
    return authData;
  },

  async getMe(): Promise<{ user_id: string; email: string; name: string; has_onboarded: boolean; twin: DigitalTwin }> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Session invalid or expired');
    return res.json();
  },

  async submitOnboarding(payload: OnboardingData): Promise<DigitalTwin> {
    const res = await fetch(`${API_BASE_URL}/auth/onboarding`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit onboarding');
    return res.json();
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).catch(() => {});
    this.setToken(null);
  },

  // ==========================================
  // DIGITAL TWIN CORE APIS
  // ==========================================
  async getTwin(): Promise<DigitalTwin> {
    const res = await fetch(`${API_BASE_URL}/twin`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch Digital Twin state');
    return res.json();
  },

  async updateProfile(profile: UserProfile): Promise<DigitalTwin> {
    const res = await fetch(`${API_BASE_URL}/twin/profile`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Failed to update Twin profile');
    return res.json();
  },

  async getTwinGraph(): Promise<DigitalTwinGraph> {
    const res = await fetch(`${API_BASE_URL}/twin/graph`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch Digital Twin graph');
    return res.json();
  },

  async resetDemo(): Promise<DigitalTwin> {
    const res = await fetch(`${API_BASE_URL}/twin/reset-demo`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to reset demo state');
    return res.json();
  },

  async updateEnergy(energy_level: number): Promise<{ success: boolean; energy_level: number }> {
    const res = await fetch(`${API_BASE_URL}/twin/energy`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ energy_level }),
    });
    if (!res.ok) throw new Error('Failed to update energy level');
    return res.json();
  },

  async updateAvatarConfig(avatar_config: any): Promise<{ success: boolean; avatar_config: any }> {
    const res = await fetch(`${API_BASE_URL}/twin/avatar`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ avatar_config }),
    });
    if (!res.ok) throw new Error('Failed to update avatar configuration');
    return res.json();
  },

  // ==========================================
  // AI CONVERSATION & ACTIONS
  // ==========================================
  async getAIStatus(): Promise<{ configured: boolean; provider: string | null; model: string; instructions: string }> {
    const res = await fetch(`${API_BASE_URL}/ai/status`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch AI status');
    return res.json();
  },

  async sendChatMessage(message: string): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('AI Chat request failed');
    return res.json();
  },

  async executeAIAction(action: AIAction): Promise<{ success: boolean; message: string; action_id: string }> {
    const res = await fetch(`${API_BASE_URL}/ai/execute-action`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(action),
    });
    if (!res.ok) throw new Error('Failed to execute AI Action');
    return res.json();
  },

  async getRecommendations(): Promise<{ energy_level: number; recommendations: RecommendationItem[]; count: number }> {
    const res = await fetch(`${API_BASE_URL}/ai/recommendations`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  // ==========================================
  // GOALS, TASKS & HABITS
  // ==========================================
  async getTasks(): Promise<Task[]> {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async createTask(task: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        id: `task-${Date.now()}`,
        status: 'todo',
        priority: 'medium',
        category: 'General',
        estimated_minutes: 45,
        ...task,
      }),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  async toggleTask(taskId: string): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle task');
    return res.json();
  },

  async deleteTask(taskId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  },

  async getGoals(): Promise<Goal[]> {
    const res = await fetch(`${API_BASE_URL}/goals`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch goals');
    return res.json();
  },

  async createGoal(goal: Partial<Goal>): Promise<Goal> {
    const res = await fetch(`${API_BASE_URL}/goals`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        id: `goal-${Date.now()}`,
        priority: 'high',
        progress: 0,
        milestones: [],
        linked_task_ids: [],
        ...goal,
      }),
    });
    if (!res.ok) throw new Error('Failed to create goal');
    return res.json();
  },

  async updateGoalProgress(goalId: string, progress: number): Promise<Goal> {
    const res = await fetch(`${API_BASE_URL}/goals/${goalId}/progress`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ progress }),
    });
    if (!res.ok) throw new Error('Failed to update goal progress');
    return res.json();
  },

  async toggleGoalMilestone(goalId: string, milestoneId: string): Promise<Goal> {
    const res = await fetch(`${API_BASE_URL}/goals/${goalId}/milestones/${milestoneId}/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle goal milestone');
    return res.json();
  },

  async getHabits(): Promise<Habit[]> {
    const res = await fetch(`${API_BASE_URL}/habits`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch habits');
    return res.json();
  },

  async createHabit(habit: Partial<Habit>): Promise<Habit> {
    const res = await fetch(`${API_BASE_URL}/habits`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        id: `h-${Date.now()}`,
        frequency: 'Daily',
        streak_count: 0,
        target_days: 7,
        completed_today: false,
        ...habit,
      }),
    });
    if (!res.ok) throw new Error('Failed to create habit');
    return res.json();
  },

  async toggleHabit(habitId: string): Promise<Habit> {
    const res = await fetch(`${API_BASE_URL}/habits/${habitId}/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle habit');
    return res.json();
  },

  async deleteHabit(habitId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/habits/${habitId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  },

  async logFocusSession(session: Partial<FocusSession>): Promise<FocusSession> {
    const res = await fetch(`${API_BASE_URL}/focus/log`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        id: `fs-${Date.now()}`,
        duration_minutes: 25,
        energy_before: 8,
        energy_after: 8,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...session,
      }),
    });
    if (!res.ok) throw new Error('Failed to log focus session');
    return res.json();
  },

  // ==========================================
  // SEMANTIC MEMORY VAULT & INSIGHTS
  // ==========================================
  async listMemories(): Promise<MemoryItem[]> {
    const res = await fetch(`${API_BASE_URL}/memory/list`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list memories');
    return res.json();
  },

  async searchMemory(query: string): Promise<{ query: string; results: MemoryItem[]; count: number }> {
    const res = await fetch(`${API_BASE_URL}/memory/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to search memory vault');
    return res.json();
  },

  async addMemory(memory: Partial<MemoryItem>): Promise<MemoryItem> {
    const res = await fetch(`${API_BASE_URL}/memory/add`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        id: `mem-${Date.now()}`,
        type: 'episodic',
        importance: 5,
        tags: [],
        source: 'user_interaction',
        created_at: 'Just now',
        ...memory,
      }),
    });
    if (!res.ok) throw new Error('Failed to add memory');
    return res.json();
  },

  async deleteMemory(memoryId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/memory/${memoryId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  },

  async getInsights(): Promise<Insight[]> {
    const res = await fetch(`${API_BASE_URL}/insights`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch insights');
    return res.json();
  },

  // ==========================================
  // VIRTUAL MIRROR / TRY-ON SUITE
  // ==========================================
  async getCatalogItems(category?: string): Promise<CatalogItem[]> {
    const url = category ? `${API_BASE_URL}/catalog/items?category=${category}` : `${API_BASE_URL}/catalog/items`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch catalog items');
    return res.json();
  },

  async getBackgrounds(): Promise<BackgroundPreset[]> {
    const res = await fetch(`${API_BASE_URL}/catalog/backgrounds`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch backgrounds');
    return res.json();
  },

  async getSamples(): Promise<SampleImage[]> {
    const res = await fetch(`${API_BASE_URL}/catalog/samples`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch samples');
    return res.json();
  },

  async uploadCustomItem(formData: FormData): Promise<CatalogItem> {
    const res = await fetch(`${API_BASE_URL}/catalog/upload-item`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload custom garment');
    return res.json();
  },

  async processTryOn(params: {
    user_image_base64?: string;
    sample_id?: string;
    items?: SelectedLayerItem[];
    glasses_id?: string;
    garment_id?: string;
    background_id?: string;
    custom_garment_base64?: string;
    custom_glasses_base64?: string;
    adjust_scale?: number;
    adjust_offset_x?: number;
    adjust_offset_y?: number;
    draw_landmarks?: boolean;
  }): Promise<TryOnResponse> {
    const res = await fetch(`${API_BASE_URL}/tryon/process`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        adjust_scale: 1.0,
        adjust_offset_x: 0.0,
        adjust_offset_y: 0.0,
        draw_landmarks: false,
        ...params,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Try-on processing failed' }));
      throw new Error(err.detail || 'Try-on processing failed');
    }
    return res.json();
  },

  async analyzeBiometrics(params: { user_image_base64?: string; sample_id?: string }): Promise<BiometricAnalysis> {
    const res = await fetch(`${API_BASE_URL}/analysis/biometrics`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Biometric analysis failed');
    return res.json();
  },

  async getSavedLooks(): Promise<SavedLook[]> {
    const res = await fetch(`${API_BASE_URL}/lookbook/list`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch lookbook');
    return res.json();
  },

  async saveLook(look: Partial<SavedLook>): Promise<SavedLook> {
    const res = await fetch(`${API_BASE_URL}/lookbook/save`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(look),
    });
    if (!res.ok) throw new Error('Failed to save look');
    return res.json();
  },

  async deleteLook(lookId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/lookbook/delete/${lookId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  },

  getWebSocketUrl(): string {
    const wsBase = API_BASE_URL.replace(/^http/, 'ws');
    return `${wsBase}/stream/ws`;
  }
};
