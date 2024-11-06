import Department from "../models/departmentModel.js";

const getDepartment = async (req, res) => {
  try {
    const departments = await Department.find();
    return res.status(200).json({ success: true, departments });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "getDepartment server error!" });
  }
};

const getSpecificDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    const department = await Department.findById(id);
    
    return res.status(200).json({ success: true, department });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "getSpecificDepartment server error!" });
  }
};

const generateDeptCode = (deptName) => {
  const timestamp = new Date().getTime().toString();
  const code = deptName.substring(0, 3).toUpperCase() + timestamp.slice(-5);
  return code;
};

const addDepartment = async (req, res) => {
  try {
    const { deptName, deptRemarks, deptHead } = req.body;
    const deptCode = generateDeptCode(deptName);
    const newDept = new Department({
      deptName,
      deptHead,
      deptRemarks,
      deptCode,
    });

    await newDept.save();
    return res.status(200).json({ success: true, data: newDept });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Server Error!" });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedDepartment = await Department.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedDepartment) {
      return res
        .status(404)
        .json({ success: false, error: "Department not found!" });
    }

    return res
      .status(200)
      .json({ success: true, department: updatedDepartment });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export {
  addDepartment,
  getDepartment,
  updateDepartment,
  getSpecificDepartment,
};
