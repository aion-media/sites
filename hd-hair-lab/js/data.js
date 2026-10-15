/**
 * H&D Hair Lab (Nha Trang) - Database & Data Service
 * Оцифровка прейскуранта, специалистов и локальное хранилище данных CRM
 */

const DEFAULT_SALON_INFO = {
  name: "H&D Hair Lab",
  fullName: "H&D Hair Lab | Studio of Coloring and Care",
  tagline: "Красота — это наука. Мы знаем формулу.",
  subTagline: "Студия экспертной колористики, стрижек и молекулярного ухода за волосами",
  city: "Нячанг, Вьетнам",
  address: "11 Đường Cao Văn Bé, Vĩnh Phước, Nha Trang, Khánh Hòa 650000",
  addressShort: "11 Cao Văn Bé, Oceanus / Mường Thanh Viễn Triều",
  phone: "+84 382 437 900",
  phoneRaw: "84382437900",
  whatsapp: "https://wa.me/84382437900",
  telegram: "https://t.me/HD_hair_lab",
  instagram: "https://www.instagram.com/hd.hairlab.nhatrang/",
  altegioUrl: "https://n1382840.alteg.io",
  altegioUrlAlt: "https://n1388874.alteg.io",
  googleMapsUrl: "https://maps.app.goo.gl/Zwg1nrnKz9LPdDKo7",
  hours: "Ежедневно 10:00 – 20:00",
  features: [
    "Русскоязычные колористы с опытом работы от 15 лет",
    "Сложные техники осветления без повреждения полотна (AirTouch, Total Blond)",
    "Молекулярный протокол защиты и восстановления волос в каждом окрашивании",
    "Адаптация ухода и окрашивания под тропический влажный климат Нячанга",
    "Бесплатная диагностика волос и тест пряди перед любой процедурой"
  ]
};

const DEFAULT_CATEGORIES = [
  { id: "complex-color", name: "Сложные техники осветления", icon: "✨", desc: "AirTouch, Balayage, Shatush, Total Blond и Контуринг с защитой полотна" },
  { id: "single-color", name: "Однотонное окрашивание", icon: "🎨", desc: "Корни, тонирование и глубина цвета по всей длине с защитой и без" },
  { id: "special-color", name: "Специальные услуги колористики", icon: "🔬", desc: "Снятие цвета, выход из черного, предпигментация и частичные техники" },
  { id: "haircuts", name: "Стрижки и укладки", icon: "✂️", desc: "Женские стрижки, кудрявый метод (Curly Method), брашинг и локоны" },
  { id: "barber", name: "Мужской зал и борода", icon: "💈", desc: "Стрижки ножницами и машинкой, идеальный фейд, оформление бороды, камуфляж седины" },
  { id: "care-spa", name: "Восстановление и SPA волос", icon: "💧", desc: "Холодное молекулярное восстановление «Счастье для волос», пилинги кожи головы" },
  { id: "makeup-art", name: "Визаж и Body-Art", icon: "💄", desc: "Профессиональный вечерний макияж, Art-Makeup, экспресс-образы и боди-арт" },
  { id: "brows-face", name: "Оформление бровей и депиляция", icon: "👁️", desc: "Архитектура пинцетом и воском, ламинирование, долговременная укладка, окрашивание" },
  { id: "consultation", name: "Диагностика и тест-прядь", icon: "🔍", desc: "Бесплатная профессиональная консультация и диагностика качества волос" }
];

const DEFAULT_CATEGORY_GROUPS = [
  {
    id: "group-color",
    name: "Окрашивание и блонд",
    shortName: "Окрашивание",
    icon: "✨",
    categoryIds: ["complex-color", "single-color", "special-color"],
    desc: "AirTouch, Balayage, Total Blond, тонирование и спец-колористика"
  },
  {
    id: "group-haircuts",
    name: "Стрижки и укладки",
    shortName: "Стрижки",
    icon: "✂️",
    categoryIds: ["haircuts"],
    desc: "Женские стрижки, кудрявый метод CGM, брашинг и локоны"
  },
  {
    id: "group-barber",
    name: "Мужской зал и борода",
    shortName: "Мужской зал",
    icon: "💈",
    categoryIds: ["barber"],
    desc: "Стрижки Fade, моделирование бороды, камуфляж седины"
  },
  {
    id: "group-care",
    name: "Восстановление и SPA",
    shortName: "Уход и SPA",
    icon: "💧",
    categoryIds: ["care-spa"],
    desc: "Молекулярное восстановление «Счастье для волос», детокс-пилинги"
  },
  {
    id: "group-beauty",
    name: "Брови и Визаж",
    shortName: "Брови и Визаж",
    icon: "💄",
    categoryIds: ["brows-face", "makeup-art"],
    desc: "Архитектура бровей, ламинирование, стойкий визаж, депиляция"
  },
  {
    id: "group-consultation",
    name: "Диагностика и тест-прядь",
    shortName: "Консультация",
    icon: "🔍",
    categoryIds: ["consultation"],
    desc: "Бесплатная очная диагностика полотна волос и тест-прядь"
  }
];

