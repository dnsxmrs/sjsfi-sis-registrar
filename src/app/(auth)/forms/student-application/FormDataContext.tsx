"use client";

import { createContext, useContext } from "react";

// Define the form data interface
export interface FormData {
    personalData: {
        academicYear: string;
        admissionGradeYear: string;
        familyName: string;
        firstName: string;
        middleName: string;
        nickname: string;
        birthDate: string;
        placeOfBirth: string;
        age: string;
        birthOrder: string;
        siblingsCount: string;
        gender: string;
        nationality: string;
        religion: string;
        height: string;
        weight: string;
        bloodType: string;
        languages: string;
        childStatus: string;
        landline: string;
        mobile: string;
        email: string;
        homeAddress: string;
        homeCity: string;
        homeStateProvince: string;
        homeZip: string;
        provincialAddress: string;
        provincialCity: string;
        provincialStateProvince: string;
        provincialZip: string;
        talents: string;
        hobbies: string;
    };
    healthHistory: {
        childhoodDiseases: string;
        allergies: string;
        otherMedicalConditions: string;
        immunizations: string;
        physicalHandicaps: string;
    };
    fatherBackground: {
        familyName: string;
        firstName: string;
        middleName: string;
        birthDate: string;
        placeOfBirth: string;
        age: string;
        nationality: string;
        religion: string;
        landlineNumber: string;
        mobileNumber: string;
        emailAddress: string;
        homeAddress: string;
        city: string;
        stateProvince: string;
        zipPostalCode: string;
        educationalAttainmentCourse: string;
        occupationalPositionHeld: string;
        employerCompany: string;
        companyAddress: string;
        businessTelephoneNumber: string;
        annualIncome: string;
        statusOfParent: string;
    };
    motherBackground: {
        familyName: string;
        firstName: string;
        middleName: string;
        birthDate: string;
        placeOfBirth: string;
        age: string;
        nationality: string;
        religion: string;
        landlineNumber: string;
        mobileNumber: string;
        emailAddress: string;
        homeAddress: string;
        city: string;
        stateProvince: string;
        zipPostalCode: string;
        educationalAttainmentCourse: string;
        occupationalPositionHeld: string;
        employerCompany: string;
        companyAddress: string;
        businessTelephoneNumber: string;
        annualIncome: string;
        statusOfParent: string;
    };
    guardianBackground: {
        familyName: string;
        firstName: string;
        middleName: string;
        birthDate: string;
        placeOfBirth: string;
        age: string;
        nationality: string;
        religion: string;
        landlineNumber: string;
        mobileNumber: string;
        emailAddress: string;
        homeAddress: string;
        city: string;
        stateProvince: string;
        zipPostalCode: string;
        educationalAttainmentCourse: string;
        occupationalPositionHeld: string;
        employerCompany: string;
        companyAddress: string;
        businessTelephoneNumber: string;
        annualIncome: string;
        statusOfParent: string;
        relationToApplicant: string;
    };
    familyMembers: Array<{
        familyName: string;
        firstName: string;
        middleName: string;
        birthDate: string;
        age: string;
        gradeYearLevel: string;
        schoolEmployer: string;
    }>;
    educationalBackground: Array<{
        gradeYearLevel: string;
        schoolName: string;
        schoolAddress: string;
        inclusiveYears: string;
        honorsAwardsReceived: string;
        isAttendedSummerSchool: boolean;
        attendedSummerSchool: string;
        gradeYearLevelRepeated: string;
        numberOfSubjectsFailed: string;
    }>;
    transferee: {
        previousSchool: {
            name: string;
            address: string;
            gradeYearLevel: string;
        };
        presentSchool: {
            name: string;
            address: string;
            gradeYearLevel: string;
        };
        reasonForTransfer: string;
        disciplinaryActions: string;
    };
    medicalHistory: {
        academicYear: string;
        admissionGradeYear: string;
        familyName: string;
        firstName: string;
        middleName: string;
        nickname: string;
        birthDate: string;
        placeOfBirth: string;
        age: string;
        height: string;
        weight: string;
        gender: string;
        primaryParentGuardian: string;
        landlineNumber: string;
        mobileNumber: string;
        conditions: Record<string, string>;
        surgeryDetails: string;
        heartDiseaseDetails: string;
        respiratoryDetails: string;
        allergyDetails: string;
        currentMedication: string;
    };
    registrationCode: string,
}

// Create context for form data
export const FormDataContext = createContext<{
    formData: FormData;
    updateFormData: <K extends keyof FormData>(section: K, data: FormData[K]) => void;
} | null>(null);

// Custom hook to use form data
export const useFormData = () => {
    const context = useContext(FormDataContext);
    if (!context) {
        throw new Error('useFormData must be used within a FormDataProvider');
    }
    return context;
};
