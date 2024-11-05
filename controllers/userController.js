import User from '../models/userModel.js';

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '_id firstName lastName empID');
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export { getUsers };
