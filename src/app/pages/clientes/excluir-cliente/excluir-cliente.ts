import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente-service';
import { CpfPipe } from '../../../shared/pipes/cpf-pipe';
import { CepPipe } from '../../../shared/pipes/cep-pipe';

@Component({
  imports: [RouterLink, DatePipe, CpfPipe, CepPipe],
  selector: 'app-excluir-cliente',
  styleUrl: './excluir-cliente.css',
  templateUrl: './excluir-cliente.html',
})
export class ExcluirCliente {

  //Injeção de dependência
  private clienteService = inject(ClienteService);
  private route = inject(ActivatedRoute);

  //Atributos
  cliente = signal<Cliente | null>(null);
  carregando = signal(true);
  excluindo = signal(false);
  excluido = signal(false);
  mensagemSucesso = signal('');
  mensagemErro = signal('');

  //Função executada ao abrir a página
  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    //Consultando o cliente na API
    this.clienteService.obterPorId(id)
      .subscribe({
        next: (cliente) => {
          this.cliente.set(cliente);
          this.carregando.set(false);
        },
        error: (e: HttpErrorResponse) => {
          this.mensagemErro.set(this.clienteService.extrairMensagemErro(e));
          this.carregando.set(false);
        }
      });
  }

  //Função para confirmar a exclusão do cliente
  excluirCliente() {
    const cliente = this.cliente();
    if (!cliente) return;

    this.mensagemErro.set('');
    this.excluindo.set(true);

    //Fazendo uma requisição DELETE para excluir o cliente
    this.clienteService.excluir(cliente.id)
      .subscribe({
        next: (excluido) => {
          this.mensagemSucesso.set(`Cliente ${excluido.nome} excluído com sucesso.`);
          this.excluido.set(true);
          this.excluindo.set(false);
        },
        error: (e: HttpErrorResponse) => {
          this.mensagemErro.set(this.clienteService.extrairMensagemErro(e));
          this.excluindo.set(false);
        }
      });
  }
}
