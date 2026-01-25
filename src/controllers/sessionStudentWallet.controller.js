import { registerSessionStudentWalletService } from "../services/sessionStudentWallet.services.js";

export async function createSessionStudentWallet(req, res) {
  try {
    const wallet = await registerSessionStudentWalletService(req.body);
    res.status(201).json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
