import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    data: { animation: 'Home' }
  },
  {
    path: 'posts',
    loadComponent: () => import('./pages/all-posts/all-posts.component').then(m => m.AllPostsComponent),
    data: { animation: 'Posts' }
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
    data: { animation: 'About' }
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    data: { animation: 'Login' }
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    data: { animation: 'Register' }
  },
  {
    path: 'blog/:id',
    loadComponent: () => import('./pages/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent),
    data: { animation: 'BlogDetail' }
  },
  {
    path: 'my-blogs',
    loadComponent: () => import('./pages/my-blogs/my-blogs.component').then(m => m.MyBlogsComponent),
    canActivate: [AuthGuard],
    data: { animation: 'MyBlogs' }
  },
  {
    path: 'create-blog',
    loadComponent: () => import('./pages/create-blog/create-blog.component').then(m => m.CreateBlogComponent),
    canActivate: [AuthGuard],
    data: { animation: 'CreateBlog' }
  },
  {
    path: 'edit-blog/:id',
    loadComponent: () => import('./pages/edit-blog/edit-blog.component').then(m => m.EditBlogComponent),
    canActivate: [AuthGuard],
    data: { animation: 'EditBlog' }
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AdminGuard],
    data: { animation: 'Admin' }
  },
  {
    path: 'oauth-callback',
    loadComponent: () => import('./pages/oauth-callback/oauth-callback.component').then(m => m.OAuthCallbackComponent)
  },
  { path: '**', redirectTo: '' }
];