const DEFAULT_SPECIALISTS = [
  {
    id: "spec-helen",
    name: "Helen (Елена)",
    role: "Шеф-колорист, основатель студии",
    experience: "Опыт более 15 лет. Международный эксперт по сложным техникам AirTouch, Total Blond и выходу из черного",
    categories: ["complex-color", "single-color", "special-color", "care-spa", "consultation"],
    avatar: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80",
    workDays: [1, 2, 3, 4, 5, 6, 7]
  },
  {
    id: "spec-daria",
    name: "Дарья",
    role: "Ведущий стилист-колорист, мастер кудрявого метода",
    experience: "Опыт 9 лет. Геометрические женские стрижки, укладки, Curly Method, бережное тонирование",
    categories: ["complex-color", "single-color", "haircuts", "care-spa", "consultation"],
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    workDays: [1, 2, 3, 4, 5, 6]
  },
  {
    id: "spec-nikita",
    name: "Никита",
    role: "Барбер-стилист, эксперт мужского стиля",
    experience: "Опыт 7 лет. Прецизионный Fade, моделирование бороды опасным лезвием, камуфляж седины",
    categories: ["barber", "haircuts", "consultation"],
    avatar: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80",
    workDays: [2, 3, 4, 5, 6, 7]
  },
  {
    id: "spec-alina",
    name: "Алина",
    role: "Brow-артист & Визажист студии",
    experience: "Опыт 6 лет. Ламинирование и архитектура бровей, свадебный и Art-макияж, депиляция воском",
    categories: ["brows-face", "makeup-art", "consultation"],
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    workDays: [1, 3, 4, 5, 6, 7]
  }
];

