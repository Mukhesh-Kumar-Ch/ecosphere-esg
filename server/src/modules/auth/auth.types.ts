export type AuthUser = {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  role: {
    id: string;
    name: string;
    description: string | null;
  };
  department: {
    id: string;
    name: string;
    code: string;
    status: string;
  };
};

export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type RefreshInput = {
  refreshToken: string;
};
