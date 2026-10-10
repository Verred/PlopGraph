/**
 * PlopGraph - Controlador Principal de la Aplicación
 * Administra el panel de propiedades (inspector), exportación a PNG/SVG,
 * cambio de idioma, sincronización de controles y atajos de teclado.
 * Creado por Verred (https://github.com/Verred)
 */

window.PlopApp = (function() {
  function getSvg() { return document.getElementById('graphSvg'); }

  function setLanguage(lang) {
    const state = window.PlopState;
    state.lang = lang;
    localStorage.setItem('plopgraph_lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    const t = window.PlopI18n[lang];
    if (!t) return;

    // Encabezado
    const txtSubtitle = document.getElementById('txtSubtitle');
    if (txtSubtitle) txtSubtitle.textContent = t.subtitle;
    document.getElementById('lblBtnExample').textContent = t.btnExample;
    document.getElementById('lblBtnClear').textContent = t.btnClear;
    document.getElementById('lblBtnSvg').textContent = t.btnSvg;
    document.getElementById('lblBtnPng').textContent = t.btnPng;

    // Barra de herramientas
    document.getElementById('toolSelectTxt').textContent = t.toolSelect;
    document.getElementById('toolPointTxt').textContent = t.toolPoint;
    document.getElementById('toolCurveTxt').textContent = t.toolCurve;
    document.getElementById('toolLineTxt').textContent = t.toolLine;
    document.getElementById('toolArrowTxt').textContent = t.toolArrow;
    document.getElementById('toolBraceTxt').textContent = t.toolBrace;
    document.getElementById('toolTextTxt').textContent = t.toolText;
    document.getElementById('toolDeleteTxt').textContent = t.toolDelete;

    // Barra lateral
    document.getElementById('secTitleAxes').textContent = t.secAxes;
    document.getElementById('lblTicksMode').textContent = t.lblTicksMode;
    document.getElementById('optTicksUniform').textContent = t.optTicksUniform;
    document.getElementById('optTicksPoints').textContent = t.optTicksPoints;
    document.getElementById('optTicksBoth').textContent = t.optTicksBoth;
    document.getElementById('lblAxisYTitle').textContent = t.lblAxisYTitle;
    document.getElementById('lblAxisXTitle').textContent = t.lblAxisXTitle;
    document.getElementById('lblAxisYMax').textContent = t.lblAxisYMax;
    document.getElementById('lblAxisXMax').textContent = t.lblAxisXMax;
    document.getElementById('lblAxisYStep').textContent = t.lblAxisYStep;
    document.getElementById('lblAxisXStep').textContent = t.lblAxisXStep;
    document.getElementById('lblShowGrid').textContent = t.lblShowGrid;
    document.getElementById('secTitleTips').textContent = t.secTips;
    document.getElementById('tipItemGrid').innerHTML = t.tipGrid;
    document.getElementById('tipItemArrow').innerHTML = t.tipArrow;
    document.getElementById('tipItemBrace').innerHTML = t.tipBrace;
    const lblAuthorCreated = document.getElementById('lblAuthorCreated');
    if (lblAuthorCreated) lblAuthorCreated.textContent = t.authorCreated;
    const lblAuthorSubtitle = document.getElementById('lblAuthorSubtitle');
    if (lblAuthorSubtitle) lblAuthorSubtitle.textContent = t.authorSubtitle;

    const toastHint = document.getElementById('toastHint');
    if (toastHint && t.hints[state.mode]) {
      toastHint.textContent = t.hints[state.mode];
    }

    updateInspector();
  }

  function setMode(newMode) {
    const state = window.PlopState;
    state.mode = newMode;
    document.body.className = `mode-${newMode}`;
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === newMode);
    });

    const t = window.PlopI18n[state.lang];
    const toastHint = document.getElementById('toastHint');
    if (toastHint && t && t.hints[newMode]) {
      toastHint.textContent = t.hints[newMode];
    }
  }

  function selectItem(id, type) {
    const state = window.PlopState;
    state.selectedId = id;
    state.selectedType = type;
    window.PlopRender.renderAll();
    updateInspector();
  }

  function deselectAll() {
    const state = window.PlopState;
    state.selectedId = null;
    state.selectedType = null;
    window.PlopRender.renderAll();
    updateInspector();
  }

  function deleteCurrentSelection() {
    const state = window.PlopState;
    if (!state.selectedId) return;
    state.points = state.points.filter(p => p.id !== state.selectedId);
    state.curves = state.curves.filter(c => c.id !== state.selectedId);
    state.braces = state.braces.filter(b => b.id !== state.selectedId);
    state.arrows = state.arrows.filter(a => a.id !== state.selectedId);
    state.texts = state.texts.filter(t => t.id !== state.selectedId);
    deselectAll();
  }

  function updateInspector() {
    const state = window.PlopState;
    const container = document.getElementById('inspectorContent');
    const title = document.getElementById('inspectorTitle');
    if (!container || !title) return;

    const isEn = state.lang === 'en';

    if (!state.selectedId) {
      title.textContent = isEn ? 'Properties' : 'Propiedades';
      container.innerHTML = `
        <p style="font-size: 13px; color: #94a3b8; font-style: italic;">
          ${isEn ? 'Click on a point, curve, brace, arrow, or text to customize its properties.' : 'Haz clic en un punto, curva, llave, flecha o texto para ver y editar sus propiedades.'}
        </p>`;
      return;
    }

    // 1. INSPECTOR DE PUNTO
    if (state.selectedType === 'point') {
      const pt = state.points.find(p => p.id === state.selectedId);
      if (!pt) return;
      title.textContent = isEn ? `Point [${pt.label.replace('\n', ' ') || 'No label'}]` : `Punto [${pt.label.replace('\n', ' ') || 'Sin etiqueta'}]`;
      container.innerHTML = `
        <div class="field">
          <label>${isEn ? 'Point Label:' : 'Etiqueta del Punto:'}</label>
          <textarea rows="2" class="input-text" id="propPointLabel">${pt.label || ''}</textarea>
        </div>
        <div class="row-2">
          <div class="field">
            <label>${isEn ? 'X Position:' : 'Posición X:'}</label>
            <input type="number" class="input-text" id="propPointX" value="${Math.round(pt.x)}" step="1">
          </div>
          <div class="field">
            <label>${isEn ? 'Y Position:' : 'Posición Y:'}</label>
            <input type="number" class="input-text" id="propPointY" value="${Math.round(pt.y)}" step="1">
          </div>
        </div>
        <div class="field">
          <label>${isEn ? 'Point Color:' : 'Color del Punto:'}</label>
          <input type="color" class="color-swatch-input" id="propPointColor" value="${pt.color || '#0284c7'}">
        </div>
        
        <div style="margin: 12px 0 6px; font-weight: 600; font-size: 12px; color: #475569; border-top: 1px solid #f1f5f9; padding-top: 8px;">
          ${isEn ? 'Projection Lines to Axes' : 'Líneas de Proyección a Ejes'}
        </div>
        
        <div class="row-2">
          <div class="field">
            <label>${isEn ? 'Line Style:' : 'Estilo de Línea:'}</label>
            <select class="input-select" id="propPointProjStyle">
              <option value="dashed" ${pt.projStyle === 'dashed' ? 'selected' : ''}>${isEn ? 'Dashed' : 'Punteada (Discontinua)'}</option>
              <option value="solid" ${pt.projStyle === 'solid' ? 'selected' : ''}>${isEn ? 'Solid' : 'Continua (Sólida)'}</option>
            </select>
          </div>
          <div class="field">
            <label>${isEn ? 'Proj. Color:' : 'Color Proyección:'}</label>
            <input type="color" class="color-swatch-input" id="propPointProjColor" value="${pt.projColor || pt.color || '#0284c7'}">
          </div>
        </div>

        <div class="checkbox-field">
          <input type="checkbox" id="propPointProjX" ${pt.showProjX ? 'checked' : ''}>
          <label for="propPointProjX">${isEn ? 'Project to Axis X' : 'Proyectar al Eje X'}</label>
        </div>
        <div class="checkbox-field">
          <input type="checkbox" id="propPointProjY" ${pt.showProjY ? 'checked' : ''}>
          <label for="propPointProjY">${isEn ? 'Project to Axis Y' : 'Proyectar al Eje Y'}</label>
        </div>
        <div class="checkbox-field">
          <input type="checkbox" id="propPointProjAxisTick" ${pt.showProjAxisTick ? 'checked' : ''}>
          <label for="propPointProjAxisTick">${isEn ? 'Show coordinate number on axis' : 'Colocar número en el eje'}</label>
        </div>

        <div style="margin-top: 14px;">
          <button class="btn btn-danger" style="width: 100%;" id="btnInspectorDeletePoint">${isEn ? '🗑️ Delete Point' : '🗑️ Eliminar Punto'}</button>
        </div>
      `;

      document.getElementById('propPointLabel').addEventListener('input', (e) => {
        pt.label = e.target.value;
        window.PlopRender.renderAll();
      });
      document.getElementById('propPointX').addEventListener('change', (e) => {
        pt.x = parseFloat(e.target.value) || 0;
        window.PlopRender.renderAll();
      });
      document.getElementById('propPointY').addEventListener('change', (e) => {
        pt.y = parseFloat(e.target.value) || 0;
        window.PlopRender.renderAll();
      });
      document.getElementById('propPointColor').addEventListener('input', (e) => {
        pt.color = e.target.value;
        window.PlopRender.renderAll();
      });
      document.getElementById('propPointProjStyle').addEventListener('change', (e) => {
        pt.projStyle = e.target.value;
        window.PlopRender.renderAll();
      });
      document.getElementById('propPointProjColor').addEventListener('input', (e) => {
        pt.projColor = e.target.value;
        window.PlopRender.renderAll();
      });
      document.getElementById('propPointProjX').addEventListener('change', (e) => {
        pt.showProjX = e.target.checked;
        window.PlopRender.renderAll();
      });
      document.getElementById('propPointProjY').addEventListener('change', (e) => {
        pt.showProjY = e.target.checked;
        window.PlopRender.renderAll();
      });
      document.getElementById('propPointProjAxisTick').addEventListener('change', (e) => {
        pt.showProjAxisTick = e.target.checked;
        window.PlopRender.renderAll();
      });
      document.getElementById('btnInspectorDeletePoint').addEventListener('click', deleteCurrentSelection);
    }

    // 2. INSPECTOR DE CURVA
    else if (state.selectedType === 'curve') {
      const crv = state.curves.find(c => c.id === state.selectedId);
      if (!crv) return;
      title.textContent = isEn ? 'Curve / Line' : 'Curva / Línea';
      container.innerHTML = `
        <div class="row-2">
          <div class="field">
            <label>${isEn ? 'Type:' : 'Tipo:'}</label>
            <select class="input-select" id="propCurveType">
              <option value="curve" ${crv.isCurved ? 'selected' : ''}>${isEn ? 'Bézier Curve' : 'Curva (Bézier)'}</option>
              <option value="line" ${!crv.isCurved ? 'selected' : ''}>${isEn ? 'Straight Line' : 'Línea Recta'}</option>
            </select>
          </div>
          <div class="field">
            <label>${isEn ? 'Thickness:' : 'Grosor:'}</label>
            <input type="number" class="input-text" id="propCurveWidth" value="${crv.strokeWidth || 3}" min="1" max="10">
          </div>
        </div>
        <div class="field">
          <label>${isEn ? 'Curve Color:' : 'Color de Curva:'}</label>
          <input type="color" class="color-swatch-input" id="propCurveColor" value="${crv.color || '#2563eb'}">
        </div>
        <div class="checkbox-field">
          <input type="checkbox" id="propCurveIntercepts" ${crv.showIntercepts ? 'checked' : ''}>
          <label for="propCurveIntercepts">${isEn ? 'Mark axis intercepts' : 'Marcar cortes con los ejes'}</label>
        </div>
        <div style="margin-top: 14px;">
          <button class="btn btn-danger" style="width: 100%;" id="btnInspectorDeleteCurve">${isEn ? '🗑️ Delete Curve' : '🗑️ Eliminar'}</button>
        </div>
      `;

      document.getElementById('propCurveType').addEventListener('change', (e) => {
        crv.isCurved = e.target.value === 'curve';
        window.PlopRender.renderAll();
      });
      document.getElementById('propCurveWidth').addEventListener('change', (e) => {
        crv.strokeWidth = parseFloat(e.target.value) || 3;
        window.PlopRender.renderAll();
      });
      document.getElementById('propCurveColor').addEventListener('input', (e) => {
        crv.color = e.target.value;
        window.PlopRender.renderAll();
      });
      document.getElementById('propCurveIntercepts').addEventListener('change', (e) => {
        crv.showIntercepts = e.target.checked;
        window.PlopRender.renderAll();
      });
      document.getElementById('btnInspectorDeleteCurve').addEventListener('click', deleteCurrentSelection);
    }

    // 3. INSPECTOR DE FLECHA
    else if (state.selectedType === 'arrow') {
      const arr = state.arrows.find(a => a.id === state.selectedId);
      if (!arr) return;
      title.textContent = isEn ? 'Directional Arrow' : 'Flecha de Desplazamiento';
      container.innerHTML = `
        <div class="field">
          <label>${isEn ? 'Arrow & Tip Color:' : 'Color de la Flecha (Línea y Punta):'}</label>
          <input type="color" class="color-swatch-input" id="propArrowColor" value="${arr.color || '#15803d'}">
        </div>
        <div class="field">
          <label>${isEn ? 'Stroke Width:' : 'Grosor del Trazo:'}</label>
          <input type="number" class="input-text" id="propArrowWidth" value="${arr.strokeWidth || 2.5}" min="1" max="8" step="0.5">
        </div>
        <div style="margin-top: 10px; font-size: 11.5px; color: #475569; background: #eff6ff; border: 1px solid #bfdbfe; padding: 10px; border-radius: 6px; line-height: 1.45;">
          🎯 <b>${isEn ? 'Rotation & Size:' : 'Rotación y Tamaño:'}</b> ${isEn ? 'Drag the yellow circle at the tip or blue circle at the base to rotate 360° and resize.' : 'Arrastra el círculo amarillo en la cabeza o el azul en la base para rotar libremente en 360° y cambiar la longitud.'}
        </div>
        <div style="margin-top: 14px;">
          <button class="btn btn-danger" style="width: 100%;" id="btnInspectorDeleteArrow">${isEn ? '🗑️ Delete Arrow' : '🗑️ Eliminar Flecha'}</button>
        </div>
      `;

      document.getElementById('propArrowColor').addEventListener('input', (e) => {
        arr.color = e.target.value;
        window.PlopRender.renderAll();
      });
      document.getElementById('propArrowWidth').addEventListener('change', (e) => {
        arr.strokeWidth = parseFloat(e.target.value) || 2.5;
        window.PlopRender.renderAll();
      });
      document.getElementById('btnInspectorDeleteArrow').addEventListener('click', deleteCurrentSelection);
    }

    // 4. INSPECTOR DE LLAVE { }
    else if (state.selectedType === 'brace') {
      const brc = state.braces.find(b => b.id === state.selectedId);
      if (!brc) return;
      title.textContent = isEn ? 'Brace { }' : 'Llave { } Agrupadora';
      container.innerHTML = `
        <div class="field">
          <label>${isEn ? 'Brace Color:' : 'Color de la Llave:'}</label>
          <input type="color" class="color-swatch-input" id="propBraceColor" value="${brc.color || '#0f172a'}">
        </div>
        <div class="row-2">
          <div class="field">
            <label>${isEn ? 'Stroke Width:' : 'Grosor:'}</label>
            <input type="number" class="input-text" id="propBraceWidth" value="${brc.strokeWidth || 2}" min="1" max="8" step="0.5">
          </div>
          <div class="field">
            <label>${isEn ? 'Depth:' : 'Profundidad:'}</label>
            <input type="number" class="input-text" id="propBraceDepth" value="${brc.depth !== undefined ? brc.depth : 18}" step="2">
          </div>
        </div>
        <div class="field">
          <label>${isEn ? 'Optional Text (or add text separately):' : 'Texto Opcional (o añade texto aparte):'}</label>
          <input type="text" class="input-text" id="propBraceText" value="${brc.text || ''}" placeholder="${isEn ? '(Empty by default)' : '(Vacío por defecto)'}">
        </div>
        <div style="margin-top: 10px; font-size: 11.5px; color: #475569; background: #eff6ff; border: 1px solid #bfdbfe; padding: 10px; border-radius: 6px; line-height: 1.45;">
          🎯 <b>${isEn ? 'Rotation & Size:' : 'Rotación y Tamaño:'}</b> ${isEn ? 'Drag blue circles at the ends to rotate at any angle. Drag the yellow circle to adjust depth.' : 'Arrastra los círculos azules en los extremos para girarla a cualquier ángulo y alargarla. El círculo amarillo ajusta la curvatura central.'}
        </div>
        <div style="margin-top: 14px;">
          <button class="btn btn-danger" style="width: 100%;" id="btnInspectorDeleteBrace">${isEn ? '🗑️ Delete Brace' : '🗑️ Eliminar Llave'}</button>
        </div>
      `;

      document.getElementById('propBraceColor').addEventListener('input', (e) => {
        brc.color = e.target.value;
        window.PlopRender.renderAll();
      });
      document.getElementById('propBraceWidth').addEventListener('change', (e) => {
        brc.strokeWidth = parseFloat(e.target.value) || 2;
        window.PlopRender.renderAll();
      });
      document.getElementById('propBraceDepth').addEventListener('change', (e) => {
        brc.depth = parseFloat(e.target.value) || 18;
        window.PlopRender.renderAll();
      });
      document.getElementById('propBraceText').addEventListener('input', (e) => {
        brc.text = e.target.value;
        window.PlopRender.renderAll();
      });
      document.getElementById('btnInspectorDeleteBrace').addEventListener('click', deleteCurrentSelection);
    }

    // 5. INSPECTOR DE TEXTO
    else if (state.selectedType === 'text') {
      const txt = state.texts.find(t => t.id === state.selectedId);
      if (!txt) return;
      title.textContent = isEn ? 'Text Annotation' : 'Anotación de Texto';
      container.innerHTML = `
        <div class="field">
          <label>${isEn ? 'Text Content:' : 'Contenido del Texto:'}</label>
          <textarea rows="4" class="input-text" id="propTextContent">${txt.content || ''}</textarea>
        </div>
        <div class="row-2">
          <div class="field">
            <label>${isEn ? 'Font Size:' : 'Tamaño Fuente:'}</label>
            <input type="number" class="input-text" id="propTextSize" value="${txt.fontSize || 15}" min="10" max="40">
          </div>
          <div class="field">
            <label>${isEn ? 'Color:' : 'Color:'}</label>
            <input type="color" class="color-swatch-input" id="propTextColor" value="${txt.color || '#0f172a'}">
          </div>
        </div>
        <div class="checkbox-field">
          <input type="checkbox" id="propTextBold" ${txt.bold ? 'checked' : ''}>
          <label for="propTextBold">${isEn ? 'Bold Text' : 'Negrita'}</label>
        </div>
        <div style="margin-top: 14px;">
          <button class="btn btn-danger" style="width: 100%;" id="btnInspectorDeleteText">${isEn ? '🗑️ Delete Text' : '🗑️ Eliminar Texto'}</button>
        </div>
      `;

      document.getElementById('propTextContent').addEventListener('input', (e) => {
        txt.content = e.target.value;
        window.PlopRender.renderTexts();
      });
      document.getElementById('propTextSize').addEventListener('change', (e) => {
        txt.fontSize = parseInt(e.target.value) || 15;
        window.PlopRender.renderTexts();
      });
      document.getElementById('propTextColor').addEventListener('input', (e) => {
        txt.color = e.target.value;
        window.PlopRender.renderTexts();
      });
      document.getElementById('propTextBold').addEventListener('change', (e) => {
        txt.bold = e.target.checked;
        window.PlopRender.renderTexts();
      });
      document.getElementById('btnInspectorDeleteText').addEventListener('click', deleteCurrentSelection);
    }
  }

  function syncUiInputs() {
    const axes = window.PlopState.axes;
    document.getElementById('cfgAxisXTitle').value = axes.titleX;
    document.getElementById('cfgAxisYTitle').value = axes.titleY;
    document.getElementById('cfgAxisXMax').value = axes.maxX;
    document.getElementById('cfgAxisYMax').value = axes.maxY;
    document.getElementById('cfgAxisXStep').value = axes.stepX;
    document.getElementById('cfgAxisYStep').value = axes.stepY;
    document.getElementById('cfgAxisTicksMode').value = axes.ticksMode;
    document.getElementById('cfgShowGrid').checked = !!axes.showGrid;
    document.getElementById('cfgStepGroup').style.display = (axes.ticksMode !== 'points') ? 'block' : 'none';
  }

  function exportSVG() {
    const prevSel = window.PlopState.selectedId;
    deselectAll();

    const svg = getSvg();
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plopgraph.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (prevSel) selectItem(prevSel, window.PlopState.selectedType);
  }

  function exportPNG() {
    const prevSel = window.PlopState.selectedId;
    deselectAll();

    const svg = getSvg();
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);

    const img = new Image();
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = function() {
      const canvas = document.createElement('canvas');
      const scale = 2; // Retina / HD
      canvas.width = svg.viewBox.baseVal.width * scale;
      canvas.height = svg.viewBox.baseVal.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      URL.revokeObjectURL(url);

      const a = document.createElement('a');
      a.download = 'plopgraph.png';
      a.href = canvas.toDataURL('image/png');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      if (prevSel) selectItem(prevSel, window.PlopState.selectedType);
    };
    img.src = url;
  }

  function init() {
    // 1. Configuración de Ejes en Vivo
    document.getElementById('cfgAxisXTitle').addEventListener('input', (e) => {
      window.PlopState.axes.titleX = e.target.value;
      window.PlopRender.renderAll();
    });
    document.getElementById('cfgAxisYTitle').addEventListener('input', (e) => {
      window.PlopState.axes.titleY = e.target.value;
      window.PlopRender.renderAll();
    });
    document.getElementById('cfgAxisXMax').addEventListener('change', (e) => {
      window.PlopState.axes.maxX = parseFloat(e.target.value) || 100;
      window.PlopRender.renderAll();
    });
    document.getElementById('cfgAxisYMax').addEventListener('change', (e) => {
      window.PlopState.axes.maxY = parseFloat(e.target.value) || 100;
      window.PlopRender.renderAll();
    });
    document.getElementById('cfgAxisTicksMode').addEventListener('change', (e) => {
      window.PlopState.axes.ticksMode = e.target.value;
      document.getElementById('cfgStepGroup').style.display = (e.target.value !== 'points') ? 'block' : 'none';
      window.PlopRender.renderAll();
    });
    document.getElementById('cfgAxisXStep').addEventListener('change', (e) => {
      window.PlopState.axes.stepX = parseFloat(e.target.value) || 20;
      window.PlopRender.renderAll();
    });
    document.getElementById('cfgAxisYStep').addEventListener('change', (e) => {
      window.PlopState.axes.stepY = parseFloat(e.target.value) || 20;
      window.PlopRender.renderAll();
    });
    document.getElementById('cfgShowGrid').addEventListener('change', (e) => {
      window.PlopState.axes.showGrid = e.target.checked;
      window.PlopRender.renderAll();
    });

    // 2. Botones de Idioma
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    // 3. Botones de Modos en Toolbar
    document.querySelectorAll('.tool-btn[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    // 4. Botones de Acción
    document.getElementById('btnDeleteSelected').addEventListener('click', deleteCurrentSelection);
    document.getElementById('btnLoadExampleSimple').addEventListener('click', window.loadExampleSimple);

    document.getElementById('btnClear').addEventListener('click', () => {
      const state = window.PlopState;
      if (confirm(window.PlopI18n[state.lang].confirmClear)) {
        state.points = [];
        state.curves = [];
        state.braces = [];
        state.arrows = [];
        state.texts = [];
        deselectAll();
      }
    });

    document.getElementById('btnExportSVG').addEventListener('click', exportSVG);
    document.getElementById('btnExportPNG').addEventListener('click', exportPNG);

    // 5. Atajos de Teclado
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteCurrentSelection();
      } else if (e.key === 'v' || e.key === 'V') {
        setMode('select');
      } else if (e.key === 'p' || e.key === 'P') {
        setMode('add-point');
      } else if (e.key === 'c' || e.key === 'C') {
        setMode('add-curve');
      } else if (e.key === 't' || e.key === 'T') {
        setMode('add-text');
      }
    });

    // 6. Iniciar Interacción y cargar estado por defecto
    window.PlopInteraction.initMouseEvents();
    setLanguage(window.PlopState.lang);
    window.loadExampleSimple();
  }

  return {
    init: init,
    setLanguage: setLanguage,
    setMode: setMode,
    selectItem: selectItem,
    deselectAll: deselectAll,
    deleteCurrentSelection: deleteCurrentSelection,
    updateInspector: updateInspector,
    syncUiInputs: syncUiInputs,
    exportSVG: exportSVG,
    exportPNG: exportPNG
  };
})();

// Helper global para sincronizar inputs
window.syncUiInputs = function() {
  if (window.PlopApp) window.PlopApp.syncUiInputs();
};
window.deselectAll = function() {
  if (window.PlopApp) window.PlopApp.deselectAll();
};

// Arrancar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.PlopApp.init();
});
