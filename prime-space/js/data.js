/**
 * PRIME Space — База данных и DataService (Клиент + CRM)
 * "Space to Grow Together"
 * Хранилище: LocalStorage с предзаполненными реальными данными
 */

const PRIME_INFO = {
  name: "PRIME",
  brandName: "PRIME SPACE",
  tagline: "Space to Grow Together",
  subTagline: "Пространство, где развиваются люди и культура развития семьи",
  city: "Нячанг, Вьетнам",
  address: "Центр, PRIME Space Building (4 этажа)",
  phone: "+84 912 345 678",
  telegram: "https://t.me/PrimeSpaceVn",
  telegramHandle: "@PrimeSpaceVn",
  instagram: "https://instagram.com/primespace.vn",
  hours: "Ежедневно 08:30 – 21:30",
  principles: [
    "Взрослые развиваются, дети рядом — как полноценные участники среды",
    "9 функциональных пространств: от лаборатории 3D-печати до саундхилинга",
    "Экосистема полного дня: утренний кофе, дневные практики, вечерние события",
    "Среда для резидентов, авторов проектов, преподавателей и сообществ"
  ]
};

const PRIME_SPACES = [
  {
    id: "prime-body",
    name: "PRIME BODY",
    subtitle: "Большое пространство для событий и тела",
    icon: "🧘",
    color: "#E06D53", // терракотовый
    badgeBg: "rgba(224, 109, 83, 0.12)",
    capacity: 30,
    floor: "4 этаж (Панорамный зал)",
    desc: "Йога FYSM, балет, танцы, стретчинг, дыхательные практики, саундхилинг, лекции, концерты и фестивали.",
    features: ["Вместимость до 30 человек", "Панорамный вид", "Профессиональный звук", "Коврики и пропсы"]
  },
  {
    id: "prime-art",
    name: "PRIME ART",
    subtitle: "Творческая мастерская",
    icon: "🎨",
    color: "#2563EB", // насыщенный синий
    badgeBg: "rgba(37, 99, 235, 0.12)",
    capacity: 10,
    floor: "3 этаж",
    desc: "Арт-завтраки, живопись, скетчинг, лепка, декор, каллиграфия, акварель и мастер-классы для детей и взрослых.",
    features: ["Группы до 10 человек", "Мольберты и материалы", "Естественный свет", "Мокрая зона"]
  },
  {
    id: "prime-lab",
    name: "PRIME LAB",
    subtitle: "Лаборатория технологий и науки",
    icon: "💻",
    color: "#0D9488", // бирюзово-тиловый
    badgeBg: "rgba(13, 148, 136, 0.12)",
    capacity: 12,
    floor: "3 этаж",
    desc: "3D-моделирование и печать, робототехника на Arduino, лазерный микро-цех, программирование и языковые клубы.",
    features: ["3D-принтеры", "Электроника Arduino", "Ноутбуки", "Наставник-инженер"]
  },
  {
    id: "prime-mind",
    name: "PRIME MIND",
    subtitle: "Пространство идей и решений",
    icon: "💡",
    color: "#7C3AED", // фиолетовый
    badgeBg: "rgba(124, 58, 237, 0.12)",
    capacity: 20,
    floor: "2 этаж",
    desc: "Мастермайнды, стратегические сессии, клуб предпринимателей, мозговые штурмы, дебаты, киноклубы и лекторий.",
    features: ["Вместимость до 20 человек", "Большой смарт-экран", "Флипчарты", "Конференц-стол"]
  },
  {
    id: "prime-coworking",
    name: "PRIME COWORKING",
    subtitle: "Коворкинг и нетворкинг",
    icon: "👥",
    color: "#4F46E5", // индиго
    badgeBg: "rgba(79, 70, 229, 0.12)",
    capacity: 18,
    floor: "2 этаж",
    desc: "Комфортные рабочие места, скоростной Wi-Fi, нетворкинг, проведение турниров по шахматам и настольным играм.",
    features: ["Эргономичные кресла", "Высокоскоростной интернет", "Чайная зона", "Тихая атмосфера"]
  },
  {
    id: "prime-kids",
    name: "PRIME KIDS",
    subtitle: "Детское пространство и продленка",
    icon: "🧸",
    color: "#D97706", // теплый янтарный
    badgeBg: "rgba(217, 119, 6, 0.12)",
    capacity: 15,
    floor: "1-2 этаж",
    desc: "Игровая зона, продленка с тьютором, развивающие проекты, настольный футбол, свободное творчество и забота.",
    features: ["Тьюторское сопровождение", "Безопасная мебель", "Развивающие игры", "Помощь с уроками"]
  },
  {
    id: "prime-private",
    name: "PRIME PRIVATE",
    subtitle: "Пространство индивидуальной работы",
    icon: "👤",
    color: "#0284C7", // небесно-синий
    badgeBg: "rgba(2, 132, 199, 0.12)",
    capacity: 3,
    floor: "3 этаж",
    desc: "Кабинет для психологов, коучей, логопедов, диагностики и конфиденциальных онлайн-сессий. Доступен в аренду.",
    features: ["Шумоизоляция", "Уютные кресла", "Журнальный столик", "Аренда по часам"]
  },
  {
    id: "prime-balance",
    name: "PRIME BALANCE",
    subtitle: "Пространство телесных практик",
    icon: "🌸",
    color: "#DB2777", // ягодный
    badgeBg: "rgba(219, 39, 119, 0.12)",
    capacity: 2,
    floor: "3 этаж",
    desc: "Массаж, телесная терапия, косметология, остеопатия и восстановительные SPA-ритуалы. Доступен мастерам в аренду.",
    features: ["Массажная кушетка", "Раковина и гигиена", "Свечи и релакс", "Аренда мастерам"]
  },
  {
    id: "prime-cafe",
    name: "PRIME CAFE",
    subtitle: "Кафе и гастро-пространство встреч",
    icon: "☕",
    color: "#92400E", // кофейный
    badgeBg: "rgba(146, 64, 14, 0.12)",
    capacity: 25,
    floor: "1 этаж (Входная группа)",
    desc: "Спешелти-кофе, полезные завтраки, нетворкинг, клубные встречи и мини-лекции в непринужденной атмосфере.",
    features: ["Спешелти зерно", "Здоровое меню", "Летняя терраса", "Место для общения"]
  }
];

