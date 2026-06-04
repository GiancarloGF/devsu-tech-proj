import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MockBuilder, MockRender } from 'ng-mocks';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClickOutsideDirective } from './click-outside.directive';

@Component({
  standalone: true,
  imports: [ClickOutsideDirective],
  template: `
    <div class="inside-zone" appClickOutside (clickOutside)="onOutside()">
      <button class="inside-button">Inside</button>
    </div>
    <button class="outside-button">Outside</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ClickOutsideHostComponent {
  readonly onOutside = vi.fn();
}

describe('ClickOutsideDirective', () => {
  beforeEach(() => MockBuilder(ClickOutsideHostComponent).keep(ClickOutsideDirective));

  it('does not emit when clicking inside the host element', () => {
    const fixture = MockRender(ClickOutsideHostComponent);
    const button = fixture.nativeElement.querySelector('.inside-button') as HTMLButtonElement;

    button.click();

    expect(fixture.point.componentInstance.onOutside).not.toHaveBeenCalled();
  });

  it('emits when clicking outside the host element', () => {
    const fixture = MockRender(ClickOutsideHostComponent);
    const button = fixture.nativeElement.querySelector('.outside-button') as HTMLButtonElement;

    button.click();

    expect(fixture.point.componentInstance.onOutside).toHaveBeenCalledOnce();
  });
});
