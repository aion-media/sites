/**
 * CODE 606 Barbershop (Nha Trang) - Database & Data Service
 * Оцифровка прейскуранта, мастеров, расписания и хранилище CRM в LocalStorage
 */

const DEFAULT_SALON_INFO = {
  name: "CODE 606",
  brandName: "CODE 606 BARBERSHOP",
  tagline: "Больше, чем одно пространство",
  subTagline: "Мужские стрижки, моделирование бороды и бритьё от мастеров из Новосибирска",
  city: "Нячанг, Вьетнам",
  address: "224 Ngô Gia Tự, Phước Tiến, Nha Trang, Khánh Hòa 650000",
  addressShort: "224 Ngô Gia Tự, Nha Trang",
  phone: "+84 901 928 606",
  phoneRaw: "84901928606",
  whatsapp: "https://wa.me/84901928606",
  telegram: "https://t.me/code606_nhatrang",
  instagram: "https://www.instagram.com/code.606.vn/",
  altegioUrl: "https://code606.altegio.me",
  googleMapsUrl: "https://maps.app.goo.gl/LpvgF2PsgeQoFCMo6",
  hours: "Ежедневно 10:00 – 21:00",
  features: [
    "Профессиональные барберы из Новосибирска с непрерывным стажем",
    "Идеальные фейды, четкие контуры и удлинённые классические стрижки",
    "Стерилизация инструментов в 3 этапа по строгим стандартам СанПиН",
    "Премиальная мужская косметика и индивидуальный подбор стайлинга",
    "Атмосферное пространство, спешелти-кофе, напитки и комфортный лаундж"
  ]
};

const DEFAULT_CATEGORIES = [
  { id: "main-cuts", name: "Основные стрижки", icon: "✂️", desc: "Классические, удлинённые, модельные и детские стрижки ножницами и машинкой" },
  { id: "beard-shave", name: "Борода и королевское бритьё", icon: "🪒", desc: "Прецизионное оформление бороды, распаривание горячими полотенцами и чистое бритьё" },
  { id: "combo-deals", name: "Комплексы и Комбо", icon: "💈", desc: "Выгодные совместные комплексы стрижки с бородой и формат «Отец + сын»" },
  { id: "camouflage-care", name: "Камуфляж седины и уход", icon: "🧴", desc: "Естественное тонирование седины на голове и бороде без эффекта парика" },
  { id: "additional-services", name: "Дополнительные услуги", icon: "✨", desc: "Горячий воск (удаление волос из носа и ушей) и моделирование формы бровей" }
];

const DEFAULT_CATEGORY_GROUPS = [
  {
    id: "group-haircuts",
    name: "Стрижки",
    shortName: "Стрижки",
    icon: "✂️",
    categoryIds: ["main-cuts"],
    desc: "Мужские стрижки, удлинённые формы, стрижки под насадку и детские"
  },
  {
    id: "group-beard",
    name: "Борода и бритьё",
    shortName: "Борода",
    icon: "🪒",
    categoryIds: ["beard-shave"],
    desc: "Оформление бороды опасным лезвием и традиционное королевское бритьё"
  },
  {
    id: "group-combo",
    name: "Комплексы (Комбо)",
    shortName: "Комбо",
    icon: "💈",
    categoryIds: ["combo-deals"],
    desc: "Стрижка + борода, Стрижка машинкой + борода, Отец + сын"
  },
  {
    id: "group-care-extra",
    name: "Камуфляж и SPA-уход",
    shortName: "Уход и воск",
    icon: "✨",
    categoryIds: ["camouflage-care", "additional-services"],
    desc: "Камуфляж седины, горячий воск нос/уши, коррекция бровей"
  }
];

