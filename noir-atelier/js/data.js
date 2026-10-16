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
  whatsapp: "javascript:void(0)",
  telegram: "https://t.me/litt1e_roo",
  instagram: "javascript:void(0)",
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
    icon: "", 
    desc: "Авторские мужские стрижки, моделирование бороды, королевское бритьё и тонирование седины" 
  },
  { 
    id: "women-style", 
    name: "Женские стрижки и укладки", 
    icon: "", 
    desc: "Текстурные стрижки по технике Vidal Sassoon, брашинг, вечерние образы и уход за бровями" 
  },
  { 
    id: "kids-style", 
    name: "Детские стрижки", 
    icon: "", 
    desc: "Стильные детские и подростковые формы, фейды, фигурные выстриги и семейный комплекс «Отец + Сын»" 
  },
  { 
    id: "spa-care", 
    name: "SPA-уход и восстановление", 
    icon: "", 
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
    includes: [
      "Консультация топ-стилиста и подбор индивидуальной геометрии стрижки",
      "Мытьё головы до и после премиальным шампунем с массажем кожи головы",
      "Стрижка ножницами и машинкой с ювелирной проработкой текстуры",
      "Прецизионная обработка кантов шейвером и триммером",
      "Финишный стайлинг селективной матовой глиной или пастой",
      "Чашка свежесваренного спешелти-кофе или напиток из Atelier Bar"
    ],
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
    includes: [
      "Построение симметричной геометрии и подбор длины бороды",
      "Распаривание кожи горячим компрессом с эфирными маслами сандала",
      "Стрижка и контурирование триммером и классической бритвой",
      "Питание волос смягчающим органическим бальзамом и маслом",
      "Охлаждающий компресс и фирменный одеколон"
    ],
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
    includes: [
      "Подготовка кожи пре-шейв маслом для идеального скольжения",
      "Распаривающий компресс и взбивание теплой пены из барсучьего помазка",
      "Традиционное бритьё открытым лезвием в 2 прохода (по росту и против)",
      "Закрывающий холодный компресс с гидролатом мяты для сужения пор",
      "Восстанавливающий крем-флюид после бритья против раздражения"
    ],
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
    includes: [
      "Подбор индивидуального полутона красителя под естественный оттенок",
      "Мягкое безаммиачное тонирование волос или бороды за 10–15 минут",
      "Мытьё головы стабилизирующим шампунем с антиоксидантами",
      "Закрытие кутикулы питательным кондиционером",
      "Лёгкая естественная укладка без видимых следов окрашивания"
    ],
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
    includes: [
      "Диагностика структуры и типа волос с консультацией стилиста",
      "Мытьё бессульфатным SPA-шампунем с глубоким увлажнением",
      "Текстурная стрижка по технике Vidal Sassoon любой сложности",
      "Нанесение термозащитного флюида с эффектом шелка",
      "Салонный брашинг на круглый браш с созданием объёма",
      "Фирменный напиток из коллекции Atelier Bar"
    ],
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
    includes: [
      "Очищение волос мягким шампунем и экспресс-кондиционирование",
      "Создание стойкого прикорневого объёма",
      "Укладка на выбор: голливудские локоны, пляжная текстура или зеркальная гладь",
      "Фиксация невесомым подвижным спреем с защитой от влаги"
    ],
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
    includes: [
      "Колористический подбор оттенка по цветотипу лица",
      "Тонирование безаммиачным красителем Gloss с керамидами",
      "Глубокая маска для фиксации пигмента и закрытия кутикулы",
      "Брашинг и финишный сияющий стайлинг"
    ],
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
    includes: [
      "Очищение и деликатный пилинг зоны бровей",
      "Моделирование идеальной симметрии нитью и пинцетом",
      "Долговременная укладка и ламинирование кератиновым составом",
      "Стойкое гипоаллергенное окрашивание и закрепляющий гель"
    ],
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
    includes: [
      "Внимательное знакомство и дружелюбная адаптация ребёнка",
      "Мытьё головы мягким гипоаллергенным детским шампунем",
      "Бережная стрижка ножницами и машинкой",
      "Лёгкий безалкогольный стайлинг и сладкий комплимент"
    ],
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
    includes: [
      "Подбор молодёжного силуэта (Mid/Low Fade, Crop, Taper, Grunge)",
      "Чистые переходы и идеальная растушёвка машинкой",
      "Мытьё головы и очищение от срезанных волос",
      "Стайлинг текстурной матовой глиной и экспресс-обучение укладке"
    ],
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
    includes: [
      "Согласование эскиза рисунка (молнии, полосы, геометрические узоры)",
      "Филигранный выстриг триммером и доводка шейвером",
      "Обработка кожи антисептическим успокаивающим лосьоном"
    ],
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
    includes: [
      "Синхронное обслуживание папы и сына в соседних креслах",
      "Полная авторская стрижка NOIR для отца со стайлингом",
      "Модельная стрижка для сына с фигурным выстригом по желанию",
      "Мытьё головы и массаж для обоих гостей",
      "Свежий кофе для папы и фирменный напиток/лимонад для сына"
    ],
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
    includes: [
      "Энзимный трихологический пилинг и деликатный скраб кожи головы",
      "Глубокое очищение волосяных фолликулов от стайлинга и себума",
      "Охлаждающая детокс-маска с экстрактом чайного дерева и мяты",
      "Точечный лимфодренажный массаж воротниковой зоны",
      "Сушка феном со стимулирующим лосьоном для роста волос"
    ],
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
    includes: [
      "Очищение хелатирующим шампунем глубокого проникновения",
      "Послойное нанесение аминокислотного и липидного концентратов",
      "Термоактивация молекулярного состава мягким инфракрасным теплом",
      "Запечатывание кутикулы разглаживающим флюидом",
      "Брашинг и зеркальный финишный блеск"
    ],
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
    includes: [
      "Подбор индивидуального аромамасла (сандал, кедр, вербена)",
      "30 минут точечного антистресс-массажа головы, шеи и плечевого пояса",
      "Снятие мышечных зажимов и улучшение микроциркуляции",
      "Травяной сбор или чашка чая в лаундж-зоне"
    ],
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
    includes: [
      "Комплексный 4-этапный протокол: детокс кожи головы + реконструкция волос",
      "Питательная термо-маска с натуральными пептидами и жидким шелком",
      "25 минут непрерывного расслабляющего массажа с аромамаслами",
      "Закрывающий защитный флюид и салонная укладка на браш",
      "Любой напиток из коллекции Atelier Bar"
    ],
    price: 950000,
    duration: 90,
    popular: false
  }
];

