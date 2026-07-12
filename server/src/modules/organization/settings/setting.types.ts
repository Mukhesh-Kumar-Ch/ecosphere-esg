export interface SettingInput {
  key: string;
  value: string;
  description?: string | null;
}

export interface SettingUpdateInput {
  key: string;
  value: string | number | boolean;
  description?: string | null;
}