'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { wpmContent, languages } from './content';
import { getWordCount } from '@/lib/utils';

type Language = keyof typeof wpmContent;
type TestState = 'select' | 'ready' | 'testing' | 'finished';

export default function WpmTest() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [testState, setTestState] = useState<TestState>('select');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [calculatedWPM, setCalculatedWPM] = useState<number | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentContent = wpmContent[selectedLanguage];
  const wordCount = getWordCount(currentContent.text, false);

  // Timer effect
  useEffect(() => {
    if (testState === 'testing' && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [testState, startTime]);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setTestState('ready');
  };

  const handleStartTest = () => {
    const now = Date.now();
    setStartTime(now);
    setEndTime(null);
    setElapsedTime(0);
    setCalculatedWPM(null);
    setTestState('testing');
  };

  const handleStopTest = () => {
    const now = Date.now();
    setEndTime(now);
    setTestState('finished');

    if (startTime) {
      const totalSeconds = (now - startTime) / 1000;
      const totalMinutes = totalSeconds / 60;
      const wpm = Math.round(wordCount / totalMinutes);
      setCalculatedWPM(wpm);
    }
  };

  const handleUpdateProfile = async () => {
    if (!calculatedWPM || !session?.user?.id) return;

    setIsUpdatingProfile(true);
    try {
      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wpm: calculatedWPM,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Refresh the session to get updated user data
        await updateSession();

        toast.success('WPM updated successfully!');

        // Use the updated slug for navigation
        const userSlug = result.data?.user?.slug || session.user.slug;
        router.push(`/users/${userSlug}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update WPM');
      }
    } catch (error) {
      toast.error('An error occurred while updating your WPM');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleRetry = () => {
    setTestState('select');
    setStartTime(null);
    setEndTime(null);
    setElapsedTime(0);
    setCalculatedWPM(null);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}.${centiseconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div className='max-w-4xl mx-auto px-6 py-12'>
      <div className='text-center mb-12'>
        <h1 className='text-4xl font-serif text-gray-900 mb-4'>Reading Speed Test</h1>
        <p className='text-lg text-gray-600'>Test your words per minute (WPM) reading speed</p>
      </div>

      {/* Language Selection */}
      {testState === 'select' && (
        <div className='text-center'>
          <h2 className='text-2xl font-serif text-gray-900 mb-8'>Select Language</h2>
          <div className='flex justify-center gap-6'>
            {Object.entries(languages).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => handleLanguageSelect(code as Language)}
                className='px-8 py-4 text-lg font-medium text-gray-700 border-2 border-gray-300 hover:border-gray-900 hover:text-gray-900 transition-colors bg-white'
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ready State */}
      {testState === 'ready' && (
        <div className='text-center'>
          <h2 className='text-2xl font-serif text-gray-900 mb-4'>Ready to Start</h2>
          <div className='mb-8'>
            <span className='inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm mb-4'>
              {languages[selectedLanguage].name}
            </span>
            <p className='text-gray-600 mb-6'>
              You will read a text passage and time how long it takes. <br />
              The text contains <strong>{wordCount} words</strong>.
            </p>
          </div>
          <div className='flex justify-center gap-4'>
            <button
              onClick={() => setTestState('select')}
              className='px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors border border-gray-300 hover:border-gray-400'
            >
              Change Language
            </button>
            <button
              onClick={handleStartTest}
              className='px-8 py-3 text-white bg-gray-900 hover:bg-gray-800 transition-colors font-medium'
            >
              Start Reading Test
            </button>
          </div>
        </div>
      )}

      {/* Testing State */}
      {testState === 'testing' && (
        <div>
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center gap-4'>
              <span className='inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm'>
                {languages[selectedLanguage].name}
              </span>
              <span className='text-sm text-gray-500'>{wordCount} words</span>
            </div>
            <div className='flex items-center gap-6'>
              <div className='text-xl font-mono text-gray-900'>{formatTime(elapsedTime)}</div>
              <button
                onClick={handleStopTest}
                className='px-6 py-2 text-white bg-red-600 hover:bg-red-700 transition-colors font-medium'
              >
                Stop & Calculate
              </button>
            </div>
          </div>

          <div className='prose prose-lg max-w-none'>
            <h3 className='text-xl font-serif text-gray-900 mb-6'>{currentContent.title}</h3>
            <div className='text-gray-800 leading-relaxed text-lg'>{currentContent.text}</div>
          </div>
        </div>
      )}

      {/* Results State */}
      {testState === 'finished' && calculatedWPM && (
        <div className='text-center'>
          <h2 className='text-2xl font-serif text-gray-900 mb-8'>Test Results</h2>

          <div className='bg-gray-50 border border-gray-200 rounded-lg p-8 mb-8 max-w-md mx-auto'>
            <div className='mb-6'>
              <div className='text-5xl font-bold text-gray-900 mb-2'>{calculatedWPM}</div>
              <div className='text-lg text-gray-600'>Words Per Minute</div>
            </div>

            <div className='text-sm text-gray-500 space-y-1'>
              <div>Reading time: {formatTime(elapsedTime)}</div>
              <div>Words read: {wordCount}</div>
              <div>Language: {languages[selectedLanguage].name}</div>
            </div>
          </div>

          <div className='flex justify-center gap-4'>
            <button
              onClick={handleRetry}
              className='px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors border border-gray-300 hover:border-gray-400'
            >
              Test Again
            </button>
            {session?.user && (
              <button
                onClick={handleUpdateProfile}
                disabled={isUpdatingProfile}
                className='px-8 py-3 text-white bg-gray-900 hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isUpdatingProfile ? 'Updating...' : 'Update My Profile'}
              </button>
            )}
          </div>

          {!session?.user && <p className='text-sm text-gray-500 mt-4'>Sign in to save your WPM to your profile</p>}
        </div>
      )}
    </div>
  );
}
