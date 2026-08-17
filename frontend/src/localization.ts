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

  preparedBy: 'Prepared by',
  preparedByPlaceholder: 'Name',
  preparedByAutoHint: 'Filled automatically from your account.',
  approvedBy: 'Approved by',
  approvedByPlaceholder: 'Enter name',
  approvedByHint: 'Name of the person who approves this minute.',

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
  errDateFuture: 'Meeting date cannot be in the future',
  errDiscussion: 'Discussion and Summary is required',
  errPreparedBy: 'Prepared by is required',
  errApprovedBy: 'Approved by is required',
  errAttendees: 'Please fill Name and Designation for every attendance row',
  errDecisions: 'Please fill every Recommendation / Decision',
  errLoad: 'Failed to load minutes. Is Spring Boot running on port 8080?',
  errRequest: 'Request failed. Is Spring Boot running on port 8080?',
  errSaveFailed: 'Save failed',
  errUpdateFailed: 'Update failed',

  login: 'Login',
  logout: 'Logout',
  loginTitle: 'Sign in',
  loginSubtitle: 'Access your meeting minutes',
  loggingIn: 'Signing in...',
  registerTitle: 'Create account',
  registerSubtitle: 'New accounts are created as normal users',
  createAccount: 'Create account',
  creatingAccount: 'Creating...',
  noAccount: 'No account?',
  haveAccount: 'Already have an account?',
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm password',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  errPasswordMismatch: 'Passwords do not match',
  errNameLettersOnly: 'Full name must contain letters only (no numbers)',
  fullName: 'Full name',
  roleUser: 'User',
  roleAdmin: 'Admin',
  delete: 'Delete',
  deleted: 'Deleted',
  confirmDelete: 'Delete this meeting minutes record?',

  adminPanel: 'Admin panel',
  navDashboard: 'Dashboard',
  navManageUsers: 'Manage users',
  navUsers: 'Users',
  navCreateUser: 'Create user',
  navManageMeetings: 'Manage meetings',
  navMinutesOfMeeting: 'Minutes of Meeting',
  navCreateMinute: 'Create new minutes of meeting',
  navListMinutes: 'Listing minutes of meeting',
  navPresentationFormat: 'PPT format',
  navMeetingReport: 'Meeting report (Word)',
  navDocumentFormat: 'PDF / Word format',
  userPanel: 'Home',
  userHome: 'Home',
  userHomeSub: 'Choose an option below or use the sidebar.',
  createMinuteTitle: 'Create minutes of meeting',
  createMinuteSub: 'Fill in the meeting details and save.',
  createMinuteBoxSub: 'Start a new meeting minutes record.',
  listMinutesTitle: 'Listing minutes of meeting',
  listMinutesSub: 'View, update, export, or delete your saved minutes.',
  listMinutesBoxSub: 'Browse and manage your saved meeting minutes.',
  pptFormatBoxSub: 'Convert title and name into the approved PowerPoint template.',
  updateMeeting: 'Update minutes of meeting',
  quickLinks: 'Quick links',
  manageUsersSub:
    'Manage accounts and create new users. Promote, demote, enable, or disable accounts.',
  createUserSub: 'Create a user or admin — they set their own password on first login',
  createUserPasswordHint: 'User sets password on first login.',
  userCreatedNoPassword: 'User created. They must set a password on first login.',
  setupPasswordTitle: 'Set your password',
  setupPasswordSubtitle: 'Your account was created by an admin. Choose a password to continue.',
  setupPasswordHint: 'After saving, you will be signed in automatically.',
  newPassword: 'New password',
  savePassword: 'Save password',
  savingPassword: 'Saving...',
  statusPendingPassword: 'Pending password',
  manageMeetingsSub:
    'View minutes created by you or by users. Update or delete your own minutes, and export any record.',
  documentFormatSub: 'Change logos, colors, and layout used for PDF and Word exports',
  pptFormatSub:
    'Fill the approved visual presentation template with your title and name, or download the blank default. New content pages keep the same formal design.',
  pptConvertSection: 'Convert presentation',
  pptConvertHint:
    'Enter the presentation title and presenter name, then convert to download a filled PowerPoint. Add new pages from a content slide (محتوى) to keep the design.',
  pptTitle: 'Presentation title',
  pptTitlePlaceholder: 'Enter presentation title',
  pptName: 'Name',
  pptNamePlaceholder: 'Enter name',
  pptConvert: 'Convert',
  pptConverting: 'Converting...',
  pptDownloadDefault: 'Download the default format',
  pptConverted: 'Presentation downloaded',
  pptDefaultDownloaded: 'Default PowerPoint template downloaded',
  pptErrTitle: 'Presentation title is required',
  pptErrName: 'Name is required',
  reportFormatSub:
    'Create a Word file from the approved template using title and discussion, or download the blank default.',
  reportConvertSection: 'Write meeting report',
  reportConvertHint:
    'Enter the title and discussion, then convert. The formal template design stays the same as the default file.',
  reportTitle: 'Title / Topic',
  reportTitlePlaceholder: 'Enter title',
  reportDiscussion: 'Discussion',
  reportDiscussionPlaceholder: 'Enter discussion text',
  reportConvert: 'Convert to Word',
  reportConverting: 'Converting...',
  reportDownloadDefault: 'Download the default format',
  reportConverted: 'Meeting report Word file downloaded',
  reportDefaultDownloaded: 'Default meeting report template downloaded',
  reportFormatBoxSub: 'Write a Word report from the approved template (title + discussion).',
  logoSection: 'Logos',
  logoSectionHint:
    'Replace the default logos, turn slots on/off, or add an extra logo in the middle.',
  formatSection: 'Format',
  leftLogo: 'Left logo',
  rightLogo: 'Right logo',
  extraLogo: 'Extra logo (middle)',
  logoEnabled: 'Show',
  logoEmpty: 'No logo',
  uploadLogo: 'Upload logo',
  changeLogo: 'Change logo',
  useDefaultLogo: 'Use default',
  removeLogo: 'Remove',
  logoUpdated: 'Logo updated',
  logoSize: 'Logo size',
  sizeSmall: 'Small',
  sizeMedium: 'Medium',
  sizeLarge: 'Large',
  showDivider: 'Show divider between logos',
  filterPerson: 'Person',
  filterPersonPlaceholder: 'Name or email',
  userCreated: 'User created',
  headerColor: 'Header color',
  accentColor: 'Slogan / accent color',
  fontSize: 'PDF font size',
  showLogos: 'Show logos in export',
  showSlogans: 'Show slogans in export',
  sloganSection: 'Edit slogans',
  sloganSectionHint:
    'Defaults are filled in. Each slogan shows in both Arabic and English on every PDF/Word export.',
  sloganArabic: 'Arabic',
  sloganEnglish: 'English',
  sloganItem: 'Slogan',
  addSlogan: 'Add slogan',
  removeSlogan: 'Remove',
  saveFormat: 'Save format',
  resetFormat: 'Reset defaults',
  previewPdf: 'Preview PDF',
  previewWord: 'Preview Word',
  previewPdfEn: 'Preview PDF (EN)',
  previewPdfAr: 'Preview PDF (AR)',
  previewWordEn: 'Preview Word (EN)',
  previewWordAr: 'Preview Word (AR)',
  formatSaved: 'Document format saved',
  formatReset: 'Document format reset',
  formatResetDraft:
    'Defaults restored in the form. Press Save format to apply them.',
  formatSaveHint:
    'Changes are not saved until you press Save format. Preview uses the current form only.',
  adminDashboard: 'Dashboard',
  adminDashboardSub: 'Overview of meetings and users',
  adminStats: 'Overview',
  statTotalMinutes: 'Total meetings',
  statTotalUsers: 'Total users',
  statMeetingsMonth: 'Meetings this month',
  adminUsers: 'Users',
  adminMinutes: 'All minutes',
  emptyUsers: 'No users yet.',
  colName: 'Name',
  colRole: 'Role',
  colCreated: 'Created',
  colStatus: 'Status',
  colCreatedBy: 'Created by',
  statusActive: 'Active',
  statusDisabled: 'Disabled',
  promote: 'Promote to admin',
  demote: 'Demote to user',
  disable: 'Disable',
  enable: 'Enable',
  userPromoted: 'User promoted to admin',
  userDemoted: 'User demoted to user',
  userDisabled: 'User disabled',
  userEnabled: 'User enabled',
  filterTitle: 'Title',
  filterCreator: 'Show',
  filterCreatorAll: 'All meetings',
  filterCreatorMine: 'Created by me',
  filterCreatorUsers: 'Created by users',
  createdByYou: 'You',
  filterUser: 'User',
  filterUserPlaceholder: 'Name or email',
  filterDateFrom: 'From date',
  filterDateTo: 'To date',
  filterRole: 'Role',
  filterRoleAll: 'All roles',
  filterStatus: 'Status',
  filterStatusAll: 'All statuses',
  search: 'Search',
  clear: 'Clear',
  filterLanguage: 'Language',
  filterLanguageAll: 'All languages',
  langEnglish: 'English',
  langArabic: 'Arabic',
  docLanguage: 'Document language *',
  docLanguageHint: 'Form and PDF/Word will use this language only.',
  docLanguageLocked: 'Language is fixed after the minutes are created.',
  prevPage: 'Previous',
  nextPage: 'Next',
  pageOf: 'Page {page} of {pages}',
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
  name: 'الإسم',
  designation: 'المسمى الوظيفي',
  namePlaceholder: 'الاسم الكامل',
  designationPlaceholder: 'المسمى الوظيفي',
  remove: 'حذف',

  discussion: 'جدول وملحض الاجتماع *',
  discussionPlaceholder: 'أدخل نقاط المناقشة والملخص',

  decisions: 'التوصيات والمخرجات المتفق عليها *',
  addItem: '+ إضافة بند',
  decisionPlaceholder: 'توصية أو مخرج',

  preparedBy: 'أعده',
  preparedByPlaceholder: 'الاسم',
  preparedByAutoHint: 'يُملأ تلقائياً من حسابك.',
  approvedBy: 'وافق عليه',
  approvedByPlaceholder: 'أدخل الاسم',
  approvedByHint: 'اسم الشخص الذي يوافق على هذا المحضر.',

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
  colPreparedBy: 'أعده',
  colActions: 'الإجراءات',
  pdf: 'PDF',
  word: 'Word',

  errTitle: 'عنوان الاجتماع مطلوب',
  errLocation: 'مكان الاجتماع مطلوب',
  errDate: 'تاريخ الاجتماع مطلوب',
  errDateFuture: 'لا يمكن أن يكون تاريخ الاجتماع في المستقبل',
  errDiscussion: 'المناقشة والملخص مطلوبان',
  errPreparedBy: 'حقل أعده مطلوب',
  errApprovedBy: 'حقل وافق عليه مطلوب',
  errAttendees: 'يرجى تعبئة الاسم والمسمى الوظيفي لكل صف حضور',
  errDecisions: 'يرجى تعبئة كل توصية / قرار',
  errLoad: 'فشل تحميل المحاضر. هل يعمل Spring Boot على المنفذ 8080؟',
  errRequest: 'فشل الطلب. هل يعمل Spring Boot على المنفذ 8080؟',
  errSaveFailed: 'فشل الحفظ',
  errUpdateFailed: 'فشل التحديث',

  login: 'تسجيل الدخول',
  logout: 'تسجيل الخروج',
  loginTitle: 'تسجيل الدخول',
  loginSubtitle: 'الوصول إلى محاضر الاجتماعات',
  loggingIn: 'جارٍ تسجيل الدخول...',
  registerTitle: 'إنشاء حساب',
  registerSubtitle: 'الحسابات الجديدة تُنشأ كمستخدم عادي',
  createAccount: 'إنشاء حساب',
  creatingAccount: 'جارٍ الإنشاء...',
  noAccount: 'ليس لديك حساب؟',
  haveAccount: 'لديك حساب بالفعل؟',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  confirmPassword: 'تأكيد كلمة المرور',
  showPassword: 'إظهار كلمة المرور',
  hidePassword: 'إخفاء كلمة المرور',
  errPasswordMismatch: 'كلمتا المرور غير متطابقتين',
  errNameLettersOnly: 'الاسم الكامل يجب أن يحتوي على أحرف فقط (بدون أرقام)',
  fullName: 'الاسم الكامل',
  roleUser: 'مستخدم',
  roleAdmin: 'مسؤل',
  delete: 'حذف',
  deleted: 'تم الحذف',
  confirmDelete: 'هل تريد حذف محضر الاجتماع هذا؟',

  adminPanel: 'لوحة المسؤل',
  navDashboard: 'لوحة التحكم',
  navManageUsers: 'إدارة المستخدمين',
  navUsers: 'المستخدمون',
  navCreateUser: 'إنشاء مستخدم',
  navManageMeetings: 'إدارة الاجتماعات',
  navMinutesOfMeeting: 'محضر الاجتماع',
  navCreateMinute: 'إنشاء محضر اجتماع جديد',
  navListMinutes: 'قائمة محاضر الاجتماع',
  navPresentationFormat: 'تنسيق PPT',
  navMeetingReport: 'محضر اجتماع (Word)',
  navDocumentFormat: 'تنسيق PDF / Word',
  userPanel: 'الرئيسية',
  userHome: 'الرئيسية',
  userHomeSub: 'اختر أحد الخيارات أدناه أو استخدم القائمة الجانبية.',
  createMinuteTitle: 'إنشاء محضر اجتماع',
  createMinuteSub: 'أدخل تفاصيل الاجتماع ثم احفظ.',
  createMinuteBoxSub: 'ابدأ محضر اجتماع جديد.',
  listMinutesTitle: 'قائمة محاضر الاجتماع',
  listMinutesSub: 'عرض وتحديث وتصدير أو حذف المحاضر المحفوظة.',
  listMinutesBoxSub: 'تصفح وأدر محاضر الاجتماع المحفوظة.',
  pptFormatBoxSub: 'حوّل العنوان والاسم إلى النموذج المعتمد لـ PowerPoint.',
  updateMeeting: 'تحديث محضر الاجتماع',
  quickLinks: 'روابط سريعة',
  manageUsersSub:
    'إدارة الحسابات وإنشاء مستخدمين جدد. ترقية أو تخفيض أو تفعيل أو تعطيل الحسابات.',
  createUserSub: 'إنشاء مستخدم أو مسؤل — يضع كلمة المرور عند أول تسجيل دخول',
  createUserPasswordHint: 'يعيّن المستخدم كلمة المرور عند أول دخول.',
  userCreatedNoPassword: 'تم إنشاء المستخدم. يجب أن يضع كلمة المرور عند أول تسجيل دخول.',
  setupPasswordTitle: 'تعيين كلمة المرور',
  setupPasswordSubtitle: 'أنشأ المسؤل حسابك. اختر كلمة مرور للمتابعة.',
  setupPasswordHint: 'بعد الحفظ سيتم تسجيل دخولك تلقائياً.',
  newPassword: 'كلمة المرور الجديدة',
  savePassword: 'حفظ كلمة المرور',
  savingPassword: 'جارٍ الحفظ...',
  statusPendingPassword: 'بانتظار كلمة المرور',
  manageMeetingsSub:
    'اعرض المحاضر التي أنشأتها أنت أو التي أنشأها المستخدمون. حدّث أو احذف محاضرك، وصدّر أي سجل.',
  documentFormatSub: 'تغيير الشعارات والألوان وتنسيق تصدير PDF و Word',
  pptFormatSub:
    'عبّئ النموذج المعتمد للعرض المرئي بالعنوان والاسم، أو حمّل النسخة الافتراضية. الصفحات الجديدة للمحتوى تحتفظ بنفس التصميم الرسمي.',
  pptConvertSection: 'تحويل العرض',
  pptConvertHint:
    'أدخل عنوان العرض واسم المقدّم ثم اضغط تحويل. لإضافة صفحة بنفس التصميم، أضفها من شريحة المحتوى (محتوى).',
  pptTitle: 'عنوان العرض',
  pptTitlePlaceholder: 'أدخل عنوان العرض',
  pptName: 'الاسم',
  pptNamePlaceholder: 'أدخل الاسم',
  pptConvert: 'تحويل',
  pptConverting: 'جاري التحويل...',
  pptDownloadDefault: 'تحميل النموذج الافتراضي',
  pptConverted: 'تم تنزيل العرض',
  pptDefaultDownloaded: 'تم تنزيل النموذج الافتراضي لـ PowerPoint',
  pptErrTitle: 'عنوان العرض مطلوب',
  pptErrName: 'الاسم مطلوب',
  reportFormatSub:
    'أنشئ ملف Word من النموذج المعتمد بالعنوان والنقاش، أو حمّل النسخة الافتراضية.',
  reportConvertSection: 'كتابة محضر الاجتماع',
  reportConvertHint:
    'أدخل العنوان والنقاش ثم حوّل. يبقى تصميم النموذج الرسمي كما في الملف الافتراضي.',
  reportTitle: 'الموضوع',
  reportTitlePlaceholder: 'أدخل العنوان',
  reportDiscussion: 'النقاش',
  reportDiscussionPlaceholder: 'أدخل نص النقاش',
  reportConvert: 'تحويل إلى Word',
  reportConverting: 'جاري التحويل...',
  reportDownloadDefault: 'تحميل النموذج الافتراضي',
  reportConverted: 'تم تنزيل محضر الاجتماع Word',
  reportDefaultDownloaded: 'تم تنزيل النموذج الافتراضي',
  reportFormatBoxSub: 'اكتب تقرير Word من النموذج المعتمد (عنوان + نقاش).',
  logoSection: 'الشعارات',
  logoSectionHint:
    'استبدل الشعارات الافتراضية، أو فعّل/عطّل الخانات، أو أضف شعاراً إضافياً في الوسط.',
  formatSection: 'التنسيق',
  leftLogo: 'الشعار الأيسر',
  rightLogo: 'الشعار الأيمن',
  extraLogo: 'شعار إضافي (الوسط)',
  logoEnabled: 'إظهار',
  logoEmpty: 'لا يوجد شعار',
  uploadLogo: 'رفع شعار',
  changeLogo: 'تغيير الشعار',
  useDefaultLogo: 'الافتراضي',
  removeLogo: 'إزالة',
  logoUpdated: 'تم تحديث الشعار',
  logoSize: 'حجم الشعار',
  sizeSmall: 'صغير',
  sizeMedium: 'متوسط',
  sizeLarge: 'كبير',
  showDivider: 'إظهار فاصل بين الشعارات',
  filterPerson: 'الشخص',
  filterPersonPlaceholder: 'الاسم أو البريد',
  userCreated: 'تم إنشاء المستخدم',
  headerColor: 'لون العنوان',
  accentColor: 'لون الشعار / التمييز',
  fontSize: 'حجم خط PDF',
  showLogos: 'إظهار الشعارات في التصدير',
  showSlogans: 'إظهار الشعارات النصية في التصدير',
  sloganSection: 'تعديل الشعارات',
  sloganSectionHint:
    'القيم الافتراضية معبأة مسبقاً. كل شعار يظهر بالعربية والإنجليزية في كل تصدير PDF و Word.',
  sloganArabic: 'عربي',
  sloganEnglish: 'إنجليزي',
  sloganItem: 'شعار',
  addSlogan: 'إضافة شعار',
  removeSlogan: 'إزالة',
  saveFormat: 'حفظ التنسيق',
  resetFormat: 'إعادة الافتراضي',
  previewPdf: 'معاينة PDF',
  previewWord: 'معاينة Word',
  previewPdfEn: 'معاينة PDF (إنجليزي)',
  previewPdfAr: 'معاينة PDF (عربي)',
  previewWordEn: 'معاينة Word (إنجليزي)',
  previewWordAr: 'معاينة Word (عربي)',
  formatSaved: 'تم حفظ تنسيق المستند',
  formatReset: 'تمت إعادة تنسيق المستند',
  formatResetDraft:
    'تمت استعادة الافتراضي في النموذج. اضغط حفظ التنسيق لتطبيقه.',
  formatSaveHint:
    'لن تُحفظ التغييرات إلا بعد الضغط على حفظ التنسيق. المعاينة تستخدم النموذج الحالي فقط.',
  adminDashboard: 'لوحة التحكم',
  adminDashboardSub: 'نظرة عامة على الاجتماعات والمستخدمين',
  adminStats: 'نظرة عامة',
  statTotalMinutes: 'إجمالي الاجتماعات',
  statTotalUsers: 'إجمالي المستخدمين',
  statMeetingsMonth: 'اجتماعات هذا الشهر',
  adminUsers: 'المستخدمون',
  adminMinutes: 'كل المحاضر',
  emptyUsers: 'لا يوجد مستخدمون بعد.',
  colName: 'الاسم',
  colRole: 'الدور',
  colCreated: 'تاريخ الإنشاء',
  colStatus: 'الحالة',
  colCreatedBy: 'أنشئ بواسطة',
  statusActive: 'نشط',
  statusDisabled: 'معطّل',
  promote: 'ترقية إلى مسؤل',
  demote: 'تخفيض إلى مستخدم',
  disable: 'تعطيل',
  enable: 'تفعيل',
  userPromoted: 'تمت ترقية المستخدم إلى مسؤل',
  userDemoted: 'تم تخفيض المستخدم إلى مستخدم',
  userDisabled: 'تم تعطيل المستخدم',
  userEnabled: 'تم تفعيل المستخدم',
  filterTitle: 'العنوان',
  filterCreator: 'عرض',
  filterCreatorAll: 'كل الاجتماعات',
  filterCreatorMine: 'أنشأتها أنا',
  filterCreatorUsers: 'أنشأها المستخدمون',
  createdByYou: 'أنت',
  filterUser: 'المستخدم',
  filterUserPlaceholder: 'الاسم أو البريد',
  filterDateFrom: 'من تاريخ',
  filterDateTo: 'إلى تاريخ',
  filterRole: 'الدور',
  filterRoleAll: 'كل الأدوار',
  filterStatus: 'الحالة',
  filterStatusAll: 'كل الحالات',
  search: 'بحث',
  clear: 'مسح',
  filterLanguage: 'اللغة',
  filterLanguageAll: 'كل اللغات',
  langEnglish: 'الإنجليزية',
  langArabic: 'العربية',
  docLanguage: 'لغة المحضر *',
  docLanguageHint: 'النموذج وملفات PDF/Word ستستخدم هذه اللغة فقط.',
  docLanguageLocked: 'لا يمكن تغيير اللغة بعد إنشاء المحضر.',
  prevPage: 'السابق',
  nextPage: 'التالي',
  pageOf: 'صفحة {page} من {pages}',
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
export type BilingualLabel = { en: string; ar: string }

