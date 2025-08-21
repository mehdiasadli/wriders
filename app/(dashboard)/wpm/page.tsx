import { Metadata } from 'next';
import WpmTest from './wpm-test';

export const metadata: Metadata = {
  title: 'Reading Speed Test | Wriders',
  description: 'Test your words per minute (WPM) reading speed and update your profile.',
};

export default function WpmPage() {
  return (
    <div className='min-h-screen bg-white'>
      <WpmTest />
    </div>
  );
}
