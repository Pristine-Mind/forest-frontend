/**
 * Member Search Result - can be either Household or Member
 */
export interface MemberSearchResult {
  id: number;
  name: string;
  type: 'household' | 'member';
  content_type: 'household' | 'member';
  object_id: number;
  tole?: string;
  household_name?: string;
}

/**
 * Committee Member Form Data
 */
export interface CommitteeMemberFormData {
  member: MemberSearchResult | null;
  position: CommitteeMemberPosition;
  gender: string;
  caste_ethnicity?: string;
  term_start: string; // ISO date string
  term_end: string;   // ISO date string
  status: CommitteeMemberStatus;
  subcommittees: number[]; // array of SubCommittee IDs
  photo?: File;
}

/**
 * Committee Member API Request
 */
export interface CommitteeMemberRequest {
  content_type: 'household' | 'member';
  object_id: number;
  position: CommitteeMemberPosition;
  gender: string;
  caste_ethnicity?: string;
  term_start: string;
  term_end: string;
  status: CommitteeMemberStatus;
  subcommittees: number[];
  photo?: File;
}

export type CommitteeMemberPosition = 
  | 'chair' 
  | 'vice_chair' 
  | 'secretary' 
  | 'joint_secretary' 
  | 'treasurer' 
  | 'member';

export type CommitteeMemberStatus = 
  | 'active' 
  | 'vacant' 
  | 'removed';
