document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const colorPicker = document.getElementById('colorPicker');
    const sizePicker = document.getElementById('sizePicker');
    const clearCanvasButton = document.getElementById('clearCanvas');
    const saveCanvasButton = document.getElementById('saveCanvas');
    const brushToolButton = document.getElementById('brushTool');
    const eraserToolButton = document.getElementById('eraserTool');
    const sprayToolButton = document.getElementById('sprayTool');
    const fillToolButton = document.getElementById('fillTool');
    const toolInfo = document.getElementById('toolInfo');

    let painting = false;
    let tool = 'brush';
    let undoStack = [];
    const MAX_UNDO_STEPS = 20;

    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

    function startPosition(e) {
        painting = true;
        draw(e);
    }

    function endPosition() {
        if (painting) {
            undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            if (undoStack.length > MAX_UNDO_STEPS) {
                undoStack.shift();
            }
        }
        painting = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!painting) {
            return;
        }
    
        switch (tool) {
            case 'brush':
                drawBrush(e);
                break;
            case 'eraser':
                drawEraser(e);
                break;
            case 'spray':
                drawSpray(e);
                break;
            case 'fill':
                fill(e);
                break;
            default:
                break;
        }
    }
    
    function drawBrush(e) {
        ctx.lineWidth = sizePicker.value;
        ctx.lineCap = 'round';
        ctx.strokeStyle = colorPicker.value;
    
        ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    }
    
    function drawEraser(e) {
        ctx.lineWidth = sizePicker.value;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#ffffff';
    
        ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    }
    
    function drawSpray(e) {
        ctx.fillStyle = colorPicker.value;
        for (let i = 0; i < 10; i++) {
            const offsetX = Math.random() * sizePicker.value - sizePicker.value / 2;
            const offsetY = Math.random() * sizePicker.value - sizePicker.value / 2;
            ctx.fillRect(e.clientX - canvas.offsetLeft + offsetX, e.clientY - canvas.offsetTop + offsetY, 1, 1);
        }
    }

    function fill(e) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixelStack = [{ x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop }];
        const fillColor = hexToRgb(colorPicker.value);
        const targetColor = ctx.getImageData(pixelStack[0].x, pixelStack[0].y, 1, 1).data;
    
        function hexToRgb(hex) {
            return {
                r: parseInt(hex.substring(1, 3), 16),
                g: parseInt(hex.substring(3, 5), 16),
                b: parseInt(hex.substring(5, 7), 16)
            };
        }
    
        function matchColor(pixelPos) {
            const r = imageData.data[pixelPos];
            const g = imageData.data[pixelPos + 1];
            const b = imageData.data[pixelPos + 2];
            return r === targetColor[0] && g === targetColor[1] && b === targetColor[2];
        }
    
        function setColor(pixelPos) {
            imageData.data[pixelPos] = fillColor.r;
            imageData.data[pixelPos + 1] = fillColor.g;
            imageData.data[pixelPos + 2] = fillColor.b;
            imageData.data[pixelPos + 3] = 255; 
        }
    
        let isEmpty = true;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i + 3] !== 0) {
                isEmpty = false;
                break;
            }
        }
    
        if (isEmpty) {
            ctx.fillStyle = colorPicker.value;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            return;
        }
    
        while (pixelStack.length) {
            const newPos = pixelStack.pop();
            const x = newPos.x;
            let y = newPos.y;
            let pixelPos = (y * canvas.width + x) * 4;
    
            while (y-- >= 0 && matchColor(pixelPos)) {
                pixelPos -= canvas.width * 4;
            }
            pixelPos += canvas.width * 4;
            ++y;
    
            let reachLeft = false;
            let reachRight = false;
    
            while (y++ < canvas.height - 1 && matchColor(pixelPos)) {
                setColor(pixelPos);
    
                if (x > 0) {
                    if (matchColor(pixelPos - 4)) {
                        if (!reachLeft) {
                            pixelStack.push({ x: x - 1, y: y });
                            reachLeft = true;
                        }
                    } else if (reachLeft) {
                        reachLeft = false;
                    }
                }
    
                if (x < canvas.width - 1) {
                    if (matchColor(pixelPos + 4)) {
                        if (!reachRight) {
                            pixelStack.push({ x: x + 1, y: y });
                            reachRight = true;
                        }
                    } else if (reachRight) {
                        reachRight = false;
                    }
                }
    
                pixelPos += canvas.width * 4;
            }
        }
    
        ctx.putImageData(imageData, 0, 0);
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        undoStack = [];
    }

    function saveCanvas() {
        const link = document.createElement('a');
        link.download = 'painting.png';
        link.href = canvas.toDataURL();
        link.click();
    }

    function undoLastAction() {
        if (undoStack.length > 1) {
            undoStack.pop();
            const imageData = undoStack[undoStack.length - 1];
            ctx.putImageData(imageData, 0, 0);
        } else {
            alert("Більше не можна повернути дії. Стан збережений зараз.");
        }
    }

    function setActiveTool(newTool, button) {
        tool = newTool;
        document.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        updateToolInfo();
    }

    function updateToolInfo() {
        toolInfo.textContent = `Tool: ${tool.charAt(0).toUpperCase() + tool.slice(1)}, Size: ${sizePicker.value}`;
    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mousemove', draw);
    clearCanvasButton.addEventListener('click', clearCanvas);
    saveCanvasButton.addEventListener('click', saveCanvas);

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'z') {
            undoLastAction();
        }
    });

    brushToolButton.addEventListener('click', () => {
        setActiveTool('brush', brushToolButton);
    });

    eraserToolButton.addEventListener('click', () => {
        setActiveTool('eraser', eraserToolButton);
    });

    sprayToolButton.addEventListener('click', () => {
        setActiveTool('spray', sprayToolButton);
    });

    fillToolButton.addEventListener('click', () => {
        setActiveTool('fill', fillToolButton);
    });

    colorPicker.addEventListener('input', () => {
        setActiveTool('brush', brushToolButton);
    });

    sizePicker.addEventListener('input', updateToolInfo);

    setActiveTool('brush', brushToolButton);
    updateToolInfo();
}); 
