# 🤖 TagTrip Telegram Bot

import asyncio
import logging
from datetime import datetime
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.types.web_app_info import WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder

# Конфигурация
BOT_TOKEN = '8354286497:AAFZdvgqHTw4DNe1gzYQ2pcoCkygRDe8iK8'
WEBAPP_URL = 'https://tupozavrik.github.io/TagTrip/'  # Обнови после загрузки на GitHub Pages

# Создаем объекты Bot и Dispatcher
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Данные о маршрутах для бота
ROUTES_INFO = {
    'historical': {
        'name': '🏛️ Джон Ленин',
        'description': 'Прогулка по главным историческим местам Омска',
        'distance': '2.5 км',
        'time': '45 мин',
        'difficulty': '🟢 Легкий'
    },
    'parks': {
        'name': '🌳 Старая Роща',
        'description': 'Зеленые зоны и места для отдыха',
        'distance': '3.2 км', 
        'time': '60 мин',
        'difficulty': '🟡 Средний'
    },      
    'cultural': {
        'name': '🏞️ Шаги по Омке',
        'description': 'Музеи, театры и культурные центры',
        'distance': '4.1 км',
        'time': '75 мин', 
        'difficulty': '🟡 Средний'
    }
}

def get_main_keyboard():
    """Создает основную клавиатуру с WebApp"""
    keyboard = types.ReplyKeyboardMarkup(
        keyboard=[
            [types.KeyboardButton(
                text='🗺️ Открыть TagTrip',
                web_app=WebAppInfo(url=WEBAPP_URL)
            )],
            [
                types.KeyboardButton(text='📍 Маршруты'),
                types.KeyboardButton(text='🎁 Мои награды')
            ],
            [
                types.KeyboardButton(text='ℹ️ Помощь'),
                types.KeyboardButton(text='📊 Статистика')
            ]
        ],
        resize_keyboard=True,
        one_time_keyboard=False
    )
    return keyboard

def get_routes_keyboard():
    """Создает inline клавиатуру с маршрутами"""
    builder = InlineKeyboardBuilder()
    
    for route_id, route_info in ROUTES_INFO.items():
        builder.add(InlineKeyboardButton(
            text=route_info['name'],
            callback_data=f"route_{route_id}"
        ))
    
    builder.add(InlineKeyboardButton(
        text='🗺️ Открыть в приложении',
        web_app=WebAppInfo(url=WEBAPP_URL)
    ))
    
    builder.adjust(1)  # По одной кнопке в ряд
    return builder.as_markup()

@dp.message(CommandStart())
async def cmd_start(message: Message):
    """Обработчик команды /start"""
    user_name = message.from_user.first_name or "друг"
    
    welcome_text = f"""
🗺️ **Добро пожаловать в TagTrip, {user_name}!**

Исследуйте красивые места Омска по готовым маршрутам и получайте промокоды от наших партнеров!

🎯 **Что умеет бот:**
• 📍 Показать доступные маршруты
• 🧭 Запустить навигацию по городу  
• 🎁 Выдать промокоды за пройденные маршруты
• 📊 Вести статистику ваших прогулок

**Нажмите "🗺️ Открыть TagTrip" чтобы начать!**
    """
    
    await message.answer(
        welcome_text,
        reply_markup=get_main_keyboard(),
        parse_mode="Markdown"
    )

@dp.message(Command("help"))
async def cmd_help(message: Message):
    """Обработчик команды /help"""
    help_text = """
🆘 **Помощь по TagTrip**

**🗺️ Как пользоваться:**
1. Нажмите "🗺️ Открыть TagTrip" для запуска приложения
2. Выберите маршрут который хотите пройти
3. Следуйте указаниям навигации
4. Получите промокод по завершении!

**📍 Доступные маршруты:**
• 🏛️ Джон Ленин (2.5 км, 45 мин)
• 🌳 Старая Роща (3.2 км, 60 мин)  
• 🏞️ Шаги по Омке (4.1 км, 75 мин)

**🎁 Награды:**
За каждый пройденный маршрут вы получаете промокоды на скидки в кофейнях, ресторанах и развлекательных заведениях Омска.

**❓ Возникли вопросы?**
Пишите @zxcwed
    """
    
    await message.answer(help_text, parse_mode="Markdown")

@dp.message(F.text == "📍 Маршруты")
async def show_routes(message: Message):
    """Показать список маршрутов"""
    routes_text = "🗺️ **Доступные маршруты по Омску:**\n\nВыберите маршрут для подробной информации:"
    
    await message.answer(
        routes_text,
        reply_markup=get_routes_keyboard(),
        parse_mode="Markdown"
    )

