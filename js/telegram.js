// ===== ИНТЕГРАЦИЯ С TELEGRAM WEBAPP =====

class TelegramApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.init();
    }

    init() {
        if (!this.tg) {
            console.warn('Telegram WebApp не обнаружен. Запускаем в режиме отладки.');
            this.initDebugMode();
            return;
        }

        // Инициализация WebApp
        this.tg.ready();
        this.tg.expand();
        
        // Применение темы
        this.applyTelegramTheme();
        
        // Настройка кнопок
        this.setupBackButton();
        this.setupMainButton();
        
        // Привязка CSS переменных viewport
        this.bindViewportVars();
        
        // Обработчики событий
        this.setupEventHandlers();

        console.log('Telegram WebApp инициализирован');
    }

    initDebugMode() {
        // Режим отладки для браузера
        window.Telegram = {
            WebApp: {
                ready: () => {},
                expand: () => {},
                themeParams: {
                    bg_color: '#ffffff',
                    text_color: '#000000',
                    hint_color: '#999999',
                    link_color: '#2481cc',
                    button_color: '#40a7e3',
                    button_text_color: '#ffffff'
                },
                viewportWidth: 375,
                viewportHeight: 800,
                viewportStableHeight: 750,
                BackButton: {
                    show: () => {},
                    hide: () => {},
                    onClick: () => {}
                },
                MainButton: {
                    show: () => {},
                    hide: () => {},
                    setText: () => {},
                    onClick: () => {}
                },
                HapticFeedback: {
                    impactOccurred: () => {},
                    notificationOccurred: () => {},
                    selectionChanged: () => {}
                },
                close: () => console.log('Закрытие приложения'),
                sendData: (data) => console.log('Отправка данных:', data)
            }
        };
        this.tg = window.Telegram.WebApp;
    }

    applyTelegramTheme() {
        const theme = this.tg.themeParams;
        if (!theme) return;

        const root = document.documentElement;
        
        // Применяем цвета темы Telegram
        if (theme.bg_color) root.style.setProperty('--tg-theme-bg-color', theme.bg_color);
        if (theme.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color);
        if (theme.text_color) root.style.setProperty('--tg-theme-text-color', theme.text_color);
        if (theme.hint_color) root.style.setProperty('--tg-theme-hint-color', theme.hint_color);
        if (theme.link_color) root.style.setProperty('--tg-theme-link-color', theme.link_color);
        if (theme.button_color) root.style.setProperty('--tg-theme-button-color', theme.button_color);
        if (theme.button_text_color) root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);

        // Определяем темную тему
        const isDark = this.isColorDark(theme.bg_color || '#ffffff');
        if (isDark) {
            document.body.setAttribute('data-theme', 'dark');
        }
    }

    bindViewportVars() {
        if (!this.tg.viewport?.bindCssVars) return;
        
        try {
            this.tg.viewport.bindCssVars();
        } catch (e) {
            // Фоллбэк для старых версий
            const root = document.documentElement;
            root.style.setProperty('--tg-viewport-width', `${this.tg.viewportWidth || 375}px`);
            root.style.setProperty('--tg-viewport-height', `${this.tg.viewportHeight || 800}px`);
            root.style.setProperty('--tg-viewport-stable-height', `${this.tg.viewportStableHeight || 750}px`);
        }
    }

    setupBackButton() {
        // Скрываем кнопку "Назад" на главной странице
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            this.tg.BackButton.hide();
        } else {
            this.tg.BackButton.show();
            this.tg.BackButton.onClick(() => {
                this.goBack();
            });
        }
    }

    setupMainButton() {
        // Настройка главной кнопки (можно использовать для CTA действий)
        this.tg.MainButton.hide();
    }

    setupEventHandlers() {
        // Обработка изменения размеров окна
        window.addEventListener('resize', () => {
            this.bindViewportVars();
        });

        // Обработка изменения темы
        if (this.tg.onEvent) {
            this.tg.onEvent('themeChanged', () => {
                this.applyTelegramTheme();
            });
        }
    }

    // Утилиты
    isColorDark(hexColor) {
        if (!hexColor) return false;
        const color = hexColor.replace('#', '');
        const r = parseInt(color.substr(0, 2), 16);
        const g = parseInt(color.substr(2, 2), 16);
        const b = parseInt(color.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 128;
    }

    // Методы навигации
    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
        }
    }

    // Методы взаимодействия
    showMainButton(text, callback) {
        this.tg.MainButton.setText(text);
        this.tg.MainButton.show();
        this.tg.MainButton.onClick(callback);
    }

    hideMainButton() {
        this.tg.MainButton.hide();
    }

    sendData(data) {
        this.tg.sendData(JSON.stringify(data));
    }

    showAlert(message) {
        if (this.tg.showAlert) {
            this.tg.showAlert(message);
        } else {
            alert(message);
        }
    }

    showConfirm(message, callback) {
        if (this.tg.showConfirm) {
            this.tg.showConfirm(message, callback);
        } else {
            const result = confirm(message);
            callback(result);
        }
    }

    // Вибрация
    hapticFeedback(type = 'light') {
        if (this.tg.HapticFeedback) {
            switch (type) {
                case 'light':
                    this.tg.HapticFeedback.impactOccurred('light');
                    break;
                case 'medium':
                    this.tg.HapticFeedback.impactOccurred('medium');
                    break;
                case 'heavy':
                    this.tg.HapticFeedback.impactOccurred('heavy');
                    break;
                case 'success':
                    this.tg.HapticFeedback.notificationOccurred('success');
                    break;
                case 'error':
                    this.tg.HapticFeedback.notificationOccurred('error');
                    break;
                case 'warning':
                    this.tg.HapticFeedback.notificationOccurred('warning');
                    break;
            }
        }
    }

    // Получение данных пользователя
    getUserData() {
        if (!this.tg.initDataUnsafe?.user) {
            return {
                id: 'demo_user',
                first_name: 'Demo',
                username: 'demo'
            };
        }
        return this.tg.initDataUnsafe.user;
    }

    // Проверка платформы
    isPlatform(platform) {
        return this.tg.platform === platform;
    }

    // Получение версии
    getVersion() {
        return this.tg.version || '6.0';
    }
}

// Глобальная инициализация
window.telegramApp = new TelegramApp();

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TelegramApp;
}