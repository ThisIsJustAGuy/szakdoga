import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {isSameDay} from "date-fns";
import {CalendarEvent} from "../classes/CalendarEvent";

export function startBeforeEndValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const start = control.get('start')?.value;
    const end = control.get('end')?.value;


    if (start && end && start >= end) {
      return {startBeforeEnd: true};
    }

    return null;
  };
}

export function disallowedTimeValidator(disallowedDates: (string | string[])[], startDate?: Date, endDate?: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    let start: Date = getDateValue(startDate, control.get('start'), control.get('date'));
    let end: Date = getDateValue(endDate, control.get('end'), control.get('date'));

    for (const d_date of disallowedDates) {
      if (Array.isArray(d_date)) {

        const d_start: Date = new Date(d_date[0]);
        const d_end: Date = new Date(d_date[1]);

        if (start < d_end && start > d_start) { //start a disallowed-on belül
          return {startInDisallowed: true};
        }
        if (end < d_end && end > d_start) { //end a disallowed-on belül
          return {endInDisallowed: true};
        }
        if (start < d_start && end > d_end) { // start és end közrefogja a disallowed intervallumot
          return {timesEnvelopDisallowed: true};
        }

      } else {
        if (isSameDay(d_date, start)) {
          return {appointmentOnDisallowedDay: true};
        }

      }
    }

    return null;
  };
}

export function overlapValidator(overlaps: boolean | boolean[], locations: string[], events: CalendarEvent[], startDate?: Date, endDate?: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    let start: Date = getDateValue(startDate, control.get('start'), control.get('date'));
    let end: Date = getDateValue(endDate, control.get('end'), control.get('date'));

    if (Array.isArray(overlaps)) {
      for (let i = 0; i < overlaps.length; i++) {//overlaps és locations ugyan olyan hosszú kell legyen
        if (!overlaps[i] && control.get('location')?.value == locations[i]) {
          //itt nem engedjük az overlapet
          for (const event of events) {
            console.log(event.startDate);
            // if (start < event.startDate && start > d_start) { //start a disallowed-on belül
            //   return {startInDisallowed: true};
            // }
            // if (end < d_end && end > d_start) { //end a disallowed-on belül
            //   return {endInDisallowed: true};
            // }
            // if (start < d_start && end > d_end) { // start és end közrefogja a disallowed intervallumot
            //   return {timesEnvelopDisallowed: true};
            // }
          }
        }
      }
    } else {

    }
    return null;
  };
}

function getDateValue(date: Date | undefined, timeValue: AbstractControl | null, dateValue: AbstractControl | null): Date{
  let start: Date;
  const start_time = timeValue?.value.split(':');
  if (date)
    start = new Date(date);
  else
    start = new Date(dateValue?.value);
  start.setHours(+start_time[0]);
  start.setMinutes(+start_time[1]);
  return start;
}