@dp.message(F.text == "🎁 Мои награды")
async def show_rewards(message: Message):
    """Показать награды пользователя"""
    # В реальном приложении здесь был бы запрос к базе данных
    rewards_text = """
🎁 **Ваши награды**

🏆 **Статистика:**
• Пройдено маршрутов: 0
• Получено промокодов: 0
• Общее расстояние: 0 км

📱 **Активные промокоды:**
_Пройдите маршрут чтобы получить промокоды!_

Откройте приложение для получения наград! 👇
    """
    
    keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
        [types.InlineKeyboardButton(
            text="🗺️ Открыть TagTrip", 
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]
    ])
    
    await message.answer(
        rewards_text,
        reply_markup=keyboard,
        parse_mode="Markdown"
    )

@dp.message(F.text == "📊 Статистика")  
async def show_stats(message: Message):
    """Показать статистику пользователя"""
    user_id = message.from_user.id
    user_name = message.from_user.first_name or "Пользователь"
    
    stats_text = f"""
📊 **Статистика {user_name}**

🚶‍♂️ **Активность:**
• Маршрутов завершено: 0
• Километров пройдено: 0.0
• Времени потрачено: 0 мин

🏆 **Достижения:**
• Исследователь: 🔒 (пройдите 3 маршрута)
• Турист: 🔒 (пройдите 10 км)
• Коллекционер: 🔒 (соберите 5 промокодов)

📅 **Последняя активность:** Никогда

ID: `{user_id}`
    """
    
    await message.answer(stats_text, parse_mode="Markdown")

@dp.message(F.text == "ℹ️ Помощь")
async def help_info(message: Message):
    """Обработчик кнопки помощи"""
    await cmd_help(message)

@dp.callback_query(F.data.startswith("route_"))
async def route_callback(callback: types.CallbackQuery):
    """Обработчик выбора маршрута"""
    route_id = callback.data.replace("route_", "")
    
    if route_id not in ROUTES_INFO:
        await callback.answer("❌ Маршрут не найден")
        return
        
    route = ROUTES_INFO[route_id]
    
    route_text = f"""
{route['name']}

📝 **Описание:** {route['description']}
📏 **Расстояние:** {route['distance']}
⏱️ **Время:** {route['time']}  
💪 **Сложность:** {route['difficulty']}

**Что вас ждет:**
• Красивые виды и фотозоны
• Интересные факты о местах
• Навигация с подсказками
• Промокоды от партнеров

**Готовы отправиться в путь?**
    """
    
    keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
        [types.InlineKeyboardButton(
            text="🚀 Начать маршрут", 
            web_app=WebAppInfo(url=f"{WEBAPP_URL}?route={route_id}")
        )],
        [types.InlineKeyboardButton(
            text="🔙 Назад к маршрутам",
            callback_data="show_routes"
        )]
    ])
    
    await callback.message.edit_text(
        route_text,
        reply_markup=keyboard,
        parse_mode="Markdown"
    )
    await callback.answer()

@dp.callback_query(F.data == "show_routes")
async def routes_callback(callback: types.CallbackQuery):
    """Возврат к списку маршрутов"""
    routes_text = "🗺️ **Доступные маршруты по Омску:**\n\nВыберите маршрут для подробной информации:"
    
    await callback.message.edit_text(
        routes_text,
        reply_markup=get_routes_keyboard(),
        parse_mode="Markdown"
    )
    await callback.answer()

@dp.message()
async def handle_other_messages(message: Message):
    """Обработчик остальных сообщений"""
    responses = [
        "🤔 Не понимаю эту команду. Используйте кнопки меню!",
        "📱 Для полного функционала откройте приложение TagTrip!",
        "🗺️ Выберите маршрут или откройте приложение для навигации."
    ]
    
    import random
    await message.answer(
        random.choice(responses),
        reply_markup=get_main_keyboard()
    )

async def main():
    """Основная функция запуска бота"""
    # Логирование
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger = logging.getLogger(__name__)
    logger.info("🚀 Запуск TagTrip бота...")
    
    # Очистка вебхуков и запуск поллинга
    await bot.delete_webhook(drop_pending_updates=True)
    
    # Установка команд меню
    await bot.set_my_commands([
        types.BotCommand(command="start", description="🏠 Главное меню"),
        types.BotCommand(command="help", description="ℹ️ Помощь"),
    ])
    
    logger.info("✅ TagTrip бот успешно запущен!")
    
    # Запуск поллинга
    await dp.start_polling(bot)

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("🛑 TagTrip бот остановлен")
    except Exception as e:
        print(f"❌ Ошибка: {e}")