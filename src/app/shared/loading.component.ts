import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import { LoadingService } from './loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if(loading()) {
    <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
        <div
          class="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"
        ></div>
        <div class="text-gray-700 font-medium">Loading...</div>
      </div>
    </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent {
  private loadingService = inject(LoadingService);
  loading = this.loadingService.loading;
}
