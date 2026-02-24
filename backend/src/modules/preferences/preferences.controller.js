// backend/src/modules/preferences/preferences.controller.js

import { success } from "../../utils/response.js";
import {
  getOrCreatePreferences,
  updatePreferences,
} from "./preferences.service.js";

export const getMyPreferences = async (req, res, next) => {
  try {
    const prefs = await getOrCreatePreferences(req.user.uid);
    return success(res, prefs, "Preferences loaded");
  } catch (err) {
    next(err);
  }
};

export const updateMyPreferences = async (req, res, next) => {
  try {
    const updated = await updatePreferences(req.user.uid, req.body);
    return success(res, updated, "Preferences updated");
  } catch (err) {
    next(err);
  }
};
