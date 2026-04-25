export interface Blog {
  id: number;
  title: string;
  description: string;
  coverImageUrl: string;
  authorId: number;
  authorName: string;
  tags: string[];
  status: string;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogRequest {
  title: string;
  description: string;
  coverImageUrl?: string;
  tags: string[];
}

export interface Comment {
  id: number;
  blogId: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

export interface AppNotification {
  id: number;
  actorId: number;
  actorName: string;
  blogId: number;
  blogTitle: string;
  type: 'LIKE' | 'COMMENT';
  message: string;
  read: boolean;
  createdAt: string;
}
