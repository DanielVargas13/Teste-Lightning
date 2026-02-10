import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColaboradorService } from '../../services/colaborador.service';
import { Colaborador } from '../../models/colaborador.model';
import { ListaColaboradoresComponent } from '../../components/colaborador/lista-colaboradores/lista-colaboradores.component';
import { FormularioColaboradorComponent } from '../../components/colaborador/formulario-colaborador/formulario-colaborador.component';

@Component({
  selector: 'app-colaboradores-page',
  standalone: true,
  imports: [CommonModule, ListaColaboradoresComponent, FormularioColaboradorComponent],
  templateUrl: './colaboradores.component.html',
  styleUrls: ['./colaboradores.component.css']
})
export class ColaboradoresPageComponent implements OnInit {
  mostrarFormulario = false;
  colaboradorSelecionado: Colaborador | null = null;

  constructor(private colaboradorService: ColaboradorService) {}

  ngOnInit() {
  }

  abrirFormulario() {
    this.mostrarFormulario = true;
    this.colaboradorSelecionado = null;
  }

  fecharFormulario() {
    this.mostrarFormulario = false;
    this.colaboradorSelecionado = null;
  }

  editarColaborador(colaborador: Colaborador) {
    this.colaboradorSelecionado = colaborador;
    this.mostrarFormulario = true;
  }

  atualizarLista() {
    this.fecharFormulario();
  }
}
