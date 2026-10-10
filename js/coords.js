/**
 * PlopGraph - Módulo de Coordenadas
 * Convierte entre el sistema lógico del gráfico (X, Y) y pixeles del SVG.
 * Creado por Verred (https://github.com/Verred)
 */

window.PlopCoords = {
  /**
   * Transforma coordenadas lógicas (valX, valY) a pixeles del SVG.
   */
  toSvgCoords: function(valX, valY) {
    const axes = window.PlopState.axes;
    const px = axes.originX + (valX / axes.maxX) * axes.width;
    const py = axes.originY - (valY / axes.maxY) * axes.height;
    return { x: px, y: py };
  },

  /**
   * Transforma pixeles del SVG a valores lógicos dentro del plano cartesiano.
   */
  toLogicalCoords: function(px, py) {
    const axes = window.PlopState.axes;
    const valX = ((px - axes.originX) / axes.width) * axes.maxX;
    const valY = ((axes.originY - py) / axes.height) * axes.maxY;
    return { 
      x: Math.round(valX), 
      y: Math.round(valY) 
    };
  },

  /**
   * Obtiene la posición precisa del puntero escalada según el viewBox del SVG.
   */
  getSvgMousePos: function(evt, svgElement) {
    const svg = svgElement || document.getElementById('graphSvg');
    const rect = svg.getBoundingClientRect();
    const scaleX = svg.viewBox.baseVal.width / rect.width;
    const scaleY = svg.viewBox.baseVal.height / rect.height;
    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY
    };
  }
};
