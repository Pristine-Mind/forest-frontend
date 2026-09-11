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