export type ExportLabels = {
  meeting: BilingualLabel
  meetingTitle: BilingualLabel
  meetingLocation: BilingualLabel
  meetingDate: BilingualLabel
  attendance: BilingualLabel
  name: BilingualLabel
  designation: BilingualLabel
  discussion: BilingualLabel
  decisions: BilingualLabel
  preparedBy: BilingualLabel
  approvedBy: BilingualLabel
  fileFallback: string
  fileDateFallback: string
}

export function bilingualLine(label: BilingualLabel, locale: Locale = 'en') {
  return locale === 'ar' ? label.ar : label.en
}

export function bilingualInline(label: BilingualLabel, locale: Locale = 'en') {
  return locale === 'ar' ? label.ar : label.en
}

export function exportLabels(_locale?: Locale): ExportLabels {
  return {
    meeting: { en: 'Meeting', ar: 'الاجتماع' },
    meetingTitle: { en: 'Meeting Title', ar: 'عنوان الاجتماع' },
    meetingLocation: { en: 'Meeting Location', ar: 'مكان الاجتماع' },
    meetingDate: { en: 'Meeting Date', ar: 'تاريخ الاجتماع' },
    attendance: { en: 'Attendance', ar: 'الحضور' },
    name: { en: 'Name', ar: 'الإسم' },
    designation: { en: 'Designation', ar: 'المسمى الوظيفي' },
    discussion: { en: 'Discussion and Summary', ar: 'جدول وملحض الاجتماع' },
    decisions: {
      en: 'Recommendations and Decisions',
      ar: 'التوصيات والمخرجات المتفق عليها',
    },
    preparedBy: { en: 'Prepared by', ar: 'أعده' },
    approvedBy: { en: 'Approved by', ar: 'وافق عليه' },
    fileFallback: 'minutes',
    fileDateFallback: 'meeting',
  }
}

/** Footer slogans — always Arabic + English */
export function documentSlogans(_locale?: Locale): DocumentSlogan[] {
  return [
    { text: ARABIC_SLOGAN, arabic: true },
    { text: ENGLISH_SLOGAN, arabic: false },
    { text: ARABIC_TRANSFORM, arabic: true },
    { text: ENGLISH_TRANSFORM, arabic: false },
  ]
}
