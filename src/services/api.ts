import axios from 'axios';

const API_BASE_URL = 'https://stock-predictor-api.fly.dev';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  full_name: string;
  password: string;
}

export interface UserStock {
  user_id: number;
  symbol: string;
  enabled: boolean;
  created_at: string;
}

export interface UserSettings {
  prediction_threshold: number;
  significant_movement_threshold: number;
  prediction_window: number;
  historical_days: number;
  training_timeframe: '1h' | '6h' | '1d' | '1wk' | '1mo';
  notification_days: string;
  notify_market_open: boolean;
  notify_midday: boolean;
  notify_market_close: boolean;
  timezone: string;
}

export interface TrainRequest {
  symbol: string;
  test_size?: number;
}

export interface UntrainRequest {
  symbols: string[];
}

export interface User {
  id: number;
  email: string;
  full_name: string;
}

export interface AuthHealthResponse {
  status: string;
  timestamp: string;
  user: User;
}

export interface TelegramStatus {
  is_connected: boolean;
  connected_at: string | null;
}

export interface GoogleToken {
  token: string;
}

export interface AvailableStock {
  id: number;
  symbol: string;
  name: string;
  enabled: boolean;
  created_at: string;
  updated_at: string | null;
}

// Auth endpoints
export const auth = {
  login: async (credentials: LoginCredentials) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    return api.post('/auth/token', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  register: (data: RegisterData) => 
    api.post('/auth/register', data),
  refreshToken: (refresh_token: string) => 
    api.post('/auth/refresh-token', { refresh_token }),
  getCurrentUser: () => 
    api.get<AuthHealthResponse>('/health/auth'),
  validateToken: () => 
    api.get<AuthHealthResponse>('/health/auth'),
  googleLogin: (token: string) =>
    api.post('/auth/google-login', { token }),
  deleteAccount: () =>
    api.delete('/users/me'),
};

// Stocks endpoints
export const stocks = {
  getStocks: () => 
    api.get<UserStock[]>('/users/stocks'),
  addStocks: (symbols: string[]) => 
    api.post<UserStock[]>('/users/stocks', { symbols }),
  removeStocks: (symbols: string[]) => 
    api.delete<UserStock[]>('/users/stocks', { data: { symbols } }),
  predict: (symbol: string, notify: boolean = true) => 
    api.post('/predict', { symbol, notify }),
  getAvailableStocks: (enabled?: boolean) => 
    api.get<AvailableStock[]>('/stocks', { params: { enabled } }),
};

// Settings endpoints
export const settings = {
  getSettings: () => 
    api.get<UserSettings>('/users/settings'),
  updateSettings: (data: Partial<UserSettings>) => 
    api.put<UserSettings>('/users/settings', data),
};

// Model training endpoints
export const model = {
  train: (data: TrainRequest) => 
    api.post('/train', data),
  untrain: (data: UntrainRequest) => 
    api.post('/untrain', data),
};

export const telegram = {
  getStatus: () => 
    api.get<TelegramStatus>('/telegram-status'),
  connect: (connection_token: string) => 
    api.post('/connect-telegram', { connection_token }),
};

export default api; 