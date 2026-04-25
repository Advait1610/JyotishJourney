import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Blog, BlogRequest, Comment, PageResponse } from '../models/blog.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly API = `${environment.apiUrl}/blogs`;

  constructor(private http: HttpClient) {}

  getBlogs(page = 0, size = 12, sortBy = 'createdAt', order = 'desc', search?: string): Observable<PageResponse<Blog>> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size))
      .set('sortBy', sortBy)
      .set('order', order);
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<PageResponse<Blog>>(this.API, { params });
  }

  getHotBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.API}/hot`);
  }

  getBlog(id: number): Observable<Blog> {
    return this.http.get<Blog>(`${this.API}/${id}`);
  }

  createBlog(request: BlogRequest): Observable<Blog> {
    return this.http.post<Blog>(this.API, request);
  }

  updateBlog(id: number, request: BlogRequest): Observable<Blog> {
    return this.http.put<Blog>(`${this.API}/${id}`, request);
  }

  deleteBlog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  getPendingBlogs(page = 0, size = 20): Observable<PageResponse<Blog>> {
    const params = new HttpParams().set('page', String(page)).set('size', String(size));
    return this.http.get<PageResponse<Blog>>(`${this.API}/pending`, { params });
  }

  approveBlog(id: number): Observable<Blog> {
    return this.http.put<Blog>(`${this.API}/${id}/approve`, {});
  }

  rejectBlog(id: number): Observable<Blog> {
    return this.http.put<Blog>(`${this.API}/${id}/reject`, {});
  }

  toggleLike(id: number): Observable<{ liked: boolean; likeCount: number }> {
    return this.http.post<{ liked: boolean; likeCount: number }>(`${this.API}/${id}/like`, {});
  }

  getComments(blogId: number, page = 0, size = 20): Observable<PageResponse<Comment>> {
    const params = new HttpParams().set('page', String(page)).set('size', String(size));
    return this.http.get<PageResponse<Comment>>(`${this.API}/${blogId}/comments`, { params });
  }

  addComment(blogId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.API}/${blogId}/comments`, { content });
  }

  deleteComment(blogId: number, commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${blogId}/comments/${commentId}`);
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.API}/upload-image`, formData);
  }
}
