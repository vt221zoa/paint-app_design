document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d', {willReadFrequently: true});
    const colorPicker = document.getElementById('colorPicker');
    const colorPickerBody = document.getElementById('colorPickerBody');
    const colorCodeInput = document.getElementById('colorCodeInput');
    const sizePicker = document.getElementById('sizePicker');
    const clearCanvasButton = document.getElementById('clearCanvas');
    const saveCanvasButton = document.getElementById('saveCanvas');
    const brushToolButton = document.getElementById('brushTool');
    const eraserToolButton = document.getElementById('eraserTool');
    const sprayToolButton = document.getElementById('sprayTool');
    const sizeLabel = document.getElementById('sizeLabel');
    const paletteContainer = document.querySelector('.palette');
    const palette = [
        "#000000", "#2D2D2D", "#5B5B5B", "#878787", "#B2B2B2", "#E0E0E0", "#FFFFFF",
        "#FF0000", "#FF6A00", "#FFD800", "#00FF21", "#0094FF", "#0026FF", "#B200FF",
        "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF",
        "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF",
        "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF",
        "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF",
    ]

    let painting = false;
    let tool = 'brush';
    let colorIndex = 0;
    let undoStack = [];
    const MAX_UNDO_STEPS = 20;

    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

    function updatePalette() {
        paletteContainer.innerHTML = "";
        paletteContainer.append(...palette.map((color, idx) => {
            const unit = document.createElement("div")
            unit.classList.add("paletteUnit")
            if (idx === colorIndex) {
                unit.classList.add("current")
                colorPickerBody.style.backgroundColor = color
                colorPicker.value = color
                colorCodeInput.value = color
            }
            unit.style.backgroundColor = color
            unit.onclick = () => {
                colorIndex = idx;
                updatePalette()
            }
            return unit
        }))
    }

    updatePalette()

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

    const toolCallbacks = {
        "brush": function (e) {
            ctx.lineWidth = sizePicker.value;
            ctx.lineCap = 'round';
            ctx.strokeStyle = palette[colorIndex];

            ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        },
        "eraser": function (e) {
            ctx.lineWidth = sizePicker.value;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#ffffff';

            ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        },
        "spray": function (e) {
            ctx.fillStyle = palette[colorIndex];
            for (let i = 0; i < 10; i++) {
                const offsetX = Math.random() * sizePicker.value - sizePicker.value / 2;
                const offsetY = Math.random() * sizePicker.value - sizePicker.value / 2;
                ctx.fillRect(e.clientX - canvas.offsetLeft + offsetX, e.clientY - canvas.offsetTop + offsetY, 1, 1);
            }
        }
    }

    function draw(e) {
        if (!painting) {
            return;
        }

        toolCallbacks[tool](e)
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

    colorPicker.addEventListener('input', () => {
        setActiveTool('brush', brushToolButton);
        palette[colorIndex] = colorPicker.value
        updatePalette()
    });

    sizePicker.addEventListener('input', () => {
        sizeLabel.innerHTML = sizePicker.value
    });

    colorCodeInput.addEventListener("input", () => {
        if(!/^#([0-9A-Fa-f]{0,6})$/.test(colorCodeInput.value)){
            console.log("Bruh")
            colorCodeInput.value = palette[colorIndex]
            return
        }
        setActiveTool('brush', brushToolButton);
        palette[colorIndex] = colorCodeInput.value
        updatePalette()
    })

    setActiveTool('brush', brushToolButton);
});
