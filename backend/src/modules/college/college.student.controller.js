import {
  getCollegeStudentsService,
  updateCollegeStudentService,
  removeStudentFromCollegeService,
   searchStudentService,
  getStudentReportsService,
  assignCreditsService
} from "./college.student.service.js";

export const getCollegeStudents = async (req, res) => {

  const data = await getCollegeStudentsService(req.user);

  res.json({ data });
};



export const updateCollegeStudent = async (req, res) => {

  const data = await updateCollegeStudentService(
    req.user,
    req.params.studentId,
    req.body
  );

  res.json({
    message: "Student updated",
    data
  });
};



export const removeStudentFromCollege = async (req, res) => {

  await removeStudentFromCollegeService(
    req.user,
    req.params.studentId
  );

  res.json({
    message: "Student removed from college"
  });
};

/*
  ================= SEARCH =================
*/
export const searchStudent = async (req, res) => {
  try {

    const { query } = req.query;

    const data = await searchStudentService(query, req.user);

    res.json({
      success: true,
      data
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


/*
  ================= GET REPORTS =================
*/
export const getStudentReports = async (req, res) => {
  try {

    const { studentId } = req.params;

    const data = await getStudentReportsService(
  req.params.studentId,
  req.user   // 🔥 THIS WAS MISSING
);

    res.json({
      success: true,
      data
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


/*
  ================= ASSIGN CREDITS =================
*/
export const assignCredits = async (req, res) => {
  try {

    const { reportId } = req.params;
    const { facultyScore, remarks } = req.body;

    const data = await assignCreditsService({
      reportId,
      facultyScore,
      remarks,
      user: req.user
    });

    res.json({
      success: true,
      message: "Credits assigned successfully",
      data
    });

  } catch (err) {

    const statusCode =
      err.message.includes("Unauthorized") ? 403 :
      err.message.includes("not found") ? 404 :
      400;

    res.status(statusCode).json({
      success: false,
      message: err.message
    });
  }
};