const DEFAULT_MASTERS = [
  { id: "m-vadim", name: "Вадим", role: "Тренер по стретчингу", spaces: ["prime-body"], avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" },
  { id: "m-diana", name: "Диана", role: "Хореограф, тренер стретчинга", spaces: ["prime-body"], avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" },
  { id: "m-anastasia", name: "Анастасия", role: "Инструктор йоги FYSM", spaces: ["prime-body"], avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80" },
  { id: "m-yulia-ho", name: "Юлия Хо", role: "Мастер Руси Дон Тон (тайская йога)", spaces: ["prime-body"], avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80" },
  { id: "m-andrey", name: "Андрей", role: "Художник, digital-арт педагог", spaces: ["prime-art", "prime-lab"], avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
  { id: "m-victoria", name: "Виктория", role: "Ведущая арт мастер-классов", spaces: ["prime-art"], avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" },
  { id: "m-nadezhda", name: "Надежда", role: "Психолог, телесный практик", spaces: ["prime-body", "prime-mind", "prime-coworking"], avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80" },
  { id: "m-timur", name: "Тимур", role: "Ведущий бизнес-игр («Денежный поток»)", spaces: ["prime-mind", "prime-coworking"], avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
  { id: "m-oksana", name: "Оксана Скрипаль", role: "Стилист, основатель Fashion Theatre", spaces: ["prime-body", "prime-mind"], avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" },
  { id: "m-ruslan", name: "Руслан", role: "Бизнес-трекер, спикер", spaces: ["prime-mind"], avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80" },
  { id: "m-maya", name: "Майя", role: "Педагог турклуба, мастер рукоделия", spaces: ["prime-coworking", "prime-art", "prime-mind"], avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80" },
  { id: "m-katrin", name: "Катрин", role: "Ведущая интеллектуальной Мафии", spaces: ["prime-coworking"], avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" },
  { id: "m-anna", name: "Анна", role: "Актриса, мастер саундхилинга", spaces: ["prime-body"], avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80" },
  { id: "m-natalia", name: "Наталья", role: "Хореограф Bachata DanceFit", spaces: ["prime-body"], avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" },
  { id: "m-kristina", name: "Кристина", role: "Мастер дыхательных практик", spaces: ["prime-body"], avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80" },
  { id: "m-yulia-k", name: "Юлия Крушинская", role: "Практик Аксесс Барс, семейный коуч", spaces: ["prime-mind"], avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80" }
];

/**
 * Стартовое расписание (на основе реальных таблиц открытия и постеров PRIME Space)
 * dayOfWeek: 1 = Пн, 2 = Вт, 3 = Ср, 4 = Чт, 5 = Пт, 6 = Сб, 7 = Вс
 */
const DEFAULT_SCHEDULE = [
  // --- ПЯТНИЦА (5) ---
  {
    id: "sch-fri-1",
    dayOfWeek: 5,
    timeStart: "10:00",
    timeEnd: "11:00",
    title: "Feel Dance 18+",
    spaceId: "prime-body",
    category: "adults",
    ageLabel: "18+",
    masterName: "Группа Скарлетт",
    maxSpots: 18,
    price: 180000,
    desc: "Чувственные танцевальные связки, раскрепощение тела и грация.",
    participants: [
      { id: "p1", name: "Алина В.", phone: "+84 90 234 5671", status: "confirmed", createdAt: "2026-10-15" },
      { id: "p2", name: "Мария С.", phone: "+84 91 345 6782", status: "confirmed", createdAt: "2026-10-15" },
      { id: "p3", name: "Ольга К.", phone: "+84 93 456 7893", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },
  {
    id: "sch-fri-2",
    dayOfWeek: 5,
    timeStart: "10:00",
    timeEnd: "11:30",
    title: "3D моделирование и печать для детей",
    spaceId: "prime-lab",
    category: "kids",
    ageLabel: "6-12 лет",
    masterName: "Андрей",
    maxSpots: 8,
    price: 220000,
    desc: "Создание первых 3D моделей в Tinkercad и запуск на реальную печать на 3D-принтере.",
    participants: [
      { id: "p4", name: "Артем (мама Елена)", phone: "+84 90 567 8901", status: "confirmed", createdAt: "2026-10-14" },
      { id: "p5", name: "Даниил (папа Сергей)", phone: "+84 91 678 9012", status: "confirmed", createdAt: "2026-10-14" },
      { id: "p6", name: "Марк (мама Анна)", phone: "+84 93 789 0123", status: "confirmed", createdAt: "2026-10-14" },
      { id: "p7", name: "София (мама Юлия)", phone: "+84 98 890 1234", status: "confirmed", createdAt: "2026-10-14" },
      { id: "p8", name: "Лев (папа Михаил)", phone: "+84 90 901 2345", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },
  {
    id: "sch-fri-3",
    dayOfWeek: 5,
    timeStart: "11:00",
    timeEnd: "12:00",
    title: "Stretching (Растяжка)",
    spaceId: "prime-body",
    category: "adults",
    ageLabel: "16+",
    masterName: "Диана",
    maxSpots: 15,
    price: 180000,
    desc: "Мягкая проработка всех групп мышц, раскрытие грудного отдела и гибкость суставов.",
    participants: [
      { id: "p9", name: "Екатерина Д.", phone: "+84 90 111 2233", status: "confirmed", createdAt: "2026-10-15" },
      { id: "p10", name: "Светлана Р.", phone: "+84 91 222 3344", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },
  {
    id: "sch-fri-4",
    dayOfWeek: 5,
    timeStart: "12:00",
    timeEnd: "13:30",
    title: "Компьютерная грамотность 12+",
    spaceId: "prime-lab",
    category: "kids",
    ageLabel: "12+",
    masterName: "Андрей",
    maxSpots: 10,
    price: 200000,
    desc: "Базовые алгоритмы, работа с нейросетями, безопасность в сети и логика программирования.",
    participants: [
      { id: "p11", name: "Никита П.", phone: "+84 90 333 4455", status: "confirmed", createdAt: "2026-10-14" },
      { id: "p12", name: "Егор М.", phone: "+84 91 444 5566", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },
  {
    id: "sch-fri-5",
    dayOfWeek: 5,
    timeStart: "15:00",
    timeEnd: "16:00",
    title: "Ballet for adults (Боди-балет)",
    spaceId: "prime-body",
    category: "adults",
    ageLabel: "18+",
    masterName: "Диана",
    maxSpots: 14,
    price: 200000,
    desc: "Королевская осанка, баланс, подтянутые мышцы и классическая хореография.",
    participants: [
      { id: "p13", name: "Анастасия Т.", phone: "+84 90 555 6677", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },
  {
    id: "sch-fri-6",
    dayOfWeek: 5,
    timeStart: "16:00",
    timeEnd: "17:30",
    title: "ART раскрытие таланта 4+",
    spaceId: "prime-art",
    category: "kids",
    ageLabel: "4-8 лет",
    masterName: "Виктория",
    maxSpots: 8,
    price: 220000,
    desc: "Смешанные техники: гуашь, фактурная бумага, отпечатки листьев и развитие моторики.",
    participants: [
      { id: "p14", name: "Алиса (мама Вера)", phone: "+84 90 666 7788", status: "confirmed", createdAt: "2026-10-14" },
      { id: "p15", name: "Тимофей (папа Денис)", phone: "+84 91 777 8899", status: "confirmed", createdAt: "2026-10-14" },
      { id: "p16", name: "Мия (мама Ирина)", phone: "+84 93 888 9900", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },
  {
    id: "sch-fri-7",
    dayOfWeek: 5,
    timeStart: "17:00",
    timeEnd: "18:30",
    title: "3D моделирование и печать для детей 6+",
    spaceId: "prime-lab",
    category: "kids",
    ageLabel: "6-12 лет",
    masterName: "Андрей",
    maxSpots: 8,
    price: 220000,
    desc: "Вечерняя группа: печать сувениров и роботов, объемное пространственное мышление.",
    participants: [
      { id: "p17", name: "Максим (мама Ольга)", phone: "+84 90 999 0011", status: "confirmed", createdAt: "2026-10-14" }
    ]
  },
  {
    id: "sch-fri-8",
    dayOfWeek: 5,
    timeStart: "18:00",
    timeEnd: "19:00",
    title: "Pilates Power 18+",
    spaceId: "prime-body",
    category: "adults",
    ageLabel: "18+",
    masterName: "Антонина",
    maxSpots: 16,
    price: 180000,
    desc: "Укрепление глубокого мышечного корсета, снятие зажимов спины после рабочего дня.",
    participants: [
      { id: "p18", name: "Виктория Н.", phone: "+84 91 123 4567", status: "confirmed", createdAt: "2026-10-15" },
      { id: "p19", name: "Елена Б.", phone: "+84 92 234 5678", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },
  {
    id: "sch-fri-9",
    dayOfWeek: 5,
    timeStart: "19:00",
    timeEnd: "20:30",
    title: "Актерское мастерство для взрослых",
    spaceId: "prime-body",
    category: "adults",
    ageLabel: "18+",
    masterName: "Анна",
    maxSpots: 14,
    price: 250000,
    desc: "Сценическая речь, снятие психоэмоциональных блоков, импровизация и свобода выражения.",
    participants: [
      { id: "p20", name: "Роман Г.", phone: "+84 90 345 6789", status: "confirmed", createdAt: "2026-10-14" },
      { id: "p21", name: "Юлия В.", phone: "+84 91 456 7890", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },

  // --- СУББОТА (6) ---
  {
    id: "sch-sat-1",
    dayOfWeek: 6,
    timeStart: "09:30",
    timeEnd: "10:30",
    title: "Ballet for adults",
    spaceId: "prime-body",
    category: "adults",
    ageLabel: "18+",
    masterName: "Диана",
    maxSpots: 15,
    price: 200000,
    desc: "Утренняя классическая разминка у станка, грациозность и легкость на весь уикенд.",
    participants: [
      { id: "p22", name: "Мария К.", phone: "+84 90 123 7788", status: "confirmed", createdAt: "2026-10-14" }
    ]
  },
  {
    id: "sch-sat-2",
    dayOfWeek: 6,
    timeStart: "10:00",
    timeEnd: "13:00",
    title: "Шахматный клуб и турнир",
    spaceId: "prime-coworking",
    category: "all",
    ageLabel: "Дети и взрослые",
    masterName: "Тимур",
    maxSpots: 16,
    price: 150000,
    desc: "Открытый шахматный коворкинг: разбор дебютов, свободные партии и турнирный зачет.",
    participants: [
      { id: "p23", name: "Илья (8 лет)", phone: "+84 90 456 1122", status: "confirmed", createdAt: "2026-10-14" },
      { id: "p24", name: "Владимир (папа)", phone: "+84 90 456 1122", status: "confirmed", createdAt: "2026-10-14" },
      { id: "p25", name: "Константин", phone: "+84 91 567 2233", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },
  {
    id: "sch-sat-3",
    dayOfWeek: 6,
    timeStart: "10:30",
    timeEnd: "11:30",
    title: "ОФП для детей 4+",
    spaceId: "prime-body",
    category: "kids",
    ageLabel: "4-7 лет",
    masterName: "Вадим",
    maxSpots: 12,
    price: 180000,
    desc: "Общая физическая подготовка в игровой форме: ловкость, координация, осанка.",
    participants: [
      { id: "p26", name: "Тимофей (мама Олеся)", phone: "+84 90 888 1111", status: "confirmed", createdAt: "2026-10-15" },
      { id: "p27", name: "Кирилл (папа Антон)", phone: "+84 91 999 2222", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },
  {
    id: "sch-sat-4",
    dayOfWeek: 6,
    timeStart: "11:00",
    timeEnd: "12:00",
    title: "Рисование Дети",
    spaceId: "prime-art",
    category: "kids",
    ageLabel: "7-12 лет",
    masterName: "Андрей",
    maxSpots: 8,
    price: 220000,
    desc: "Акварельная иллюстрация и основы композиции для юных художников.",
    participants: [
      { id: "p28", name: "Полина (мама Дарья)", phone: "+84 90 333 9988", status: "confirmed", createdAt: "2026-10-14" },
      { id: "p29", name: "Василиса (мама Светлана)", phone: "+84 91 444 0099", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },
  {
    id: "sch-sat-5",
    dayOfWeek: 6,
    timeStart: "11:00",
    timeEnd: "13:00",
    title: "МастерМайнд: Развитие и проекты",
    spaceId: "prime-mind",
    category: "mind",
    ageLabel: "18+",
    masterName: "Руслан",
    maxSpots: 12,
    price: 350000,
    desc: "Мозговой штурм по бизнес-запросам резидентов, обратная связь, нетворкинг и инсайты.",
    participants: [
      { id: "p30", name: "Александр (IT)", phone: "+84 90 555 1234", status: "confirmed", createdAt: "2026-10-13" },
      { id: "p31", name: "Евгения (Маркетинг)", phone: "+84 91 666 2345", status: "confirmed", createdAt: "2026-10-14" },
      { id: "p32", name: "Дмитрий (E-com)", phone: "+84 92 777 3456", status: "confirmed", createdAt: "2026-10-14" }
    ]
  },
  {
    id: "sch-sat-6",
    dayOfWeek: 6,
    timeStart: "11:30",
    timeEnd: "12:30",
    title: "Kudo Дети (6–14 лет)",
    spaceId: "prime-body",
    category: "kids",
    ageLabel: "6-14 лет",
    masterName: "Вадим",
    maxSpots: 12,
    price: 200000,
    desc: "Восточное единоборство: дисциплина, самостраховка, развитие уверенности в себе.",
    participants: [
      { id: "p33", name: "Даниил С.", phone: "+84 90 123 4455", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },
  {
    id: "sch-sat-7",
    dayOfWeek: 6,
    timeStart: "12:30",
    timeEnd: "13:30",
    title: "Ораторское искусство",
    spaceId: "prime-body",
    category: "all",
    ageLabel: "Подростки и взрослые",
    masterName: "Анна",
    maxSpots: 15,
    price: 220000,
    desc: "Уверенность перед аудиторией, четкая дикция, жестикуляция и преодоление страха сцены.",
    participants: []
  },
  {
    id: "sch-sat-8",
    dayOfWeek: 6,
    timeStart: "14:00",
    timeEnd: "15:30",
    title: "Уютный скетчинг 16+",
    spaceId: "prime-art",
    category: "adults",
    ageLabel: "16+",
    masterName: "Виктория",
    maxSpots: 10,
    price: 250000,
    desc: "Быстрые маркерные зарисовки архитектуры Нячанга и тропических растений с чашкой кофе.",
    participants: [
      { id: "p34", name: "Ольга М.", phone: "+84 90 777 6655", status: "confirmed", createdAt: "2026-10-15" },
      { id: "p35", name: "Елена В.", phone: "+84 91 888 7766", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },
  {
    id: "sch-sat-9",
    dayOfWeek: 6,
    timeStart: "16:00",
    timeEnd: "18:00",
    title: "3D моделирование и печать 6+",
    spaceId: "prime-lab",
    category: "kids",
    ageLabel: "6-14 лет",
    masterName: "Андрей",
    maxSpots: 8,
    price: 220000,
    desc: "Субботний интенсив: сборка подвижных суставов и печать фигурок на 3D принтерах.",
    participants: [
      { id: "p36", name: "Матвей (папа Олег)", phone: "+84 90 222 3311", status: "confirmed", createdAt: "2026-10-14" },
      { id: "p37", name: "Степан (мама Ксения)", phone: "+84 91 333 4422", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },
  {
    id: "sch-sat-10",
    dayOfWeek: 6,
    timeStart: "18:00",
    timeEnd: "19:30",
    title: "Выступление музыканта и акустический вечер",
    spaceId: "prime-body",
    category: "all",
    ageLabel: "Семейный формат",
    masterName: "PRIME Event Team",
    maxSpots: 30,
    price: 250000,
    desc: "Живая акустическая музыка, чайная церемония и общение резидентов на 4 этаже.",
    participants: [
      { id: "p38", name: "Семья Вороновых (3 чел)", phone: "+84 90 123 9988", status: "confirmed", createdAt: "2026-10-14" },
      { id: "p39", name: "Иван и Анна", phone: "+84 91 234 0099", status: "confirmed", createdAt: "2026-10-15" },
      { id: "p40", name: "Сергей К.", phone: "+84 92 345 1100", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },

  // --- ВОСКРЕСЕНЬЕ (7) ---
  {
    id: "sch-sun-1",
    dayOfWeek: 7,
    timeStart: "10:00",
    timeEnd: "11:30",
    title: "Йога FYSM 18+",
    spaceId: "prime-body",
    category: "adults",
    ageLabel: "18+",
    masterName: "Анастасия",
    maxSpots: 20,
    price: 200000,
    desc: "Методология безопасной силовой йоги, отстройка дыхания и восстановление энергии.",
    participants: [
      { id: "p41", name: "Кристина М.", phone: "+84 90 888 2233", status: "confirmed", createdAt: "2026-10-15" },
      { id: "p42", name: "Татьяна С.", phone: "+84 91 999 3344", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },
  {
    id: "sch-sun-2",
    dayOfWeek: 7,
    timeStart: "11:30",
    timeEnd: "13:00",
    title: "Тайская безопасная йога (Руси Дон Тон)",
    spaceId: "prime-body",
    category: "adults",
    ageLabel: "18+",
    masterName: "Юлия Хо",
    maxSpots: 16,
    price: 200000,
    desc: "Древняя тайская система самомассажа и мягких терапевтических растяжек суставов.",
    participants: [
      { id: "p43", name: "Ольга В.", phone: "+84 90 555 4433", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },
  {
    id: "sch-sun-3",
    dayOfWeek: 7,
    timeStart: "13:00",
    timeEnd: "15:00",
    title: "Игра «Денежный поток» для детей",
    spaceId: "prime-mind",
    category: "kids",
    ageLabel: "9-15 лет",
    masterName: "Тимур",
    maxSpots: 8,
    price: 250000,
    desc: "Основы финансовой грамотности в игровом формате Роберта Кийосаки.",
    participants: [
      { id: "p44", name: "Ярослав (11 лет)", phone: "+84 90 111 5566", status: "confirmed", createdAt: "2026-10-14" },
      { id: "p45", name: "Елисей (12 лет)", phone: "+84 91 222 6677", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },
  {
    id: "sch-sun-4",
    dayOfWeek: 7,
    timeStart: "16:00",
    timeEnd: "18:00",
    title: "Интеллектуальная Мафия",
    spaceId: "prime-coworking",
    category: "all",
    ageLabel: "10-16 лет",
    masterName: "Катрин",
    maxSpots: 12,
    price: 150000,
    desc: "Классическая клубная мафия: логика, психология, ораторское мастерство и азарт.",
    participants: [
      { id: "p46", name: "Михаил (13 лет)", phone: "+84 90 777 1234", status: "confirmed", createdAt: "2026-10-14" },
      { id: "p47", name: "Виктор (14 лет)", phone: "+84 91 888 2345", status: "confirmed", createdAt: "2026-10-15" },
      { id: "p48", name: "Алиса (12 лет)", phone: "+84 92 999 3456", status: "confirmed", createdAt: "2026-10-15" }
    ]
  },
  {
    id: "sch-sun-5",
    dayOfWeek: 7,
    timeStart: "18:00",
    timeEnd: "19:30",
    title: "Саундхилинг и тибетские чаши 18+",
    spaceId: "prime-body",
    category: "adults",
    ageLabel: "18+",
    masterName: "Анна",
    maxSpots: 18,
    price: 280000,
    desc: "Глубокая звуковая медитация с поющими чашами, колокольчиками коши и гонгом.",
    participants: [
      { id: "p49", name: "Елена П.", phone: "+84 90 444 8899", status: "confirmed", createdAt: "2026-10-14" },
      { id: "p50", name: "Денис М.", phone: "+84 91 555 9900", status: "confirmed", createdAt: "2026-10-15" },
      { id: "p51", name: "Наталья Ж.", phone: "+84 93 666 0011", status: "confirmed", createdAt: "2026-10-15" }
    ]
  }
];

/**
 * Бронирование индивидуальных кабинетов (PRIME PRIVATE и PRIME BALANCE)
 */
const DEFAULT_RENTALS = [
  {
    id: "rent-1",
    dayOfWeek: 5,
    spaceId: "prime-private",
    timeStart: "11:00",
    timeEnd: "13:00",
    specialistName: "Елена Смирнова",
    specialistRole: "Психолог, семейный консультант",
    clientName: "Частная сессия",
    status: "confirmed"
  },
  {
    id: "rent-2",
    dayOfWeek: 5,
    spaceId: "prime-balance",
    timeStart: "14:00",
    timeEnd: "17:00",
    specialistName: "Анна Макарова",
    specialistRole: "Остеопат, массажист",
    clientName: "Прием пациентов (3 слота)",
    status: "confirmed"
  },
  {
    id: "rent-3",
    dayOfWeek: 6,
    spaceId: "prime-private",
    timeStart: "14:00",
    timeEnd: "16:00",
    specialistName: "Михаил Ковалев",
    specialistRole: "Бизнес-коуч ICF",
    clientName: "Стратегическая сессия",
    status: "confirmed"
  }
];

class PrimeDataService {
  constructor() {
    this.STORAGE_KEYS = {
      SCHEDULE: "prime_space_schedule_v1",
      MASTERS: "prime_space_masters_v1",
      RENTALS: "prime_space_rentals_v1",
      CLIENTS: "prime_space_clients_v1",
      SETTINGS: "prime_space_settings_v1"
    };
  }

  // --- ПРОСТРАНСТВА (SPACES) ---
  getSpaces() {
    return PRIME_SPACES;
  }

  getSpaceById(id) {
    return PRIME_SPACES.find(s => s.id === id) || null;
  }

  // --- МАСТЕРА И РЕЗИДЕНТЫ ---
  getMasters() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.MASTERS);
      return data ? JSON.parse(data) : DEFAULT_MASTERS;
    } catch (e) {
      return DEFAULT_MASTERS;
    }
  }

  saveMasters(masters) {
    localStorage.setItem(this.STORAGE_KEYS.MASTERS, JSON.stringify(masters));
  }

  addMaster(master) {
    const masters = this.getMasters();
    const newMaster = {
      id: "m-" + Date.now().toString(36),
      name: master.name,
      role: master.role || "Резидент PRIME",
      spaces: master.spaces || ["prime-body"],
      avatar: master.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
    };
    masters.push(newMaster);
    this.saveMasters(masters);
    return newMaster;
  }

  updateMaster(id, updatedData) {
    const masters = this.getMasters();
    const idx = masters.findIndex(m => m.id === id);
    if (idx !== -1) {
      masters[idx] = { ...masters[idx], ...updatedData };
      this.saveMasters(masters);
      return masters[idx];
    }
    return null;
  }

  deleteMaster(id) {
    let masters = this.getMasters();
    masters = masters.filter(m => m.id !== id);
    this.saveMasters(masters);
    return true;
  }

  // --- РАСПИСАНИЕ ЗАНЯТИЙ (SCHEDULE) ---
  getSchedule() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.SCHEDULE);
      return data ? JSON.parse(data) : DEFAULT_SCHEDULE;
    } catch (e) {
      return DEFAULT_SCHEDULE;
    }
  }

  saveSchedule(schedule) {
    localStorage.setItem(this.STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
  }

  getScheduleByDay(dayOfWeek) {
    const list = this.getSchedule();
    return list
      .filter(item => item.dayOfWeek === parseInt(dayOfWeek, 10))
      .sort((a, b) => a.timeStart.localeCompare(b.timeStart));
  }

  getScheduleItemById(id) {
    const list = this.getSchedule();
    return list.find(item => item.id === id) || null;
  }

  addScheduleItem(item) {
    const list = this.getSchedule();
    const newItem = {
      id: "sch-" + Date.now().toString(36),
      dayOfWeek: parseInt(item.dayOfWeek, 10),
      timeStart: item.timeStart,
      timeEnd: item.timeEnd,
      title: item.title,
      spaceId: item.spaceId,
      category: item.category || "all",
      ageLabel: item.ageLabel || "Для всех",
      masterName: item.masterName || "Мастер PRIME",
      maxSpots: parseInt(item.maxSpots, 10) || 12,
      price: parseInt(item.price, 10) || 200000,
      desc: item.desc || "",
      participants: []
    };
    list.push(newItem);
    this.saveSchedule(list);
    return newItem;
  }

  updateScheduleItem(id, updatedFields) {
    const list = this.getSchedule();
    const idx = list.findIndex(item => item.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updatedFields };
      this.saveSchedule(list);
      return list[idx];
    }
    return null;
  }

  deleteScheduleItem(id) {
    let list = this.getSchedule();
    list = list.filter(item => item.id !== id);
    this.saveSchedule(list);
    return true;
  }

  // --- ЗАПИСЬ НА ЗАНЯТИЕ (BOOKING & PARTICIPANTS) ---
  bookSpot(scheduleItemId, guestData) {
    const list = this.getSchedule();
    const item = list.find(it => it.id === scheduleItemId);
    if (!item) return { success: false, error: "Занятие не найдено" };

    if (!item.participants) item.participants = [];

    if (item.participants.length >= item.maxSpots) {
      return { success: false, error: "Все места заняты" };
    }

    const newParticipant = {
      id: "p-" + Date.now().toString(36),
      name: guestData.name,
      phone: guestData.phone,
      comment: guestData.comment || "",
      spotsCount: parseInt(guestData.spotsCount, 10) || 1,
      status: "confirmed", // confirmed, visited, cancelled
      createdAt: new Date().toISOString()
    };

    item.participants.push(newParticipant);
    this.saveSchedule(list);

    // Автоматически фиксируем / обновляем карточку гостя в базе клиентов
    this.recordClientBooking(guestData, item);

    return { success: true, participant: newParticipant, item };
  }

  removeParticipant(scheduleItemId, participantId) {
    const list = this.getSchedule();
    const item = list.find(it => it.id === scheduleItemId);
    if (!item || !item.participants) return false;

    item.participants = item.participants.filter(p => p.id !== participantId);
    this.saveSchedule(list);
    return true;
  }

  updateParticipantStatus(scheduleItemId, participantId, newStatus) {
    const list = this.getSchedule();
    const item = list.find(it => it.id === scheduleItemId);
    if (!item || !item.participants) return false;

    const p = item.participants.find(p => p.id === participantId);
    if (p) {
      p.status = newStatus;
      this.saveSchedule(list);
      return true;
    }
    return false;
  }

  // --- АРЕНДА КАБИНЕТОВ (RENTALS) ---
  getRentals() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.RENTALS);
      return data ? JSON.parse(data) : DEFAULT_RENTALS;
    } catch (e) {
      return DEFAULT_RENTALS;
    }
  }

  saveRentals(rentals) {
    localStorage.setItem(this.STORAGE_KEYS.RENTALS, JSON.stringify(rentals));
  }

  addRental(rental) {
    const rentals = this.getRentals();
    const newRental = {
      id: "rent-" + Date.now().toString(36),
      dayOfWeek: parseInt(rental.dayOfWeek, 10),
      spaceId: rental.spaceId,
      timeStart: rental.timeStart,
      timeEnd: rental.timeEnd,
      specialistName: rental.specialistName,
      specialistRole: rental.specialistRole || "Специалист / Резидент",
      clientName: rental.clientName || "Индивидуальный визит",
      status: "confirmed"
    };
    rentals.push(newRental);
    this.saveRentals(rentals);
    return newRental;
  }

  deleteRental(id) {
    let rentals = this.getRentals();
    rentals = rentals.filter(r => r.id !== id);
    this.saveRentals(rentals);
    return true;
  }

  // --- БАЗА КЛИЕНТОВ (CLIENTS CRM) ---
  getClients() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.CLIENTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return this.rebuildClientsFromSchedule();
    } catch (e) {
      return this.rebuildClientsFromSchedule();
    }
  }

  saveClients(clients) {
    localStorage.setItem(this.STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }

  rebuildClientsFromSchedule() {
    const schedule = this.getSchedule();
    const clientsMap = {};

    const PRESETS = {
      "+84 90 567 8901": {
        notes: "Ходит с сыном Артемом (7 лет). Мама Елена во время детских занятий работает в коворкинге на 2 этаже. Предупреждать о наборе на новые интенсивы по 3D.",
        telegram: "@elena_prime",
        extraHistory: [
          {
            lessonId: "hist-1",
            lessonTitle: "Робототехника и механика LEGO",
            dayOfWeek: 3,
            time: "16:30 – 18:00",
            spaceId: "prime-lab",
            masterName: "Андрей",
            price: 200000,
            status: "visited",
            date: "14.10.2026"
          },
          {
            lessonId: "hist-2",
            lessonTitle: "Пробный день в детской среде",
            dayOfWeek: 1,
            time: "15:00 – 16:30",
            spaceId: "prime-kids",
            masterName: "Ольга",
            price: 0,
            status: "visited",
            date: "12.10.2026"
          }
        ]
      },
      "+84 90 555 1234": {
        notes: "IT-предприниматель, резидент коворкинга на 2 этаже. Активный участник субботнего МастерМайнда в зале MIND.",
        telegram: "@alex_it_hub",
        extraHistory: [
          {
            lessonId: "hist-3",
            lessonTitle: "Дневной тариф коворкинга (Hot Desk)",
            dayOfWeek: 4,
            time: "10:00 – 19:00",
            spaceId: "prime-coworking",
            masterName: "Администратор",
            price: 150000,
            status: "visited",
            date: "15.10.2026"
          },
          {
            lessonId: "hist-4",
            lessonTitle: "Дневной тариф коворкинга (Hot Desk)",
            dayOfWeek: 2,
            time: "10:00 – 19:00",
            spaceId: "prime-coworking",
            masterName: "Администратор",
            price: 150000,
            status: "visited",
            date: "13.10.2026"
          }
        ]
      },
      "+84 90 234 5671": {
        notes: "Постоянная гостья танцевальных практик и стретчинга. Интересуется саундхилингом и медитациями в зале BODY.",
        telegram: "@alina_v",
        extraHistory: [
          {
            lessonId: "hist-5",
            lessonTitle: "Stretching (Растяжка)",
            dayOfWeek: 3,
            time: "11:00 – 12:00",
            spaceId: "prime-body",
            masterName: "Диана",
            price: 180000,
            status: "visited",
            date: "14.10.2026"
          }
        ]
      },
      "+84 90 111 2233": {
        notes: "Постоянный абонемент на утренний стретчинг и боди-балет у Дианы. Любит травяной чай с мятой в кафе.",
        telegram: "@katya_dance",
        extraHistory: [
          {
            lessonId: "hist-6",
            lessonTitle: "Ballet for adults (Боди-балет)",
            dayOfWeek: 2,
            time: "15:00 – 16:00",
            spaceId: "prime-body",
            masterName: "Диана",
            price: 200000,
            status: "visited",
            date: "13.10.2026"
          }
        ]
      },
      "+84 91 678 9012": {
        notes: "Папа Сергей приводит сына Даниила. Интересовался шахматным клубом в коворкинге по субботам.",
        telegram: "@sergey_d",
        extraHistory: [
          {
            lessonId: "hist-7",
            lessonTitle: "ОФП для детей 4+",
            dayOfWeek: 3,
            time: "17:00 – 18:00",
            spaceId: "prime-body",
            masterName: "Вадим",
            price: 180000,
            status: "visited",
            date: "14.10.2026"
          }
        ]
      },
      "+84 98 890 1234": {
        notes: "Дочка София (8 лет) занимается в 3D-лаборатории и на арт-мастер-классах. Мама берет матча-латте в кафе.",
        telegram: "@yulia_sofia",
        extraHistory: [
          {
            lessonId: "hist-8",
            lessonTitle: "Рисование Дети",
            dayOfWeek: 6,
            time: "11:00 – 12:00",
            spaceId: "prime-art",
            masterName: "Андрей",
            price: 220000,
            status: "visited",
            date: "10.10.2026"
          }
        ]
      },
      "+84 93 456 7893": {
        notes: "Занимается в женских группах выходного дня. Предпочитает зал PRIME BODY на 4 этаже.",
        telegram: "@olga_k"
      },
      "+84 90 333 4455": {
        notes: "Подростковая группа по компьютерной грамотности и AI у Андрея. Очень увлечен нейросетями.",
        telegram: "@nikita_coder"
      },
      "+84 91 123 4567": {
        notes: "Пилатес для здоровья спины после офисной работы.",
        telegram: "@viktoria_n"
      },
      "+84 90 345 6789": {
        notes: "Актерское мастерство для взрослых у Анны. Готовится к публичным выступлениям.",
        telegram: "@roman_speaker"
      }
    };

    const DAY_DATES = {
      1: "12.10.2026",
      2: "13.10.2026",
      3: "14.10.2026",
      4: "15.10.2026",
      5: "16.10.2026",
      6: "17.10.2026",
      7: "18.10.2026"
    };

    schedule.forEach(item => {
      if (!item.participants) return;
      item.participants.forEach(p => {
        const key = (p.phone || p.name).trim().toLowerCase();
        const preset = PRESETS[p.phone] || {};

        if (!clientsMap[key]) {
          clientsMap[key] = {
            id: "c-" + Math.abs(this.hashCode(key)),
            name: p.name,
            phone: p.phone,
            telegram: preset.telegram || "",
            notes: preset.notes || "",
            firstVisit: preset.extraHistory ? preset.extraHistory[preset.extraHistory.length - 1].date : (DAY_DATES[item.dayOfWeek] || "14.10.2026"),
            visitsCount: 0,
            history: []
          };
          if (preset.extraHistory) {
            preset.extraHistory.forEach(eh => {
              clientsMap[key].history.push(eh);
              clientsMap[key].visitsCount += 1;
            });
          }
        }

        clientsMap[key].visitsCount += 1;
        clientsMap[key].history.unshift({
          lessonId: item.id,
          lessonTitle: item.title,
          dayOfWeek: item.dayOfWeek,
          time: `${item.timeStart} – ${item.timeEnd}`,
          spaceId: item.spaceId,
          masterName: item.masterName,
          price: item.price,
          status: p.status || "confirmed",
          date: DAY_DATES[item.dayOfWeek] || "16.10.2026"
        });
      });
    });

    const clientsList = Object.values(clientsMap).sort((a, b) => b.visitsCount - a.visitsCount);
    this.saveClients(clientsList);
    return clientsList;
  }

  recordClientBooking(guestData, lessonItem) {
    const clients = this.getClients();
    const key = (guestData.phone || guestData.name).trim().toLowerCase();
    let client = clients.find(c => (c.phone || c.name).trim().toLowerCase() === key);

    const historyItem = {
      lessonId: lessonItem.id,
      lessonTitle: lessonItem.title,
      dayOfWeek: lessonItem.dayOfWeek,
      time: `${lessonItem.timeStart} – ${lessonItem.timeEnd}`,
      spaceId: lessonItem.spaceId,
      masterName: lessonItem.masterName,
      price: lessonItem.price,
      status: "confirmed",
      date: new Date().toISOString().split("T")[0]
    };

    if (client) {
      client.visitsCount = (client.visitsCount || 0) + 1;
      if (!client.history) client.history = [];
      client.history.unshift(historyItem);
      if (guestData.name && (!client.name || client.name.length < guestData.name.length)) {
        client.name = guestData.name;
      }
    } else {
      client = {
        id: "c-" + Date.now().toString(36),
        name: guestData.name,
        phone: guestData.phone,
        notes: guestData.comment || "",
        firstVisit: new Date().toISOString().split("T")[0],
        visitsCount: 1,
        history: [historyItem]
      };
      clients.unshift(client);
    }

    this.saveClients(clients);
    return client;
  }

  updateClientNotes(clientId, notes) {
    const clients = this.getClients();
    const client = clients.find(c => c.id === clientId);
    if (client) {
      client.notes = notes;
      this.saveClients(clients);
      return true;
    }
    return false;
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  // Вспомогательный метод форматирования денег
  formatPrice(price) {
    if (!price || price === 0) return "Свободный вход";
    return price.toLocaleString("ru-RU") + " ₫";
  }
}

// Экспортируем глобальный сервис данных
window.primeData = new PrimeDataService();
window.PRIME_INFO = PRIME_INFO;
