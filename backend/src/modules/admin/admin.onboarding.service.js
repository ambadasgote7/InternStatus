import mongoose from "mongoose";
import CollegeOnboarding from "../../models/CollegeOnboarding.js";
import CompanyOnboarding from "../../models/CompanyOnboarding.js";

/* ---------------- SAFE REGEX ---------------- */
const escapeRegex = (text) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/* ---------------- BUILD MATCH ---------------- */
const buildMatch = (status, search) => {
  const match = { status };

  const cleanSearch =
    typeof search === "string" ? search.trim() : "";

  if (cleanSearch.length > 0) {
    const safe = escapeRegex(cleanSearch);

    match.$or = [
      { requesterName: { $regex: safe, $options: "i" } },
      { requesterEmail: { $regex: safe, $options: "i" } },
      { collegeName: { $regex: safe, $options: "i" } },
      { companyName: { $regex: safe, $options: "i" } },
    ];
  }

  return match;
};

/* =========================================================
   🔹 VERIFIED / PENDING (UNIFIED)
========================================================= */
export const getVerifiedOnboardingsService = async ({
  type = "all",
  page = 1,
  limit = 10,
  search = "",
  sortField = "createdAt",
  sortOrder = "desc",
  status = "approved", // ✅ dynamic
}) => {
  // ✅ FIXED: USE status (NOT HARDCODED)
  const match = buildMatch(status, search);

  const sort = {
    [sortField]: sortOrder === "asc" ? 1 : -1,
  };

  const skip = (page - 1) * limit;

  const pipeline = [
    /* -------- COLLEGE -------- */
    {
      $match: match,
    },
    {
      $addFields: {
        type: "college",
        name: "$collegeName",
      },
    },

    /* -------- UNION COMPANY -------- */
    {
      $unionWith: {
        coll: CompanyOnboarding.collection.name,
        pipeline: [
          { $match: match },
          {
            $addFields: {
              type: "company",
              name: "$companyName",
            },
          },
        ],
      },
    },
  ];

  /* -------- FILTER TYPE -------- */
  if (type !== "all") {
    pipeline.push({ $match: { type } });
  }

  /* -------- SORT -------- */
  pipeline.push({ $sort: sort });

  /* -------- PAGINATION -------- */
  pipeline.push({
    $facet: {
      data: [{ $skip: skip }, { $limit: limit }],
      totalCount: [{ $count: "count" }],
    },
  });

  const result = await CollegeOnboarding.aggregate(pipeline);

  const data = result[0]?.data || [];
  const total = result[0]?.totalCount[0]?.count || 0;

  return {
    data,
    counts: {
      all: total,
      college:
        type === "company"
          ? 0
          : await CollegeOnboarding.countDocuments(match),
      company:
        type === "college"
          ? 0
          : await CompanyOnboarding.countDocuments(match),
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/* =========================================================
   🔹 PENDING
========================================================= */
export const getPendingOnboardingsService = async (params = {}) => {
  return getVerifiedOnboardingsService({
    ...params,
    status: "pending", // ✅ now actually works
  });
};
/* =========================================================
   🔹 DETAILS (UNCHANGED)
========================================================= */
export const getOnboardingDetailsService = async (type, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid ID");
  }

  if (type === "college") {
    return CollegeOnboarding.findById(id)
      .populate("college")
      .populate("createdUser", "email role")
      .populate("reviewedBy", "email")
      .lean();
  }

  if (type === "company") {
    return CompanyOnboarding.findById(id)
      .populate("company")
      .populate("createdUser", "email role")
      .populate("reviewedBy", "email")
      .lean();
  }

  throw new Error("Invalid type");
};


export const updateOnboardingStatusService = async (
  type,
  id,
  { status, rejectionReason },
  adminId
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid ID");
  }

  if (!["approved", "rejected"].includes(status)) {
    throw new Error("Invalid status");
  }

  const Model =
    type === "college"
      ? CollegeOnboarding
      : type === "company"
      ? CompanyOnboarding
      : null;

  if (!Model) throw new Error("Invalid type");

  const onboarding = await Model.findById(id);
  if (!onboarding) throw new Error("Onboarding not found");

  onboarding.status = status;

  if (status === "rejected") {
    onboarding.rejectionReason = rejectionReason || "Not specified";
  } else {
    onboarding.rejectionReason = undefined;
  }

  onboarding.reviewedBy = adminId;
  onboarding.reviewedAt = new Date();

  await onboarding.save();

  return onboarding;
};

