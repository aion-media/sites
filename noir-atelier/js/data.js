/**
 * NOIR Hair Atelier - Database & Data Service
 * Универсальная CRM-платформа, каталог услуг, мастера и LocalStorage синхронизация
 */

const DEFAULT_SALON_INFO = {
  name: "NOIR",
  brandName: "NOIR HAIR ATELIER & SPA",
  tagline: "Премиальное ателье персонального стиля и SPA-ухода",
  subTagline: "Идеальная геометрия стрижек, премиальный уход и эстетика без компромиссов",
  city: "Центральный район",
  address: "Центральный проспект, 14 • Atelier Suite #1",
  addressShort: "Центральный проспект, 14",
  phone: "+7 (999) 000-00-00",
  whatsapp: "https://t.me/artem_aion",
  telegram: "https://t.me/artem_aion",
  instagram: "https://t.me/artem_aion",
  hours: "Ежедневно 10:00 – 21:00",
  features: [
    "Команда топ-стилистов и экспертов с международным опытом",
    "Премиальная эстетика, приватные рабочие зоны и атмосфера лаунджа",
    "Многоступенчатая стерилизация инструмента медицинского уровня",
    "Эксклюзивная селективная косметика и индивидуальный SPA-протокол",
    "Напитки из коллекции Atelier Bar, спешелти-кофе и свежая пресса"
  ]
};

const DEFAULT_CATEGORIES = [
  { 
    id: "men-style", 
    name: "Мужские стрижки и стиль", 
    icon: "✂️", 
    desc: "Авторские мужские стрижки, моделирование бороды, королевское бритьё и тонирование седины" 
  },
  { 
    id: "women-style", 
    name: "Женские стрижки и укладки", 
    icon: "💇‍♀️", 
    desc: "Текстурные стрижки по технике Vidal Sassoon, брашинг, вечерние образы и уход за бровями" 
  },
  { 
    id: "kids-style", 
    name: "Детские стрижки", 
    icon: "⚡", 
    desc: "Стильные детские и подростковые формы, фейды, фигурные выстриги и семейный комплекс «Отец + Сын»" 
  },
  { 
    id: "spa-care", 
    name: "SPA-уход и восстановление", 
    icon: "🧴", 
    desc: "Детокс кожи головы, молекулярная реконструкция волос, аромамассаж и комплексный ритуал NOIR" 
  }
];

