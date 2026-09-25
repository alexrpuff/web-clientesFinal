import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ErroService } from '../../services/erro-service';

//Conteúdo exibido para cada código de erro
interface ConteudoErro {
  titulo: string;
  descricao: string;
}

const CONTEUDOS: Record<number, ConteudoErro> = {
  400: {
    titulo: 'Alguns dados não foram aceitos',
    descricao: 'Uma ou mais informações enviadas estão incompletas ou em formato inválido. '
      + 'Revise os campos e tente novamente.',
  },
  404: {
    titulo: 'Não encontramos o que você procurava',
    descricao: 'A página ou o cliente que você tentou acessar não existe ou já foi excluído.',
  },
  409: {
    titulo: 'Este cadastro já existe',
    descricao: 'As informações enviadas conflitam com um cliente já cadastrado, como um CPF em uso por outro cliente. '
      + 'Corrija os dados e tente novamente.',
  },
  500: {
    titulo: 'Algo deu errado do nosso lado',
    descricao: 'Ocorreu um erro inesperado no servidor. Tente novamente em alguns instantes. '
      + 'Se o problema continuar, entre em contato com o suporte.',
  },
};

/*
    Página de erro amigável para os códigos 400, 404, 409 e 500.
    Também é exibida (como 404) para qualquer rota inexistente.
*/
@Component({
  imports: [RouterLink],
  selector: 'app-erro',
  styleUrl: './erro.css',
  templateUrl: './erro.html',
})
export class Erro {

  //Injeção de dependência
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private erroService = inject(ErroService);

  private parametros = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  //Código da rota /erro/:codigo ou, para rotas inexistentes, o código definido na rota (404)
  codigo = computed(() => {
    const codigo = Number(this.parametros().get('codigo') ?? this.route.snapshot.data['codigo']);
    return CONTEUDOS[codigo] ? codigo : 500;
  });

  conteudo = computed(() => CONTEUDOS[this.codigo()]);

  detalhes = computed(() => this.erroService.obterErro(this.codigo()));

  //Mensagens da API ou, em uma rota inexistente, o endereço acessado
  mensagens = computed(() => {
    if (this.detalhes().mensagens.length > 0) {
      return this.detalhes().mensagens;
    }
    return this.parametros().has('codigo') ? [] : [`O endereço ${this.router.url} não existe.`];
  });

  //Página onde o erro aconteceu (para voltar e corrigir ou tentar novamente)
  origem = computed(() => this.detalhes().origem);

  permiteCorrigir = computed(() => [400, 409].includes(this.codigo()) && !!this.origem());

  permiteTentarNovamente = computed(() => this.codigo() === 500 && !!this.origem());
}
