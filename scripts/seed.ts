/**
 * Seed script — populates Firestore with demo data for testing.
 * Run: npx tsx scripts/seed.ts
 */
import * as admin from 'firebase-admin'
import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: join(process.cwd(), '.env.local') })

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  })
}

const db = admin.firestore()
const now = admin.firestore.Timestamp.now()

type DemoTenant = {
  id: string
  name: string
  slug: string
  email: string
  primary_color: string
  theme: 'modern' | 'luxury' | 'nature' | 'ocean' | 'desert' | 'midnight'
  business_type: 'real_estate' | 'restaurant' | 'salon' | 'retail' | 'services' | 'other'
  currency: string
  offerLabel1: string
  offerLabel2: string
  tagline: string
  bio: string
  contactPhone: string
  contactAddress: string
  coverUrl: string
  listings: Array<{
    title: string
    body: string
    price: number
    location: string
    bedrooms: number | null
    bathrooms: number | null
    area_sqm: number | null
    listing_status: 'available' | 'sold' | 'rented'
    category: string
    offer_type: 'sale' | 'rent'
    images: string[]
  }>
  leads: Array<{
    name: string
    email: string
    phone: string
    message: string
    status: 'new' | 'contacted'
    source: 'inquiry_form' | 'whatsapp'
  }>
}

