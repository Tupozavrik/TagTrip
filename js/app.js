// ===== ОСНОВНАЯ ЛОГИКА ПРИЛОЖЕНИЯ TAGTRIP =====

class TagTripApp {
    constructor() {
        this.currentPage = this.getCurrentPageName();
        this.userData = this.getUserData();
        this.routes = [];
        this.userStats = this.loadUserStats();
        this.init();
    }

    init() {
        console.log('Инициализация TagTrip App');
        this.loadRoutes();
        this.updateStats();
        this.setupEventListeners();
        this.updateNavigation();
    }

    getCurrentPageName() {
        const path = window.location.pathname;
        if (path.includes('routes.html')) return 'routes';
        if (path.includes('map.html')) return 'map';
        if (path.includes('rewards.html')) return 'rewards';
        return 'home';
    }

    getUserData() {
        if (window.telegramApp) {
            return window.telegramApp.getUserData();
        }
        return {
            id: 'demo_user',
            first_name: 'Demo User',
            username: 'demo'
        };
    }

    loadUserStats() {
        const savedStats = localStorage.getItem('tagtrip_stats');
        if (savedStats) {
            return JSON.parse(savedStats);
        }
        return {
            routesCompleted: 0,
            distanceWalked: 0,
            rewardsEarned: 0,
            visitedPlaces: [],
            completedRoutes: []
        };
    }

    saveUserStats() {
        localStorage.setItem('tagtrip_stats', JSON.stringify(this.userStats));
    }

    updateStats() {
        const routesElement = document.getElementById('routesCompleted');
        const distanceElement = document.getElementById('distanceWalked');
        const rewardsElement = document.getElementById('rewardsEarned');

        if (routesElement) routesElement.textContent = this.userStats.routesCompleted;
        if (distanceElement) distanceElement.textContent = this.userStats.distanceWalked.toFixed(1);
        if (rewardsElement) rewardsElement.textContent = this.userStats.rewardsEarned;
    }

    loadRoutes() {
        // Демо данные маршрутов Омска
        this.routes = [
            {
                id: 'historical',
                name: 'Исторический центр',
                description: 'Прогулка по главным историческим местам Омска',
                distance: 2.5,
                duration: 45,
                difficulty: 'easy',
                points: [
                    {
                        name: 'Омская крепость',
                        lat: 54.9924,
                        lon: 73.3686,
                        description: 'Историческое сердце Омска'
                    },
                    {
                        name: 'Успенский собор',
                        lat: 54.9889,
                        lon: 73.3745,
                        description: 'Главный православный храм города'
                    },
                    {
                        name: 'Драматический театр',
                        lat: 54.9876,
                        lon: 73.3712,
                        description: 'Старейший театр Сибири'
                    }
                ],
                rewards: [
                    {
                        type: 'coffee',
                        partner: 'Кофейня "Центральная"',
                        discount: 15,
                        code: 'HISTORY15'
                    }
                ]
            },
            {
                id: 'parks',
                name: 'Парки и скверы',
                description: 'Зеленые зоны и места для отдыха',
                distance: 3.2,
                duration: 60,
                difficulty: 'medium',
                points: [
                    {
                        name: 'Парк им. 30-летия ВЛКСМ',
                        lat: 54.9967,
                        lon: 73.3197,
                        description: 'Любимое место отдыха омичей'
                    },
                    {
                        name: 'Парк Победы',
                        lat: 54.9854,
                        lon: 73.3298,
                        description: 'Мемориальный комплекс'
                    },
                    {
                        name: 'Сквер им. Дзержинского',
                        lat: 54.9923,
                        lon: 73.3456,
                        description: 'Уютный сквер в центре города'
                    }
                ],
                rewards: [
                    {
                        type: 'restaurant',
                        partner: 'Ресторан "Парк"',
                        discount: 20,
                        code: 'PARKS20'
                    }
                ]
            },
            {
                id: 'cultural',
                name: 'Культурные объекты',
                description: 'Музеи, театры и культурные центры',
                distance: 4.1,
                duration: 75,
                difficulty: 'medium',
                points: [
                    {
                        name: 'Музыкальный театр',
                        lat: 54.9823,
                        lon: 73.3689,
                        description: 'Омский государственный музыкальный театр'
                    },
                    {
                        name: 'Краеведческий музей',
                        lat: 54.9901,
                        lon: 73.3678,
                        description: 'История Омского Прииртышья'
                    },
                    {
                        name: 'Концертный зал',
                        lat: 54.9856,
                        lon: 73.3734,
                        description: 'Омская филармония'
                    }
                ],
                rewards: [
                    {
                        type: 'theatre',
                        partner: 'Театр "5-й театр"',
                        discount: 25,
                        code: 'CULTURE25'
                    }
                ]
            }
        ];
    }

