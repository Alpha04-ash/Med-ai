export interface MedicalGuideline {
    id: string;
    title: string;
    category: string;
    source: string;
    content: string;
    embedding?: number[];
}

export const medicalGuidelines: MedicalGuideline[] = [
    {
        id: "g1",
        title: "Hypertension Management",
        category: "Cardiology",
        source: "AHA Guidelines 2023",
        content: "For adults with confirmed hypertension and known CVD or 10-year ASCVD event risk of 10% or higher, a blood pressure target of less than 130/80 mm Hg is recommended. Lifestyle modifications including weight loss, DASH diet, and sodium reduction are first-line treatments."
    },
    {
        id: "g2",
        title: "Asthma Exacerbation",
        category: "Pulmonology",
        source: "GINA 2023",
        content: "Mild to moderate asthma exacerbations are treated with repeated administration of inhaled short-acting beta2-agonists (SABA), early introduction of oral corticosteroids, and controlled flow oxygen. Severe cases require immediate transfer to an acute care facility."
    },
    {
        id: "g3",
        title: "Type 2 Diabetes Screening",
        category: "Endocrinology",
        source: "ADA Standards of Care 2024",
        content: "Screening for prediabetes and type 2 diabetes should be considered in adults with overweight or obesity who have one or more associated risk factors. For all people, testing should begin at age 35. Fasting plasma glucose >= 126 mg/dL indicates diabetes."
    },
    {
        id: "g4",
        title: "Fever in Adults",
        category: "General Practice",
        source: "Mayo Clinic",
        content: "In adults, a fever is generally defined as a temperature of 100.4 F (38 C) or higher. Drink plenty of fluids to stay hydrated. Acetaminophen or ibuprofen can be used to treat fever. Seek emergency care if accompanied by severe headache, stiff neck, shortness of breath, or confusion."
    },
    {
        id: "g5",
        title: "Acute Myocardial Infarction (Heart Attack)",
        category: "Emergency Medicine",
        source: "ACC/AHA Guidelines",
        content: "Symptoms include chest pain or discomfort, upper body pain, shortness of breath, cold sweat, fatigue, nausea or dizziness. M.O.N.A. (Morphine, Oxygen, Nitroglycerin, Aspirin) is the traditional initial treatment acronym, though oxygen is now only recommended if SpO2 is < 90%."
    },
    {
        id: "g6",
        title: "Migraine Headache Management",
        category: "Neurology",
        source: "AHS Guidelines",
        content: "Acute treatment is most effective when taken early in the attack. Triptans, NSAIDs, and acetaminophen are common abortive medications. Preventive treatments include beta-blockers, anti-seizure medications, and CGRP antagonists for high-frequency migraines."
    },
    {
        id: "g7",
        title: "Gastroesophageal Reflux Disease (GERD)",
        category: "Gastroenterology",
        source: "ACG Clinical Guideline",
        content: "Weight loss is recommended for GERD patients who are overweight. Head of bed elevation and avoidance of meals 2-3 hours before bedtime is recommended for patients with nocturnal GERD. An 8-week trial of PPIs is the medical therapy of choice for symptom relief and healing of erosive esophagitis."
    },
    {
        id: "g8",
        title: "Acute Pharyngitis (Strep Throat)",
        category: "Infectious Disease",
        source: "IDSA Guidelines",
        content: "Clinical signs of Group A Streptococcal pharyngitis include sudden onset of sore throat, fever, tonsillopharyngeal edema/exudates, and tender cervical adenopathy. Diagnosis should be confirmed by Rapid Antigen Detection Test or culture before antibiotics (like Penicillin or Amoxicillin) are prescribed."
    },
    {
        id: "g9",
        title: "Lower Back Pain",
        category: "Orthopedics",
        source: "ACP Clinical Practice Guideline",
        content: "For acute, subacute, or chronic low back pain, patients should remain active. Nonpharmacologic treatment such as superficial heat is first-line therapy. NSAIDs or skeletal muscle relaxants may be considered if nonpharmacologic therapy is inadequate."
    },
    {
        id: "g10",
        title: "Anxiety Disorders",
        category: "Psychiatry",
        source: "APA Clinical Guidelines",
        content: "Cognitive-behavioral therapy (CBT) and SSRIs/SNRIs are first-line treatments for generalized anxiety disorder. Lifestyle modifications like exercise, sleep hygiene, and reduced caffeine intake are also highly recommended. Benzodiazepines should be limited to short-term, acute symptom management."
    },
    {
        id: "g11",
        title: "Urinary Tract Infection (UTI) in Women",
        category: "Urology",
        source: "AUA/CUA/SUFU Guidelines",
        content: "Uncomplicated cystitis symptoms include dysuria, frequent and urgent urination. First-line empiric antibiotic therapies include Nitrofurantoin, Trimethoprim-sulfamethoxazole, or Fosfomycin based on local susceptibility data and patient allergy profile."
    },
    {
        id: "g12",
        title: "Chronic Obstructive Pulmonary Disease (COPD)",
        category: "Pulmonology",
        source: "GOLD 2023 Report",
        content: "Smoking cessation is the most important intervention. Pharmacotherapy includes bronchodilators (LABA/LAMA) and inhaled corticosteroids for exacerbation risk. Pulmonary rehabilitation improves exercise tolerance. Long-term oxygen therapy is indicated for severe resting hypoxemia."
    }
];
