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


const generateDeptCode = (deptName) => {
  const timestamp = new Date().getTime().toString();
  const code = deptName.substring(0, 3).toUpperCase() + timestamp.slice(-5);
  return code;
};



const addDepartment = async (req, res) => {
  try {
    const { deptName, deptRemarks } = req.body;
    const deptCode = generateDeptCode(deptName);
    const newDept = new Department({
      deptName,
      deptRemarks,
      deptCode,
    });

    await newDept.save();
    return res.status(200).json({ success: true, data: newDept });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Server Error!" });
  }
};

export { addDepartment, getDepartment };
