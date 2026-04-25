import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-create-blog',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  template: `
    <div class="create-page">
      <div class="container">
        <h1 class="page-title">Create New Blog</h1>

        @if (error) {
          <div class="error-msg">{{ error }}</div>
        }

        <div class="form-card">
          <!-- Title -->
          <div class="form-field">
            <label>Title</label>
            <input type="text" [(ngModel)]="title" placeholder="Enter an inspiring title..." maxlength="300" />
          </div>

          <!-- Cover Image Upload -->
          <div class="form-field">
            <label>Cover Image</label>
            <div class="upload-area" (click)="coverInput.click()"
                 (dragover)="$event.preventDefault()"
                 (drop)="onCoverDrop($event)">
              @if (coverImageUrl) {
                <img [src]="coverImageUrl" class="cover-preview" />
              } @else {
                <div class="upload-placeholder">
                  <svg class="upload-icon" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <p>Click or drag to upload cover image</p>
                </div>
              }
            </div>
            <input type="file" #coverInput accept="image/*" (change)="onCoverSelect($event)" hidden />
          </div>

          <!-- Tags -->
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

          <!-- Rich Text Editor -->
          <div class="form-field">
            <label>Content</label>
            <quill-editor
              [(ngModel)]="description"
              [modules]="quillModules"
              [styles]="{minHeight: '350px'}"
              placeholder="Write your blog content here..."
            ></quill-editor>
          </div>

          <!-- Preview Toggle -->
          <div class="form-field">
            <button class="btn-outline" (click)="showPreview = !showPreview">
              {{ showPreview ? 'Hide Preview' : 'Show Preview' }}
            </button>
          </div>

          @if (showPreview) {
            <div class="preview-section">
              <h2>Preview</h2>
              <div class="preview-content">
                @if (coverImageUrl) {
                  <img [src]="coverImageUrl" class="preview-cover" />
                }
                <h1>{{ title || 'Untitled' }}</h1>
                <div class="preview-tags">
                  @for (tag of tags; track tag) {
                    <span class="tag">{{ tag }}</span>
                  }
                </div>
                <div [innerHTML]="description" class="blog-content"></div>
              </div>
            </div>
          }

          <!-- Submit -->
          <div class="form-actions">
            <button class="btn-primary" (click)="showPublishModal = true" [disabled]="submitting">
              {{ submitting ? 'Submitting...' : 'Publish Blog' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    @if (showPublishModal) {
      <div class="modal-overlay" (click)="showPublishModal = false">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <h3>Confirm Publish</h3>
          <p>Are you sure you want to publish this post?</p>
          <p class="modal-note">Your post will be reviewed by an admin before it goes live.</p>
          <div class="modal-actions">
            <button class="btn-outline" (click)="showPublishModal = false">No, Go Back</button>
            <button class="btn-primary" (click)="onSubmit()" [disabled]="submitting">
              {{ submitting ? 'Submitting...' : 'Yes, Publish' }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (showSuccessMsg) {
      <div class="modal-overlay">
        <div class="modal-card success-card">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#27ae60" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <h3>Post Submitted!</h3>
          <p>Your post has been submitted for review. It will be published once approved by the admin.</p>
          <button class="btn-primary" (click)="goHome()">Go to Home</button>
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

    ::ng-deep .blog-content img,
    ::ng-deep .preview-content img,
    ::ng-deep .ql-editor img {
      max-width: 100% !important;
      width: auto !important;
      height: auto !important;
      display: block !important;
      object-fit: contain;
      border-radius: 8px;
      margin: 16px auto;
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

    .preview-section {
      margin-top: 30px;
      padding-top: 30px;
      border-top: 1px solid var(--jj-border);

      h2 {
        font-size: 1.3rem;
        margin-bottom: 20px;
        color: var(--jj-accent);
      }
    }

    .preview-content {
      background: var(--jj-bg-surface);
      border-radius: 12px;
      padding: 30px;
      overflow: hidden;
      max-width: 100%;

      .preview-cover {
        width: 100%;
        max-height: 300px;
        object-fit: cover;
        border-radius: 10px;
        margin-bottom: 20px;
      }

      h1 {
        font-size: 2rem;
        margin-bottom: 12px;
        overflow-wrap: break-word;
        word-break: break-word;
      }

      .preview-tags { margin-bottom: 20px; }

      .blog-content {
        font-family: 'Lora', serif;
        font-size: 1.05rem;
        line-height: 1.8;
        color: var(--jj-text);
        overflow-wrap: break-word;
        word-wrap: break-word;
        word-break: break-word;
        overflow: hidden;

        p, div, span, li, blockquote {
          overflow-wrap: break-word;
          word-break: break-word;
        }

        img, :deep(img) {
          max-width: 100% !important;
          width: auto !important;
          height: auto !important;
          border-radius: 8px;
          display: block;
          margin: 16px auto;
          object-fit: contain;
        }
      }
    }

    .form-actions {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-card {
      background: var(--jj-bg-card);
      border: 1px solid var(--jj-border);
      border-radius: 16px;
      padding: 32px;
      max-width: 440px;
      width: 100%;
      text-align: center;

      h3 {
        font-family: 'Cinzel', serif;
        font-size: 1.4rem;
        margin-bottom: 12px;
        color: var(--jj-text-bright);
      }

      p {
        color: var(--jj-text-muted);
        line-height: 1.6;
        margin-bottom: 8px;
      }

      .modal-note {
        font-size: 0.85rem;
        color: var(--jj-primary-light);
        opacity: 0.8;
        margin-bottom: 24px;
      }
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-top: 20px;
    }

    .success-card {
      svg { margin-bottom: 16px; }
      h3 { color: var(--jj-success); }
      p { margin-bottom: 24px; }
    }

    @media (max-width: 768px) {
      .create-page { padding: 24px 0 40px; }
      .page-title { font-size: 1.6rem; margin-bottom: 20px; }
      .form-card { padding: 24px 20px; border-radius: 12px; }
      .upload-area { padding: 20px; min-height: 120px; }
      .preview-content { padding: 20px; }
      .preview-content h1 { font-size: 1.5rem; }
      .modal-card { padding: 24px 18px; max-width: 360px; }
      .modal-actions { flex-direction: column; gap: 8px; }
      .modal-actions button { width: 100%; }
    }

    @media (max-width: 480px) {
      .create-page { padding: 16px 0 30px; }
      .page-title { font-size: 1.3rem; margin-bottom: 16px; }
      .form-card { padding: 18px 14px; }
      .upload-area { padding: 14px; min-height: 100px; }
      .form-actions { justify-content: stretch; }
      .form-actions .btn-primary { width: 100%; }
      .preview-content { padding: 16px; }
      .preview-content h1 { font-size: 1.3rem; }
      .tags-input { padding: 8px 10px; }
      .tags-input input { min-width: 80px; font-size: 0.85rem; }
      .modal-card { padding: 20px 14px; }
      .modal-card h3 { font-size: 1.2rem; }
    }
  `]
})
export class CreateBlogComponent {
  title = '';
  description = '';
  coverImageUrl = '';
  tags: string[] = [];
  tagInput = '';
  showPreview = false;
  submitting = false;
  error = '';
  showPublishModal = false;
  showSuccessMsg = false;

  quillModules = {
    toolbar: {
      container: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'link', 'image'],
        ['clean']
      ],
      handlers: {
        image: () => this.imageHandler()
      }
    }
  };

  private quillEditor: any;

  constructor(private blogService: BlogService, private router: Router) {}

  imageHandler(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      this.blogService.uploadImage(file).subscribe({
        next: (res) => {
          const editor = (document.querySelector('.ql-editor') as any);
          if (editor) {
            const range = window.getSelection();
            const img = document.createElement('img');
            img.src = res.url;
            img.style.maxWidth = '100%';
            editor.appendChild(img);
          }
        }
      });
    };
    input.click();
  }

  onCoverSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.uploadCover(file);
  }

  onCoverDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.uploadCover(file);
  }

  private uploadCover(file: File): void {
    this.blogService.uploadImage(file).subscribe({
      next: (res) => this.coverImageUrl = res.url
    });
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

  onSubmit(): void {
    if (!this.title.trim() || !this.description.trim()) {
      this.error = 'Title and content are required';
      this.showPublishModal = false;
      return;
    }

    this.error = '';
    this.submitting = true;

    this.blogService.createBlog({
      title: this.title,
      description: this.description,
      coverImageUrl: this.coverImageUrl || undefined,
      tags: this.tags
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.showPublishModal = false;
        this.showSuccessMsg = true;
      },
      error: (err) => {
        this.submitting = false;
        this.showPublishModal = false;
        this.error = err.error?.error || 'Failed to submit blog';
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
