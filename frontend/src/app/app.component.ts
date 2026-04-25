import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { SpaceBackgroundComponent } from './components/space-background/space-background.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { LoadingService } from './services/loading.service';
import { routeAnimations } from './animations/route-animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, SpaceBackgroundComponent, LoadingSpinnerComponent],
  template: `
    <app-space-background />
    <app-navbar />
    <main class="main-content" [@routeAnimations]="getRouteAnimationData()">
      <router-outlet #outlet="outlet" />
    </main>
    <app-footer />
    @if (loadingService.isLoading()) {
      <app-loading-spinner mode="overlay" message="Consulting the stars..." />
    }
  `,
  styles: [`
    :host {
      display: block;
      overflow-x: hidden;
      width: 100%;
    }
    .main-content {
      position: relative;
      min-height: calc(100vh - 140px);
      padding-top: 70px;
      overflow-x: hidden;
      max-width: 100vw;
      z-index: 1;
    }
    @media (max-width: 480px) {
      .main-content {
        min-height: calc(100vh - 110px);
      }
    }
  `],
  animations: [routeAnimations]
})
export class AppComponent {
  loadingService = inject(LoadingService);

  getRouteAnimationData() {
    return '';
  }
}