function generateDemoAppointments() {
  const now = Date.now();
  const today = new Date(now).toISOString().split('T')[0];
  const tomorrow = new Date(now + 86400000).toISOString().split('T')[0];
  const daysAgo = (d) => new Date(now - d * 86400000).toISOString().split('T')[0];

  return [
    {
      id: "NOIR-101",
      clientName: "Александр Волков",
      phone: "+7 916 123-45-67",
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
      comment: "Пожелание: текстура сверху, низ под насадку 1.5 мм",
      createdAt: new Date().toISOString()
    },
    {
      id: "NOIR-102",
      clientName: "Екатерина Смирнова",
      phone: "+7 925 889-11-22",
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
    },
    // Прошлые завершенные визиты для истории гостей в карточке
    {
      id: "NOIR-091",
      clientName: "Александр Волков",
      phone: "+7 916 123-45-67",
      serviceId: "srv-men-1",
      serviceName: "Авторская стрижка NOIR (Signature Cut)",
      variantName: "Стандарт",
      specialistId: "spec-alex",
      specialistName: "Alex Gray",
      date: daysAgo(18),
      time: "12:00",
      duration: 60,
      price: 450000,
      status: "completed",
      comment: "Стрижка перед командировкой, идеальный переход",
      createdAt: new Date(now - 18 * 86400000).toISOString()
    },
    {
      id: "NOIR-078",
      clientName: "Александр Волков",
      phone: "+7 916 123-45-67",
      serviceId: "srv-men-4",
      serviceName: "Камуфляж седины и тонирование + Стрижка",
      variantName: "Премиум",
      specialistId: "spec-alex",
      specialistName: "Alex Gray",
      date: daysAgo(45),
      time: "14:00",
      duration: 90,
      price: 750000,
      status: "completed",
      comment: "Мягкое естественное тонирование висков",
      createdAt: new Date(now - 45 * 86400000).toISOString()
    },
    {
      id: "NOIR-062",
      clientName: "Александр Волков",
      phone: "+7 916 123-45-67",
      serviceId: "srv-men-1",
      serviceName: "Авторская стрижка NOIR (Signature Cut)",
      variantName: "Стандарт",
      specialistId: "spec-alex",
      specialistName: "Alex Gray",
      date: daysAgo(80),
      time: "11:30",
      duration: 60,
      price: 450000,
      status: "completed",
      comment: "Регулярное обновление фейда",
      createdAt: new Date(now - 80 * 86400000).toISOString()
    },
    {
      id: "NOIR-042",
      clientName: "Александр Волков",
      phone: "+7 916 123-45-67",
      serviceId: "srv-men-1",
      serviceName: "Авторская стрижка NOIR (Signature Cut)",
      variantName: "Стандарт",
      specialistId: "spec-alex",
      specialistName: "Alex Gray",
      date: daysAgo(120),
      time: "11:00",
      duration: 60,
      price: 450000,
      status: "completed",
      comment: "Первый визит в студию, подобрали геометрию стрижки",
      createdAt: new Date(now - 120 * 86400000).toISOString()
    },
    {
      id: "NOIR-083",
      clientName: "Дмитрий и сын Артем",
      phone: "+7 905 771-33-88",
      serviceId: "srv-kid-4",
      serviceName: "Комплекс «Отец + Сын»",
      variantName: "Комплекс",
      specialistId: "spec-max",
      specialistName: "Max Rivera",
      date: daysAgo(28),
      time: "15:00",
      duration: 75,
      price: 700000,
      status: "completed",
      comment: "Сыну молния на виске, отцу классический андеркат",
      createdAt: new Date(now - 28 * 86400000).toISOString()
    },
    {
      id: "NOIR-068",
      clientName: "Дмитрий и сын Артем",
      phone: "+7 905 771-33-88",
      serviceId: "srv-kid-4",
      serviceName: "Комплекс «Отец + Сын»",
      variantName: "Комплекс",
      specialistId: "spec-max",
      specialistName: "Max Rivera",
      date: daysAgo(60),
      time: "14:00",
      duration: 75,
      price: 700000,
      status: "completed",
      comment: "Повторили стрижку перед началом учебы",
      createdAt: new Date(now - 60 * 86400000).toISOString()
    },
    {
      id: "NOIR-087",
      clientName: "Екатерина Смирнова",
      phone: "+7 925 889-11-22",
      serviceId: "srv-fem-3",
      serviceName: "Тонирование Gloss & Tone",
      variantName: "Премиум",
      specialistId: "spec-elena",
      specialistName: "Elena Rostova",
      date: daysAgo(35),
      time: "16:00",
      duration: 90,
      price: 750000,
      status: "completed",
      comment: "Формула Gloss 9.12 + 1.5%, закрытие кутикулы",
      createdAt: new Date(now - 35 * 86400000).toISOString()
    },
    {
      id: "NOIR-059",
      clientName: "Екатерина Смирнова",
      phone: "+7 925 889-11-22",
      serviceId: "srv-fem-1",
      serviceName: "Текстурная стрижка и стайлинг",
      variantName: "Стандарт",
      specialistId: "spec-elena",
      specialistName: "Elena Rostova",
      date: daysAgo(88),
      time: "13:00",
      duration: 75,
      price: 600000,
      status: "completed",
      comment: "Первый визит, бережный срез по кончикам",
      createdAt: new Date(now - 88 * 86400000).toISOString()
    }
  ];
}

