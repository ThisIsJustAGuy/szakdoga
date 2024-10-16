import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventAcceptComponent } from './event-accept.component';

describe('EventAcceptComponent', () => {
  let component: EventAcceptComponent;
  let fixture: ComponentFixture<EventAcceptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventAcceptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventAcceptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
