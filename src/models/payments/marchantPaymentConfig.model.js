import mongoose from "mongoose";
 
const marchantPaymentConfigSchema = mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin',
    required: true
  },
  zohoClientId: {
    type: String,
    required: true
  },
  zohoClientSecret: {
    type: String,
    required: true
  },
  zohoAccountId: {
    type: String,
    required: true
  },
  zohoAccessToken: {
    type: String,
  },
  zohoRefreshToken: {
    type: String,
  },
  accessTokenExpiresAt: {
    type: Date,
  },
  accessTokenScopes: {
    type: [String]
  }
},
{
  timestamps:true
}
);

const marchantPaymentConfigModel = mongoose.model("marchantPaymentConfig", marchantPaymentConfigSchema);
export default marchantPaymentConfigModel;
