const sectionIcons = {
    'Программное обеспечение': 'fa-box',
    'Предварительный этап': 'fa-tools',
    'Этап настроек решений': 'fa-cogs',
    'Этап интеграции': 'fa-plug',
    'Этап доработок': 'fa-wrench',
    'Завершающий этап': 'fa-flag-checkered',
    'default': 'fa-file-alt'
};

const defaultSections = [
    {id: 'section-0', title: 'Программное обеспечение', tasks: [
        {id: 'task-0', text: 'Лицензии Битрикс', completed: false, description: 'Приобретение необходимых лицензий Битрикс для проекта.'},
        {id: 'task-1', text: 'Лицензии Corbit', completed: false, description: 'Приобретение необходимых лицензий Corbit для проекта.'}
    ], order: 0},
    {id: 'section-1', title: 'Предварительный этап', tasks: [
        {id: 'task-2', text: 'Настройка сервера', completed: false, description: 'Установка и конфигурирование веб-сервера, настройка SSL-сертификатов.'}
    ], order: 1},
    {id: 'section-2', title: 'Этап настроек решений', tasks: [
        {id: 'task-3', text: 'Настройка Corbit', completed: false, description: 'Базовая настройка Corbit под требования проекта.'}
    ], order: 2},
    {id: 'section-3', title: 'Этап интеграции', tasks: [
        {id: 'task-4', text: 'Интеграция с ТС', completed: false, description: 'Настройка интеграции с торговыми системами.'}
    ], order: 3},
    {id: 'section-4', title: 'Этап доработок', tasks: [
        {id: 'task-5', text: 'Оптимизация сайта', completed: false, description: 'Оптимизация скорости загрузки страниц и повышение производительности.'}
    ], order: 4},
    {id: 'section-5', title: 'Завершающий этап', tasks: [
        {id: 'task-6', text: 'Сдача проекта', completed: false, description: 'Финальное тестирование и сдача проекта заказчику.'}
    ], order: 5}
];

let isLocked = false;
let sections = JSON.parse(localStorage.getItem('roadmap')) || JSON.parse(JSON.stringify(defaultSections));
let cssContent = localStorage.getItem('roadmapCss') || '';
let projectTitle = localStorage.getItem('projectTitle') || 'Дорожная карта проекта';

// --- Форматирование текста ---
function initRichTextEditor(element, contentType, sectionId, taskId) {
    if (isLocked) return;
    
    // Создаем панель инструментов форматирования
    const toolbar = document.createElement('div');
    toolbar.className = 'formatting-toolbar';
    toolbar.innerHTML = `
        <button type="button" data-command="bold" title="Жирный"><i class="fas fa-bold"></i></button>
        <button type="button" data-command="italic" title="Курсив"><i class="fas fa-italic"></i></button>
        <button type="button" data-command="createLink" title="Ссылка"><i class="fas fa-link"></i></button>
    `;
    
    // Вставляем панель инструментов перед элементом
    element.parentNode.insertBefore(toolbar, element);
    
    // Добавляем обработчики событий для кнопок форматирования
    toolbar.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            const command = this.dataset.command;
            
            if (command === 'createLink') {
                const selection = window.getSelection();
                if (selection.toString().length > 0) {
                    const url = prompt('Введите URL-адрес:', 'https://');
                    if (url) {
                        document.execCommand('createLink', false, url);
                        // Сохраняем изменения после форматирования
                        saveFormattedContent(element, contentType, sectionId, taskId);
                    }
                } else {
                    alert('Пожалуйста, сначала выделите текст для создания ссылки.');
                }
            } else {
                document.execCommand(command, false, null);
                // Сохраняем изменения после форматирования
                saveFormattedContent(element, contentType, sectionId, taskId);
            }
        });
    });
    
    // Делаем элемент редактируемым
    element.contentEditable = true;
    element.classList.add('rich-text-editor');
    
    // Сохраняем изменения при потере фокуса
    element.addEventListener('blur', function() {
        saveFormattedContent(element, contentType, sectionId, taskId);
    });
}

function saveFormattedContent(element, contentType, sectionId, taskId) {
    const content = element.innerHTML;
    
    if (contentType === 'task-text') {
        updateTaskHTML(sectionId, taskId, content);
    } else if (contentType === 'task-description') {
        updateTaskDescriptionHTML(sectionId, taskId, content);
    } else if (contentType === 'section-title') {
        updateSectionTitleHTML(sectionId, content);
    } else if (contentType === 'project-title') {
        projectTitle = content;
        localStorage.setItem('projectTitle', content);
    }
}

function updateTaskHTML(sectionId, taskId, newHTML) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        const task = section.tasks.find(t => t.id === taskId);
        if (task) {
            task.text = newHTML;
            saveToLocalStorage();
        }
    }
}

