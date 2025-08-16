// utils/getContrastColor.ts
export function getContrastColor(hexcolor: string) {
  // Si el formato es #FFFFFF, se eliminan los espacios en blanco
  // Si es un color corto #FFF, lo convierte a #FFFFFF
  hexcolor = hexcolor.slice(1);
  if (hexcolor.length === 3) {
    hexcolor = hexcolor[0] + hexcolor[0] + hexcolor[1] + hexcolor[1] + hexcolor[2] + hexcolor[2];
  }

  // Convierte los valores de hex a decimal (RGB)
  const r = parseInt(hexcolor.slice(0, 2), 16);
  const g = parseInt(hexcolor.slice(2, 4), 16);
  const b = parseInt(hexcolor.slice(4, 6), 16);

  // Calcula la luminancia (brightness)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

  // Devuelve el color de texto en función de la luminancia
  return (yiq >= 128) ? '#000000' : '#ffffff';
}