/**
 * Founders shown on the About page. Names, roles and bios come
 * from i18n (`team.<id>.*`); this file holds only what is not translated. Links are personal
 * profiles, so they live here and not in .env.
 */
export interface TeamMember {
  /** Key prefix in the i18n files: `team.<id>.name`, `.role`, `.text`. */
  id: "anna" | "sarolta";
  linkedinUrl?: string;
}

export const team: readonly TeamMember[] = [
  { id: "anna", linkedinUrl: "https://www.linkedin.com/in/anna-llorens-44111596/" },
  { id: "sarolta" },
];
