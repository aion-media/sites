/**
 * EVO Beauty Space (Nha Trang) - Database & Data Service
 * Включает полную оцифровку прейскуранта, специалистов и локальное хранилище данных (CRM Sync)
 */

const DEFAULT_SALON_INFO = {
  name: "EVO Beauty Space",
  tagline: "Пространство эстетической медицины и премиального бьюти-ухода",
  city: "Нячанг, Вьетнам",
  address: "40 Đ. Bắc Sơn & 94 Hùng Vương, Nha Trang, Khánh Hòa 650000",
  branches: [
    {
      name: "EVO Sever",
      address: "40 Đ. Bắc Sơn, Nha Trang, Khánh Hòa 650000, Вьетнам",
      mapUrl: "https://maps.app.goo.gl/AYJSN5MHKQJqHgV26"
    },
    {
      name: "EVO Beauty Space",
      address: "94 Hùng Vương, Nha Trang, Khánh Hòa 650000, Вьетнам",
      mapUrl: "https://maps.app.goo.gl/GeMZXYFnTMcveymM9"
    }
  ],
  phone: "+84 90 123 45 67",
  instagram: "evo.vn",
  altegioUrl: "https://n257996.alteg.io",
  telegram: "https://t.me/polinaleskk",
  hours: "Ежедневно 09:00 – 21:00",
  features: [
    "Врачи с высшим медицинским образованием",
    "Безопасный доказательный подход и стерильность по нормам СанПиН",
    "Премиальные мировые бренды (Davines, Lebel, Profhilo, Radiesse)",
    "Гарантия качества на все выполненные процедуры"
  ]
};

const DEFAULT_SPECIALISTS = [
  {
    id: "spec-1",
    name: "Александра Иванова",
    role: "Врач-косметолог, дерматовенеролог",
    experience: "Опыт более 9 лет",
    branch: "center",
    branchName: "EVO Beauty Space (94 Hùng Vương)",
    categories: ["cosmetology", "aesthetic"],
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "spec-2",
    name: "Елена Смирнова",
    role: "Топ-стилист, колорист международного класса",
    experience: "Опыт 11 лет. Сложные техники окрашивания, кудрявый метод",
    branch: "sever",
    branchName: "EVO Sever (40 Đ. Bắc Sơn)",
    categories: ["hair"],
    photo: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "spec-3",
    name: "Дмитрий Ветров",
    role: "Шеф-барбер, стилист мужского зала",
    experience: "Опыт 7 лет. Моделирование бород опасным лезвием, спа уход",
    branch: "sever",
    branchName: "EVO Sever (40 Đ. Bắc Sơn)",
    categories: ["barber"],
    photo: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "spec-4",
    name: "Мария Соколова",
    role: "Врач-подолог, специалист медицинского педикюра",
    experience: "Опыт 8 лет. Ортониксия (титановая нить), диабетическая стопа",
    branch: "center",
    branchName: "EVO Beauty Space (94 Hùng Vương)",
    categories: ["podology", "nails"],
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "spec-5",
    name: "Виктория Ким",
    role: "Мастер взгляда и перманентного макияжа",
    experience: "Опыт 6 лет. Натуральные пудровые брови, ламинирование",
    branch: "center",
    branchName: "EVO Beauty Space (94 Hùng Vương)",
    categories: ["lashes-brows", "permanent", "laser"],
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
  }
];

const DEFAULT_CATEGORIES = [
  { id: "cosmetology", name: "Врачебная косметология", icon: "✨", desc: "Инъекционные и доказательные методики преображения" },
  { id: "aesthetic", name: "Эстетические и аппаратные процедуры", icon: "🔬", desc: "SMAS-лифтинг, микроигольчатый RF, пилинги и чистки" },
  { id: "hair", name: "Парикмахерские услуги", icon: "💇‍♀️", desc: "Стрижки, кудрявый метод, сложные окрашивания, премиум-уходы" },
  { id: "barber", name: "Барбер-зал", icon: "💈", desc: "Мужские стрижки, уход за бородой, мужской блонд и SPA головы" },
  { id: "laser", name: "Лазерная эпиляция", icon: "⚡", desc: "Безболезненное гладкое тело на диодном аппарате нового поколения" },
  { id: "nails", name: "Ногтевой сервис", icon: "💅", desc: "Премиальный маникюр, педикюр, наращивание и услуга в 4 руки" },
  { id: "podology", name: "Подология", icon: "🩺", desc: "Медицинский уход за стопами, вросшие ногти, онихомикоз, ортониксия" },
  { id: "lashes-brows", name: "Эстетика лица (Ресницы и брови)", icon: "👁️", desc: "Ламинирование, моделирование и наращивание от классики до объемов" },
  { id: "permanent", name: "Перманент и эстетика тела", icon: "✒️", desc: "Пудровые брови, акварельные губы, тату и удаление лазером" }
];

