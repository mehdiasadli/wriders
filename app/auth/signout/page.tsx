import { signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function SignoutPage() {
  await signOut();
  redirect('/auth/signin');
}
