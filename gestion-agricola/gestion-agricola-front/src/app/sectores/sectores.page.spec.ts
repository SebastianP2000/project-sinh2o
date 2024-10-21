import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectoresPage } from './sectores.page';

describe('SectoresPage', () => {
  let component: SectoresPage;
  let fixture: ComponentFixture<SectoresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SectoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
