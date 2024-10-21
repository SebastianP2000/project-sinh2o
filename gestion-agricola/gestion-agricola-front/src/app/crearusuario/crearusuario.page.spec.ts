import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearusuarioPage } from './crearusuario.page';

describe('CrearusuarioPage', () => {
  let component: CrearusuarioPage;
  let fixture: ComponentFixture<CrearusuarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearusuarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
