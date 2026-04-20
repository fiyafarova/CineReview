import { Injectable, signal } from '@angular/core';

type ToastKind = 'success';

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);
  private nextId = 1;

  showSuccess(text: string, durationMs: number = 2800): void {
    const id = this.nextId++;
    const toast: ToastMessage = { id, kind: 'success', text };

    this.toasts.update((current) => [...current, toast]);

    window.setTimeout(() => {
      this.dismiss(id);
    }, durationMs);
  }

  dismiss(id: number): void {
    this.toasts.update((current) => current.filter((toast) => toast.id !== id));
  }
}