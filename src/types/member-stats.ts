/**
 * Member Statistics Response Type
 */

export interface HouseholdDetails {
  id: number;
  household_head_name: string;
  tole: string;
  wealth_class: string;
  population_male: number;
  population_female: number;
  livestock_cattle: number;
  livestock_buffalo: number;
  livestock_goat: number;
  education_level: string;
  occupation: string;
  caste_ethnicity: string;
  registration_date: string;
  entry_fee_type: string;
  entry_fee_due: string;
  status: string;
}

export interface LastRenewal {
  fiscal_year: string;
  fee_tier: string;
  fee_charged: string;
  paid_date: string;
}

export interface MemberStats {
  id: number;
  full_name: string;
  citizenship_no: string;
  membership_type: string;
  membership_status: string;
  date_joined: string;
  
  household_details: HouseholdDetails;
  user_email?: string;
  user_role?: string;
  
  // Renewal Statistics
  renewals_count: number;
  total_renewal_fees_paid: string;
  last_renewal?: LastRenewal;
  current_fee_tier: string;
  
  // Committee Statistics
  committee_roles_count: number;
  candidacies_count: number;
  
  // Fee Collection Statistics
  fee_collections_count: number;
  total_fees_collected: string;
  
  // Harvest Statistics
  harvest_requests_count: number;
  harvest_requests_approved: number;
  harvest_requests_pending: number;
  
  // Sales Statistics
  sales_count: number;
  total_sales_amount: string;
  
  // Offense & Patrol Statistics
  offense_reports_filed: number;
  informant_rewards_received: string;
  patrol_logs_count: number;
  
  // Loan & Livelihood Statistics
  revolving_loans_count: number;
  revolving_loans_amount: string;
  livelihood_programs_count: number;
  
  created_at: string;
  updated_at: string;
}
