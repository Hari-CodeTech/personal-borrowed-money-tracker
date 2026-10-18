/**
 * Initial dataset for Hari Satya Sai Puvvala's Personal Borrowed Money Tracker.
 * 
 * IMPORTANT:
 * - No historical dates are invented or required.
 * - Transactions are preserved separately.
 * - Categories: 'Close Family', 'Outer Family', 'Friends'
 * - Classifications:
 *   1. 'Personal Debt'
 *   2. 'Family Debt'
 *   3. 'Indirect / Not Directly Received'
 *   4. 'Informational Record'
 *   5. 'Unconfirmed'
 */

export const CATEGORIES = {
  CLOSE_FAMILY: 'Close Family',
  OUTER_FAMILY: 'Outer Family',
  FRIENDS: 'Friends'
};

export const DEBT_CLASSIFICATIONS = [
  'Personal Debt',
  'Family Debt',
  'Indirect / Not Directly Received',
  'Informational Record',
  'Unconfirmed'
];

export const VERIFIED_BENCHMARKS = {
  grandTotal: 572630,
  categoryTotals: {
    'Close Family': 435830,
    'Outer Family': 91000,
    'Friends': 45800
  },
  personTotals: {
    'Harsha': 123670,
    'Bhagravi': 66060,
    'Srinu Pedhananna': 203300,
    'Chakravathi': 14400,
    'Bindu': 8400,
    'Sai Hyd': 2500,
    'Sowji': 15000,
    'Madhu Pedhananna': 2500,
    'Vishu & Sailaja': 5000,
    'Janadhana': 5000,
    'ChinnaBullema and Family': 25000,
    'Saradi Uncle Garu': 35000,
    'Anjineyalu Garu': 6000,
    'Mohan': 5000,
    'Yerammma': 10000,
    'Vasu Uncle': 13800,
    'Prasad Uncle': 1000,
    'Subbarao Uncle': 31000
  }
};

export const INITIAL_PEOPLE = [
  // ================= CLOSE FAMILY =================
  {
    id: 'person-harsha',
    name: 'Harsha',
    category: 'Close Family',
    relationshipNotes: 'Close family member',
    isHighlighted: false
  },
  {
    id: 'person-bhagravi',
    name: 'Bhagravi',
    category: 'Close Family',
    relationshipNotes: 'Close family member',
    isHighlighted: false
  },
  {
    id: 'person-srinu-pedhananna',
    name: 'Srinu Pedhananna',
    category: 'Close Family',
    relationshipNotes: 'Pedhananna. Handled father\'s ceremony and major family events.',
    isHighlighted: true,
    highlightBadge: 'IMPORTANT FAMILY RECORD'
  },
  {
    id: 'person-chakravathi',
    name: 'Chakravathi',
    category: 'Close Family',
    relationshipNotes: '',
    isHighlighted: false
  },
  {
    id: 'person-bindu',
    name: 'Bindu',
    category: 'Close Family',
    relationshipNotes: '',
    isHighlighted: false
  },
  {
    id: 'person-sai-hyd',
    name: 'Sai Hyd',
    category: 'Close Family',
    relationshipNotes: 'Hyderabad',
    isHighlighted: false
  },
  {
    id: 'person-sowji',
    name: 'Sowji',
    category: 'Close Family',
    relationshipNotes: '',
    isHighlighted: false
  },
  {
    id: 'person-madhu-pedhananna',
    name: 'Madhu Pedhananna',
    category: 'Close Family',
    relationshipNotes: '',
    isHighlighted: false
  },

  // ================= OUTER FAMILY =================
  {
    id: 'person-vishu-sailaja',
    name: 'Vishu & Sailaja',
    category: 'Outer Family',
    relationshipNotes: '',
    isHighlighted: false
  },
  {
    id: 'person-janadhana',
    name: 'Janadhana',
    category: 'Outer Family',
    relationshipNotes: '',
    isHighlighted: false
  },
  {
    id: 'person-chinnabullema',
    name: 'ChinnaBullema and Family',
    category: 'Outer Family',
    relationshipNotes: '',
    isHighlighted: false
  },
  {
    id: 'person-saradi-uncle',
    name: 'Saradi Uncle Garu',
    category: 'Outer Family',
    relationshipNotes: '',
    isHighlighted: false
  },
  {
    id: 'person-anjineyalu-garu',
    name: 'Anjineyalu Garu',
    category: 'Outer Family',
    relationshipNotes: "From Ammamma's side",
    isHighlighted: false
  },
  {
    id: 'person-mohan',
    name: 'Mohan',
    category: 'Outer Family',
    relationshipNotes: '',
    isHighlighted: false
  },
  {
    id: 'person-yerammma',
    name: 'Yerammma',
    category: 'Outer Family',
    relationshipNotes: 'Indirect record. Not directly given to me.',
    isHighlighted: false
  },

  // ================= FRIENDS =================
  {
    id: 'person-vasu-uncle',
    name: 'Vasu Uncle',
    category: 'Friends',
    relationshipNotes: "Includes father's old dues and function expenses",
    isHighlighted: false
  },
  {
    id: 'person-prasad-uncle',
    name: 'Prasad Uncle',
    category: 'Friends',
    relationshipNotes: '',
    isHighlighted: false
  },
  {
    id: 'person-subbarao-uncle',
    name: 'Subbarao Uncle',
    category: 'Friends',
    relationshipNotes: "Includes old father's outstanding due",
    isHighlighted: false
  }
];

