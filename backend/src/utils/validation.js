import validator from "validator";

export const validateSignupData = (body) => {
  const { email, password } = body;

  if (!email || !password) {
    throw new Error("All fields required");
  }

  if (!validator.isEmail(email)) {
    throw new Error("Invalid email");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error("Enter strong password");
  }
};