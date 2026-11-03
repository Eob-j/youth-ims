"use client";

// Import instructions shown in each table's "Import Data" dialog. Column names
// and order match the table in the UI and the headers in ./config.ts (or the
// custom import actions in server/actions). Calculated columns are left out.

import {
  ImportInstructions,
  type ImportColumn,
} from "@/components/import-instructions";
import { INDICATOR_ORGANIZATIONS } from "@/lib/schema/indicator-data";
import {
  NYC_ACTIVITY_CATEGORIES,
  NYC_ACTIVITY_FUNDERS,
  NYC_ACTIVITY_REGIONS,
  NYC_ACTIVITY_STATUSES,
} from "@/lib/schema/nyc-activities";
import { NSC_GENDERS, NSC_STATUSES } from "@/lib/schema/nsc-participants";
import { NYC_GENDERS, NYC_STATUSES } from "@/lib/schema/nyc-participants";

// "A, B or C"
function oneOf(values: readonly string[]) {
  return `${values.slice(0, -1).join(", ")} or ${values[values.length - 1]}`;
}

const wholeNumber = "Required. Whole number.";

const totalCalculated = (
  <>
    Total (Male + Female). If your file has a Total column, for example an
    exported file, it must equal Male + Female.
  </>
);

export function YouthPopulationImportInstructions() {
  return (
    <ImportInstructions
      templateFileName="youth-population-template.csv"
      columns={[
        { name: "LGA", description: "LGA name, e.g. Banjul. Required." },
        {
          name: "Total Population",
          description: "Total population of the LGA. Required.",
        },
        {
          name: "Male Youth",
          description:
            "Required. Added to Female Youth to give Youth Population, which cannot be more than Total Population.",
        },
        { name: "Female Youth", description: wholeNumber },
        {
          name: "Urban Youth",
          description: "Required. Urban + Rural must equal Male + Female Youth.",
        },
        { name: "Rural Youth", description: wholeNumber },
        { name: "Year", description: "e.g. 2024. Required." },
      ]}
      calculated={
        <>
          Youth Population (Male Youth + Female Youth) and Youth Share (%)
          (Youth Population ÷ Total Population × 100). If your file has them,
          for example an exported file, Youth Share is ignored and Youth
          Population must equal Male Youth + Female Youth.
        </>
      }
      rejectsWholeFile="breaks a total rule above, or repeats an LGA and Year that already exists"
      exampleRow="Banjul,26461,5123,5694,10817,0,2024"
    />
  );
}

const disabilityTypes: ImportColumn[] = [
  "Seeing",
  "Hearing",
  "Physical",
  "Learning",
  "Self-care",
  "Speech",
].map((name) => ({ name, description: wholeNumber }));

const ageGroupColumns: ImportColumn[] = [
  {
    name: "Age Group",
    description: "e.g. 15-19. Required. Each age group can appear only once.",
  },
  {
    name: "Male",
    description: "Required. Added to Female to give Total.",
  },
  { name: "Female", description: wholeNumber },
  {
    name: "Urban",
    description: "Required. Urban + Rural must equal Male + Female.",
  },
  { name: "Rural", description: wholeNumber },
];

export function YouthWithDisabilitiesImportInstructions() {
  return (
    <ImportInstructions
      templateFileName="youth-with-disabilities-template.csv"
      columns={[...ageGroupColumns, ...disabilityTypes]}
      calculated={totalCalculated}
      rejectsWholeFile="breaks a total rule above, or repeats an Age Group that already exists"
      exampleRow="15-19,735,733,734,734,450,423,398,365,360,505"
    />
  );
}

export function YouthWithoutDisabilitiesImportInstructions() {
  return (
    <ImportInstructions
      templateFileName="youth-without-disabilities-template.csv"
      columns={ageGroupColumns}
      calculated={totalCalculated}
      rejectsWholeFile="breaks a total rule above, or repeats an Age Group that already exists"
      exampleRow="15-19,735,733,734,734"
    />
  );
}

