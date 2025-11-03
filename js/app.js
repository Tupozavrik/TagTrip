// ===== ОСНОВНАЯ ЛОГИКА ПРИЛОЖЕНИЯ TAGTRIP С ИНТЕГРАЦИЕЙ КАРТЫ =====

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
        if (path.includes('route-john-lenin.html')) return 'route-map';
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
            completedRoutes: [],
            currentRoute: null,
            routeStartTime: null
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
        // Обновленные данные маршрутов с поддержкой карт
        this.routes = [
            {
                id: 'historical',
                name: 'Джон Ленин',
                description: 'Прогулка по главным историческим местам Омска',
                distance: 2.5,
                duration: 45,
                difficulty: 'easy',
                hasMap: true, // Карта доступна
                mapUrl: 'route-john-lenin.html',
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
                    },
                    {
                        name: 'Литературный музей им. Ф.М. Достоевского',
                        lat: 54.9901,
                        lon: 73.3678,
                        description: 'Музей, посвященный пребыванию писателя в Омске'
                    }
                ],
                rewards: [
                    {
                        type: 'coffee',
                        partner: 'Кофейня "Центральная"',
                        discount: 15,
                        code: 'JOHNLENIN15'
                    }
                ]
            },
            {
                id: 'parks',
                name: 'Старая Роща',
                description: 'Зеленые зоны и места для отдыха',
                distance: 3.2,
                duration: 60,
                difficulty: 'medium',
                hasMap: false, // Карта пока не готова
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
                name: 'Шаги по Омке',
                description: 'Музеи, театры и культурные центры',
                distance: 4.1,
                duration: 75,
                difficulty: 'medium',
                hasMap: false, // Карта пока не готова
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

        // Обработка свайпов
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
            this.hapticFeedback('light');
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
            case 'route-map':
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
        // Если есть активный маршрут, открываем его карту
        if (this.userStats.currentRoute) {
            const route = this.routes.find(r => r.id === this.userStats.currentRoute);
            if (route && route.hasMap) {
                this.navigate(route.mapUrl);
                return;
            }
        }
        // Иначе открываем карту первого доступного маршрута
        const routeWithMap = this.routes.find(r => r.hasMap);
        if (routeWithMap) {
            this.navigate(routeWithMap.mapUrl);
        } else {
            this.showAlert('🗺️ Карты маршрутов скоро будут доступны!');
        }
    }

    openRewards() {
        this.hapticFeedback('medium');
        this.navigate('rewards.html');
    }

    openProfile() {
        this.hapticFeedback('medium');
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
            if (route.hasMap) {
                // Если карта доступна, открываем её
                localStorage.setItem('selectedRoute', JSON.stringify(route));
                this.navigate(route.mapUrl);
            } else {
                // Иначе показываем уведомление
                this.showAlert(`🔜 Карта маршрута "${route.name}" скоро будет готова!`);
            }
        }
    }

    navigate(page) {
        if (window.telegramApp) {
            window.telegramApp.hapticFeedback('light');
        }
        window.location.href = page;
    }

    // Методы для работы с маршрутами
    startRoute(routeId) {
        const route = this.routes.find(r => r.id === routeId);
        if (!route) return;

        this.userStats.currentRoute = routeId;
        this.userStats.routeStartTime = new Date().toISOString();
        this.saveUserStats();
        
        this.hapticFeedback('success');
        this.showAlert(`🚀 Начат маршрут "${route.name}"! Следуйте к первой точке.`);
    }

    stopRoute() {
        this.userStats.currentRoute = null;
        this.userStats.routeStartTime = null;
        this.saveUserStats();
        
        this.hapticFeedback('light');
        this.showAlert('⏸️ Маршрут остановлен.');
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

        // Сбрасываем текущий маршрут
        this.userStats.currentRoute = null;
        this.userStats.routeStartTime = null;

        // Разблокируем награды
        this.unlockReward(routeId);

        this.saveUserStats();
        this.updateStats();
        
        this.hapticFeedback('success');
        this.showAlert(`🎉 Поздравляем! Маршрут "${route.name}" завершен!`);
    }

    checkRouteProgress(userLat, userLon) {
        if (!this.userStats.currentRoute) return;

        const route = this.routes.find(r => r.id === this.userStats.currentRoute);
        if (!route) return;

        // Проверяем близость к точкам маршрута
        route.points.forEach((point, index) => {
            const distance = this.calculateDistance(userLat, userLon, point.lat, point.lon);
            
            // Если пользователь в радиусе 100 метров от точки
            if (distance < 0.1 && !this.userStats.visitedPlaces.includes(`${route.id}_${index}`)) {
                // Отмечаем точку как посещенную
                this.userStats.visitedPlaces.push(`${route.id}_${index}`);
                this.saveUserStats();
                
                this.hapticFeedback('success');
                this.showAlert(`✅ Точка достигнута: ${point.name}!`);

                // Проверяем, все ли точки посещены
                const visitedCount = this.userStats.visitedPlaces.filter(p => p.startsWith(route.id)).length;
                if (visitedCount >= route.points.length) {
                    setTimeout(() => this.completeRoute(route.id), 1000);
                }
            }
        });
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Радиус Земли в км
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Вспомогательные методы
    hapticFeedback(type = 'light') {
        if (window.telegramApp) {
            window.telegramApp.hapticFeedback(type);
        }
    }

    showAlert(message) {
        if (window.telegramApp) {
            window.telegramApp.showAlert(message);
        } else {
            alert(message);
        }
    }

    showUserProfile() {
        const user = this.userData;
        const stats = this.userStats;
        
        const message = `
👤 ${user.first_name}
📊 Статистика:
🚶‍♂️ Маршрутов пройдено: ${stats.routesCompleted}
📏 Расстояние: ${stats.distanceWalked.toFixed(1)} км
🎁 Наград получено: ${stats.rewardsEarned}
${stats.currentRoute ? `\n🗺️ Текущий маршрут: ${this.routes.find(r => r.id === stats.currentRoute)?.name || 'Неизвестный'}` : ''}
        `.trim();

        this.showAlert(message);
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

    // Геолокация
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
                        lon: position.coords.longitude,
                        accuracy: position.coords.accuracy
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

function startRoute(routeId) {
    if (window.tagTripApp) window.tagTripApp.startRoute(routeId);
}

function stopRoute() {
    if (window.tagTripApp) window.tagTripApp.stopRoute();
}