function updateTaskDescriptionHTML(sectionId, taskId, newHTML) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        const task = section.tasks.find(t => t.id === taskId);
        if (task) {
            task.description = newHTML;
            saveToLocalStorage();
        }
    }
}

function updateSectionTitleHTML(sectionId, newHTML) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        section.title = newHTML;
        saveToLocalStorage();
    }
}

// --- CSS-редактор ---
async function loadCssFromFile() {
    try {
        const response = await fetch('roadmap-styles.css');
        if (response.ok) {
            cssContent = await response.text();
            document.getElementById('cssEditorTextarea').value = cssContent;
            
            // Сохраняем в localStorage
            localStorage.setItem('roadmapCss', cssContent);
            return cssContent;
        } else {
            console.error('Не удалось загрузить CSS-файл:', response.status);
            showCssUploadPrompt();
            return null;
        }
    } catch (error) {
        console.error('Ошибка при загрузке CSS-файла:', error);
        showCssUploadPrompt();
        return null;
    }
}

// Добавляем новую функцию для показа диалога загрузки CSS
function showCssUploadPrompt() {
    const cssEditor = document.getElementById('cssEditorContainer');
    cssEditor.style.display = 'block';
    
    // Показываем сообщение пользователю
    const cssTextarea = document.getElementById('cssEditorTextarea');
    cssTextarea.value = '/* Не удалось загрузить CSS. Пожалуйста, вставьте содержимое CSS файла вручную и нажмите "Применить изменения". */';
    
    // Меняем кнопку "Показать CSS" на "Скрыть CSS"
    const showBtn = document.getElementById('showCssBtn');
    showBtn.innerHTML = '<i class="fas fa-code-slash"></i> Скрыть CSS';
    
    // Предупреждение пользователю
    alert('Не удалось загрузить CSS файл. Пожалуйста, вставьте содержимое CSS файла вручную в редактор и нажмите "Применить изменения".');
}

function saveCustomCss() {
    const cssTextarea = document.getElementById('cssEditorTextarea');
    cssContent = cssTextarea.value;
    localStorage.setItem('roadmapCss', cssContent);
    alert('CSS успешно сохранен!');
}

function toggleCssEditor() {
    const cssEditor = document.getElementById('cssEditorContainer');
    const isHidden = cssEditor.style.display === 'none' || !cssEditor.style.display;
    cssEditor.style.display = isHidden ? 'block' : 'none';
    
    const showBtn = document.getElementById('showCssBtn');
    showBtn.innerHTML = isHidden ? 
        '<i class="fas fa-code-slash"></i> Скрыть CSS' : 
        '<i class="fas fa-code"></i> Редактировать CSS';
}

function loadInitialCss() {
    // Пытаемся загрузить CSS из localStorage
    const savedCss = localStorage.getItem('roadmapCss');
    
    if (savedCss) {
        // Если есть сохраненный CSS, используем его
        cssContent = savedCss;
        document.getElementById('cssEditorTextarea').value = cssContent;
    } else {
        // Иначе загружаем из файла
        loadCssFromFile().then(result => {
            if (!result) {
                // Если загрузка не удалась, showCssUploadPrompt уже будет вызван внутри loadCssFromFile
                console.log('Ошибка загрузки CSS файла, предложена ручная загрузка');
            }
        });
    }
}

