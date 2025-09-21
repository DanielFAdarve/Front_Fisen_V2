import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cie10 } from './cie10';

describe('Cie10', () => {
  let component: Cie10;
  let fixture: ComponentFixture<Cie10>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cie10]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cie10);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
