import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarColumnComponent } from './calendar-column.component';

describe('CalendarColumnComponent', () => {
  let component: CalendarColumnComponent;
  let fixture: ComponentFixture<CalendarColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarColumnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
