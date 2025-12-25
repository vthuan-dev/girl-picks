import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// For Next.js 13+ App Router - increase timeout for large uploads
export const maxDuration = 300; // 5 minutes for large video uploads
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Không có file được tải lên' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File phải là video' },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Kích thước file phải nhỏ hơn 100MB' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'videos');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'mp4';
    const filename = `${timestamp}-${randomString}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/videos/${filename}`;
    
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
    });
  } catch (error: any) {
    console.error('Error uploading video:', error);
    
    // Handle specific error types
    let errorMessage = 'Không thể tải video lên';
    let statusCode = 500;
    
    if (error.message?.includes('413') || error.message?.includes('Request Entity Too Large')) {
      errorMessage = 'File quá lớn. Kích thước tối đa: 100MB';
      statusCode = 413;
    } else if (error.code === 'ENOENT' || error.message?.includes('ENOENT')) {
      errorMessage = 'Không thể tạo thư mục upload. Vui lòng kiểm tra quyền truy cập.';
      statusCode = 500;
    } else if (error.code === 'EACCES' || error.message?.includes('EACCES')) {
      errorMessage = 'Không có quyền ghi file. Vui lòng kiểm tra quyền truy cập.';
      statusCode = 403;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}
