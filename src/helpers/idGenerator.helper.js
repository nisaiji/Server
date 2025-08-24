// utils/idGeneratorNoCounter.js
import mongoose from "mongoose";

function toBase36(str, length = 6) {
  const num = parseInt(str.substring(0, 8), 16);
  return num.toString(36).toUpperCase().padStart(length, "0");
}

function getCheckChar(str) {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const sum = str.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return chars[sum % 36];
}

export function generateCustomId(type = "student") {
  const prefix = type === "student" ? "S" : "T";
  const year = new Date().getFullYear().toString().slice(-2);

  const objectId = new mongoose.Types.ObjectId().toString();
  const base36Part = toBase36(objectId, 6);

  const raw = `${prefix}${year}-${base36Part}`;
  const checkChar = getCheckChar(raw);

  return `${raw}-${checkChar}`;
}
