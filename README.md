# HealthHub UZ - AI-Powered Healthcare Platform

AI-quvvatli tibbiy platforma O'zbekiston uchun.

## Features

- 🤖 **AI Shifokor** - Simptomlarni AI yordamida tahlil qilish
- 📅 **Qabullar** - Shifokorlarga onlayn qabul yozilish
- 💊 **Dorilar** - Dorixonalar va dori narxlarini taqqoslash
- 🏥 **Shifoxonalar** - Yaqin atrofdagi shifoxonalarni topish
- 💬 **Chat** - Shifokor bilan real vaqtda suhbat
- 🌡️ **Havo Sifati** - Tibbiy holatga mos havo sifati monitoring
- 📊 **Analitika** - Sog'lik ko'rsatkichlari va statistika
- 📄 **Tibbiy Hujjatlar** - Tahlillar va retseptlarni saqlash

## Tech Stack

### Backend
- Django 5.2.7
- Django REST Framework
- PostgreSQL / SQLite
- Google Gemini AI
- Channels (WebSocket)
- JWT Authentication

### Frontend
- React + TypeScript
- Vite
- TailwindCSS
- Axios
- React Router

## Railway.com ga Deploy Qilish

### 1. GitHub ga yuklash

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Railway.com da yangi project yaratish

1. [Railway.com](https://railway.app) ga kiring
2. "New Project" → "Deploy from GitHub repo"
3. GitHub repository'ni tanlang
4. "Add variables" tugmasini bosing

### 3. Environment Variables (Railway da)

Railway dashboard → Variables → Add:

```
SECRET_KEY=your-django-secret-key-here
DEBUG=False
DATABASE_URL=postgresql://...  (Railway avtomatik beradi)
GEMINI_API_KEY=your-gemini-api-key
IQAIR_API_KEY=your-iqair-api-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
FRONTEND_URL=https://your-frontend-url.vercel.app
RAILWAY_ENVIRONMENT=production
```

### 4. Database qo'shish

Railway da:
1. "New" → "Database" → "PostgreSQL"
2. Avtomatik `DATABASE_URL` environment variable qo'shiladi

### 5. Deploy

Railway avtomatik deploy qiladi:
- `requirements.txt` topiladi
- Dependencies o'rnatiladi
- `Procfile` ishga tushiriladi
- Migratsiyalar qo'llaniladi
- Server ishga tushadi

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# .env faylini to'ldiring
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Documentation

Server ishga tushgandan keyin:
- API Docs: `http://localhost:8000/api/schema/swagger-ui/`
- ReDoc: `http://localhost:8000/api/schema/redoc/`

## Demo Credentials

Development rejimida:

**Admin:**
- Email: admin@healthhub.uz
- Password: admin123

**Bemor:**
- Email: patient@test.com
- Password: test123456

**Shifokor:**
- Email: doctor@test.com
- Password: test123456

## Project Structure

```
healthhub-uz/
├── backend/
│   ├── accounts/          # Foydalanuvchi boshqaruvi
│   ├── ai_service/        # AI simptom tahlili
│   ├── appointments/      # Qabullar tizimi
│   ├── chat/              # Real-time chat
│   ├── doctors/           # Shifokorlar
│   ├── medicines/         # Dorilar va dorixonalar
│   ├── air_quality/       # Havo sifati
│   ├── config/            # Django sozlamalari
│   ├── requirements.txt   # Python dependencies
│   ├── Procfile          # Railway deploy config
│   └── runtime.txt       # Python versiyasi
├── frontend/
│   ├── src/
│   │   ├── pages/        # React sahifalari
│   │   ├── components/   # React komponentlari
│   │   ├── services/     # API xizmatlari
│   │   └── layouts/      # Layout'lar
│   └── package.json
└── README.md
```

## Contributing

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/AmazingFeature`)
3. Commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

## License

MIT License

## Support

Issues: [GitHub Issues](https://github.com/yourusername/healthhub-uz/issues)

---

Made with ❤️ for Uzbekistan
