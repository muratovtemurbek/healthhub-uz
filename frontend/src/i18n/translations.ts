// src/i18n/translations.ts

export type Language = 'uz' | 'ru' | 'en';

export const translations = {
  uz: {
    // Common
    common: {
      loading: 'Yuklanmoqda...',
      save: 'Saqlash',
      cancel: 'Bekor qilish',
      delete: 'O\'chirish',
      edit: 'Tahrirlash',
      add: 'Qo\'shish',
      search: 'Qidirish',
      filter: 'Filter',
      all: 'Barchasi',
      back: 'Orqaga',
      next: 'Keyingi',
      previous: 'Oldingi',
      submit: 'Yuborish',
      confirm: 'Tasdiqlash',
      close: 'Yopish',
      yes: 'Ha',
      no: 'Yo\'q',
      error: 'Xatolik',
      success: 'Muvaffaqiyat',
      warning: 'Ogohlantirish',
      info: 'Ma\'lumot',
    },

    // Navigation
    nav: {
      home: 'Bosh sahifa',
      dashboard: 'Dashboard',
      doctors: 'Shifokorlar',
      appointments: 'Qabullar',
      profile: 'Profil',
      medicines: 'Dorilar',
      notifications: 'Bildirishnomalar',
      settings: 'Sozlamalar',
      logout: 'Chiqish',
    },

    // Auth
    auth: {
      login: 'Kirish',
      register: 'Ro\'yxatdan o\'tish',
      email: 'Email',
      password: 'Parol',
      confirmPassword: 'Parolni tasdiqlash',
      firstName: 'Ism',
      lastName: 'Familiya',
      phone: 'Telefon',
      forgotPassword: 'Parolni unutdingizmi?',
      noAccount: 'Hisobingiz yo\'qmi?',
      hasAccount: 'Hisobingiz bormi?',
    },

    // Dashboard
    dashboard: {
      welcome: 'Xush kelibsiz',
      upcomingAppointments: 'Yaqinlashayotgan qabullar',
      healthStatus: 'Sog\'lik holati',
      quickActions: 'Tezkor amallar',
      bookAppointment: 'Qabul olish',
      viewDoctors: 'Shifokorlarni ko\'rish',
      aiAssistant: 'AI yordamchi',
      medicalHistory: 'Tibbiy tarix',
    },

    // Doctors
    doctors: {
      title: 'Shifokorlar',
      specialization: 'Mutaxassislik',
      experience: 'Tajriba',
      years: 'yil',
      rating: 'Reyting',
      price: 'Narx',
      available: 'Mavjud',
      notAvailable: 'Mavjud emas',
      bookNow: 'Hozir yozilish',
      viewProfile: 'Profilni ko\'rish',
    },

    // Appointments
    appointments: {
      title: 'Qabullar',
      upcoming: 'Yaqinlashayotgan',
      past: 'O\'tgan',
      cancelled: 'Bekor qilingan',
      status: 'Holat',
      date: 'Sana',
      time: 'Vaqt',
      doctor: 'Shifokor',
      reason: 'Sabab',
      cancel: 'Bekor qilish',
      reschedule: 'Qayta rejalashtirish',
      noAppointments: 'Qabullar yo\'q',
    },

    // Profile
    profile: {
      title: 'Profil',
      personalInfo: 'Shaxsiy ma\'lumotlar',
      medicalInfo: 'Tibbiy ma\'lumotlar',
      bloodType: 'Qon guruhi',
      allergies: 'Allergiyalar',
      chronicDiseases: 'Surunkali kasalliklar',
      emergencyContact: 'Favqulodda aloqa',
      editProfile: 'Profilni tahrirlash',
      changePassword: 'Parolni o\'zgartirish',
    },

    // Health features
    health: {
      vitalSigns: 'Vital ko\'rsatkichlar',
      bloodPressure: 'Qon bosimi',
      heartRate: 'Puls',
      temperature: 'Harorat',
      oxygen: 'Kislorod',
      glucose: 'Qon qandi',
      weight: 'Vazn',
      height: 'Bo\'y',
      bmi: 'BMI',
      goals: 'Maqsadlar',
      labResults: 'Laboratoriya natijalari',
      vaccinations: 'Emlashlar',
      reports: 'Hisobotlar',
    },

    // Notifications
    notifications: {
      title: 'Bildirishnomalar',
      markAllRead: 'Barchasini o\'qilgan deb belgilash',
      noNotifications: 'Bildirishnomalar yo\'q',
      settings: 'Bildirishnoma sozlamalari',
      email: 'Email bildirishnomalari',
      push: 'Push bildirishnomalar',
      sms: 'SMS bildirishnomalar',
    },

    // Time
    time: {
      today: 'Bugun',
      yesterday: 'Kecha',
      tomorrow: 'Ertaga',
      thisWeek: 'Bu hafta',
      thisMonth: 'Bu oy',
      days: 'kun',
      hours: 'soat',
      minutes: 'daqiqa',
    },
  },

  ru: {
    // Common
    common: {
      loading: 'Загрузка...',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      add: 'Добавить',
      search: 'Поиск',
      filter: 'Фильтр',
      all: 'Все',
      back: 'Назад',
      next: 'Далее',
      previous: 'Предыдущий',
      submit: 'Отправить',
      confirm: 'Подтвердить',
      close: 'Закрыть',
      yes: 'Да',
      no: 'Нет',
      error: 'Ошибка',
      success: 'Успешно',
      warning: 'Предупреждение',
      info: 'Информация',
    },

    // Navigation
    nav: {
      home: 'Главная',
      dashboard: 'Панель',
      doctors: 'Врачи',
      appointments: 'Приемы',
      profile: 'Профиль',
      medicines: 'Лекарства',
      notifications: 'Уведомления',
      settings: 'Настройки',
      logout: 'Выход',
    },

    // Auth
    auth: {
      login: 'Войти',
      register: 'Регистрация',
      email: 'Эл. почта',
      password: 'Пароль',
      confirmPassword: 'Подтвердите пароль',
      firstName: 'Имя',
      lastName: 'Фамилия',
      phone: 'Телефон',
      forgotPassword: 'Забыли пароль?',
      noAccount: 'Нет аккаунта?',
      hasAccount: 'Уже есть аккаунт?',
    },

    // Dashboard
    dashboard: {
      welcome: 'Добро пожаловать',
      upcomingAppointments: 'Предстоящие приемы',
      healthStatus: 'Состояние здоровья',
      quickActions: 'Быстрые действия',
      bookAppointment: 'Записаться на прием',
      viewDoctors: 'Посмотреть врачей',
      aiAssistant: 'AI помощник',
      medicalHistory: 'История болезни',
    },

    // Doctors
    doctors: {
      title: 'Врачи',
      specialization: 'Специализация',
      experience: 'Опыт',
      years: 'лет',
      rating: 'Рейтинг',
      price: 'Цена',
      available: 'Доступен',
      notAvailable: 'Недоступен',
      bookNow: 'Записаться',
      viewProfile: 'Посмотреть профиль',
    },

    // Appointments
    appointments: {
      title: 'Приемы',
      upcoming: 'Предстоящие',
      past: 'Прошедшие',
      cancelled: 'Отмененные',
      status: 'Статус',
      date: 'Дата',
      time: 'Время',
      doctor: 'Врач',
      reason: 'Причина',
      cancel: 'Отменить',
      reschedule: 'Перенести',
      noAppointments: 'Нет приемов',
    },

    // Profile
    profile: {
      title: 'Профиль',
      personalInfo: 'Личная информация',
      medicalInfo: 'Медицинская информация',
      bloodType: 'Группа крови',
      allergies: 'Аллергии',
      chronicDiseases: 'Хронические заболевания',
      emergencyContact: 'Экстренный контакт',
      editProfile: 'Редактировать профиль',
      changePassword: 'Изменить пароль',
    },

    // Health features
    health: {
      vitalSigns: 'Жизненные показатели',
      bloodPressure: 'Давление',
      heartRate: 'Пульс',
      temperature: 'Температура',
      oxygen: 'Кислород',
      glucose: 'Сахар в крови',
      weight: 'Вес',
      height: 'Рост',
      bmi: 'ИМТ',
      goals: 'Цели',
      labResults: 'Результаты анализов',
      vaccinations: 'Вакцинации',
      reports: 'Отчеты',
    },

    // Notifications
    notifications: {
      title: 'Уведомления',
      markAllRead: 'Отметить все как прочитанные',
      noNotifications: 'Нет уведомлений',
      settings: 'Настройки уведомлений',
      email: 'Email уведомления',
      push: 'Push уведомления',
      sms: 'SMS уведомления',
    },

    // Time
    time: {
      today: 'Сегодня',
      yesterday: 'Вчера',
      tomorrow: 'Завтра',
      thisWeek: 'На этой неделе',
      thisMonth: 'В этом месяце',
      days: 'дней',
      hours: 'часов',
      minutes: 'минут',
    },
  },

  en: {
    // Common
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      all: 'All',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      confirm: 'Confirm',
      close: 'Close',
      yes: 'Yes',
      no: 'No',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info',
    },

    // Navigation
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      doctors: 'Doctors',
      appointments: 'Appointments',
      profile: 'Profile',
      medicines: 'Medicines',
      notifications: 'Notifications',
      settings: 'Settings',
      logout: 'Logout',
    },

    // Auth
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone',
      forgotPassword: 'Forgot password?',
      noAccount: 'Don\'t have an account?',
      hasAccount: 'Already have an account?',
    },

    // Dashboard
    dashboard: {
      welcome: 'Welcome',
      upcomingAppointments: 'Upcoming Appointments',
      healthStatus: 'Health Status',
      quickActions: 'Quick Actions',
      bookAppointment: 'Book Appointment',
      viewDoctors: 'View Doctors',
      aiAssistant: 'AI Assistant',
      medicalHistory: 'Medical History',
    },

    // Doctors
    doctors: {
      title: 'Doctors',
      specialization: 'Specialization',
      experience: 'Experience',
      years: 'years',
      rating: 'Rating',
      price: 'Price',
      available: 'Available',
      notAvailable: 'Not Available',
      bookNow: 'Book Now',
      viewProfile: 'View Profile',
    },

    // Appointments
    appointments: {
      title: 'Appointments',
      upcoming: 'Upcoming',
      past: 'Past',
      cancelled: 'Cancelled',
      status: 'Status',
      date: 'Date',
      time: 'Time',
      doctor: 'Doctor',
      reason: 'Reason',
      cancel: 'Cancel',
      reschedule: 'Reschedule',
      noAppointments: 'No appointments',
    },

    // Profile
    profile: {
      title: 'Profile',
      personalInfo: 'Personal Information',
      medicalInfo: 'Medical Information',
      bloodType: 'Blood Type',
      allergies: 'Allergies',
      chronicDiseases: 'Chronic Diseases',
      emergencyContact: 'Emergency Contact',
      editProfile: 'Edit Profile',
      changePassword: 'Change Password',
    },

    // Health features
    health: {
      vitalSigns: 'Vital Signs',
      bloodPressure: 'Blood Pressure',
      heartRate: 'Heart Rate',
      temperature: 'Temperature',
      oxygen: 'Oxygen',
      glucose: 'Blood Glucose',
      weight: 'Weight',
      height: 'Height',
      bmi: 'BMI',
      goals: 'Goals',
      labResults: 'Lab Results',
      vaccinations: 'Vaccinations',
      reports: 'Reports',
    },

    // Notifications
    notifications: {
      title: 'Notifications',
      markAllRead: 'Mark all as read',
      noNotifications: 'No notifications',
      settings: 'Notification Settings',
      email: 'Email notifications',
      push: 'Push notifications',
      sms: 'SMS notifications',
    },

    // Time
    time: {
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      thisWeek: 'This week',
      thisMonth: 'This month',
      days: 'days',
      hours: 'hours',
      minutes: 'minutes',
    },
  },
};

export type TranslationKeys = typeof translations.uz;
