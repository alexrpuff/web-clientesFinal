import { Routes } from '@angular/router';
import { Inicio } from './pages/clientes/inicio/inicio';
import { CadastrarCliente } from './pages/clientes/cadastrar-cliente/cadastrar-cliente';
import { ConsultarClientes } from './pages/clientes/consultar-clientes/consultar-clientes';
import { EditarCliente } from './pages/clientes/editar-cliente/editar-cliente';
import { ExcluirCliente } from './pages/clientes/excluir-cliente/excluir-cliente';
import { Erro } from './pages/erro/erro';

export const routes: Routes = [
    {
        path: 'inicio', component: Inicio
    },
    {
        path: 'cadastrar-cliente', component: CadastrarCliente
    },
    {
        path: 'consultar-clientes', component: ConsultarClientes
    },
    {
        path: 'editar-cliente/:id', component: EditarCliente
    },
    {
        path: 'excluir-cliente/:id', component: ExcluirCliente
    },
    {
        path: 'erro/:codigo', component: Erro
    },
    {
        path: '', pathMatch: 'full',
        redirectTo: '/inicio'
    },
    {
        //Rota inexistente: página de erro 404
        path: '**', component: Erro,
        data: { codigo: 404 }
    }
];
