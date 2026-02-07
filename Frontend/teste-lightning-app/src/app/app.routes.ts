import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ColaboradoresPageComponent } from './pages/colaboradores/colaboradores.component';
import { TarefasPageComponent } from './pages/tarefas/tarefas.component';
import { HistoricoPageComponent } from './pages/historico/historico.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'colaboradores', component: ColaboradoresPageComponent },
  { path: 'tarefas', component: TarefasPageComponent },
  { path: 'historico', component: HistoricoPageComponent },
  { path: '**', redirectTo: '' }
];
