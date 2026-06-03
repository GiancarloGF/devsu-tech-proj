import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  linkedSignal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateProductUseCase } from '../../../domain/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../../../domain/use-cases/update-product.use-case';
import { VerifyProductIdUseCase } from '../../../domain/use-cases/verify-product-id.use-case';
import {
  formatDisplayDateInput,
  formatDisplayDateInputValue,
  formatDateInput,
  parseDateInputAsLocal,
  releaseDateValidator,
  uniqueIdValidator,
} from '../../validators/product.validators';
import { GetProductsUseCase } from '@features/products/domain/use-cases/get-products.use-case';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly createUseCase = inject(CreateProductUseCase);
  private readonly updateUseCase = inject(UpdateProductUseCase);
  private readonly verifyUseCase = inject(VerifyProductIdUseCase);
  private readonly getProductsUseCase = inject(GetProductsUseCase);

  // ── Estado con Signals
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly editId = signal('');

  readonly isEditMode = computed(() => !!this.editId());

  readonly pageTitle = computed(() =>
    this.isEditMode() ? 'Formulario de Edición' : 'Formulario de Registro',
  );

  readonly submitLabel = computed(() =>
    this.isSubmitting() ? 'Guardando...' : this.isEditMode() ? 'Actualizar' : 'Agregar',
  );

  // date_revision se recalcula automáticamente cuando
  // cambia dateReleaseValue. Si el usuario lo modifica manualmente
  // (en modo editar), ese valor se respeta hasta que cambie la fuente.
  private readonly dateReleaseValue = signal('');

  readonly dateRevisionValue = linkedSignal<string, string>({
    source: this.dateReleaseValue,
    computation: (releaseDate, previous) => {
      if (!releaseDate) return previous?.value ?? '';

      const release = parseDateInputAsLocal(releaseDate);
      if (!release) return '';

      release.setFullYear(release.getFullYear() + 1);

      return formatDisplayDateInput(release);
    },
  });

  form!: FormGroup;

  ngOnInit(): void {
    this.editId.set(this.route.snapshot.params['id'] ?? '');
    this.buildForm();
    if (this.isEditMode()) {
      this.loadProductData();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      id: [
        { value: '', disabled: this.isEditMode() },
        [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
        this.isEditMode() ? [] : [uniqueIdValidator(this.verifyUseCase)],
      ],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', Validators.required],
      date_release: ['', [Validators.required, releaseDateValidator]],
      date_revision: [{ value: '', disabled: true }, Validators.required],
    });

    // Cada vez que cambia date_release en el form, actualizamos el signal fuente.
    // El linkedSignal dateRevisionValue reacciona y calcula la nueva fecha.
    // Luego sincronizamos el valor calculado de vuelta al control del form.
    this.form.get('date_release')?.valueChanges.subscribe((value: string) => {
      this.dateReleaseValue.set(value ?? '');
      this.form.get('date_revision')?.setValue(this.dateRevisionValue(), { emitEvent: false });
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const formValue = this.toProductPayload(this.form.getRawValue());
    const operation$ = this.isEditMode()
      ? this.updateUseCase.execute(this.editId(), formValue)
      : this.createUseCase.execute(formValue);

    operation$.subscribe({
      next: () => this.router.navigate(['/products']),
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isSubmitting.set(false);
      },
    });
  }

  onReset(): void {
    this.form.reset();
    this.form.markAsUntouched();
    this.dateReleaseValue.set('');
    this.errorMessage.set('');
  }

  onDateReleaseInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = formatDisplayDateInputValue(input.value);

    input.value = formattedValue;
    this.form.get('date_release')?.setValue(formattedValue);
  }

  // Helpers para el template
  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  getFieldError(field: string): string {
    const control = this.form.get(field);
    if (!control?.errors) return '';
    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['minlength'])
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['maxlength'])
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    if (control.errors['dateFormat']) return 'Usa el formato dd/mm/aaaa';
    if (control.errors['minDate']) return 'La fecha debe ser igual o mayor a hoy';
    if (control.errors['exactlyOneYear'])
      return 'Debe ser exactamente un año después de la fecha de liberación';
    if (control.errors['idAlreadyExists']) return 'Este ID ya existe';
    return '';
  }

  private loadProductData(): void {
    const state = history.state as {
      product?: {
        id: string;
        name: string;
        description: string;
        logo: string;
        date_release: string;
        date_revision: string;
      };
    };

    if (state?.product) {
      // Al hacer patchValue con date_release, el valueChanges dispara
      // y dateRevisionValue se recalcula via linkedSignal.
      this.form.patchValue(this.toDisplayFormValue(state.product));
      return;
    }

    this.loadFromApi();
  }

  private loadFromApi(): void {
    this.getProductsUseCase.execute().subscribe({
      next: products => {
        const product = products.find(p => p.id === this.editId());
        if (product) {
          this.form.patchValue(this.toDisplayFormValue(product));
        } else {
          this.router.navigate(['/products']); // ID inválido
        }
      },
      error: () => this.router.navigate(['/products']),
    });
  }

  private toProductPayload(formValue: {
    id: string;
    name: string;
    description: string;
    logo: string;
    date_release: string;
    date_revision: string;
  }) {
    return {
      ...formValue,
      date_release: this.toIsoDateValue(formValue.date_release),
      date_revision: this.toIsoDateValue(formValue.date_revision),
    };
  }

  private toDisplayFormValue(product: {
    id: string;
    name: string;
    description: string;
    logo: string;
    date_release: string;
    date_revision: string;
  }) {
    return {
      ...product,
      date_release: this.toDisplayDateValue(product.date_release),
      date_revision: this.toDisplayDateValue(product.date_revision),
    };
  }

  private toIsoDateValue(value: string): string {
    const date = parseDateInputAsLocal(value);
    return date ? formatDateInput(date) : value;
  }

  private toDisplayDateValue(value: string): string {
    const date = parseDateInputAsLocal(value);
    return date ? formatDisplayDateInput(date) : value;
  }
}
