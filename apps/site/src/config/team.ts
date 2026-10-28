/**
 * Team members shown on the home team section and Sobre nosotras. Names, roles and bios come
 * from i18n (`team.<id>.*`); this file holds only what is not translated. Links are personal
 * profiles, so they live here and not in .env.
 */
export interface TeamMember {
  /** Key prefix in the i18n files: `team.<id>.name`, `.role`, `.text`. */
  id: "anna" | "sarolta";
  /** Shown in the avatar instead of a photo. */
  initials: string;
  linkedinUrl?: string;
}

export const team: readonly TeamMember[] = [
  { id: "anna", initials: "AL", linkedinUrl: "https://www.linkedin.com/in/anna-llorens-44111596/" },
  { id: "sarolta", initials: "SC" },
];