const DEMO_TENANTS: DemoTenant[] = [
  {
    id: 'demo-agency',
    name: 'وكالة ديمو',
    slug: 'demo',
    email: 'demo@demo.com',
    primary_color: '#2563eb',
    theme: 'modern',
    business_type: 'real_estate',
    currency: 'SAR',
    offerLabel1: 'للبيع',
    offerLabel2: 'للإيجار',
    tagline: 'نحقق أحلامك العقارية',
    bio: 'شريكك العقاري الموثوق — خبرة تمتد لأكثر من 10 سنوات في السوق.',
    contactPhone: '+966 55 000 0000',
    contactAddress: 'الرياض، حي العليا، شارع العروبة',
    coverUrl: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1600',
    listings: [
      {
        title: 'فيلا فاخرة في حي النرجس',
        body: 'فيلا 5 غرف نوم مع مسبح خاص وحديقة واسعة.',
        price: 4500000,
        location: 'الرياض، حي النرجس',
        bedrooms: 5,
        bathrooms: 6,
        area_sqm: 820,
        listing_status: 'available',
        category: 'فيلا',
        offer_type: 'sale',
        images: ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
      {
        title: 'شقة عصرية في حي العليا',
        body: 'شقة 3 غرف نوم بإطلالة بانورامية على المدينة.',
        price: 950000,
        location: 'الرياض، حي العليا',
        bedrooms: 3,
        bathrooms: 2,
        area_sqm: 180,
        listing_status: 'available',
        category: 'شقة',
        offer_type: 'sale',
        images: ['https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
      {
        title: 'مكتب تجاري في برج المملكة',
        body: 'مكتب 200 متر مربع جاهز للاستخدام الفوري.',
        price: 12000,
        location: 'الرياض، طريق الملك فهد',
        bedrooms: null,
        bathrooms: null,
        area_sqm: 200,
        listing_status: 'available',
        category: 'مكتب',
        offer_type: 'rent',
        images: ['https://images.pexels.com/photos/260931/pexels-photo-260931.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
      {
        title: 'أرض سكنية في حي الياسمين',
        body: 'أرض سكنية مميزة على شارعين.',
        price: 2100000,
        location: 'الرياض، حي الياسمين',
        bedrooms: null,
        bathrooms: null,
        area_sqm: 625,
        listing_status: 'available',
        category: 'أرض',
        offer_type: 'sale',
        images: ['https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
    ],
    leads: [
      {
        name: 'أحمد الرشيد',
        email: 'ahmed@example.com',
        phone: '+966 55 111 2222',
        message: 'مهتم بالفيلا في حي النرجس.',
        status: 'new',
        source: 'inquiry_form',
      },
      {
        name: 'سارة الجهني',
        email: 'sara@example.com',
        phone: '+966 50 333 4444',
        message: 'أبحث عن شقة 3 غرف في الرياض.',
        status: 'contacted',
        source: 'whatsapp',
      },
    ],
  },
  {
    id: 'demo-restaurant',
    name: 'مطعم سفرة الفخامة',
    slug: 'demo-restaurant',
    email: 'restaurant@demo.com',
    primary_color: '#c9a84c',
    theme: 'luxury',
    business_type: 'restaurant',
    currency: 'SAR',
    offerLabel1: 'متاح',
    offerLabel2: 'خاص',
    tagline: 'تجربة طعام استثنائية',
    bio: 'مطعم فاخر يقدم أطباقاً عالمية بلمسة شرقية في أجواء أنيقة.',
    contactPhone: '+966 55 100 2000',
    contactAddress: 'جدة، حي الشاطئ، طريق الكورنيش',
    coverUrl: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1600',
    listings: [
      {
        title: 'بوكس عشاء فاخر لشخصين',
        body: 'قائمة تذوق من 5 أطباق مع تحلية مميزة.',
        price: 420,
        location: 'فرع الشاطئ - جدة',
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'available',
        category: 'قائمة',
        offer_type: 'sale',
        images: ['https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
      {
        title: 'بوفيه غداء أعمال',
        body: 'بوفيه يومي للشركات مع حجز مسبق.',
        price: 149,
        location: 'فرع الروضة - جدة',
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'available',
        category: 'بوفيه',
        offer_type: 'sale',
        images: ['https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
      {
        title: 'حجز قاعة المناسبات',
        body: 'قاعة خاصة للمناسبات الصغيرة والمتوسطة.',
        price: 5000,
        location: 'جدة - قاعة المطعم',
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'rented',
        category: 'فعاليات',
        offer_type: 'rent',
        images: ['https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
    ],
    leads: [
      {
        name: 'نورة العتيبي',
        email: 'noura@example.com',
        phone: '+966 50 101 2020',
        message: 'أرغب بحجز القاعة ليوم الجمعة.',
        status: 'new',
        source: 'inquiry_form',
      },
      {
        name: 'عبدالعزيز فهد',
        email: 'aziz@example.com',
        phone: '+966 55 303 4040',
        message: 'هل يتوفر بوفيه لـ 30 شخص؟',
        status: 'contacted',
        source: 'whatsapp',
      },
    ],
  },
  {
    id: 'demo-salon',
    name: 'صالون نسمة بيوتي',
    slug: 'demo-salon',
    email: 'salon@demo.com',
    primary_color: '#16a34a',
    theme: 'nature',
    business_type: 'salon',
    currency: 'SAR',
    offerLabel1: 'متاح',
    offerLabel2: 'محجوز',
    tagline: 'جمالك يبدأ من هنا',
    bio: 'صالون تجميل متكامل يقدم خدمات الشعر والبشرة والسبا بأحدث التقنيات.',
    contactPhone: '+966 55 200 3000',
    contactAddress: 'الرياض، حي الندى',
    coverUrl: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1600',
    listings: [
      {
        title: 'باقة عناية متكاملة للشعر',
        body: 'جلسة قص، ترطيب عميق، وتسريح احترافي.',
        price: 320,
        location: 'فرع الندى - الرياض',
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'available',
        category: 'شعر',
        offer_type: 'sale',
        images: ['https://images.pexels.com/photos/3993304/pexels-photo-3993304.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
      {
        title: 'جلسة عناية بالبشرة',
        body: 'تنظيف عميق مع ماسك فيتامينات.',
        price: 260,
        location: 'فرع الندى - الرياض',
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'available',
        category: 'بشرة',
        offer_type: 'sale',
        images: ['https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
      {
        title: 'غرفة سبا VIP',
        body: 'تأجير غرفة خاصة للسبا والجاكوزي.',
        price: 900,
        location: 'فرع الندى - الرياض',
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'rented',
        category: 'سبا',
        offer_type: 'rent',
        images: ['https://images.pexels.com/photos/7755255/pexels-photo-7755255.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
    ],
    leads: [
      {
        name: 'ريم الحربي',
        email: 'reem@example.com',
        phone: '+966 56 222 1100',
        message: 'أرغب بحجز باقة الشعر ليوم السبت.',
        status: 'new',
        source: 'inquiry_form',
      },
      {
        name: 'هدى الشمري',
        email: 'huda@example.com',
        phone: '+966 53 818 8181',
        message: 'ما هي أوقات جلسات البشرة؟',
        status: 'contacted',
        source: 'whatsapp',
      },
    ],
  },
  {
    id: 'demo-retail',
    name: 'متجر بلو لايف',
    slug: 'demo-retail',
    email: 'retail@demo.com',
    primary_color: '#0891b2',
    theme: 'ocean',
    business_type: 'retail',
    currency: 'SAR',
    offerLabel1: 'للبيع',
    offerLabel2: 'نفد',
    tagline: 'كل ما تحتاجه في مكان واحد',
    bio: 'متجر عصري للمنتجات المنزلية والإلكترونيات الخفيفة بأسعار منافسة.',
    contactPhone: '+966 55 300 4000',
    contactAddress: 'الدمام، مجمع الراشد',
    coverUrl: 'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg?auto=compress&cs=tinysrgb&w=1600',
    listings: [
      {
        title: 'سماعات لاسلكية برو',
        body: 'صوت نقي وعزل ضوضاء مع بطارية طويلة.',
        price: 499,
        location: 'الدمام - الفرع الرئيسي',
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'available',
        category: 'إلكترونيات',
        offer_type: 'sale',
        images: ['https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
      {
        title: 'طاولة قهوة خشبية',
        body: 'تصميم حديث يناسب جميع الديكورات.',
        price: 750,
        location: 'الدمام - الفرع الرئيسي',
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'available',
        category: 'أثاث',
        offer_type: 'sale',
        images: ['https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
      {
        title: 'لابتوب فئة أعمال',
        body: 'أداء قوي مناسب للاستخدام المكتبي.',
        price: 4200,
        location: 'الدمام - الفرع الرئيسي',
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'sold',
        category: 'حواسيب',
        offer_type: 'sale',
        images: ['https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1000'],
      },
    ],
    leads: [
      {
        name: 'يوسف الزهراني',
        email: 'yousef@example.com',
        phone: '+966 55 500 6000',
        message: 'هل تتوفر سماعات لون أسود؟',
        status: 'new',
        source: 'inquiry_form',
      },
      {
        name: 'ليان محمود',
        email: 'layan@example.com',
        phone: '+966 58 111 9090',
        message: 'متى يتوفر اللابتوب مرة أخرى؟',
        status: 'contacted',
        source: 'whatsapp',
      },
    ],
  },
  {
    id: 'demo-services',
    name: 'خدمات بلس',
    slug: 'demo-services',
    email: 'services@demo.com',
    primary_color: '#d97706',
    theme: 'desert',
    business_type: 'services',
    currency: 'SAR',
    offerLabel1: 'متاح',
    offerLabel2: 'محجوز',
    tagline: 'حلول سريعة وموثوقة',
    bio: 'شركة خدمات منزلية وتجارية تشمل الصيانة والنظافة والنقل.',
    contactPhone: '+966 55 400 5000',
    contactAddress: 'مكة، العزيزية',
    coverUrl: 'https://images.pexels.com/photos/942316/pexels-photo-942316.jpeg?auto=compress&cs=tinysrgb&w=1600',
    listings: [
      {
        title: 'خدمة تنظيف شامل',
        body: 'تنظيف منازل ومكاتب بمواد آمنة.',
        price: 220,
        location: 'مكة وجدة',
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'available',
        category: 'تنظيف',
        offer_type: 'sale',
        images: ['https://images.pexels.com/photos/4108711/pexels-photo-4108711.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
      {
        title: 'خدمة صيانة كهربائية',
        body: 'فنيون معتمدون للصيانة المنزلية والتجارية.',
        price: 180,
        location: 'مكة وجدة',
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'available',
        category: 'صيانة',
        offer_type: 'sale',
        images: ['https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
      {
        title: 'فريق نقل أثاث بالساعة',
        body: 'خدمة نقل مع تغليف احترافي.',
        price: 450,
        location: 'مكة وجدة',
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'rented',
        category: 'نقل',
        offer_type: 'rent',
        images: ['https://images.pexels.com/photos/7464707/pexels-photo-7464707.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
    ],
    leads: [
      {
        name: 'فهد القرني',
        email: 'fahad@example.com',
        phone: '+966 54 700 8000',
        message: 'أحتاج صيانة تكييف غداً.',
        status: 'new',
        source: 'inquiry_form',
      },
      {
        name: 'منى الشريف',
        email: 'mona@example.com',
        phone: '+966 50 121 2121',
        message: 'كم سعر تنظيف فيلا كاملة؟',
        status: 'contacted',
        source: 'whatsapp',
      },
    ],
  },
  {
    id: 'demo-fitness',
    name: 'نادي فيت زون',
    slug: 'demo-fitness',
    email: 'fitness@demo.com',
    primary_color: '#8b5cf6',
    theme: 'midnight',
    business_type: 'other',
    currency: 'SAR',
    offerLabel1: 'متاح',
    offerLabel2: 'غير متاح',
    tagline: 'جاهز لنسخة أقوى منك؟',
    bio: 'نادي رياضي حديث يقدم اشتراكات مرنة وبرامج تدريب شخصية.',
    contactPhone: '+966 55 500 6000',
    contactAddress: 'الخبر، حي الحزام',
    coverUrl: 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=1600',
    listings: [
      {
        title: 'اشتراك شهري شامل',
        body: 'دخول مفتوح لجميع المرافق والأجهزة.',
        price: 299,
        location: 'فرع الخبر',
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'available',
        category: 'اشتراك',
        offer_type: 'sale',
        images: ['https://images.pexels.com/photos/703016/pexels-photo-703016.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
      {
        title: 'جلسات تدريب شخصي',
        body: 'برنامج مخصص مع مدرب معتمد.',
        price: 1200,
        location: 'فرع الخبر',
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'available',
        category: 'تدريب',
        offer_type: 'sale',
        images: ['https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
      {
        title: 'قاعة فعاليات اللياقة',
        body: 'تأجير قاعة للورش الرياضية.',
        price: 1600,
        location: 'فرع الخبر',
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'sold',
        category: 'فعاليات',
        offer_type: 'rent',
        images: ['https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
    ],
    leads: [
      {
        name: 'حسين الزيد',
        email: 'hussein@example.com',
        phone: '+966 55 900 1000',
        message: 'أريد اشتراك 6 شهور مع مدرب.',
        status: 'new',
        source: 'inquiry_form',
      },
      {
        name: 'شهد ناصر',
        email: 'shahad@example.com',
        phone: '+966 55 232 2323',
        message: 'هل يوجد اشتراك نسائي صباحي؟',
        status: 'contacted',
        source: 'whatsapp',
      },
    ],
  },
  {
    id: 'demo-clinic',
    name: 'عيادات سما',
    slug: 'demo-clinic',
    email: 'clinic@demo.com',
    primary_color: '#0f766e',
    theme: 'modern',
    business_type: 'services',
    currency: 'SAR',
    offerLabel1: 'متاح',
    offerLabel2: 'محجوز',
    tagline: 'رعاية صحية أقرب لك',
    bio: 'مجمع عيادات يقدم خدمات الطب العام والأسنان والجلدية.',
    contactPhone: '+966 55 610 7100',
    contactAddress: 'المدينة المنورة، حي الملك فهد',
    coverUrl: 'https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg?auto=compress&cs=tinysrgb&w=1600',
    listings: [
      {
        title: 'كشف طبي عام',
        body: 'فحص شامل مع تقرير طبي.',
        price: 180,
        location: 'فرع المدينة',
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'available',
        category: 'طب عام',
        offer_type: 'sale',
        images: ['https://images.pexels.com/photos/8460035/pexels-photo-8460035.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
      {
        title: 'تنظيف أسنان احترافي',
        body: 'جلسة تنظيف وتلميع للأسنان.',
        price: 250,
        location: 'فرع المدينة',
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'available',
        category: 'أسنان',
        offer_type: 'sale',
        images: ['https://images.pexels.com/photos/6627562/pexels-photo-6627562.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
      {
        title: 'عيادة تخصصية يومية',
        body: 'حجز غرفة عيادة للطبيب الزائر.',
        price: 900,
        location: 'فرع المدينة',
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'rented',
        category: 'تخصصي',
        offer_type: 'rent',
        images: ['https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=1000'],
      },
    ],
    leads: [
      {
        name: 'أروى السهلي',
        email: 'arwa@example.com',
        phone: '+966 55 655 8877',
        message: 'أحتاج موعد جلدية هذا الأسبوع.',
        status: 'new',
        source: 'inquiry_form',
      },
      {
        name: 'طارق يحيى',
        email: 'tariq@example.com',
        phone: '+966 54 988 1221',
        message: 'هل يتوفر كشف أسنان للأطفال؟',
        status: 'contacted',
        source: 'whatsapp',
      },
    ],
  },
]

type ExtraDemoBlueprint = Omit<DemoTenant, 'listings' | 'leads'> & {
  city: string
}

const EXTRA_DEMO_BLUEPRINTS: ExtraDemoBlueprint[] = [
  {
    id: 'demo-law',
    name: 'مكتب درع القانون',
    slug: 'demo-law',
    email: 'law@demo.com',
    primary_color: '#7c3aed',
    theme: 'luxury',
    business_type: 'services',
    currency: 'SAR',
    offerLabel1: 'متاح',
    offerLabel2: 'محجوز',
    tagline: 'استشارات قانونية بثقة',
    bio: 'مكتب محاماة يقدم خدمات الاستشارات وصياغة العقود والترافع.',
    contactPhone: '+966 55 710 1100',
    contactAddress: 'الرياض، حي العليا',
    coverUrl: 'https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=1600',
    city: 'الرياض',
  },
  {
    id: 'demo-travel',
    name: 'وكالة مسارات للسفر',
    slug: 'demo-travel',
    email: 'travel@demo.com',
    primary_color: '#0ea5e9',
    theme: 'ocean',
    business_type: 'services',
    currency: 'SAR',
    offerLabel1: 'متاح',
    offerLabel2: 'محجوز',
    tagline: 'رحلات مصممة على ذوقك',
    bio: 'وكالة سفر تنظم الرحلات الدولية والداخلية مع باقات مخصصة.',
    contactPhone: '+966 55 710 1200',
    contactAddress: 'جدة، حي الزهراء',
    coverUrl: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1600',
    city: 'جدة',
  },
  {
    id: 'demo-events',
    name: 'ستوديو لمسة فعالية',
    slug: 'demo-events',
    email: 'events@demo.com',
    primary_color: '#db2777',
    theme: 'midnight',
    business_type: 'services',
    currency: 'SAR',
    offerLabel1: 'متاح',
    offerLabel2: 'محجوز',
    tagline: 'نحوّل مناسبتك إلى تجربة',
    bio: 'تنظيم حفلات ومؤتمرات وتجهيزات متكاملة مع إدارة احترافية.',
    contactPhone: '+966 55 710 1300',
    contactAddress: 'الخبر، كورنيش الخبر',
    coverUrl: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1600',
    city: 'الخبر',
  },
  {
    id: 'demo-auto',
    name: 'أوتو هَب للسيارات',
    slug: 'demo-auto',
    email: 'auto@demo.com',
    primary_color: '#dc2626',
    theme: 'desert',
    business_type: 'retail',
    currency: 'SAR',
    offerLabel1: 'للبيع',
    offerLabel2: 'نفد',
    tagline: 'سيارتك القادمة تبدأ هنا',
    bio: 'معرض سيارات يقدم خيارات جديدة ومستعملة مع خدمات الفحص.',
    contactPhone: '+966 55 710 1400',
    contactAddress: 'الدمام، طريق الملك فهد',
    coverUrl: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1600',
    city: 'الدمام',
  },
  {
    id: 'demo-pharmacy',
    name: 'صيدلية الحياة',
    slug: 'demo-pharmacy',
    email: 'pharmacy@demo.com',
    primary_color: '#16a34a',
    theme: 'nature',
    business_type: 'retail',
    currency: 'SAR',
    offerLabel1: 'متاح',
    offerLabel2: 'نفد',
    tagline: 'صحتك أولويتنا',
    bio: 'صيدلية مجتمعية بخدمة سريعة واستشارات دوائية متخصصة.',
    contactPhone: '+966 55 710 1500',
    contactAddress: 'المدينة المنورة، حي قباء',
    coverUrl: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=1600',
    city: 'المدينة',
  },
  {
    id: 'demo-pets',
    name: 'بيتي كير للحيوانات',
    slug: 'demo-pets',
    email: 'pets@demo.com',
    primary_color: '#f59e0b',
    theme: 'modern',
    business_type: 'services',
    currency: 'SAR',
    offerLabel1: 'متاح',
    offerLabel2: 'محجوز',
    tagline: 'رعاية لطيفة لأصدقائك الأوفياء',
    bio: 'خدمات عيادة ورعاية وتجميل للحيوانات الأليفة.',
    contactPhone: '+966 55 710 1600',
    contactAddress: 'الرياض، حي الياسمين',
    coverUrl: 'https://images.pexels.com/photos/4587997/pexels-photo-4587997.jpeg?auto=compress&cs=tinysrgb&w=1600',
    city: 'الرياض',
  },
  {
    id: 'demo-education',
    name: 'أكاديمية آفاق',
    slug: 'demo-education',
    email: 'education@demo.com',
    primary_color: '#2563eb',
    theme: 'ocean',
    business_type: 'services',
    currency: 'SAR',
    offerLabel1: 'متاح',
    offerLabel2: 'محجوز',
    tagline: 'تعليم عملي لمستقبل أفضل',
    bio: 'أكاديمية تدريب مهني وتقني ببرامج حضورية وعن بعد.',
    contactPhone: '+966 55 710 1700',
    contactAddress: 'جدة، حي الروضة',
    coverUrl: 'https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg?auto=compress&cs=tinysrgb&w=1600',
    city: 'جدة',
  },
  {
    id: 'demo-photography',
    name: 'استوديو فريم',
    slug: 'demo-photography',
    email: 'photo@demo.com',
    primary_color: '#8b5cf6',
    theme: 'midnight',
    business_type: 'services',
    currency: 'SAR',
    offerLabel1: 'متاح',
    offerLabel2: 'محجوز',
    tagline: 'قصصك تستحق صورة أجمل',
    bio: 'استوديو تصوير احترافي للمنتجات والمناسبات والبورتريه.',
    contactPhone: '+966 55 710 1800',
    contactAddress: 'الخبر، حي الراكة',
    coverUrl: 'https://images.pexels.com/photos/3812944/pexels-photo-3812944.jpeg?auto=compress&cs=tinysrgb&w=1600',
    city: 'الخبر',
  },
  {
    id: 'demo-cowork',
    name: 'مساحة وورك ستيشن',
    slug: 'demo-cowork',
    email: 'cowork@demo.com',
    primary_color: '#0f766e',
    theme: 'nature',
    business_type: 'other',
    currency: 'SAR',
    offerLabel1: 'متاح',
    offerLabel2: 'غير متاح',
    tagline: 'اعمل بذكاء في بيئة ملهمة',
    bio: 'مساحات عمل مشتركة ومكاتب خاصة لرواد الأعمال.',
    contactPhone: '+966 55 710 1900',
    contactAddress: 'الرياض، حي الصحافة',
    coverUrl: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1600',
    city: 'الرياض',
  },
  {
    id: 'demo-bakery',
    name: 'مخبز رائحة الدار',
    slug: 'demo-bakery',
    email: 'bakery@demo.com',
    primary_color: '#c2410c',
    theme: 'desert',
    business_type: 'restaurant',
    currency: 'SAR',
    offerLabel1: 'متاح',
    offerLabel2: 'خاص',
    tagline: 'مخبوزات يومية طازجة',
    bio: 'مخبز حرفي يقدم منتجات طازجة وحلويات متنوعة.',
    contactPhone: '+966 55 710 2000',
    contactAddress: 'الطائف، الشفا',
    coverUrl: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=1600',
    city: 'الطائف',
  },
  {
    id: 'demo-electronics',
    name: 'إلكترون برو',
    slug: 'demo-electronics',
    email: 'electronics@demo.com',
    primary_color: '#4f46e5',
    theme: 'modern',
    business_type: 'retail',
    currency: 'SAR',
    offerLabel1: 'للبيع',
    offerLabel2: 'نفد',
    tagline: 'تقنية أحدث بسعر أذكى',
    bio: 'متجر إلكترونيات للأجهزة الذكية وملحقاتها.',
    contactPhone: '+966 55 710 2100',
    contactAddress: 'الدمام، حي الفيصلية',
    coverUrl: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=1600',
    city: 'الدمام',
  },
]

const DEFAULT_EXTRA_IMAGES = [
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1000',
  'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1000',
  'https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg?auto=compress&cs=tinysrgb&w=1000',
]

function buildExtraDemoTenant(blueprint: ExtraDemoBlueprint): DemoTenant {
  const listingBase = blueprint.business_type === 'real_estate' ? 'عقار' : 'خدمة'
  return {
    ...blueprint,
    listings: [
      {
        title: `${listingBase} مميز - ${blueprint.name}`,
        body: `عرض مميز ضمن ${blueprint.name} مع جودة عالية وخدمة احترافية.`,
        price: 390,
        location: blueprint.city,
        bedrooms: blueprint.business_type === 'real_estate' ? 3 : null,
        bathrooms: blueprint.business_type === 'real_estate' ? 2 : null,
        area_sqm: blueprint.business_type === 'real_estate' ? 220 : null,
        listing_status: 'available',
        category: blueprint.business_type,
        offer_type: 'sale',
        images: [DEFAULT_EXTRA_IMAGES[0]],
      },
      {
        title: `باقة احترافية - ${blueprint.name}`,
        body: `باقة متقدمة مخصصة للعملاء الباحثين عن أفضل قيمة.`,
        price: 890,
        location: blueprint.city,
        bedrooms: blueprint.business_type === 'real_estate' ? 4 : null,
        bathrooms: blueprint.business_type === 'real_estate' ? 3 : null,
        area_sqm: blueprint.business_type === 'real_estate' ? 350 : null,
        listing_status: 'available',
        category: blueprint.business_type,
        offer_type: 'sale',
        images: [DEFAULT_EXTRA_IMAGES[1]],
      },
      {
        title: `خيار خاص - ${blueprint.name}`,
        body: `خيار متاح لفترة محدودة مع مرونة في الحجز والتسليم.`,
        price: 1200,
        location: blueprint.city,
        bedrooms: null,
        bathrooms: null,
        area_sqm: null,
        listing_status: 'rented',
        category: blueprint.business_type,
        offer_type: 'rent',
        images: [DEFAULT_EXTRA_IMAGES[2]],
      },
    ],
    leads: [
      {
        name: 'عميل مهتم',
        email: `${blueprint.slug}-lead1@example.com`,
        phone: '+966 50 100 2000',
        message: `مرحباً، أرغب بمعرفة المزيد عن خدمات ${blueprint.name}.`,
        status: 'new',
        source: 'inquiry_form',
      },
      {
        name: 'عميل متابع',
        email: `${blueprint.slug}-lead2@example.com`,
        phone: '+966 55 300 4000',
        message: `هل يمكن إرسال الأسعار التفصيلية؟`,
        status: 'contacted',
        source: 'whatsapp',
      },
    ],
  }
}

const ALL_DEMO_TENANTS: DemoTenant[] = [
  ...DEMO_TENANTS,
  ...EXTRA_DEMO_BLUEPRINTS.map(buildExtraDemoTenant),
]

const WORKING_HOURS = {
  sun: { enabled: true, open: '09:00', close: '17:00' },
  mon: { enabled: true, open: '09:00', close: '17:00' },
  tue: { enabled: true, open: '09:00', close: '17:00' },
  wed: { enabled: true, open: '09:00', close: '17:00' },
  thu: { enabled: true, open: '09:00', close: '17:00' },
  fri: { enabled: false, open: '09:00', close: '17:00' },
  sat: { enabled: false, open: '09:00', close: '17:00' },
}

async function clearTenantData(tenantId: string) {
  const deleteByTenant = async (collection: string) => {
    const snap = await db.collection(collection).where('tenantId', '==', tenantId).get()
    if (snap.empty) return
    const batch = db.batch()
    snap.docs.forEach((doc) => batch.delete(doc.ref))
    await batch.commit()
  }

  await Promise.all([
    deleteByTenant('posts'),
    deleteByTenant('leads'),
    deleteByTenant('media'),
    deleteByTenant('users'),
  ])
}

async function seedTenant(tenant: DemoTenant) {
  await clearTenantData(tenant.id)

  await db.collection('tenants').doc(tenant.id).set({
    name: tenant.name,
    slug: tenant.slug,
    primary_color: tenant.primary_color,
    theme: tenant.theme,
    business_type: tenant.business_type,
    email: tenant.email,
    plan: 'pro',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  })

  await db
    .collection('tenants')
    .doc(tenant.id)
    .collection('profiles')
    .doc(tenant.id)
    .set({
      tenant_id: tenant.id,
      bio: tenant.bio,
      tagline: tenant.tagline,
      licence_numbers: [{ label: 'رقم الترخيص', number: `LIC-${tenant.id.toUpperCase()}` }],
      contact_email: tenant.email,
      contact_phone: tenant.contactPhone,
      extra_phones: [],
      contact_address: tenant.contactAddress,
      logo_url: '',
      cover_url: tenant.coverUrl,
      social_links: {
        whatsapp: tenant.contactPhone.replace(/\D/g, ''),
        instagram: tenant.slug,
        x: tenant.slug,
        linkedin: '',
        snapchat: '',
        tiktok: '',
        telegram: tenant.slug,
        discord: '',
      },
      working_hours: WORKING_HOURS,
      page_sections: {
        hero: true,
        listings: true,
        about: true,
        news: false,
        contact: true,
        working_hours: true,
        footer: true,
      },
      page_config: {
        hero_headline: tenant.tagline,
        listings_columns: 3,
        show_listing_filters: true,
        show_listing_search: true,
        filter_label_all: 'الكل',
        filter_label_all_types: 'كل الأنواع',
        filter_label_all_status: 'كل الحالات',
        hero_style: 'centered',
        hero_cta_text: 'تواصل عبر واتساب',
        button_shape: 'soft',
        seo_title: tenant.name,
        seo_description: tenant.bio,
        announcement_text: '',
        announcement_color: 'accent',
        currency: tenant.currency,
        offer_label_1: tenant.offerLabel1,
        offer_label_2: tenant.offerLabel2,
        page_lang: 'ar',
      },
      updatedAt: now,
    })

  const postBatch = db.batch()
  tenant.listings.forEach((listing, index) => {
    postBatch.set(db.collection('posts').doc(`${tenant.id}-listing-${index + 1}`), {
      title: listing.title,
      body: listing.body,
      price: listing.price,
      location: listing.location,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      area_sqm: listing.area_sqm,
      listing_status: listing.listing_status,
      category: listing.category,
      offer_type: listing.offer_type,
      type: 'listing',
      published: true,
      images: listing.images,
      tenantId: tenant.id,
      createdAt: now,
      publishedAt: now,
    })
  })
  await postBatch.commit()

  const leadBatch = db.batch()
  tenant.leads.forEach((lead, index) => {
    leadBatch.set(db.collection('leads').doc(`${tenant.id}-lead-${index + 1}`), {
      tenantId: tenant.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      message: lead.message,
      status: lead.status,
      source: lead.source,
      createdAt: now,
    })
  })
  await leadBatch.commit()

  await db.collection('users').doc(`seed-admin-${tenant.id}`).set({
    tenantId: tenant.id,
    email: tenant.email,
    role: 'admin',
    createdAt: now,
  })
}

async function seed() {
  console.log('🌱 Seeding Firestore...')

  for (const tenant of ALL_DEMO_TENANTS) {
    await seedTenant(tenant)
    console.log(`✅ Seeded: /${tenant.slug} (${tenant.theme}, ${tenant.business_type})`)
  }

  // ── Admin user ───────────────────────────────────────────
  await db.collection('admin_users').doc('super_admin').set({
    email: process.env.ADMIN_EMAIL!,
    role: 'super_admin',
    createdAt: now,
  })
  console.log('✅ Admin user record created')

  console.log('\n🎉 Seeding complete! Demo URLs:')
  ALL_DEMO_TENANTS.forEach((tenant) => {
    console.log(`   - /${tenant.slug}`)
  })
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
