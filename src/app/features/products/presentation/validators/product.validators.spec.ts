import { FormControl, ValidationErrors } from '@angular/forms';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  formatDateInput,
  formatDisplayDateInput,
  formatDisplayDateInputValue,
  parseDateInputAsLocal,
  releaseDateValidator,
  revisionDateValidator,
  uniqueIdValidator,
} from './product.validators';
import { VerifyProductIdUseCase } from '../../domain/use-cases/verify-product-id/verify-product-id.use-case';

describe('product validators', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts the current local date as a valid release date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 3, 12));

    const result = releaseDateValidator(new FormControl('03/06/2026'));

    expect(result).toBeNull();
  });

  it('rejects release dates before the current local date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 3, 12));

    const result = releaseDateValidator(new FormControl('02/06/2026'));

    expect(result).toEqual({ minDate: true });
  });

  it('rejects invalid release date formats', () => {
    const result = releaseDateValidator(new FormControl('2026/06/03'));

    expect(result).toEqual({ dateFormat: true });
  });

  it('parses iso date input values without shifting the local day', () => {
    const date = parseDateInputAsLocal('2026-06-03');

    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(5);
    expect(date?.getDate()).toBe(3);
  });

  it('parses display date input values without shifting the local day', () => {
    const date = parseDateInputAsLocal('03/06/2026');

    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(5);
    expect(date?.getDate()).toBe(3);
  });

  it('formats dates as valid date input values', () => {
    const date = new Date(2027, 5, 3);

    expect(formatDateInput(date)).toBe('2027-06-03');
  });

  it('formats dates as display date input values', () => {
    const date = new Date(2027, 5, 3);

    expect(formatDisplayDateInput(date)).toBe('03/06/2027');
  });

  it('formats typed display date values with slashes and only digits', () => {
    expect(formatDisplayDateInputValue('03062026')).toBe('03/06/2026');
    expect(formatDisplayDateInputValue('03a06-2026')).toBe('03/06/2026');
    expect(formatDisplayDateInputValue('030620261234')).toBe('03/06/2026');
  });

  it('accepts a review date exactly one year after the release date', () => {
    const releaseControl = new FormControl('03/06/2026');
    const revisionControl = new FormControl('03/06/2027');
    const parent = {
      get: (field: string): FormControl<string | null> | null =>
        field === 'date_release' ? releaseControl : null,
    };
    Object.defineProperty(revisionControl, 'parent', { value: parent });

    const result = revisionDateValidator('date_release')(revisionControl);

    expect(result).toBeNull();
  });

  it('rejects a review date that is not exactly one year after the release date', () => {
    const releaseControl = new FormControl('03/06/2026');
    const revisionControl = new FormControl('04/06/2027');
    const parent = {
      get: (field: string): FormControl<string | null> | null =>
        field === 'date_release' ? releaseControl : null,
    };
    Object.defineProperty(revisionControl, 'parent', { value: parent });

    const result = revisionDateValidator('date_release')(revisionControl);

    expect(result).toEqual({ exactlyOneYear: true });
  });

  it('marks an id as invalid when the verification endpoint says it exists', async () => {
    const verifyUseCase = {
      execute: vi.fn(() => of(true)),
    } as unknown as VerifyProductIdUseCase;
    const validator = uniqueIdValidator(verifyUseCase);

    const result = await firstValueFrom(
      validator(new FormControl('abc')) as Observable<ValidationErrors | null>,
    );

    expect(result).toEqual({ idAlreadyExists: true });
  });

  it('accepts an id when the verification endpoint says it does not exist', async () => {
    const verifyUseCase = {
      execute: vi.fn(() => of(false)),
    } as unknown as VerifyProductIdUseCase;
    const validator = uniqueIdValidator(verifyUseCase);

    const result = await firstValueFrom(
      validator(new FormControl('abc')) as Observable<ValidationErrors | null>,
    );

    expect(result).toBeNull();
  });

  it('returns a validation error when id verification fails', async () => {
    const verifyUseCase = {
      execute: vi.fn(() => throwError(() => new Error('API failed'))),
    } as unknown as VerifyProductIdUseCase;
    const validator = uniqueIdValidator(verifyUseCase);

    const result = await firstValueFrom(
      validator(new FormControl('abc')) as Observable<ValidationErrors | null>,
    );

    expect(result).toEqual({ idVerificationFailed: true });
  });
});
