import mongoose from "mongoose";
import CollegeOnboarding from "../../models/CollegeOnboarding.js";
import College from "../../models/College.js";
import CompanyOnboarding from "../../models/CompanyOnboarding.js";
import Company from "../../models/Company.js";
import createUserWithToken from "../../utils/createUser.js";
import sendEmail from "../../utils/sendEmail.js";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";


/* =====================================================
   COLLEGE — CREATE REQUEST
===================================================== */

export const createCollegeOnboardingService = async ({ body, file }) => {

  const {
    requesterName,
    requesterEmail,
    requesterPhone,
    collegeName,
    selectedCollege,
    location,
    website,
    emailDomain
  } = body;

  if (!requesterName || !requesterEmail)
    throw new Error("Requester name and email required");

  if (!collegeName && !selectedCollege)
    throw new Error("College selection required");

  if (!location)
    throw new Error("Location required");

  if (!file)
    throw new Error("Verification document required");

  const email = requesterEmail.toLowerCase().trim();

  const existing = await CollegeOnboarding.findOne({
    requesterEmail: email,
    status: { $in: ["pending", "approved"] }
  });

  if (existing)
    throw new Error("You already submitted a request");


  if (selectedCollege) {
    const exists = await College.findById(selectedCollege);
    if (!exists) throw new Error("Selected college not found");
  }


  const uploadResult = await uploadToCloudinary(
    file,
    "college-verification-docs"
  );


  const onboarding = await CollegeOnboarding.create({
    requesterName,
    requesterEmail: email,
    requesterPhone,
    collegeName,
    selectedCollege: selectedCollege || null,
    location,
    website,
    emailDomain: emailDomain?.toLowerCase(),
    verificationDocumentUrl: uploadResult.secure_url,
    status: "pending"
  });

  return onboarding;
};


/* =====================================================
   COLLEGE — GET LIST
===================================================== */

export const getCollegeOnboardingsService = async (status) => {

  const filter = {};
  if (status) filter.status = status;

  return CollegeOnboarding.find(filter)
    .populate("selectedCollege")
    .populate("reviewedBy", "email role")
    .sort({ createdAt: -1 });
};


/* =====================================================
   COLLEGE — APPROVE / REJECT
===================================================== */