const DEFAULT_SERVICES = [
  // --- 1. СЛОЖНЫЕ ТЕХНИКИ ОСВЕТЛЕНИЯ ---
  {
    id: "srv-airtouch",
    categoryId: "complex-color",
    name: "Сложные техники осветления (AirTouch / Balayage / Shatush)",
    shortDesc: "Премиальное рельефное осветление с мягким отрастанием до 6-9 месяцев",
    fullDesc: "Флагманская процедура студии. Включает выдув феном по прядям (AirTouch) или авторскую растяжку цвета (Balayage/Shatush). В стоимость уже входит комплекс премиального ухода: защита полотна волос при обесцвечивании, глубокое молекулярное восстановление структуры и стойкая нейтрализующая фиксация оттенка.",
    price: 6000000,
    priceVariants: [
      { name: "1-2 длина (до плеч)", price: 6000000 },
      { name: "3 длина (до лопаток)", price: 7000000 },
      { name: "4 длина (ниже лопаток)", price: 8000000 }
    ],
    duration: 300,
    includes: ["Защита полотна волос", "Молекулярное восстановление", "Фиксация цвета", "Укладка"],
    badge: "Хит студии",
    note: "Доплата +20% применяется при нарощенных / особо густых волосах"
  },
  {
    id: "srv-total-blond",
    categoryId: "complex-color",
    name: "Total Blond (натуральная база)",
    shortDesc: "Чистый сияющий блонд по всей длине с сохранением эластичности и блеска",
    fullDesc: "Полное первичное осветление натуральных волос до безупречного ровного фона осветления с последующим многослойным тонированием. Включает трёхэтапную защитную систему дисульфидных связей и молекулярную терапию волос.",
    price: 4000000,
    priceVariants: [
      { name: "1-2 длина (до плеч)", price: 4000000 },
      { name: "3 длина (до лопаток)", price: 5000000 },
      { name: "4 длина (ниже лопаток)", price: 6000000 }
    ],
    duration: 240,
    includes: ["Осветление полотна", "Защита связей", "Молекулярный уход", "Тонирование в холодный/теплый блонд"],
    badge: "Премиум",
    note: "Доплата +20% применяется при густых волосах"
  },
  {
    id: "srv-total-blond-touchup",
    categoryId: "complex-color",
    name: "Коррекция Total Blond (корни 1-2 см)",
    shortDesc: "Регулярное бережное осветление отросших корней блонда без перехлеста",
    fullDesc: "Прецизионная работа колориста для поддержания ровного цвета блонда. Чистое осветление отросшей прикорневой зоны (1-2 см) с нанесением молекулярного ухода и синхронизацией оттенка по всей длине.",
    price: 3500000,
    priceVariants: [
      { name: "1-2 длина (до плеч)", price: 3500000 },
      { name: "3 длина (до лопаток)", price: 4000000 },
      { name: "4 длина (ниже лопаток)", price: 4500000 }
    ],
    duration: 180,
    includes: ["Осветление корней 1-2 см", "Молекулярная терапия", "Тонирование по длине"],
    badge: "Must-Have",
    note: "Рекомендуется каждые 3-4 недели"
  },
  {
    id: "srv-contouring",
    categoryId: "complex-color",
    name: "Контуринг волос (Face Framing)",
    shortDesc: "Световые акценты у лица, подчеркивающие скулы, овал лица и цвет глаз",
    fullDesc: "Трендовое осветление передних прядей и височных зон, создающее эффект сияния кожи и объема у лица. Идеально для тех, кто хочет освежить образ без окрашивания всей массы волос. Включает защиту полотна и уход.",
    price: 4000000,
    duration: 150,
    includes: ["Осветление височной зоны", "Защита полотна волос", "Тонирование", "Укладка на брашинг"],
    badge: "Тренд 2026",
    note: null
  },
  {
    id: "srv-partial-color",
    categoryId: "complex-color",
    name: "Частичное окрашивание / Мелирование",
    shortDesc: "Осветление верхних слоев, теменной зоны или акцентных прядей",
    fullDesc: "Создание игры света и глубины на видимых зонах прически без окрашивания нижнего затылка. Идеально для поддержания цвета между глобальными окрашиваниями или первого знакомства со сложными техниками.",
    price: 5000000,
    duration: 180,
    includes: ["Частичное осветление", "Защитный молекулярный комплекс", "Тонирование"],
    badge: "Популярно",
    note: "Доплата +20% при густых волосах"
  },
  {
    id: "srv-color-correction-black",
    categoryId: "complex-color",
    name: "Выход из черного (КБ 1-5 УГТ)",
    shortDesc: "Сложная бережная смывка темного/черного пигмента с сохранением качества волос",
    fullDesc: "Экспертная работа высокой сложности. Депигментация накопленного темного бытового или салонного красителя в несколько этапов с постоянным контролем эластичности прядей, защитой дисульфидных мостиков и выходом в благородный шоколад, карамель или русый.",
    price: 8000000,
    duration: 360,
    includes: ["Многоэтапное кислотное/щелочное снятие", "Тест-прядь", "Молекулярное восстановление", "Выравнивание фона и тонирование"],
    badge: "Expert Level",
    note: "Точная стоимость определяется на бесплатной предварительной консультации с тест-прядью"
  },

  // --- 2. ОДНОТОННОЕ ОКРАШИВАНИЕ ---
  {
    id: "srv-single-color-standard",
    categoryId: "single-color",
    name: "Однотонное окрашивание (без восстановления)",
    shortDesc: "Глубокий ровный цвет, стойкое закрашивание седины и зеркальный блеск",
    fullDesc: "Классическое окрашивание европейскими премиальными красителями. Идеальное перекрытие седины, обновление оттенка или углубление натурального тона волос.",
    price: 1600000,
    priceVariants: [
      { name: "Корни 1-2 см", price: 1600000 },
      { name: "1-2 длина (до плеч)", price: 2100000 },
      { name: "3 длина (до лопаток)", price: 2400000 },
      { name: "4 длина (ниже лопаток)", price: 2700000 }
    ],
    duration: 120,
    includes: ["Подбор формулы цвета", "Нанесение красителя", "Стабилизация цвета", "Сушка"],
    badge: null,
    note: null
  },
  {
    id: "srv-single-color-care",
    categoryId: "single-color",
    name: "Однотонное окрашивание* (с защитой и молекулярным восстановлением)",
    shortDesc: "Окрашивание + интенсивный SPA-уход для сохранения шелковистости и мягкости",
    fullDesc: "Усовершенствованный протокол окрашивания: в красящую смесь и на полотно волос наносится ампульный уход с кератином и липидами, укрепляющий кутикулу волос и продлевающий стойкость цвета в 2 раза под солнцем Нячанга.",
    price: 2400000,
    priceVariants: [
      { name: "Корни 1-2 см", price: 2400000 },
      { name: "1-2 длина (до плеч)", price: 2900000 },
      { name: "3 длина (до лопаток)", price: 3200000 },
      { name: "4 длина (ниже лопаток)", price: 3700000 }
    ],
    duration: 150,
    includes: ["Защита полотна волос", "Молекулярный уход", "Стойкое окрашивание", "Фиксация цвета"],
    badge: "Рекомендуем",
    note: "Идеально для сухих, пористых или ранее осветленных волос"
  },

  // --- 3. СПЕЦИАЛЬНЫЕ УСЛУГИ КОЛОРИСТИКИ ---
  {
    id: "srv-color-removal",
    categoryId: "special-color",
    name: "Снятие цвета (одно нанесение)",
    shortDesc: "Мягкое декапирование нежелательного оттенка или перегруженного пигмента",
    fullDesc: "Деликатная процедура удаления неудачного оттенка (зелени, излишней серости, фиолета) или осветления косметической базы на 1-2 тона перед основным окрашиванием.",
    price: 800000,
    priceVariants: [
      { name: "1-2 длина", price: 800000 },
      { name: "3-4 длина", price: 1000000 }
    ],
    duration: 60,
    includes: ["Декапирующая эмульсия", "Стабилизация полотна"],
    badge: null,
    note: null
  },
  {
    id: "srv-pre-pigment",
    categoryId: "special-color",
    name: "Предпигментация",
    shortDesc: "Насыщение обесцвеченных пористых волос недостающим пигментом перед затемнением",
    fullDesc: "Специализированная технологическая операция, предотвращающая проявление грязно-зеленых и тусклых оттенков при переходе из блонда в темный или русый цвет.",
    price: 500000,
    duration: 40,
    includes: ["Прямые пигменты/микроэмульсия", "Подготовка полотна"],
    badge: null,
    note: null
  },

  // --- 4. СТРИЖКИ И УКЛАДКИ ---
  {
    id: "srv-haircut-women",
    categoryId: "haircuts",
    name: "Стрижка женская",
    shortDesc: "Индивидуальный подбор формы по анатомии лица, мытьё головы и укладка",
    fullDesc: "Архитектурная стрижка с учетом формы лица, направления роста волос и вашего повседневного стиля. Включает расслабляющее мытьё головы профессиональным шампунем и кондиционером, массаж кожи головы и укладку на брашинг.",
    price: 700000,
    duration: 60,
    includes: ["Консультация", "Мытьё головы с уходом", "Стрижка", "Укладка на брашинг"],
    badge: "Хит",
    note: null
  },
  {
    id: "srv-haircut-curly",
    categoryId: "haircuts",
    name: "Стрижка по кудрявому методу (Curly Haircut)",
    shortDesc: "Специальная сухая/влажная стрижка для вьющихся волос без филировки",
    fullDesc: "Экспертная техника для натуральных кудрей и волн. Каждая прядь прорабатывается с учетом естественного завитка, без разрушения текстуры. Включает глубокое увлажнение кудрей (CGM) и сушку на диффузор с формированием упругих локонов.",
    price: 800000,
    duration: 90,
    includes: ["Анализ завитка", "Стрижка без филировки", "Увлажняющий CGM-спастинг", "Стайлинг с диффузором"],
    badge: "Авторская техника",
    note: null
  },
  {
    id: "srv-bangs-cut",
    categoryId: "haircuts",
    name: "Стрижка челки",
    shortDesc: "Коррекция формы челки (шторка, прямая, косая, корейская текстурная)",
    fullDesc: "Быстрая и точная процедура оформления зоны челки для обновления свежести прически между основными стрижками.",
    price: 300000,
    duration: 25,
    includes: ["Оформление линии челки", "Легкий стайлинг"],
    badge: null,
    note: null
  },
  {
    id: "srv-brushing",
    categoryId: "haircuts",
    name: "Брашинг-укладка",
    shortDesc: "Объемная укладка феном и брашингом с гладкостью и воздушным прикорневым объемом",
    fullDesc: "Идеальная укладка для свидания, деловой встречи или фотосессии. Мытье головы с ухаживающим бальзамом, термозащита и вытягивание на круглую расческу с фиксацией формы.",
    price: 400000,
    priceVariants: [
      { name: "1-2 длина", price: 400000 },
      { name: "3-4 длина", price: 500000 }
    ],
    duration: 45,
    includes: ["Мытье головы", "Термозащита", "Укладка брашингом", "Текстурирующий спрей"],
    badge: null,
    note: null
  },
  {
    id: "srv-styling-waves",
    categoryId: "haircuts",
    name: "Укладка (локоны / волны)",
    shortDesc: "Стойкие голливудские волны, пляжная текстура или романтичные локоны на плойку/утюг",
    fullDesc: "Создание красивого стойкого рисунка локонов с термозащитным экраном, не склеивающим волосы в условиях морского бриза и влажности Нячанга.",
    price: 600000,
    duration: 60,
    includes: ["Подготовка полотна", "Стойкий стайлинг", "Создание локонов", "Фиксация блеском"],
    badge: "Для мероприятий",
    note: null
  },

  // --- 5. МУЖСКОЙ ЗАЛ И БОРОДА ---
  {
    id: "srv-haircut-men-combo",
    categoryId: "barber",
    name: "Стрижка мужская (машинка + ножницы)",
    shortDesc: "Классическая мужская стрижка с аккуратным переходом и геометрией",
    fullDesc: "Комбинированная техника: бока и затылок оформляются машинкой, верхняя зона прорабатывается ножницами по форме головы. Включает мытьё головы до и после стрижки, стайлинг премиум-глиной или пастой.",
    price: 400000,
    duration: 45,
    includes: ["Консультация", "Двойное мытье головы", "Стрижка", "Стайлинг"],
    badge: "Классика",
    note: null
  },
  {
    id: "srv-haircut-men-fade",
    categoryId: "barber",
    name: "Стрижка мужская Fade (Фейд)",
    shortDesc: "Дымчатый переход от нуля (Low, Mid, High Fade) с филигранной четкостью",
    fullDesc: "Прецизионная стрижка с идеальной градацией длины от чистой кожи шеи к длине на макушке с использованием шейверов и триммеров. Чистые контуры и современный силуэт.",
    price: 500000,
    duration: 60,
    includes: ["Шейвинг", "Дымчатый фейд", "Мытье головы", "Укладка"],
    badge: "Топ выбор",
    note: null
  },
  {
    id: "srv-haircut-men-scissors",
    categoryId: "barber",
    name: "Стрижка мужская (полностью ножницы)",
    shortDesc: "Удлиненные мужские стрижки, классика, гранж, каскады и естественная текстура",
    fullDesc: "Тонкая ручная работа исключительно прямыми и филировочными ножницами для ценителей удлиненных форм, свободного падения прядей и текстурных укладок.",
    price: 600000,
    duration: 60,
    includes: ["Мытье головы", "Ручная текстуризация ножницами", "Сушка и стайлинг"],
    badge: null,
    note: null
  },
  {
    id: "srv-beard-trim",
    categoryId: "barber",
    name: "Оформление и стрижка бороды",
    shortDesc: "Построение ровной формы бороды, сведение с висками, контуры триммером и бритвой",
    fullDesc: "Комплексный уход за бородой: распаривание, стрижка длины, четкие контуры щек и шеи, нанесение питательного масла с сандалом или табаком.",
    price: 300000,
    priceVariants: [
      { name: "Окантовка бороды (контуры)", price: 200000 },
      { name: "Полная стрижка и моделирование бороды", price: 300000 }
    ],
    duration: 35,
    includes: ["Тримминг", "Четкие линии", "Питательное масло для бороды"],
    badge: null,
    note: null
  },
  {
    id: "srv-grey-camo",
    categoryId: "barber",
    name: "Камуфлирование мужской седины",
    shortDesc: "Естественное приглушение седины за 15 минут без эффекта крашеных волос",
    fullDesc: "Специальный безаммиачный мужской гель-краситель тонирует только седые волоски, создавая абсолютно естественный эффект родного оттенка. Смывается плавно и незаметно, без границы отросших корней.",
    price: 500000,
    duration: 30,
    includes: ["Тонирование мужской формулой", "Мытье головы", "Укладка"],
    badge: "Быстро и незаметно",
    note: null
  },

  // --- 6. ВОССТАНОВЛЕНИЕ И SPA ВОЛОС ---
  {
    id: "srv-hair-botox-cold",
    categoryId: "care-spa",
    name: "Холодное молекулярное восстановление / «Счастье для волос»",
    shortDesc: "Глубокая реконструкция кортекса волоса пептидами, аминокислотами и кератином",
    fullDesc: "Мощная восстанавливающая процедура без термоутюжка и едких испарений. Заполняет пустоты в поврежденном полотне, восстанавливает природную эластичность, устраняет ломкость и сухость после морской воды и осветлений.",
    price: 1300000,
    priceVariants: [
      { name: "1-2 длина (до плеч)", price: 1300000 },
      { name: "3 длина (до лопаток)", price: 1500000 },
      { name: "4 длина (ниже лопаток)", price: 1800000 }
    ],
    duration: 90,
    includes: ["Глубокое очищение", "Аминокислотный бустер", "Липидная маска", "Увлажняющий финиш"],
    badge: "SOS-восстановление",
    note: "Помогает вернуть к жизни даже сильно поврежденные волосы"
  },
  {
    id: "srv-scalp-peeling",
    categoryId: "care-spa",
    name: "Пилинг кожи головы (Head Detox SPA)",
    shortDesc: "Глубокая эксфолиация себума, пыли и остатков стайлинга, стимуляция роста волос",
    fullDesc: "Салонный пилинг с фруктовыми AHA/BHA кислотами и охлаждающим ментолом. Очищает устья волосяных фолликулов, устраняет зуд, жирность у корней, продлевает свежесть прически и насыщает корни кислородом.",
    price: 900000,
    priceVariants: [
      { name: "1-2 длина", price: 900000 },
      { name: "3 длина", price: 1100000 },
      { name: "4 длина", price: 1300000 }
    ],
    duration: 60,
    includes: ["Кислотный детокс-пилинг", "Массаж кожи головы", "Успокаивающая эмульсия", "Сушка"],
    badge: "Свежесть и легкость",
    note: "Идеально в жарком и влажном климате Нячанга"
  },
  {
    id: "srv-complex-scalp-hair",
    categoryId: "care-spa",
    name: "Комплекс (Пилинг кожи головы + Молекулярное восстановление)",
    shortDesc: "Максимальный оздоровительный перезапуск: чистая кожа головы + шелковое полотно",
    fullDesc: "Синергия двух лучших процедур студии. Кислотный детокс кожи головы запускает микроциркуляцию, а многоэтапное молекулярное питание реконструирует длину от корней до кончиков.",
    price: 1900000,
    priceVariants: [
      { name: "1-2 длина", price: 1900000 },
      { name: "3 длина", price: 2200000 },
      { name: "4 длина", price: 2700000 }
    ],
    duration: 120,
    includes: ["Детокс-пилинг кожи головы", "Массаж", "Молекулярное «Счастье для волос»", "Укладка на брашинг"],
    badge: "Выгодный сет",
    note: "Экономия до 300 000 ₫ по сравнению с раздельными процедурами"
  },

  // --- 7. ВИЗАЖ И BODY-ART ---
  {
    id: "srv-makeup-pro",
    categoryId: "makeup-art",
    name: "Профессиональный макияж (Дневной / Вечерний / Nude)",
    shortDesc: "Стойкий премиальный визаж, подчеркивающий природную красоту без эффекта маски",
    fullDesc: "Индивидуальный подбор тона и текстур под ваш цветотип, форму глаз и освещение. Используем стойкую косметику, устойчивую к жаре и влажности (Tom Ford, Dior, Charlotte Tilbury, NARS).",
    price: 1500000,
    duration: 75,
    includes: ["Подготовка кожи", "Тон и светотеневая коррекция", "Макияж глаз и губ", "Фиксация стойкости"],
    badge: "Премиум",
    note: "Выезд на место сборов: +50% к стоимости"
  },
  {
    id: "srv-art-makeup",
    categoryId: "makeup-art",
    name: "Art-Makeup (Креативный / Фотосессии)",
    shortDesc: "Арт-образы, графика, стразы, глянец и креативные акценты для съемок и вечеринок",
    fullDesc: "Создание концептуального арт-макияжа любой сложности для глянцевых съемок, тематических событий, фестивалей и клипов.",
    price: 1500000,
    duration: 90,
    includes: ["Креативная графика", "Арт-текстуры/декор", "Стойкая фиксация"],
    badge: "Creative",
    note: "Стоимость от 1 500 000 ₫ в зависимости от сложности эскиза"
  },
  {
    id: "srv-body-art",
    categoryId: "makeup-art",
    name: "Body-Art",
    shortDesc: "Художественная роспись тела и открытых зон стойкими гипоаллергенными красками",
    fullDesc: "Рисунки и орнаменты на теле для перформансов, фотосессий у моря, праздников и показов.",
    price: 1500000,
    duration: 120,
    includes: ["Гипоаллергенные пигменты", "Стойкая защита от влаги"],
    badge: null,
    note: "От 1 500 000 ₫ в зависимости от площади рисунка"
  },
  {
    id: "srv-express-makeup",
    categoryId: "makeup-art",
    name: "Экспресс-макияж (при оформлении бровей)",
    shortDesc: "Быстрое выравнивание тона, сияние, легкий румянец и блеск для губ",
    fullDesc: "Идеальное дополнение к визиту на брови: свежий сияющий вид лица за 20 минут перед продолжением дня.",
    price: 800000,
    duration: 25,
    includes: ["BB-флюид", "Консилер", "Кремовые румяна", "Гель для бровей и бальзам для губ"],
    badge: "Быстро",
    note: "Доступно как спец-дополнение к оформлению бровей"
  },

  // --- 8. ОФОРМЛЕНИЕ БРОВЕЙ И ДЕПИЛЯЦИЯ ---
  {
    id: "srv-brow-correction",
    categoryId: "brows-face",
    name: "Коррекция формы бровей (пинцет + воск)",
    shortDesc: "Чистые линии и естественная гармоничная форма с бережным уходом за кожей",
    fullDesc: "Архитектура бровей с индивидуальным расчетом пропорций лица. Бережное удаление пушка премиальным полимерным воском и точечная доработка пинцетом.",
    price: 300000,
    duration: 30,
    includes: ["Подготовка кожи", "Архитектура формы", "Воск + пинцет", "Успокаивающий лосьон"],
    badge: null,
    note: null
  },
  {
    id: "srv-brow-tinting",
    categoryId: "brows-face",
    name: "Окрашивание бровей (краской)",
    shortDesc: "Стойкий оттенок с мягким графичным или натуральным пудровым отпечатком на коже",
    fullDesc: "Окрашивание профессиональными красителями с богатой палитрой (RefectoCil, Thuya, Levissime). Подбор индивидуального подтона под цвет корней волос.",
    price: 300000,
    duration: 30,
    includes: ["Обезжиривание", "Колористический замес", "Окрашивание", "Фиксация"],
    badge: null,
    note: null
  },
  {
    id: "srv-brow-lamination",
    categoryId: "brows-face",
    name: "Ламинирование бровей (долговременная укладка)",
    shortDesc: "Послушные, объемные и ухоженные волоски в желаемом направлении до 6 недель",
    fullDesc: "Бережная процедура изменения направления роста волосков. Брови становятся визуально гуще, шире и легко укладываются одним движением щеточки.",
    price: 500000,
    duration: 45,
    includes: ["3-этапный состав для ламинирования", "Кератиновый ботокс-уход", "Укладка"],
    badge: "Топ услуга",
    note: null
  },
  {
    id: "srv-brow-combo-corr-tint",
    categoryId: "brows-face",
    name: "Комплекс: Коррекция + Окрашивание бровей",
    shortDesc: "Идеальная форма и гармоничный цвет в один визит",
    fullDesc: "Полный базовый уход за бровями: моделирование воском и пинцетом + колористическое окрашивание стойкой краской.",
    price: 500000,
    duration: 45,
    includes: ["Архитектура", "Коррекция воск+пинцет", "Окрашивание", "Консьерж-совет по уходу"],
    badge: "Популярно",
    note: "Экономия 100 000 ₫"
  },
  {
    id: "srv-brow-combo-corr-lam",
    categoryId: "brows-face",
    name: "Комплекс: Коррекция + Ламинирование бровей",
    shortDesc: "Долговременная укладка с чистым оформлением формы",
    fullDesc: "Для тех, кто хочет максимальный объем и послушность волосков без окрашивания краской.",
    price: 700000,
    duration: 50,
    includes: ["Ламинирование", "Коррекция формы воском и пинцетом", "Питательный уход"],
    badge: null,
    note: null
  },
  {
    id: "srv-brow-combo-all-in",
    categoryId: "brows-face",
    name: "Комплекс: Коррекция + Ламинирование + Окрашивание (Всё включено)",
    shortDesc: "Максимальный апгрейд бровей: укладка, форма, цвет и кератиновое питание",
    fullDesc: "Главный бьюти-хит для бровей. Сочетает ламинирование, коррекцию воском и пинцетом, бережное окрашивание и нанесение защитного кератина.",
    price: 800000,
    duration: 60,
    includes: ["Долговременная укладка", "Коррекция воск+пинцет", "Стойкое окрашивание", "Ботокс для бровей"],
    badge: "Best Value",
    note: "Специальная комплексная цена"
  },
  {
    id: "srv-face-waxing",
    categoryId: "brows-face",
    name: "Восковая депиляция лица (женская)",
    shortDesc: "Быстрое и безболезненное удаление пушковых волос (усики, подбородок, виски)",
    fullDesc: "Деликатный теплый полимерный воск для чувствительной кожи лица. Оставляет кожу безупречно гладкой, тон ложится ровно и безупречно.",
    price: 300000,
    duration: 20,
    includes: ["Тальковая подготовка", "Депиляция полимером", "Охлаждающий пост-эмульсионный уход"],
    badge: null,
    note: null
  },

  // --- 9. ДИАГНОСТИКА И ТЕСТ-ПРЯДЬ ---
  {
    id: "srv-consultation-free",
    categoryId: "consultation",
    name: "Профессиональная консультация колориста + тест-прядь",
    shortDesc: "Очная диагностика качества волос, подбор техники и расчет точной стоимости",
    fullDesc: "Бесплатная личная встреча с колористом перед сложным окрашиванием или выходом из черного. Мастер оценивает эластичность полотна, делает тест-прядь с осветляющим составом для проверки реакции волос и подбирает безопасную формулу.",
    price: 0,
    duration: 30,
    includes: ["Анализ структуры и истории окрашиваний", "Тест-прядь", "Расчет времени и цены", "Подбор домашнего ухода"],
    badge: "0 ₫ Бесплатно",
    note: "Рекомендуем перед первым сложным окрашиванием или выходом из темного"
  }
];

