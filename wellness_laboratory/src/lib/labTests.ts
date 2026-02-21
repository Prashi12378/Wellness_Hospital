export interface LabTestParameter {
    name: string;
    unit: string;
    refRange: string;
    category: string;
}

export const LAB_TEST_PARAMETERS: LabTestParameter[] = [

    // ═══════════════════════════════════════════════════════════
    //  PATHOLOGY — A. HEMATOLOGY
    // ═══════════════════════════════════════════════════════════
    { name: "Haemoglobin", unit: "g/dL", refRange: "13.0 - 17.0", category: "Hematology" },
    { name: "Haemoglobin (Female)", unit: "g/dL", refRange: "12.0 - 15.0", category: "Hematology" },
    { name: "TLC (Total Leucocyte Count)", unit: "cells/cumm", refRange: "4000 - 11000", category: "Hematology" },
    { name: "DLC (Differential Leucocyte Count)", unit: "-", refRange: "-", category: "Hematology" },
    { name: "Neutrophils", unit: "%", refRange: "40 - 80", category: "Hematology" },
    { name: "Lymphocytes", unit: "%", refRange: "20 - 40", category: "Hematology" },
    { name: "Eosinophils", unit: "%", refRange: "1 - 6", category: "Hematology" },
    { name: "Monocytes", unit: "%", refRange: "2 - 10", category: "Hematology" },
    { name: "Basophils", unit: "%", refRange: "0 - 2", category: "Hematology" },
    { name: "RBC Count", unit: "million/cumm", refRange: "4.5 - 5.5", category: "Hematology" },
    { name: "Eosinophil Count", unit: "cells/cumm", refRange: "40 - 440", category: "Hematology" },
    { name: "Platelet Count", unit: "lakhs/cumm", refRange: "1.5 - 4.0", category: "Hematology" },
    { name: "Bleeding Time (BT)", unit: "min", refRange: "1 - 6", category: "Hematology" },
    { name: "Clotting Time (CT)", unit: "min", refRange: "4 - 9", category: "Hematology" },
    { name: "ESR", unit: "mm/hr", refRange: "0 - 15", category: "Hematology" },
    { name: "PCV / Hematocrit", unit: "%", refRange: "40 - 50", category: "Hematology" },
    { name: "Complete Hemogram", unit: "-", refRange: "-", category: "Hematology" },
    { name: "PBF for Type of Anemia", unit: "-", refRange: "-", category: "Hematology" },
    { name: "Peripheral Blood Smear", unit: "-", refRange: "-", category: "Hematology" },
    { name: "Blood Grouping", unit: "-", refRange: "-", category: "Hematology" },
    { name: "Rh Factor", unit: "-", refRange: "-", category: "Hematology" },
    { name: "Prothrombin Time (PT)", unit: "seconds", refRange: "11 - 16", category: "Hematology" },
    { name: "INR", unit: "-", refRange: "0.8 - 1.2", category: "Hematology" },
    { name: "PT / INR", unit: "-", refRange: "-", category: "Hematology" },
    { name: "APTT", unit: "seconds", refRange: "25 - 35", category: "Hematology" },
    { name: "G6PD", unit: "U/g Hb", refRange: "4.6 - 13.5", category: "Hematology" },
    { name: "Reticulocyte Count", unit: "%", refRange: "0.5 - 2.5", category: "Hematology" },
    { name: "D-Dimer", unit: "ng/mL", refRange: "< 500", category: "Hematology" },
    { name: "Screening Test for Hemoglobinopathies", unit: "-", refRange: "-", category: "Hematology" },
    { name: "MCV", unit: "fL", refRange: "83 - 101", category: "Hematology" },
    { name: "MCH", unit: "pg", refRange: "27 - 32", category: "Hematology" },
    { name: "MCHC", unit: "g/dL", refRange: "31.5 - 34.5", category: "Hematology" },
    { name: "RDW-CV", unit: "%", refRange: "11.6 - 14.0", category: "Hematology" },
    { name: "MPV", unit: "fL", refRange: "7.4 - 10.4", category: "Hematology" },
    { name: "Fibrinogen", unit: "mg/dL", refRange: "200 - 400", category: "Hematology" },

    // ═══════════════════════════════════════════════════════════
    //  PATHOLOGY — B. URINE EXAMINATION
    // ═══════════════════════════════════════════════════════════
    { name: "Microscopic Exam (Urine)", unit: "-", refRange: "-", category: "Urine Examination" },
    { name: "Urine Sugar", unit: "-", refRange: "Nil", category: "Urine Examination" },
    { name: "Urine Albumin", unit: "-", refRange: "Nil", category: "Urine Examination" },
    { name: "Urine Bile Salts", unit: "-", refRange: "Absent", category: "Urine Examination" },
    { name: "Urine Bile Pigments", unit: "-", refRange: "Absent", category: "Urine Examination" },
    { name: "Urinary pH", unit: "-", refRange: "4.6 - 8.0", category: "Urine Examination" },
    { name: "Urine for RBC", unit: "/HPF", refRange: "0 - 2", category: "Urine Examination" },
    { name: "Urine for Ketone Bodies", unit: "-", refRange: "Nil", category: "Urine Examination" },
    { name: "Urine for Pregnancy", unit: "-", refRange: "-", category: "Urine Examination" },
    { name: "Urine for Bilirubin", unit: "-", refRange: "Nil", category: "Urine Examination" },
    { name: "Urine Specific Gravity", unit: "-", refRange: "1.003 - 1.035", category: "Urine Examination" },
    { name: "Urine Urobilinogen", unit: "-", refRange: "Normal", category: "Urine Examination" },
    { name: "Urine Leucocytes", unit: "/HPF", refRange: "0 - 5", category: "Urine Examination" },
    { name: "Urine Nitrite", unit: "-", refRange: "Negative", category: "Urine Examination" },
    { name: "Urine Colour", unit: "-", refRange: "Pale Yellow", category: "Urine Examination" },
    { name: "Urine Appearance", unit: "-", refRange: "Clear", category: "Urine Examination" },
    { name: "Urine Protein", unit: "-", refRange: "Nil", category: "Urine Examination" },
    { name: "Urine Pus Cells", unit: "/HPF", refRange: "0 - 5", category: "Urine Examination" },
    { name: "Urine Epithelial Cells", unit: "/HPF", refRange: "Few", category: "Urine Examination" },
    { name: "Urine Casts", unit: "-", refRange: "Nil", category: "Urine Examination" },
    { name: "Urine Crystals", unit: "-", refRange: "Nil", category: "Urine Examination" },

    // ═══════════════════════════════════════════════════════════
    //  PATHOLOGY — C. SEMEN ANALYSIS
    // ═══════════════════════════════════════════════════════════
    { name: "Semen Analysis", unit: "-", refRange: "-", category: "Semen Analysis" },

    // ═══════════════════════════════════════════════════════════
    //  PATHOLOGY — D. CYTOLOGY
    // ═══════════════════════════════════════════════════════════
    { name: "FNAC", unit: "-", refRange: "-", category: "Cytology" },
    { name: "PAP Smear", unit: "-", refRange: "-", category: "Cytology" },
    { name: "Body Fluids Analysis", unit: "-", refRange: "-", category: "Cytology" },
    { name: "CSF Microscopy", unit: "-", refRange: "-", category: "Cytology" },

    // ═══════════════════════════════════════════════════════════
    //  PATHOLOGY — E. HISTOPATHOLOGY
    // ═══════════════════════════════════════════════════════════
    { name: "Whole Specimens / Biopsy Specimens", unit: "-", refRange: "-", category: "Histopathology" },
    { name: "Postmortem Specimens", unit: "-", refRange: "-", category: "Histopathology" },

    // ═══════════════════════════════════════════════════════════
    //  BIOCHEMISTRY
    // ═══════════════════════════════════════════════════════════
    { name: "Blood Glucose (Fasting)", unit: "mg/dL", refRange: "70 - 100", category: "Biochemistry" },
    { name: "Blood Glucose (PP)", unit: "mg/dL", refRange: "Up to 140", category: "Biochemistry" },
    { name: "Blood Glucose (Random)", unit: "mg/dL", refRange: "70 - 140", category: "Biochemistry" },
    { name: "Blood Urea", unit: "mg/dL", refRange: "15 - 40", category: "Biochemistry" },
    { name: "Blood Urea Nitrogen (BUN)", unit: "mg/dL", refRange: "7 - 20", category: "Biochemistry" },
    { name: "Serum Creatinine", unit: "mg/dL", refRange: "0.7 - 1.3", category: "Biochemistry" },
    { name: "Serum Bilirubin Total", unit: "mg/dL", refRange: "0.1 - 1.2", category: "Biochemistry" },
    { name: "Direct Bilirubin", unit: "mg/dL", refRange: "0.0 - 0.3", category: "Biochemistry" },
    { name: "Indirect Bilirubin", unit: "mg/dL", refRange: "0.1 - 0.9", category: "Biochemistry" },
    { name: "Total Protein", unit: "g/dL", refRange: "6.0 - 8.3", category: "Biochemistry" },
    { name: "Serum Albumin", unit: "g/dL", refRange: "3.5 - 5.5", category: "Biochemistry" },
    { name: "Globulin", unit: "g/dL", refRange: "2.0 - 3.5", category: "Biochemistry" },
    { name: "A/G Ratio", unit: "-", refRange: "1.2 - 2.2", category: "Biochemistry" },
    { name: "Serum Calcium", unit: "mg/dL", refRange: "8.5 - 10.5", category: "Biochemistry" },
    { name: "Ionized Calcium", unit: "mg/dL", refRange: "4.6 - 5.3", category: "Biochemistry" },
    { name: "Serum Phosphorus", unit: "mg/dL", refRange: "2.5 - 4.5", category: "Biochemistry" },
    { name: "Serum Uric Acid", unit: "mg/dL", refRange: "3.5 - 7.2", category: "Biochemistry" },
    { name: "Total Cholesterol", unit: "mg/dL", refRange: "Up to 200", category: "Biochemistry" },
    { name: "Triglycerides", unit: "mg/dL", refRange: "Up to 150", category: "Biochemistry" },
    { name: "HDL Cholesterol", unit: "mg/dL", refRange: "40 - 60", category: "Biochemistry" },
    { name: "LDL Cholesterol", unit: "mg/dL", refRange: "Up to 100", category: "Biochemistry" },
    { name: "VLDL Cholesterol", unit: "mg/dL", refRange: "Up to 30", category: "Biochemistry" },
    { name: "Total Cholesterol / HDL Ratio", unit: "-", refRange: "Up to 5.0", category: "Biochemistry" },
    { name: "Serum Sodium", unit: "mEq/L", refRange: "136 - 146", category: "Biochemistry" },
    { name: "Serum Potassium", unit: "mEq/L", refRange: "3.5 - 5.1", category: "Biochemistry" },
    { name: "Serum Chloride", unit: "mEq/L", refRange: "98 - 106", category: "Biochemistry" },
    { name: "Serum Lithium", unit: "mEq/L", refRange: "0.6 - 1.2", category: "Biochemistry" },
    { name: "Serum Magnesium", unit: "mg/dL", refRange: "1.6 - 2.6", category: "Biochemistry" },
    { name: "S. SGOT (AST)", unit: "U/L", refRange: "0 - 40", category: "Biochemistry" },
    { name: "S. SGPT (ALT)", unit: "U/L", refRange: "0 - 41", category: "Biochemistry" },
    { name: "ALP (Alkaline Phosphatase)", unit: "U/L", refRange: "44 - 147", category: "Biochemistry" },
    { name: "Amylase", unit: "U/L", refRange: "28 - 100", category: "Biochemistry" },
    { name: "Lipase", unit: "U/L", refRange: "0 - 160", category: "Biochemistry" },
    { name: "CPK-MB", unit: "U/L", refRange: "0 - 25", category: "Biochemistry" },
    { name: "CPK (Total)", unit: "U/L", refRange: "39 - 308", category: "Biochemistry" },
    { name: "Serum Iron", unit: "µg/dL", refRange: "60 - 170", category: "Biochemistry" },
    { name: "TIBC", unit: "µg/dL", refRange: "250 - 370", category: "Biochemistry" },
    { name: "UIBC (Unsaturated Iron Binding Capacity)", unit: "µg/dL", refRange: "110 - 370", category: "Biochemistry" },
    { name: "Procalcitonin (PCT)", unit: "ng/mL", refRange: "< 0.5", category: "Biochemistry" },
    { name: "GGT (Gamma Glutamyl Transferase)", unit: "U/L", refRange: "0 - 55", category: "Biochemistry" },
    { name: "LDH (Lactate Dehydrogenase)", unit: "U/L", refRange: "140 - 280", category: "Biochemistry" },
    { name: "TPUC (Total Protein Urine & CSF)", unit: "mg/dL", refRange: "-", category: "Biochemistry" },
    { name: "HbA1C (Glycated Haemoglobin)", unit: "%", refRange: "4.0 - 5.6", category: "Biochemistry" },
    { name: "Fasting Insulin", unit: "µIU/mL", refRange: "2.6 - 24.9", category: "Biochemistry" },
    { name: "TSH", unit: "µIU/mL", refRange: "0.27 - 4.2", category: "Biochemistry" },
    { name: "T3 (Triiodothyronine)", unit: "ng/dL", refRange: "80 - 200", category: "Biochemistry" },
    { name: "T4 (Thyroxine)", unit: "µg/dL", refRange: "5.1 - 14.1", category: "Biochemistry" },
    { name: "Free T3 (fT3)", unit: "pg/mL", refRange: "2.0 - 4.4", category: "Biochemistry" },
    { name: "Free T4 (fT4)", unit: "ng/dL", refRange: "0.93 - 1.7", category: "Biochemistry" },
    { name: "Anti-TPO Antibodies", unit: "IU/mL", refRange: "< 34", category: "Biochemistry" },
    { name: "hs-CRP (High Sensitivity C-Reactive Protein)", unit: "mg/L", refRange: "< 3", category: "Biochemistry" },
    { name: "CRP (Quantitative)", unit: "mg/L", refRange: "< 6", category: "Biochemistry" },
    { name: "Transferrin", unit: "mg/dL", refRange: "200 - 360", category: "Biochemistry" },
    { name: "Troponin I", unit: "ng/mL", refRange: "< 0.04", category: "Biochemistry" },
    { name: "Troponin T", unit: "ng/mL", refRange: "< 0.01", category: "Biochemistry" },
    { name: "BNP", unit: "pg/mL", refRange: "< 100", category: "Biochemistry" },
    { name: "Vitamin D (25-OH)", unit: "ng/mL", refRange: "30 - 100", category: "Biochemistry" },
    { name: "Vitamin B12", unit: "pg/mL", refRange: "211 - 946", category: "Biochemistry" },
    { name: "Folic Acid", unit: "ng/mL", refRange: "3.89 - 26.8", category: "Biochemistry" },
    { name: "Ferritin", unit: "ng/mL", refRange: "12 - 300", category: "Biochemistry" },
    { name: "Prolactin", unit: "ng/mL", refRange: "4.0 - 15.2", category: "Biochemistry" },
    { name: "Cortisol (Morning)", unit: "µg/dL", refRange: "6.2 - 19.4", category: "Biochemistry" },
    { name: "Testosterone (Total)", unit: "ng/dL", refRange: "270 - 1070", category: "Biochemistry" },
    { name: "FSH", unit: "mIU/mL", refRange: "1.5 - 12.4", category: "Biochemistry" },
    { name: "LH", unit: "mIU/mL", refRange: "1.7 - 8.6", category: "Biochemistry" },
    { name: "Estradiol (E2)", unit: "pg/mL", refRange: "7.6 - 42.6", category: "Biochemistry" },
    { name: "Progesterone", unit: "ng/mL", refRange: "0.2 - 1.4", category: "Biochemistry" },
    { name: "Serum Electrolytes", unit: "-", refRange: "-", category: "Biochemistry" },
    { name: "ABG (Arterial Blood Gas)", unit: "-", refRange: "-", category: "Biochemistry" },

    // ═══════════════════════════════════════════════════════════
    //  MICROBIOLOGY
    // ═══════════════════════════════════════════════════════════
    { name: "Bacterial Culture & Antibiotic Sensitivity", unit: "-", refRange: "-", category: "Microbiology" },
    { name: "Tuberculosis Culture", unit: "-", refRange: "-", category: "Microbiology" },
    { name: "Fungal Culture", unit: "-", refRange: "-", category: "Microbiology" },
    { name: "Gram's Stain", unit: "-", refRange: "-", category: "Microbiology" },
    { name: "KOH Mount (For Fungal Elements)", unit: "-", refRange: "-", category: "Microbiology" },
    { name: "ZN Staining", unit: "-", refRange: "-", category: "Microbiology" },
    { name: "PBF for Malarial Parasite", unit: "-", refRange: "-", category: "Microbiology" },
    { name: "VDRL / RPR / TPHA", unit: "-", refRange: "Non-Reactive", category: "Microbiology" },
    { name: "CRP (C-Reactive Protein)", unit: "mg/L", refRange: "< 6", category: "Microbiology" },
    { name: "Rheumatoid Factor (RA)", unit: "IU/mL", refRange: "< 14", category: "Microbiology" },
    { name: "ASO Titre", unit: "IU/mL", refRange: "< 200", category: "Microbiology" },
    { name: "ASO Level", unit: "IU/mL", refRange: "< 200", category: "Microbiology" },
    { name: "Widal Test", unit: "-", refRange: "-", category: "Microbiology" },
    { name: "Widal Test (TO)", unit: "-", refRange: "< 1:80", category: "Microbiology" },
    { name: "Widal Test (TH)", unit: "-", refRange: "< 1:80", category: "Microbiology" },
    { name: "Malaria Ag Card", unit: "-", refRange: "Negative", category: "Microbiology" },
    { name: "Dengue Serology", unit: "-", refRange: "Negative", category: "Microbiology" },
    { name: "Dengue NS1 Antigen", unit: "-", refRange: "Negative", category: "Microbiology" },
    { name: "Dengue IgM", unit: "-", refRange: "Negative", category: "Microbiology" },
    { name: "Dengue IgG", unit: "-", refRange: "Negative", category: "Microbiology" },
    { name: "HCV Card", unit: "-", refRange: "Non-Reactive", category: "Microbiology" },
    { name: "HCV ELISA", unit: "-", refRange: "Non-Reactive", category: "Microbiology" },
    { name: "HBsAg ELISA", unit: "-", refRange: "Non-Reactive", category: "Microbiology" },
    { name: "HBsAg Card", unit: "-", refRange: "Non-Reactive", category: "Microbiology" },
    { name: "HIV Card", unit: "-", refRange: "Non-Reactive", category: "Microbiology" },
    { name: "HIV I & II", unit: "-", refRange: "Non-Reactive", category: "Microbiology" },
    { name: "Stool for Ova / Cyst", unit: "-", refRange: "Not Seen", category: "Microbiology" },
    { name: "Stool for Occult Blood", unit: "-", refRange: "Negative", category: "Microbiology" },
    { name: "IgE", unit: "IU/mL", refRange: "< 100", category: "Microbiology" },
    { name: "IgG", unit: "mg/dL", refRange: "700 - 1600", category: "Microbiology" },
    { name: "IgM", unit: "mg/dL", refRange: "40 - 230", category: "Microbiology" },
    { name: "IgA", unit: "mg/dL", refRange: "70 - 400", category: "Microbiology" },
    { name: "Serum Ferritin Test", unit: "ng/mL", refRange: "12 - 300", category: "Microbiology" },
    { name: "Serum Ceruloplasmin Levels", unit: "mg/dL", refRange: "20 - 60", category: "Microbiology" },
    { name: "C3 Level", unit: "mg/dL", refRange: "90 - 180", category: "Microbiology" },
    { name: "IL6 (Interleukin 6)", unit: "pg/mL", refRange: "< 7", category: "Microbiology" },
    { name: "Scrub Typhus", unit: "-", refRange: "Negative", category: "Microbiology" },
    { name: "RTPCR for COVID-19", unit: "-", refRange: "Negative", category: "Microbiology" },
    { name: "Malaria Antigen (Pf/Pv)", unit: "-", refRange: "Negative", category: "Microbiology" },
];

