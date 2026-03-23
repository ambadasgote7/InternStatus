import {
  addCourseService,
  updateCourseService,
  deleteCourseService,
  getCoursesService,
  getCollegeProfileService,
  updateCollegeProfileService,
  getCollegeListService,
  getCollegeFacultyService,
  updateCollegeFacultyService,
  removeFacultyFromCollegeService
} from "./college.service.js";

export const getCourses = async (req, res) => {
  try {
    const data = await getCoursesService(req.user);
    res.json({ data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const addCourse = async (req, res) => {
  try {

    console.log("RAW BODY:", req.body); // 🔥 DEBUG

    const data = await addCourseService(req.user, req.body);

    res.status(201).json({
      message: "Course added",
      data
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {

    const data = await updateCourseService(
      req.user,
      req.params.courseId,
      req.body
    );

    res.json({
      success: true,
      message: "Course updated",
      data
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const data = await deleteCourseService(
      req.user,
      req.params.courseName
    );

    res.json({
      message: "Course deleted",
      data
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// ================= GET =================
export const getCollegeProfile = async (req, res, next) => {
  try {

    const data = await getCollegeProfileService(
      req.user,
      req.params.id
    );

    res.json({
      success: true,
      data
    });

  } catch (err) {
    next(err);
  }
};


export const getCollegeList = async (req, res, next) => {
  try {

    const colleges = await getCollegeListService();

    res.status(200).json({
      success: true,
      data: colleges
    });

  } catch (err) {
    next(err);
  }
};

// ================= UPDATE =================
export const updateCollegeProfile = async (req, res, next) => {
  try {

    const data = await updateCollegeProfileService(
      req.user,
      req.body,
      req.params.id
    );

    res.json({
      success: true,
      message: "College profile updated",
      data
    });

  } catch (err) {
    next(err);
  }
};

export const getCollegeFaculty = async (req, res, next) => {
  try {
    const faculty = await getCollegeFacultyService(req.user);

    res.status(200).json({
      success: true,
      data: faculty
    });
  } catch (err) {
    next(err);
  }
};

export const updateCollegeFaculty = async (req, res, next) => {
  try {
    const { facultyId } = req.params;

    const faculty = await updateCollegeFacultyService(
      req.user,
      facultyId,
      req.body
    );

    res.status(200).json({
      success: true,
      data: faculty
    });
  } catch (err) {
    next(err);
  }
};

export const removeFacultyFromCollege = async (req, res, next) => {
  try {
    const { facultyId } = req.params;

    const result = await removeFacultyFromCollegeService(
      req.user,
      facultyId
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};
