import { Child } from "@/types/child";
import Joi from "joi";

// Generic validation function
export const validateForm = <T extends Record<string, any>>(
  schema: Joi.ObjectSchema<T>,
  values: T
): { isValid: boolean; errors: Record<string, string> } => {
  const { error } = schema.validate(values, { abortEarly: false });

  if (error) {
    const errors: Record<string, string> = {};
    error.details.forEach((detail) => {
      errors[detail.path[0] as string] = detail.message;
    });
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
};

// Child form schema
export const childSchema = Joi.object({
  id: Joi.string().optional().allow("").label("ID"),
  firstName: Joi.string().required().label("First Name"),
  lastName: Joi.string().required().label("Last Name"),
  dateOfBirth: Joi.date().required().label("Date of Birth"),
  gender: Joi.string()
    .valid("male", "female", "other")
    .required()
    .label("Gender"),
  investUnderChild: Joi.boolean()
    .required()
    .default(false)
    .label("Invest under child's name"),
});

// Default values
export const defaultChildFormValues: Child = {
  id: "",
  firstName: "",
  lastName: "",
  gender: "male",
  dateOfBirth: new Date(),
  investUnderChild: false,
};

export const defaultChildFormErrors = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  investUnderChild: "",
};

export const isValidUpiId = (upiId: string): boolean => {
  const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return pattern.test(upiId);
};
