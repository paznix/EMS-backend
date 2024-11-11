import mongoose from 'mongoose';
import User from './userModel.js';

const adminRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true, 
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending', 
    },
    dateRequested: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      default: null, 
    },
    approvalDate: {
      type: Date,
      default: null, 
    },
  },
  {
    timestamps: true, 
  }
);


adminRequestSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
});

const AdminRequest = mongoose.model('AdminRequest', adminRequestSchema);

export default AdminRequest;
