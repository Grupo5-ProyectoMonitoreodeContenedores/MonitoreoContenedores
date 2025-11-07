export interface LoginFormData {
    email: string;
      password: string;
  }

  export interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    role: 'citizen' | 'worker'; // Restringimos los valores posibles
    address: string;
    phone: string;
}