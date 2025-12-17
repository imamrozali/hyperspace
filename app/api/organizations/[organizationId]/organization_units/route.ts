import { NextRequest, NextResponse } from 'next/server';
import { OrganizationRepository } from '@/server/organizations';

const organizationRepo = new OrganizationRepository();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: 'Organization unit name required' }, { status: 400 });

    const resolvedParams = await params;
    const organizationUnit = await organizationRepo.createOrganizationUnit(resolvedParams.organizationId, name);

    return NextResponse.json(organizationUnit);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}