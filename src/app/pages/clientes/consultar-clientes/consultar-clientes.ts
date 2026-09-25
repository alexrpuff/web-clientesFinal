import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente-service';
import { ErroService } from '../../../services/erro-service';
import { CpfPipe } from '../../../shared/pipes/cpf-pipe';
import { CepPipe } from '../../../shared/pipes/cep-pipe';

@Component({
  imports: [RouterLink, DatePipe, CpfPipe, CepPipe],
  selector: 'app-consultar-clientes',
  styleUrl: './consultar-clientes.css',
  templateUrl: './consultar-clientes.html',
})
export class ConsultarClientes {

  //Injeção de dependência
  private clienteService = inject(ClienteService);
  private erroService = inject(ErroService);

  //Atributos
  clientes = signal<Cliente[]>([]);
  filtro = signal('');
  carregando = signal(true);
  mensagemErro = signal('');

  //Clientes filtrados por nome, email ou CPF
  clientesFiltrados = computed(() => {
    const termo = this.filtro().trim().toLowerCase();
    if (!termo) return this.clientes();
    return this.clientes().filter(c =>
      c.nome.toLowerCase().includes(termo) ||
      c.email.toLowerCase().includes(termo) ||
      c.cpf.includes(termo.replace(/\D/g, '') || termo)
    );
  });

  //Função executada ao abrir a página
  ngOnInit() {
    //Consultando os clientes na API (já ordenados por nome)
    this.clienteService.consultar()
      .subscribe({
        next: (clientes) => {
          this.clientes.set(clientes);
          this.carregando.set(false);
        },
        error: (e: HttpErrorResponse) => {
          //Erros 400, 404, 409 e 500 vão para a página de erro
          if (!this.erroService.redirecionar(e)) {
            this.mensagemErro.set(this.clienteService.extrairMensagemErro(e));
          }
          this.carregando.set(false);
        }
      });
  }

  filtrar(event: Event) {
    this.filtro.set((event.target as HTMLInputElement).value);
  }
}
