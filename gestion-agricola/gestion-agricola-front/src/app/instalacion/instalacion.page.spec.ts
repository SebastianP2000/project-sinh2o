import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstalacionPage } from './instalacion.page';

describe('InstalacionPage', () => {
  let component: InstalacionPage;
  let fixture: ComponentFixture<InstalacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InstalacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
