import {reactive, computed, onMounted, onUnmounted, watch} from 'vue'

const isElectron = !!window.electronAPI

export const CELL_TYPES = {
  EMPTY: 0,
  WALL: 1,
  TARGET: 2,
  BOX: 3,
  PLAYER: 4,
  BOX_ON_TARGET: 5,
  PLAYER_ON_TARGET: 6
}

export const DIRECTIONS = {
  UP: {row: -1, col: 0},
  DOWN: {row: 1, col: 0},
  LEFT: {row: 0, col: -1},
  RIGHT: {row: 0, col: 1}
}

let levels = []

export function useGameState() {
  const gameState = reactive({
    map: [],
    playerPos: {row: 0, col: 0},
    steps: 0,
    history: [],
    originalLevel: [],
    currentLevel: 0,
    totalLevels: levels.length,
    playerDirection: 'front',
    showLevelSelector: false,
    autoAdvanceTimer: null,
    showSuccessModal: false,
    countdown: 3,
    levelCompleted: false,
    countdownInterval: null,
    successTimeout: null,
    justSwitchedLevel: false,
    showLevelEditor: false,
    editorRows: 8,
    editorCols: 8,
    editorMap: [],
    editingLevel: 0,
    selectedCellType: 0,
    showPathConfig: false,
    levelFilePath: '',
    notification: {
      show: false,
      message: '',
      type: 'info',
      timeout: null
    },
    dragOverCell: null,
    draggingType: null,
    draggingCell: null,
    draggingFromCell: null,
    showToolkit: false
  })

  // --- Notification ---
  function showNotification(message, type = 'info', duration = 3000) {
    if (gameState.notification.timeout) {
      clearTimeout(gameState.notification.timeout)
    }
    gameState.notification.message = message
    gameState.notification.type = type
    gameState.notification.show = true
    gameState.notification.timeout = setTimeout(() => {
      gameState.notification.show = false
    }, duration)
  }

  function hideNotification() {
    if (gameState.notification.timeout) {
      clearTimeout(gameState.notification.timeout)
    }
    gameState.notification.show = false
  }

  // --- Game Core ---
  function initGame(levelIndex = 0) {
    if (gameState.autoAdvanceTimer) {
      clearTimeout(gameState.autoAdvanceTimer)
      gameState.autoAdvanceTimer = null
    }
    if (gameState.countdownInterval) {
      clearInterval(gameState.countdownInterval)
      gameState.countdownInterval = null
    }
    if (gameState.successTimeout) {
      clearTimeout(gameState.successTimeout)
      gameState.successTimeout = null
    }

    gameState.showSuccessModal = false
    gameState.countdown = 3
    gameState.levelCompleted = false
    gameState.justSwitchedLevel = true

    const currentLevelData = levels[levelIndex]
    gameState.currentLevel = levelIndex
    gameState.originalLevel = currentLevelData.map(row => [...row])
    gameState.map = currentLevelData.map(row => [...row])
    gameState.steps = 0
    gameState.history = []

    for (let row = 0; row < gameState.map.length; row++) {
      for (let col = 0; col < gameState.map[row].length; col++) {
        if (gameState.map[row][col] === CELL_TYPES.PLAYER ||
            gameState.map[row][col] === CELL_TYPES.PLAYER_ON_TARGET) {
          gameState.playerPos = {row, col}
          if (gameState.map[row][col] === CELL_TYPES.PLAYER_ON_TARGET) {
            gameState.map[row][col] = CELL_TYPES.TARGET
          } else {
            gameState.map[row][col] = CELL_TYPES.EMPTY
          }
          break
        }
      }
    }

    setTimeout(() => {
      gameState.justSwitchedLevel = false
    }, 100)
  }

  function saveState() {
    gameState.history.push({
      map: gameState.map.map(row => [...row]),
      playerPos: {...gameState.playerPos},
      steps: gameState.steps
    })
  }

  function movePlayer(direction) {
    if (gameState.justSwitchedLevel) {
      gameState.justSwitchedLevel = false
    }

    const newRow = gameState.playerPos.row + direction.row
    const newCol = gameState.playerPos.col + direction.col

    if (newRow < 0 || newRow >= gameState.map.length ||
        newCol < 0 || newCol >= gameState.map[0].length) {
      return false
    }

    const targetCell = gameState.map[newRow][newCol]

    if (targetCell === CELL_TYPES.WALL) {
      return false
    }

    if (targetCell === CELL_TYPES.BOX || targetCell === CELL_TYPES.BOX_ON_TARGET) {
      const boxNewRow = newRow + direction.row
      const boxNewCol = newCol + direction.col

      if (boxNewRow < 0 || boxNewRow >= gameState.map.length ||
          boxNewCol < 0 || boxNewCol >= gameState.map[0].length) {
        return false
      }

      const boxTargetCell = gameState.map[boxNewRow][boxNewCol]

      if (boxTargetCell === CELL_TYPES.WALL ||
          boxTargetCell === CELL_TYPES.BOX ||
          boxTargetCell === CELL_TYPES.BOX_ON_TARGET) {
        return false
      }

      saveState()

      if (targetCell === CELL_TYPES.BOX_ON_TARGET) {
        gameState.map[newRow][newCol] = CELL_TYPES.TARGET
      } else {
        gameState.map[newRow][newCol] = CELL_TYPES.EMPTY
      }

      if (boxTargetCell === CELL_TYPES.TARGET) {
        gameState.map[boxNewRow][boxNewCol] = CELL_TYPES.BOX_ON_TARGET
      } else {
        gameState.map[boxNewRow][boxNewCol] = CELL_TYPES.BOX
      }
    } else {
      saveState()
    }

    const currentRow = gameState.playerPos.row
    const currentCol = gameState.playerPos.col
    const originalCell = gameState.originalLevel[currentRow][currentCol]

    if (originalCell === CELL_TYPES.TARGET ||
        originalCell === CELL_TYPES.PLAYER_ON_TARGET ||
        originalCell === CELL_TYPES.BOX_ON_TARGET) {
      gameState.map[currentRow][currentCol] = CELL_TYPES.TARGET
    } else {
      gameState.map[currentRow][currentCol] = CELL_TYPES.EMPTY
    }

    gameState.playerPos.row = newRow
    gameState.playerPos.col = newCol

    if (gameState.map[newRow][newCol] === CELL_TYPES.TARGET) {
      gameState.map[newRow][newCol] = CELL_TYPES.PLAYER_ON_TARGET
    } else {
      gameState.map[newRow][newCol] = CELL_TYPES.PLAYER
    }

    gameState.steps++
    return true
  }

  // --- Game Controls ---
  function undo() {
    if (gameState.history.length === 0) return
    const lastState = gameState.history.pop()
    gameState.map = lastState.map
    gameState.playerPos = lastState.playerPos
    gameState.steps = lastState.steps
  }

  function restart() {
    initGame(gameState.currentLevel)
  }

  function nextLevel() {
    if (gameState.currentLevel < gameState.totalLevels - 1) {
      initGame(gameState.currentLevel + 1)
    }
  }

  function prevLevel() {
    if (gameState.currentLevel > 0) {
      initGame(gameState.currentLevel - 1)
    }
  }

  function goToLevel(levelIndex) {
    if (levelIndex >= 0 && levelIndex < gameState.totalLevels) {
      gameState.showLevelSelector = false
      initGame(levelIndex)
    }
  }

  // --- Modals ---
  function closeAllModals() {
    gameState.showLevelSelector = false
    gameState.showLevelEditor = false
    gameState.showPathConfig = false
  }

  function toggleLevelSelector() {
    closeAllModals()
    gameState.showLevelSelector = true
  }

  function toggleLevelEditor() {
    closeAllModals()
    gameState.showToolkit = false
    gameState.showLevelEditor = true
    gameState.editingLevel = gameState.currentLevel
    initEditor()
  }

  function togglePathConfig() {
    closeAllModals()
    gameState.showPathConfig = true
  }

  // --- Keyboard ---
  function handleKeyPress(event) {
    const key = event.key.toLowerCase()

    if (key === 'enter' && !event.ctrlKey && !event.altKey) {
      event.preventDefault()
      if (gameState.currentLevel < gameState.totalLevels - 1) {
        nextLevel()
      }
      return
    }

    if (key === 'enter' && event.ctrlKey && !event.altKey) {
      event.preventDefault()
      if (gameState.currentLevel > 0) {
        prevLevel()
      }
      return
    }

    if (key === 'enter' && event.altKey && !event.ctrlKey) {
      event.preventDefault()
      toggleLevelSelector()
      return
    }

    if (key === 'backspace' && !event.ctrlKey && !event.altKey) {
      event.preventDefault()
      undo()
      return
    }

    if (key === ' ' && event.altKey && !event.ctrlKey) {
      event.preventDefault()
      toggleLevelEditor()
      return
    }

    if (key === ' ' && !event.altKey && !event.ctrlKey && !event.shiftKey) {
      event.preventDefault()
      restart()
      return
    }

    if (key === 'enter' && event.ctrlKey && event.shiftKey && !event.altKey) {
      event.preventDefault()
      toggleLevelSelector()
      return
    }

    if (!gameState.showLevelSelector && !gameState.showLevelEditor && !gameState.showPathConfig && !gameState.showSuccessModal) {
      switch (key) {
        case 'w':
        case 'arrowup':
          gameState.playerDirection = 'back'
          movePlayer(DIRECTIONS.UP)
          break
        case 's':
        case 'arrowdown':
          gameState.playerDirection = 'front'
          movePlayer(DIRECTIONS.DOWN)
          break
        case 'a':
        case 'arrowleft':
          gameState.playerDirection = 'left'
          movePlayer(DIRECTIONS.LEFT)
          break
        case 'd':
        case 'arrowright':
          gameState.playerDirection = 'right'
          movePlayer(DIRECTIONS.RIGHT)
          break
      }
    }
  }

  // --- Editor ---
  function initEditor() {
    const currentLevelData = levels[gameState.editingLevel]
    if (!currentLevelData) {
      console.error('Invalid level index:', gameState.editingLevel)
      return
    }
    gameState.editorRows = currentLevelData.length
    gameState.editorCols = currentLevelData[0] ? currentLevelData[0].length : 8
    gameState.editorMap = currentLevelData.map(row => [...row])
  }

  function updateEditorSize() {
    gameState.editorMap = Array(gameState.editorRows).fill(null).map(() =>
        Array(gameState.editorCols).fill(0)
    )
  }

  function setCellType(row, col, cellType) {
    gameState.editorMap[row][col] = cellType
  }

  // --- Drag & Drop ---
  function onDragStart(event, cellType) {
    gameState.draggingType = cellType
    event.dataTransfer.setData('text/plain', cellType.toString())
    event.dataTransfer.effectAllowed = 'copy'
    event.target.style.opacity = '0.7'
    showNotification(`正在拖拽 ${getCellTypeName(cellType)}，拖到地图格子上放置`, 'info', 2000)
  }

  function onDragEnd(event) {
    event.target.style.opacity = '1'
    gameState.draggingType = null
  }

  function onDragOver(event, row, col) {
    event.preventDefault()
    if (gameState.draggingFromCell) {
      event.dataTransfer.dropEffect = 'move'
    } else {
      event.dataTransfer.dropEffect = 'copy'
    }
    gameState.dragOverCell = `${row}-${col}`
  }

  function onDragLeave(event, row, col) {
    const rect = event.target.getBoundingClientRect()
    const x = event.clientX
    const y = event.clientY
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (gameState.dragOverCell === `${row}-${col}`) {
        gameState.dragOverCell = null
      }
    }
  }

  function onCellDragStart(event, row, col, cellType) {
    if (cellType === 0) return
    gameState.draggingCell = `${row}-${col}`
    gameState.draggingFromCell = {row, col, cellType}
    const sourceInfo = JSON.stringify({row, col, cellType})
    const dragData = `cell:${sourceInfo}`
    event.dataTransfer.setData('text/plain', dragData)
    event.dataTransfer.effectAllowed = 'move'
    event.target.style.opacity = '0.5'
    showNotification(`正在移动 ${getCellTypeName(cellType)}，拖到其他位置放置`, 'info', 2000)
  }

  function onCellDragEnd(event, row, col) {
    event.target.style.opacity = '1'
    gameState.draggingCell = null
    gameState.draggingFromCell = null
  }

  function onDrop(event, row, col) {
    event.preventDefault()
    gameState.dragOverCell = null

    const dragData = event.dataTransfer.getData('text/plain')

    if (dragData.startsWith('cell:')) {
      try {
        const sourceInfo = dragData.substring(5)
        const source = JSON.parse(sourceInfo)
        if (source.row === row && source.col === col) {
          showNotification('不能拖拽到自己上面', 'warning', 1500)
          return
        }
        setCellType(row, col, source.cellType)
        setCellType(source.row, source.col, 0)
        showNotification(`已将 ${getCellTypeName(source.cellType)} 从位置 (${source.row + 1}, ${source.col + 1}) 移动到 (${row + 1}, ${col + 1})`, 'success', 2000)
      } catch (error) {
        showNotification('拖拽数据解析失败', 'error', 1500)
      }
    } else {
      const cellType = parseInt(dragData)
      if (!isNaN(cellType)) {
        setCellType(row, col, cellType)
        showNotification(`已将 ${getCellTypeName(cellType)} 放置到位置 (${row + 1}, ${col + 1})`, 'success', 1500)
      } else {
        showNotification('无效的拖拽数据', 'warning', 1500)
      }
    }
  }

  // --- Toolkit ---
  function handleToolkitAction(action) {
    if (action === toggleLevelEditor) {
      gameState.showToolkit = false
    }
    action()
    if (action !== toggleLevelEditor) {
      setTimeout(() => {
        gameState.showToolkit = false
      }, 300)
    }
  }

  // --- Level Management ---
  function addNewLevel() {
    const newLevel = Array(gameState.editorRows).fill(null).map((_, row) =>
        Array(gameState.editorCols).fill(null).map((_, col) => {
          if (row === 0 || row === gameState.editorRows - 1 ||
              col === 0 || col === gameState.editorCols - 1) {
            return CELL_TYPES.WALL
          }
          if (row === 1 && col === 1) {
            return CELL_TYPES.PLAYER
          }
          return CELL_TYPES.EMPTY
        })
    )
    levels.push(newLevel)
    gameState.totalLevels = levels.length
    gameState.editingLevel = levels.length - 1
    initEditor()
    showNotification(`成功添加第 ${levels.length} 关！当前正在编辑新添加的关卡。`, 'success')
  }

  function copyCurrentLevel() {
    const currentLevel = levels[gameState.editingLevel]
    const copiedLevel = currentLevel.map(row => [...row])
    levels.push(copiedLevel)
    gameState.totalLevels = levels.length
    gameState.editingLevel = levels.length - 1
    initEditor()
    showNotification(`第 ${gameState.editingLevel + 1} 关已复制为第 ${levels.length} 关！当前正在编辑复制的关卡。`, 'success')
  }

  function insertLevel() {
    const newLevel = Array(gameState.editorRows).fill(null).map((_, row) =>
        Array(gameState.editorCols).fill(null).map((_, col) => {
          if (row === 0 || row === gameState.editorRows - 1 ||
              col === 0 || col === gameState.editorCols - 1) {
            return CELL_TYPES.WALL
          }
          if (row === 1 && col === 1) {
            return CELL_TYPES.PLAYER
          }
          return CELL_TYPES.EMPTY
        })
    )
    levels.splice(gameState.editingLevel + 1, 0, newLevel)
    gameState.totalLevels = levels.length
    gameState.editingLevel = gameState.editingLevel + 1
    initEditor()
    showNotification(`已在第 ${gameState.editingLevel + 1} 关之后插入新关卡！当前正在编辑第 ${gameState.editingLevel + 1} 关。`, 'success')
  }

  function deleteCurrentLevel() {
    if (levels.length <= 1) {
      showNotification('至少需要保留一个关卡！', 'warning')
      return
    }
    const levelNumber = gameState.editingLevel + 1
    const confirmDelete = confirm(`确定要删除第 ${levelNumber} 关吗？\n此操作不可恢复！`)
    if (confirmDelete) {
      levels.splice(gameState.editingLevel, 1)
      gameState.totalLevels = levels.length
      if (gameState.editingLevel >= levels.length) {
        gameState.editingLevel = levels.length - 1
      }
      if (gameState.currentLevel >= levels.length) {
        gameState.currentLevel = levels.length - 1
      }
      initEditor()
      showNotification(`第 ${levelNumber} 关已删除！当前编辑第 ${gameState.editingLevel + 1} 关。`, 'success')
    }
  }

  // --- File I/O ---
  async function getEnvironmentInfo() {
    if (!isElectron) return null
    try {
      return await window.electronAPI.getEnvironmentInfo()
    } catch (error) {
      console.error('获取环境信息失败：', error)
      return null
    }
  }

  async function testPathConnection() {
    if (!isElectron) {
      showNotification('测试失败：桌面环境不可用', 'error')
      return
    }
    try {
      const result = await window.electronAPI.testPath(gameState.levelFilePath || null)
      if (result.success) {
        showNotification('路径测试结果：' + result.message, 'info')
      } else {
        showNotification('测试失败：' + result.error, 'error')
      }
    } catch (error) {
      console.error('测试路径连接失败：', error)
      showNotification('测试失败：' + error.message, 'error')
    }
  }

  async function savePathConfig() {
    try {
      if (gameState.levelFilePath) {
        localStorage.setItem('levelFilePath', gameState.levelFilePath)
      }
      const success = await loadLevelsFromPath()
      if (success) {
        gameState.showPathConfig = false
        initGame(0)
        showNotification('路径配置保存成功！关卡数据已加载。', 'success')
      } else {
        showNotification('无法从配置的路径加载数据，使用默认配置。', 'warning')
      }
    } catch (error) {
      console.error('保存路径配置失败：', error)
      showNotification('保存配置失败：' + error.message, 'error')
    }
  }

  async function saveLevel() {
    levels[gameState.editingLevel] = gameState.editorMap.map(row => [...row])
    gameState.totalLevels = levels.length
    const success = await saveLevelsToPath()
    if (!success) {
      if (confirm('无法保存到配置的路径。是否要下载文件？')) {
        saveLevelsToServer()
      }
    }
    gameState.showLevelEditor = false
    initGame(gameState.editingLevel)
  }

  async function loadLevelsFromPath() {
    if (!isElectron) return false
    try {
      const result = await window.electronAPI.loadLevels(gameState.levelFilePath || null)
      if (result.success && result.levels && Array.isArray(result.levels)) {
        levels.splice(0, levels.length, ...result.levels)
        gameState.totalLevels = levels.length
        return true
      }
      return false
    } catch (error) {
      console.error('加载关卡数据失败：', error)
      return false
    }
  }

  async function loadLevelsFromServer() {
    if (!isElectron) {
      useDefaultLevels()
      return
    }
    try {
      const result = await window.electronAPI.loadLevels(null)
      if (result.success && result.levels && Array.isArray(result.levels)) {
        levels.splice(0, levels.length, ...result.levels)
        gameState.totalLevels = levels.length
      } else {
        useDefaultLevels()
      }
    } catch (error) {
      console.error('加载关卡数据失败：', error)
      useDefaultLevels()
    }
  }

  function useDefaultLevels() {
    levels.splice(0, levels.length,
        [
          [1, 1, 1, 1, 1, 1],
          [1, 0, 0, 0, 4, 1],
          [1, 0, 1, 2, 0, 1],
          [1, 2, 5, 3, 2, 1],
          [1, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1]
        ]
    )
    gameState.totalLevels = levels.length
  }

  async function saveLevelsToPath() {
    if (!isElectron) {
      saveLevelsToServer()
      return false
    }
    const levelData = {
      levels: levels,
      timestamp: new Date().toISOString()
    }
    try {
      const filePath = (gameState.levelFilePath && gameState.levelFilePath.trim()) ? gameState.levelFilePath : null
      const result = await window.electronAPI.saveLevels(levelData, filePath)
      if (result.success) {
        showNotification('关卡数据保存成功！', 'success')
        return true
      } else {
        showNotification('保存失败：' + result.error, 'error')
        return false
      }
    } catch (error) {
      console.error('保存关卡数据失败：', error)
      showNotification('保存失败：' + error.message, 'error')
      return false
    }
  }

  async function saveLevelsToServer() {
    const levelData = {
      levels: levels,
      timestamp: new Date().toISOString()
    }
    try {
      const dataStr = JSON.stringify(levelData, null, 2)
      const dataBlob = new Blob([dataStr], {type: 'application/json'})
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'levels.json'
      link.click()
      URL.revokeObjectURL(url)
      showNotification('关卡数据已下载！请将下载的 levels.json 文件替换到游戏目录的 public/levels.json，然后刷新页面即可看到更新的关卡。', 'success', 5000)
    } catch (error) {
      console.error('保存关卡数据失败：', error)
      showNotification('保存失败：' + error.message, 'error')
    }
  }

  function loadLevels(event) {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (data.levels && Array.isArray(data.levels)) {
            levels.splice(0, levels.length, ...data.levels)
            gameState.totalLevels = levels.length
            initGame(0)
            showNotification('关卡数据加载成功！', 'success')
          }
        } catch (error) {
          showNotification('加载关卡数据失败：' + error.message, 'error')
        }
      }
      reader.readAsText(file)
    }
  }

  // --- Cell Styles ---
  function getCellStyle(cell, row, col) {
    const isPlayerHere = gameState.playerPos.row === row && gameState.playerPos.col === col
    let backgroundImage = ''

    if (isPlayerHere) {
      const characterImage = `url(images/character_${gameState.playerDirection}.png)`
      if (cell === CELL_TYPES.TARGET || cell === CELL_TYPES.PLAYER_ON_TARGET) {
        backgroundImage = `${characterImage}, url(images/target.png)`
      } else {
        backgroundImage = characterImage
      }
    } else {
      if (cell === CELL_TYPES.WALL) {
        backgroundImage = 'url(images/wall.png)'
      } else if (cell === CELL_TYPES.TARGET) {
        backgroundImage = 'url(images/target.png)'
      } else if (cell === CELL_TYPES.BOX) {
        backgroundImage = 'url(images/box.png)'
      } else if (cell === CELL_TYPES.BOX_ON_TARGET) {
        backgroundImage = 'url(images/success.png)'
      }
    }

    return { backgroundImage }
  }

  function getCellTypeName(cellType) {
    const names = {
      [CELL_TYPES.EMPTY]: '空地',
      [CELL_TYPES.WALL]: '墙壁',
      [CELL_TYPES.TARGET]: '目标',
      [CELL_TYPES.BOX]: '箱子',
      [CELL_TYPES.PLAYER]: '玩家',
      [CELL_TYPES.BOX_ON_TARGET]: '箱子在目标',
      [CELL_TYPES.PLAYER_ON_TARGET]: '玩家在目标'
    }
    return names[cellType] || '未知'
  }

  function getEditorCellStyle(cellType) {
    const backgroundImages = {
      [CELL_TYPES.EMPTY]: '',
      [CELL_TYPES.WALL]: 'url(images/wall.png)',
      [CELL_TYPES.TARGET]: 'url(images/target.png)',
      [CELL_TYPES.BOX]: 'url(images/box.png)',
      [CELL_TYPES.PLAYER]: 'url(images/character_front.png)',
      [CELL_TYPES.BOX_ON_TARGET]: 'url(images/success.png)',
      [CELL_TYPES.PLAYER_ON_TARGET]: 'url(images/character_front.png), url(images/target.png)'
    }
    const colors = {
      [CELL_TYPES.EMPTY]: '#f5f5f5',
      [CELL_TYPES.WALL]: '#666666',
      [CELL_TYPES.TARGET]: '#ff6b6b',
      [CELL_TYPES.BOX]: '#4dabf7',
      [CELL_TYPES.PLAYER]: '#ffd43b',
      [CELL_TYPES.BOX_ON_TARGET]: '#40c057',
      [CELL_TYPES.PLAYER_ON_TARGET]: '#ff922b'
    }
    return {
      backgroundColor: colors[cellType] || '#ffffff',
      backgroundImage: backgroundImages[cellType] || '',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      border: '1px solid #ddd',
      color: cellType === CELL_TYPES.WALL ? '#ffffff' : '#333333'
    }
  }

  function getCellTypeButtonStyle(cellType) {
    const backgroundImages = {
      [CELL_TYPES.EMPTY]: '',
      [CELL_TYPES.WALL]: 'url(images/wall.png)',
      [CELL_TYPES.TARGET]: 'url(images/target.png)',
      [CELL_TYPES.BOX]: 'url(images/box.png)',
      [CELL_TYPES.PLAYER]: 'url(images/character_front.png)',
      [CELL_TYPES.BOX_ON_TARGET]: 'url(images/success.png)',
      [CELL_TYPES.PLAYER_ON_TARGET]: 'url(images/character_front.png), url(images/target.png)'
    }
    const colors = {
      [CELL_TYPES.EMPTY]: '#f5f5f5',
      [CELL_TYPES.WALL]: '#666666',
      [CELL_TYPES.TARGET]: '#ff6b6b',
      [CELL_TYPES.BOX]: '#4dabf7',
      [CELL_TYPES.PLAYER]: '#ffd43b',
      [CELL_TYPES.BOX_ON_TARGET]: '#40c057',
      [CELL_TYPES.PLAYER_ON_TARGET]: '#ff922b'
    }
    return {
      backgroundColor: colors[cellType] || '#ffffff',
      backgroundImage: backgroundImages[cellType] || '',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center'
    }
  }

  // --- Success Detection ---
  function startSuccessCountdown() {
    gameState.showSuccessModal = true
    gameState.countdown = 3

    gameState.countdownInterval = setInterval(() => {
      gameState.countdown--
      if (gameState.countdown <= 0) {
        clearInterval(gameState.countdownInterval)
        gameState.countdownInterval = null
        if (gameState.currentLevel < gameState.totalLevels - 1) {
          nextLevel()
        }
      }
    }, 1000)

    gameState.autoAdvanceTimer = setTimeout(() => {
      if (gameState.countdownInterval) {
        clearInterval(gameState.countdownInterval)
        gameState.countdownInterval = null
      }
      if (gameState.currentLevel < gameState.totalLevels - 1) {
        nextLevel()
      }
    }, 3000)
  }

  const isLevelComplete = computed(() => {
    let targetCount = 0
    for (let row = 0; row < gameState.originalLevel.length; row++) {
      for (let col = 0; col < gameState.originalLevel[row].length; col++) {
        if (gameState.originalLevel[row][col] === CELL_TYPES.TARGET ||
            gameState.originalLevel[row][col] === CELL_TYPES.PLAYER_ON_TARGET ||
            gameState.originalLevel[row][col] === CELL_TYPES.BOX_ON_TARGET) {
          targetCount++
        }
      }
    }
    let completedTargets = 0
    for (let row = 0; row < gameState.map.length; row++) {
      for (let col = 0; col < gameState.map[row].length; col++) {
        if (gameState.map[row][col] === CELL_TYPES.BOX_ON_TARGET) {
          completedTargets++
        }
      }
    }
    return completedTargets === targetCount
  })

  watch(isLevelComplete, (newValue) => {
    if (newValue && !gameState.levelCompleted && !gameState.showSuccessModal && !gameState.justSwitchedLevel) {
      gameState.levelCompleted = true
      gameState.successTimeout = setTimeout(() => {
        if (gameState.levelCompleted && !gameState.showSuccessModal) {
          startSuccessCountdown()
        }
      }, 500)
    }
  })

  // --- Lifecycle ---
  function setupLifecycle() {
    onMounted(async () => {
      const envInfo = await getEnvironmentInfo()
      if (envInfo) {
        console.log('环境信息:', envInfo)
        if (!localStorage.getItem('levelFilePath')) {
          showNotification(`使用默认路径: ${envInfo.paths.defaultLevelsFile}`, 'info', 5000)
        }
      }
      const savedPath = localStorage.getItem('levelFilePath')
      if (savedPath) {
        gameState.levelFilePath = savedPath
      }
      const success = await loadLevelsFromPath()
      if (!success) {
        await loadLevelsFromServer()
      }
      initGame()
      window.addEventListener('keydown', handleKeyPress)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyPress)
    })
  }

  return {
    gameState,
    levels,
    isLevelComplete,
    // notifications
    showNotification,
    hideNotification,
    // game controls
    initGame,
    movePlayer,
    undo,
    restart,
    nextLevel,
    prevLevel,
    goToLevel,
    // modals
    toggleLevelSelector,
    toggleLevelEditor,
    togglePathConfig,
    // keyboard
    handleKeyPress,
    // editor
    initEditor,
    updateEditorSize,
    setCellType,
    // drag & drop
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onCellDragStart,
    onCellDragEnd,
    onDrop,
    // toolkit
    handleToolkitAction,
    // level management
    addNewLevel,
    copyCurrentLevel,
    insertLevel,
    deleteCurrentLevel,
    // file I/O
    saveLevel,
    loadLevels,
    testPathConnection,
    savePathConfig,
    // styles
    getCellStyle,
    getCellTypeName,
    getEditorCellStyle,
    getCellTypeButtonStyle,
    // success
    startSuccessCountdown,
    // lifecycle
    setupLifecycle
  }
}
