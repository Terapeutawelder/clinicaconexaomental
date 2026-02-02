/**
 * Extracts first three names from a full name
 */
function getFirstThreeNames(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 3) return fullName;
  return `${parts[0]} ${parts[1]} ${parts[2]}`;
}

/**
 * Formats a professional's name with the appropriate title (Dr. or Dra.)
 * based on their gender.
 * 
 * @param fullName - The full name of the professional
 * @param gender - The gender ('male', 'female', or 'other'), defaults to 'female'
 * @param shortName - If true, shows only first and last name
 * @returns The formatted name with Dr./Dra. prefix
 */
export function formatProfessionalName(
  fullName: string | null | undefined,
  gender: 'male' | 'female' | 'other' | null | undefined = 'female',
  shortName: boolean = false
): string {
  if (!fullName) return '';
  
  const name = shortName ? getFirstThreeNames(fullName) : fullName;
  
  // For 'other' gender, use gender-neutral "Dr." (common in Portuguese)
  const prefix = gender === 'male' ? 'Dr.' : gender === 'other' ? 'Dr.' : 'Dra.';
  return `${prefix} ${name}`;
}