const DEFAULT_SERVICES = [
  // ================= 1. ВРАЧЕБНАЯ КОСМЕТОЛОГИЯ =================
  {
    id: "cosm-consult",
    categoryId: "cosmetology",
    subCategory: "Приём врача",
    name: "Первичный приём врача-косметолога",
    price: 500000,
    duration: "30 мин",
    desc: "Сбор анамнеза, дерматоскопия кожи, составление персонального плана лечения и ухода.",
    isPopular: true
  },
  // Биоревитализация
  { id: "bio-hyaron", categoryId: "cosmetology", subCategory: "Биоревитализация", name: "Hyaron", price: 1500000, duration: "1 ч.", desc: "Глубокое экспресс-увлажнение и восстановление гидробаланса кожи." },
  { id: "bio-aquashine", categoryId: "cosmetology", subCategory: "Биоревитализация", name: "Aquashine", price: 3000000, duration: "1 ч.", desc: "Пептидная биоревитализация для сияния кожи и осветления пигментации." },
  { id: "bio-pdrn", categoryId: "cosmetology", subCategory: "Биоревитализация", name: "PDRN (Syniro, Elaxen, Kiara Reju)", price: 2700000, duration: "1 ч.", desc: "Полинуклеотиды для регенерации клеток, стимуляции коллагена и заживления.", isPopular: true },
  { id: "bio-mesoxantin", categoryId: "cosmetology", subCategory: "Биоревитализация", name: "Mesoxantin F199", price: 5900000, duration: "1 ч. 30 мин", desc: "Эпигенетическая терапия клеток кожи, защита от фотостарения." },
  { id: "bio-mesowharton", categoryId: "cosmetology", subCategory: "Биоревитализация", name: "Mesowharton P199", price: 5900000, duration: "1 ч. 30 мин", desc: "Интенсивное омоложение зрелой кожи, клеточное обновление стволовых клеток." },
  { id: "bio-novacutan", categoryId: "cosmetology", subCategory: "Биоревитализация", name: "Novacutan SBIO / YBIO", price: 4500000, duration: "1 ч. 30 мин", desc: "Экзопротектор против стресса кожи, тусклого цвета и мелких морщин." },
  { id: "bio-profhilo", categoryId: "cosmetology", subCategory: "Биоревитализация", name: "Profhilo", price: 8500000, duration: "1 ч.", desc: "Швейцарский золотой стандарт биоремоделирования. Мгновенный лифтинг по 5 точкам.", isPopular: true },
  { id: "bio-plinest", categoryId: "cosmetology", subCategory: "Биоревитализация", name: "Plinest", price: 7000000, duration: "1 ч.", desc: "Высокоочищенные полинуклеотиды для упругости и плотности тонкой кожи." },
  { id: "bio-neauvia", categoryId: "cosmetology", subCategory: "Биоревитализация", name: "Neauvia Hydro Delux", price: 5000000, duration: "1 ч.", desc: "Органическая биоревитализация с гидроксиапатитом кальция." },

  // Мезотерапия
  { id: "meso-scalp", categoryId: "cosmetology", subCategory: "Мезотерапия", name: "Мезотерапия кожи головы (Dermaheal HL, Melsmon, Curasen)", price: 1100000, duration: "45 мин", desc: "Остановка выпадения волос, стимуляция роста спящих фолликулов." },
  { id: "meso-face", categoryId: "cosmetology", subCategory: "Мезотерапия", name: "Мезотерапия лица (индивидуальный коктейль)", price: 1650000, duration: "1 ч.", desc: "Коктейли с витаминами, аминокислотами и гиалуроновой кислотой." },
  { id: "meso-exosomes", categoryId: "cosmetology", subCategory: "Мезотерапия", name: "Экзосомы Hanheal", price: 3500000, duration: "1 ч.", desc: "Инновационная клеточная регенерация, сужение пор и омоложение микрорельефа." },
  { id: "meso-lipo", categoryId: "cosmetology", subCategory: "Мезотерапия", name: "Липолитик (Dr. Lipo, Dermaheal LL, Super V line)", price: 1000000, duration: "45 мин", desc: "Локальное расщепление жировых пакетов второго подбородка и овала лица." },
  { id: "meso-lightfit", categoryId: "cosmetology", subCategory: "Мезотерапия", name: "Light Fit, Prime Dr. Lipo+", price: 1500000, duration: "45 мин", desc: "Мягкий премиальный липолитик без отеков для четкого контура лица." },

  // Плацентарная терапия
  { id: "plac-melsmon", categoryId: "cosmetology", subCategory: "Плацентарная терапия", name: "Melsmon, 2 мл", price: 1500000, duration: "1 ч.", desc: "Японский плацентарный препарат для глубокого сияния, детокса и баланса кожи." },
  { id: "plac-curasen", categoryId: "cosmetology", subCategory: "Плацентарная терапия", name: "Curasen, 2 мл", price: 2000000, duration: "1 ч.", desc: "Плацентарно-пептидный биоревитализант для периорбитальной зоны и шеи." },
  { id: "plac-laennec", categoryId: "cosmetology", subCategory: "Плацентарная терапия", name: "Laennec, 2 мл", price: 1500000, duration: "1 ч.", desc: "Гепатопротектор и мощный антиоксидантный иммуномодулятор молодости." },

  // Коллагенотерапия & стимуляция
  { id: "coll-collost", categoryId: "cosmetology", subCategory: "Коллагенотерапия", name: "Коллост Микро, 150 mg", price: 7000000, duration: "1 ч.", desc: "Натуральный микронизированный коллаген для плотности и выравнивания рубцов." },
  { id: "coll-radiesse", categoryId: "cosmetology", subCategory: "Коллагеностимуляция", name: "Radiesse, 1,5 мл", price: 12000000, duration: "1 ч. 30 мин", desc: "Векторный лифтинг на основе гидроксиапатита кальция. Формирование мощного коллагенового каркаса.", isPopular: true },
  { id: "coll-pla", categoryId: "cosmetology", subCategory: "Коллагеностимуляция", name: "Polilactic Acid 200 mg (Juvelook, AestheFill, NeoFill)", price: 12000000, duration: "1 ч. 30 мин", desc: "Полимолочная кислота — естественное восполнение утраченных объемов и разглаживание складок." },

  // Плазмотерапия
  { id: "prp-1", categoryId: "cosmetology", subCategory: "Плазмотерапия", name: "Плазмотерапия PRP (1 пробирка)", price: 2000000, duration: "1 ч. 30 мин", desc: "Аутологичная плазма, обогащенная тромбоцитами, для естественной регенерации." },
  { id: "prp-2", categoryId: "cosmetology", subCategory: "Плазмотерапия", name: "Плазмотерапия PRP (2 пробирки)", price: 4000000, duration: "1 ч. 30 мин", desc: "Лицо + шея или волосистая часть головы." },
  { id: "prp-3", categoryId: "cosmetology", subCategory: "Плазмотерапия", name: "Плазмотерапия PRP (3 пробирки)", price: 5000000, duration: "1 ч. 30 мин", desc: "Комплекс лицо, шея, зона декольте и кисти рук." },

  // Инфузионная терапия (Капельницы)
  { id: "iv-laennec", categoryId: "cosmetology", subCategory: "Инфузионная терапия", name: "Капельница Laennec, 4,0 мл", price: 1500000, duration: "1 ч.", desc: "Внутривенное омоложение, очищение печени и снятие хронической усталости." },
  { id: "iv-glutathione", categoryId: "cosmetology", subCategory: "Инфузионная терапия", name: "Глутатион 1200 мг + Витамин C", price: 1200000, duration: "1 ч.", desc: "«Капельница Золушки» — королевское сияние кожи, антиоксидантный удар по пигменту.", isPopular: true },
  { id: "iv-ferinject-2", categoryId: "cosmetology", subCategory: "Инфузионная терапия", name: "Феринжект 2 мл (железо)", price: 2000000, duration: "1 ч. 30 мин", desc: "Быстрое восполнение дефицита ферритина и железа для энергии и роста волос." },

  // Ботулинотерапия
  { id: "botox-glabella", categoryId: "cosmetology", subCategory: "Ботулинотерапия", name: "Ботокс: Межбровье", price: 1500000, duration: "30 мин", desc: "Разглаживание мимических складок хмурого взгляда." },
  { id: "botox-forehead", categoryId: "cosmetology", subCategory: "Ботулинотерапия", name: "Ботокс: Лоб", price: 1500000, duration: "30 мин", desc: "Устранение горизонтальных морщин лба с сохранением естественной мимики." },
  { id: "botox-eyes", categoryId: "cosmetology", subCategory: "Ботулинотерапия", name: "Ботокс: Зона вокруг глаз («гусиные лапки»)", price: 1500000, duration: "30 мин", desc: "Свежий и открытый взгляд без мелкой сеточки морщин." },
  { id: "botox-neck", categoryId: "cosmetology", subCategory: "Ботулинотерапия", name: "Ботокс: Шея (кольца Венеры, платизма)", price: 1500000, duration: "30 мин", desc: "Лифтинг Нефертити и расслабление тяжей платизмы." },
  { id: "botox-mouth", categoryId: "cosmetology", subCategory: "Ботулинотерапия", name: "Ботокс: Зона вокруг рта / Нос (кисет, кроличьи морщинки)", price: 1500000, duration: "30 мин", desc: "Снятие гипертонуса круговой мышцы рта и десневой улыбки." },
  { id: "botox-fullface", categoryId: "cosmetology", subCategory: "Ботулинотерапия", name: "Full Face Ботулинотерапия", price: 6000000, duration: "1 ч.", desc: "Гармонизация всех мышечных балансов лица в авторской технике.", isPopular: true },
  { id: "botox-hyperhidrosis", categoryId: "cosmetology", subCategory: "Ботулинотерапия", name: "Лечение гипергидроза (подмышки, ладони)", price: 5000000, duration: "1 ч.", desc: "Полное блокирование потоотделения на срок до 8-10 месяцев." },
  { id: "botox-bruxism", categoryId: "cosmetology", subCategory: "Ботулинотерапия", name: "Коррекция бруксизма / Жевательные мышцы (массетеры)", price: 3500000, duration: "1 ч.", desc: "Снятие гипертонуса челюсти, утончение нижней трети лица." },

  // Контурная пластика
  { id: "fill-eptq", categoryId: "cosmetology", subCategory: "Контурная пластика", name: "Филлер E.P.T.Q 100 / 300 / 500, 1 мл", price: 3500000, duration: "1 ч.", desc: "Корейский высокоочищенный филлер для губ, скул или подбородка." },
  { id: "fill-juvederm", categoryId: "cosmetology", subCategory: "Контурная пластика", name: "Juvederm (Voluma/Volift/Ultra), 1 мл", price: 7500000, duration: "1 ч. 30 мин", desc: "Премиальный эталонный филлер от Allergan с лидокаином.", isPopular: true },
  { id: "fill-stylage", categoryId: "cosmetology", subCategory: "Контурная пластика", name: "Novacutan FBIO / Stylage / Restylane / Yvoire, 1 мл", price: 4900000, duration: "1 ч.", desc: "Филлеры европейского стандарта с антиоксидантом маннитолом." },
  { id: "fill-nasolacrimal", categoryId: "cosmetology", subCategory: "Контурная пластика", name: "Коррекция носослёзной борозды", price: 5500000, duration: "1 ч.", desc: "Качественное стирание темных кругов и завалов под глазами." },
  { id: "fill-nose", categoryId: "cosmetology", subCategory: "Контурная пластика", name: "Безоперационная коррекция формы носа", price: 5500000, duration: "1 ч.", desc: "Сглаживание горбинки и подъем кончика носа." },
  { id: "fill-dissolve", categoryId: "cosmetology", subCategory: "Контурная пластика", name: "Выведение нежелательного филлера (Гиалуронидаза 1500 IU)", price: 1500000, duration: "1 ч.", desc: "Безопасное растворение старого или мигрировавшего геля." },

  // Нитевой лифтинг
  { id: "thread-cog-zone", categoryId: "cosmetology", subCategory: "Нитевой лифтинг", name: "Нити COG PLLA (1 зона)", price: 4000000, duration: "1 ч. 30 мин", desc: "Армирующие нити с насечками для перемещения тканей (средняя треть / брыли)." },
  { id: "thread-cog-face", categoryId: "cosmetology", subCategory: "Нитевой лифтинг", name: "Нити COG PLLA (Все лицо)", price: 12000000, duration: "2 ч. 30 мин", desc: "Комплексная безоперационная подтяжка лица с долгосрочным каркасом.", isPopular: true },
  { id: "thread-meso", categoryId: "cosmetology", subCategory: "Нитевой лифтинг", name: "Мезонити / Нитевое армирование (1 зона)", price: 4000000, duration: "1 ч.", desc: "Уплотнение кожи шеи, второго подбородка или зоны вокруг глаз." },

  // ================= 2. ЭСТЕТИЧЕСКИЕ И АППАРАТНЫЕ =================
  { id: "aest-holyland", categoryId: "aesthetic", subCategory: "Уходовые процедуры", name: "Атравматическая чистка Holy Land + Пилинг", price: 2500000, duration: "1 ч. 30 мин", desc: "Профессиональный израильский протокол очищения, раскрытия пор и сияния.", isPopular: true },
  { id: "aest-biorepeel", categoryId: "aesthetic", subCategory: "Пилинги", name: "Пилинг BioRePeel CL3", price: 2000000, duration: "45 мин", desc: "Двухфазный пилинг с эффектом биоревитализации без шелушения и реабилитации." },
  { id: "aest-prx", categoryId: "aesthetic", subCategory: "Пилинги", name: "Пилинг PRX-T33", price: 2000000, duration: "45 мин", desc: "Итальянский неинвазивный лифтинг дермы. Мгновенная гладкость и ровный тон." },
  { id: "aest-carboxy", categoryId: "aesthetic", subCategory: "Уходовые процедуры", name: "Неинвазивная карбокситерапия", price: 700000, duration: "45 мин", desc: "Насыщение клеток углекислым газом и кислородом, снятие отечности." },
  { id: "aest-hydropeptide", categoryId: "aesthetic", subCategory: "Уходовые процедуры", name: "Премиальная маска HydroPeptide", price: 500000, duration: "30 мин", desc: "Пептидное клеточное питание и восстановление гидролипидной мантии." },

  // SMAS-лифтинг
  { id: "smas-face", categoryId: "aesthetic", subCategory: "SMAS-лифтинг", name: "SMAS-лифтинг Ultraformer (Лицо, шея, декольте)", price: 5500000, duration: "1 ч. 30 мин", desc: "1 000 000 ₫ за 100 линий. В среднем 500–600 линий на нижнюю треть и скулы. Глубокая подтяжка мышечного слоя без скальпеля.", isPopular: true },
  { id: "smas-body", categoryId: "aesthetic", subCategory: "SMAS-лифтинг", name: "SMAS-лифтинг тела (Живот, бедра)", price: 4200000, duration: "1 ч. 30 мин", desc: "600 000 ₫ за 100 линий. Сокращение кожного лоскута, устранение дряблости." },

  // Микроигольчатый RF
  { id: "rf-eyes", categoryId: "aesthetic", subCategory: "Микроигольчатый RF", name: "Микроигольчатый RF-лифтинг: Зона вокруг глаз", price: 3000000, duration: "30 мин", desc: "Уплотнение века, уменьшение грыжевых мешков и морщин." },
  { id: "rf-face", categoryId: "aesthetic", subCategory: "Микроигольчатый RF", name: "Микроигольчатый RF-лифтинг: Лицо", price: 5000000, duration: "1 ч.", desc: "Радиоволновой термолиз на золотых микроиглах. Сужение пор, коррекция рубцов постакне.", isPopular: true },
  { id: "rf-full", categoryId: "aesthetic", subCategory: "Микроигольчатый RF", name: "Микроигольчатый RF: Лицо + шея + декольте + глаза", price: 7000000, duration: "1 ч. 30 мин", desc: "Максимальный протокол тотального уплотнения и омоложения кожи." },
  { id: "rf-body", categoryId: "aesthetic", subCategory: "Микроигольчатый RF", name: "Микроигольчатый RF: Живот / Колени", price: 4500000, duration: "1 ч.", desc: "Подтяжка дряблой кожи после родов или снижения веса." },

  // Новообразования
  { id: "nevus-small", categoryId: "aesthetic", subCategory: "Удаление новообразований", name: "Удаление папиллом/родинок (до 10 ед. до 0.5 см²)", price: 1000000, duration: "30 мин", desc: "Лазерная/радиоволновая деструкция с консультацией врача и анестезией." },

  // ================= 3. ПАРИКМАХЕРСКИЕ УСЛУГИ =================
  { id: "hair-cut-short", categoryId: "hair", subCategory: "Стрижки с укладкой", name: "Женская стрижка с укладкой (Короткие волосы)", price: 500000, duration: "1 ч.", desc: "Включает мытьё головы профессиональным шампунем, стрижку и стайлинг." },
  { id: "hair-cut-mid", categoryId: "hair", subCategory: "Стрижки с укладкой", name: "Женская стрижка с укладкой (Средняя длина)", price: 600000, duration: "1 ч. 30 мин", desc: "Создание архитектурной формы с учётом структуры роста волос." },
  { id: "hair-cut-long", categoryId: "hair", subCategory: "Стрижки с укладкой", name: "Женская стрижка с укладкой (Длинные волосы)", price: 800000, duration: "1 ч. 50 мин", desc: "Стрижка по форме, полировка кончиков, мытье и брашинг-укладка.", isPopular: true },
  { id: "hair-curly-mid", categoryId: "hair", subCategory: "Стрижки по кудрявому методу", name: "Стрижка по сухому кудрявому методу (Curly Girl)", price: 900000, duration: "1 ч. 45 мин", desc: "Специальная техника для естественных кудрей и волн, глубокое увлажнение.", isPopular: true },

  // Премиум-уходы
  { id: "hair-tokio", categoryId: "hair", subCategory: "Премиальные уходы", name: "Восстановление волос Tokio Inkarami (Япония)", price: 2300000, duration: "2 ч.", desc: "Патентная система восстановления кератина в глубине волоса на 140%. Легендарный блеск.", isPopular: true },
  { id: "hair-lebel", categoryId: "hair", subCategory: "Премиальные уходы", name: "Lebel «Абсолютное счастье для волос»", price: 1500000, duration: "2 ч.", desc: "Многоступенчатая сывороточная программа детокса и увлажнения от корней до кончиков." },
  { id: "hair-olaplex", categoryId: "hair", subCategory: "Премиальные уходы", name: "Olaplex глубокое восстановление связей", price: 1200000, duration: "1 ч. 30 мин", desc: "Соединение дисульфидных связей после осветления или термических повреждений." },
  { id: "hair-davines", categoryId: "hair", subCategory: "Премиальные уходы", name: "Davines «Липидное питание» OI Hair Butter", price: 500000, duration: "1 ч.", desc: "Масло аннато для защиты от влажности Нячанга и шелковистости." },

  // Сложное окрашивание
  { id: "hair-airtouch", categoryId: "hair", subCategory: "Сложное окрашивание", name: "Airtouch / Shatush / Балаяж (Средняя длина)", price: 5000000, duration: "7 ч.", desc: "Плавное выдувание прядей феном, бесшовное отрастание до 8-12 месяцев.", isPopular: true },
  { id: "hair-totalblond", categoryId: "hair", subCategory: "Сложное окрашивание", name: "Total Blond (Чистый блонд с тонированием)", price: 5000000, duration: "6 ч.", desc: "Безопасное обесцвечивание на низких оксидах + роскошное благородное тонирование." },
  { id: "hair-tint-roots", categoryId: "hair", subCategory: "Окрашивание", name: "Стойкое окрашивание корней до 2 см", price: 1200000, duration: "1 ч. 45 мин", desc: "100% закрашивание седины премиальным безаммиачным красителем." },
  { id: "hair-toning-mid", categoryId: "hair", subCategory: "Окрашивание", name: "Глянцевое тонирование волос (до 40 см)", price: 1500000, duration: "1 ч. 30 мин", desc: "Насыщение цветом и зеркальным блеском без осветления базы." },

  // ================= 4. БАРБЕР-ЗАЛ =================
  { id: "barber-cut-wash", categoryId: "barber", subCategory: "Стрижки", name: "Мужская стрижка с мытьём и стайлингом", price: 400000, duration: "45 мин", desc: "Мытье головы, индивидуальная стрижка ножницами и машинкой, укладка премиум-пастой.", isPopular: true },
  { id: "barber-beard", categoryId: "barber", subCategory: "Борода", name: "Моделирование бороды с распариванием и опасным лезвием", price: 350000, duration: "45 мин", desc: "Горячий компресс, подбор геометрии, бритье шаветкой, успокаивающий бальзам." },
  { id: "barber-blond", categoryId: "barber", subCategory: "Окрашивание", name: "Мужской Total Blond на короткую стрижку", price: 3000000, duration: "3 ч.", desc: "Пепельный, платиновый или белый скандинавский блонд для мужчин." },
  { id: "barber-spa", categoryId: "barber", subCategory: "SPA", name: "SPA для кожи головы + Массаж воротниковой зоны", price: 300000, duration: "1 ч.", desc: "Глубокое очищение скрабом и расслабляющий массаж от стресса." },

  // ================= 5. ЛАЗЕРНАЯ ЭПИЛЯЦИЯ =================
  { id: "laser-combo-1", categoryId: "laser", subCategory: "Женские комбо", name: "Комбо 1: Подмышечные впадины + Глубокое бикини + Голени", price: 1000000, duration: "1 ч.", desc: "Самый популярный комплекс для полной гладкости в отпуске и у моря.", isPopular: true },
  { id: "laser-combo-2", categoryId: "laser", subCategory: "Женские комбо", name: "Комбо 2: Подмышки + Глубокое бикини + Ноги полностью", price: 1200000, duration: "1 ч. 20 мин", desc: "Максимальное комбо по специальной выгодной цене." },
  { id: "laser-fullbody", categoryId: "laser", subCategory: "Женские комбо", name: "Все тело тотально (All Inclusive)", price: 2500000, duration: "2 ч.", desc: "Полная обработка всех желаемых зон за один комфортный сеанс." },
  { id: "laser-bikini-deep", categoryId: "laser", subCategory: "Отдельные зоны", name: "Глубокое бикини", price: 550000, duration: "20 мин", desc: "Деликатная обработка на сапфировом охлаждении, никакой боли." },

  // ================= 6. НОГТЕВОЙ СЕРВИС =================
  { id: "nail-manicure-gel", categoryId: "nails", subCategory: "Маникюр", name: "Маникюр с покрытием гель-лак «Все включено»", price: 1000000, duration: "2 ч.", desc: "Входит: снятие предыдущего покрытия, укрепление гелем, идеальный маникюр и легкий дизайн 1–3 ногтей.", isPopular: true },
  { id: "nail-manicure-clean", categoryId: "nails", subCategory: "Маникюр", name: "Гигиенический аппаратный маникюр без покрытия", price: 600000, duration: "1 ч.", desc: "Чистая обработка кутикулы, придание формы, полировка и питательное масло." },
  { id: "nail-pedicure-full", categoryId: "nails", subCategory: "Педикюр", name: "Педикюр с покрытием и SMART-обработкой стоп", price: 1100000, duration: "2 ч.", desc: "Идеально гладкие стопы без трещин + стойкое эстетическое покрытие.", isPopular: true },
  { id: "nail-4hands", categoryId: "nails", subCategory: "Премиум-опция", name: "Услуга «В 4 руки» (Маникюр + Педикюр одновременно)", price: 300000, duration: "2 ч.", desc: "Экономия 2 часов времени: два топ-мастера работают одновременно в удобном кресле-реклайнере.", isPopular: true },
  { id: "nail-extension", categoryId: "nails", subCategory: "Наращивание", name: "Наращивание ногтей (до 4 мм)", price: 1700000, duration: "3 ч.", desc: "Моделирование идеальной архитектуры гелем или полигелем." },

  // ================= 7. ПОДОЛОГИЯ =================
  { id: "pod-consult", categoryId: "podology", subCategory: "Приём", name: "Подологическая консультация и осмотр", price: 400000, duration: "20 мин", desc: "Диагностика стопы, план коррекции деформаций, рекомендации по обуви." },
  { id: "pod-ingrown", categoryId: "podology", subCategory: "Вросший ноготь", name: "Обработка вросшего ногтя с тампонадой", price: 750000, duration: "30 мин", desc: "Безболезненное удаление вросшего сегмента, лечебная повязка и онлайн-курация.", isPopular: true },
  { id: "pod-titan", categoryId: "podology", subCategory: "Ортониксия", name: "Установка коррекционной системы «Титановая нить»", price: 900000, duration: "45 мин", desc: "Немецкая методика выравнивания деформированного и скрученного ногтя без операции.", isPopular: true },
  { id: "pod-complex-2", categoryId: "podology", subCategory: "Медицинская обработка", name: "Подологическая обработка стоп и ногтей 2 степени", price: 1400000, duration: "1 ч. 30 мин", desc: "Удаление глубоких трещин, кератоза, натоптышей, зачистка утолщенных ногтей." },

  // ================= 8. РЕСНИЦЫ И БРОВИ =================
  { id: "eye-lash-lam", categoryId: "lashes-brows", subCategory: "Ресницы", name: "Итальянское ламинирование ресниц + Окрашивание + Ботокс", price: 1000000, duration: "1 ч.", desc: "Красивый завиток, глубокий черный цвет и уплотнение натуральных ресниц на 30%.", isPopular: true },
  { id: "eye-brow-lam", categoryId: "lashes-brows", subCategory: "Брови", name: "Комплекс: Ламинирование + Оформление + Окрашивание бровей", price: 1000000, duration: "1 ч. 30 мин", desc: "Долговременная укладка волосков, идеальная форма и стойкий оттенок хной или краской.", isPopular: true },
  { id: "eye-lash-ext-2d", categoryId: "lashes-brows", subCategory: "Наращивание", name: "Наращивание ресниц 2D / 2.5D", price: 1400000, duration: "2 ч.", desc: "Бархатный невесомый объем без утяжеления родных ресниц, эффект стрелки или мокрый эффект.", isPopular: true },

  // ================= 9. ПЕРМАНЕНТНЫЙ МАКИЯЖ И ТЕЛО =================
  { id: "perm-brows", categoryId: "permanent", subCategory: "Перманент", name: "Пудровое напыление бровей (Powder Brows)", price: 4000000, duration: "3 ч.", desc: "Воздушный бархатный эффект макияжа тенями без серых и синих оттенков на 1.5–2 года.", isPopular: true },
  { id: "perm-lips", categoryId: "permanent", subCategory: "Перманент", name: "Акварельные губы (Aquarelle Lips)", price: 4500000, duration: "3 ч. 30 мин", desc: "Сочный естественный оттенок, восстановление четкости контура и визуальный объем.", isPopular: true },
  { id: "perm-laser-rem", categoryId: "permanent", subCategory: "Удаление", name: "Лазерное удаление некачественного татуажа", price: 1000000, duration: "30 мин", desc: "Неодимовый пикосекундный лазер. Расщепление пигмента без ожогов и рубцов." }
];

function getRelativeDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_APPOINTMENTS = [
  {
    id: "EVO-8021",
    clientName: "Екатерина Миронова",
    phone: "+84 98 441 2309",
    serviceName: "Биоревитализация Profhilo",
    specialistId: "spec-1",
    specialistName: "Александра Иванова",
    branch: "center",
    branchName: "EVO Beauty Space (94 Hùng Vương)",
    date: getRelativeDateStr(0),
    time: "11:00",
    duration: "1 ч.",
    price: 8500000,
    status: "confirmed", // 🟠 Подтвержденная
    comment: "Впервые на процедуре, чувствительная кожа.",
    createdAt: new Date().toISOString()
  },
  {
    id: "EVO-8022",
    clientName: "Анастасия Воронова",
    phone: "+84 91 552 8841",
    serviceName: "Airtouch / Сложное окрашивание",
    specialistId: "spec-2",
    specialistName: "Елена Смирнова",
    branch: "sever",
    branchName: "EVO Sever (40 Đ. Bắc Sơn)",
    date: getRelativeDateStr(0),
    time: "13:00",
    duration: "3 ч.",
    price: 5000000,
    status: "in_progress", // ⏳ В процессе
    comment: "Длина до лопаток, осветление корней и тонирование холодный блонд.",
    createdAt: new Date().toISOString()
  },
  {
    id: "EVO-8023",
    clientName: "Максим Орлов",
    phone: "+84 93 112 4099",
    serviceName: "Мужская стрижка с мытьём и стайлингом",
    specialistId: "spec-3",
    specialistName: "Дмитрий Ветров",
    branch: "sever",
    branchName: "EVO Sever (40 Đ. Bắc Sơn)",
    date: getRelativeDateStr(0),
    time: "15:00",
    duration: "1 ч.",
    price: 400000,
    status: "new", // 🟢 Новая
    comment: "Запись через сайт, просит опасное бритье по возможности.",
    createdAt: new Date().toISOString()
  },
  {
    id: "EVO-8024",
    clientName: "Ольга Ли",
    phone: "+84 97 889 1234",
    serviceName: "Установка коррекционной системы «Титановая нить»",
    specialistId: "spec-4",
    specialistName: "Мария Соколова",
    branch: "center",
    branchName: "EVO Beauty Space (94 Hùng Vương)",
    date: getRelativeDateStr(0),
    time: "09:00",
    duration: "1 ч.",
    price: 900000,
    status: "completed", // 🔵 Выполнена
    comment: "Беспокоит большой палец левой стопы.",
    createdAt: new Date().toISOString()
  },
  {
    id: "EVO-8025",
    clientName: "Виктория Белова",
    phone: "+84 90 334 1122",
    serviceName: "Пудровое напыление бровей (Powder Brows)",
    specialistId: "spec-5",
    specialistName: "Виктория Ким",
    branch: "center",
    branchName: "EVO Beauty Space (94 Hùng Vương)",
    date: getRelativeDateStr(0),
    time: "17:00",
    duration: "2 ч.",
    price: 4000000,
    status: "new", // 🟢 Новая
    comment: "Новая онлайн-запись через сайт, перезвонить для подтверждения.",
    createdAt: new Date().toISOString()
  },
  {
    id: "EVO-8026",
    clientName: "Артём Смирнов",
    phone: "+84 93 456 7890",
    serviceName: "Моделирование и оформление бороды",
    specialistId: "spec-3",
    specialistName: "Дмитрий Ветров",
    branch: "sever",
    branchName: "EVO Sever (40 Đ. Bắc Sơn)",
    date: getRelativeDateStr(0),
    time: "18:00",
    duration: "45 мин",
    price: 300000,
    status: "confirmed", // 🟠 Подтвержденная
    comment: "Постоянный гость.",
    createdAt: new Date().toISOString()
  },
  {
    id: "EVO-8027",
    clientName: "Ксения Лапина",
    phone: "+84 95 678 1234",
    serviceName: "SMAS-лифтинг Ultraformer (Лицо полностью)",
    specialistId: "spec-1",
    specialistName: "Александра Иванова",
    branch: "center",
    branchName: "EVO Beauty Space (94 Hùng Vương)",
    date: getRelativeDateStr(1),
    time: "12:00",
    duration: "1 ч. 30 мин",
    price: 9900000,
    status: "confirmed",
    comment: "Запись на завтра.",
    createdAt: new Date().toISOString()
  }
];

