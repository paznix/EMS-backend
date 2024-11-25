import User from "../models/userModel.js";
import bcrypt from "bcrypt";

const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};

    const users = await User.find(
      query,
      "_id firstName lastName empID email deptName role"
    );

    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


const getEmpUsers = async (req, res) => {
  try {
    const users = await User.find(
      { role: { $in: ["emp", "admin"] } },
      "_id firstName lastName empID email deptName role active"
    );
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
  const { id } = req.params;
  try {
    const userData = await User.findById(id);
    res.status(200).json({ success: true, userData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


const addEmployee = async (req, res) => {
  try {
    const { firstName, lastName, deptName, email, password, empID, isAdmin } =
      req.body;
    const userExistsByEmail = await User.findOne({ email });
    const userExistsByEmpID = await User.findOne({ empID });

    if (userExistsByEmail || userExistsByEmpID) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      empID,
      deptName,
      email,
      active: true,
      password: hashedPassword,
      role: isAdmin ? "admin" : "emp",
    });
    await user.save();
    return res
      .status(201)
      .json({ success: true, message: "Employee added successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const editEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, deptName, email, role, active, empID } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found!" });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.deptName = deptName || user.deptName;
    user.email = email || user.email;
    user.empID = empID || user.empID;
    user.role = role;
    user.active = active;

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Employee updated successfully!" });
  } catch (error) {
    console.error("Error updating employee:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const approveAdminAccess = async (req, res) => {
  const { from } = req.params;
  const { isAdmin } = req.body;
  try {
    const user = await User.findById(from);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.role = isAdmin ? "admin" : "emp";
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User role updated to ${isAdmin ? "admin" : "employee"}`,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { email } = req.body; 
    const { id } = req.params;

    let updateData = { email, updatedAt: new Date() };
  
    if (req.file) {
      updateData.profileImage = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found!",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User updated successfully!",
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      message: "Internal server error!",
      success: false,
      error: error.message,
    });
  }
};

export default updateUser;

export {
  getUsers,
  getEmpUsers,
  getDeptUserCount,
  getUserData,
  addEmployee,
  deleteUser,
  editEmployee,
  approveAdminAccess,
  updateUser,
};
