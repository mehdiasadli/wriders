import { auth } from '@/lib/auth';
import { User } from '@prisma/client';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function getCurrentUser() {
  const session = await auth();
  return session?.user as User & { roles: string[] };
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  return user;
}

export async function requireRole(role: string) {
  const user = await requireAuth();

  if (!user.roles.includes(role)) {
    redirect('/unauthorized');
  }

  return user;
}

/**
 * Get fresh user data from database (bypasses session cache)
 * Useful when you need the most up-to-date user information
 */
export async function getFreshUserData(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        slug: true,
        roles: true,
        wpm: true,
        createdAt: true,
      },
    });
    return user;
  } catch (error) {
    console.error('Error fetching fresh user data:', error);
    return null;
  }
}

/**
 * Get current user with fresh data from database
 * Use this when you need up-to-date user information that might have changed
 */
export async function getCurrentUserFresh() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return await getFreshUserData(session.user.id);
}

export async function requireAnyRole(roles: string[]) {
  const user = await requireAuth();

  const hasRole = user.roles.some((role) => roles.includes(role));

  if (!hasRole) {
    redirect('/unauthorized');
  }

  return user;
}
