import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

//Códigos de erro da API exibidos na página de erro amigável
export const CODIGOS_PAGINA_ERRO = [400, 404, 409, 500];

//Dados do último erro, exibidos na página de erro
export interface DetalhesErro {
  codigo: number;
  mensagens: string[];
  origem: string | null;
}

/*
    Serviço para redirecionar os erros da API para a página de erro
    e guardar os dados digitados no formulário (rascunho), para que
    o usuário possa voltar e corrigir sem perder o que já preencheu
*/
@Injectable({ providedIn: 'root' })
export class ErroService {

  //Injeção de dependência
  private router = inject(Router);

  private ultimoErro: DetalhesErro | null = null;

  //Rascunhos dos formulários, identificados pela URL da página
  private rascunhos = new Map<string, unknown>();

  /*
      Redireciona para a página de erro quando o status for 400, 404, 409 ou 500.
      Retorna false nos demais casos (ex.: API fora do ar), que continuam
      sendo tratados na própria página.
  */
  redirecionar(e: HttpErrorResponse, rascunho?: unknown): boolean {
    if (!CODIGOS_PAGINA_ERRO.includes(e.status)) {
      return false;
    }

    const origem = this.router.url;
    this.ultimoErro = { codigo: e.status, mensagens: this.extrairMensagens(e), origem };

    if (rascunho !== undefined) {
      this.rascunhos.set(origem, rascunho);
    }

    this.router.navigate(['/erro', e.status]);
    return true;
  }

  //Detalhes do último erro, se ele corresponder ao código exibido na página
  obterErro(codigo: number): DetalhesErro {
    if (this.ultimoErro?.codigo === codigo) {
      return this.ultimoErro;
    }
    return { codigo, mensagens: [], origem: null };
  }

  //Retorna (e descarta) o rascunho guardado para a página atual
  recuperarRascunho<T>(): T | null {
    const url = this.router.url;
    const rascunho = this.rascunhos.get(url) as T | undefined;
    this.rascunhos.delete(url);
    return rascunho ?? null;
  }

  /*
      Mensagens retornadas pela API:
      - 400: objeto com os erros de validação de cada campo
      - 404/409/500: texto com a mensagem de erro
  */
  private extrairMensagens(e: HttpErrorResponse): string[] {
    if (typeof e.error === 'string' && e.error.trim()) {
      return [e.error];
    }
    if (e.error && typeof e.error === 'object') {
      return Object.values(e.error).map(String);
    }
    return [];
  }
}
