export type Locale = 'en' | 'ar'

export const LOCALES: Locale[] = ['en', 'ar']

const STORAGE_KEY = 'mom-locale'

export function getStoredLocale(): Locale {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'en' || value === 'ar') return value
  } catch {
    /* ignore */
  }
  return 'en'
}

export function storeLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    /* ignore */
  }
}

export function applyDocumentLocale(locale: Locale) {
  document.documentElement.lang = locale
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  document.title =
    locale === 'ar'
      ? 'محضر الاجتماع | وزارة الصحة'
      : 'Minutes of Meeting | Ministry of Health'
}

type Dict = Record<string, string>

const en: Dict = {
  brandTitle: 'Minutes of Meeting',
  brandSubtitle: 'محضر الاجتماع',
  langEn: 'EN',
  langAr: 'AR',
  logoAlt: 'Ministry of Health',

  editBanner:
    'Editing saved minutes. Change the fields below, then press Update or Cancel.',
  editingStatus: 'Editing — make changes, then Update or Cancel',
  updateCancelled: 'Update cancelled',
  saved: 'Saved',
  updated: 'Updated',

  meeting: 'Meeting',
  meetingTitle: 'Meeting Title *',
  meetingLocation: 'Meeting Location *',
  meetingDate: 'Meeting Date *',
  titlePlaceholder: 'Enter meeting title',
  locationPlaceholder: 'Enter location',

  attendance: 'Attendance *',
  addRow: '+ Add row',
  name: 'Name',
  designation: 'Designation',
  namePlaceholder: 'Full name',
  designationPlaceholder: 'Job title',
  remove: 'Remove',

  discussion: 'Discussion and Summary *',
  discussionPlaceholder: 'Enter discussion points and summary',

  decisions: 'Recommendations and Decisions *',
  addItem: '+ Add item',
  decisionPlaceholder: 'Recommendation or decision',

  preparedBy: 'Prepared by *',
  preparedByPlaceholder: 'Name',

  cancel: 'Cancel',
  update: 'Update',
  updating: 'Updating...',
  new: 'New',
  save: 'Save',
  saving: 'Saving...',

  savedMinutes: 'Saved minutes',
  refresh: 'Refresh',
  loading: 'Loading...',
  emptyList: 'No saved minutes yet.',
  colTitle: 'Title',
  colDate: 'Date',
  colLocation: 'Location',
  colPreparedBy: 'Prepared by',
  colActions: 'Actions',
  pdf: 'PDF',
  word: 'Word',

  errTitle: 'Meeting Title is required',
  errLocation: 'Meeting Location is required',
  errDate: 'Meeting Date is required',
  errDatePast: 'Meeting date cannot be in the past',
  errDiscussion: 'Discussion and Summary is required',
  errPreparedBy: 'Prepared by is required',
  errAttendees: 'Please fill Name and Designation for every attendance row',
  errDecisions: 'Please fill every Recommendation / Decision',
  errLoad: 'Failed to load minutes. Is Spring Boot running on port 8080?',
  errRequest: 'Request failed. Is Spring Boot running on port 8080?',
  errSaveFailed: 'Save failed',
  errUpdateFailed: 'Update failed',
}

