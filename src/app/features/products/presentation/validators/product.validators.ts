import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, map, catchError, of, debounceTime, first, switchMap } from 'rxjs';
import { VerifyProductIdUseCase } from '../../domain/use-cases/verify-product-id.use-case';

export function parseDateInputAsLocal(value: string): Date | null {
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const displayMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  const [, year, month, day] = isoMatch ?? [];
  const [, displayDay, displayMonth, displayYear] = displayMatch ?? [];

  const parsedYear = Number(year ?? displayYear);
  const parsedMonth = Number(month ?? displayMonth);
  const parsedDay = Number(day ?? displayDay);
  const date = new Date(parsedYear, parsedMonth - 1, parsedDay);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== parsedYear ||
    date.getMonth() !== parsedMonth - 1 ||
    date.getDate() !== parsedDay
  ) {
    return null;
  }

  return date;
}

export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatDisplayDateInput(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function formatDisplayDateInputValue(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  return [day, month, year].filter(Boolean).join('/');
}

// Validador síncrono: fecha de liberación >= hoy
export function releaseDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const release = parseDateInputAsLocal(control.value);

  if (!release) return { dateFormat: true };

  return release >= today ? null : { minDate: true };
}

// Validador síncrono: fecha de revisión = fecha liberación + 1 año
export function revisionDateValidator(releaseDateControlName: string) {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;

    if (!parent) return null;

    const releaseValue = parent.get(releaseDateControlName)?.value;

    if (!releaseValue || !control.value) return null;

    const release = parseDateInputAsLocal(releaseValue);
    if (!release) return { dateFormat: true };

    const expected = new Date(release);

    expected.setFullYear(expected.getFullYear() + 1);

    const revision = parseDateInputAsLocal(control.value);
    if (!revision) return { dateFormat: true };

    const diff = Math.abs(revision.getTime() - expected.getTime());

    return diff < 86400000 ? null : { exactlyOneYear: true }; // tolerancia 1 día
  };
}

// Validador asíncrono: ID no debe existir (para creación)
export function uniqueIdValidator(verifyUseCase: VerifyProductIdUseCase): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);

    return of(control.value).pipe(
      debounceTime(400),
      switchMap(id => verifyUseCase.execute(id)),
      map(exists => (exists ? { idAlreadyExists: true } : null)),
      catchError(() => of(null)),
      first(),
    );
  };
}