export const INITIAL_TRANSACTIONS = [
  // --- HARSHA (15 transactions = ₹1,23,670) ---
  {
    id: 'tx-harsha-1',
    personId: 'person-harsha',
    amount: 14600,
    reason: 'Rent for April and May',
    classification: 'Personal Debt',
    notes: 'Rent payment for two months',
    date: null
  },
  {
    id: 'tx-harsha-2',
    personId: 'person-harsha',
    amount: 570,
    reason: 'Mobile recharge',
    classification: 'Personal Debt',
    notes: '',
    date: null
  },
  {
    id: 'tx-harsha-3',
    personId: 'person-harsha',
    amount: 1000,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },
  {
    id: 'tx-harsha-4',
    personId: 'person-harsha',
    amount: 5500,
    reason: 'Bike repair',
    classification: 'Personal Debt',
    notes: 'Repairs for bike',
    date: null
  },
  {
    id: 'tx-harsha-5',
    personId: 'person-harsha',
    amount: 10000,
    reason: 'Rent in June',
    classification: 'Personal Debt',
    notes: 'Monthly rent',
    date: null
  },
  {
    id: 'tx-harsha-6',
    personId: 'person-harsha',
    amount: 1000,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },
  {
    id: 'tx-harsha-7',
    personId: 'person-harsha',
    amount: 10000,
    reason: 'Rent in July',
    classification: 'Personal Debt',
    notes: 'Monthly rent',
    date: null
  },
  {
    id: 'tx-harsha-8',
    personId: 'person-harsha',
    amount: 10000,
    reason: 'Rent in August',
    classification: 'Personal Debt',
    notes: 'Monthly rent',
    date: null
  },
  {
    id: 'tx-harsha-9',
    personId: 'person-harsha',
    amount: 10000,
    reason: 'Rent in September',
    classification: 'Personal Debt',
    notes: 'Monthly rent',
    date: null
  },
  {
    id: 'tx-harsha-10',
    personId: 'person-harsha',
    amount: 1000,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },
  {
    id: 'tx-harsha-11',
    personId: 'person-harsha',
    amount: 10000,
    reason: 'Rent in October',
    classification: 'Personal Debt',
    notes: 'Monthly rent',
    date: null
  },
  {
    id: 'tx-harsha-12',
    personId: 'person-harsha',
    amount: 10000,
    reason: 'Rent in November',
    classification: 'Personal Debt',
    notes: 'Monthly rent',
    date: null
  },
  {
    id: 'tx-harsha-13',
    personId: 'person-harsha',
    amount: 10000,
    reason: 'Rent in December',
    classification: 'Personal Debt',
    notes: 'Monthly rent',
    date: null
  },
  {
    id: 'tx-harsha-14',
    personId: 'person-harsha',
    amount: 10000,
    reason: 'Rent in January',
    classification: 'Personal Debt',
    notes: 'Monthly rent',
    date: null
  },
  {
    id: 'tx-harsha-15',
    personId: 'person-harsha',
    amount: 10000,
    reason: 'Rent in February',
    classification: 'Personal Debt',
    notes: 'Monthly rent',
    date: null
  },
  {
    id: 'tx-harsha-16',
    personId: 'person-harsha',
    amount: 10000,
    reason: 'Rent in March',
    classification: 'Personal Debt',
    notes: 'Monthly rent (completes annual rental cycle)',
    date: null
  },

  // --- BHAGRAVI (8 transactions = ₹66,060) ---
  {
    id: 'tx-bhagravi-1',
    personId: 'person-bhagravi',
    amount: 1500,
    reason: 'Shoes - Gift',
    classification: 'Personal Debt',
    notes: 'Gift shoes',
    date: null
  },
  {
    id: 'tx-bhagravi-2',
    personId: 'person-bhagravi',
    amount: 2500,
    reason: 'Watch - Gift',
    classification: 'Personal Debt',
    notes: 'Gift watch',
    date: null
  },
  {
    id: 'tx-bhagravi-3',
    personId: 'person-bhagravi',
    amount: 280,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },
  {
    id: 'tx-bhagravi-4',
    personId: 'person-bhagravi',
    amount: 180,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },
  {
    id: 'tx-bhagravi-5',
    personId: 'person-bhagravi',
    amount: 54000,
    reason: 'Laptop',
    classification: 'Personal Debt',
    notes: 'Laptop purchase assistance',
    date: null
  },
  {
    id: 'tx-bhagravi-6',
    personId: 'person-bhagravi',
    amount: 5000,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },
  {
    id: 'tx-bhagravi-7',
    personId: 'person-bhagravi',
    amount: 600,
    reason: 'Personal expenses',
    classification: 'Personal Debt',
    notes: '',
    date: null
  },
  {
    id: 'tx-bhagravi-8',
    personId: 'person-bhagravi',
    amount: 2000,
    reason: 'PG fee shortfall',
    classification: 'Personal Debt',
    notes: 'PG accommodation fee balance',
    date: null
  },

  // --- SRINU PEDHANANNA (4 transactions = ₹2,03,300) ---
  {
    id: 'tx-srinu-1',
    personId: 'person-srinu-pedhananna',
    amount: 200000,
    reason: "Father's function and ceremony related expenses",
    classification: 'Family Debt',
    notes: "Primary major family event expenditure. Do not merge with personal dues.",
    date: null,
    isPrimaryHighlight: true
  },
  {
    id: 'tx-srinu-2',
    personId: 'person-srinu-pedhananna',
    amount: 2000,
    reason: 'Personal use - needs confirmation',
    classification: 'Unconfirmed',
    notes: 'Needs confirmation before treating as personal debt',
    date: null
  },
  {
    id: 'tx-srinu-3',
    personId: 'person-srinu-pedhananna',
    amount: 300,
    reason: 'Personal use - needs confirmation',
    classification: 'Unconfirmed',
    notes: 'Needs confirmation before treating as personal debt',
    date: null
  },
  {
    id: 'tx-srinu-4',
    personId: 'person-srinu-pedhananna',
    amount: 1000,
    reason: 'Personal use - needs confirmation',
    classification: 'Unconfirmed',
    notes: 'Needs confirmation before treating as personal debt',
    date: null
  },

  // --- CHAKRAVATHI (4 transactions = ₹14,400) ---
  {
    id: 'tx-chakravathi-1',
    personId: 'person-chakravathi',
    amount: 900,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },
  {
    id: 'tx-chakravathi-2',
    personId: 'person-chakravathi',
    amount: 9000,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },
  {
    id: 'tx-chakravathi-3',
    personId: 'person-chakravathi',
    amount: 3000,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },
  {
    id: 'tx-chakravathi-4',
    personId: 'person-chakravathi',
    amount: 1500,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },

  // --- BINDU (4 transactions = ₹8,400) ---
  {
    id: 'tx-bindu-1',
    personId: 'person-bindu',
    amount: 3000,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },
  {
    id: 'tx-bindu-2',
    personId: 'person-bindu',
    amount: 1500,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },
  {
    id: 'tx-bindu-3',
    personId: 'person-bindu',
    amount: 1400,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },
  {
    id: 'tx-bindu-4',
    personId: 'person-bindu',
    amount: 2500,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },

  // --- SAI HYD (1 transaction = ₹2,500) ---
  {
    id: 'tx-sai-hyd-1',
    personId: 'person-sai-hyd',
    amount: 2500,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },

  // --- SOWJI (1 transaction = ₹15,000) ---
  {
    id: 'tx-sowji-1',
    personId: 'person-sowji',
    amount: 15000,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },

  // --- MADHU PEDHANANNA (2 transactions = ₹2,500) ---
  {
    id: 'tx-madhu-1',
    personId: 'person-madhu-pedhananna',
    amount: 500,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },
  {
    id: 'tx-madhu-2',
    personId: 'person-madhu-pedhananna',
    amount: 2000,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },

  // ================= OUTER FAMILY =================
  // --- VISHU & SAILAJA (1 transaction = ₹5,000) ---
  {
    id: 'tx-vishu-sailaja-1',
    personId: 'person-vishu-sailaja',
    amount: 5000,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },

  // --- JANADHANA (1 transaction = ₹5,000) ---
  {
    id: 'tx-janadhana-1',
    personId: 'person-janadhana',
    amount: 5000,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },

  // --- CHINNABULLEMA AND FAMILY (1 transaction = ₹25,000) ---
  {
    id: 'tx-chinnabullema-1',
    personId: 'person-chinnabullema',
    amount: 25000,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },

  // --- SARADI UNCLE GARU (1 transaction = ₹35,000) ---
  {
    id: 'tx-saradi-1',
    personId: 'person-saradi-uncle',
    amount: 35000,
    reason: 'Fee',
    classification: 'Personal Debt',
    notes: 'Educational/course fee',
    date: null
  },

  // --- ANJINEYALU GARU (2 transactions = ₹6,000) ---
  {
    id: 'tx-anjineyalu-1',
    personId: 'person-anjineyalu-garu',
    amount: 1000,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },
  {
    id: 'tx-anjineyalu-2',
    personId: 'person-anjineyalu-garu',
    amount: 5000,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },

  // --- MOHAN (1 transaction = ₹5,000) ---
  {
    id: 'tx-mohan-1',
    personId: 'person-mohan',
    amount: 5000,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },

  // --- YERAMMMA (1 transaction = ₹10,000) ---
  {
    id: 'tx-yerammma-1',
    personId: 'person-yerammma',
    amount: 10000,
    reason: 'Indirect transaction',
    classification: 'Indirect / Not Directly Received',
    notes: 'This money was not directly given to me. Do not automatically count this as money personally received by me.',
    date: null
  },

  // ================= FRIENDS =================
  // --- VASU UNCLE (4 transactions = ₹13,800) ---
  {
    id: 'tx-vasu-1',
    personId: 'person-vasu-uncle',
    amount: 10000,
    reason: "Father's outstanding due",
    classification: 'Family Debt',
    notes: "Father's past outstanding obligation",
    date: null
  },
  {
    id: 'tx-vasu-2',
    personId: 'person-vasu-uncle',
    amount: 2500,
    reason: "Father's function related",
    classification: 'Family Debt',
    notes: "Father's function expenses",
    date: null
  },
  {
    id: 'tx-vasu-3',
    personId: 'person-vasu-uncle',
    amount: 300,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },
  {
    id: 'tx-vasu-4',
    personId: 'person-vasu-uncle',
    amount: 1000,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },

  // --- PRASAD UNCLE (1 transaction = ₹1,000) ---
  {
    id: 'tx-prasad-1',
    personId: 'person-prasad-uncle',
    amount: 1000,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },

  // --- SUBBARAO UNCLE (2 transactions = ₹31,000) ---
  {
    id: 'tx-subbarao-1',
    personId: 'person-subbarao-uncle',
    amount: 6000,
    reason: 'Not specified',
    classification: 'Unconfirmed',
    notes: '',
    date: null
  },
  {
    id: 'tx-subbarao-2',
    personId: 'person-subbarao-uncle',
    amount: 25000,
    reason: "Old father's outstanding due",
    classification: 'Family Debt',
    notes: "Old father's outstanding due. Keep separate from personal debt.",
    date: null
  }
];

export const INITIAL_REPAYMENTS = [
  // Initially no repayments recorded yet, but structure is ready
];
