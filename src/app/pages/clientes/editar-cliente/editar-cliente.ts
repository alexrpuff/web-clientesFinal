import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Endereco, EditarClienteRequest } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente-service';
import { ErroService } from '../../../services/erro-service';
import { ClienteForm, DadosFormCliente, criarFormCliente } from '../../../shared/cliente-form/cliente-form';

//Valor da opção "adicionar novo endereço" na seleção de endereços
const NOVO_ENDERECO = 'novo';

//Dados digitados guardados ao ir para a página de erro
interface RascunhoEdicao {
  dados: DadosFormCliente;
  enderecoSelecionado: string;
}

@Component({
  imports: [ReactiveFormsModule, RouterLink, ClienteForm],
  selector: 'app-editar-cliente',
  styleUrl: './editar-cliente.css',
  templateUrl: './editar-cliente.html',
})
export class EditarCliente {

  //Injeção de dependência
  private clienteService = inject(ClienteService);
  private route = inject(ActivatedRoute);
  private erroService = inject(ErroService);

  //Atributos
  id = 0;
  enderecos = signal<Endereco[]>([]);
  enderecoSelecionado = signal<string>(NOVO_ENDERECO);
  carregando = signal(true);
  encontrado = signal(false);
  enviando = signal(false);
  mensagemSucesso = signal('');
  mensagemErro = signal('');

  readonly novoEndereco = NOVO_ENDERECO;

  //Formulário reativo
  formCliente = criarFormCliente();

  //Função executada ao abrir a página
  ngOnInit() {
    //Capturando o ID do cliente na rota
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    //Consultando o cliente na API
    this.clienteService.obterPorId(this.id)
      .subscribe({
        next: (cliente) => {
          this.formCliente.patchValue({
            nome: cliente.nome,
            email: cliente.email,
            cpf: cliente.cpf,
            dataNascimento: cliente.dataNascimento,
          });
          this.enderecos.set(cliente.enderecos);
          //Selecionando o primeiro endereço do cliente para edição
          this.selecionarEndereco(cliente.enderecos.length > 0 ? String(cliente.enderecos[0].id) : NOVO_ENDERECO);
          this.restaurarRascunho();
          this.encontrado.set(true);
          this.carregando.set(false);
        },
        error: (e: HttpErrorResponse) => {
          //Erros 404 e 500 vão para a página de erro
          if (!this.erroService.redirecionar(e)) {
            this.mensagemErro.set(this.clienteService.extrairMensagemErro(e));
          }
          this.carregando.set(false);
        }
      });
  }

  //Preenche os campos de endereço conforme o endereço selecionado
  selecionarEndereco(valor: string) {
    this.enderecoSelecionado.set(valor);
    const endereco = this.enderecos().find(e => String(e.id) === valor);
    const grupo = this.formCliente.controls.endereco;

    if (endereco) {
      grupo.reset({
        logradouro: endereco.logradouro,
        complemento: endereco.complemento ?? '',
        numero: endereco.numero,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        uf: endereco.uf,
        cep: endereco.cep,
      });
    } else {
      grupo.reset();
    }
  }

  onSelecionarEndereco(event: Event) {
    this.selecionarEndereco((event.target as HTMLSelectElement).value);
  }

  //Função executada no submit do formulário
  editarCliente() {

    //limpando as mensagens de sucesso e erro
    this.mensagemSucesso.set('');
    this.mensagemErro.set('');

    if (this.formCliente.invalid) {
      this.formCliente.markAllAsTouched();
      return;
    }

    const dados = this.formCliente.getRawValue();
    const selecionado = this.enderecoSelecionado();

    const request = {
      ...dados,
      id: this.id,
      endereco: {
        ...dados.endereco,
        id: selecionado === NOVO_ENDERECO ? null : Number(selecionado),
      },
    } as EditarClienteRequest;

    this.enviando.set(true);

    //Fazendo uma requisição PUT para editar o cliente
    this.clienteService.editar(request)
      .subscribe({
        next: (cliente) => {
          this.enderecos.set(cliente.enderecos);
          //Se um novo endereço foi adicionado, ele passa a ser o endereço selecionado
          if (selecionado === NOVO_ENDERECO && cliente.enderecos.length > 0) {
            this.enderecoSelecionado.set(String(cliente.enderecos[cliente.enderecos.length - 1].id));
          }
          this.mensagemSucesso.set(`Cliente ${cliente.nome} atualizado com sucesso.`);
          this.enviando.set(false);
        },
        error: (e: HttpErrorResponse) => {
          //Erros 400, 404, 409 e 500 vão para a página de erro, guardando os dados digitados
          const rascunho: RascunhoEdicao = { dados, enderecoSelecionado: selecionado };
          if (!this.erroService.redirecionar(e, rascunho)) {
            this.mensagemErro.set(this.clienteService.extrairMensagemErro(e));
          }
          this.enviando.set(false);
        }
      });
  }

  //Restaurando os dados digitados antes de um erro ("Voltar e corrigir" na página de erro)
  private restaurarRascunho() {
    const rascunho = this.erroService.recuperarRascunho<RascunhoEdicao>();
    if (rascunho) {
      this.selecionarEndereco(rascunho.enderecoSelecionado);
      this.formCliente.setValue(rascunho.dados);
      this.formCliente.markAllAsTouched();
    }
  }
}