// --- Основные функции ---
function renderSections() {
    const container = document.getElementById('roadmapContainer');
    container.innerHTML = '';
	
    
    // Обновляем заголовок проекта
    const pageTitle = document.getElementById('projectTitle');
    if (pageTitle) {
        pageTitle.innerHTML = projectTitle;
        
        if (!isLocked) {
            // Инициализируем редактор для заголовка проекта, если он ещё не инициализирован
            if (!pageTitle.classList.contains('rich-text-editor')) {
                initRichTextEditor(pageTitle, 'project-title');
            }
        } else {
            // Удаляем редактор, если страница заблокирована
            pageTitle.contentEditable = false;
            const toolbar = pageTitle.parentNode.querySelector('.formatting-toolbar');
            if (toolbar) {
                toolbar.remove();
            }
        }
    }
    
    sections.sort((a, b) => a.order - b.order).forEach(section => {
        const sectionEl = document.createElement('div');
        sectionEl.className = 'stage';
        
        const sectionContent = document.createElement('div');
        sectionContent.className = 'stage-content';
        
        // Используем div вместо input для заголовка раздела
        const sectionHeader = `
            <div class="stage-header">
                <div class="section-icon">
                    <i class="fas ${sectionIcons[section.title] || sectionIcons.default}"></i>
                </div>
                <div class="section-title" id="section-title-${section.id}">${section.title}</div>
                ${!isLocked ? `
                <div class="move-buttons">
                    <button onclick="moveSection('${section.id}', 'up')"><i class="fas fa-chevron-up"></i></button>
                    <button onclick="moveSection('${section.id}', 'down')"><i class="fas fa-chevron-down"></i></button>
                    <button onclick="deleteSection('${section.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>` : ''}
            </div>
        `;
        
        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'tasks';
        
        section.tasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = 'task';
            taskEl.dataset.taskid = task.id;
            
            // Используем div вместо input для текста задачи
            taskEl.innerHTML = `
                <div class="task-content" id="task-text-${task.id}">${task.text}</div>
                <div class="task-description">
                    <div class="task-description-content" id="task-desc-${task.id}">${task.description || ''}</div>
                </div>
                ${!isLocked ? `
                <div class="task-controls">
                    <button onclick="deleteTask('${section.id}', '${task.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>` : ''}
            `;
            
            tasksContainer.appendChild(taskEl);
        });
        
        sectionContent.innerHTML = sectionHeader;
        sectionContent.appendChild(tasksContainer);
        
        if (!isLocked) {
            const addTaskBtn = document.createElement('button');
            addTaskBtn.className = 'add-task-btn';
            addTaskBtn.innerHTML = '<i class="fas fa-plus"></i> Добавить задачу';
            addTaskBtn.onclick = function() { addTask(section.id); };
            sectionContent.appendChild(addTaskBtn);
        }
        
        sectionEl.appendChild(sectionContent);
        container.appendChild(sectionEl);
    });
    
    // Инициализируем rich text editor для всех редактируемых элементов
    if (!isLocked) {
        sections.forEach(section => {
            // Инициализируем редактор для заголовка раздела
            const sectionTitleEl = document.getElementById(`section-title-${section.id}`);
            if (sectionTitleEl) {
                initRichTextEditor(sectionTitleEl, 'section-title', section.id);
            }
            
            // Инициализируем редакторы для задач
            section.tasks.forEach(task => {
                const taskTextEl = document.getElementById(`task-text-${task.id}`);
                if (taskTextEl) {
                    initRichTextEditor(taskTextEl, 'task-text', section.id, task.id);
                }
                
                const taskDescEl = document.getElementById(`task-desc-${task.id}`);
                if (taskDescEl) {
                    initRichTextEditor(taskDescEl, 'task-description', section.id, task.id);
                }
            });
        });
    }
}

function toggleLock() {
    isLocked = !isLocked;
    const lockBtn = document.querySelector('.lock-btn');
    lockBtn.innerHTML = isLocked ? '<i class="fas fa-unlock"></i> Открепить' : '<i class="fas fa-lock"></i> Закрепить';
    lockBtn.classList.toggle('locked', isLocked);
    renderSections();
}

function createNewSection() {
    if (isLocked) return;
    const newSection = {
        id: 'section-' + Date.now(),
        title: 'Новый раздел',
        tasks: [],
        order: sections.length
    };
    sections.push(newSection);
    saveToLocalStorage();
    renderSections();
}

function moveSection(sectionId, direction) {
    const index = sections.findIndex(s => s.id === sectionId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
        [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
    } else if (direction === 'down' && index < sections.length - 1) {
        [sections[index + 1], sections[index]] = [sections[index], sections[index + 1]];
    }

    sections.forEach((section, idx) => section.order = idx);
    saveToLocalStorage();
    renderSections();
}

function deleteSection(sectionId) {
    sections = sections.filter(s => s.id !== sectionId);
    sections.forEach((section, idx) => section.order = idx);
    saveToLocalStorage();
    renderSections();
}

function addTask(sectionId) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        section.tasks.push({
            id: `task-${Date.now()}`,
            text: 'Новая задача',
            completed: false,
            description: 'Описание новой задачи'
        });
        saveToLocalStorage();
        renderSections();
    }
}

function deleteTask(sectionId, taskId) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        section.tasks = section.tasks.filter(t => t.id !== taskId);
        saveToLocalStorage();
        renderSections();
    }
}
// --- Пользовательское контекстное меню для форматирования ---
let contextMenuEl = null;

// Удалить меню при клике в любом месте
document.addEventListener('click', () => {
    if (contextMenuEl) {
        contextMenuEl.remove();
        contextMenuEl = null;
    }
});

function createContextMenu(x, y, editorEl) {
    // Если уже есть — удаляем
    if (contextMenuEl) contextMenuEl.remove();

    // Создаём контейнер меню
    contextMenuEl = document.createElement('div');
    contextMenuEl.className = 'custom-context-menu';
    contextMenuEl.style.top = `${y}px`;
    contextMenuEl.style.left = `${x}px`;

    // Опции меню
    const items = [
        { cmd: 'bold', label: 'Жирный' },
        { cmd: 'italic', label: 'Курсив' },
        { cmd: 'createLink', label: 'Ссылка' }
    ];

    items.forEach(({cmd, label}) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'custom-context-menu__item';
        itemEl.textContent = label;
        itemEl.addEventListener('click', () => {
            if (cmd === 'createLink') {
                const url = prompt('Введите URL-адрес:', 'https://');
                if (url) document.execCommand('createLink', false, url);
            } else {
                document.execCommand(cmd, false, null);
            }
            // Сохраняем содержимое после команды
            editorEl.blur(); editorEl.focus();
            contextMenuEl.remove(); contextMenuEl = null;
        });
        contextMenuEl.appendChild(itemEl);
    });

    document.body.appendChild(contextMenuEl);
}

// Навешиваем обработчик на каждый rich-text элемент
function enableCustomContextMenu() {
    document.querySelectorAll('.rich-text-editor').forEach(el => {
        el.addEventListener('contextmenu', ev => {
            ev.preventDefault();
            const sel = window.getSelection();
            // Показываем только если текст выделен
            if (sel.toString().length > 0) {
                createContextMenu(ev.pageX, ev.pageY, el);
            }
        });
    });
}

// После рендера разделов и инициализации редакторов — включаем меню
// Добавить в конец функции renderSections():
//    enableCustomContextMenu();

// --- Экспорт "красивой" версии ---
function exportBeautifulVersion() {
    // Проверка наличия CSS
    if (!cssContent || cssContent.trim() === '') {
        alert('CSS не загружен. Пожалуйста, загрузите CSS файл перед экспортом.');
        showCssUploadPrompt();
        return;
    }

    // Стили для экспорта (скрытие элементов управления)
    const cleanStyles = `
        button, .move-buttons, .add-task-btn, .task-controls, .formatting-toolbar { 
            display: none !important; 
        }
        [contenteditable="true"] {
            outline: none !important;
            border: none !important;
        }
        .section-title {
            border-bottom: none !important;
            pointer-events: none !important;
            display: block !important;
        }
        .task {
            padding-left: 1.2rem !important;
            cursor: pointer !important;
        }
        .task-description {
            max-height: 0 !important;
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
            transition: all 0.3s ease !important;
        }
        .task:hover .task-description {
            max-height: 500px !important;
            padding: 0.8rem !important;
            margin-top: 1rem !important;
            border-top: 1px dashed #cbd5e1 !important;
        }
    `;

    // Генерация HTML
    const roadmapContent = sections.map(section => `
        <div class="stage">
            <div class="stage-content">
                <div class="stage-header">
                    <div class="section-icon">
                        <i class="fas ${sectionIcons[section.title] || sectionIcons.default}"></i>
                    </div>
                    <h3 class="section-title">${section.title}</h3>
                </div>
                <div class="tasks">
                    ${section.tasks.map(task => `
                        <div class="task">
                            <div class="task-content">${task.text}</div>
                            <div class="task-description">
                                <div class="task-description-content">${task.description}</div>                                        
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // Используем сохранённый или загруженный CSS
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <title>Роадмап snsg.ru</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            <style>
                ${cssContent}
                ${cleanStyles}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>${projectTitle}</h1>
                <div class="roadmap">${roadmapContent}</div>
            </div>
        </body>
        </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'roadmap-export.html';
    link.click();
}

// --- Сброс к дефолту ---
function resetToDefault() {
    if (confirm('Вы уверены? Все данные будут удалены!')) {
        localStorage.removeItem('roadmap');
        localStorage.removeItem('projectTitle');
        projectTitle = 'Дорожная карта проекта';
        sections = JSON.parse(JSON.stringify(defaultSections));
        renderSections();
    }
}

// --- Сохранение данных ---
function saveToLocalStorage() {
    localStorage.setItem('roadmap', JSON.stringify(sections));
}

// --- Инициализация ---
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем CSS
    loadInitialCss();
    
    // Инициализация UI
    renderSections();
    
    // Подключаем обработчики событий
    document.querySelector('.lock-btn').addEventListener('click', toggleLock);
    document.querySelector('.add-section-btn').addEventListener('click', createNewSection);
    document.querySelector('.export-btn').addEventListener('click', exportBeautifulVersion);
    document.querySelector('.reset-btn').addEventListener('click', resetToDefault);
    document.querySelector('#showCssBtn').addEventListener('click', toggleCssEditor);
    document.querySelector('#hideCssBtn').addEventListener('click', toggleCssEditor);
    document.querySelector('#reloadCssBtn').addEventListener('click', loadCssFromFile);
    document.querySelector('#saveCssBtn').addEventListener('click', saveCustomCss);
});