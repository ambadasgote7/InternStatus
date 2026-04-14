import mongoose from "mongoose";
import Application from "../../models/Application.js";
import Internship from "../../models/Internship.js";
import StudentProfile from "../../models/StudentProfile.js";
import User from "../../models/User.js";
import InternshipReport from "../../models/InternshipReport.js";

/*
PRODUCTION APPLY
*/
export const applyInternshipService = async (user, internshipId) => {

  if (user.role !== "student") {
    throw new Error("Only students can apply");
  }

  if (!mongoose.Types.ObjectId.isValid(internshipId)) {
    throw new Error("Invalid internship id");
  }

  const studentId = user.referenceId;

  const session = await mongoose.startSession();

  try {

    session.startTransaction();

    /*
      LOAD INTERNSHIP
    */
    const internship = await Internship.findById(internshipId)
      .session(session);

    if (!internship) throw new Error("Internship not found");

    if (internship.status !== "open") {
      throw new Error("Internship closed");
    }

    /*
      DEADLINE CHECK
    */
    if (new Date(internship.applicationDeadline) < new Date()) {
      internship.status = "closed";
      await internship.save({ session });

      throw new Error("Deadline passed");
    }

    /*
      CAPACITY CHECK USING REAL COUNT
    */
    const totalApplications = await Application.countDocuments({
      internship: internshipId,
      status: { $ne: "withdrawn" }
    }).session(session);

    if (
      internship.maxApplicants &&
      totalApplications >= internship.maxApplicants
    ) {
      internship.status = "closed";
      await internship.save({ session });

      throw new Error("Application limit reached");
    }

    /*
      DUPLICATE CHECK
    */
    const existing = await Application.findOne({
      student: studentId,
      internship: internshipId
    }).session(session);

    if (existing) {
      throw new Error("Already applied");
    }

    /*
      LOAD STUDENT PROFILE
    */
    const studentProfile = await StudentProfile.findById(studentId)
      .populate("college")
      .session(session);

    if (!studentProfile) {
      throw new Error("Student profile not found");
    }

    /*
      REQUIRE RESUME
    */
    if (!studentProfile.resumeUrl) {
      throw new Error("Upload resume before applying");
    }

    const userDoc = await User.findById(user._id)
      .session(session);

    /*
      CREATE APPLICATION WITH SNAPSHOT
    */
    const application = await Application.create(
      [
        {
          student: studentId,
          internship: internshipId,
          company: internship.company,

          resumeSnapshot: studentProfile.resumeUrl,
          skillsSnapshot: studentProfile.skills || [],

          studentSnapshot: {
            fullName: studentProfile.fullName,
            phoneNo: studentProfile.phoneNo,
            email: userDoc.email,
            collegeName: studentProfile.college?.name,
            courseName: studentProfile.courseName,
            specialization: studentProfile.specialization
          },

          status: "applied"
        }
      ],
      { session }
    );

    /*
      OPTIONAL COUNTER UPDATE (IF YOU KEEP FIELD)
    */
    if (typeof internship.currentApplicants === "number") {
      internship.currentApplicants += 1;
    }

    /*
      AUTO CLOSE AFTER APPLY IF LIMIT REACHED
    */
    const newTotal = totalApplications + 1;

    if (
      internship.maxApplicants &&
      newTotal >= internship.maxApplicants
    ) {
      internship.status = "closed";
    }

    await internship.save({ session });

    await session.commitTransaction();

    return application[0];

  } catch (err) {

    await session.abortTransaction();
    throw err;

  } finally {

    session.endSession();

  }
};

export const getMyApplicationsService = async (user) => {
  if (user.role !== "student") {
    throw new Error("Only students allowed");
  }

  const studentId = user.referenceId;

  const applications = await Application.find({
    student: studentId
  })
    .populate({
      path: "internship",
      populate: {
        path: "company"
      }
    })
    .populate("mentor")
    .populate("faculty")
    .sort({ createdAt: -1 })
    .lean();

  return applications;
};

