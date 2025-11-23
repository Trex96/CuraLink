import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import { ForumCategoryModel } from '@/models/forum/Forum';

interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface UpdateData {
  name?: string;
  description?: string;
  diseaseCategory?: string;
}

// Create a new forum category (admin only)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin/researcher
    const userRole = (session.user as UserSession).role;
    if (userRole !== 'researcher' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { name, description, diseaseCategory } = await req.json();
    
    if (!name || !description || !diseaseCategory) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if category already exists
    const existingCategory = await ForumCategoryModel.findOne({ name });
    if (existingCategory) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
    }
    
    const category = await ForumCategoryModel.create({
      name,
      description,
      diseaseCategory
    });
    
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Error creating forum category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update a forum category (admin only)
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin/researcher
    const userRole = (session.user as UserSession).role;
    if (userRole !== 'researcher' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id, name, description, diseaseCategory } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Missing category ID' }, { status: 400 });
    }
    
    const updateData: UpdateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (diseaseCategory) updateData.diseaseCategory = diseaseCategory;
    
    const category = await ForumCategoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error updating forum category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete a forum category (admin only)
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin/researcher
    const userRole = (session.user as UserSession).role;
    if (userRole !== 'researcher' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing category ID' }, { status: 400 });
    }
    
    const category = await ForumCategoryModel.findByIdAndDelete(id);
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting forum category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}