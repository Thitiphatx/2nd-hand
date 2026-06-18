import type { Dayjs } from "dayjs";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type Role = "USER" | "ADMIN"

export interface ILoginValues {
  email: string;
  password?: string;
}

export interface IFormRegister {
  email: string;
  name: string;
  password: string;
  phone: string;
  gender: Gender;
  birth: Dayjs;
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  token: string;
  phone?: string;
  gender?: Gender;
  birth?: string;
  enabled?: boolean;
}