/**
 * PlopGraph - Módulo de Interacción con Mouse y Modos
 * Maneja eventos de arrastre, creación de curvas, flechas, llaves y puntos.
 * Creado por Verred (https://github.com/Verred)
 */

window.PlopInteraction = (function() {
  function getSvg() { return document.getElementById('graphSvg'); }
  function getLayer(id) { return document.getElementById(id); }

  function startDragPoint(e, point) {
    e.stopPropagation();
    if (window.PlopApp) window.PlopApp.selectItem(point.id, 'point');
    const pos = window.PlopCoords.getSvgMousePos(e);
    const log = window.PlopCoords.toLogicalCoords(pos.x, pos.y);
    window.PlopState.dragState = { type: 'point', target: point, startX: log.x, startY: log.y };
  }

  function startDragCurveHandle(e, curve, handle) {
    e.stopPropagation();
    window.PlopState.dragState = { type: 'curve-handle', target: curve, handle: handle };
  }

  function startDragArrowHandle(e, arrow, handle) {
    e.stopPropagation();
    window.PlopState.dragState = { type: 'arrow-handle', target: arrow, handle: handle };
  }

  function startDragBraceHandle(e, brace, handle) {
    e.stopPropagation();
    window.PlopState.dragState = { type: 'brace-handle', target: brace, handle: handle };
  }

  function startDragText(e, text) {
    e.stopPropagation();
    const pos = window.PlopCoords.getSvgMousePos(e);
    window.PlopState.dragState = { type: 'text', target: text, lastX: pos.x, lastY: pos.y };
  }

  function startDragArrow(e, arrow) {
    e.stopPropagation();
    const pos = window.PlopCoords.getSvgMousePos(e);
    const log = window.PlopCoords.toLogicalCoords(pos.x, pos.y);
    window.PlopState.dragState = { type: 'arrow', target: arrow, lastLogX: log.x, lastLogY: log.y };
  }

  function startDragBrace(e, brace) {
    e.stopPropagation();
    const pos = window.PlopCoords.getSvgMousePos(e);
    const log = window.PlopCoords.toLogicalCoords(pos.x, pos.y);
    window.PlopState.dragState = { type: 'brace', target: brace, lastLogX: log.x, lastLogY: log.y };
  }

  function initMouseEvents() {
    const svg = getSvg();
    if (!svg) return;

    svg.addEventListener('mousedown', (e) => {
      const state = window.PlopState;
      const pos = window.PlopCoords.getSvgMousePos(e);
      const logical = window.PlopCoords.toLogicalCoords(pos.x, pos.y);

      if (state.mode === 'select') {
        if (e.target === svg || e.target.tagName === 'rect') {
          if (window.PlopApp) window.PlopApp.deselectAll();
        }
        return;
      }

      if (state.mode === 'add-point') {
        const nextLetter = String.fromCharCode(65 + (state.points.length % 26));
        const newPt = {
          id: 'pt_' + Date.now(),
          x: Math.max(0, logical.x),
          y: Math.max(0, logical.y),
          label: `(${nextLetter})`,
          color: '#0284c7',
          radius: 6.5,
          showProjX: true,
          showProjY: true,
          projStyle: 'solid',
          projColor: '#0284c7',
          showProjAxisTick: true,
          labelOffsetX: 12,
          labelOffsetY: 4
        };
        state.points.push(newPt);
        if (window.PlopApp) {
          window.PlopApp.selectItem(newPt.id, 'point');
          window.PlopApp.setMode('select');
        }
        return;
      }

      if (state.mode === 'add-text') {
        const newTxt = {
          id: 'txt_' + Date.now(),
          x: pos.x,
          y: pos.y,
          content: state.lang === 'en' ? 'Text annotation' : 'Texto explicativo',
          fontSize: 15,
          bold: false,
          color: '#0f172a'
        };
        state.texts.push(newTxt);
        if (window.PlopApp) {
          window.PlopApp.selectItem(newTxt.id, 'text');
          window.PlopApp.setMode('select');
        }
        return;
      }

      if (['add-curve', 'add-line', 'add-arrow', 'add-brace'].includes(state.mode)) {
        state.drawTemp = {
          startX: logical.x,
          startY: logical.y,
          startPx: pos.x,
          startPy: pos.y
        };
      }
    });

    window.addEventListener('mousemove', (e) => {
      const state = window.PlopState;
      const pos = window.PlopCoords.getSvgMousePos(e);
      const logical = window.PlopCoords.toLogicalCoords(pos.x, pos.y);
      const layerPreview = getLayer('layerPreview');

      if (state.drawTemp && layerPreview) {
        layerPreview.innerHTML = '';
        const prev = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        prev.setAttribute('x1', state.drawTemp.startPx);
        prev.setAttribute('y1', state.drawTemp.startPy);
        prev.setAttribute('x2', pos.x);
        prev.setAttribute('y2', pos.y);
        prev.setAttribute('stroke', '#3b82f6');
        prev.setAttribute('stroke-width', '2');
        prev.setAttribute('stroke-dasharray', '4 4');
        layerPreview.appendChild(prev);
        return;
      }

      if (!state.dragState) return;
      const ds = state.dragState;

      // Arrastrar Punto
      if (ds.type === 'point') {
        ds.target.x = Math.max(0, logical.x);
        ds.target.y = Math.max(0, logical.y);
        window.PlopRender.renderAll();
        if (window.PlopApp) window.PlopApp.updateInspector();
      }

      // Arrastrar Tirador de Curva
      else if (ds.type === 'curve-handle') {
        if (ds.handle === 'ctrl') {
          ds.target.cx = logical.x;
          ds.target.cy = logical.y;
        } else if (ds.handle === 'p1') {
          ds.target.x1 = logical.x;
          ds.target.y1 = logical.y;
        } else if (ds.handle === 'p2') {
          ds.target.x2 = logical.x;
          ds.target.y2 = logical.y;
        }
        window.PlopRender.renderAll();
      }

      // Arrastrar Tirador de Flecha
      else if (ds.type === 'arrow-handle') {
        if (ds.handle === 'p1') {
          ds.target.x1 = logical.x;
          ds.target.y1 = logical.y;
        } else if (ds.handle === 'p2') {
          ds.target.x2 = logical.x;
          ds.target.y2 = logical.y;
        }
        window.PlopRender.renderAll();
      }

      // Arrastrar Tirador de Llave
      else if (ds.type === 'brace-handle') {
        if (ds.handle === 'p1') {
          ds.target.x1 = logical.x;
          ds.target.y1 = logical.y;
        } else if (ds.handle === 'p2') {
          ds.target.x2 = logical.x;
          ds.target.y2 = logical.y;
        } else if (ds.handle === 'tip') {
          const p1 = window.PlopCoords.toSvgCoords(ds.target.x1, ds.target.y1);
          const p2 = window.PlopCoords.toSvgCoords(ds.target.x2, ds.target.y2);
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;
          const depth = (pos.x - mx) * nx + (pos.y - my) * ny;
          ds.target.depth = Math.round(depth);
        }
        window.PlopRender.renderAll();
      }

      // Arrastrar Texto
      else if (ds.type === 'text') {
        const dx = pos.x - ds.lastX;
        const dy = pos.y - ds.lastY;
        ds.target.x += dx;
        ds.target.y += dy;
        ds.lastX = pos.x;
        ds.lastY = pos.y;
        window.PlopRender.renderTexts();
      }

      // Arrastrar Flecha completa
      else if (ds.type === 'arrow') {
        const dx = logical.x - ds.lastLogX;
        const dy = logical.y - ds.lastLogY;
        ds.target.x1 += dx;
        ds.target.y1 += dy;
        ds.target.x2 += dx;
        ds.target.y2 += dy;
        ds.lastLogX = logical.x;
        ds.lastLogY = logical.y;
        window.PlopRender.renderAll();
      }

      // Arrastrar Llave completa
      else if (ds.type === 'brace') {
        const dx = logical.x - ds.lastLogX;
        const dy = logical.y - ds.lastLogY;
        ds.target.x1 += dx;
        ds.target.y1 += dy;
        ds.target.x2 += dx;
        ds.target.y2 += dy;
        ds.lastLogX = logical.x;
        ds.lastLogY = logical.y;
        window.PlopRender.renderAll();
      }
    });

    window.addEventListener('mouseup', (e) => {
      const state = window.PlopState;
      const layerPreview = getLayer('layerPreview');

      if (state.drawTemp) {
        const pos = window.PlopCoords.getSvgMousePos(e);
        const logical = window.PlopCoords.toLogicalCoords(pos.x, pos.y);
        if (layerPreview) layerPreview.innerHTML = '';

        const dist = Math.hypot(pos.x - state.drawTemp.startPx, pos.y - state.drawTemp.startPy);
        if (dist > 15) {
          if (state.mode === 'add-curve') {
            const newCurve = {
              id: 'crv_' + Date.now(),
              x1: state.drawTemp.startX,
              y1: state.drawTemp.startY,
              x2: logical.x,
              y2: logical.y,
              cx: (state.drawTemp.startX + logical.x) / 2 + 20,
              cy: (state.drawTemp.startY + logical.y) / 2 + 20,
              isCurved: true,
              color: '#2563eb',
              strokeWidth: 3,
              label: '',
              showIntercepts: true
            };
            state.curves.push(newCurve);
            if (window.PlopApp) window.PlopApp.selectItem(newCurve.id, 'curve');
          } else if (state.mode === 'add-line') {
            const newLine = {
              id: 'crv_' + Date.now(),
              x1: state.drawTemp.startX,
              y1: state.drawTemp.startY,
              x2: logical.x,
              y2: logical.y,
              cx: (state.drawTemp.startX + logical.x) / 2,
              cy: (state.drawTemp.startY + logical.y) / 2,
              isCurved: false,
              color: '#2563eb',
              strokeWidth: 3,
              label: '',
              showIntercepts: true
            };
            state.curves.push(newLine);
            if (window.PlopApp) window.PlopApp.selectItem(newLine.id, 'curve');
          } else if (state.mode === 'add-brace') {
            const newBrace = {
              id: 'brc_' + Date.now(),
              x1: state.drawTemp.startX,
              y1: state.drawTemp.startY,
              x2: logical.x,
              y2: logical.y,
              depth: 18,
              text: '',
              color: '#0f172a',
              strokeWidth: 2,
              fontSize: 15
            };
            state.braces.push(newBrace);
            if (window.PlopApp) window.PlopApp.selectItem(newBrace.id, 'brace');
          } else if (state.mode === 'add-arrow') {
            const newArr = {
              id: 'arr_' + Date.now(),
              x1: state.drawTemp.startX,
              y1: state.drawTemp.startY,
              x2: logical.x,
              y2: logical.y,
              color: '#15803d',
              strokeWidth: 2.5
            };
            state.arrows.push(newArr);
            if (window.PlopApp) window.PlopApp.selectItem(newArr.id, 'arrow');
          }
        }
        state.drawTemp = null;
        if (window.PlopApp) window.PlopApp.setMode('select');
      }

      state.dragState = null;
    });
  }

  return {
    initMouseEvents: initMouseEvents,
    startDragPoint: startDragPoint,
    startDragCurveHandle: startDragCurveHandle,
    startDragArrowHandle: startDragArrowHandle,
    startDragBraceHandle: startDragBraceHandle,
    startDragText: startDragText,
    startDragArrow: startDragArrow,
    startDragBrace: startDragBrace
  };
})();
