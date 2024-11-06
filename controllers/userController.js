import User from "../models/userModel.js";

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "_id firstName lastName empID email");
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getDeptUserCount = async (req, res) => {
  const { deptName } = req.params;
  try {
    const count = await User.countDocuments({ deptName });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getUserData = async (req, res) => {
  const {id} = req.params;
  try {
    const userData = await User.findById(id);
    res.status(200).json({success: true, userData});
  } catch (error) {
    res.status(500).json({ success: false, error: error.message});
  }
}

export { getUsers, getDeptUserCount, getUserData };
