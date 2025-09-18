import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientFormDialog } from './patient-form-dialog';

describe('PatientFormDialog', () => {
  let component: PatientFormDialog;
  let fixture: ComponentFixture<PatientFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
