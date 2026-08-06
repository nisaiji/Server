import zohoAuthSessionModel from "../../models/payments/zohoAuthSession.model.js";

export async function getZohoAuthSessionService(schoolId) {
  return zohoAuthSessionModel.findOne({ schoolId });
}

export async function updateZohoAuthSessionService(schoolId, update) {
  return zohoAuthSessionModel.findOneAndUpdate({ schoolId }, update, {
    upsert: true,
    returnDocument: "after"
  });
}
