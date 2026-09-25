import { Component, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UFS } from '../../models/cliente';

/*
    Cria o formulário reativo do cliente com as mesmas
    regras de validação da API
*/
export function criarFormCliente() {
  //nonNullable: ao limpar o formulário (reset) os campos voltam para ''
  const fb = inject(FormBuilder).nonNullable;
  return fb.group({
    nome: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    dataNascimento: ['', [Validators.required]],
    endereco: fb.group({
      logradouro: ['', [Validators.required]],
      complemento: [''],
      numero: ['', [Validators.required]],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      uf: ['', [Validators.required]],
      cep: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    }),
  });
}

export type FormCliente = ReturnType<typeof criarFormCliente>;

//Valores preenchidos no formulário (usados como rascunho ao ir para a página de erro)
export type DadosFormCliente = ReturnType<FormCliente['getRawValue']>;

/*
    Campos do formulário de cliente e endereço,
    compartilhados pelas páginas de cadastro e edição
*/
@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-cliente-form',
  templateUrl: './cliente-form.html',
})
export class ClienteForm {

  //Formulário recebido da página (cadastro ou edição)
  form = input.required<FormCliente>();

  ufs = UFS;

  //Verifica se o campo foi tocado e está inválido
  invalido(campo: string): boolean {
    const control = this.form().get(campo);
    return !!control && control.touched && control.invalid;
  }
}
