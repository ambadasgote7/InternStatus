import { getStudentInternshipTrackService, getStudentDetailsService,
  getStudentInternshipStatsService,
  getStudentInternshipsService, 
  getStudentCreditsService} from "./student.service.js";

export const getStudentInternshipTrack = async (req, res) => {
  try {

    const data = await getStudentInternshipTrackService(
      req.user,
      req.params.applicationId
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


export const getStudentDetails = async (req, res) => {

  const data = await getStudentDetailsService(
    req.params.studentId
  );

  res.json({ data });
};



export const getStudentInternshipStats = async (req, res) => {

  const data = await getStudentInternshipStatsService(
    req.params.studentId
  );

  res.json({ data });
};



export const getStudentInternships = async (req, res) => {

  const data = await getStudentInternshipsService(
    req.params.studentId
  );

  res.json({ data });
};


export const getStudentCredits = async (req, res) => {
  try {

    const data = await getStudentCreditsService(req.user);

    res.status(200).json({
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