const DEFAULT_SPECIALISTS = [
  {
    id: "spec-alex",
    name: "Alex Gray",
    role: "Арт-директор, ведущий топ-стилист",
    experience: "Опыт 12+ лет. Международная академия Toni&Guy, амбассадор авторских стрижек и полного ребрендинга стиля.",
    categories: ["men-style", "women-style", "kids-style", "spa-care"],
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    workDays: [1, 2, 3, 4, 5, 6, 7]
  },
  {
    id: "spec-max",
    name: "Max Rivera",
    role: "Шеф-барбер, эксперт мужских техник",
    experience: "Опыт 8 лет. Прецизионные Skin Fade, идеальная геометрия бороды и традиционное бритьё опасной бритвой.",
    categories: ["men-style", "kids-style"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    workDays: [1, 2, 3, 4, 5, 6]
  },
  {
    id: "spec-elena",
    name: "Elena Rostova",
    role: "Топ-стилист, колорист & SPA-эксперт",
    experience: "Опыт 9 лет. Эксперт по текстурным женским стрижкам, вечерним укладкам, Gloss-тонированию и SPA-восстановлению.",
    categories: ["women-style", "spa-care"],
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    workDays: [2, 3, 4, 5, 6, 7]
  },
  {
    id: "spec-sofia",
    name: "Sofia Vance",
    role: "Стилист детских направлений & SPA-терапевт",
    experience: "Опыт 6 лет. Легкий контакт с детьми любого возраста, модные подростковые стрижки, детокс и массаж головы.",
    categories: ["kids-style", "spa-care"],
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    workDays: [1, 3, 4, 5, 6, 7]
  }
];

const DEFAULT_SERVICES = [
  // 1. МУЖСКИЕ СТРИЖКИ И СТИЛЬ (4 услуги)
  {
    id: "srv-men-1",
    categoryId: "men-style",
    name: "Авторская стрижка NOIR (Signature Cut)",
    shortDesc: "Консультация стилиста, мытье головы премиальным шампунем, стрижка ножницами и машинкой, стайлинг",
    fullDesc: "Фирменная стрижка с индивидуальной адаптацией под форму черепа и черты лица. Включает двойное очищение волос, массаж воротниковой зоны и укладку профессиональной матовой пастой.",
    price: 450000,
    duration: 60,
    popular: true
  },
  {
    id: "srv-men-2",
    categoryId: "men-style",
    name: "Моделирование бороды и усов",
    shortDesc: "Создание четких контуров, распаривание горячим компрессом, стрижка триммером и бритвой",
    fullDesc: "Профессиональное оформление бороды любой длины. Распаривание эфирными маслами, смягчающий бальзам, выравнивание линии щек и шеи с использованием премиального ухода.",
    price: 250000,
    duration: 30,
    popular: false
  },
  {
    id: "srv-men-3",
    categoryId: "men-style",
    name: "Королевское бритьё опасным лезвием",
    shortDesc: "Традиционный ритуал гладкого бритья с 3 компрессами, взбитой теплой пеной и уходом после бритья",
    fullDesc: "Полное расслабление: предварительное масло, горячее полотенце, классическое лезвие, холодный компресс для закрытия пор и охлаждающий одеколон с благородным ароматом древесины.",
    price: 350000,
    duration: 45,
    popular: false
  },
  {
    id: "srv-men-4",
    categoryId: "men-style",
    name: "Камуфляж седины и тонирование",
    shortDesc: "Мягкое естественное тонирование волос или бороды без эффекта парика за 15 минут",
    fullDesc: "Специальный безаммиачный состав мягко приглушает седину, возвращая волосам их натуральный естественный тон. Смывается плавно и незаметно для окружающих.",
    price: 300000,
    duration: 40,
    popular: false
  },

  // 2. ЖЕНСКИЕ СТРИЖКИ И УКЛАДКИ (4 услуги)
  {
    id: "srv-fem-1",
    categoryId: "women-style",
    name: "Текстурная стрижка и стайлинг",
    shortDesc: "Мытье волос со SPA-уходом, текстурная стрижка любой сложности и салонная укладка",
    fullDesc: "Технически точная стрижка с сохранением объема и легкой текстуры. Волосы идеально лежат даже после домашней сушки феном без необходимости длительного стайлинга.",
    price: 600000,
    duration: 75,
    popular: true
  },
  {
    id: "srv-fem-2",
    categoryId: "women-style",
    name: "Брашинг и вечерняя укладка",
    shortDesc: "Глянцевый брашинг на браш, голливудские локоны или гладкий текстурный шелк",
    fullDesc: "Создание стойкого и объемного образа для мероприятий, съемок или романтического вечера. Термозащита и фиксация невесомым спреем с зеркальным блеском.",
    price: 400000,
    duration: 45,
    popular: false
  },
  {
    id: "srv-fem-3",
    categoryId: "women-style",
    name: "Тонирование Gloss & Tone",
    shortDesc: "Обновление цвета, придание зеркального блеска и насыщение волос кератином",
    fullDesc: "Тонирование безаммиачным красителем нового поколения. Запечатывает кутикулу, разглаживает пористость и придает глубокий сияющий оттенок.",
    price: 750000,
    duration: 90,
    popular: false
  },
  {
    id: "srv-fem-4",
    categoryId: "women-style",
    name: "Архитектура и ламинирование бровей",
    shortDesc: "Моделирование идеальной формы пинцетом/нитью, долговременная укладка и окрашивание",
    fullDesc: "Комплексная проработка бровей: очищение, построение симметрии, окрашивание стойким гипоаллергенным красителем и ламинирование питательным кератиновым составом.",
    price: 300000,
    duration: 45,
    popular: false
  },

  // 3. ДЕТСКИЕ СТРИЖКИ (4 услуги)
  {
    id: "srv-kid-1",
    categoryId: "kids-style",
    name: "Детская стрижка Junior (до 12 лет)",
    shortDesc: "Комфортная и аккуратная стрижка в дружелюбной атмосфере для юных джентльменов и леди",
    fullDesc: "Мастер находит индивидуальный подход к каждому ребенку. Мытье головы с мягким шампунем, аккуратная модельная стрижка и легкий безалкогольный стайлинг.",
    price: 300000,
    duration: 40,
    popular: false
  },
  {
    id: "srv-kid-2",
    categoryId: "kids-style",
    name: "Подростковый фейд и текстура (12–16 лет)",
    shortDesc: "Трендовые стрижки: Mid/Low Fade, Crop, Taper, удлиненный гранж со стайлингом глиной",
    fullDesc: "Стрижка с учетом молодежных трендов. Чистые переходы, проработка текстуры и обучение подростка быстрому самостоятельному стайлингу дома.",
    price: 350000,
    duration: 45,
    popular: true
  },
  {
    id: "srv-kid-3",
    categoryId: "kids-style",
    name: "Фигурный выстриг Hair Tattoo",
    shortDesc: "Четкие геометрические полосы, молнии или авторские графические узоры на висках",
    fullDesc: "Креативное дополнение к любой стрижке: филигранная работа триммером и бритвой с созданием яркого акцента на виске или затылке.",
    price: 150000,
    duration: 20,
    popular: false
  },
  {
    id: "srv-kid-4",
    categoryId: "kids-style",
    name: "Комплекс «Отец + Сын»",
    shortDesc: "Одновременная стрижка папы и сына у лучших мастеров со скидкой и напитками",
    fullDesc: "Отличный повод провести время вместе: полноценная мужская стрижка для отца и стрижка для сына. Включает мытье головы, укладки и любимые напитки.",
    price: 700000,
    duration: 75,
    popular: true
  },

  // 4. SPA-УХОД И ВОССТАНОВЛЕНИЕ (4 услуги)
  {
    id: "srv-spa-1",
    categoryId: "spa-care",
    name: "Глубокая детокс-терапия кожи головы",
    shortDesc: "Энзимный пилинг, очищение волосяных фолликулов, массаж с тоником и стимуляция роста",
    fullDesc: "Освобождает кожу головы от остатков стайлинга, кожного себума и пыли. Охлаждающая маска восстанавливает микроциркуляцию и придает длительное ощущение свежести.",
    price: 450000,
    duration: 45,
    popular: false
  },
  {
    id: "srv-spa-2",
    categoryId: "spa-care",
    name: "Молекулярное восстановление волос",
    shortDesc: "Глубокая реконструкция аминокислотами и липидами поврежденных и ломких волос",
    fullDesc: "Интенсивная терапия для сухих и поврежденных волос. Заполняет пустоты волосяного стержня, возвращает эластичность, шелковистость и плотность без утяжеления.",
    price: 650000,
    duration: 60,
    popular: true
  },
  {
    id: "srv-spa-3",
    categoryId: "spa-care",
    name: "Расслабляющий массаж головы с аромамаслами",
    shortDesc: "Точечный антистресс-массаж головы, шеи и плеч с натуральным маслом сандала и кедра",
    fullDesc: "30 минут абсолютного релакса. Снимает накопленное мышечное напряжение, улучшает кровообращение и дарит ощущение легкой и ясной головы.",
    price: 250000,
    duration: 30,
    popular: false
  },
  {
    id: "srv-spa-4",
    categoryId: "spa-care",
    name: "Премиальный комплекс NOIR Ultimate Care",
    shortDesc: "Комплексный 4-этапный ритуал: пилинг + реконструкция + массаж + финишный уход",
    fullDesc: "Максимальный оздоровительный ритуал: глубокое очищение, термо-маска с натуральными пептидами, ароматерапевтический массаж и закрывающий питательный флюид.",
    price: 950000,
    duration: 90,
    popular: false
  }
];

function generateDemoAppointments() {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return [
    {
      id: "NOIR-101",
      clientName: "Константин Васильев",
      phone: "+7 913 902-11-22",
      serviceId: "srv-men-1",
      serviceName: "Авторская стрижка NOIR (Signature Cut)",
      variantName: "Стандарт",
      specialistId: "spec-alex",
      specialistName: "Alex Gray",
      date: today,
      time: "11:00",
      duration: 60,
      price: 450000,
      status: "confirmed",
      comment: "Пожелание: текстура сверху, низ под насадку 1.5",
      createdAt: new Date().toISOString()
    },
    {
      id: "NOIR-102",
      clientName: "Виктория Смирнова",
      phone: "+7 923 440-55-66",
      serviceId: "srv-fem-1",
      serviceName: "Текстурная стрижка и стайлинг",
      variantName: "Стандарт",
      specialistId: "spec-elena",
      specialistName: "Elena Rostova",
      date: today,
      time: "13:00",
      duration: 75,
      price: 600000,
      status: "confirmed",
      comment: "Убрать секущиеся концы, сохранить длину у лица",
      createdAt: new Date().toISOString()
    },
    {
      id: "NOIR-103",
      clientName: "Дмитрий и сын Артем",
      phone: "+7 905 771-33-88",
      serviceId: "srv-kid-4",
      serviceName: "Комплекс «Отец + Сын»",
      variantName: "Комплекс",
      specialistId: "spec-max",
      specialistName: "Max Rivera",
      date: today,
      time: "15:00",
      duration: 75,
      price: 700000,
      status: "confirmed",
      comment: "Сыну 9 лет, хочет молнию на виске",
      createdAt: new Date().toISOString()
    },
    {
      id: "NOIR-104",
      clientName: "Анастасия Белова",
      phone: "+7 912 334-99-00",
      serviceId: "srv-spa-2",
      serviceName: "Молекулярное восстановление волос",
      variantName: "Премиум",
      specialistId: "spec-sofia",
      specialistName: "Sofia Vance",
      date: today,
      time: "17:00",
      duration: 60,
      price: 650000,
      status: "new",
      comment: "Волосы после отпуска и моря, сухие кончики",
      createdAt: new Date().toISOString()
    },
    {
      id: "NOIR-105",
      clientName: "Михаил Воронов",
      phone: "+7 960 112-44-33",
      serviceId: "srv-men-2",
      serviceName: "Моделирование бороды и усов",
      variantName: "Стандарт",
      specialistId: "spec-max",
      specialistName: "Max Rivera",
      date: tomorrow,
      time: "12:00",
      duration: 30,
      price: 250000,
      status: "new",
      comment: "Подравнять контуры перед встречей",
      createdAt: new Date().toISOString()
    }
  ];
}

class NoirDataService {
  constructor() {
    this.STORAGE_KEYS = {
      SALON: "noir_salon_info",
      CATEGORIES: "noir_categories",
      SERVICES: "noir_services",
      SPECIALISTS: "noir_specialists",
      APPOINTMENTS: "noir_appointments"
    };

    this.initDatabase();
  }

  initDatabase() {
    if (!localStorage.getItem(this.STORAGE_KEYS.SALON)) {
      localStorage.setItem(this.STORAGE_KEYS.SALON, JSON.stringify(DEFAULT_SALON_INFO));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.SERVICES)) {
      localStorage.setItem(this.STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.SPECIALISTS)) {
      localStorage.setItem(this.STORAGE_KEYS.SPECIALISTS, JSON.stringify(DEFAULT_SPECIALISTS));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.APPOINTMENTS)) {
      localStorage.setItem(this.STORAGE_KEYS.APPOINTMENTS, JSON.stringify(generateDemoAppointments()));
    }
  }

  getSalonInfo() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SALON)) || DEFAULT_SALON_INFO;
    } catch (e) {
      return DEFAULT_SALON_INFO;
    }
  }

  getCategories() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CATEGORIES)) || DEFAULT_CATEGORIES;
    } catch (e) {
      return DEFAULT_CATEGORIES;
    }
  }

  getServices() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SERVICES)) || DEFAULT_SERVICES;
    } catch (e) {
      return DEFAULT_SERVICES;
    }
  }

  saveServices(services) {
    localStorage.setItem(this.STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }

  addService(newService) {
    const services = this.getServices();
    const serviceId = "srv-" + Date.now();
    const service = { id: serviceId, ...newService };
    services.push(service);
    this.saveServices(services);
    return service;
  }

  updateService(id, updatedFields) {
    const services = this.getServices();
    const idx = services.findIndex(s => s.id === id);
    if (idx !== -1) {
      services[idx] = { ...services[idx], ...updatedFields };
      this.saveServices(services);
      return services[idx];
    }
    return null;
  }

  deleteService(id) {
    let services = this.getServices();
    services = services.filter(s => s.id !== id);
    this.saveServices(services);
    return true;
  }

  getSpecialists() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SPECIALISTS)) || DEFAULT_SPECIALISTS;
    } catch (e) {
      return DEFAULT_SPECIALISTS;
    }
  }

  saveSpecialists(specialists) {
    localStorage.setItem(this.STORAGE_KEYS.SPECIALISTS, JSON.stringify(specialists));
  }

  addSpecialist(spec) {
    const specialists = this.getSpecialists();
    const newSpec = {
      id: "spec-" + Date.now(),
      name: spec.name,
      role: spec.role || "Мастер NOIR",
      experience: spec.experience || "",
      categories: spec.categories || ["men-style", "women-style"],
      avatar: spec.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      workDays: spec.workDays || [1, 2, 3, 4, 5, 6, 7]
    };
    specialists.push(newSpec);
    this.saveSpecialists(specialists);
    return newSpec;
  }

  updateSpecialist(id, updatedFields) {
    const specialists = this.getSpecialists();
    const idx = specialists.findIndex(s => s.id === id);
    if (idx !== -1) {
      specialists[idx] = { ...specialists[idx], ...updatedFields };
      this.saveSpecialists(specialists);
      return specialists[idx];
    }
    return null;
  }

  getAppointments() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.APPOINTMENTS)) || [];
    } catch (e) {
      return [];
    }
  }

  saveAppointments(appointments) {
    localStorage.setItem(this.STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }

  addAppointment(booking) {
    const appointments = this.getAppointments();
    const newId = "NOIR-" + Math.floor(100 + Math.random() * 900);

    let assignedSpecId = booking.specialistId || "any";
    let assignedSpecName = booking.specialistName || "Любой свободный мастер";

    // Автоматическое распределение при выборе "Любой свободный мастер"
    if (assignedSpecId === "any") {
      const specialists = this.getSpecialists();
      const bookingDate = booking.date;
      const dayOfWeek = new Date(bookingDate).getDay() === 0 ? 7 : new Date(bookingDate).getDay();
      const bookingHour = parseInt((booking.time || '10:00').split(':')[0], 10);

      const workingSpecs = specialists.filter(sp => {
        if (sp.customSchedule && sp.customSchedule[bookingDate]) {
          return sp.customSchedule[bookingDate].isWorking;
        }
        return (sp.workDays || [1,2,3,4,5,6,7]).includes(dayOfWeek);
      });

      let freeSpec = workingSpecs.find(sp => {
        const hasBusySlot = appointments.some(a => 
          a.date === bookingDate && 
          a.status !== 'cancelled' &&
          (a.specialistId === sp.id || (a.specialistName && a.specialistName.includes(sp.name))) &&
          parseInt(a.time.split(':')[0], 10) === bookingHour
        );
        return !hasBusySlot;
      });

      if (!freeSpec && workingSpecs.length > 0) {
        freeSpec = workingSpecs[0];
      } else if (!freeSpec && specialists.length > 0) {
        freeSpec = specialists[0];
      }

      if (freeSpec) {
        assignedSpecId = freeSpec.id;
        assignedSpecName = freeSpec.name;
      }
    }

    const newRecord = {
      id: newId,
      clientName: booking.clientName,
      phone: booking.phone,
      serviceId: booking.serviceId || "",
      serviceName: booking.serviceName,
      variantName: booking.variantName || "Стандарт",
      specialistId: assignedSpecId,
      specialistName: assignedSpecName,
      date: booking.date,
      time: booking.time,
      duration: booking.duration || 60,
      price: booking.price,
      status: "new",
      comment: booking.comment || "",
      createdAt: new Date().toISOString()
    };

    appointments.unshift(newRecord);
    this.saveAppointments(appointments);
    return newRecord;
  }

  updateAppointment(id, updatedFields) {
    const appointments = this.getAppointments();
    const idx = appointments.findIndex(a => a.id === id);
    if (idx !== -1) {
      appointments[idx] = { ...appointments[idx], ...updatedFields };
      this.saveAppointments(appointments);
      return appointments[idx];
    }
    return null;
  }

  deleteAppointment(id) {
    let appointments = this.getAppointments();
    appointments = appointments.filter(a => a.id !== id);
    this.saveAppointments(appointments);
    return true;
  }

  updateAppointmentStatus(id, newStatus) {
    const appointments = this.getAppointments();
    const item = appointments.find(a => a.id === id);
    if (item) {
      item.status = newStatus;
      this.saveAppointments(appointments);
      return true;
    }
    return false;
  }

  formatMoney(amount) {
    if (!amount || amount === 0) return "0 ₫";
    return amount.toLocaleString('ru-RU') + " ₫";
  }
}

// Экспортируем глобальный экземпляр
window.noirData = new NoirDataService();
window.code606Data = window.noirData;
window.hdData = window.noirData;
