import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Erro } from './erro';
import { ErroService } from '../../services/erro-service';

describe('Erro', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([
        { path: 'cadastrar-cliente', children: [] },
        { path: 'erro/:codigo', component: Erro },
        { path: '**', component: Erro, data: { codigo: 404 } },
      ])],
    });
  });

  it('should render the friendly page for each code', async () => {
    const harness = await RouterTestingHarness.create();
    const titulos: Record<number, string> = {
      400: 'Alguns dados não foram aceitos',
      404: 'Não encontramos o que você procurava',
      409: 'Este cadastro já existe',
      500: 'Algo deu errado do nosso lado',
    };
    for (const [codigo, titulo] of Object.entries(titulos)) {
      await harness.navigateByUrl(`/erro/${codigo}`);
      expect(harness.routeNativeElement?.querySelector('.erro-codigo')?.textContent).toContain(codigo);
      expect(harness.routeNativeElement?.querySelector('h3')?.textContent).toContain(titulo);
    }
  });

  it('should render 404 for an unknown route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/pagina-inexistente');
    const texto = harness.routeNativeElement?.textContent ?? '';
    expect(texto).toContain('404');
    expect(texto).toContain('O endereço /pagina-inexistente não existe.');
  });

  it('should show the API message and keep the form draft on 409', async () => {
    const harness = await RouterTestingHarness.create();
    const router = TestBed.inject(Router);
    const erroService = TestBed.inject(ErroService);

    await harness.navigateByUrl('/cadastrar-cliente');
    const rascunho = { nome: 'Cliente de Teste' };
    const erro = new HttpErrorResponse({ status: 409, error: 'O CPF informado já está cadastrado, tente outro.' });
    expect(erroService.redirecionar(erro, rascunho)).toBe(true);
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(router.url).toBe('/erro/409');
    const texto = harness.routeNativeElement?.textContent ?? '';
    expect(texto).toContain('O CPF informado já está cadastrado, tente outro.');
    expect(texto).toContain('Voltar e corrigir');

    await harness.navigateByUrl('/cadastrar-cliente');
    expect(erroService.recuperarRascunho()).toEqual(rascunho);
    expect(erroService.recuperarRascunho()).toBeNull();
  });

  it('should not redirect when the API is offline', () => {
    const erroService = TestBed.inject(ErroService);
    expect(erroService.redirecionar(new HttpErrorResponse({ status: 0 }))).toBe(false);
  });
});
