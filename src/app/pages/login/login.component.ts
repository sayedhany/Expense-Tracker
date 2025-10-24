import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../shared/loading.service';
import { LoadingComponent } from '../../shared/loading.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, LoadingComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = signal(true);
  router = inject(Router);

  constructor(private fb: FormBuilder, private loading: LoadingService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePassword() {
    this.hidePassword.update((v) => !v);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      // Simulate async login with loading
      this.loading.simulate(async () => {
        this.router.navigate(['/dashboard']);
        return { ok: true };
      }, 1200);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
