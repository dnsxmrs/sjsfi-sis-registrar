"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormDataContext, FormData } from "./FormDataContext";
import StudentPersonalDataPage from "./personaldata";
import StudentHealthHistoryPage from "./healthhistory";
import FatherBackgroundPage from "./fatherbackground";
import MotherBackgroundPage from "./motherbackground";
import GuardianBackgroundPage from "./guardianbackground";
import StudentFamilyMembersPage from "./familymembers";
import StudentEducationalBackgroundPage from "./educationalbackground";
import StudentTransfereePage from "./transferee";
import { validateApplicationCode } from "../_actions/code";

export default function StudentApplicationPagedForm() {
  const [page, setPage] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [visitedPages, setVisitedPages] = useState<number[]>([0]);
  const [parentGuardianWarning, setParentGuardianWarning] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [progressRestored, setProgressRestored] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // LocalStorage key generator based on registration code
  const getStorageKey = (code: string) => `student-application-progress-${code}`;

  // Save progress to localStorage
  const saveProgress = (code: string) => {
    try {
      const progressData = {
        formData,
        page,
        confirmed,
        visitedPages,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(getStorageKey(code), JSON.stringify(progressData));
      // console.log('Saving formData:', formData);
      // console.log('Registration Type:', formData.registrationType);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  // Restore progress from localStorage
  const restoreProgress = (code: string, registrationType?: string) => {
    try {
      const savedData = localStorage.getItem(getStorageKey(code));
      if (savedData) {
        const progressData = JSON.parse(savedData);
        // Always use the fresh registrationType from database, not the cached one
        const restoredFormData = {
          ...progressData.formData,
          registrationType: registrationType || progressData.formData.registrationType || 'NEW'
        };
        setFormData(restoredFormData);
        setPage(progressData.page);
        setConfirmed(progressData.confirmed);
        setVisitedPages(progressData.visitedPages);
        setProgressRestored(true);
        setLastSaved(new Date(progressData.timestamp));
        // console.log('Progress restored with registrationType (fresh from DB):', restoredFormData.registrationType);
        return true;
      }
    } catch (error) {
      console.error('Failed to restore progress:', error);
    }
    return false;
  };

  // Clear saved progress
  // TODO: UNCOMMENT FOR IMPLEMENTATION WHEN SUBMITTING
  // const clearProgress = (code: string) => {
  //   try {
  //     localStorage.removeItem(getStorageKey(code));
  //     setLastSaved(null);
  //     setProgressRestored(false);
  //   } catch (error) {
  //     console.error('Failed to clear progress:', error);
  //   }
  // };

  // Navigate to a specific page and track visited pages
  const navigateToPage = (pageNumber: number) => {
    setPage(pageNumber);
    setParentGuardianWarning(null); // Clear warning when navigating
    if (!visitedPages.includes(pageNumber)) {
      setVisitedPages(prev => [...prev, pageNumber]);
    }
  };

  // Auto-dismiss progress restored message
  useEffect(() => {
    if (progressRestored) {
      const timer = setTimeout(() => {
        setProgressRestored(false);
      }, 5000); // Dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [progressRestored]);

  // Breadcrumb component
  const Breadcrumbs = () => {
    // Page titles for breadcrumbs - conditionally include Transferee based on registration type
    const pagesTitles = [
      "Start",
      "Personal Data",
      "Health History",
      "Father Background",
      "Mother Background",
      "Guardian Background",
      "Family Members",
      "Educational Background",
      ...(formData.registrationType !== 'OLD' ? ["Transferee"] : [])
    ];

    return (
      <div className="w-full bg-white rounded-lg shadow p-4 mb-6 border border-gray-200">
        <div className="flex flex-wrap items-center gap-2">
          {pagesTitles.map((title, index) => {
            const isActive = page === index;
            const isVisited = visitedPages.includes(index);
            const isClickable = isVisited;

            return (
              <React.Fragment key={index}>
                <button
                  onClick={() => isClickable && navigateToPage(index)}
                  disabled={!isClickable}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive
                    ? 'bg-red-800 text-white'
                    : isVisited
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  {index + 1}. {title}
                </button>
                {index < pagesTitles.length - 1 && (
                  <span className="text-gray-400">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  // Ensure component is mounted before using router
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize form data state
  const [formData, setFormData] = useState<FormData>({
    personalData: {
      academicYear: "",
      admissionGradeYear: "",
      familyName: "",
      firstName: "",
      middleName: "",
      nickname: "",
      birthDate: "",
      placeOfBirth: "",
      age: "",
      birthOrder: "",
      siblingsCount: "",
      gender: "",
      nationality: "",
      religion: "",
      height: "",
      weight: "",
      bloodType: "",
      languages: "",
      childStatus: "",
      landline: "",
      mobile: "",
      email: "",
      homeAddress: "",
      homeCity: "",
      homeStateProvince: "",
      homeZip: "",
      provincialAddress: "",
      provincialCity: "",
      provincialStateProvince: "",
      provincialZip: "",
      talents: "",
      hobbies: "",
    },
    healthHistory: {
      childhoodDiseases: "",
      allergies: "",
      otherMedicalConditions: "",
      immunizations: "",
      physicalHandicaps: "",
    },
    fatherBackground: {
      familyName: "",
      firstName: "",
      middleName: "",
      birthDate: "",
      placeOfBirth: "",
      age: "",
      nationality: "",
      religion: "",
      landlineNumber: "",
      mobileNumber: "",
      emailAddress: "",
      homeAddress: "",
      city: "",
      stateProvince: "",
      zipPostalCode: "",
      educationalAttainmentCourse: "",
      occupationalPositionHeld: "",
      employerCompany: "",
      companyAddress: "",
      companyCity: "",
      businessTelephoneNumber: "",
      annualIncome: "",
      statusOfParent: "",
    },
    motherBackground: {
      familyName: "",
      firstName: "",
      middleName: "",
      birthDate: "",
      placeOfBirth: "",
      age: "",
      nationality: "",
      religion: "",
      landlineNumber: "",
      mobileNumber: "",
      emailAddress: "",
      homeAddress: "",
      city: "",
      stateProvince: "",
      zipPostalCode: "",
      educationalAttainmentCourse: "",
      occupationalPositionHeld: "",
      employerCompany: "",
      companyAddress: "",
      companyCity: "",
      businessTelephoneNumber: "",
      annualIncome: "",
      statusOfParent: "",
    },
    guardianBackground: {
      familyName: "",
      firstName: "",
      middleName: "",
      birthDate: "",
      placeOfBirth: "",
      age: "",
      nationality: "",
      religion: "",
      landlineNumber: "",
      mobileNumber: "",
      emailAddress: "",
      homeAddress: "",
      city: "",
      stateProvince: "",
      zipPostalCode: "",
      educationalAttainmentCourse: "",
      occupationalPositionHeld: "",
      employerCompany: "",
      companyAddress: "",
      businessTelephoneNumber: "",
      annualIncome: "",
      statusOfParent: "",
      relationToApplicant: "",
    },
    familyMembers: [{
      familyName: "",
      firstName: "",
      middleName: "",
      birthDate: "",
      age: "",
      gradeYearLevel: "",
      schoolEmployer: "",
    }],
    educationalBackground: [{
      gradeYearLevel: "",
      schoolName: "",
      schoolAddress: "",
      inclusiveYears: "",
      honorsAwardsReceived: "",
      gradeYearLevelRepeated: "",
      numberOfSubjectsFailed: "",
      isAttendedSummerSchool: false,
      attendedSummerSchool: ""
    }],
    transferee: {
      previousSchool: {
        name: "",
        address: "",
        gradeYearLevel: "",
      },
      presentSchool: {
        name: "",
        address: "",
        gradeYearLevel: "",
      },
      reasonForTransfer: "",
      disciplinaryActions: "",
    },
    medicalHistory: {
      academicYear: "",
      admissionGradeYear: "",
      familyName: "",
      firstName: "",
      middleName: "",
      nickname: "",
      birthDate: "",
      placeOfBirth: "",
      age: "",
      height: "",
      weight: "",
      gender: "",
      primaryParentGuardian: "",
      landlineNumber: "",
      mobileNumber: "",
      conditions: {},
      surgeryDetails: "",
      heartDiseaseDetails: "",
      respiratoryDetails: "",
      allergyDetails: "",
      currentMedication: "",
    },
    registrationCode: "",
    registrationType: "",
  });

  // Handle registration code from search params and redirection
  useEffect(() => {
    if (!isMounted) return;

    const code = searchParams.get('code');
    const upperCode = code?.trim().toUpperCase();

    if (!code || !upperCode || upperCode.startsWith('REG-')) {
      setTimeout(() => router.replace('/forms/home'), 100);
      return;
    }

    if (upperCode.startsWith('APP-')) {
      validateApplicationCode(upperCode).then((result) => {
        // console.log('Validation result:', result);
        if (result.success && result.isValid) {
          const regType = result.registrationType || 'NEW';
          // console.log('Registration Type from validation:', regType);
          // Attempt to restore saved progress
          const restored = restoreProgress(code, regType);
          if (!restored) {
            // If no saved progress, just set the registration code and registration type
            // console.log('No saved progress, setting new formData with registrationType:', regType);
            // setFormData(prev => ({ 
            //   ...prev, 
            //   registrationCode: code,
            //   registrationType: regType
            // }));
          }
          setIsLoading(false);
        } else {
          // Redirect if validation failed or code is invalid
          router.replace('/forms/home');
        }
      });
    } else {
      router.replace('/forms/home');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, searchParams, router]);

  // Auto-save progress whenever formData, page, confirmed, or visitedPages change
  useEffect(() => {
    if (!isMounted || isLoading || !formData.registrationCode) return;

    const timeoutId = setTimeout(() => {
      saveProgress(formData.registrationCode);
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, page, confirmed, visitedPages, isMounted, isLoading]);

  // Function to update form data
  const updateFormData = <K extends keyof FormData>(section: K, data: FormData[K]) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  // Helper function to check if a parent/guardian form is completely filled
  const isFormComplete = (data: typeof formData.fatherBackground | typeof formData.motherBackground | typeof formData.guardianBackground) => {
    const requiredFields = [
      'familyName', 'firstName', 'birthDate', 'placeOfBirth', 'age',
      'nationality', 'religion', 'mobileNumber', 'emailAddress',
      'homeAddress', 'city', 'stateProvince', 'zipPostalCode',
      'educationalAttainmentCourse', 'occupationalPositionHeld', 'employerCompany',
      'companyAddress', 'companyCity', 'annualIncome', 'statusOfParent'
    ];

    return requiredFields.every(field => {
      const value = data[field as keyof typeof data];
      return value && String(value).trim() !== '';
    });
  };

  // Check if at least one parent/guardian form is complete
  const hasAtLeastOneParentGuardian = () => {
    return isFormComplete(formData.fatherBackground) ||
      isFormComplete(formData.motherBackground) ||
      isFormComplete(formData.guardianBackground);
  };

  // Show loading screen while checking registration code or mounting
  if (!isMounted || isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#f7f7f7] flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-800"></div>
            <span className="text-gray-700">
              {!isMounted ? 'Loading...' : 'Validating registration code...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (page === 8) {
    return (
      <FormDataContext.Provider value={{ formData, updateFormData }}>
        <div className="w-full bg-[#f7f7f7] flex flex-col items-center py-2">
          <div className="w-full px-4">
            <Breadcrumbs />
            <StudentTransfereePage onBack={() => navigateToPage(7)} />
          </div>
        </div>
      </FormDataContext.Provider>
    );
  }

  if (page === 7) {
    return (
      <FormDataContext.Provider value={{ formData, updateFormData }}>
        <div className="w-full bg-[#f7f7f7] flex flex-col items-center py-2">
          <div className="w-full px-4">
            <Breadcrumbs />
            <StudentEducationalBackgroundPage
              onBack={() => navigateToPage(6)}
              onNext={() => {
                // Only proceed to transferee for NEW/TRANSFER students
                // OLD students will use the review modal directly in educationalbackground.tsx
                if (formData.registrationType !== 'OLD') {
                  navigateToPage(8);
                }
              }}
            />
          </div>
        </div>
      </FormDataContext.Provider>
    );
  }

  if (page === 6) {
    return (
      <FormDataContext.Provider value={{ formData, updateFormData }}>
        <div className="w-full bg-[#f7f7f7] flex flex-col items-center py-2">
          <div className="w-full px-4">
            <Breadcrumbs />
            <StudentFamilyMembersPage onBack={() => navigateToPage(5)} onNext={() => navigateToPage(7)} />
          </div>
        </div>
      </FormDataContext.Provider>
    );
  }

  if (page === 5) {
    return (
      <FormDataContext.Provider value={{ formData, updateFormData }}>
        <div className="w-full bg-[#f7f7f7] flex flex-col items-center py-2">
          <div className="w-full px-4">
            <Breadcrumbs />

            {/* Validation Warning */}
            {parentGuardianWarning && (
              <div className="w-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold">{parentGuardianWarning}</p>
                    {/* <p className="text-sm mt-1">{parentGuardianWarning}</p> */}
                  </div>
                </div>
              </div>
            )}

            <GuardianBackgroundPage
              onBack={() => navigateToPage(4)}
              onNext={() => {
                if (hasAtLeastOneParentGuardian()) {
                  navigateToPage(6);
                } else {
                  setParentGuardianWarning('Please complete at least one form: Father, Mother, or Guardian before proceeding.');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            />
          </div>
        </div>
      </FormDataContext.Provider>
    );
  }

  if (page === 4) {
    return (
      <FormDataContext.Provider value={{ formData, updateFormData }}>
        <div className="w-full bg-[#f7f7f7] flex flex-col items-center py-2">
          <div className="w-full px-4">
            <Breadcrumbs />
            <MotherBackgroundPage
              onBack={() => navigateToPage(3)}
              onNext={() => navigateToPage(5)}
            />
          </div>
        </div>
      </FormDataContext.Provider>
    );
  }

  if (page === 3) {
    return (
      <FormDataContext.Provider value={{ formData, updateFormData }}>
        <div className="w-full bg-[#f7f7f7] flex flex-col items-center py-2">
          <div className="w-full px-4">
            <Breadcrumbs />
            <FatherBackgroundPage
              onBack={() => navigateToPage(2)}
              onNext={() => navigateToPage(4)}
            />
          </div>
        </div>
      </FormDataContext.Provider>
    );
  }

  if (page === 2) {
    return (
      <FormDataContext.Provider value={{ formData, updateFormData }}>
        <div className="w-full bg-[#f7f7f7] flex flex-col items-center py-2">
          <div className="w-full px-4">
            <Breadcrumbs />
            <StudentHealthHistoryPage onBack={() => navigateToPage(1)} onNext={() => navigateToPage(3)} />
          </div>
        </div>
      </FormDataContext.Provider>
    );
  }

  if (page === 1) {
    return (
      <FormDataContext.Provider value={{ formData, updateFormData }}>
        <div className="w-full bg-[#f7f7f7] flex flex-col items-center py-2">
          <div className="w-full px-4">
            <Breadcrumbs />
            <StudentPersonalDataPage onBack={() => navigateToPage(0)} onNext={() => navigateToPage(2)} />
          </div>
        </div>
      </FormDataContext.Provider>
    );
  }

  return (
    <FormDataContext.Provider value={{ formData, updateFormData }}>
      <div className="w-full bg-[#f7f7f7] flex flex-col items-center py-2">
        {/* Progress Restored Notification - Top of page */}
        {progressRestored && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
            <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Your previous progress has been restored</span>
            </div>
          </div>
        )}

        {/* Auto-save Indicator - Bottom right floating badge */}
        {lastSaved && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 font-medium">Saved</span>
              <span className="text-gray-400 text-xs">
                {new Date(lastSaved).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        )}

        <div className="w-full px-4">
          <Breadcrumbs />
        </div>
        {/* Header */}
        <div className="w-full flex flex-col items-center mb-6">
          <div className="w-full flex items-center gap-4 mt-2">
            <button
              onClick={() => {
                if (formData.registrationCode && confirm('Are you sure you want to cancel? Your progress will be saved and you can continue later.')) {
                  router.push('/forms/home');
                }
              }}
              className="bg-[#a10000] text-white px-8 py-2 rounded-md font-semibold text-md shadow hover:bg-[#7a0000] transition"
            >
              Cancel
            </button>
            <div className="flex-1 flex justify-center">
              <h1 className="w-full bg-white rounded-md py-2 px-6 font-bold text-black text-lg tracking-widest text-center flex-grow ml-3 shadow">
                STUDENT APPLICATION FORM
              </h1>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-lg shadow p-10 border border-gray-200 flex flex-col gap-8">
          {/* Registration Code Display */}
          {formData.registrationCode && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Registration Information</h3>
              <p className="text-blue-700">
                <span className="font-medium">Registration Code:</span>{" "}
                <span className="font-mono bg-blue-100 px-2 py-1 rounded text-blue-800">
                  {formData.registrationCode}
                </span>
              </p>
            </div>
          )}

          <div>
            <p className="font-semibold text-lg md:text-xl mb-6 text-black">
              Before continuing with the student application, please ensure you have the following:
            </p>
            <ol className="list-decimal list-inside text-base md:text-lg text-black pl-4 space-y-2">
              <li>Preliminary interview upon application</li>
              <li>Copy of Grades and Transcript Records (if available) fr evaluation only;</li>
              <li>One (1) copy of recent 2&quot; x 2&quot; ID picture (Please write your name and grade/year at the back of the photo)</li>
              <li>Php 300.00 testing fee (non-refundable)</li>
            </ol>
          </div>
          <label className="mt-8 flex items-center mb-6 cursor-pointer text-red-800 text-base md:text-lg max-w-4xl space-x-3">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={() => setConfirmed(!confirmed)}
              className="w-5 h-5 accent-red-800"
            />
            <p className="text-left leading-snug">
              I hereby confirm that I have completed all the required tasks and have all the necessary items.
            </p>
          </label>
        </div>

        {/* Continue Button */}
        <div className="w-full flex justify-start mt-6">
          <button
            type="button"
            disabled={!confirmed}
            className={`bg-red-800 text-white px-6 py-2 rounded-md ${confirmed ? 'hover:bg-red-900 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            onClick={() => navigateToPage(1)}
          >
            Continue
          </button>
        </div>
      </div>
    </FormDataContext.Provider>
  );
}
