/**
 * PlopGraph - Estado Global de la Aplicación
 * Centraliza las colecciones de elementos y la configuración del plano.
 * Creado por Verred (https://github.com/Verred)
 */

window.PlopState = {
  lang: localStorage.getItem('plopgraph_lang') || 'es',
  mode: 'select',
  selectedId: null,
  selectedType: null,

  axes: {
    originX: 150,
    originY: 480,
    width: 440,
    height: 360,
    maxX: 100,
    maxY: 100,
    stepX: 20,
    stepY: 20,
    ticksMode: 'uniform',
    titleX: "Cantidad (Q)",
    titleY: "Precio / Bien (Y)",
    titlePosition: "middle",
    showGrid: true
  },

  points: [],
  curves: [],
  arrows: [],
  braces: [],
  texts: [],

  dragState: null,
  drawTemp: null
};

/**
 * Carga un ejemplo inicial claro y sencillo.
 */
window.loadExampleSimple = function() {
  const state = window.PlopState;
  const isEn = state.lang === 'en';

  state.axes = {
    originX: 150,
    originY: 480,
    width: 440,
    height: 360,
    maxX: 100,
    maxY: 100,
    stepX: 20,
    stepY: 20,
    ticksMode: 'uniform',
    titleX: isEn ? "Quantity (Q)" : "Cantidad (Q)",
    titleY: isEn ? "Price / Good (Y)" : "Precio / Bien (Y)",
    titlePosition: "middle",
    showGrid: true
  };

  state.curves = [
    {
      id: 'crv_simple_1',
      x1: 0,
      y1: 90,
      x2: 90,
      y2: 0,
      cx: 65,
      cy: 75,
      isCurved: true,
      color: '#2563eb',
      strokeWidth: 3,
      label: isEn ? 'Curve' : 'FPP',
      labelOffsetX: 6,
      labelOffsetY: -6,
      showIntercepts: false
    }
  ];

  state.points = [
    {
      id: 'pt_A',
      x: 55,
      y: 48,
      label: 'A',
      color: '#1e3a8a',
      radius: 6.5,
      showProjX: true,
      showProjY: true,
      projStyle: 'dashed',
      projColor: '#10b981',
      showProjAxisTick: false,
      labelOffsetX: 12,
      labelOffsetY: 4
    },
    {
      id: 'pt_B',
      x: 35,
      y: 30,
      label: 'B',
      color: '#1e3a8a',
      radius: 6.5,
      showProjX: true,
      showProjY: true,
      projStyle: 'dashed',
      projColor: '#10b981',
      showProjAxisTick: false,
      labelOffsetX: 12,
      labelOffsetY: 4
    }
  ];

  state.arrows = [
    {
      id: 'arr_1',
      x1: 38,
      y1: 52,
      x2: 48,
      y2: 66,
      color: '#10b981',
      strokeWidth: 2.5
    }
  ];

  state.texts = [
    {
      id: 'txt_simple_note',
      x: 620,
      y: 160,
      content: isEn ? '• Point A: Optimum\n• Point B: Underutilized\n• Arrow: Growth Shift' : '• Punto A: Nivel Óptimo\n• Punto B: Subutilizado\n• Flecha: Crecimiento',
      fontSize: 14.5,
      bold: false,
      color: '#334155'
    }
  ];

  state.braces = [];

  if (window.syncUiInputs) window.syncUiInputs();
  if (window.deselectAll) window.deselectAll();
  const toastHint = document.getElementById('toastHint');
  if (toastHint && window.PlopI18n[state.lang]) {
    toastHint.textContent = window.PlopI18n[state.lang].hints.exampleLoaded;
  }
};
