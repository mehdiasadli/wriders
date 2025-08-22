import { Metadata } from 'next';
import WpmTest from './wpm-test';

export const metadata: Metadata = {
  title: 'Reading Speed Test - Measure Your WPM',
  description:
    'Test your reading speed with our interactive words per minute (WPM) test. Track your progress and improve your reading skills on Wriders.',
  keywords: [
    'reading speed test',
    'WPM test',
    'words per minute',
    'reading skills',
    'reading assessment',
    'reading speed measurement',
  ],
  openGraph: {
    title: 'Reading Speed Test - Measure Your WPM | Wriders',
    description:
      'Test your reading speed with our interactive words per minute (WPM) test. Track your progress and improve your reading skills.',
    url: `${process.env.NEXT_PUBLIC_APP_URL!}/wpm`,
    type: 'website',
  },
  twitter: {
    title: 'Reading Speed Test - Measure Your WPM | Wriders',
    description:
      'Test your reading speed with our interactive words per minute (WPM) test. Track your progress and improve your reading skills.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL!}/wpm`,
  },
};

export default function WpmPage() {
  return (
    <div className='min-h-screen bg-white'>
      <WpmTest />
    </div>
  );
}
