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

// --- Основные функции ---
function renderSections() {
    const container = document.getElementById('roadmapContainer');
    container.innerHTML = '';
    
    sections.sort((a, b) => a.order - b.order).forEach(section => {
        const sectionEl = document.createElement('div');
        sectionEl.className = 'stage';
        
        const sectionContent = document.createElement('div');
        sectionContent.className = 'stage-content';
        
        sectionContent.innerHTML = `
            <div class="stage-header">
                <div class="section-icon">
                    <i class="fas ${sectionIcons[section.title] || sectionIcons.default}"></i>
                </div>
                <input class="section-title" value="${section.title}" ${isLocked ? 'disabled' : ''}
                       oninput="updateSectionTitle('${section.id}', this.value)">
                ${!isLocked ? `
                <div class="move-buttons">
                    <button onclick="moveSection('${section.id}', 'up')"><i class="fas fa-chevron-up"></i></button>
                    <button onclick="moveSection('${section.id}', 'down')"><i class="fas fa-chevron-down"></i></button>
                    <button onclick="deleteSection('${section.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>` : ''}
            </div>
            <div class="tasks">
                ${section.tasks.map(task => `
                    <div class="task" data-taskid="${task.id}">
                        <input type="checkbox" ${task.completed ? 'checked' : ''}
                               onchange="toggleTask('${section.id}', '${task.id}')">
                        <input type="text" value="${task.text}" ${isLocked ? 'disabled' : ''}
                               oninput="updateTaskText('${section.id}', '${task.id}', this.value)">
                        ${task.description ? `
                        <div class="task-description">
                            <p>${task.description}</p>
                        </div>` : ''}
                    </div>
                `).join('')}
            </div>
            ${!isLocked ? `
            <button class="add-task-btn" onclick="addTask('${section.id}')">
                <i class="fas fa-plus"></i> Добавить задачу
            </button>` : ''}
        `;
        
        sectionEl.appendChild(sectionContent);
        container.appendChild(sectionEl);
    });
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

function updateSectionTitle(sectionId, newTitle) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        section.title = newTitle;
        saveToLocalStorage();
    }
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

function updateTaskText(sectionId, taskId, newText) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        const task = section.tasks.find(t => t.id === taskId);
        if (task) {
            task.text = newText;
            saveToLocalStorage();
        }
    }
}

function toggleTask(sectionId, taskId) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        const task = section.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            saveToLocalStorage();
        }
    }
}

// --- Экспорт "красивой" версии ---
function exportBeautifulVersion() {
    // Получаем актуальные стили из файла CSS
    const fetchCssAndExport = async () => {
        try {
            // Пытаемся получить содержимое CSS файла
            const cssResponse = await fetch('roadmap-styles.css');
            const originalStyles = await cssResponse.text();
            
            // Стили для экспорта (скрытие элементов управления)
            const cleanStyles = `
                input[type="checkbox"], input[type="text"], button, .move-buttons, .add-task-btn { 
                    display: none !important; 
                }
                .section-title {
                    border-bottom: none !important;
                    pointer-events: none !important;
                    display: block !important;
                }
                .task {
                    padding-left: 1.2rem !important;
                }
                .task-description {
                    max-height: none !important;
                    padding: 0.8rem !important;
                    margin-top: 1rem !important;
                    border-top: 1px dashed #cbd5e1 !important;
                    display: block !important;
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
                                    ${task.description ? `
                                    <div class="task-description">
                                        <p>${task.description}</p>
                                        <p>Статус: <strong>${task.completed ? 'Выполнено' : 'В процессе'}</strong></p>
                                    </div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `).join('');

            const htmlContent = `
                <!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8">
                    <title>Роадмап snsg.ru</title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                    <style>
                        ${originalStyles}
                        ${cleanStyles}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Дорожная карта проекта</h1>
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
            
        } catch (error) {
            console.error('Ошибка при получении CSS файла:', error);
            // Если не удалось получить CSS файл, используем встроенные стили как запасной вариант
            fallbackExport();
        }
    };
    
    // Запасной вариант экспорта со встроенными стилями
    const fallbackExport = () => {
        // Оригинальные стили (встроены вручную)
        const originalStyles = `
            * {
                box-sizing: border-box;
                font-family: 'Segoe UI', sans-serif;
                margin: 0;
                padding: 0;
            }

            body {
                background: #f0f4f8;
                color: #334155;
                padding: 2rem;
                line-height: 1.6;
            }

            .container {
                max-width: 1200px;
                margin: 0 auto;
            }

            h1 {
                text-align: center;
                margin-bottom: 2rem;
                color: #1e40af;
                font-size: 2rem;
            }

            .roadmap {
                max-width: 1000px;
                margin: 0 auto;
                position: relative;
            }

            .roadmap::before {
                content: '';
                position: absolute;
                top: 0;
                bottom: 0;
                left: 50px;
                width: 6px;
                background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
                border-radius: 3px;
            }

            .stage {
                margin-bottom: 2.5rem;
                margin-left: 80px;
                position: relative;
            }

            .stage::before {
                content: '';
                position: absolute;
                left: -46px;
                top: 20px;
                width: 24px;
                height: 24px;
                background: white;
                border: 4px solid #3b82f6;
                border-radius: 50%;
                z-index: 1;
            }

            .stage-content {
                background: white;
                border-radius: 16px;
                padding: 1.5rem;
                box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
                transition: all 0.4s ease;
            }

            .stage-content:hover {
                transform: translateY(-5px) translateX(10px);
                box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
            }

            .stage-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1.5rem;
                border-bottom: 2px dashed #e5e7eb;
                padding-bottom: 1rem;
            }

            .section-icon {
                width: 54px;
                height: 54px;
                background: linear-gradient(45deg, #3b82f6, #8b5cf6);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5em;
                box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
            }

            .section-title {
                font-weight: 700;
                font-size: 1.5em;
                color: #1e3a8a;
                flex-grow: 1;
            }

            .tasks {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 1rem;
            }

            .task {
                background: #f8fafc;
                border-radius: 12px;
                padding: 1.2rem;
                position: relative;
                overflow: hidden;
                border-bottom: 3px solid #3b82f6;
            }

            .task-content {
                font-weight: 500;
            }

            .task-description {
                background: rgba(255,255,255,0.9);
                margin-top: 1rem;
                padding: 0.8rem;
                border-top: 1px dashed #cbd5e1;
                border-radius: 8px;
            }

            @media (max-width: 768px) {
                body { padding: 1rem; }
                .roadmap::before { left: 25px; }
                .stage { margin-left: 50px; }
                .stage::before { left: -36px; }
                .tasks {
                    grid-template-columns: 1fr;
                }
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
                                ${task.description ? `
                                <div class="task-description">
                                    <p>${task.description}</p>
                                    <p>Статус: <strong>${task.completed ? 'Выполнено' : 'В процессе'}</strong></p>
                                </div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <title>Роадмап snsg.ru</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                <style>
                    ${originalStyles}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Дорожная карта проекта</h1>
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
    };

    // Запускаем основную функцию экспорта
    fetchCssAndExport();
}

// --- Сброс к дефолту ---
function resetToDefault() {
    if (confirm('Вы уверены? Все данные будут удалены!')) {
        localStorage.removeItem('roadmap');
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
    renderSections();
    document.querySelector('.lock-btn').addEventListener('click', toggleLock);
    document.querySelector('.add-section-btn').addEventListener('click', createNewSection);
    document.querySelector('.export-btn').addEventListener('click', exportBeautifulVersion);
    document.querySelector('.reset-btn').addEventListener('click', resetToDefault);
});