export function HumanTraffickingImportInstructions() {
  return (
    <ImportInstructions
      templateFileName="human-trafficking-template.csv"
      columns={[
        { name: "Year", description: "e.g. 2024. Required." },
        { name: "Male", description: "Required. Added to Female to give Total." },
        { name: "Female", description: wholeNumber },
        { name: "Age Group", description: "e.g. 15-19. Required." },
        { name: "LGA", description: "LGA name, e.g. Banjul. Required." },
      ]}
      calculated={totalCalculated}
      rejectsWholeFile="breaks the Total rule, or repeats a Year, Age Group and LGA that already exists"
      exampleRow="2024,12,8,15-19,Banjul"
    />
  );
}

export function YouthMigrationImportInstructions() {
  return (
    <ImportInstructions
      templateFileName="youth-migration-template.csv"
      columns={[
        { name: "Year", description: "e.g. 2024. Required." },
        { name: "Male", description: "Required. Added to Female to give Total." },
        { name: "Female", description: wholeNumber },
        { name: "Origin", description: "Where they left from. Required." },
        { name: "Destination", description: "Where they went. Required." },
      ]}
      calculated={totalCalculated}
      rejectsWholeFile="breaks the Total rule, or repeats a Year, Origin and Destination that already exists"
      exampleRow="2024,120,80,Banjul,Italy"
    />
  );
}

export function NediProgramsImportInstructions() {
  return (
    <ImportInstructions
      templateFileName="nedi-programs-template.csv"
      hasDates
      columns={[
        { name: "Program Name", description: "Required." },
        { name: "Target Group", description: "e.g. Youth 18-35. Required." },
        {
          name: "Beneficiaries",
          description: "Whole number. Left blank, it is saved as 0.",
        },
        { name: "Service Type", description: "e.g. Finance. Required." },
        {
          name: "Status",
          description: "Planned, Ongoing, Completed or Operational. Required.",
        },
        { name: "Location", description: "Required." },
        { name: "Partner", description: "Implementing partner. Required." },
        { name: "Start Date", description: "YYYY-MM-DD. Required." },
        { name: "End Date", description: "YYYY-MM-DD. Optional." },
        {
          name: "Description",
          description: "Required. Not shown in the table.",
        },
        {
          name: "Male Participants",
          description: "Whole number. Optional. Not shown in the table.",
        },
        {
          name: "Female Participants",
          description: "Whole number. Optional. Not shown in the table.",
        },
        {
          name: "Funding Source",
          description: "Required. Not shown in the table.",
        },
      ]}
      rejectsWholeFile="repeats a Program Name, Start Date and Location that already exists"
      exampleRow="Youth Agri Loans,Youth 18-35,250,Finance,Ongoing,Brikama,GIZ,2024-01-15,,Small loans for youth farmers,140,110,EU"
    />
  );
}

export function NyssProgramsImportInstructions() {
  return (
    <ImportInstructions
      templateFileName="nyss-programs-template.csv"
      columns={[
        { name: "Program Name", description: "Required." },
        { name: "Institution", description: "Required." },
        { name: "Year", description: "e.g. 2024. Required." },
        { name: "Region", description: "e.g. WCR. Required." },
        { name: "Sector", description: "e.g. Energy. Required." },
        {
          name: "Total",
          description: "Total graduates. Whole number. Left blank, it is saved as 0.",
        },
        {
          name: "Male",
          description: "Male graduates. Whole number. Left blank, it is saved as 0.",
        },
        {
          name: "Female",
          description:
            "Female graduates. Whole number. Left blank, it is saved as 0.",
        },
        {
          name: "Employment %",
          description: "Number, e.g. 62.5. Left blank, it is saved as 0.",
        },
      ]}
      exampleRow="Solar Installation,GTTI,2024,WCR,Energy,40,25,15,62.5"
    />
  );
}

export function NyssGraduatesImportInstructions() {
  return (
    <ImportInstructions
      templateFileName="nyss-graduates-template.csv"
      columns={[
        { name: "Name", description: "Required." },
        { name: "Age", description: "Whole number." },
        { name: "Gender", description: "e.g. Female. Required." },
        { name: "Region", description: "e.g. CRR. Required." },
        { name: "Training Program", description: "Required." },
        { name: "Graduation Year", description: "e.g. 2024. Required." },
        { name: "Employment Status", description: "e.g. Employed. Required." },
        { name: "Sector", description: "e.g. Fashion. Required." },
      ]}
      exampleRow="Fatou Sowe,23,Female,CRR,Tailoring,2024,Employed,Fashion"
    />
  );
}

