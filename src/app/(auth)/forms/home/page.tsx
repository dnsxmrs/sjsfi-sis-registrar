'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateRegistrationCode, validateApplicationCode } from '@/app/(auth)/forms/_actions/code';
//import { toast } from 'react-hot-toast';

export default function HomePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!code.trim()) {
      setError('Please enter a code');
      setIsLoading(false);
      return;
    }

    const upperCode = code.trim().toUpperCase();

    if (upperCode.startsWith('REG-')) {
      // validate registration code
      const result = await validateRegistrationCode(upperCode);
      if (!result.success) {
        setError(result.error || 'Failed to validate code');
        setIsLoading(false);
        return;
      }
      if (!result.isValid) {
        setError('Invalid registration code. Please check your code and try again.');
        setIsLoading(false);
        return;
      }
      router.push(`/forms/student-registration?code=${encodeURIComponent(upperCode)}`);
      setIsLoading(false);
      return;
    } else if (upperCode.startsWith('APP-')) {
      // validate application code
      const result = await validateApplicationCode(upperCode);
      if (!result.success) {
        setError(result.error || 'Failed to validate code');
        setIsLoading(false);
        return;
      }
      if (!result.isValid) {
        setError('Invalid application code. Please check your code and try again.');
        setIsLoading(false);
        return;
      }
      router.push(`/forms/student-application?code=${encodeURIComponent(upperCode)}`);
      setIsLoading(false);
      return;
    } else {
      setError('Invalid code format. Please check your code and try again.');
      setIsLoading(false);
      return;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div className="mt-20 flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Access Forms
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Enter your access code to continue
        </p>

        <form onSubmit={handleCodeSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Access Code
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500"
              placeholder="Enter your code (e.g., REG-XXXXXXXX)"
              autoComplete="off"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || code.trim() === ''}
            className="w-full bg-red-800 text-white py-3 px-4 rounded-lg hover:bg-red-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Validating...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </form>

        {/* <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Available Codes:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">REG</span>
              <span>Student Registration</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">APP</span>
              <span>Student Application</span>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};
