import User from "../models/userModel.js";
import Registration from "../models/registrationsModel.js";

const getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ interacted: false })
      .populate("user", "firstName lastName empID email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, registrations });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while fetching registrations",
    });
  }
};

const activateAccount = async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, deptName, email, active, empID, role } =
    req.body;

  try {
    // Update the user details
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, deptName, email, active, empID, role },
      { new: true }
    );

    // Set interacted to true in the registration model
    const updatedRegistration = await Registration.findOneAndUpdate(
      { user: userId },
      { interacted: true },
      { new: true }
    );

    return res
      .status(200)
      .json({ success: true, updatedUser, updatedRegistration });
  } catch (error) {
    console.error("Error updating user and setting interacted:", error);
    return res
      .status(500)
      .json({
        success: false,
        error:
          "Server error while updating user details and setting interacted",
      });
  }
};

export { getRegistrations, activateAccount };
