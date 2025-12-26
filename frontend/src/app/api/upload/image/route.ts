import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// For Next.js 13+ App Router
export const maxDuration = 60; // 1 minute for image uploads
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let file: File | null = null;
    const contentType = request.headers.get('content-type') || '';
    
    // Check Content-Type to determine how to parse the request
    if (contentType.includes('multipart/form-data')) {
      // FormData upload (preferred method)
      try {
        const formData = await request.formData();
        file = formData.get('file') as File | null;
      } catch (formError) {
        console.error('Failed to parse FormData:', formError);
      }
    } else if (contentType.includes('application/json')) {
      // JSON upload (base64 for backward compatibility)
      try {
        const body = await request.json();
        if (body.url && body.url.startsWith('data:image')) {
          // Convert base64 to File
          const base64Data = body.url.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          const mimeType = body.url.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
          const extension = mimeType.split('/')[1] || 'jpg';
          const filename = `upload-${Date.now()}.${extension}`;
          file = new File([buffer], filename, { type: mimeType });
        }
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
      }
    } else {
      // Try FormData first as fallback (browser might not set Content-Type correctly)
      try {
        const formData = await request.formData();
        file = formData.get('file') as File | null;
      } catch (formError) {
        // If FormData fails, try JSON as last resort
        try {
          const body = await request.json();
          if (body.url && body.url.startsWith('data:image')) {
            const base64Data = body.url.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            const mimeType = body.url.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
            const extension = mimeType.split('/')[1] || 'jpg';
            const filename = `upload-${Date.now()}.${extension}`;
            file = new File([buffer], filename, { type: mimeType });
          }
        } catch (jsonError) {
          console.error('Failed to parse request:', { formError, jsonError });
        }
      }
    }

    if (!file) {
      return NextResponse.json(
        { error: 'Không có file được tải lên' },
        { status: 400 }
      );
    }

    // Additional validation for file object
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'File không hợp lệ' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File phải là hình ảnh' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Kích thước file phải nhỏ hơn 5MB' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    // Use community-posts folder for general image uploads
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'community-posts');
    try {
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }
    } catch (dirError: any) {
      console.error('Error creating uploads directory:', dirError);
      return NextResponse.json(
        { error: 'Không thể tạo thư mục upload', message: dirError.message },
        { status: 500 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/community-posts/${filename}`;
    
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    
    // Handle specific error types
    let errorMessage = 'Không thể tải file lên';
    let statusCode = 500;
    
    if (error.code === 'ENOENT' || error.message?.includes('ENOENT')) {
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