// ═══════════════════════════════════════════════════════════════════
//  TEST PROFILES — Selecting a profile auto-populates all sub-parameters
// ═══════════════════════════════════════════════════════════════════

export interface ProfileParameter {
    name: string;
    unit: string;
    refRange: string;
    group?: string;    // optional section header (e.g. "Differential Leucocyte Count")
}

export interface LabTestProfile {
    name: string;
    keywords: string[];   // search keywords (e.g. "cbc", "complete blood count")
    category: string;
    parameters: ProfileParameter[];
}

export const LAB_TEST_PROFILES: LabTestProfile[] = [

    // ─── CBC (Complete Blood Count) ──────────────────────────
    {
        name: "CBC (Complete Blood Count)",
        keywords: ["cbc", "complete blood count", "hemogram", "complete hemogram"],
        category: "Hematology",
        parameters: [
            { name: "Haemoglobin", unit: "g/dL", refRange: "13 - 17" },
            { name: "Total Leucocyte Count", unit: "/cumm", refRange: "4000 - 10000" },
            { name: "Neutrophils", unit: "%", refRange: "40 - 80", group: "Differential Leucocyte Count" },
            { name: "Lymphocytes", unit: "%", refRange: "20 - 40", group: "Differential Leucocyte Count" },
            { name: "Eosinophils", unit: "%", refRange: "1 - 6", group: "Differential Leucocyte Count" },
            { name: "Monocytes", unit: "%", refRange: "2 - 10", group: "Differential Leucocyte Count" },
            { name: "Basophils", unit: "%", refRange: "0 - 1", group: "Differential Leucocyte Count" },
            { name: "Absolute Neutrophils", unit: "/cumm", refRange: "2000 - 7000", group: "Absolute Leucocyte Count" },
            { name: "Absolute Lymphocytes", unit: "/cumm", refRange: "1000 - 3000", group: "Absolute Leucocyte Count" },
            { name: "Absolute Eosinophils", unit: "/cumm", refRange: "20 - 500", group: "Absolute Leucocyte Count" },
            { name: "Absolute Monocytes", unit: "/cumm", refRange: "200 - 1000", group: "Absolute Leucocyte Count" },
            { name: "RBC Count", unit: "Million/cumm", refRange: "4.5 - 5.5", group: "RBC Indices" },
            { name: "MCV", unit: "fL", refRange: "81 - 101", group: "RBC Indices" },
            { name: "MCH", unit: "pg", refRange: "27 - 32", group: "RBC Indices" },
            { name: "MCHC", unit: "g/dL", refRange: "31.5 - 34.5", group: "RBC Indices" },
            { name: "Hct (PCV)", unit: "%", refRange: "40 - 50", group: "RBC Indices" },
            { name: "RDW-CV", unit: "%", refRange: "11.6 - 14.0", group: "RBC Indices" },
            { name: "RDW-SD", unit: "fL", refRange: "39 - 46", group: "RBC Indices" },
            { name: "Platelet Count", unit: "/cumm", refRange: "150000 - 410000", group: "Platelet Indices" },
            { name: "PCT", unit: "%", refRange: "-", group: "Platelet Indices" },
            { name: "MPV", unit: "fL", refRange: "7.5 - 11.5", group: "Platelet Indices" },
            { name: "PDW", unit: "fL", refRange: "9 - 17", group: "Platelet Indices" },
        ],
    },

    // ─── LFT (Liver Function Tests) ──────────────────────────
    {
        name: "LFT (Liver Function Tests)",
        keywords: ["lft", "liver function", "liver profile"],
        category: "Biochemistry",
        parameters: [
            { name: "Serum Bilirubin Total", unit: "mg/dL", refRange: "0.1 - 1.2" },
            { name: "Direct Bilirubin", unit: "mg/dL", refRange: "0.0 - 0.3" },
            { name: "Indirect Bilirubin", unit: "mg/dL", refRange: "0.1 - 0.9" },
            { name: "S. SGOT (AST)", unit: "U/L", refRange: "0 - 40" },
            { name: "S. SGPT (ALT)", unit: "U/L", refRange: "0 - 41" },
            { name: "ALP (Alkaline Phosphatase)", unit: "U/L", refRange: "44 - 147" },
            { name: "GGT (Gamma Glutamyl Transferase)", unit: "U/L", refRange: "0 - 55" },
            { name: "Total Protein", unit: "g/dL", refRange: "6.0 - 8.3" },
            { name: "Serum Albumin", unit: "g/dL", refRange: "3.5 - 5.5" },
            { name: "Globulin", unit: "g/dL", refRange: "2.0 - 3.5" },
            { name: "A/G Ratio", unit: "-", refRange: "1.2 - 2.2" },
        ],
    },

    // ─── RFT / KFT (Renal Function Tests) ────────────────────
    {
        name: "RFT (Renal Function Tests)",
        keywords: ["rft", "kft", "renal function", "kidney function", "renal profile"],
        category: "Biochemistry",
        parameters: [
            { name: "Blood Urea", unit: "mg/dL", refRange: "15 - 40" },
            { name: "Blood Urea Nitrogen (BUN)", unit: "mg/dL", refRange: "7 - 20" },
            { name: "Serum Creatinine", unit: "mg/dL", refRange: "0.7 - 1.3" },
            { name: "Serum Uric Acid", unit: "mg/dL", refRange: "3.5 - 7.2" },
            { name: "Serum Sodium", unit: "mEq/L", refRange: "136 - 146" },
            { name: "Serum Potassium", unit: "mEq/L", refRange: "3.5 - 5.1" },
            { name: "Serum Chloride", unit: "mEq/L", refRange: "98 - 106" },
            { name: "Serum Calcium", unit: "mg/dL", refRange: "8.5 - 10.5" },
            { name: "Serum Phosphorus", unit: "mg/dL", refRange: "2.5 - 4.5" },
        ],
    },

    // ─── Lipid Profile ───────────────────────────────────────
    {
        name: "Lipid Profile",
        keywords: ["lipid", "lipid profile", "cholesterol", "lipid panel"],
        category: "Biochemistry",
        parameters: [
            { name: "Total Cholesterol", unit: "mg/dL", refRange: "Up to 200" },
            { name: "Triglycerides", unit: "mg/dL", refRange: "Up to 150" },
            { name: "HDL Cholesterol", unit: "mg/dL", refRange: "40 - 60" },
            { name: "LDL Cholesterol", unit: "mg/dL", refRange: "Up to 100" },
            { name: "VLDL Cholesterol", unit: "mg/dL", refRange: "Up to 30" },
            { name: "Total Cholesterol / HDL Ratio", unit: "-", refRange: "Up to 5.0" },
        ],
    },

    // ─── Thyroid Profile ─────────────────────────────────────
    {
        name: "Thyroid Profile",
        keywords: ["thyroid", "thyroid profile", "tft", "thyroid function"],
        category: "Biochemistry",
        parameters: [
            { name: "TSH", unit: "µIU/mL", refRange: "0.27 - 4.2" },
            { name: "T3 (Triiodothyronine)", unit: "ng/dL", refRange: "80 - 200" },
            { name: "T4 (Thyroxine)", unit: "µg/dL", refRange: "5.1 - 14.1" },
            { name: "Free T3 (fT3)", unit: "pg/mL", refRange: "2.0 - 4.4" },
            { name: "Free T4 (fT4)", unit: "ng/dL", refRange: "0.93 - 1.7" },
        ],
    },

    // ─── Urine Routine ───────────────────────────────────────
    {
        name: "Urine Routine & Microscopy",
        keywords: ["urine routine", "urine examination", "urine rm", "urine analysis", "urinalysis"],
        category: "Urine Examination",
        parameters: [
            { name: "Urine Colour", unit: "-", refRange: "Pale Yellow" },
            { name: "Urine Appearance", unit: "-", refRange: "Clear" },
            { name: "Urine Specific Gravity", unit: "-", refRange: "1.003 - 1.035" },
            { name: "Urinary pH", unit: "-", refRange: "4.6 - 8.0" },
            { name: "Urine Protein", unit: "-", refRange: "Nil" },
            { name: "Urine Sugar", unit: "-", refRange: "Nil" },
            { name: "Urine Ketone Bodies", unit: "-", refRange: "Nil" },
            { name: "Urine Bile Salts", unit: "-", refRange: "Absent" },
            { name: "Urine Bile Pigments", unit: "-", refRange: "Absent" },
            { name: "Urine Urobilinogen", unit: "-", refRange: "Normal" },
            { name: "Urine Nitrite", unit: "-", refRange: "Negative" },
            { name: "Urine for Bilirubin", unit: "-", refRange: "Nil" },
            { name: "Urine for RBC", unit: "/HPF", refRange: "0 - 2" },
            { name: "Urine Pus Cells", unit: "/HPF", refRange: "0 - 5" },
            { name: "Urine Epithelial Cells", unit: "/HPF", refRange: "Few" },
            { name: "Urine Casts", unit: "-", refRange: "Nil" },
            { name: "Urine Crystals", unit: "-", refRange: "Nil" },
        ],
    },

    // ─── Coagulation Profile ─────────────────────────────────
    {
        name: "Coagulation Profile",
        keywords: ["coagulation", "coagulation profile", "clotting", "bt ct"],
        category: "Hematology",
        parameters: [
            { name: "Bleeding Time (BT)", unit: "min", refRange: "1 - 6" },
            { name: "Clotting Time (CT)", unit: "min", refRange: "4 - 9" },
            { name: "Prothrombin Time (PT)", unit: "seconds", refRange: "11 - 16" },
            { name: "INR", unit: "-", refRange: "0.8 - 1.2" },
            { name: "APTT", unit: "seconds", refRange: "25 - 35" },
        ],
    },

    // ─── Blood Sugar Profile ─────────────────────────────────
    {
        name: "Blood Sugar Profile",
        keywords: ["blood sugar", "sugar profile", "glucose profile", "bsl", "ogtt"],
        category: "Biochemistry",
        parameters: [
            { name: "Fasting Blood Sugar (FBS)", unit: "mg/dL", refRange: "70 - 100" },
            { name: "Post Prandial Blood Sugar (PPBS)", unit: "mg/dL", refRange: "Up to 140" },
            { name: "HbA1C (Glycated Haemoglobin)", unit: "%", refRange: "4.0 - 5.6" },
        ],
    },

    // ─── Widal Test ──────────────────────────────────────────
    {
        name: "Widal Test",
        keywords: ["widal", "widal test", "typhoid"],
        category: "Microbiology",
        parameters: [
            { name: "Widal Test (TO)", unit: "-", refRange: "< 1:80" },
            { name: "Widal Test (TH)", unit: "-", refRange: "< 1:80" },
            { name: "Widal Test (AO)", unit: "-", refRange: "< 1:80" },
            { name: "Widal Test (AH)", unit: "-", refRange: "< 1:80" },
            { name: "Widal Test (BO)", unit: "-", refRange: "< 1:80" },
            { name: "Widal Test (BH)", unit: "-", refRange: "< 1:80" },
        ],
    },

    // ─── Serum Electrolytes ──────────────────────────────────
    {
        name: "Serum Electrolytes",
        keywords: ["electrolyte", "electrolytes", "serum electrolytes"],
        category: "Biochemistry",
        parameters: [
            { name: "Serum Sodium", unit: "mEq/L", refRange: "136 - 146" },
            { name: "Serum Potassium", unit: "mEq/L", refRange: "3.5 - 5.1" },
            { name: "Serum Chloride", unit: "mEq/L", refRange: "98 - 106" },
            { name: "Serum Calcium", unit: "mg/dL", refRange: "8.5 - 10.5" },
            { name: "Serum Magnesium", unit: "mg/dL", refRange: "1.6 - 2.6" },
        ],
    },

    // ─── Iron Studies ────────────────────────────────────────
    {
        name: "Iron Studies",
        keywords: ["iron study", "iron studies", "iron profile", "anemia profile"],
        category: "Biochemistry",
        parameters: [
            { name: "Serum Iron", unit: "µg/dL", refRange: "60 - 170" },
            { name: "TIBC", unit: "µg/dL", refRange: "250 - 370" },
            { name: "UIBC (Unsaturated Iron Binding Capacity)", unit: "µg/dL", refRange: "110 - 370" },
            { name: "Transferrin", unit: "mg/dL", refRange: "200 - 360" },
            { name: "Ferritin", unit: "ng/mL", refRange: "12 - 300" },
        ],
    },

    // ─── Dengue Panel ────────────────────────────────────────
    {
        name: "Dengue Panel",
        keywords: ["dengue", "dengue panel", "dengue serology"],
        category: "Microbiology",
        parameters: [
            { name: "Dengue NS1 Antigen", unit: "-", refRange: "Negative" },
            { name: "Dengue IgM", unit: "-", refRange: "Negative" },
            { name: "Dengue IgG", unit: "-", refRange: "Negative" },
        ],
    },

    // ─── Cardiac Markers ─────────────────────────────────────
    {
        name: "Cardiac Markers",
        keywords: ["cardiac", "cardiac markers", "cardiac profile", "heart attack"],
        category: "Biochemistry",
        parameters: [
            { name: "Troponin I", unit: "ng/mL", refRange: "< 0.04" },
            { name: "CPK-MB", unit: "U/L", refRange: "0 - 25" },
            { name: "CPK (Total)", unit: "U/L", refRange: "39 - 308" },
            { name: "LDH (Lactate Dehydrogenase)", unit: "U/L", refRange: "140 - 280" },
            { name: "BNP", unit: "pg/mL", refRange: "< 100" },
        ],
    },
];

// ═══════════════════════════════════════════════════════════════════
//  SEARCH FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export interface SearchResult {
    type: "test" | "profile";
    test?: LabTestParameter;
    profile?: LabTestProfile;
    name: string;
    category: string;
}

/**
 * Search both individual lab tests AND test profiles by name/keyword.
 */
export function searchLabTests(query: string): SearchResult[] {
    if (!query || query.trim().length === 0) return [];
    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search profiles first (they appear at the top)
    for (const profile of LAB_TEST_PROFILES) {
        const nameMatch = profile.name.toLowerCase().includes(lowerQuery);
        const keywordMatch = profile.keywords.some(kw => kw.includes(lowerQuery));
        if (nameMatch || keywordMatch) {
            results.push({
                type: "profile",
                profile,
                name: profile.name,
                category: profile.category,
            });
        }
    }

    // Then search individual tests
    for (const test of LAB_TEST_PARAMETERS) {
        if (test.name.toLowerCase().includes(lowerQuery)) {
            results.push({
                type: "test",
                test,
                name: test.name,
                category: test.category,
            });
        }
    }

    return results;
}