export const updateCollegeOnboardingStatusService = async ({
  onboardingId,
  status,
  rejectionReason,
  adminId
}) => {

  if (!["approved", "rejected"].includes(status))
    throw new Error("Invalid status");

  const onboarding = await CollegeOnboarding.findById(onboardingId);

  if (!onboarding) throw new Error("Onboarding not found");

  if (onboarding.status !== "pending")
    throw new Error("Already processed");


  /* ================= REJECT ================= */

  if (status === "rejected") {

    onboarding.status = "rejected";
    onboarding.rejectionReason = rejectionReason;
    onboarding.reviewedBy = adminId;
    onboarding.reviewedAt = new Date();

    await onboarding.save();

    return onboarding;
  }


  /* ================= APPROVE ================= */

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    let collegeDoc;

    /* ===== EXISTING COLLEGE SELECTED ===== */

    if (onboarding.selectedCollege) {

      collegeDoc = await College.findById(
        onboarding.selectedCollege
      ).session(session);

      if (!collegeDoc)
        throw new Error("Selected college not found");
    }


    /* ===== CREATE NEW COLLEGE ===== */

    else {

      const created = await College.create(
        [
          {
            name: onboarding.collegeName,

            // 🔥 Mapping onboarding → college
            address: onboarding.location,
            phone: onboarding.requesterPhone,
            website: onboarding.website,
            emailDomain: onboarding.emailDomain,

            approvedAt: new Date(),
            createdBy: adminId
          }
        ],
        { session }
      );

      collegeDoc = created[0];
    }


    /* ===== CREATE USER ===== */

    const { user, rawToken } = await createUserWithToken({
      email: onboarding.requesterEmail,
      role: "college",
      referenceId: collegeDoc._id,
      referenceModel: "College",
      createdBy: adminId
    });


    /* ===== UPDATE ONBOARDING ===== */

    onboarding.status = "approved";
    onboarding.reviewedBy = adminId;
    onboarding.reviewedAt = new Date();
    onboarding.college = collegeDoc._id;
    onboarding.createdUser = user._id;

    await onboarding.save({ session });


    await session.commitTransaction();
    session.endSession();


    /* ===== EMAIL ===== */

    const setupLink =
      `${process.env.FRONTEND_URL}/setup-account?token=${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "College Account Approved",
      html: `
        <p>Your college onboarding is approved.</p>
        <p>Set password:</p>
        <a href="${setupLink}">${setupLink}</a>
      `
    });


    return onboarding;

  } catch (err) {

    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};



/* =====================================================
   COMPANY — CREATE REQUEST
===================================================== */

export const createCompanyOnboardingService = async ({ body, file }) => {

  const {
    requesterName,
    requesterEmail,
    companyName,
    selectedCompany,
    requesterPhone,
    locations,
    website,
    emailDomain,
    industry,
    companySize
  } = body;

  if (!requesterName || !requesterEmail)
    throw new Error("Requester name and email required");

  if (!companyName && !selectedCompany)
    throw new Error("Company selection required");

  if (!requesterPhone)
    throw new Error("Phone number required");

  if (!file)
    throw new Error("Verification document required");


  const email = requesterEmail.toLowerCase().trim();

  const existing = await CompanyOnboarding.findOne({
    requesterEmail: email,
    status: { $in: ["pending", "approved"] }
  });

  if (existing)
    throw new Error("You already submitted a request");


  let parsedLocations = [];

  if (locations) {
    try {
      parsedLocations = JSON.parse(locations);
    } catch {
      throw new Error("Invalid locations format");
    }
  }


  const uploadResult = await uploadToCloudinary(
    file,
    "company-verification-docs"
  );


  const onboarding = await CompanyOnboarding.create({
    requesterName,
    requesterEmail: email,
    companyName,
    selectedCompany: selectedCompany || null,
    requesterPhone,
    locations: parsedLocations,
    website,
    emailDomain: emailDomain?.toLowerCase(),
    industry,
    companySize,
    verificationDocumentUrl: uploadResult.secure_url,
    status: "pending"
  });

  return onboarding;
};



/* =====================================================
   COMPANY — GET LIST
===================================================== */

export const getCompanyOnboardingsService = async (status) => {

  const filter = {};
  if (status) filter.status = status;

  return CompanyOnboarding.find(filter)
    .populate("company")
    .populate("reviewedBy", "email role")
    .sort({ createdAt: -1 });
};



/* =====================================================
   COMPANY — APPROVE / REJECT
===================================================== */

export const updateCompanyOnboardingStatusService = async ({
  onboardingId,
  status,
  rejectionReason,
  adminId
}) => {

  if (!["approved", "rejected"].includes(status))
    throw new Error("Invalid status");

  const onboarding = await CompanyOnboarding.findById(onboardingId);

  if (!onboarding) throw new Error("Onboarding not found");

  if (onboarding.status !== "pending")
    throw new Error("Already processed");


  /* ================= REJECT ================= */

  if (status === "rejected") {

    onboarding.status = "rejected";
    onboarding.rejectionReason = rejectionReason;
    onboarding.reviewedBy = adminId;
    onboarding.reviewedAt = new Date();

    await onboarding.save();

    return onboarding;
  }


  /* ================= APPROVE ================= */

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    let companyDoc;


    /* ===== EXISTING COMPANY SELECTED ===== */

    if (onboarding.selectedCompany) {

      companyDoc = await Company.findById(
        onboarding.selectedCompany
      ).session(session);

      if (!companyDoc)
        throw new Error("Selected company not found");
    }


    /* ===== CREATE NEW COMPANY ===== */

    else {

      const created = await Company.create(
        [
          {
            name: onboarding.companyName,
            locations: onboarding.locations,
            website: onboarding.website,
            emailDomain: onboarding.emailDomain,
            industry: onboarding.industry,
            companySize: onboarding.companySize,
            approvedAt: new Date(),
            createdBy: adminId
          }
        ],
        { session }
      );

      companyDoc = created[0];
    }


    /* ===== CREATE USER ===== */

    const { user, rawToken } = await createUserWithToken({
      email: onboarding.requesterEmail,
      role: "company",
      referenceId: companyDoc._id,
      referenceModel: "Company",
      createdBy: adminId
    });


    /* ===== UPDATE ONBOARDING ===== */

    onboarding.status = "approved";
    onboarding.reviewedBy = adminId;
    onboarding.reviewedAt = new Date();
    onboarding.company = companyDoc._id;
    onboarding.createdUser = user._id;

    await onboarding.save({ session });


    await session.commitTransaction();
    session.endSession();


    /* ===== EMAIL ===== */

    const setupLink =
      `${process.env.FRONTEND_URL}/setup-account?token=${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Company Account Approved",
      html: `
        <p>Your company onboarding is approved.</p>
        <p>Set your password:</p>
        <a href="${setupLink}">${setupLink}</a>
      `
    });


    return onboarding;

  } catch (err) {

    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};