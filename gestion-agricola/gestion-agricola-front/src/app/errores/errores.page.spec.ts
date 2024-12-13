import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErroresPage } from './errores.page';

describe('ErroresPage', () => {
  let component: ErroresPage;
  let fixture: ComponentFixture<ErroresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ErroresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
