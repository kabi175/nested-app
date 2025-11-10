import Joi from "joi";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type KycBasicDetails = {
  fullName: string;
  dateOfBirth: Date | null;
  gender: "male" | "female" | "other" | "";
  maritalStatus: "Single" | "Married" | "Divorced" | "Widowed" | "";
  email: string;
  emailOtpVerified: boolean;
  mobile: string;
  mobileOtpVerified: boolean;
};

type KycIdentity = {
  pan: string;
  aadhaarLast4: string;
  aadhaarRedirectUrl?: string;
  aadhaarUploaded: boolean;
};

type KycAddress = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
};

type KycPhotoSignature = {
  photoUri?: string;
  signatureUri?: string;
  signatureDrawData?: string;
};

type KycFinancial = {
  occupationType:
    | "Salaried"
    | "Self-Employed"
    | "Business Owner"
    | "Student"
    | "Retired"
    | "Homemaker"
    | "";
  annualIncomeRange:
    | "< 2.5L"
    | "2.5L - 5L"
    | "5L - 10L"
    | "10L - 25L"
    | "> 25L"
    | "";
  residentialStatus: "Resident" | "NRI" | "";
  pep: boolean;
};

export type KycData = {
  basic: KycBasicDetails;
  identity: KycIdentity;
  address: KycAddress;
  photoSignature: KycPhotoSignature;
  financial: KycFinancial;
  confirmed: boolean;
};

type KycContextType = {
  data: KycData;
  update: (
    section: keyof KycData,
    values: Partial<KycData[typeof section]>
  ) => void;
  setConfirmed: (value: boolean) => void;
  reset: () => void;
  // validation helpers per-step
  validateBasic: () => { isValid: boolean; errors: Record<string, string> };
  validateIdentity: () => { isValid: boolean; errors: Record<string, string> };
  validateAddress: () => { isValid: boolean; errors: Record<string, string> };
  validatePhotoSignature: () => {
    isValid: boolean;
    errors: Record<string, string>;
  };
  validateFinancial: () => { isValid: boolean; errors: Record<string, string> };
};

const defaultData: KycData = {
  basic: {
    fullName: "",
    dateOfBirth: null,
    gender: "male",
    maritalStatus: "",
    email: "",
    emailOtpVerified: false,
    mobile: "",
    mobileOtpVerified: false,
  },
  identity: {
    pan: "",
    aadhaarLast4: "",
    aadhaarUploaded: false,
    aadhaarRedirectUrl: undefined,
  },
  address: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  },
  photoSignature: {
    photoUri: undefined,
    signatureUri: undefined,
    signatureDrawData: undefined,
  },
  financial: {
    occupationType: "",
    annualIncomeRange: "",
    residentialStatus: "",
    pep: false,
  },
  confirmed: false,
};

const KycContext = createContext<KycContextType | undefined>(undefined);

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const pincodeRegex = /^[1-9][0-9]{5}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const KycProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<KycData>(defaultData);

  const update = useCallback(
    (section: keyof KycData, values: Partial<KycData[typeof section]>) => {
      setData((prev) => ({
        ...prev,
        [section]: { ...prev[section], ...values },
      }));
    },
    []
  );

  const setConfirmed = useCallback((value: boolean) => {
    setData((prev) => ({ ...prev, confirmed: value }));
  }, []);

  const reset = useCallback(() => setData(defaultData), []);

  // Schemas
  const basicSchema = useMemo(
    () =>
      Joi.object<KycBasicDetails>({
        fullName: Joi.string().min(3).required().label("Full Name"),
        dateOfBirth: Joi.date().less("now").required().label("Date of Birth"),
        gender: Joi.string()
          .valid("male", "female", "other")
          .required()
          .label("Gender"),
        maritalStatus: Joi.string()
          .valid("single", "married", "divorced", "widowed")
          .required()
          .label("Marital Status"),
        email: Joi.string().pattern(emailRegex).required().label("Email"),
        emailOtpVerified: Joi.boolean().optional(),
        mobile: Joi.string()
          .pattern(/^\+?[0-9]{1,3}?[- ]?[6-9]\d{9}$/)
          .required()
          .label("Mobile Number"),
        mobileOtpVerified: Joi.boolean().optional(),
      }),
    []
  );

  const identitySchema = useMemo(
    () =>
      Joi.object<KycIdentity>({
        pan: Joi.string()
          .uppercase()
          .pattern(panRegex)
          .required()
          .label("PAN Number"),
        aadhaarLast4: Joi.string()
          .length(4)
          .pattern(/^\d{4}$/)
          .required()
          .label("Aadhaar last 4"),
        aadhaarUploaded: Joi.boolean().valid(true).messages({
          "any.only": "Please upload Aadhaar to continue",
        }),
        aadhaarRedirectUrl: Joi.string().uri().optional(),
      }),
    []
  );

  const addressSchema = useMemo(
    () =>
      Joi.object<KycAddress>({
        addressLine1: Joi.string().min(5).required().label("Address Line 1"),
        addressLine2: Joi.string().allow("").optional(),
        city: Joi.string().min(2).required().label("City"),
        state: Joi.string().min(2).required().label("State"),
        pincode: Joi.string().pattern(pincodeRegex).required().label("Pincode"),
      }),
    []
  );

  const photoSignatureSchema = useMemo(
    () =>
      Joi.object<KycPhotoSignature>({
        photoUri: Joi.string().uri().required().label("Photo"),
        signatureUri: Joi.string().uri().optional(),
        signatureDrawData: Joi.string().optional(),
      }).or("signatureUri", "signatureDrawData"),
    []
  );

  const financialSchema = useMemo(
    () =>
      Joi.object<KycFinancial>({
        occupationType: Joi.string()
          .valid(
            "Salaried",
            "Self-Employed",
            "Business Owner",
            "Student",
            "Retired",
            "Homemaker"
          )
          .required()
          .label("Occupation Type"),
        annualIncomeRange: Joi.string()
          .valid("< 2.5L", "2.5L - 5L", "5L - 10L", "10L - 25L", "> 25L")
          .required()
          .label("Annual Income Range"),
        residentialStatus: Joi.string()
          .valid("Resident", "NRI")
          .required()
          .label("Residential Status"),
        pep: Joi.boolean().required().label("PEP Status"),
      }),
    []
  );

  const validate = useCallback((schema: Joi.ObjectSchema<any>, values: any) => {
    const { error } = schema.validate(values, { abortEarly: false });
    if (!error) return { isValid: true, errors: {} as Record<string, string> };
    const errors: Record<string, string> = {};
    error.details.forEach((d) => {
      const key = d.path[0] as string;
      errors[key] = d.message;
    });
    return { isValid: false, errors };
  }, []);

  const value = useMemo<KycContextType>(
    () => ({
      data,
      update,
      setConfirmed,
      reset,
      validateBasic: () => validate(basicSchema, data.basic),
      validateIdentity: () => validate(identitySchema, data.identity),
      validateAddress: () => validate(addressSchema, data.address),
      validatePhotoSignature: () =>
        validate(photoSignatureSchema, data.photoSignature),
      validateFinancial: () => validate(financialSchema, data.financial),
    }),
    [
      data,
      update,
      setConfirmed,
      reset,
      validate,
      basicSchema,
      identitySchema,
      addressSchema,
      photoSignatureSchema,
      financialSchema,
    ]
  );

  return <KycContext.Provider value={value}>{children}</KycContext.Provider>;
};

export const useKyc = (): KycContextType => {
  const ctx = useContext(KycContext);
  if (!ctx) {
    throw new Error("useKyc must be used within KycProvider");
  }
  return ctx;
};
