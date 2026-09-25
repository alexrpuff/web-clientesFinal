import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente, CriarClienteRequest, EditarClienteRequest } from '../models/cliente';

/*
    Serviço para integração com os ENDPOINTS da API de clientes
*/
@Injectable({ providedIn: 'root' })
export class ClienteService {

  //Endereço da API (projeto clientesFinal)
  private readonly apiUrl = 'http://localhost:8083/api/clientes';

  //Injeção de dependência do HttpClient
  private http = inject(HttpClient);

  //POST /api/clientes
  cadastrar(request: CriarClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, request);
  }

  //PUT /api/clientes
  editar(request: EditarClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(this.apiUrl, request);
  }

  //DELETE /api/clientes/{id}
  excluir(id: number): Observable<Cliente> {
    return this.http.delete<Cliente>(`${this.apiUrl}/${id}`);
  }

  //GET /api/clientes
  consultar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  //GET /api/clientes/{id}
  obterPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  /*
      Converte a resposta de erro da API em uma mensagem:
      - 400: objeto com os erros de validação de cada campo
      - 404/409/500: texto com a mensagem de erro
  */
  extrairMensagemErro(e: HttpErrorResponse): string {
    if (e.status === 0) {
      return 'Não foi possível conectar à API. Verifique se o backend está em execução.';
    }
    if (typeof e.error === 'string') {
      return e.error;
    }
    if (e.error && typeof e.error === 'object') {
      return Object.values(e.error).join(' ');
    }
    return 'Ocorreu um erro inesperado.';
  }
}
