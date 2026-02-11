/**
 * Data generators for k6 load tests
 * Nested App - Investment Platform
 */

import { randomIntBetween, randomItem, randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

/**
 * Generate a random email
 */
export function generateEmail(prefix = 'test') {
  const timestamp = Date.now();
  const random = randomString(5);
  return `${prefix}_${timestamp}_${random}@test.nested.money`;
}

/**
 * Generate a random phone number (Indian format)
 */
export function generatePhoneNumber() {
  const prefixes = ['9', '8', '7', '6'];
  const prefix = randomItem(prefixes);
  const number = randomIntBetween(100000000, 999999999);
  return `+91${prefix}${number}`;
}

/**
 * Generate a random PAN number
 */
export function generatePAN() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const pan = 
    letters[randomIntBetween(0, 25)] +
    letters[randomIntBetween(0, 25)] +
    letters[randomIntBetween(0, 25)] +
    letters[randomIntBetween(0, 25)] +
    'P' + // P for individual
    randomIntBetween(1000, 9999) +
    letters[randomIntBetween(0, 25)];
  return pan;
}

/**
 * Generate a random date of birth (adult)
 */
export function generateAdultDOB() {
  const year = randomIntBetween(1960, 2000);
  const month = String(randomIntBetween(1, 12)).padStart(2, '0');
  const day = String(randomIntBetween(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate a random child date of birth
 */
export function generateChildDOB() {
  const year = randomIntBetween(2010, 2023);
  const month = String(randomIntBetween(1, 12)).padStart(2, '0');
  const day = String(randomIntBetween(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate a target date in the future
 */
export function generateFutureDate(yearsFromNow = 5) {
  const now = new Date();
  const year = now.getFullYear() + randomIntBetween(1, yearsFromNow);
  const month = String(randomIntBetween(1, 12)).padStart(2, '0');
  const day = String(randomIntBetween(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate a random first name
 */
export function generateFirstName() {
  const names = [
    'Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Neha', 'Rohan', 'Pooja',
    'Arjun', 'Kavita', 'Suresh', 'Anjali', 'Rajesh', 'Meera', 'Sanjay', 'Divya',
    'Kiran', 'Riya', 'Arun', 'Shruti', 'Deepak', 'Swati', 'Manish', 'Nisha',
  ];
  return randomItem(names);
}

/**
 * Generate a random last name
 */
export function generateLastName() {
  const names = [
    'Kumar', 'Sharma', 'Patel', 'Singh', 'Gupta', 'Reddy', 'Mehta', 'Joshi',
    'Shah', 'Nair', 'Iyer', 'Rao', 'Mishra', 'Verma', 'Thakur', 'Chopra',
    'Agarwal', 'Bose', 'Das', 'Roy', 'Chatterjee', 'Banerjee', 'Mukherjee', 'Sen',
  ];
  return randomItem(names);
}

/**
 * Generate a random child name
 */
export function generateChildName() {
  const names = [
    'Aarav', 'Aanya', 'Vihaan', 'Saanvi', 'Arjun', 'Ishaan', 'Ananya', 'Kiara',
    'Reyansh', 'Diya', 'Ayush', 'Pari', 'Krishna', 'Aadhya', 'Sai', 'Myra',
  ];
  return randomItem(names);
}

/**
 * Generate user data for registration
 */
export function generateUserData() {
  return {
    first_name: generateFirstName(),
    last_name: generateLastName(),
    email: generateEmail(),
    phone_number: generatePhoneNumber(),
    date_of_birth: generateAdultDOB(),
    gender: randomItem(['MALE', 'FEMALE']),
    pan_number: generatePAN(),
    occupation: randomItem(['SALARIED', 'SELF_EMPLOYED', 'BUSINESS', 'PROFESSIONAL']),
    income_slab: randomItem(['BELOW_1L', 'L1_TO_5L', 'L5_TO_10L', 'L10_TO_25L', 'ABOVE_25L']),
    income_source: randomItem(['SALARY', 'BUSINESS', 'INVESTMENT', 'OTHERS']),
    is_pep: false,
    marital_status: randomItem(['SINGLE', 'MARRIED']),
    address: generateAddressData(),
  };
}

/**
 * Generate address data
 */
export function generateAddressData() {
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'];
  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal'];
  const city = randomItem(cities);
  const stateIndex = cities.indexOf(city);
  
  return {
    line1: `${randomIntBetween(1, 999)}, Test Street`,
    line2: `Block ${randomItem(['A', 'B', 'C', 'D'])}`,
    city: city,
    state: states[stateIndex] || 'Maharashtra',
    pincode: String(randomIntBetween(100000, 999999)),
    country: 'India',
  };
}

/**
 * Generate child data
 */
export function generateChildData() {
  return {
    name: generateChildName(),
    date_of_birth: generateChildDOB(),
    gender: randomItem(['MALE', 'FEMALE']),
    relationship: 'CHILD',
  };
}

/**
 * Generate goal data
 */
export function generateGoalData(childId, basketId, educationId = null) {
  return {
    title: `Education Goal - ${randomString(5)}`,
    target_amount: randomIntBetween(500000, 5000000),
    current_amount: 0,
    target_date: generateFutureDate(10),
    child: { id: childId },
    basket: { id: basketId },
    education: educationId ? { id: educationId } : null,
  };
}

/**
 * Generate bank account data
 */
export function generateBankAccountData() {
  const banks = [
    { name: 'HDFC Bank', ifsc: 'HDFC' },
    { name: 'ICICI Bank', ifsc: 'ICIC' },
    { name: 'SBI', ifsc: 'SBIN' },
    { name: 'Axis Bank', ifsc: 'UTIB' },
    { name: 'Kotak Bank', ifsc: 'KKBK' },
  ];
  const bank = randomItem(banks);
  
  return {
    account_number: String(randomIntBetween(10000000000, 99999999999)),
    account_holder_name: `${generateFirstName()} ${generateLastName()}`,
    ifsc_code: `${bank.ifsc}0001234`,
    bank_name: bank.name,
    account_type: randomItem(['SAVINGS', 'CURRENT']),
    is_primary: true,
  };
}

/**
 * Generate order data
 */
export function generateOrderData(goalId, amount) {
  return {
    goal_id: goalId,
    amount: amount || randomIntBetween(1000, 50000),
    order_type: 'BUY',
  };
}

/**
 * Generate place order request
 */
export function generatePlaceOrderRequest(orders, bankId) {
  return {
    orders: orders,
    payment_method: randomItem(['net_banking', 'upi']),
    bank_id: bankId,
    upi_id: null,
  };
}

/**
 * Generate nominee data
 */
export function generateNomineeData(allocation = 100) {
  const isMinor = Math.random() > 0.8; // 20% chance of minor nominee
  const dob = isMinor ? generateChildDOB() : generateAdultDOB();
  
  const nominee = {
    name: `${generateFirstName()} ${generateLastName()}`,
    relationship: randomItem(['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER']),
    date_of_birth: dob,
    allocation: allocation,
    address: generateAddressData(),
  };
  
  if (isMinor) {
    nominee.guardian_name = `${generateFirstName()} ${generateLastName()}`;
    nominee.guardian_pan = generatePAN();
    nominee.guardian_relationship = 'PARENT';
  }
  
  return nominee;
}

/**
 * Generate basket data for admin
 */
export function generateBasketData(fundIds = []) {
  const riskLevels = ['LOW', 'MODERATE', 'HIGH'];
  const categories = ['EQUITY', 'DEBT', 'HYBRID'];
  
  return {
    title: `Test Basket ${randomString(5)}`,
    description: `This is a test basket for load testing - ${randomString(20)}`,
    risk_level: randomItem(riskLevels),
    category: randomItem(categories),
    min_investment: randomIntBetween(500, 5000),
    expected_returns: randomIntBetween(8, 15),
    investment_horizon: randomIntBetween(3, 10),
    funds: fundIds.map((id, index) => ({
      id: id,
      allocation: Math.floor(100 / fundIds.length) + (index === 0 ? 100 % fundIds.length : 0),
    })),
    is_active: true,
  };
}

/**
 * Generate education record data for admin
 */
export function generateEducationData() {
  const institutions = [
    'MIT', 'Stanford University', 'Harvard University', 'IIT Delhi', 'IIT Bombay',
    'Cambridge University', 'Oxford University', 'NUS Singapore', 'ETH Zurich',
  ];
  const courses = [
    'Computer Science', 'Business Administration', 'Engineering', 'Medicine',
    'Law', 'Economics', 'Data Science', 'Artificial Intelligence',
  ];
  const countries = ['USA', 'UK', 'India', 'Singapore', 'Germany', 'Canada', 'Australia'];
  
  const isInstitution = Math.random() > 0.5;
  
  return {
    name: isInstitution ? randomItem(institutions) : randomItem(courses),
    type: isInstitution ? 'INSTITUTION' : 'COURSE',
    country: randomItem(countries),
    estimated_cost: randomIntBetween(500000, 5000000),
    duration_years: randomIntBetween(2, 5),
    description: `Test education record - ${randomString(20)}`,
  };
}