export const getApplicationsForInternshipService = async (
  user,
  internshipId
) => {
  if (user.role !== "company") {
    throw new Error("Only company allowed");
  }

  const companyId = user.referenceId;

  /*
    VERIFY OWNERSHIP
  */
  const internship = await Internship.findOne({
    _id: internshipId,
    company: companyId
  });

  if (!internship) {
    throw new Error("Internship not found");
  }

  const applications = await Application.find({
    internship: internshipId
  })
    .populate({
  path: "student",
  populate: [
    {
      path: "college",
      select: "name"
    }
  ],
  select:
    "fullName phoneNo resume skills courseName specialization courseStartYear courseEndYear college"
})
.populate({
  path: "faculty",
  select: "fullName"
})
.populate({
  path: "mentor",
  select: "fullName"
})
    .sort({ createdAt: -1 })
    .lean();

  return applications;

};

export const updateApplicationStatusService = async (
  user,
  applicationId,
  newStatus
) => {

  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    throw new Error("Invalid application id");
  }

  const session = await mongoose.startSession();

  try {

    session.startTransaction();

    const application = await Application.findById(applicationId)
      .session(session);

    if (!application) throw new Error("Application not found");

    const currentStatus = application.status;

    /*
      TERMINAL LOCK
    */
    const terminalStates = [
      "completed",
      "terminated",
      "rejected",
      "withdrawn"
    ];

    if (terminalStates.includes(currentStatus)) {
      throw new Error(`Cannot change after ${currentStatus}`);
    }

    /*
      ROLE BASED PERMISSIONS
    */

    let allowedStatuses = [];
    let transitions = {};

    /*
      COMPANY CONTROL (HIRING)
    */
    if (user.role === "company") {

      allowedStatuses = ["shortlisted", "selected", "rejected"];

      transitions = {
        applied: ["shortlisted", "rejected"],
        shortlisted: ["selected", "rejected"],
        selected: []
      };

      const internship = await Internship.findOne({
        _id: application.internship,
        company: user.referenceId
      }).session(session);

      if (!internship) throw new Error("Unauthorized");

      /*
        POSITION CONTROL
      */
      if (newStatus === "selected") {

        const selectedCount = await Application.countDocuments({
          internship: internship._id,
          status: "selected"
        }).session(session);

        if (selectedCount >= internship.positions) {
          throw new Error("All positions filled");
        }

        application.selectionDate = new Date();
      }

    }

    /*
      MENTOR CONTROL (EXECUTION)
    */
    else if (user.role === "mentor") {

      allowedStatuses = ["ongoing", "completed", "terminated"];

      transitions = {
        offer_accepted: ["ongoing"],
        ongoing: ["completed", "terminated"]
      };

      if (!application.mentor) {
        throw new Error("Mentor not assigned");
      }

      if (application.mentor.toString() !== user.referenceId.toString()) {
        throw new Error("Unauthorized mentor");
      }

      if (newStatus === "ongoing") {
        application.internshipStartDate = new Date();
      }

      if (newStatus === "completed") {
        application.internshipEndDate = new Date();
      }

    }

    else {
      throw new Error("Unauthorized role");
    }

    /*
      STATUS VALIDATION
    */

    if (!allowedStatuses.includes(newStatus)) {
      throw new Error("Invalid status");
    }

    if (
      !transitions[currentStatus] ||
      !transitions[currentStatus].includes(newStatus)
    ) {
      throw new Error(
        `Invalid transition from ${currentStatus} to ${newStatus}`
      );
    }

    application.status = newStatus;

    await application.save({ session });

    await session.commitTransaction();

    return application;

  } catch (err) {

    await session.abortTransaction();
    throw err;

  } finally {

    session.endSession();

  }

};


