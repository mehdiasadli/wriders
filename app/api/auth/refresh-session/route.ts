import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('Unauthorized', 401), { status: 401 });
    }

    // This endpoint doesn't actually refresh the session on the server side
    // Instead, it tells the client that it needs to trigger a session update
    // The client will use NextAuth's update() function to refresh the session
    return NextResponse.json(createSuccessResponse({ needsRefresh: true }, 'Session refresh requested'), {
      status: 200,
    });
  } catch (error) {
    console.error('Error in session refresh:', error);
    return NextResponse.json(createErrorResponse('Internal server error', 500), { status: 500 });
  }
}
