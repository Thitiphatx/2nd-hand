import type { Dayjs } from "dayjs";
import type { Gender } from "../auth/interface";

export interface IAddress {
  id: string;
  title?: string;
  receiverName: string;
  phone: string;
  address: string;
  subDistrict: string;
  district: string;
  province: string;
  zipcode: string;
  isDefault?: boolean;
}

export interface IProfileUpdate {
  name: string;
  phone: string;
  gender: Gender;
  birth: Dayjs;
}

export interface IPasswordUpdate {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
