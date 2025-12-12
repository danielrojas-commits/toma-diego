export class RutUtils {
  static clean(value: string): string {
    return value.replace(/[^0-9kK]/g, '').substring(0, 10);
  }
  static calculateDv(body: string): string {
    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body.charAt(i), 10) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    const mod = 11 - (sum % 11);
    if (mod === 11) return '0';
    if (mod === 10) return 'K';
    return String(mod);
  }

  static formatBody(body: string): string {
    return body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  static format(value: string): string {
    const clean = RutUtils.clean(value);
    if (!clean) return '';


    if (clean.length === 9 || clean.length === 10) {
      const dv = clean.charAt(clean.length - 1).toUpperCase();
      const body = clean.substring(0, clean.length - 1);
      return `${RutUtils.formatBody(body)}-${dv}`;
    }

    const dv = RutUtils.calculateDv(clean);
    return `${RutUtils.formatBody(clean)}-${dv}`;
  }

  /**
   * Maneja el evento de input (DOM) para limpiar y formatear el RUT en tiempo real.
   * Actualiza el valor del elemento HTML directamente y retorna el valor limpio/formateado.
   */
  static handleInput(event: Event): string {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;
    const cleaned = RutUtils.clean(rawValue);

    // 1. Si hay caracteres inválidos, forzamos la actualización del input para borrarlos
    if (rawValue !== cleaned) {
      input.value = cleaned;
    }

    // 2. Si tiene el largo correcto, formateamos y actualizamos la vista
    if (cleaned.length === 9 || cleaned.length === 10) {
      const formatted = RutUtils.format(cleaned);
      input.value = formatted;
      return formatted;
    }

    return cleaned;
  }
}
