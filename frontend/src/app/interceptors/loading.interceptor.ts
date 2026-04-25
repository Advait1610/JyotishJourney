import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

const SILENT_URLS = ['/notifications/unread-count'];

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const isSilent = SILENT_URLS.some(u => req.url.includes(u));
  if (isSilent) return next(req);

  const loading = inject(LoadingService);
  loading.show();
  return next(req).pipe(
    finalize(() => loading.hide())
  );
};
