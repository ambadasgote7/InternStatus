import {
  getCompanyProfileService,
  updateCompanyProfileService,
  getCompanyMentorsService,
  updateCompanyMentorService,
  removeMentorFromCompanyService,
  getCompanyInternsService,
  assignMentorService,
  getInternProgressService,
  getCertificateService,
  issueCertificateService,
  getCompanyDashboardService,
  getCompanyListService, // ✅ ADD THIS
} from "./company.service.js";

export const getCompanyProfile = async (req, res, next) => {
  try {
    const profile = await getCompanyProfileService(req.user);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCompanyProfile = async (req, res, next) => {
  try {
    const profile = await updateCompanyProfileService(
      req.user,
      req.body,
      req.file,
    );

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

export const getCompanyMentors = async (req, res, next) => {
  try {
    const data = await getCompanyMentorsService(req.user);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCompanyMentor = async (req, res, next) => {
  try {
    const data = await updateCompanyMentorService(
      req.user,
      req.params.mentorId,
      req.body,
    );

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const removeMentorFromCompany = async (req, res, next) => {
  try {
    const data = await removeMentorFromCompanyService(
      req.user,
      req.params.mentorId,
    );

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getCompanyInterns = async (req, res) => {
  try {
    const data = await getCompanyInternsService(req.user);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const assignMentor = async (req, res) => {
  try {
    const data = await assignMentorService(
      req.user,
      req.params.id,
      req.body.mentorId,
    );

    res.json({
      success: true,
      message: "Mentor assigned",
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getInternProgressController = async (req, res) => {
  try {
    const companyId = req.user.referenceId; // ✅ correct
    const { id } = req.params;

    const data = await getInternProgressService(companyId, id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const issueCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await issueCertificateService({
      applicationId: id,
      file: req.file,
      user: req.user,
    });

    res.status(200).json({
      success: true,
      message: "Certificate issued successfully",
      data,
    });
  } catch (err) {
    let statusCode = 400;

    if (err.message.includes("Unauthorized")) statusCode = 403;
    else if (err.message.includes("not found")) statusCode = 404;
    else if (err.message.includes("already")) statusCode = 409;

    res.status(statusCode).json({
      success: false,
      message: err.message,
    });
  }
};

/*
  ================= GET CERTIFICATE =================
*/
export const getCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await getCertificateService({
      applicationId: id,
      user: req.user,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    const statusCode = err.message === "Forbidden" ? 403 : 400;

    res.status(statusCode).json({
      success: false,
      message: err.message,
    });
  }
};

export const getCompanyDashboard = async (req, res) => {
  try {
    const data = await getCompanyDashboardService(req.user);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getCompanyInternships = async (req, res) => {
  try {
    const data = await Internship.find({
      company: req.user.referenceId,
    });

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getCompanyApplications = async (req, res) => {
  try {
    const data = await Application.find({
      company: req.user.referenceId,
    })
      .populate("student")
      .populate("internship");

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};



export const getCompanyList = async (req, res, next) => {
  try {

    const companies = await getCompanyListService();

    res.status(200).json({
      success: true,
      data: companies
    });

  } catch (err) {
    next(err);
  }
};