import Leave from "../models/Leave.js";
import User from "../models/User.js";

const addLeave = async (req, res) => {
  try {
    const { userId, leaveType, startDate, endDate, description } = req.body;

    const newLeave = new Leave({
      userId,
      leaveType,
      startDate,
      endDate,
      description,
    });

    await newLeave.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);

    return res
      .status(500)
      .json({ success: false, error: "Leave application server error" });
  }
};

const getLeaves = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await User.findOne({userId: id});

    const leaves = await Leave.find({userId: employee._id});
    return res.status(200).json({success: true, leaves})

  } catch (error) {
    console.log(error.message);

    return res
      .status(500)
      .json({ success: false, error: "Server error while fetching" });
  }
};

export { addLeave, getLeaves };