export const offerDecisionService = async (
  user,
  applicationId,
  decision // "accept" | "decline"
) => {

  // 🔒 Role check
  if (user.role !== "student") {
    throw new Error("Only student allowed");
  }

  // 🆔 Validate ID
  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    throw new Error("Invalid application id");
  }

  // 🔍 Fetch application
  const application = await Application.findOne({
    _id: applicationId,
    student: user.referenceId
  });

  if (!application) {
    throw new Error("Application not found");
  }

  // 🚫 Must be selected
  if (application.status !== "selected") {
    throw new Error("Offer not available");
  }

  // 🚫 Offer letter must exist
  if (!application.offerLetterUrl) {
    throw new Error("Offer letter not issued yet");
  }

  // 🚫 Prevent double action
  if (application.offerAcceptedAt || application.offerRejectedAt) {
    throw new Error("Offer already responded");
  }

  // 🚫 Validate decision
  if (!["accept", "decline"].includes(decision)) {
    throw new Error("Invalid decision");
  }

  /*
    ✅ ACCEPT
  */
  if (decision === "accept") {
    application.status = "offer_accepted";
    application.offerAcceptedAt = new Date();
  }

  /*
    ❌ DECLINE
  */
 if (decision === "decline") {
  application.status = "offer_rejected";
  application.offerRejectedAt = new Date();
}

  await application.save();

  return application;
};

export const withdrawApplicationService = async (
  user,
  applicationId
) => {

  if (user.role !== "student") {
    throw new Error("Only students allowed");
  }

  const session = await mongoose.startSession();

  try {

    session.startTransaction();

    const application = await Application.findOne({
      _id: applicationId,
      student: user.referenceId
    }).session(session);

    if (!application) {
      throw new Error("Application not found");
    }

    const blockedStatuses = [
      "ongoing",
      "completed",
      "terminated",
      "rejected",
      "withdrawn"
    ];

    if (blockedStatuses.includes(application.status)) {
      throw new Error(
        "Cannot withdraw after internship started"
      );
    }

    application.status = "withdrawn";
    application.withdrawnAt = new Date();

    await application.save({ session });

    /*
      AUTO REOPEN INTERNSHIP
    */
    const internship = await Internship.findById(
      application.internship
    ).session(session);

    if (internship?.maxApplicants) {

      const totalApplications = await Application.countDocuments({
        internship: internship._id,
        status: { $ne: "withdrawn" }
      }).session(session);

      if (totalApplications < internship.maxApplicants) {
        internship.status = "open";
        await internship.save({ session });
      }
    }

    await session.commitTransaction();

    return application;

  } catch (err) {

    await session.abortTransaction();
    throw err;

  } finally {

    session.endSession();

  }
};

export const getApplicationByIdService = async (user, applicationId) => {

  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    throw new Error("Invalid application id");
  }

  const application = await Application.findById(applicationId)
    .populate("student")
    .populate("mentor")
    .populate("faculty")
    .populate("internship")
    .populate("report")
    .lean();

  if (!application) {
    throw new Error("Application not found");
  }

  /*
    ACCESS CONTROL
  */

  // Company → must own application
  if (user.role === "company") {
    if (
      application.company.toString() !==
      user.referenceId.toString()
    ) {
      throw new Error("Unauthorized");
    }
  }

  // Student → only own application
  if (user.role === "student") {
    if (
      application.student._id.toString() !==
      user.referenceId.toString()
    ) {
      throw new Error("Unauthorized");
    }
  }

  // Faculty → optional future validation

  return application;
};


export const getApplicationProgressService = async (applicationId) => {

  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    throw new Error("Invalid application id");
  }

  const application = await Application.findById(applicationId)
    .populate("student","fullName")
    .populate("company","name")
    .populate("mentor","fullName")
    .populate("internship","title")
    .lean();

  if (!application) {
    throw new Error("Application not found");
  }

  const tasks = await Task.find({
    application: applicationId
  }).sort({ createdAt: -1 }).lean();

  const logs = await ProgressLog.find({
    application: applicationId
  }).sort({ logDate: -1 }).lean();

  const reports = await InternshipReport.find({
    application: applicationId
  }).sort({ createdAt: -1 }).lean();

  return {
    application,
    tasks,
    logs,
    reports
  };
};