    setupEventListeners() {
        // Предотвращаем случайные переходы
        document.addEventListener('click', (e) => {
            if (e.target.closest('button') || e.target.closest('a')) {
                this.hapticFeedback('light');
            }
        });

        // Обработка свайпов (для будущего функционала)
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Свайп влево
                this.hapticFeedback('light');
            } else {
                // Свайп вправо
                this.hapticFeedback('light');
            }
        }
    }

    updateNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        // Определяем активную кнопку
        let activeIndex = 0;
        switch (this.currentPage) {
            case 'home': activeIndex = 0; break;
            case 'routes': activeIndex = 1; break;
            case 'map': activeIndex = 2; break;
            case 'rewards': activeIndex = 3; break;
        }

        if (navButtons[activeIndex]) {
            navButtons[activeIndex].classList.add('active');
        }
    }

    // Методы навигации
    openRoutes() {
        this.hapticFeedback('medium');
        this.navigate('routes.html');
    }

    openMap() {
        this.hapticFeedback('medium');
        this.navigate('map.html');
    }

    openRewards() {
        this.hapticFeedback('medium');
        this.navigate('rewards.html');
    }

    openProfile() {
        this.hapticFeedback('medium');
        // Пока просто показываем статистику
        this.showUserProfile();
    }

    goHome() {
        this.hapticFeedback('light');
        this.navigate('index.html');
    }

    openRoute(routeId) {
        this.hapticFeedback('medium');
        const route = this.routes.find(r => r.id === routeId);
        if (route) {
            localStorage.setItem('selectedRoute', JSON.stringify(route));
            this.navigate(`route-details.html?id=${routeId}`);
        }
    }

    navigate(page) {
        if (window.telegramApp) {
            window.telegramApp.hapticFeedback('light');
        }
        window.location.href = page;
    }

    // Вспомогательные методы
    hapticFeedback(type = 'light') {
        if (window.telegramApp) {
            window.telegramApp.hapticFeedback(type);
        }
    }

    showUserProfile() {
        const user = this.userData;
        const stats = this.userStats;
        
        const message = `
👤 ${user.first_name}
📊 Статистика:
🚶‍♂️ Маршрутов пройдено: ${stats.routesCompleted}
📏 Расстояние: ${stats.distanceWalked} км
🎁 Наград получено: ${stats.rewardsEarned}
        `.trim();

        if (window.telegramApp) {
            window.telegramApp.showAlert(message);
        } else {
            alert(message);
        }
    }

    // Работа с наградами
    unlockReward(routeId) {
        const route = this.routes.find(r => r.id === routeId);
        if (!route) return;

        route.rewards.forEach(reward => {
            if (!this.userStats.unlockedRewards) {
                this.userStats.unlockedRewards = [];
            }

            const rewardData = {
                ...reward,
                routeId: routeId,
                unlockedAt: new Date().toISOString()
            };

            this.userStats.unlockedRewards.push(rewardData);
            this.userStats.rewardsEarned++;
        });

        this.saveUserStats();
        this.updateStats();
        this.hapticFeedback('success');
    }

    completeRoute(routeId) {
        const route = this.routes.find(r => r.id === routeId);
        if (!route) return;

        // Обновляем статистику
        this.userStats.routesCompleted++;
        this.userStats.distanceWalked += route.distance;
        
        if (!this.userStats.completedRoutes.includes(routeId)) {
            this.userStats.completedRoutes.push(routeId);
        }

        // Разблокируем награды
        this.unlockReward(routeId);

        this.saveUserStats();
        this.updateStats();
    }

    // Геолокация (заглушка для будущего функционала)
    getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Геолокация не поддерживается'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                error => reject(error),
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    }
}

// Глобальная инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.tagTripApp = new TagTripApp();
});

// Глобальные функции для использования в HTML
function openRoutes() {
    if (window.tagTripApp) window.tagTripApp.openRoutes();
}

function openMap() {
    if (window.tagTripApp) window.tagTripApp.openMap();
}

function openRewards() {
    if (window.tagTripApp) window.tagTripApp.openRewards();
}

function openProfile() {
    if (window.tagTripApp) window.tagTripApp.openProfile();
}

function goHome() {
    if (window.tagTripApp) window.tagTripApp.goHome();
}

function openRoute(routeId) {
    if (window.tagTripApp) window.tagTripApp.openRoute(routeId);
}