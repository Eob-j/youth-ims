export const youthPopulationExportConfig = {
  columns: [
    { key: "lga", header: "LGA", required: true },
    { key: "year", header: "Year", required: true },
    { key: "totalPopulation", header: "Total Population", required: true },
    { key: "youthPopulation", header: "Youth Population", required: true },
    {
      key: "youthShare",
      header: "Youth Share (%)",
      //   transform: (value) => Number(value).toFixed(2),
    },
    { key: "maleYouth", header: "Male Youth" },
    { key: "femaleYouth", header: "Female Youth" },
    { key: "urbanYouth", header: "Urban Youth" },
    { key: "ruralYouth", header: "Rural Youth" },
  ] as const,

  excludeFields: ["id", "version", "created_at", "updated_at"],
};

export const youthWithDisabilitiesExportConfig = {
  columns: [
    { key: "ageGroup", header: "Age Group", required: true },
    { key: "total", header: "Total", required: true },
    { key: "male", header: "Male", required: true },
    { key: "female", header: "Female", required: true },
    { key: "urban", header: "Urban", required: true },
    { key: "rural", header: "Rural", required: true },
    { key: "seeing", header: "Seeing", required: true },
    { key: "hearing", header: "Hearing", required: true },
    { key: "physical", header: "Physical", required: true },
    { key: "learning", header: "Learning", required: true },
    { key: "selfcare", header: "Self-care", required: true },
    { key: "speech", header: "Speech", required: true },
  ] as const,

  excludeFields: ["id", "version", "created_at", "updated_at"],
};

export const youthWithoutDisabilitiesExportConfig = {
  columns: [
    { key: "ageGroup", header: "Age Group", required: true },
    { key: "total", header: "Total", required: true },
    { key: "male", header: "Male", required: true },
    { key: "female", header: "Female", required: true },
    { key: "urban", header: "Urban", required: true },
    { key: "rural", header: "Rural", required: true },
  ] as const,

  excludeFields: ["id", "version", "created_at", "updated_at"],
};

export const humanTraffickingExportConfig = {
  columns: [
    { key: "lga", header: "LGA", required: true },
    { key: "year", header: "Year", required: true },
    { key: "total", header: "Total", required: true },
    { key: "male", header: "Male", required: true },
    { key: "female", header: "Female", required: true },
  ] as const,

  excludeFields: ["id", "version", "created_at", "updated_at"],
};

export const youthMigrationExportConfig = {
  columns: [
    { key: "year", header: "Year", required: true },
    { key: "total", header: "Total", required: true },
    { key: "male", header: "Male", required: true },
    { key: "female", header: "Female", required: true },
    { key: "origin", header: "Origin", required: true },
    { key: "destination", header: "Destination", required: true },
  ] as const,

  excludeFields: ["id", "version", "created_at", "updated_at"],
};

export const nediProgramsExportConfig = {
  columns: [
    { key: "programName", header: "Program Name", required: true },
    { key: "targetGroup", header: "Target Group", required: true },
    { key: "beneficiaries", header: "Beneficiaries", required: true },
    { key: "serviceType", header: "Service Type", required: true },
    { key: "description", header: "Description", required: true },
    { key: "status", header: "Status", required: true },
    { key: "location", header: "Location", required: true },
    { key: "maleParticipants", header: "Male Participants" },
    { key: "femaleParticipants", header: "Female Participants" },
    { key: "startDate", header: "Start Date", required: true },
    { key: "endDate", header: "End Date" },
    { key: "implementingPartner", header: "Implementing Partner" },
    { key: "fundingSource", header: "Funding Source" },
  ] as const,

  excludeFields: [],
};

export const nyssProgramsExportConfig = {
  columns: [
    { key: "programName", header: "Program Name", required: true },
    { key: "institution", header: "Institution", required: true },
    { key: "year", header: "Year", required: true },
    { key: "region", header: "Region", required: true },
    { key: "sector", header: "Sector", required: true },
    { key: "totalGraduates", header: "Total Graduates" },
    { key: "maleGraduates", header: "Male Graduates" },
    { key: "femaleGraduates", header: "Female Graduates" },
    { key: "employmentRate", header: "Employment Rate" },
  ] as const,

  excludeFields: [],
};

export const nyssGraduatesExportConfig = {
  columns: [
    { key: "name", header: "Name", required: true },
    { key: "age", header: "Age", required: true },
    { key: "gender", header: "Gender", required: true },
    { key: "region", header: "Region", required: true },
    { key: "trainingProgram", header: "Training Program", required: true },
    { key: "graduationYear", header: "Graduation Year", required: true },
    { key: "employmentStatus", header: "Employment Status", required: true },
    { key: "sector", header: "Sector", required: true },
  ] as const,

  excludeFields: [],
};

export const indicatorDataExportConfig = {
  columns: [
    { key: "organization", header: "Organization", required: true },
    { key: "indicator", header: "Indicator", required: true },
    { key: "year", header: "Year", required: true },
    { key: "region", header: "Region", required: true },
    { key: "category", header: "Category", required: true },
    { key: "male", header: "Male", required: true },
    { key: "female", header: "Female", required: true },
    { key: "total", header: "Total", required: true },
    { key: "referenceSource", header: "Reference Source", required: true },
  ] as const,

  excludeFields: ["created_at", "updated_at"],
};
