export type SubjectVacancies = Record<string, number>;

export interface SchoolDict {
  [schoolName: string]: SubjectVacancies;
}

export interface QZPData {
  zone_vacancies: SubjectVacancies;
  // All other keys are municipality names containing schools
  [municipalityName: string]: SubjectVacancies | SchoolDict; 
}

export interface VacancyDatabase {
  [qzpName: string]: QZPData;
}