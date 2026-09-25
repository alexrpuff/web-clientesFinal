import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CriarClienteRequest } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente-service';
import { ClienteForm, criarFormCliente } from '../../../shared/cliente-form/cliente-form';

@Component({
  imports: [ReactiveFormsModule, RouterLink, ClienteForm],
  selector: 'app-cadastrar-cliente',
  styleUrl: './cadastrar-cliente.css',
  templateUrl: './cadastrar-cliente.html',
})
export class CadastrarCliente {

  //Injeção de dependência
  private clienteService = inject(ClienteService);

  //Atributos
  mensagemSucesso = signal('');
  mensagemErro = signal('');
  enviando = signal(false);

  //Formulário reativo
  formCliente = criarFormCliente();

  //Função executada no submit do formulário
  cadastrarCliente() {

    //limpando as mensagens de sucesso e erro
    this.mensagemSucesso.set('');
    this.mensagemErro.set('');

    if (this.formCliente.invalid) {
      this.formCliente.markAllAsTouched();
      return;
    }

    this.enviando.set(true);

    //Fazendo uma requisição POST para cadastrar o cliente
    this.clienteService.cadastrar(this.formCliente.getRawValue() as CriarClienteRequest)
      .subscribe({
        next: (cliente) => {
          this.mensagemSucesso.set(
            `Cliente ${cliente.nome} cadastrado com sucesso. Um email de confirmação foi enviado para ${cliente.email}.`
          );
          this.formCliente.reset();
          this.enviando.set(false);
        },
        error: (e: HttpErrorResponse) => {
          this.mensagemErro.set(this.clienteService.extrairMensagemErro(e));
          this.enviando.set(false);
        }
      });
  }
}
