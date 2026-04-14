import express from "express";
import {
  assignMentor,
  getCertificate,
  getCompanyInterns,
  getCompanyMentors,
  getCompanyProfile,
  getInternProgressController,
  issueCertificate,
  removeMentorFromCompany,
  updateCompanyMentor,
  updateCompanyProfile,
  getCompanyDashboard,
  getCompanyInternships, // ✅ ADD THIS
  getCompanyApplications,
  getCompanyList,
  issueOfferLetter,
  getOfferLetter,
} from "./company.controller.js";

import { authenticate } from "../../middleware/auth.js";
import { authorizeRoles } from "../../middleware/role.js";
import { upload } from "../../middleware/upload.js";

const router = express.Router();

router.get(
  "/list",
  getCompanyList
);

router.get(
  "/profile",
  authenticate,
  authorizeRoles("company"),
  getCompanyProfile,
);

router.patch(
  "/profile",
  authenticate,
  authorizeRoles("company"),
  upload.single("logo"),
  updateCompanyProfile,
);

router.get(
  "/internships",
  authenticate,
  authorizeRoles("company"),
  getCompanyInternships,
);

router.get(
  "/mentors",
  authenticate,
  authorizeRoles("company"),
  getCompanyMentors,
);

router.patch(
  "/mentors/:mentorId",
  authenticate,
  authorizeRoles("company"),
  updateCompanyMentor,
);

router.delete(
  "/mentors/:mentorId",
  authenticate,
  authorizeRoles("company"),
  removeMentorFromCompany,
);

router.get(
  "/interns",
  authenticate,
  authorizeRoles("company"),
  getCompanyInterns,
);

router.patch(
  "/:id/assign-mentor",
  authenticate,
  authorizeRoles("company"),
  assignMentor,
);

router.get(
  "/interns/:id/progress",
  authenticate,
  authorizeRoles("company"),
  getInternProgressController,
);

router.post(
  "/applications/:id/certificate",
  authenticate,
  authorizeRoles("company"),
  upload.single("certificate"),
  issueCertificate,
);

router.get("/applications/:id/certificate", authenticate, getCertificate);

router.post(
  "/applications/:id/offer-letter",
  authenticate,
  authorizeRoles("company"),
  upload.single("offerLetter"),
  issueOfferLetter
);

router.get(
  "/applications/:id/offer-letter",
  authenticate,
  getOfferLetter
);

router.get(
  "/dashboard",
  authenticate,
  authorizeRoles("company"),
  getCompanyDashboard,
);

router.get(
  "/applications",
  authenticate,
  authorizeRoles("company"),
  getCompanyApplications,
);

export default router;
