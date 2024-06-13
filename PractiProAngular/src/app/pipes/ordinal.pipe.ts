import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ordinal',
  standalone: true
})
export class OrdinalPipe implements PipeTransform {

  transform(int: any) {
    const ones = +int % 10, tens = +int % 100 - ones;
    return int + ["th", "st", "nd", "rd"][tens === 10 || ones > 3 ? 0 : ones];
  }

}
