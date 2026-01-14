import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopnavComponent } from './topnav.component';
import { GithubService } from '../../services/github.service';
import { ElectronService } from '../../services/electron.service';
import { signal } from '@angular/core';

describe('TopnavComponent', () => {
  let component: TopnavComponent;
  let fixture: ComponentFixture<TopnavComponent>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let githubServiceMock: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let electronServiceMock: any;

  beforeEach(async () => {
    githubServiceMock = {
      checkLatestVersion: jasmine.createSpy('checkLatestVersion'),
      updateStatus: signal('checking'),
      latestRelease: signal(null),
      error: signal(null),
      releaseNote: signal(null),
      quitAndInstall: jasmine.createSpy('quitAndInstall'),
      CURRENT_VERSION: '0.0.8'
    };

    electronServiceMock = {
      checkAdminStatus: jasmine.createSpy('checkAdminStatus').and.returnValue(Promise.resolve(false)),
      relaunchAsAdmin: jasmine.createSpy('relaunchAsAdmin')
    };

    await TestBed.configureTestingModule({
      imports: [TopnavComponent],
      providers: [
        { provide: GithubService, useValue: githubServiceMock },
        { provide: ElectronService, useValue: electronServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopnavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call checkLatestVersion on init', () => {
    expect(githubServiceMock.checkLatestVersion).toHaveBeenCalled();
  });

  it('should display spinner when status is checking', () => {
    githubServiceMock.updateStatus.set('checking');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.status-pill.checking')).toBeTruthy();
  });

  it('should display outdated badge when status is outdated', () => {
    githubServiceMock.updateStatus.set('outdated');
    githubServiceMock.latestRelease.set({ tag_name: 'v1.0.0', html_url: '#' });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.status-pill.outdated')).toBeTruthy();
    expect(compiled.textContent).toContain('Update Available');
  });

  it('should display restart button when status is downloaded', () => {
    githubServiceMock.updateStatus.set('downloaded');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('.update-action-btn');
    expect(btn).toBeTruthy();
    expect(compiled.textContent).toContain('Restart & Update');
    
    btn?.dispatchEvent(new Event('click'));
    expect(githubServiceMock.quitAndInstall).toHaveBeenCalled();
  });
});
