import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class ValidadoresCustomizados {
  
  static celularValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const celular = control.value.toString().replace(/\D/g, '');
      
      // Validar se tem 11 dígitos (formato brasileiro)
      if (celular.length !== 11) {
        return { celularInvalido: true };
      }
      
      // Validar se o segundo dígito é 9 (celular)
      if (celular[1] !== '9') {
        return { naoEhCelular: true };
      }
      
      return null;
    };
  }

  static enderecoValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const endereco = control.value.toString().trim();
      
      // Mínimo 10 caracteres
      if (endereco.length < 10) {
        return { enderecoMuitoCurto: true };
      }
      
      return null;
    };
  }

  static periodicidadeValida(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const periodicidade = parseInt(control.value, 10);
      
      // Deve ser entre 1 e 365 dias
      if (periodicidade < 1 || periodicidade > 365) {
        return { periodicidadeInvalida: true };
      }
      
      return null;
    };
  }

  static dataFuturaValida(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const data = new Date(control.value);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (data < hoje) {
        return { dataPassada: true };
      }
      
      return null;
    };
  }
}
