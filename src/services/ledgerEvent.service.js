import ledgerEventModel from "../models/ledgerEvent.model.js";

export async function getLedgerEventsPipelineService(pipeline) {
  try {
    const ledgerEvents = await ledgerEventModel.aggregate(pipeline).exec();
    return ledgerEvents;
  } catch (error) {
    throw error;
  }
}

export async function getLedgerEventService(filter, projection = {}) {
  try {
    const ledgerEvent = await ledgerEventModel
      .findOne(filter)
      .select(projection).lean();
    return ledgerEvent;
  } catch (error) {
    throw error;
  }
}

export async function getLedgerEventsService(filter, projection = {}) {
  try {
    const ledgerEvents = await ledgerEventModel.find(filter).select(projection);
    return ledgerEvents;
  } catch (error) {
    throw error;
  }
}

export async function registerLedgerEventService(paramObj) {
  try {
    const event = await ledgerEventModel.create(paramObj);
    return event;
  } catch (error) {
    throw error;
  }
}

export async function updateLedgerEventService(filter, update) {
  try {
    const event = await ledgerEventModel.updateOne(filter, update);
    return event;
  } catch (error) {
    throw error;
  }
}

export async function getLedgerEventsCountService(filter) {
  try {
    const events = await ledgerEventModel.countDocuments(filter);
    return events;
  } catch (error) {
    throw error;
  }
}