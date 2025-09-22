import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageFormDialog } from './package-form-dialog';

describe('PackageFormDialog', () => {
  let component: PackageFormDialog;
  let fixture: ComponentFixture<PackageFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackageFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackageFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