// Data Store Service (Local Storage + Fallback)
class EvoDataStore {
  constructor() {
    this.STORAGE_KEYS = {
      SERVICES: "evo_services_v1",
      APPOINTMENTS: "evo_appointments_v2",
      SPECIALISTS: "evo_specialists_v2",
      SALON: "evo_salon_info_v1"
    };
    this.init();
  }

  init() {
    if (!localStorage.getItem(this.STORAGE_KEYS.SERVICES)) {
      localStorage.setItem(this.STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
    }
    // Check if appointments exist and have valid structure with branch
    try {
      const storedApps = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.APPOINTMENTS));
      if (!storedApps || !storedApps.length || !storedApps[0].branch) {
        localStorage.setItem(this.STORAGE_KEYS.APPOINTMENTS, JSON.stringify(DEFAULT_APPOINTMENTS));
      }
    } catch (e) {
      localStorage.setItem(this.STORAGE_KEYS.APPOINTMENTS, JSON.stringify(DEFAULT_APPOINTMENTS));
    }

    // Check if specialists exist and have valid branch
    try {
      const storedSpecs = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SPECIALISTS));
      if (!storedSpecs || !storedSpecs.length || !storedSpecs[0].branch) {
        localStorage.setItem(this.STORAGE_KEYS.SPECIALISTS, JSON.stringify(DEFAULT_SPECIALISTS));
      }
    } catch (e) {
      localStorage.setItem(this.STORAGE_KEYS.SPECIALISTS, JSON.stringify(DEFAULT_SPECIALISTS));
    }

    if (!localStorage.getItem(this.STORAGE_KEYS.SALON)) {
      localStorage.setItem(this.STORAGE_KEYS.SALON, JSON.stringify(DEFAULT_SALON_INFO));
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

  updateServicePrice(serviceId, newPrice) {
    const services = this.getServices();
    const item = services.find(s => s.id === serviceId);
    if (item) {
      item.price = Number(newPrice);
      this.saveServices(services);
      return true;
    }
    return false;
  }

  updateService(serviceId, updatedFields) {
    const services = this.getServices();
    const idx = services.findIndex(s => s.id === serviceId);
    if (idx !== -1) {
      services[idx] = { ...services[idx], ...updatedFields };
      this.saveServices(services);
      return services[idx];
    }
    return null;
  }

  toggleServiceVisibility(serviceId) {
    const services = this.getServices();
    const item = services.find(s => s.id === serviceId);
    if (item) {
      item.isHidden = !item.isHidden;
      this.saveServices(services);
      return item.isHidden;
    }
    return false;
  }

  deleteService(serviceId) {
    let services = this.getServices();
    const initLen = services.length;
    services = services.filter(s => s.id !== serviceId);
    if (services.length !== initLen) {
      this.saveServices(services);
      return true;
    }
    return false;
  }

  addService(service) {
    const services = this.getServices();
    service.id = "custom-" + Date.now();
    service.isHidden = false;
    services.unshift(service);
    this.saveServices(services);
    return service;
  }

  getAppointments() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.APPOINTMENTS)) || DEFAULT_APPOINTMENTS;
    } catch (e) {
      return DEFAULT_APPOINTMENTS;
    }
  }

  saveAppointments(appointments) {
    localStorage.setItem(this.STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }

  addAppointment(appointmentData) {
    const appointments = this.getAppointments();
    const newRecord = {
      id: "EVO-" + Math.floor(1000 + Math.random() * 9000),
      status: appointmentData.status || "new",
      createdAt: new Date().toISOString(),
      ...appointmentData
    };
    appointments.unshift(newRecord);
    this.saveAppointments(appointments);
    return newRecord;
  }

  updateAppointmentStatus(id, newStatus) {
    const appointments = this.getAppointments();
    const app = appointments.find(a => a.id === id);
    if (app) {
      app.status = newStatus;
      this.saveAppointments(appointments);
      return true;
    }
    return false;
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
    const initLen = appointments.length;
    appointments = appointments.filter(a => a.id !== id);
    if (appointments.length !== initLen) {
      this.saveAppointments(appointments);
      return true;
    }
    return false;
  }

  getCategories() {
    return DEFAULT_CATEGORIES;
  }

  getSpecialists() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SPECIALISTS)) || DEFAULT_SPECIALISTS;
    } catch (e) {
      return DEFAULT_SPECIALISTS;
    }
  }

  getSalonInfo() {
    try {
      const info = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SALON)) || DEFAULT_SALON_INFO;
      info.telegram = "https://t.me/polinaleskk";
      return info;
    } catch (e) {
      return DEFAULT_SALON_INFO;
    }
  }

  formatMoney(amount) {
    if (!amount && amount !== 0) return "По запросу";
    return Number(amount).toLocaleString("ru-RU") + " ₫";
  }

  resetToDefault() {
    localStorage.setItem(this.STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
    localStorage.setItem(this.STORAGE_KEYS.APPOINTMENTS, JSON.stringify(DEFAULT_APPOINTMENTS));
    localStorage.setItem(this.STORAGE_KEYS.SPECIALISTS, JSON.stringify(DEFAULT_SPECIALISTS));
    localStorage.setItem(this.STORAGE_KEYS.SALON, JSON.stringify(DEFAULT_SALON_INFO));
  }
}

// Global instance
window.evoData = new EvoDataStore();
