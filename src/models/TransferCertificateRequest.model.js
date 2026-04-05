import mongoose from "mongoose";

const transferCertificateRequestSchema = new mongoose.Schema({
  // Student Information
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student',
    required: true
  },
  sessionStudent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sessionStudent'
  },
  
  // Parent/Guardian Information
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'parent',
    required: true
  },
  schoolParent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'schoolParent'
  },
  
  // School Information
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin',
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'session',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'class',
    required: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'section',
    required: true
  },
  
  // Request Details
  requestType: {
    type: String,
    enum: ['transfer', 'migration', 'leaving'],
    required: true,
    default: 'transfer'
  },
  reason: {
    type: String,
    enum: [
      'parentTransfer', 
      'familyRelocation', 
      'betterOpportunity', 
      'financial', 
      'academic', 
      'disciplinary',
      'medical',
      'other'
    ]
  },
  reasonDescription: {
    type: String,
    maxlength: 500
  },
  
  // Transfer Details
  lastAttendanceDate: {
    type: Date,
    required: true
  },
  requestedDate: {
    type: Date,
    default: Date.now
  },
  expectedLeavingDate: {
    type: Date
  },
  
  // New School Information (if transferring)
  newSchoolName: {
    type: String
  },
  newSchoolAddress: {
    type: String
  },
  newSchoolBoard: {
    type: String
  },
  newSchoolAffiliationNo: {
    type: String
  },
  
  // Conduct and Character
  conduct: {
    type: String,
    enum: ['excellent', 'verygood', 'good', 'satisfactory', 'needsImprovement'],
    default: 'good'
  },
  character: {
    type: String,
    enum: ['excellent', 'verygood', 'good', 'satisfactory', 'needsImprovement'],
    default: 'good'
  },
  clearanceStatus: [{
    name: {
      type: String,
      required: true
    },
    status: {
      type: Boolean,
      default: false
    }
  }],

  // Request Status and Workflow
  status: {
    type: String,
    enum: [
      'submitted',
      'approvedByParent',
      'rejectedByParent',
      'certificateIssued'
    ],
    default: 'submitted'
  },
  
  // Certificate Details
  certificateNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  certificateGeneratedDate: {
    type: Date
  },
  certificateIssuedDate: {
    type: Date
  },
  certificateIssuedTo: {
    type: String
  },

  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin'
  },
  rejectedDate: {
    type: Date
  },
  
  // Communication
  parentNotified: {
    type: Boolean,
    default: false
  },
  parentApproved: {
    type: Boolean,
    default: false
  },
  notificationDate: {
    type: Date
  },  
}, {
  timestamps: true
});

// Pre-save middleware to generate certificate number
transferCertificateRequestSchema.pre('save', async function(next) {
  if (this.status === 'certificateGenerated' && !this.certificateNumber) {
    const year = new Date().getFullYear();
    let tcNumber;
    let isUnique = false;
    
    // Generate unique random TC number
    while (!isUnique) {
      const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
      tcNumber = `TC-${year}-${randomString}`;
      
      // Check if this TC number already exists
      const existingTC = await this.constructor.findOne({
        certificateNumber: tcNumber
      });
      
      if (!existingTC) {
        isUnique = true;
      }
    }
    
    this.certificateNumber = tcNumber;
  }
  next();
});


const TransferCertificateRequestModel = mongoose.model('TransferCertificateRequest', transferCertificateRequestSchema);

export default TransferCertificateRequestModel;
