import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoursColumnComponent } from './hours-column.component';

describe('HoursColumnComponent', () => {
  let component: HoursColumnComponent;
  let fixture: ComponentFixture<HoursColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoursColumnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoursColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
