import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { ROLE_STORAGE_KEY } from './core/services/auth.service';

describe('App', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => sessionStorage.clear());

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the brand but hides search and role badge until a role is chosen', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.brand')?.textContent).toContain('Character Explorer');
    expect(element.querySelector('.search')).toBeNull();
    expect(element.querySelector('.role-badge')).toBeNull();
  });

  it('shows the global search and current role once a role is set', () => {
    sessionStorage.setItem(ROLE_STORAGE_KEY, 'viewer');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.search input')).not.toBeNull();
    expect(element.querySelector('.role-badge')?.textContent).toContain('Viewer');
  });
});
