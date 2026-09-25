import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente-service';

//Quantidade de clientes em uma localidade (estado ou cidade)
export interface Localidade {
  nome: string;
  uf: string;
  quantidade: number;
  percentual: number;
  cidades?: string[];
}

@Component({
  imports: [RouterLink, DecimalPipe],
  selector: 'app-inicio',
  styleUrl: './inicio.css',
  templateUrl: './inicio.html',
})
export class Inicio {

  //Injeção de dependência
  private clienteService = inject(ClienteService);

  //Atributos
  clientes = signal<Cliente[]>([]);
  carregando = signal(true);
  mensagemErro = signal('');

  totalClientes = computed(() => this.clientes().length);

  /*
      Clientes por estado (UF). Um cliente é contado uma única vez
      por estado, mesmo que tenha mais de um endereço nele.
  */
  clientesPorEstado = computed<Localidade[]>(() => {
    const estados = new Map<string, { clientes: Set<number>; cidades: Set<string> }>();
    for (const cliente of this.clientes()) {
      for (const endereco of cliente.enderecos) {
        const uf = endereco.uf.toUpperCase();
        const estado = estados.get(uf) ?? { clientes: new Set<number>(), cidades: new Set<string>() };
        estado.clientes.add(cliente.id);
        estado.cidades.add(endereco.cidade);
        estados.set(uf, estado);
      }
    }
    return this.ordenar([...estados].map(([uf, estado]) => ({
      nome: uf,
      uf,
      quantidade: estado.clientes.size,
      percentual: this.percentual(estado.clientes.size),
      cidades: [...estado.cidades].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    })));
  });

  //Clientes por cidade (a mesma cidade pode existir em estados diferentes)
  clientesPorCidade = computed<Localidade[]>(() => {
    const cidades = new Map<string, { nome: string; uf: string; clientes: Set<number> }>();
    for (const cliente of this.clientes()) {
      for (const endereco of cliente.enderecos) {
        const uf = endereco.uf.toUpperCase();
        const chave = `${endereco.cidade.trim().toLowerCase()}|${uf}`;
        const cidade = cidades.get(chave) ?? { nome: endereco.cidade.trim(), uf, clientes: new Set<number>() };
        cidade.clientes.add(cliente.id);
        cidades.set(chave, cidade);
      }
    }
    return this.ordenar([...cidades.values()].map(cidade => ({
      nome: cidade.nome,
      uf: cidade.uf,
      quantidade: cidade.clientes.size,
      percentual: this.percentual(cidade.clientes.size),
    })));
  });

  //Maior quantidade por estado, usada como escala das barras
  maiorQuantidadeEstado = computed(() =>
    Math.max(1, ...this.clientesPorEstado().map(e => e.quantidade)));

  //Função executada ao abrir a página
  ngOnInit() {
    this.clienteService.consultar()
      .subscribe({
        next: (clientes) => {
          this.clientes.set(clientes);
          this.carregando.set(false);
        },
        error: (e: HttpErrorResponse) => {
          this.mensagemErro.set(this.clienteService.extrairMensagemErro(e));
          this.carregando.set(false);
        }
      });
  }

  larguraBarra(quantidade: number): number {
    return (quantidade / this.maiorQuantidadeEstado()) * 100;
  }

  private percentual(quantidade: number): number {
    return this.totalClientes() ? (quantidade / this.totalClientes()) * 100 : 0;
  }

  //Ordena da maior para a menor quantidade e, no empate, pelo nome
  private ordenar(localidades: Localidade[]): Localidade[] {
    return localidades.sort((a, b) =>
      b.quantidade - a.quantidade || a.nome.localeCompare(b.nome, 'pt-BR'));
  }
}