export function IndicatorDataImportInstructions() {
  return (
    <ImportInstructions
      templateFileName="indicator-data-template.csv"
      columns={[
        {
          name: "Organization",
          description: `${oneOf(INDICATOR_ORGANIZATIONS)}. Required.`,
        },
        { name: "Year", description: "e.g. 2024. Required." },
        { name: "Region", description: "e.g. GBA. Required." },
        {
          name: "Category",
          description:
            "Finance, Training or Sport Financing. Anything else is saved as Training.",
        },
        {
          name: "Male",
          description: "Whole number. Added to Female to give Total.",
        },
        { name: "Female", description: "Whole number." },
        { name: "Indicator", description: "What was measured. Required." },
        {
          name: "Reference Source",
          description: "Where the figures come from. Required. Not shown in the table.",
        },
      ]}
      calculated={totalCalculated}
      rejectsWholeFile="has a Total that does not equal Male + Female"
      exampleRow="NEDI,2024,GBA,Finance,120,80,Youth enterprises financed,NEDI annual report 2024"
    />
  );
}

function participantColumns(
  genders: readonly string[],
  statuses: readonly string[],
): ImportColumn[] {
  return [
    { name: "Name", description: "Required." },
    { name: "Age", description: "Whole number." },
    { name: "Gender", description: `${oneOf(genders)}, exactly as written. Required.` },
    { name: "Region", description: "e.g. Banjul. Required." },
    { name: "Category", description: "e.g. Amateur. Required." },
    { name: "Sport", description: "e.g. Football. Required." },
    { name: "Level", description: "e.g. Intermediate. Required." },
    {
      name: "Status",
      description: `${oneOf(statuses)}, exactly as written. Left blank, it is saved as ${statuses[0]}.`,
    },
    { name: "Achievements", description: "Optional." },
    { name: "Date Registered", description: "YYYY-MM-DD. Required." },
    { name: "Contact", description: "Optional." },
  ];
}

export function NycParticipantsImportInstructions() {
  return (
    <ImportInstructions
      templateFileName="nyc-participants-template.csv"
      hasDates
      columns={participantColumns(NYC_GENDERS, NYC_STATUSES)}
      exampleRow="Awa Jallow,22,Female,Banjul,Amateur,Football,Intermediate,Active,,2024-03-01,"
    />
  );
}

export function NscParticipantsImportInstructions() {
  return (
    <ImportInstructions
      templateFileName="nsc-participants-template.csv"
      hasDates
      columns={participantColumns(NSC_GENDERS, NSC_STATUSES)}
      exampleRow="Lamin Ceesay,24,Male,KM,Professional,Athletics,Advanced,Active,National champion 2023,2024-02-10,7012345"
    />
  );
}

export function NycActivitiesImportInstructions() {
  return (
    <ImportInstructions
      templateFileName="nyc-activities-template.csv"
      columns={[
        { name: "Activity", description: "Activity name. Required." },
        {
          name: "Coverage",
          description: `Region: ${oneOf(NYC_ACTIVITY_REGIONS)}, exactly as written. Required.`,
        },
        { name: "Year", description: "e.g. 2024. Cannot be in the future." },
        { name: "Output", description: "Number of beneficiaries. Whole number." },
        {
          name: "Funder",
          description: `${oneOf(NYC_ACTIVITY_FUNDERS)}, exactly as written. Required.`,
        },
        {
          name: "Status",
          description: `${oneOf(NYC_ACTIVITY_STATUSES)}, exactly as written. Left blank, it is saved as Planned.`,
        },
        {
          name: "Category",
          description: `${oneOf(NYC_ACTIVITY_CATEGORIES)}, exactly as written. Required. Not shown in the table.`,
        },
        {
          name: "Male",
          description: "Whole number. Not shown in the table.",
        },
        {
          name: "Female",
          description: "Whole number. Not shown in the table.",
        },
        {
          name: "Description",
          description: "Required. Not shown in the table.",
        },
      ]}
      exampleRow="Youth Leadership Camp,GBA,2024,150,UNDP,Completed,Leadership Development,80,70,Three-day leadership training"
    />
  );
}
