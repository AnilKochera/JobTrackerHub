export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends UserCredentials {
  name: string;
  securityQuestion: string;
  securityAnswer: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}