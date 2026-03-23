import mongoose from "mongoose";

const internshipReportSchema = new mongoose.Schema(
{
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true,
    unique: true,
    index: true
  },

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentProfile",
    required: true,
    index: true
  },

  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MentorProfile",
    required: true,
    index: true
  },

  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
    index: true
  },

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CORE GENERATED DATA (DO NOT RECOMPUTE)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  */
  totalTasks: {
    type: Number,
    default: 0
  },

  tasksCompleted: {
    type: Number,
    default: 0
  },

  completionRate: {
    type: Number,
    min: 0,
    max: 100
  },

  mentorScore: {
    type: Number,
    min: 0,
    max: 10
  },

  /*
  🔥 STORED INSIGHTS (CRITICAL)
  */
  technologies: [
    {
      type: String,
      trim: true
    }
  ],

  finalSummary: {
    type: String
  },

  /*
  Optional: structured breakdown (future AI/analytics ready)
  */
  performance: {
    consistencyScore: Number,
    qualityScore: Number,
    deliveryScore: Number
  },

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FACULTY LAYER
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  */
  facultyStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    index: true
  },

  facultyScore: {
    type: Number,
    min: 0,
    max: 10
  },

  facultyRemarks: {
    type: String
  },

  approvedAt: Date,

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CREDIT SYSTEM
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  */
  creditsEarned: {
    type: Number
  },

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FILE OUTPUTS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  */
  reportUrl: {
    type: String
  },

  weeklyData: [
  {
    weekNumber: Number,
    startDate: Date,
    endDate: Date,
    tasks: [
      {
        taskTitle: String,
        summary: String,
        technologies: [String],
        date: Date,
        score: Number,
        mentorFeedback: String
      }
    ]
  }
],

isLocked: {
  type: Boolean,
  default: false
},

  /*
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STATUS TRACKING
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  */
  status: {
    type: String,
    enum: [
      "generated",
      "faculty_pending",
      "faculty_approved"
    ],
    default: "generated",
    index: true
  },

  generatedAt: {
    type: Date,
    default: Date.now
  }

},
{
  timestamps: true
}
);

const InternshipReport = mongoose.model(
  "InternshipReport",
  internshipReportSchema
);

export default InternshipReport;