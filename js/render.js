/**
 * PlopGraph - Módulo de Renderizado SVG
 * Gestiona el dibujo de la cuadrícula, ejes graduados, proyecciones,
 * curvas Bézier, llaves agrupadoras, flechas direccionables, puntos y tiradores.
 * Creado por Verred (https://github.com/Verred)
 */

window.PlopRender = (function() {
  const NS = 'http://www.w3.org/2000/svg';

  function getDefs() { return document.getElementById('svgDefs'); }
  function getLayer(id) { return document.getElementById(id); }

  /**
   * Genera dinámicamente un marcador de cabeza de flecha en <defs>
   * asegurando que coincida exactamente con el color asignado a la flecha.
   */
  function getArrowMarker(color) {
    const svgDefs = getDefs();
    const safeColor = (color || '#15803d').replace(/[^a-zA-Z0-9]/g, '');
    const markerId = 'marker_arr_' + safeColor;
    let marker = document.getElementById(markerId);
    if (!marker) {
      marker = document.createElementNS(NS, 'marker');
      marker.setAttribute('id', markerId);
      marker.setAttribute('viewBox', '0 0 10 10');
      marker.setAttribute('refX', '7');
      marker.setAttribute('refY', '5');
      marker.setAttribute('markerWidth', '6');
      marker.setAttribute('markerHeight', '6');
      marker.setAttribute('orient', 'auto-start-reverse');
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', 'M 0 1.5 L 10 5 L 0 8.5 z');
      path.setAttribute('fill', color || '#15803d');
      marker.appendChild(path);
      svgDefs.appendChild(marker);
    } else {
      const path = marker.querySelector('path');
      if (path) path.setAttribute('fill', color || '#15803d');
    }
    return `url(#${markerId})`;
  }

  function renderAxes() {
    const layerAxes = getLayer('layerAxes');
    const layerGrid = getLayer('layerGrid');
    if (!layerAxes || !layerGrid) return;

    layerAxes.innerHTML = '';
    layerGrid.innerHTML = '';

    const state = window.PlopState;
    const ax = state.axes;
    const ox = ax.originX;
    const oy = ax.originY;
    const endX = ox + ax.width + 45;
    const endY = oy - ax.height - 35;

    // 1. CUADRÍCULA TENUE
    if (ax.showGrid) {
      const gStepX = (ax.stepX && ax.stepX > 0) ? ax.stepX : 20;
      const gStepY = (ax.stepY && ax.stepY > 0) ? ax.stepY : 20;

      for (let x = gStepX; x <= ax.maxX; x += gStepX) {
        const pt = window.PlopCoords.toSvgCoords(x, 0);
        const line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', pt.x);
        line.setAttribute('y1', oy);
        line.setAttribute('x2', pt.x);
        line.setAttribute('y2', oy - ax.height);
        line.setAttribute('stroke', '#cbd5e1');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-dasharray', '3 3');
        layerGrid.appendChild(line);
      }

      for (let y = gStepY; y <= ax.maxY; y += gStepY) {
        const pt = window.PlopCoords.toSvgCoords(0, y);
        const line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', ox);
        line.setAttribute('y1', pt.y);
        line.setAttribute('x2', ox + ax.width);
        line.setAttribute('y2', pt.y);
        line.setAttribute('stroke', '#cbd5e1');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-dasharray', '3 3');
        layerGrid.appendChild(line);
      }
    }

    // 2. EJES PRINCIPALES
    const xAxis = document.createElementNS(NS, 'line');
    xAxis.setAttribute('x1', ox - 10);
    xAxis.setAttribute('y1', oy);
    xAxis.setAttribute('x2', endX);
    xAxis.setAttribute('y2', oy);
    xAxis.setAttribute('stroke', '#0f172a');
    xAxis.setAttribute('stroke-width', '2.5');
    xAxis.setAttribute('marker-end', 'url(#axis-arrow)');
    layerAxes.appendChild(xAxis);

    const yAxis = document.createElementNS(NS, 'line');
    yAxis.setAttribute('x1', ox);
    yAxis.setAttribute('y1', oy + 10);
    yAxis.setAttribute('x2', ox);
    yAxis.setAttribute('y2', endY);
    yAxis.setAttribute('stroke', '#0f172a');
    yAxis.setAttribute('stroke-width', '2.5');
    yAxis.setAttribute('marker-end', 'url(#axis-arrow)');
    layerAxes.appendChild(yAxis);

    const zeroText = document.createElementNS(NS, 'text');
    zeroText.setAttribute('x', ox - 16);
    zeroText.setAttribute('y', oy + 20);
    zeroText.setAttribute('font-size', '16');
    zeroText.setAttribute('font-weight', '500');
    zeroText.setAttribute('fill', '#0f172a');
    zeroText.setAttribute('text-anchor', 'middle');
    zeroText.textContent = '0';
    layerAxes.appendChild(zeroText);

    let ticksX = new Set();
    let ticksY = new Set();

    if (ax.ticksMode === 'uniform' || ax.ticksMode === 'both') {
      for (let x = ax.stepX; x <= ax.maxX; x += ax.stepX) ticksX.add(x);
      for (let y = ax.stepY; y <= ax.maxY; y += ax.stepY) ticksY.add(y);
    }

    if (ax.ticksMode === 'points' || ax.ticksMode === 'both') {
      state.points.forEach(pt => {
        if (pt.showProjX && pt.showProjAxisTick) ticksX.add(Math.round(pt.x));
        if (pt.showProjY && pt.showProjAxisTick) ticksY.add(Math.round(pt.y));
      });
      state.curves.forEach(crv => {
        if (crv.showIntercepts) {
          if (crv.x1 === 0 && crv.y1 > 0) ticksY.add(Math.round(crv.y1));
          if (crv.y2 === 0 && crv.x2 > 0) ticksX.add(Math.round(crv.x2));
        }
      });
    }

    Array.from(ticksX).sort((a,b)=>a-b).forEach(x => {
      if (x <= 0 || x > ax.maxX) return;
      const pt = window.PlopCoords.toSvgCoords(x, 0);

      const tick = document.createElementNS(NS, 'line');
      tick.setAttribute('x1', pt.x);
      tick.setAttribute('y1', oy);
      tick.setAttribute('x2', pt.x);
      tick.setAttribute('y2', oy + 7);
      tick.setAttribute('stroke', '#0f172a');
      tick.setAttribute('stroke-width', '1.8');
      layerAxes.appendChild(tick);

      const label = document.createElementNS(NS, 'text');
      label.setAttribute('x', pt.x);
      label.setAttribute('y', oy + 26);
      label.setAttribute('font-size', '15');
      label.setAttribute('font-weight', '500');
      label.setAttribute('fill', '#0f172a');
      label.setAttribute('text-anchor', 'middle');
      label.textContent = x;
      layerAxes.appendChild(label);
    });

    Array.from(ticksY).sort((a,b)=>a-b).forEach(y => {
      if (y <= 0 || y > ax.maxY) return;
      const pt = window.PlopCoords.toSvgCoords(0, y);

      const tick = document.createElementNS(NS, 'line');
      tick.setAttribute('x1', ox);
      tick.setAttribute('y1', pt.y);
      tick.setAttribute('x2', ox - 7);
      tick.setAttribute('y2', pt.y);
      tick.setAttribute('stroke', '#0f172a');
      tick.setAttribute('stroke-width', '1.8');
      layerAxes.appendChild(tick);

      const label = document.createElementNS(NS, 'text');
      label.setAttribute('x', ox - 14);
      label.setAttribute('y', pt.y + 6);
      label.setAttribute('font-size', '15');
      label.setAttribute('font-weight', '500');
      label.setAttribute('fill', '#0f172a');
      label.setAttribute('text-anchor', 'end');
      label.textContent = y;
      layerAxes.appendChild(label);
    });

    const titleX = document.createElementNS(NS, 'text');
    if (ax.titlePosition === "end") {
      titleX.setAttribute('x', endX + 10);
      titleX.setAttribute('y', oy + 6);
      titleX.setAttribute('text-anchor', 'start');
    } else {
      titleX.setAttribute('x', ox + ax.width / 2);
      titleX.setAttribute('y', oy + 48);
      titleX.setAttribute('text-anchor', 'middle');
    }
    titleX.setAttribute('font-size', '15');
    titleX.setAttribute('font-weight', '600');
    titleX.setAttribute('fill', '#0f172a');
    titleX.textContent = ax.titleX;
    layerAxes.appendChild(titleX);

    const titleY = document.createElementNS(NS, 'text');
    if (ax.titlePosition === "end") {
      titleY.setAttribute('x', ox - 6);
      titleY.setAttribute('y', endY - 12);
      titleY.setAttribute('text-anchor', 'end');
    } else {
      titleY.setAttribute('x', -(oy - ax.height / 2));
      titleY.setAttribute('y', ox - 48);
      titleY.setAttribute('transform', 'rotate(-90)');
      titleY.setAttribute('text-anchor', 'middle');
    }
    titleY.setAttribute('font-size', '15');
    titleY.setAttribute('font-weight', '600');
    titleY.setAttribute('fill', '#0f172a');
    titleY.textContent = ax.titleY;
    layerAxes.appendChild(titleY);
  }

  function renderProjections() {
    const layer = getLayer('layerProjections');
    if (!layer) return;
    layer.innerHTML = '';
    const state = window.PlopState;
    const ox = state.axes.originX;
    const oy = state.axes.originY;

    state.points.forEach(pt => {
      if (!pt.showProjX && !pt.showProjY) return;

      const pSvg = window.PlopCoords.toSvgCoords(pt.x, pt.y);
      const group = document.createElementNS(NS, 'g');
      const color = pt.projColor || pt.color || '#15803d';
      const isDashed = pt.projStyle === 'dashed';
      const strokeWidth = pt.projWidth || 1.8;

      if (pt.showProjX) {
        const lineV = document.createElementNS(NS, 'line');
        lineV.setAttribute('x1', pSvg.x);
        lineV.setAttribute('y1', pSvg.y);
        lineV.setAttribute('x2', pSvg.x);
        lineV.setAttribute('y2', oy);
        lineV.setAttribute('stroke', color);
        lineV.setAttribute('stroke-width', strokeWidth);
        if (isDashed) lineV.setAttribute('stroke-dasharray', '4 3');
        group.appendChild(lineV);
      }

      if (pt.showProjY) {
        const lineH = document.createElementNS(NS, 'line');
        lineH.setAttribute('x1', pSvg.x);
        lineH.setAttribute('y1', pSvg.y);
        lineH.setAttribute('x2', ox);
        lineH.setAttribute('y2', pSvg.y);
        lineH.setAttribute('stroke', color);
        lineH.setAttribute('stroke-width', strokeWidth);
        if (isDashed) lineH.setAttribute('stroke-dasharray', '4 3');
        group.appendChild(lineH);
      }

      layer.appendChild(group);
    });
  }

  function renderPoints() {
    const layer = getLayer('layerPoints');
    if (!layer) return;
    layer.innerHTML = '';
    const state = window.PlopState;

    state.points.forEach(pt => {
      const pSvg = window.PlopCoords.toSvgCoords(pt.x, pt.y);
      const g = document.createElementNS(NS, 'g');
      g.dataset.id = pt.id;
      g.dataset.type = 'point';

      const circle = document.createElementNS(NS, 'circle');
      circle.setAttribute('cx', pSvg.x);
      circle.setAttribute('cy', pSvg.y);
      circle.setAttribute('r', pt.radius || 6.5);
      circle.setAttribute('fill', pt.color || '#1e3a8a');
      circle.classList.add('interactive-point');

      if (state.selectedId === pt.id) {
        circle.setAttribute('stroke', '#38bdf8');
        circle.setAttribute('stroke-width', '3.5');
        circle.classList.add('item-selected');
      }

      g.appendChild(circle);

      if (pt.label) {
        const text = document.createElementNS(NS, 'text');
        text.setAttribute('x', pSvg.x + (pt.labelOffsetX !== undefined ? pt.labelOffsetX : 12));
        text.setAttribute('y', pSvg.y + (pt.labelOffsetY !== undefined ? pt.labelOffsetY : 4));
        text.setAttribute('font-size', pt.labelFontSize || 17);
        text.setAttribute('font-weight', '700');
        text.setAttribute('fill', pt.labelColor || pt.color || '#0f172a');
        
        const lines = pt.label.split('\n');
        lines.forEach((l, idx) => {
          const tspan = document.createElementNS(NS, 'tspan');
          tspan.setAttribute('x', pSvg.x + (pt.labelOffsetX !== undefined ? pt.labelOffsetX : 12));
          tspan.setAttribute('dy', idx === 0 ? '0' : '1.2em');
          tspan.textContent = l;
          text.appendChild(tspan);
        });

        g.appendChild(text);
      }

      circle.addEventListener('mousedown', (e) => {
        if (window.PlopInteraction) window.PlopInteraction.startDragPoint(e, pt);
      });
      layer.appendChild(g);
    });
  }

  function renderCurves() {
    const layer = getLayer('layerCurves');
    if (!layer) return;
    layer.innerHTML = '';
    const state = window.PlopState;

    state.curves.forEach(curve => {
      const p1 = window.PlopCoords.toSvgCoords(curve.x1, curve.y1);
      const p2 = window.PlopCoords.toSvgCoords(curve.x2, curve.y2);
      const ctl = window.PlopCoords.toSvgCoords(curve.cx, curve.cy);

      const g = document.createElementNS(NS, 'g');
      g.dataset.id = curve.id;
      g.dataset.type = 'curve';

      const path = document.createElementNS(NS, 'path');
      let dStr = '';
      if (curve.isCurved) {
        dStr = `M ${p1.x} ${p1.y} Q ${ctl.x} ${ctl.y} ${p2.x} ${p2.y}`;
      } else {
        dStr = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
      }

      path.setAttribute('d', dStr);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', curve.color || '#dc2626');
      path.setAttribute('stroke-width', curve.strokeWidth || 3);
      if (curve.dashed) path.setAttribute('stroke-dasharray', '6 4');
      path.classList.add('interactive-curve');

      if (state.selectedId === curve.id) {
        path.classList.add('item-selected');
      }

      path.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        if (window.PlopApp) window.PlopApp.selectItem(curve.id, 'curve');
      });

      g.appendChild(path);

      if (curve.label) {
        const lbl = document.createElementNS(NS, 'text');
        const lx = p2.x + (curve.labelOffsetX || 6);
        const ly = p2.y + (curve.labelOffsetY || -6);
        lbl.setAttribute('x', lx);
        lbl.setAttribute('y', ly);
        lbl.setAttribute('font-size', '15');
        lbl.setAttribute('font-weight', '700');
        lbl.setAttribute('fill', curve.color || '#0f172a');
        lbl.textContent = curve.label;
        g.appendChild(lbl);
      }

      layer.appendChild(g);
    });
  }

  function renderBraces() {
    const layer = getLayer('layerBraces');
    if (!layer) return;
    layer.innerHTML = '';
    const state = window.PlopState;

    state.braces.forEach(brace => {
      const p1 = window.PlopCoords.toSvgCoords(brace.x1, brace.y1);
      const p2 = window.PlopCoords.toSvgCoords(brace.x2, brace.y2);

      const g = document.createElementNS(NS, 'g');
      g.dataset.id = brace.id;
      g.dataset.type = 'brace';
      g.classList.add('interactive-brace');

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const h = brace.depth !== undefined ? brace.depth : 18;

      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      const tipX = mx + nx * h;
      const tipY = my + ny * h;

      const dStr = `M ${p1.x} ${p1.y} ` +
                   `Q ${p1.x + nx*(h*0.6)} ${p1.y + ny*(h*0.6)} ${mx - (dx*0.08) + nx*(h*0.4)} ${my - (dy*0.08) + ny*(h*0.4)} ` +
                   `Q ${mx + nx*(h*0.6)} ${my + ny*(h*0.6)} ${tipX} ${tipY} ` +
                   `Q ${mx + nx*(h*0.6)} ${my + ny*(h*0.6)} ${mx + (dx*0.08) + nx*(h*0.4)} ${my + (dy*0.08) + ny*(h*0.4)} ` +
                   `Q ${p2.x + nx*(h*0.6)} ${p2.y + ny*(h*0.6)} ${p2.x} ${p2.y}`;

      const hitPath = document.createElementNS(NS, 'path');
      hitPath.setAttribute('d', dStr);
      hitPath.setAttribute('fill', 'none');
      hitPath.setAttribute('stroke', 'transparent');
      hitPath.setAttribute('stroke-width', '18');
      hitPath.style.cursor = 'grab';
      g.appendChild(hitPath);

      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', dStr);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', brace.color || '#0f172a');
      path.setAttribute('stroke-width', brace.strokeWidth || 2);
      g.appendChild(path);

      if (brace.text) {
        const txt = document.createElementNS(NS, 'text');
        const textX = tipX + nx * 14;
        const textY = tipY + ny * 14 + 5;
        txt.setAttribute('x', textX);
        txt.setAttribute('y', textY);
        txt.setAttribute('font-size', brace.fontSize || 15);
        txt.setAttribute('font-weight', '700');
        txt.setAttribute('fill', brace.color || '#0f172a');
        txt.textContent = brace.text;
        g.appendChild(txt);
      }

      if (state.selectedId === brace.id) {
        path.classList.add('item-selected');
      }

      const onMouseDown = (e) => {
        e.stopPropagation();
        if (window.PlopApp) window.PlopApp.selectItem(brace.id, 'brace');
        if (window.PlopInteraction) window.PlopInteraction.startDragBrace(e, brace);
      };

      hitPath.addEventListener('mousedown', onMouseDown);
      path.addEventListener('mousedown', onMouseDown);

      layer.appendChild(g);
    });
  }

  function renderArrows() {
    const layer = getLayer('layerArrows');
    if (!layer) return;
    layer.innerHTML = '';
    const state = window.PlopState;

    state.arrows.forEach(arr => {
      const p1 = window.PlopCoords.toSvgCoords(arr.x1, arr.y1);
      const p2 = window.PlopCoords.toSvgCoords(arr.x2, arr.y2);

      const g = document.createElementNS(NS, 'g');
      g.dataset.id = arr.id;
      g.dataset.type = 'arrow';

      const hitLine = document.createElementNS(NS, 'line');
      hitLine.setAttribute('x1', p1.x);
      hitLine.setAttribute('y1', p1.y);
      hitLine.setAttribute('x2', p2.x);
      hitLine.setAttribute('y2', p2.y);
      hitLine.setAttribute('stroke', 'transparent');
      hitLine.setAttribute('stroke-width', '18');
      hitLine.style.cursor = 'grab';
      g.appendChild(hitLine);

      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      line.setAttribute('stroke', arr.color || '#15803d');
      line.setAttribute('stroke-width', arr.strokeWidth || 2.5);
      line.setAttribute('marker-end', getArrowMarker(arr.color || '#15803d'));
      line.classList.add('interactive-line');

      if (state.selectedId === arr.id) {
        line.classList.add('item-selected');
      }

      const onMouseDown = (e) => {
        e.stopPropagation();
        if (window.PlopApp) window.PlopApp.selectItem(arr.id, 'arrow');
        if (window.PlopInteraction) window.PlopInteraction.startDragArrow(e, arr);
      };

      hitLine.addEventListener('mousedown', onMouseDown);
      line.addEventListener('mousedown', onMouseDown);

      g.appendChild(line);
      layer.appendChild(g);
    });
  }

  function renderHandles() {
    const layer = getLayer('layerHandles');
    if (!layer) return;
    layer.innerHTML = '';
    const state = window.PlopState;
    if (!state.selectedId) return;

    const g = document.createElementNS(NS, 'g');

    // 1. TIRADORES DE CURVAS
    if (state.selectedType === 'curve') {
      const curve = state.curves.find(c => c.id === state.selectedId);
      if (!curve) return;

      const p1 = window.PlopCoords.toSvgCoords(curve.x1, curve.y1);
      const p2 = window.PlopCoords.toSvgCoords(curve.x2, curve.y2);
      const ctl = window.PlopCoords.toSvgCoords(curve.cx, curve.cy);

      if (curve.isCurved) {
        const guide1 = document.createElementNS(NS, 'line');
        guide1.setAttribute('x1', p1.x);
        guide1.setAttribute('y1', p1.y);
        guide1.setAttribute('x2', ctl.x);
        guide1.setAttribute('y2', ctl.y);
        guide1.setAttribute('stroke', '#cbd5e1');
        guide1.setAttribute('stroke-dasharray', '3 3');
        g.appendChild(guide1);

        const guide2 = document.createElementNS(NS, 'line');
        guide2.setAttribute('x1', ctl.x);
        guide2.setAttribute('y1', ctl.y);
        guide2.setAttribute('x2', p2.x);
        guide2.setAttribute('y2', p2.y);
        guide2.setAttribute('stroke', '#cbd5e1');
        guide2.setAttribute('stroke-dasharray', '3 3');
        g.appendChild(guide2);

        const handleCtrl = document.createElementNS(NS, 'circle');
        handleCtrl.setAttribute('cx', ctl.x);
        handleCtrl.setAttribute('cy', ctl.y);
        handleCtrl.setAttribute('r', '7.5');
        handleCtrl.classList.add('interactive-handle');
        handleCtrl.title = state.lang === 'en' ? 'Drag to bend curve' : 'Arrastra para arquear o aplanar la curva';
        handleCtrl.addEventListener('mousedown', (e) => {
          if (window.PlopInteraction) window.PlopInteraction.startDragCurveHandle(e, curve, 'ctrl');
        });
        g.appendChild(handleCtrl);
      }

      const handle1 = document.createElementNS(NS, 'circle');
      handle1.setAttribute('cx', p1.x);
      handle1.setAttribute('cy', p1.y);
      handle1.setAttribute('r', '6.5');
      handle1.setAttribute('fill', '#3b82f6');
      handle1.setAttribute('stroke', '#fff');
      handle1.setAttribute('stroke-width', '2');
      handle1.style.cursor = 'grab';
      handle1.addEventListener('mousedown', (e) => {
        if (window.PlopInteraction) window.PlopInteraction.startDragCurveHandle(e, curve, 'p1');
      });
      g.appendChild(handle1);

      const handle2 = document.createElementNS(NS, 'circle');
      handle2.setAttribute('cx', p2.x);
      handle2.setAttribute('cy', p2.y);
      handle2.setAttribute('r', '6.5');
      handle2.setAttribute('fill', '#3b82f6');
      handle2.setAttribute('stroke', '#fff');
      handle2.setAttribute('stroke-width', '2');
      handle2.style.cursor = 'grab';
      handle2.addEventListener('mousedown', (e) => {
        if (window.PlopInteraction) window.PlopInteraction.startDragCurveHandle(e, curve, 'p2');
      });
      g.appendChild(handle2);

      layer.appendChild(g);
    }

    // 2. TIRADORES DE FLECHA
    else if (state.selectedType === 'arrow') {
      const arr = state.arrows.find(a => a.id === state.selectedId);
      if (!arr) return;

      const p1 = window.PlopCoords.toSvgCoords(arr.x1, arr.y1);
      const p2 = window.PlopCoords.toSvgCoords(arr.x2, arr.y2);

      const h1 = document.createElementNS(NS, 'circle');
      h1.setAttribute('cx', p1.x);
      h1.setAttribute('cy', p1.y);
      h1.setAttribute('r', '6.5');
      h1.setAttribute('fill', '#3b82f6');
      h1.setAttribute('stroke', '#ffffff');
      h1.setAttribute('stroke-width', '2');
      h1.style.cursor = 'grab';
      h1.title = state.lang === 'en' ? 'Drag arrow base' : 'Arrastra para rotar o mover el inicio de la flecha';
      h1.addEventListener('mousedown', (e) => {
        if (window.PlopInteraction) window.PlopInteraction.startDragArrowHandle(e, arr, 'p1');
      });
      g.appendChild(h1);

      const h2 = document.createElementNS(NS, 'circle');
      h2.setAttribute('cx', p2.x);
      h2.setAttribute('cy', p2.y);
      h2.setAttribute('r', '7.5');
      h2.setAttribute('fill', '#f59e0b');
      h2.setAttribute('stroke', '#ffffff');
      h2.setAttribute('stroke-width', '2');
      h2.style.cursor = 'grab';
      h2.title = state.lang === 'en' ? 'Drag to rotate 360° and resize' : 'Arrastra para rotar en 360°, alargar o dirigir la cabeza de la flecha';
      h2.addEventListener('mousedown', (e) => {
        if (window.PlopInteraction) window.PlopInteraction.startDragArrowHandle(e, arr, 'p2');
      });
      g.appendChild(h2);

      layer.appendChild(g);
    }

    // 3. TIRADORES DE LLAVE { }
    else if (state.selectedType === 'brace') {
      const brc = state.braces.find(b => b.id === state.selectedId);
      if (!brc) return;

      const p1 = window.PlopCoords.toSvgCoords(brc.x1, brc.y1);
      const p2 = window.PlopCoords.toSvgCoords(brc.x2, brc.y2);

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const h = brc.depth !== undefined ? brc.depth : 18;
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      const tipX = mx + nx * h;
      const tipY = my + ny * h;

      const h1 = document.createElementNS(NS, 'circle');
      h1.setAttribute('cx', p1.x);
      h1.setAttribute('cy', p1.y);
      h1.setAttribute('r', '6.5');
      h1.setAttribute('fill', '#3b82f6');
      h1.setAttribute('stroke', '#ffffff');
      h1.setAttribute('stroke-width', '2');
      h1.style.cursor = 'grab';
      h1.title = state.lang === 'en' ? 'Drag to rotate or resize brace' : 'Arrastra para rotar o cambiar el largo de la llave';
      h1.addEventListener('mousedown', (e) => {
        if (window.PlopInteraction) window.PlopInteraction.startDragBraceHandle(e, brc, 'p1');
      });
      g.appendChild(h1);

      const h2 = document.createElementNS(NS, 'circle');
      h2.setAttribute('cx', p2.x);
      h2.setAttribute('cy', p2.y);
      h2.setAttribute('r', '6.5');
      h2.setAttribute('fill', '#3b82f6');
      h2.setAttribute('stroke', '#ffffff');
      h2.setAttribute('stroke-width', '2');
      h2.style.cursor = 'grab';
      h2.title = state.lang === 'en' ? 'Drag to rotate or resize brace' : 'Arrastra para rotar o cambiar el largo de la llave';
      h2.addEventListener('mousedown', (e) => {
        if (window.PlopInteraction) window.PlopInteraction.startDragBraceHandle(e, brc, 'p2');
      });
      g.appendChild(h2);

      const hTip = document.createElementNS(NS, 'circle');
      hTip.setAttribute('cx', tipX);
      hTip.setAttribute('cy', tipY);
      hTip.setAttribute('r', '7.5');
      hTip.setAttribute('fill', '#f59e0b');
      hTip.setAttribute('stroke', '#ffffff');
      hTip.setAttribute('stroke-width', '2');
      hTip.style.cursor = 'grab';
      hTip.title = state.lang === 'en' ? 'Drag to adjust brace depth' : 'Arrastra para ajustar la profundidad o invertir el arco de la llave';
      hTip.addEventListener('mousedown', (e) => {
        if (window.PlopInteraction) window.PlopInteraction.startDragBraceHandle(e, brc, 'tip');
      });
      g.appendChild(hTip);

      layer.appendChild(g);
    }
  }

  function renderTexts() {
    const layer = getLayer('layerTexts');
    if (!layer) return;
    layer.innerHTML = '';
    const state = window.PlopState;

    state.texts.forEach(txt => {
      const g = document.createElementNS(NS, 'g');
      g.dataset.id = txt.id;
      g.dataset.type = 'text';

      const textElem = document.createElementNS(NS, 'text');
      textElem.setAttribute('x', txt.x);
      textElem.setAttribute('y', txt.y);
      textElem.setAttribute('font-size', txt.fontSize || 15);
      textElem.setAttribute('font-weight', txt.bold ? '700' : '500');
      textElem.setAttribute('fill', txt.color || '#0f172a');
      textElem.classList.add('interactive-text');

      if (state.selectedId === txt.id) textElem.classList.add('item-selected');

      const lines = (txt.content || '').split('\n');
      lines.forEach((line, idx) => {
        const tspan = document.createElementNS(NS, 'tspan');
        tspan.setAttribute('x', txt.x);
        tspan.setAttribute('dy', idx === 0 ? '0' : '1.3em');
        tspan.textContent = line;
        textElem.appendChild(tspan);
      });

      textElem.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        if (window.PlopApp) window.PlopApp.selectItem(txt.id, 'text');
        if (window.PlopInteraction) window.PlopInteraction.startDragText(e, txt);
      });

      g.appendChild(textElem);
      layer.appendChild(g);
    });
  }

  function renderAll() {
    renderAxes();
    renderProjections();
    renderCurves();
    renderBraces();
    renderArrows();
    renderPoints();
    renderHandles();
    renderTexts();
  }

  return {
    renderAll: renderAll,
    renderAxes: renderAxes,
    renderProjections: renderProjections,
    renderCurves: renderCurves,
    renderBraces: renderBraces,
    renderArrows: renderArrows,
    renderPoints: renderPoints,
    renderHandles: renderHandles,
    renderTexts: renderTexts,
    getArrowMarker: getArrowMarker
  };
})();

// Alias global para compatibilidad
window.renderAll = function() {
  if (window.PlopRender) window.PlopRender.renderAll();
};
