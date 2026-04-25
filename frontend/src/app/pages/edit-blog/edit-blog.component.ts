import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { BlogService } from '../../services/blog.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-edit-blog',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule, LoadingSpinnerComponent],
  template: `
    @if (loading) {
      <app-loading-spinner mode="fullpage" message="Loading editor..." />
    } @else {
      <div class="create-page">
        <div class="container">
          <h1 class="page-title">Edit Blog</h1>

          @if (error) {
            <div class="error-msg">{{ error }}</div>
          }

          <div class="form-card">
            <div class="form-field">
              <label>Title</label>
              <input type="text" [(ngModel)]="title" placeholder="Enter title..." maxlength="300" />
            </div>

            <div class="form-field">
              <label>Cover Image</label>
              <div class="upload-area" (click)="coverInput.click()">
                @if (coverImageUrl) {
                  <img [src]="coverImageUrl" class="cover-preview" />
                } @else {
                  <div class="upload-placeholder">
                    <svg class="upload-icon" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    <p>Click to upload new cover image</p>
                  </div>
                }
              </div>
              <input type="file" #coverInput accept="image/*" (change)="onCoverSelect($event)" hidden />
            </div>

            <div class="form-field">
              <label>Tags</label>
              <div class="tags-input">
                @for (tag of tags; track tag) {
                  <span class="tag-chip">
                    {{ tag }}
                    <button class="tag-remove" (click)="removeTag(tag)">&#10005;</button>
                  </span>
                }
                <input type="text" [(ngModel)]="tagInput" placeholder="Add tag & press Enter"
                       (keydown.enter)="addTag()" (keydown.comma)="addTag()" />
              </div>
            </div>

            <div class="form-field">
              <label>Content</label>
              <quill-editor
                [(ngModel)]="description"
                [modules]="quillModules"
                [styles]="{minHeight: '350px'}"
                placeholder="Edit your blog content..."
              ></quill-editor>
            </div>

            <div class="form-actions">
              <button class="btn-outline" (click)="onCancel()">Cancel</button>
              <button class="btn-primary" (click)="onSubmit()" [disabled]="submitting">
                {{ submitting ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 100vw;
      overflow-x: hidden;
    }

    .create-page {
      padding: 40px 0 60px;
      overflow: hidden;
    }

    .page-title {
      font-size: 2rem;
      margin-bottom: 30px;
      background: var(--jj-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .error-msg {
      background: rgba(231, 76, 60, 0.15);
      color: var(--jj-danger);
      padding: 12px 16px;
      border-radius: 10px;
      margin-bottom: 20px;
    }

    .form-card {
      background: var(--jj-bg-card);
      border: 1px solid var(--jj-border);
      border-radius: 16px;
      padding: 36px;
      overflow: hidden;
      max-width: 100%;
    }

    .upload-area {
      border: 2px dashed var(--jj-border);
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.3s;
      min-height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover { border-color: var(--jj-primary-light); }
    }

    .upload-placeholder {
      .upload-icon { font-size: 2.5rem; display: block; margin-bottom: 8px; }
      p { color: var(--jj-text-muted); }
    }

    .cover-preview {
      max-width: 100%;
      max-height: 250px;
      border-radius: 8px;
      object-fit: cover;
    }

    .tags-input {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 10px 14px;
      background: var(--jj-bg-surface);
      border: 1px solid var(--jj-border);
      border-radius: 10px;
      align-items: center;

      input {
        background: none;
        border: none;
        color: var(--jj-text);
        font-size: 0.95rem;
        flex: 1;
        min-width: 120px;
        padding: 4px 0;

        &:focus { outline: none; }
        &::placeholder { color: var(--jj-text-muted); }
      }
    }

    .tag-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: rgba(106, 13, 173, 0.2);
      color: var(--jj-primary-light);
      border-radius: 20px;
      font-size: 0.85rem;
    }

    .tag-remove {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 0.7rem;
      padding: 0;
      opacity: 0.7;

      &:hover { opacity: 1; }
    }

    .form-actions {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    @media (max-width: 768px) {
      .create-page { padding: 24px 0 40px; }
      .page-title { font-size: 1.6rem; margin-bottom: 20px; }
      .form-card { padding: 24px 20px; border-radius: 12px; }
      .upload-area { padding: 20px; min-height: 120px; }
    }

    @media (max-width: 480px) {
      .create-page { padding: 16px 0 30px; }
      .page-title { font-size: 1.3rem; margin-bottom: 16px; }
      .form-card { padding: 18px 14px; }
      .upload-area { padding: 14px; min-height: 100px; }
      .form-actions { flex-direction: column; }
      .form-actions button { width: 100%; }
      .tags-input { padding: 8px 10px; }
      .tags-input input { min-width: 80px; font-size: 0.85rem; }
    }
  `]
})
export class EditBlogComponent implements OnInit {
  blogId!: number;
  title = '';
  description = '';
  coverImageUrl = '';
  tags: string[] = [];
  tagInput = '';
  loading = true;
  submitting = false;
  error = '';

  quillModules = {
    toolbar: {
      container: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'link', 'image'],
        ['clean']
      ]
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
    this.blogId = Number(this.route.snapshot.paramMap.get('id'));
    this.blogService.getBlog(this.blogId).subscribe({
      next: (blog) => {
        this.title = blog.title;
        this.description = blog.description;
        this.coverImageUrl = blog.coverImageUrl;
        this.tags = blog.tags || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/']);
      }
    });
  }

  onCoverSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.blogService.uploadImage(file).subscribe({
        next: (res) => this.coverImageUrl = res.url
      });
    }
  }

  addTag(): void {
    const tag = this.tagInput.replace(',', '').trim();
    if (tag && !this.tags.includes(tag) && this.tags.length < 10) {
      this.tags.push(tag);
    }
    this.tagInput = '';
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

  onCancel(): void {
    this.router.navigate(['/blog', this.blogId]);
  }

  onSubmit(): void {
    if (!this.title.trim() || !this.description.trim()) {
      this.error = 'Title and content are required';
      return;
    }

    this.error = '';
    this.submitting = true;

    this.blogService.updateBlog(this.blogId, {
      title: this.title,
      description: this.description,
      coverImageUrl: this.coverImageUrl || undefined,
      tags: this.tags
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/blog', this.blogId]);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.error || 'Failed to update blog';
      }
    });
  }
}
