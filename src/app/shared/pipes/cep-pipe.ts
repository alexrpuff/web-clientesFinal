import { Pipe, PipeTransform } from '@angular/core';

//Formata o CEP: 24000000 -> 24000-000
@Pipe({ name: 'cep' })
export class CepPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value || value.length !== 8) return value ?? '';
    return value.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
}