class SalonDataService {
  constructor() {
    this.STORAGE_KEYS = {
      SERVICES: 'hd_hair_lab_services_v1',
      APPOINTMENTS: 'hd_hair_lab_appointments_v1',
      SALON_INFO: 'hd_hair_lab_info_v1',
      SPECIALISTS: 'hd_hair_lab_specialists_v1'
    };

    this.initData();
  }

  getLocalDateString(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  initData() {
    if (!localStorage.getItem(this.STORAGE_KEYS.SERVICES)) {
      localStorage.setItem(this.STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.SALON_INFO)) {
      localStorage.setItem(this.STORAGE_KEYS.SALON_INFO, JSON.stringify(DEFAULT_SALON_INFO));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.SPECIALISTS)) {
      localStorage.setItem(this.STORAGE_KEYS.SPECIALISTS, JSON.stringify(DEFAULT_SPECIALISTS));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.APPOINTMENTS)) {
      // Инициализируем несколькими демонстрационными записями на сегодня для шахматки
      const today = this.getLocalDateString();
      const demoAppointments = [
        {
          id: "HD-101",
          clientName: "Екатерина Миронова",
          phone: "+84 93 456 78 90",
          serviceId: "srv-airtouch",
          serviceName: "Сложные техники осветления (AirTouch)",
          variantName: "2-3 длина (до лопаток)",
          specialistId: "spec-helen",
          specialistName: "Helen (Елена)",
          date: today,
          time: "11:00",
          duration: 300,
          price: 7000000,
          status: "confirmed",
          comment: "Осветление AirTouch, ранее тонировалась в холодный беж",
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
        },
        {
          id: "HD-102",
          clientName: "Алексей Соколов",
          phone: "+84 90 876 54 32",
          serviceId: "srv-haircut-men-fade",
          serviceName: "Стрижка мужская Fade (Фейд)",
          variantName: "Стандарт",
          specialistId: "spec-nikita",
          specialistName: "Никита",
          date: today,
          time: "14:00",
          duration: 60,
          price: 500000,
          status: "confirmed",
          comment: "Средний фейд, переход от нуля",
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: "HD-103",
          clientName: "Ольга Новикова",
          phone: "+84 97 111 22 33",
          serviceId: "srv-brow-combo-all-in",
          serviceName: "Комплекс: Коррекция + Ламинирование + Окрашивание",
          variantName: "Всё включено",
          specialistId: "spec-alina",
          specialistName: "Алина",
          date: today,
          time: "16:30",
          duration: 60,
          price: 800000,
          status: "new",
          comment: "Запись с сайта, хочет натуральный графит",
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(this.STORAGE_KEYS.APPOINTMENTS, JSON.stringify(demoAppointments));
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

  getCategories() {
    return DEFAULT_CATEGORIES;
  }

  getCategoryGroups() {
    return DEFAULT_CATEGORY_GROUPS;
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
    const newId = "srv-" + Date.now().toString(36);
    const newService = {
      id: newId,
      categoryId: service.categoryId || "complex-color",
      name: service.name,
      shortDesc: service.shortDesc || "",
      fullDesc: service.fullDesc || service.shortDesc || "",
      price: service.price || 0,
      priceVariants: service.priceVariants || [],
      duration: service.duration || 60,
      includes: service.includes || [],
      badge: service.badge || null,
      note: service.note || null
    };
    services.unshift(newService);
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
    const services = this.getServices();
    const filtered = services.filter(s => s.id !== id);
    this.saveServices(filtered);
    return filtered;
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
    const newId = "spec-" + Date.now().toString(36);
    const newSpec = {
      id: newId,
      name: spec.name,
      role: spec.role,
      experience: spec.experience || "Опыт работы в индустрии",
      categories: spec.categories || ["complex-color", "single-color"],
      avatar: spec.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      workDays: spec.workDays || [1, 2, 3, 4, 5, 6, 7],
      customSchedule: spec.customSchedule || {} // { "2026-10-16": { isWorking: true, hours: "10:00 - 20:00" } }
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
      spec.customSchedule[dateStr] = { isWorking: true, hours: "10:00 - 20:00" };
    } else if (current && current.isWorking === true) {
      spec.customSchedule[dateStr] = { isWorking: false, hours: "Выходной" };
    } else {
      // По умолчанию определяем по дню недели (0 - Вс, 1 - Пн ... 6 - Сб)
      const d = new Date(dateStr);
      const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
      const isDefaultWork = (spec.workDays || [1,2,3,4,5,6,7]).includes(dayOfWeek);
      spec.customSchedule[dateStr] = { isWorking: !isDefaultWork, hours: !isDefaultWork ? "10:00 - 20:00" : "Выходной" };
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
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('hd_crm_sync');
        bc.postMessage({ type: 'APPOINTMENTS_UPDATED', timestamp: Date.now() });
        setTimeout(() => bc.close(), 100);
      }
    } catch (e) {}
  }

  addAppointment(booking) {
    const appointments = this.getAppointments();
    const newId = "HD-" + Math.floor(100 + Math.random() * 900);
    
    // Если выбран "любой мастер", подбираем рекомендуемого по категории услуги
    let suggestedId = null;
    let suggestedName = null;
    if (!booking.specialistId || booking.specialistId === 'any') {
      const services = this.getServices();
      const srv = services.find(s => s.id === booking.serviceId);
      const catId = srv ? srv.categoryId : null;
      const specialists = this.getSpecialists();
      const match = specialists.find(sp => !catId || sp.categories.includes(catId));
      if (match) {
        suggestedId = match.id;
        suggestedName = match.name;
      }
    }

    const newRecord = {
      id: newId,
      clientName: booking.clientName,
      phone: booking.phone,
      serviceId: booking.serviceId || "",
      serviceName: booking.serviceName,
      variantName: booking.variantName || "Стандарт",
      specialistId: booking.specialistId || "any",
      specialistName: booking.specialistName || "Любой свободный мастер",
      suggestedSpecialistId: suggestedId,
      suggestedSpecialistName: suggestedName,
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

  assignAppointmentSpecialist(appointmentId, specialistId, specialistName) {
    const appointments = this.getAppointments();
    const item = appointments.find(a => a.id === appointmentId);
    if (item) {
      item.specialistId = specialistId;
      item.specialistName = specialistName;
      if (item.status === 'new') {
        item.status = 'confirmed';
      }
      this.saveAppointments(appointments);
      return true;
    }
    return false;
  }

  updateAppointment(id, updatedFields) {
    const appointments = this.getAppointments();
    const idx = appointments.findIndex(a => a.id === id);
    if (idx !== -1) {
      appointments[idx] = {
        ...appointments[idx],
        ...updatedFields
      };
      this.saveAppointments(appointments);
      return appointments[idx];
    }
    return null;
  }

  deleteAppointment(id) {
    let appointments = this.getAppointments();
    const initialLen = appointments.length;
    appointments = appointments.filter(a => a.id !== id);
    if (appointments.length !== initialLen) {
      this.saveAppointments(appointments);
      return true;
    }
    return false;
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
window.hdData = new SalonDataService();
