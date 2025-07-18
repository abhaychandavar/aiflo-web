// types/auth.ts
export interface LoginRequest {
    email: string
    password: string
  }
  
  export interface LoginResponse {
    access_token: string
    user: {
      id: string
      email: string
      name?: string,
      imageURL?: string,
      createdAt: string,
      updatedAt: string
    }
  }
  