import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCurrentInventoryLevels } from '@/lib/inventory';
import type { CurrentInventoryResponse } from '@/types/inventory';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const locationId = searchParams.get('locationId');

    const inventory = await getCurrentInventoryLevels(
      locationId ? parseInt(locationId) : undefined
    );

    const response: CurrentInventoryResponse = {
      inventory,
      asOf: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching current inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current inventory levels' },
      { status: 500 }
    );
  }
}