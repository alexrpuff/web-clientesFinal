/*
    Modelos de dados conforme o contrato da API (DTOs)
*/
export interface Endereco {
  id?: number | null;
  logradouro: string;
  complemento: string | null;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  enderecos: Endereco[];
}

export interface CriarClienteRequest {
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  endereco: Endereco;
}

export interface EditarClienteRequest extends CriarClienteRequest {
  id: number;
}

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];
