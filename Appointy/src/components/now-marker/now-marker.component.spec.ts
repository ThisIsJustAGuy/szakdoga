import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NowMarkerComponent } from './now-marker.component';

describe('NowMarkerComponent', () => {
  let component: NowMarkerComponent;
  let fixture: ComponentFixture<NowMarkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NowMarkerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NowMarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