const DEFAULT_SPECIALISTS = [
  {
    id: "spec-klim",
    name: "Владимир Клим",
    role: "Шеф-барбер, сооснователь CODE 606",
    experience: "Опыт более 10 лет (Новосибирск). Эксперт по сложной геометрии стрижек, удлинённым формам, чистому королевскому бритью и фейдам",
    categories: ["main-cuts", "beard-shave", "combo-deals", "camouflage-care", "additional-services"],
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    workDays: [1, 2, 3, 4, 5, 6, 7]
  },
  {
    id: "spec-artem",
    name: "Артём",
    role: "Топ-барбер CODE 606",
    experience: "Опыт 6 лет (Новосибирск). Специалист по ультра-чистым Skin Fade, моделированию бороды, работе с текстурой и камуфляжу седины",
    categories: ["main-cuts", "beard-shave", "combo-deals", "camouflage-care", "additional-services"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    workDays: [1, 2, 3, 4, 5, 6]
  },
  {
    id: "spec-denis",
    name: "Денис",
    role: "Барбер-стилист CODE 606",
    experience: "Опыт 5 лет (Новосибирск). Мастер классических британских и удлинённых мужских форм (Crop, Pompadour, Mullet), детские стрижки",
    categories: ["main-cuts", "beard-shave", "combo-deals", "additional-services"],
    avatar: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80",
    workDays: [2, 3, 4, 5, 6, 7]
  }
];

const DEFAULT_SERVICES = [
  // --- ОСНОВНЫЕ УСЛУГИ (MAIN SERVICES) ---
  {
    id: "srv-haircut",
    categoryId: "main-cuts",
    name: "Стрижка",
    enName: "Haircut",
    shortDesc: "Классическая мужская стрижка ножницами и машинкой с мытьем головы и укладкой",
    fullDesc: "Полный цикл стрижки с учетом анатомических особенностей головы, направления роста волос и вашего стиля. Включает мытье головы до и после стрижки профессиональным охлаждающим шампунем, массаж и укладку премиальным матовым стайлингом.",
    price: 400000,
    priceVariants: [],
    duration: 60,
    includes: ["Мытье головы до и после", "Стрижка ножницами и машинкой", "Шлифовка контуров", "Премиальный стайлинг"],
    badge: "Хит",
    note: null
  },
  {
    id: "srv-clipper-cut",
    categoryId: "main-cuts",
    name: "Стрижка машинкой (2 насадки)",
    enName: "Clipper Cut - 2 Guards",
    shortDesc: "Спортивная быстрая стрижка под 1-2 насадки с аккуратной окантовкой",
    fullDesc: "Практичная мужская стрижка под машинку с переходом между двумя насадками, чистовой проработкой височных зон и шеи триммером. Включает мытье головы и освежающий лосьон.",
    price: 200000,
    priceVariants: [],
    duration: 30,
    includes: ["Стрижка машинкой", "Окантовка триммером", "Мытье головы", "Лосьон после стрижки"],
    badge: null,
    note: null
  },
  {
    id: "srv-long-haircut",
    categoryId: "main-cuts",
    name: "Удлинённая стрижка",
    enName: "Long Haircut",
    shortDesc: "Сложная работа с длинными волосами, каскадные формы, текстурирование",
    fullDesc: "Стрижка волос средней длины и длинных волос ножницами по сложным схемам разделения. Проработка текстуры, создание естественного объема, мытье головы и текстурирующая укладка с солевым спреем или кремом.",
    price: 500000,
    priceVariants: [],
    duration: 75,
    includes: ["Диагностика формы и структуры", "Стрижка ножницами", "Глубокое кондиционирование", "Текстурирующая сушка"],
    badge: "Премиум",
    note: null
  },
  {
    id: "srv-kids-haircut",
    categoryId: "main-cuts",
    name: "Детская стрижка",
    enName: "Kids' Haircut",
    shortDesc: "Стрижка для юных джентльменов до 12 лет в дружелюбной атмосфере",
    fullDesc: "Терпеливый и внимательный подход к детям. Модная стрижка любой сложности с учетом пожеланий ребенка и родителей. Завершается легким детским стайлингом.",
    price: 300000,
    priceVariants: [],
    duration: 45,
    includes: ["Бережный подход", "Модельная стрижка", "Окантовка", "Легкая укладка"],
    badge: null,
    note: "Для детей до 12 лет включительно"
  },

  // --- БОРОДА И КОРОЛЕВСКОЕ БРИТЬЁ ---
  {
    id: "srv-beard-trim",
    categoryId: "beard-shave",
    name: "Оформление бороды",
    enName: "Beard Trim",
    shortDesc: "Моделирование формы, четкие контуры лезвием, распаривание и масло",
    fullDesc: "Придание бороде идеальной формы ножницами и машинкой. Четкие контуры щек и шеи с использованием распаривающего компресса, бритвы-шаветт с одноразовым лезвием и увлажняющего бальзама или масла для бороды.",
    price: 300000,
    priceVariants: [],
    duration: 45,
    includes: ["Подбор геометрии бороды", "Стрижка длины и объема", "Горячий компресс", "Окантовка бритвой", "Уход с маслом"],
    badge: "Популярно",
    note: null
  },
  {
    id: "srv-royal-shave",
    categoryId: "beard-shave",
    name: "Королевское бритьё",
    enName: "Royal Shave",
    shortDesc: "Традиционный ритуал гладкого бритья опасной бритвой с горячими компрессами",
    fullDesc: "Настоящий мужской SPA-ритуал. Распаривание кожи лица горячими полотенцами с эфирными маслами, взбивание густой пены помазком из натурального ворса, идеальное бритье опасным лезвием и завершающий охлаждающий ледяной компресс с квасцами и одеколоном.",
    price: 400000,
    priceVariants: [],
    duration: 45,
    includes: ["Горячее распаривание полотенцами", "Густая теплая пена", "Бритье опасным лезвием", "Холодный компресс", "Премиальный одеколон"],
    badge: "Ритуал",
    note: null
  },

  // --- КОМПЛЕКСЫ И КОМБО (COMBO) ---
  {
    id: "srv-haircut-beard",
    categoryId: "combo-deals",
    name: "Стрижка + оформление бороды",
    enName: "Haircut + Beard Trim",
    shortDesc: "Полный комплекс создания законченного мужского образа в одном визите",
    fullDesc: "Главный комбо-выбор наших гостей. Классическая мужская стрижка ножницами и машинкой с мытьем головы + моделирование формы бороды с горячим компрессом, окантовкой лезвием и полным стайлингом.",
    price: 650000,
    priceVariants: [],
    duration: 90,
    includes: ["Полная стрижка головы", "Мытье головы до и после", "Моделирование бороды", "Горячий компресс", "Комплексный стайлинг"],
    badge: "Топ выбор",
    note: "Экономия 50 000 VND по сравнению с раздельными услугами"
  },
  {
    id: "srv-clipper-beard",
    categoryId: "combo-deals",
    name: "Стрижка машинкой + оформление бороды",
    enName: "Clipper Cut + Beard Trim",
    shortDesc: "Быстрая спортивная стрижка под насадки + аккуратная борода",
    fullDesc: "Идеально для тех, кто ценит время и лаконичный стиль. Стрижка волос под машинку с переходом + комплексное оформление и окантовка бороды с уходовым маслом.",
    price: 450000,
    priceVariants: [],
    duration: 60,
    includes: ["Стрижка машинкой", "Оформление бороды", "Мытье головы", "Уход за кожей и бородой"],
    badge: null,
    note: "Экономия 50 000 VND"
  },
  {
    id: "srv-father-son",
    categoryId: "combo-deals",
    name: "Отец + сын",
    enName: "Father + Son",
    shortDesc: "Одновременная стрижка папы и сына в атмосфере настоящего барбершопа",
    fullDesc: "Семейный визит в CODE 606: мужская стрижка для отца и модельная стрижка для сына. Отличная мужская традиция с напитками и первоклассным сервисом.",
    price: 650000,
    priceVariants: [],
    duration: 90,
    includes: ["Мужская стрижка для отца", "Детская стрижка для сына", "Мытье головы обоим гостям", "Стайлинг и напитки"],
    badge: "Семейный",
    note: "Для отца и сына до 12 лет"
  },

  // --- КАМУФЛЯЖ И ДОПОЛНИТЕЛЬНЫЕ УСЛУГИ ---
  {
    id: "srv-scalp-camouflage",
    categoryId: "camouflage-care",
    name: "Камуфлирование головы",
    enName: "Scalp Camouflage",
    shortDesc: "Мягкое тонирование седины за 15 минут в естественный тон без рыжины",
    fullDesc: "Специальный безаммиачный мужской краситель, мягко приглушающий седину на волосах головы. Выглядит абсолютно естественно, вымывается плавно без эффекта отросших корней.",
    price: 350000,
    priceVariants: [],
    duration: 30,
    includes: ["Подбор натурального тона", "Нанесение камуфляжа в мойке", "Мытье стабилизирующим шампунем", "Укладка"],
    badge: "Must-Have",
    note: null
  },
  {
    id: "srv-beard-camouflage",
    categoryId: "camouflage-care",
    name: "Камуфлирование бороды",
    enName: "Beard Camouflage",
    shortDesc: "Придание бороде визуальной плотности и ровного благородного оттенка",
    fullDesc: "Тонирование седых или выгоревших на солнце волос бороды. Делает контур более четким и густым, сохраняя естественную текстуру щетины.",
    price: 300000,
    priceVariants: [],
    duration: 30,
    includes: ["Подготовка бороды", "Нанесение мягкого мужского тона", "Очищение и нанесение масла"],
    badge: null,
    note: null
  },
  {
    id: "srv-hot-wax",
    categoryId: "additional-services",
    name: "Горячий воск (нос/уши)",
    enName: "Hot Wax (Nose & Ears)",
    shortDesc: "Быстрое и безболезненное удаление нежелательных волосков из носа и ушей",
    fullDesc: "Гигиеническая процедура с применением гипоаллергенного пленочного воска. Деликатно очищает область ноздрей и ушных раковин, обеспечивая опрятный вид до 3-4 недель.",
    price: 100000,
    priceVariants: [],
    duration: 15,
    includes: ["Обработка зоны", "Нанесение деликатного воска", "Успокаивающий лосьон"],
    badge: null,
    note: null
  },
  {
    id: "srv-eyebrow-shaping",
    categoryId: "additional-services",
    name: "Коррекция бровей",
    enName: "Eyebrow Shaping",
    shortDesc: "Аккуратное прореживание и создание естественной мужественной формы",
    fullDesc: "Удаление сросшихся на переносице и лишних волосков пинцетом, триммером или воском без создания неестественно тонких линий. Брови выглядят опрятно и ухоженно.",
    price: 100000,
    priceVariants: [],
    duration: 20,
    includes: ["Консультация по форме", "Удаление лишних волосков", "Охлаждающий гель"],
    badge: null,
    note: null
  }
];

class BarbershopDataService {
  constructor() {
    this.STORAGE_KEYS = {
      SALON_INFO: 'code606_salon_info',
      SERVICES: 'code606_services',
      SPECIALISTS: 'code606_specialists',
      APPOINTMENTS: 'code606_appointments',
      CATEGORIES: 'code606_categories',
      CATEGORY_GROUPS: 'code606_category_groups'
    };

    this.initDefaults();
  }

  initDefaults() {
    if (!localStorage.getItem(this.STORAGE_KEYS.SALON_INFO)) {
      this.saveSalonInfo(DEFAULT_SALON_INFO);
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.SERVICES)) {
      this.saveServices(DEFAULT_SERVICES);
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.SPECIALISTS)) {
      this.saveSpecialists(DEFAULT_SPECIALISTS);
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.CATEGORY_GROUPS)) {
      localStorage.setItem(this.STORAGE_KEYS.CATEGORY_GROUPS, JSON.stringify(DEFAULT_CATEGORY_GROUPS));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.APPOINTMENTS)) {
      // Создадим пару реалистичных демонстрационных записей на сегодня
      const todayStr = new Date().toISOString().split('T')[0];
      const initialBookings = [
        {
          id: "606-101",
          clientName: "Александр Морозов",
          phone: "+84 934 112 344",
          serviceId: "srv-haircut-beard",
          serviceName: "Стрижка + оформление бороды",
          variantName: "Стандарт",
          specialistId: "spec-klim",
          specialistName: "Владимир Клим",
          date: todayStr,
          time: "12:00",
          duration: 90,
          price: 650000,
          status: "confirmed",
          comment: "Кофе по готовности, аккуратный переход сбоку",
          createdAt: new Date().toISOString()
        },
        {
          id: "606-102",
          clientName: "Максим В.",
          phone: "+84 987 654 321",
          serviceId: "srv-haircut",
          serviceName: "Стрижка",
          variantName: "Стандарт",
          specialistId: "spec-artem",
          specialistName: "Артём",
          date: todayStr,
          time: "15:00",
          duration: 60,
          price: 400000,
          status: "new",
          comment: "Skin fade по бокам",
          createdAt: new Date().toISOString()
        }
      ];
      this.saveAppointments(initialBookings);
    }
  }

  getSalonInfo() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.SALON_INFO);
      return data ? JSON.parse(data) : DEFAULT_SALON_INFO;
    } catch (e) {
      return DEFAULT_SALON_INFO;
    }
  }

  saveSalonInfo(info) {
    localStorage.setItem(this.STORAGE_KEYS.SALON_INFO, JSON.stringify(info));
  }

  getCategories() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch (e) {
      return DEFAULT_CATEGORIES;
    }
  }

  getCategoryGroups() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.CATEGORY_GROUPS);
      return data ? JSON.parse(data) : DEFAULT_CATEGORY_GROUPS;
    } catch (e) {
      return DEFAULT_CATEGORY_GROUPS;
    }
  }

  getServices() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.SERVICES);
      return data ? JSON.parse(data) : DEFAULT_SERVICES;
    } catch (e) {
      return DEFAULT_SERVICES;
    }
  }

  saveServices(services) {
    localStorage.setItem(this.STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }

  addService(service) {
    const services = this.getServices();
    const newService = {
      id: "srv-" + Date.now().toString(36),
      categoryId: service.categoryId || "main-cuts",
      name: service.name,
      enName: service.enName || "",
      shortDesc: service.shortDesc || "",
      fullDesc: service.fullDesc || service.shortDesc || "",
      price: parseInt(service.price, 10) || 0,
      priceVariants: service.priceVariants || [],
      duration: parseInt(service.duration, 10) || 45,
      includes: service.includes || [],
      badge: service.badge || null,
      note: service.note || null
    };
    services.push(newService);
    this.saveServices(services);
    return newService;
  }

  updateService(id, updatedData) {
    const services = this.getServices();
    const idx = services.findIndex(s => s.id === id);
    if (idx !== -1) {
      services[idx] = { ...services[idx], ...updatedData };
      this.saveServices(services);
      return services[idx];
    }
    return null;
  }

  deleteService(id) {
    let services = this.getServices();
    services = services.filter(s => s.id !== id);
    this.saveServices(services);
  }

  getSpecialists() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.SPECIALISTS);
      return data ? JSON.parse(data) : DEFAULT_SPECIALISTS;
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
      id: "spec-" + Date.now().toString(36),
      name: spec.name,
      role: spec.role || "Барбер-стилист",
      experience: spec.experience || "Опыт работы в барберинге",
      categories: spec.categories || ["main-cuts", "beard-shave", "combo-deals"],
      avatar: spec.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      workDays: spec.workDays || [1, 2, 3, 4, 5, 6, 7],
      customSchedule: spec.customSchedule || {}
    };
    specialists.push(newSpec);
    this.saveSpecialists(specialists);
    return newSpec;
  }

  updateSpecialist(id, updatedData) {
    const specialists = this.getSpecialists();
    const idx = specialists.findIndex(s => s.id === id);
    if (idx !== -1) {
      specialists[idx] = { ...specialists[idx], ...updatedData };
      this.saveSpecialists(specialists);
      return specialists[idx];
    }
    return null;
  }

  deleteSpecialist(id) {
    let specialists = this.getSpecialists();
    specialists = specialists.filter(s => s.id !== id);
    this.saveSpecialists(specialists);
  }

  toggleDaySchedule(specId, dateStr) {
    const specialists = this.getSpecialists();
    const spec = specialists.find(s => s.id === specId);
    if (!spec) return null;
    if (!spec.customSchedule) spec.customSchedule = {};

    const current = spec.customSchedule[dateStr];
    if (current && current.isWorking === false) {
      spec.customSchedule[dateStr] = { isWorking: true, hours: "10:00 - 21:00" };
    } else if (current && current.isWorking === true) {
      spec.customSchedule[dateStr] = { isWorking: false, hours: "Выходной" };
    } else {
      // По умолчанию определяем по дню недели (0 - Вс, 1 - Пн ... 6 - Сб)
      const d = new Date(dateStr);
      const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
      const isDefaultWork = (spec.workDays || [1, 2, 3, 4, 5, 6, 7]).includes(dayOfWeek);
      spec.customSchedule[dateStr] = { isWorking: !isDefaultWork, hours: !isDefaultWork ? "10:00 - 21:00" : "Выходной" };
    }

    this.saveSpecialists(specialists);
    return spec.customSchedule[dateStr];
  }

  getAppointments() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.APPOINTMENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveAppointments(appointments) {
    localStorage.setItem(this.STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }

  addAppointment(booking) {
    const appointments = this.getAppointments();
    const newId = "606-" + Math.floor(100 + Math.random() * 900);
    
    // Если клиент выбрал «Любой свободный мастер» (id: 'any'),
    // автоматически назначаем свободного дежурного барбера, работающего в этот день
    let assignedSpecId = booking.specialistId || "any";
    let assignedSpecName = booking.specialistName || "Любой свободный мастер";

    if (assignedSpecId === "any" || !assignedSpecId) {
      const specialists = this.getSpecialists();
      const bookingDate = booking.date;
      const d = new Date(bookingDate);
      const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();

      // Находим мастера, работающего в эту дату, у которого нет записи в этот час
      const bookingHour = parseInt((booking.time || '10:00').split(':')[0], 10);
      const workingSpecs = specialists.filter(sp => {
        if (sp.customSchedule && sp.customSchedule[bookingDate]) {
          return sp.customSchedule[bookingDate].isWorking;
        }
        return (sp.workDays || [1,2,3,4,5,6,7]).includes(dayOfWeek);
      });

      // Ищем свободного
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
      status: "new", // new, confirmed, completed, cancelled
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
window.code606Data = new BarbershopDataService();
// Для совместимости с модулями HD Hair Lab:
window.hdData = window.code606Data;
