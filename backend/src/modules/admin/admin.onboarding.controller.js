import {
  getPendingOnboardingsService,
  getVerifiedOnboardingsService,
  getOnboardingDetailsService,
  updateOnboardingStatusService
} from "./admin.onboarding.service.js";


/* =====================================================
   GET PENDING
   GET /api/admin/onboarding/pending?type=college|company
===================================================== */

export const getPending = async (req, res) => {
  try {
    // 🔥 Extract ALL query params safely
    const {
      type = "all",
      search = "",
      page = 1,
      limit = 10,
      sortField = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // 🔥 Normalize params (important)
    const params = {
      type,
      search,
      page: Number(page),
      limit: Number(limit),
      sortField,
      sortOrder,
    };

    // 🔍 Debug (remove later)
    // console.log("Pending Params:", params);

    const data = await getPendingOnboardingsService(params);

    return res.status(200).json({
      success: true,
      message: "Pending onboarding fetched",
      data,
    });

  } catch (err) {
    console.error("Get Pending Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};


/* =====================================================
   GET VERIFIED
   GET /api/admin/onboarding/verified?type=college|company
===================================================== */
export const getVerified = async (req, res) => {
  try {
    const {
      type = "all",
      page = 1,
      limit = 10,
      search = "",
      sortField = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const data = await getVerifiedOnboardingsService({
      type,
      page: Number(page),
      limit: Number(limit),
      search,
      sortField,
      sortOrder,
      status: "approved",
    });

    res.status(200).json({
      success: true,
      message: "Verified onboarding fetched",
      data,
    });

  } catch (err) {
    console.error("Get Verified Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};



/* =====================================================
   GET DETAILS
   GET /api/admin/onboarding/:type/:id
===================================================== */

export const getDetails = async (req, res) => {
  try {

    const { type, id } = req.params;

    const data = await getOnboardingDetailsService(type, id);

    if (!data)
      return res.status(404).json({
        success: false,
        message: "Onboarding not found"
      });

    res.status(200).json({
      success: true,
      message: "Onboarding details fetched",
      data
    });

  } catch (err) {
    console.error("Get Details Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error"
    });
  }
};


export const updateOnboardingStatus = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { status, rejectionReason } = req.body;

    const data = await updateOnboardingStatusService(
      type,
      id,
      { status, rejectionReason },
      req.user?._id
    );

    return res.status(200).json({
      success: true,
      message: `Onboarding ${status} successfully`,
      data,
    });
  } catch (err) {
    console.error("Update Status Error:", err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
