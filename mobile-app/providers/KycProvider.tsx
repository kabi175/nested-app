import type { User } from "@/types/auth";
import Joi from "joi";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type OccupationValue = NonNullable<User["occupation"]>;
type IncomeSourceValue = NonNullable<User["income_source"]>;
type IncomeSlabValue = NonNullable<User["income_slab"]>;

type KycBasicDetails = {
  fullName: string;
  dateOfBirth: Date | null;
  gender: "male" | "female" | "other" | "";
  email: string;
  emailOtpVerified: boolean;
  mobile: string;
  mobileOtpVerified: boolean;
};

type KycIdentity = {
  pan: string;
  aadhaarLast4: string;
  aadhaarRedirectUrl?: string;
};

type KycAddress = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pin_code: string;
};

type KycPhotoSignature = {
  signatureUri?: string;
  signatureDrawData?: string;
};

type KycFinancial = {
  occupation: OccupationValue | "";
  incomeSource: IncomeSourceValue | "";
  incomeSlab: IncomeSlabValue | "";
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

type UpdatableSection = Exclude<keyof KycData, "confirmed">;

type KycContextType = {
  data: KycData;
  update: <Section extends UpdatableSection>(
    section: Section,
    values: Partial<KycData[Section]>
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
    email: "",
    emailOtpVerified: false,
    mobile: "",
    mobileOtpVerified: false,
  },
  identity: {
    pan: "",
    aadhaarLast4: "",
    aadhaarRedirectUrl: undefined,
  },
  address: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pin_code: "",
  },
  photoSignature: {
    signatureUri: undefined,
    signatureDrawData: undefined,
  },
  financial: {
    occupation: "",
    incomeSource: "",
    incomeSlab: "",
    pep: false,
  },
  confirmed: false,
};

const KycContext = createContext<KycContextType | undefined>(undefined);

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const pincodeRegex = /^[1-9][0-9]{5}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const KycProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<KycData>(defaultData);

  const update = useCallback(
    <Section extends UpdatableSection>(
      section: Section,
      values: Partial<KycData[Section]>
    ) => {
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
        pin_code: Joi.string()
          .pattern(pincodeRegex)
          .required()
          .label("Pincode"),
      }),
    []
  );

  const photoSignatureSchema = useMemo(
    () =>
      Joi.object<KycPhotoSignature>({
        signatureUri: Joi.string().uri().optional(),
        signatureDrawData: Joi.string().optional(),
      })
        .or("signatureUri", "signatureDrawData")
        .messages({
          "object.missing": "Please upload or draw your signature.",
        }),
    []
  );

  const financialSchema = useMemo(
    () =>
      Joi.object<KycFinancial>({
        occupation: Joi.string()
          .valid(
            "business",
            "service",
            "professional",
            "agriculture",
            "retired",
            "housewife",
            "others",
            "doctor",
            "private_sector_service",
            "public_sector_service",
            "forex_dealer",
            "government_service"
          )
          .required()
          .label("Occupation Type"),
        incomeSource: Joi.string()
          .valid(
            "salary",
            "business_income",
            "ancestral_property",
            "rental_income",
            "prize_money",
            "royalty",
            "other"
          )
          .required()
          .label("Income Source"),
        incomeSlab: Joi.string()
          .valid(
            "upto_1lakh",
            "above_1lakh_upto_5lakh",
            "above_5lakh_upto_10lakh",
            "above_10lakh_upto_25lakh",
            "above_25lakh_upto_1cr",
            "above_1cr"
          )
          .required()
          .label("Income Slab"),
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
