import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private requestCount = signal(0);
  private delayedVisible = signal(false);
  private delayTimer: any = null;

  private static readonly DELAY_MS = 300;

  readonly isLoading = computed(() => this.delayedVisible());

  show(): void {
    this.requestCount.update(c => c + 1);
    if (!this.delayTimer) {
      this.delayTimer = setTimeout(() => {
        if (this.requestCount() > 0) {
          this.delayedVisible.set(true);
        }
        this.delayTimer = null;
      }, LoadingService.DELAY_MS);
    }
  }

  hide(): void {
    this.requestCount.update(c => Math.max(0, c - 1));
    if (this.requestCount() === 0) {
      if (this.delayTimer) {
        clearTimeout(this.delayTimer);
        this.delayTimer = null;
      }
      this.delayedVisible.set(false);
    }
  }

  reset(): void {
    this.requestCount.set(0);
    this.delayedVisible.set(false);
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
  }
}
