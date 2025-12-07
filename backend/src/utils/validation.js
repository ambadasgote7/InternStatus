import validator from "validator";

const ALLOWED_ROLES = ["Student", "Faculty", "Company"];

const validateSignupData = (body) => {
  const { email, password, role } = body;

  if (!email || !password || !role) {
    throw new Error("All fields required");
  }

  if (!validator.isEmail(email)) {
    throw new Error("Invalid email");
  }

  if (!ALLOWED_ROLES.includes(role)) {
    throw new Error("Invalid role");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error("Enter strong password");
  }
};

export default validateSignupData;
