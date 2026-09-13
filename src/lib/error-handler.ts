/**
 * Parse error response and extract user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  // Check if it's an API error with detail message
  if (error && typeof error === 'object') {
    if ('detail' in error && typeof error.detail === 'string') {
      return error.detail;
    }
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }

  // Fallback to generic error message
  return 'An error occurred. Please try again.';
}

/**
 * Check if error is a 403 Forbidden error
 */
export function is403Error(error: unknown): boolean {
  // Check if error has status property
  if (error && typeof error === 'object' && 'status' in error) {
    return error.status === 403;
  }
  
  // Check if error message contains "permission" (case-insensitive)
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('permission') || message.includes('forbidden');
}

/**
 * Get permission error message with available roles
 */
export function getPermissionErrorMessage(action: string, allowedRoles: string[]): string {
  const roleText = allowedRoles.length === 1 
    ? allowedRoles[0].replace(/_/g, ' ')
    : allowedRoles.slice(0, -1).map(r => r.replace(/_/g, ' ')).join(', ') + 
      ', and ' + allowedRoles[allowedRoles.length - 1].replace(/_/g, ' ');
  
  return `You do not have permission to ${action}. Only users with the following roles can perform this action: ${roleText}.`;
}

/**
 * Map operation endpoints to user-friendly messages
 */
type OperationType = 
  | 'bank_transaction_create'
  | 'bank_transaction_update'
  | 'bank_transaction_delete'
  | 'cash_transaction_create'
  | 'cash_transaction_update'
  | 'cash_transaction_delete'
  | 'cash_transaction_submit'
  | 'cash_transaction_approve'
  | 'cash_transaction_reject'
  | 'committee_member_create'
  | 'committee_member_update'
  | 'committee_member_delete'
  | 'harvest_create'
  | 'harvest_update'
  | 'harvest_delete'
  | 'forest_block_create'
  | 'forest_block_update'
  | 'forest_block_delete'
  | 'member_create'
  | 'member_update'
  | 'member_delete'
  | 'offense_create'
  | 'offense_update'
  | 'offense_delete'
  | 'unknown';

/**
 * Get context-aware 403 error message based on operation type
 */
export function get403ErrorMessage(operationType: OperationType): string {
  const messages: Record<OperationType, string> = {
    bank_transaction_create: 'Only Committee Chair, Secretary, and Staff can create bank transactions.',
    bank_transaction_update: 'Only Committee Chair, Secretary, and Staff can update bank transactions.',
    bank_transaction_delete: 'Only Committee Chair can delete bank transactions.',
    
    cash_transaction_create: 'Only Committee Chair, Secretary, and Staff can record cash transactions.',
    cash_transaction_update: 'Only Committee Chair, Secretary, and Staff can update cash transactions.',
    cash_transaction_delete: 'Only Committee Chair can delete cash transactions.',
    cash_transaction_submit: 'Only Secretary and Staff can submit transactions for approval.',
    cash_transaction_approve: 'Only Committee Chair can approve cash transactions.',
    cash_transaction_reject: 'Only Committee Chair can reject cash transactions.',
    
    committee_member_create: 'Only Committee Chair can add committee members.',
    committee_member_update: 'Only Committee Chair can update committee members.',
    committee_member_delete: 'Only Committee Chair can remove committee members.',
    
    harvest_create: 'Only Committee Chair, Secretary, and Staff can create harvest records.',
    harvest_update: 'Only Committee Chair, Secretary, and Staff can update harvest records.',
    harvest_delete: 'Only Committee Chair can delete harvest records.',
    
    forest_block_create: 'Only Committee Chair can create forest blocks.',
    forest_block_update: 'Only Committee Chair can update forest blocks.',
    forest_block_delete: 'Only Committee Chair can delete forest blocks.',
    
    member_create: 'Only Committee Chair can add members.',
    member_update: 'Only Committee Chair can update member information.',
    member_delete: 'Only Committee Chair can remove members.',
    
    offense_create: 'Only Committee Chair and authorized personnel can create offense reports.',
    offense_update: 'Only Committee Chair and authorized personnel can update offense reports.',
    offense_delete: 'Only Committee Chair can delete offense reports.',
    
    unknown: 'You do not have permission to perform this action. Contact your Committee Chair for access.',
  };
  
  return messages[operationType] || messages.unknown;
}

/**
 * Detect operation type from error context
 */
export function detectOperationType(endpoint?: string, method?: string): OperationType {
  if (!endpoint) return 'unknown';
  
  const lower = endpoint.toLowerCase();
  
  // Bank Transactions
  if (lower.includes('bank-transactions') || lower.includes('bank_transactions')) {
    if (method === 'POST') return 'bank_transaction_create';
    if (method === 'PUT' || method === 'PATCH') return 'bank_transaction_update';
    if (method === 'DELETE') return 'bank_transaction_delete';
  }
  
  // Committee Members
  if (lower.includes('committee-members') || lower.includes('committee_members')) {
    if (method === 'POST') return 'committee_member_create';
    if (method === 'PUT' || method === 'PATCH') return 'committee_member_update';
    if (method === 'DELETE') return 'committee_member_delete';
  }
  
  // Harvest Records
  if (lower.includes('harvest')) {
    if (method === 'POST') return 'harvest_create';
    if (method === 'PUT' || method === 'PATCH') return 'harvest_update';
    if (method === 'DELETE') return 'harvest_delete';
  }
  
  // Forest Blocks
  if (lower.includes('forest-block') || lower.includes('forest_block')) {
    if (method === 'POST') return 'forest_block_create';
    if (method === 'PUT' || method === 'PATCH') return 'forest_block_update';
    if (method === 'DELETE') return 'forest_block_delete';
  }
  
  // Members
  if (lower.includes('/members/') || lower.includes('member')) {
    if (method === 'POST') return 'member_create';
    if (method === 'PUT' || method === 'PATCH') return 'member_update';
    if (method === 'DELETE') return 'member_delete';
  }
  
  // Cash Transactions
  if (lower.includes('cash-transactions') || lower.includes('cash_transactions')) {
    if (lower.includes('submit')) return 'cash_transaction_submit';
    if (lower.includes('approve')) return 'cash_transaction_approve';
    if (lower.includes('reject')) return 'cash_transaction_reject';
    if (method === 'POST') return 'cash_transaction_create';
    if (method === 'PUT' || method === 'PATCH') return 'cash_transaction_update';
    if (method === 'DELETE') return 'cash_transaction_delete';
  }
  
  // Offense Reports
  if (lower.includes('offense') || lower.includes('offence')) {
    if (method === 'POST') return 'offense_create';
    if (method === 'PUT' || method === 'PATCH') return 'offense_update';
    if (method === 'DELETE') return 'offense_delete';
  }
  
  return 'unknown';
}

/**
 * Check if error is a permission denied error and extract operation type
 * Returns the appropriate 403 error message
 */
export function handle403Error(error: unknown, endpoint?: string, method?: string): string {
  if (!is403Error(error)) {
    return getErrorMessage(error);
  }
  
  const operationType = detectOperationType(endpoint, method);
  return get403ErrorMessage(operationType);
}