const DEFAULT_CLIENTS = [
  {
    id: "client-1",
    name: "Александр Волков",
    phone: "+7 916 123-45-67",
    normalizedPhone: "79161234567",
    telegram: "@volkov_alex",
    gender: "male",
    category: "vip",
    notes: "Предпочитает эспрессо без сахара перед началом стрижки. Не любит громкую музыку.",
    hairNotes: "Жесткие густые волосы, стрижка по форме черепа, низкий фейд 1.5 мм с идеальной растушёвкой. Чувствительная кожа на затылке (обработка тальком без спирта).",
    firstVisit: "2026-06-15",
    lastVisit: "2026-10-16",
    totalVisits: 5,
    totalSpent: 2250000,
    favoriteSpecialistId: "spec-alex",
    favoriteSpecialistName: "Alex Gray",
    tags: ["VIP", "Низкий фейд", "Эспрессо"]
  },
  {
    id: "client-2",
    name: "Екатерина Смирнова",
    phone: "+7 925 889-11-22",
    normalizedPhone: "79258891122",
    telegram: "@kate_smirnova",
    gender: "female",
    category: "regular",
    notes: "Любит зелёный чай с жасмином. Ценит бережное отношение к длине у лица.",
    hairNotes: "Тонкие пористые волосы после осветления. Использовать термозащиту до 220°C, формулу Gloss 9.12 + 1.5%. Не использовать филировочные ножницы.",
    firstVisit: "2026-07-20",
    lastVisit: "2026-10-16",
    totalVisits: 3,
    totalSpent: 1950000,
    favoriteSpecialistId: "spec-elena",
    favoriteSpecialistName: "Elena Rostova",
    tags: ["Постоянный гость", "Блонд", "Gloss"]
  },
  {
    id: "client-3",
    name: "Дмитрий и сын Артем",
    phone: "+7 905 771-33-88",
    normalizedPhone: "79057713388",
    telegram: "@dmitry_artem",
    gender: "male",
    category: "regular",
    notes: "Приходят всегда вместе по выходным. Сыну Артёму 9 лет, любит какао и конфеты.",
    hairNotes: "Отец: классический андеркат, укладка помадой. Сын: выбритый зигзаг или молния на левом виске, текстурный кроп сверху.",
    firstVisit: "2026-08-05",
    lastVisit: "2026-10-16",
    totalVisits: 4,
    totalSpent: 2800000,
    favoriteSpecialistId: "spec-max",
    favoriteSpecialistName: "Max Rivera",
    tags: ["Семейный визит", "Отец + Сын", "Max Rivera"]
  },
  {
    id: "client-4",
    name: "Анастасия Белова",
    phone: "+7 912 334-99-00",
    normalizedPhone: "79123349900",
    telegram: "@anastasia_bel",
    gender: "female",
    category: "new",
    notes: "Впервые пришла по рекомендации. Интересуется уходом за поврежденными волосами после моря.",
    hairNotes: "Сухие концы после солнца и соленой воды. Рекомендовано молекулярное восстановление Tokio Inkarami и домашняя маска с липидами.",
    firstVisit: "2026-10-16",
    lastVisit: "2026-10-16",
    totalVisits: 1,
    totalSpent: 650000,
    favoriteSpecialistId: "spec-sofia",
    favoriteSpecialistName: "Sofia Vance",
    tags: ["Новый гость", "SPA", "Tokio Inkarami"]
  },
  {
    id: "client-5",
    name: "Михаил Воронов",
    phone: "+7 960 112-44-33",
    normalizedPhone: "79601124433",
    telegram: "@voronov_m",
    gender: "male",
    category: "new",
    notes: "Записан на завтра на моделирование бороды перед важными переговорами.",
    hairNotes: "Густая жесткая борода, четкие контуры щек и шеи, горячий компресс с маслом сандала.",
    firstVisit: "2026-10-17",
    lastVisit: "2026-10-17",
    totalVisits: 1,
    totalSpent: 250000,
    favoriteSpecialistId: "spec-max",
    favoriteSpecialistName: "Max Rivera",
    tags: ["Новый гость", "Борода", "Контуры"]
  }
];