const ar: Dict = {
  brandTitle: 'محضر الاجتماع',
  brandSubtitle: 'Minutes of Meeting',
  langEn: 'EN',
  langAr: 'AR',
  logoAlt: 'وزارة الصحة',

  editBanner:
    'جارٍ تعديل المحضر المحفوظ. غيّر الحقول أدناه ثم اضغط تحديث أو إلغاء.',
  editingStatus: 'جارٍ التعديل — أجرِ التغييرات ثم اضغط تحديث أو إلغاء',
  updateCancelled: 'تم إلغاء التحديث',
  saved: 'تم الحفظ',
  updated: 'تم التحديث',

  meeting: 'الاجتماع',
  meetingTitle: 'عنوان الاجتماع *',
  meetingLocation: 'مكان الاجتماع *',
  meetingDate: 'تاريخ الاجتماع *',
  titlePlaceholder: 'أدخل عنوان الاجتماع',
  locationPlaceholder: 'أدخل المكان',

  attendance: 'الحضور *',
  addRow: '+ إضافة صف',
  name: 'الاسم',
  designation: 'المسمى الوظيفي',
  namePlaceholder: 'الاسم الكامل',
  designationPlaceholder: 'المسمى الوظيفي',
  remove: 'حذف',

  discussion: 'المناقشة والملخص *',
  discussionPlaceholder: 'أدخل نقاط المناقشة والملخص',

  decisions: 'التوصيات والقرارات *',
  addItem: '+ إضافة بند',
  decisionPlaceholder: 'توصية أو قرار',

  preparedBy: 'تم إعداده بواسطة *',
  preparedByPlaceholder: 'الاسم',

  cancel: 'إلغاء',
  update: 'تحديث',
  updating: 'جارٍ التحديث...',
  new: 'جديد',
  save: 'حفظ',
  saving: 'جارٍ الحفظ...',

  savedMinutes: 'المحاضر المحفوظة',
  refresh: 'تحديث',
  loading: 'جارٍ التحميل...',
  emptyList: 'لا توجد محاضر محفوظة بعد.',
  colTitle: 'العنوان',
  colDate: 'التاريخ',
  colLocation: 'المكان',
  colPreparedBy: 'تم إعداده بواسطة',
  colActions: 'الإجراءات',
  pdf: 'PDF',
  word: 'Word',

  errTitle: 'عنوان الاجتماع مطلوب',
  errLocation: 'مكان الاجتماع مطلوب',
  errDate: 'تاريخ الاجتماع مطلوب',
  errDatePast: 'لا يمكن أن يكون تاريخ الاجتماع في الماضي',
  errDiscussion: 'المناقشة والملخص مطلوبان',
  errPreparedBy: 'حقل تم إعداده بواسطة مطلوب',
  errAttendees: 'يرجى تعبئة الاسم والمسمى الوظيفي لكل صف حضور',
  errDecisions: 'يرجى تعبئة كل توصية / قرار',
  errLoad: 'فشل تحميل المحاضر. هل يعمل Spring Boot على المنفذ 8080؟',
  errRequest: 'فشل الطلب. هل يعمل Spring Boot على المنفذ 8080؟',
  errSaveFailed: 'فشل الحفظ',
  errUpdateFailed: 'فشل التحديث',
}

const dictionaries: Record<Locale, Dict> = { en, ar }

export function t(locale: Locale, key: keyof typeof en): string {
  return dictionaries[locale][key] ?? dictionaries.en[key] ?? key
}

/** Shared bilingual slogans for PDF / Word footers */
export const ARABIC_SLOGAN = 'رقمنة الصحة والإبتكار لعناية راقية وصحة مستدامة'
export const ARABIC_TRANSFORM = 'التحول الرقمي الصحي من أجل خدمات ذكية متكاملة'
export const ENGLISH_SLOGAN =
  'Digitalized Health and Innovation Quality Care and sustainable'
export const ENGLISH_TRANSFORM =
  'Digital Health Transformation for Integrated Smart Services'

export type DocumentSlogan = {
  text: string
  arabic: boolean
}

/** Labels used inside PDF / Word documents */
export type ExportLabels = {
  meeting: string
  meetingTitle: string
  meetingLocation: string
  meetingDate: string
  attendance: string
  name: string
  designation: string
  discussion: string
  decisions: string
  preparedBy: string
  fileFallback: string
  fileDateFallback: string
}

export function exportLabels(locale: Locale): ExportLabels {
  if (locale === 'ar') {
    return {
      meeting: 'الاجتماع',
      meetingTitle: 'عنوان الاجتماع',
      meetingLocation: 'مكان الاجتماع',
      meetingDate: 'تاريخ الاجتماع',
      attendance: 'الحضور',
      name: 'الاسم',
      designation: 'المسمى الوظيفي',
      discussion: 'المناقشة والملخص',
      decisions: 'التوصيات والقرارات',
      preparedBy: 'تم إعداده بواسطة',
      fileFallback: 'محضر-الاجتماع',
      fileDateFallback: 'اجتماع',
    }
  }
  return {
    meeting: 'Meeting',
    meetingTitle: 'Meeting Title',
    meetingLocation: 'Meeting Location',
    meetingDate: 'Meeting Date',
    attendance: 'Attendance',
    name: 'Name',
    designation: 'Designation',
    discussion: 'Discussion and Summary',
    decisions: 'Recommendations and Decisions',
    preparedBy: 'Prepared by',
    fileFallback: 'minutes',
    fileDateFallback: 'meeting',
  }
}

/** Footer slogans ordered by active locale */
export function documentSlogans(locale: Locale): DocumentSlogan[] {
  if (locale === 'ar') {
    return [
      { text: ARABIC_SLOGAN, arabic: true },
      { text: ARABIC_TRANSFORM, arabic: true },
      { text: ENGLISH_SLOGAN, arabic: false },
      { text: ENGLISH_TRANSFORM, arabic: false },
    ]
  }
  return [
    { text: ARABIC_SLOGAN, arabic: true },
    { text: ENGLISH_SLOGAN, arabic: false },
    { text: ARABIC_TRANSFORM, arabic: true },
    { text: ENGLISH_TRANSFORM, arabic: false },
  ]
}
