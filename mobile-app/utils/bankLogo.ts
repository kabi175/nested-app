import { ImageSourcePropType } from "react-native";

// Static require map — Metro bundler requires static paths at bundle time
const BANK_LOGOS: Record<string, ImageSourcePropType> = {
  "abn-amro": require("@/assets/images/v2/banks/abn-amro.png"),
  "abu-dhabi-commercial-bank": require("@/assets/images/v2/banks/abu-dhabi-commercial-bank.png"),
  "airtel-payments-bank": require("@/assets/images/v2/banks/airtel-payments-bank.png"),
  "american-express": require("@/assets/images/v2/banks/american-express.png"),
  "au-small-finance-bank": require("@/assets/images/v2/banks/au-small-finance-bank.png"),
  "australia-and-new-zealand-banking-group": require("@/assets/images/v2/banks/australia-and-new-zealand-banking-group.png"),
  "axis-bank": require("@/assets/images/v2/banks/axis-bank.png"),
  "bandhan-bank": require("@/assets/images/v2/banks/bandhan-bank.png"),
  "bank-maybank-indonesia": require("@/assets/images/v2/banks/bank-maybank-indonesia.png"),
  "bank-of-america": require("@/assets/images/v2/banks/bank-of-america.png"),
  "bank-of-bahrain-and-kuwait": require("@/assets/images/v2/banks/bank-of-bahrain-and-kuwait.png"),
  "bank-of-baroda": require("@/assets/images/v2/banks/bank-of-baroda.png"),
  "bank-of-ceylon": require("@/assets/images/v2/banks/bank-of-ceylon.png"),
  "bank-of-china": require("@/assets/images/v2/banks/bank-of-china.png"),
  "bank-of-india": require("@/assets/images/v2/banks/bank-of-india.png"),
  "bank-of-maharastra": require("@/assets/images/v2/banks/bank-of-maharastra.png"),
  "barclays-bank": require("@/assets/images/v2/banks/barclays-bank.png"),
  "bnp-paribas": require("@/assets/images/v2/banks/bnp-paribas.png"),
  "canara-bank": require("@/assets/images/v2/banks/canara-bank.png"),
  "central-bank-of-india": require("@/assets/images/v2/banks/central-bank-of-india.png"),
  "citi-bank": require("@/assets/images/v2/banks/citi-bank.png"),
  "city-union-bank": require("@/assets/images/v2/banks/city-union-bank.png"),
  "credit-agricole-corporate-and-investment-bank": require("@/assets/images/v2/banks/credit-agricole-corporate-and-investment-bank.png"),
  "credit-suisse": require("@/assets/images/v2/banks/credit-suisse.png"),
  "csb-bank": require("@/assets/images/v2/banks/csb-bank.png"),
  "dbs-bank": require("@/assets/images/v2/banks/dbs-bank.png"),
  "dcb-bank": require("@/assets/images/v2/banks/dcb-bank.png"),
  "deutsche-bank": require("@/assets/images/v2/banks/deutsche-bank.png"),
  "dhanlaxmi-bank": require("@/assets/images/v2/banks/dhanlaxmi-bank.png"),
  "doha-bank": require("@/assets/images/v2/banks/doha-bank.png"),
  "emirates-nbd": require("@/assets/images/v2/banks/emirates-nbd.png"),
  "esaf-small-finance-bank-ltd": require("@/assets/images/v2/banks/esaf-small-finance-bank-ltd.png"),
  "fino-payments-bank": require("@/assets/images/v2/banks/fino-payments-bank.png"),
  "first-abu-dhabi-bank": require("@/assets/images/v2/banks/first-abu-dhabi-bank.png"),
  "firstrand-bank": require("@/assets/images/v2/banks/firstrand-bank.png"),
  "hdfc-bank": require("@/assets/images/v2/banks/hdfc-bank.png"),
  "hsbc-bank": require("@/assets/images/v2/banks/hsbc-bank.png"),
  "icici-bank": require("@/assets/images/v2/banks/icici-bank.png"),
  "idbi-bank": require("@/assets/images/v2/banks/idbi-bank.png"),
  "idfc-bank": require("@/assets/images/v2/banks/idfc-bank.png"),
  "india-post-payments-bank": require("@/assets/images/v2/banks/india-post-payments-bank.png"),
  "indian-bank": require("@/assets/images/v2/banks/indian-bank.png"),
  "indian-overseas-bank": require("@/assets/images/v2/banks/indian-overseas-bank.png"),
  "induslnd-bank": require("@/assets/images/v2/banks/induslnd-bank.png"),
  "industrial-and-commercial-bank-of-china": require("@/assets/images/v2/banks/industrial-and-commercial-bank-of-china.png"),
  "industrial-bank-of-korea": require("@/assets/images/v2/banks/industrial-bank-of-korea.png"),
  "jammu-and-kashmir-bank": require("@/assets/images/v2/banks/jammu-and-kashmir-bank.png"),
  "jio-payments-bank": require("@/assets/images/v2/banks/jio-payments-bank.png"),
  "jpmorgan-chase": require("@/assets/images/v2/banks/jpmorgan-chase.png"),
  "karnataka-bank": require("@/assets/images/v2/banks/karnataka-bank.png"),
  "keb-hana-bank": require("@/assets/images/v2/banks/keb-hana-bank.png"),
  "kookmin-bank": require("@/assets/images/v2/banks/kookmin-bank.png"),
  "kotak-mahindra-bank": require("@/assets/images/v2/banks/kotak-mahindra-bank.png"),
  "krung-thai-bank": require("@/assets/images/v2/banks/krung-thai-bank.png"),
  "mizuho-corporate-bank": require("@/assets/images/v2/banks/mizuho-corporate-bank.png"),
  "mufg-bank": require("@/assets/images/v2/banks/mufg-bank.png"),
  "nainital-bank": require("@/assets/images/v2/banks/nainital-bank.png"),
  "natwest-bank": require("@/assets/images/v2/banks/natwest-bank.png"),
  "paytm-payments-bank": require("@/assets/images/v2/banks/paytm-payments-bank.png"),
  "punjab-and-sind-bank": require("@/assets/images/v2/banks/punjab-and-sind-bank.png"),
  "punjab-national-bank": require("@/assets/images/v2/banks/punjab-national-bank.png"),
  "qatar-national-bank": require("@/assets/images/v2/banks/qatar-national-bank.png"),
  "rbl-bank": require("@/assets/images/v2/banks/rbl-bank.png"),
  "sberbank": require("@/assets/images/v2/banks/sberbank.png"),
  "scotia-bank": require("@/assets/images/v2/banks/scotia-bank.png"),
  "shinhan-bank": require("@/assets/images/v2/banks/shinhan-bank.png"),
  "societe-generale": require("@/assets/images/v2/banks/societe-generale.png"),
  "sonali-bank": require("@/assets/images/v2/banks/sonali-bank.png"),
  "south-indian-bank": require("@/assets/images/v2/banks/south-indian-bank.png"),
  "standard-chartered-bank": require("@/assets/images/v2/banks/standard-chartered-bank.png"),
  "state-bank-of-india": require("@/assets/images/v2/banks/state-bank-of-india.png"),
  "sumitomo-mitsui-banking-corporation": require("@/assets/images/v2/banks/sumitomo-mitsui-banking-corporation.png"),
  "tamilnad-mercantile-bank": require("@/assets/images/v2/banks/tamilnad-mercantile-bank.png"),
  "uco-bank": require("@/assets/images/v2/banks/uco-bank.png"),
  "ujjivan-small-finance-bank": require("@/assets/images/v2/banks/ujjivan-small-finance-bank.png"),
  "union-bank": require("@/assets/images/v2/banks/union-bank.png"),
  "united-overseas-bank": require("@/assets/images/v2/banks/united-overseas-bank.png"),
  "westpac": require("@/assets/images/v2/banks/westpac.png"),
  "woori-bank": require("@/assets/images/v2/banks/woori-bank.png"),
  "yes-bank": require("@/assets/images/v2/banks/yes-bank.png"),
};

function normalizeBankName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents (é→e, etc.)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, "") // remove non-alphanumeric
    .trim()
    .replace(/\s+/g, "-");
}

export function getBankLogo(bankName: string): ImageSourcePropType | null {
  return BANK_LOGOS[normalizeBankName(bankName)] ?? null;
}