class NoirDataService {
  constructor() {
    this.STORAGE_KEYS = {
      SALON: "noir_salon_info",
      CATEGORIES: "noir_categories",
      SERVICES: "noir_services",
      SPECIALISTS: "noir_specialists",
      APPOINTMENTS: "noir_appointments",
      CLIENTS: "noir_clients"
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
    const existingApps = localStorage.getItem(this.STORAGE_KEYS.APPOINTMENTS);
    if (!existingApps || existingApps.includes("Константин Васильев") || !existingApps.includes("NOIR-091")) {
      localStorage.setItem(this.STORAGE_KEYS.APPOINTMENTS, JSON.stringify(generateDemoAppointments()));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.CLIENTS)) {
      localStorage.setItem(this.STORAGE_KEYS.CLIENTS, JSON.stringify(DEFAULT_CLIENTS));
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
    try {
      this.syncClientForAppointment(newRecord);
    } catch (e) {
      console.error("Error syncing client for appointment:", e);
    }
    return newRecord;
  }

  updateAppointment(id, updatedFields) {
    const appointments = this.getAppointments();
    const idx = appointments.findIndex(a => a.id === id);
    if (idx !== -1) {
      appointments[idx] = { ...appointments[idx], ...updatedFields };
      this.saveAppointments(appointments);
      try {
        this.syncClientForAppointment(appointments[idx]);
      } catch (e) {
        console.error("Error syncing client:", e);
      }
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
      try {
        this.syncClientForAppointment(item);
      } catch (e) {
        console.error("Error syncing client:", e);
      }
      return true;
    }
    return false;
  }

  // ==========================================
  // КЛИЕНТСКАЯ БАЗА И КАРТОЧКА ГОСТЯ (CRM)
  // ==========================================
  normalizePhone(phone) {
    if (!phone) return "";
    return String(phone).replace(/\D/g, "");
  }

  getClients() {
    try {
      const stored = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CLIENTS));
      if (Array.isArray(stored) && stored.length > 0) {
        return stored;
      }
      return DEFAULT_CLIENTS;
    } catch (e) {
      return DEFAULT_CLIENTS;
    }
  }

  saveClients(clients) {
    localStorage.setItem(this.STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }

  getClientById(id) {
    const clients = this.getClients();
    return clients.find(c => c.id === id) || null;
  }

  getClientByPhone(phone) {
    const norm = this.normalizePhone(phone);
    if (!norm) return null;
    const clients = this.getClients();
    return clients.find(c => {
      const cNorm = this.normalizePhone(c.phone);
      return cNorm && (cNorm === norm || (norm.length >= 10 && cNorm.endsWith(norm.slice(-10))));
    }) || null;
  }

  addClient(clientData) {
    const clients = this.getClients();
    const newId = "client-" + Date.now();
    const newClient = {
      id: newId,
      name: clientData.name || "Гость",
      phone: clientData.phone || "",
      normalizedPhone: this.normalizePhone(clientData.phone),
      telegram: clientData.telegram || "",
      gender: clientData.gender || "male",
      category: clientData.category || "new",
      notes: clientData.notes || "",
      hairNotes: clientData.hairNotes || "",
      firstVisit: clientData.firstVisit || new Date().toISOString().split('T')[0],
      lastVisit: clientData.lastVisit || new Date().toISOString().split('T')[0],
      totalVisits: clientData.totalVisits || 1,
      totalSpent: clientData.totalSpent || 0,
      favoriteSpecialistId: clientData.favoriteSpecialistId || "",
      favoriteSpecialistName: clientData.favoriteSpecialistName || "",
      tags: clientData.tags || ["Новый гость"]
    };
    clients.unshift(newClient);
    this.saveClients(clients);
    return newClient;
  }

  updateClient(id, updatedFields) {
    const clients = this.getClients();
    const idx = clients.findIndex(c => c.id === id);
    if (idx !== -1) {
      if (updatedFields.phone) {
        updatedFields.normalizedPhone = this.normalizePhone(updatedFields.phone);
      }
      clients[idx] = { ...clients[idx], ...updatedFields };
      this.saveClients(clients);
      return clients[idx];
    }
    return null;
  }

  deleteClient(id) {
    let clients = this.getClients();
    clients = clients.filter(c => c.id !== id);
    this.saveClients(clients);
    return true;
  }

  // Получение всех посещений и услуг конкретного гостя
  getClientAppointments(clientIdOrPhone) {
    const appointments = this.getAppointments();
    const client = this.getClientById(clientIdOrPhone) || this.getClientByPhone(clientIdOrPhone);
    const targetNorm = client ? client.normalizedPhone : this.normalizePhone(clientIdOrPhone);
    const targetName = client ? client.name.toLowerCase().trim() : '';

    return appointments.filter(a => {
      const aNorm = this.normalizePhone(a.phone);
      if (targetNorm && aNorm) {
        if (targetNorm === aNorm || (targetNorm.length >= 10 && aNorm.endsWith(targetNorm.slice(-10)))) {
          return true;
        }
      }
      if (targetName && a.clientName && a.clientName.toLowerCase().trim() === targetName) {
        return true;
      }
      return false;
    });
  }

  // Автоматическая синхронизация/создание карточки клиента при любой брони
  syncClientForAppointment(app) {
    if (!app || (!app.phone && !app.clientName)) return;

    const clients = this.getClients();
    const appNorm = this.normalizePhone(app.phone);
    const appName = (app.clientName || '').trim();

    let clientIdx = -1;

    if (appNorm) {
      clientIdx = clients.findIndex(c => {
        const cNorm = this.normalizePhone(c.phone);
        return cNorm && (cNorm === appNorm || (appNorm.length >= 10 && cNorm.endsWith(appNorm.slice(-10))));
      });
    }

    if (clientIdx === -1 && appName) {
      clientIdx = clients.findIndex(c => c.name.toLowerCase().trim() === appName.toLowerCase());
    }

    if (clientIdx !== -1) {
      const client = { ...clients[clientIdx] };
      const clientApps = this.getClientAppointments(client.id);

      let totalVisits = 0;
      let totalSpent = 0;
      let lastDate = client.lastVisit || app.date || new Date().toISOString().split('T')[0];
      const specialistFreq = {};

      clientApps.forEach(a => {
        if (a.status !== 'cancelled') {
          totalVisits++;
          totalSpent += (a.price || 0);
          if (a.date && a.date >= lastDate) {
            lastDate = a.date;
          }
          if (a.specialistName) {
            specialistFreq[a.specialistName] = (specialistFreq[a.specialistName] || 0) + 1;
          }
        }
      });

      let topMaster = client.favoriteSpecialistName || app.specialistName;
      let maxCount = 0;
      for (const [mName, cnt] of Object.entries(specialistFreq)) {
        if (cnt > maxCount) {
          maxCount = cnt;
          topMaster = mName;
        }
      }

      let category = client.category;
      if (totalVisits >= 5 || totalSpent >= 2000000) {
        category = 'vip';
      } else if (totalVisits >= 2) {
        category = 'regular';
      } else {
        category = 'new';
      }

      client.lastVisit = lastDate;
      client.totalVisits = Math.max(totalVisits, client.totalVisits || 1);
      client.totalSpent = Math.max(totalSpent, client.totalSpent || 0);
      client.favoriteSpecialistName = topMaster;
      client.category = category;

      if (app.phone && !client.phone) {
        client.phone = app.phone;
        client.normalizedPhone = appNorm;
      }
      if (app.clientName && (!client.name || client.name === 'Гость')) {
        client.name = app.clientName;
      }

      clients[clientIdx] = client;
      this.saveClients(clients);
      return client;
    } else {
      // Автоматическое создание новой карточки гостя
      const newClient = {
        id: "client-" + Date.now(),
        name: appName || "Новый гость",
        phone: app.phone || "",
        normalizedPhone: appNorm,
        telegram: "",
        gender: "male",
        category: "new",
        notes: app.comment ? ("Заметка из брони: " + app.comment) : "",
        hairNotes: "",
        firstVisit: app.date || new Date().toISOString().split('T')[0],
        lastVisit: app.date || new Date().toISOString().split('T')[0],
        totalVisits: 1,
        totalSpent: app.price || 0,
        favoriteSpecialistId: app.specialistId || "",
        favoriteSpecialistName: app.specialistName || "Любой свободный мастер",
        tags: ["Новый гость"]
      };

      clients.unshift(newClient);
      this.saveClients(clients);
      return newClient;
    }
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
