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
  firstName: Joi.string().required().label("First Name"),
  lastName: Joi.string().required().label("Last Name"),
  dateOfBirth: Joi.date().required().label("Date of Birth"),
  investUnderChildName: Joi.boolean()
    .required()
    .default(false)
    .label("Invest under child's name"),
});

// Type for child form values
export interface ChildFormValues {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  investUnderChildName: boolean;
}

// Default values
export const defaultChildFormValues: ChildFormValues = {
  firstName: "",
  lastName: "",
  dateOfBirth: null,
  investUnderChildName: false,
};

export const defaultChildFormErrors = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  investUnderChildName: "",
};
