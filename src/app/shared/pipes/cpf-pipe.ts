import { Pipe, PipeTransform } from '@angular/core';

//Formata o CPF: 12345678901 -> 123.456.789-01
@Pipe({ name: 'cpf' })
export class CpfPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value || value.length !== 11) return value ?? '';
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
