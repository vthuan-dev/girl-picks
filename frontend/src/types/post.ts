export interface VideoSource {
  url: string;
  type?: string;
  label?: string;
  resolution?: string;
}

export interface Post {
  id: string;
  authorId: string;
  girlId?: string | null;
  title: string;
  slug?: string | null; // URL-friendly slug for SEO
  content: string;
  images: string[] | any; // Can be JSON string or array
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedById?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Video/Movie fields
  videoUrl?: string | null;
  videoSources?: VideoSource[] | any; // Can be JSON string or array
  duration?: string | null;
  viewCount?: number;
  rating?: number | null;
  categoryId?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags?: string[] | any; // Can be JSON string or array
  poster?: string | null;
  thumbnail?: string | null;
  author?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    role: string;
  };
  girl?: {
    id: string;
    name?: string;
    user?: {
      id: string;
      fullName: string;
      avatarUrl?: string | null;
    };
  } | null;
  approvedBy?: {
    id: string;
    fullName: string;
  } | null;
  _count?: {
    likes: number;
    comments: number;
  };
}

export interface PostListParams {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  girlId?: string;
  page?: number;
  limit?: number;
  search?: string;
  category?: string; // For filtering by category/tags (legacy)
  categoryId?: string; // For filtering by category ID
}

export interface CreatePostDto {
  title: string;
  content: string;
  images?: string[];
  girlId?: string;
  videoUrl?: string;
  thumbnail?: string;
  duration?: string;
  category?: string;
  tags?: string[];
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  images?: string[];
  videoUrl?: string;
  thumbnail?: string;
  duration?: string;
  category?: string; // Legacy - deprecated, use categoryId
  categoryId?: string;
  tags?: string[];
}

