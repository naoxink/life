;(() => {

  requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame

  window.requestAnimationFrame = requestAnimationFrame

  // Elementos y configuración
  const _canvas = document.querySelector('canvas#board')
  const _ctx = _canvas.getContext('2d')
  const _statusRunning = document.querySelector('#status-running')
  const _statusFps = document.querySelector('#status-fps')
  const _cellSize = 10
  const _canvasWidth = 800
  const _canvasHeight = 600
  const _fps = 20
  const _frameDuration = 1000 / _fps
  let running = false
  let frameStart = null

  // Dibuja una célula
  const square = (x, y, w, h, filled) => {
    _ctx.lineWidth = .1
    _ctx.beginPath()
    if(filled){
      _ctx.fillRect(x, y, w, h)
    }else{
      _ctx.rect(x, y, w, h)
    }
      _ctx.stroke()
  }

  // Limpia el tablero
  const clearBoard = () => _ctx.clearRect(0, 0, _canvasWidth, _canvasHeight)

  // Pinta el tablero
  const drawBoard = () => {
    clearBoard()
    cellArray.forEach((row, rIndex) => {
      row.forEach((cell, cIndex) => {
        square(
          cIndex * _cellSize, // x
          rIndex * _cellSize, // y
          _cellSize, // w
          _cellSize, // h
          cell // filled
        )
      })
    })
  }

  // Alterna el valor de una célula clickada
  const toggleCell = e => {
    if(running) return false
    let rect = _canvas.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top
    let cell = Math.floor(x / _cellSize)
    let row = Math.floor(y / _cellSize)
    cellArray[row][cell] = cellArray[row][cell] === 1 ? 0 : 1
    drawBoard()
  }

  // Comprueba si una célula está viva o no
  const checkCell = (cell, row) => {
    let nearAlive = 0
    let isAlive = cellArray[row][cell]

    const topRow = row - 1
    const bottomRow = row + 1
    const leftCell = cell - 1
    const rightCell = cell + 1

    // Comprobar izq
    if(cellArray[row][leftCell] === 1){
      nearAlive++
    }
    // Comprobar der
    if(cellArray[row][rightCell] === 1){
      nearAlive++
    }

    // Comprobar arriba y arriba a los lados
    if(cellArray[topRow] !== undefined){
      // Justo arriba
      if(cellArray[topRow][cell] === 1){
        nearAlive++
      }
      // Izq
      if(leftCell >= 0 && cellArray[topRow][leftCell] === 1){
        nearAlive++
      }
      // Der
      if(rightCell < cellArray[topRow].length && cellArray[topRow][rightCell] === 1){
        nearAlive++
      }
    }
    // Comprobar abajo y los lados
    if(cellArray[bottomRow] !== undefined){
      // Justo abajo
      if(cellArray[bottomRow][cell] === 1){
        nearAlive++
      }
      // Izq
      if(leftCell >= 0 && cellArray[bottomRow][leftCell] === 1){
        nearAlive++
      }
      // Der
      if(rightCell < cellArray[bottomRow].length && cellArray[bottomRow][rightCell] === 1){
        nearAlive++
      }
    }

    // Si una célula está viva y tiene dos o tres vecinas vivas, sobrevive.
    if(isAlive && nearAlive > 1 && nearAlive < 4){
      isAlive = 1
    }
    // Si una célula está muerta y tiene tres vecinas vivas, nace.
    else if(!isAlive && nearAlive === 3){
      isAlive = 1
    }
    // Si una célula está viva y tiene más de tres vecinas vivas, muere.
    else if(isAlive && nearAlive > 3){
      isAlive = 0
    }
    // Si una célula está viva y tiene menos de dos vecinas vivas, muere.
    else if(isAlive && nearAlive < 2){
      isAlive = 0
    }

    return isAlive
  }

  // Loop principal
  const checkCells = () => {
    if(!running){
      return false
    }
    // Control de FPS
    const now = Date.now()
    const elapsed = now - frameStart
    if(elapsed < _frameDuration){
      return window.requestAnimationFrame(checkCells)
    }

    // Crear nueva generación
    const newGen = []
    for(let r = 0; r < cellArray.length; r++){
      if(!newGen[r]){
        newGen[r] = []
      }
      for(let c = 0; c < cellArray[r].length; c++){
        newGen[r][c] = checkCell(c, r)
      }
    }
    if(JSON.stringify(cellArray) === JSON.stringify(newGen)){
      running = false
    }
    cellArray = newGen
    // Dibujar tablero
    drawBoard()
    // Loop
    frameStart = now - (elapsed % _frameDuration)
    return window.requestAnimationFrame(checkCells)
  }

  // Cambiar tamaño de canvas para que ocupe el tamaño que queramos
  _canvas.setAttribute('width', _canvasWidth)
  _canvas.setAttribute('height', _canvasHeight)

  // Crear array de células
  const cellsPerRow = Math.floor(_canvasWidth / _cellSize)
  const totalRows = Math.floor(_canvasHeight / _cellSize)
  let cellArray = []
  for(let r = 0; r < totalRows; r++){
    const row = []
    for(let c = 0; c < cellsPerRow; c++){
      row.push(0) // Por defecto apagada
    }
    cellArray.push(row)
  }

  // Pintado inicial
  drawBoard()

  _canvas.addEventListener("mouseup", e => toggleCell(e))

  document.addEventListener('keyup', e => {
    if(e.key === ' '){
      running = !running
      _statusRunning.textContent = running ? 'yes' : 'no'
      _statusFps.textContent = running ? _fps : 0
      frameStart = Date.now()
      window.requestAnimationFrame(checkCells)
    }
  })

})();
