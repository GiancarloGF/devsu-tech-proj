import { FormControl } from '@angular/forms';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  formatDateInput,
  formatDisplayDateInput,
  formatDisplayDateInputValue,
  parseDateInputAsLocal,
  releaseDateValidator,
} from './product.validators';

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
});
