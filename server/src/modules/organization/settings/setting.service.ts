import { HttpError } from "../../../utils/http-error.js";
import { findSettingByKey, findSettings, upsertSetting } from "./setting.repository.js";
import type { SettingUpdateInput } from "./setting.types.js";

type UpdatedSetting = Awaited<ReturnType<typeof upsertSetting>>;

export async function listSettings() {
  return findSettings();
}

export async function updateSettingsRecord(updatedById: string, items: SettingUpdateInput[]) {
  if (!items.length) {
    throw new HttpError(400, "At least one setting is required.", "INVALID_SETTINGS_PAYLOAD");
  }

  const results: UpdatedSetting[] = [];

  for (const item of items) {
    const key = item.key.trim();

    if (!key) {
      throw new HttpError(400, "Setting key is required.", "INVALID_SETTING_KEY");
    }

    if (!item.value.toString().trim()) {
      throw new HttpError(400, "Setting value is required.", "INVALID_SETTING_VALUE");
    }

    const updatedSetting = await upsertSetting({
      key,
      value: String(item.value),
      description: item.description?.trim() ?? null,
      updatedById,
    });

    results.push(updatedSetting);
  }

  return results;
}

export async function getSettingByKeyOrFail(key: string) {
  const setting = await findSettingByKey(key);

  if (!setting) {
    throw new HttpError(404, "Setting not found.", "SETTING_NOT_FOUND");
  }

  return setting;
}