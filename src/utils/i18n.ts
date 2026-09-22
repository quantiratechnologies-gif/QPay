export type SupportedLanguage = 'English' | 'العربية' | 'en' | 'ar' | string;

export const toArabicNumerals = (val: string | number): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return val
    .toString()
    .replace(/\d/g, (digit) => arabicDigits[parseInt(digit, 10)])
    .replace(/\./g, '٫')
    .replace(/,/g, '٬');
};

export const TRANSLATIONS: Record<string, { en: string; ar: string }> = {
  // Common & Navigation
  'app.name': { en: 'QtPay', ar: 'كيو تي باي' },
  'app.tagline': { en: 'QUICK • TRUSTED • PAYMENTS', ar: 'مدفوعات سريعة • موثوقة • فورية' },
  'powered.by': { en: 'powered by', ar: 'مشغل بواسطة' },
  'nav.home': { en: 'Home', ar: 'الرئيسية' },
  'nav.accounts': { en: 'Accounts', ar: 'الحسابات' },
  'nav.spend': { en: 'Analytics', ar: 'التحليلات' },
  'nav.pay': { en: 'Pay', ar: 'دفع' },
  'nav.scan': { en: 'Scan', ar: 'مسح' },
  'nav.history': { en: 'History', ar: 'العمليات' },
  'nav.cards': { en: 'Cards', ar: 'البطاقات' },
  'nav.profile': { en: 'Profile', ar: 'حسابي' },
  'btn.back': { en: 'Back', ar: 'رجوع' },
  'btn.continue': { en: 'Continue', ar: 'متابعة' },
  'btn.verify': { en: 'Verify', ar: 'تحقق' },
  'btn.confirm': { en: 'Confirm & Pay', ar: 'تأكيد ودفع' },
  'btn.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'btn.done': { en: 'Done', ar: 'تم' },
  'btn.close': { en: 'Close', ar: 'إغلاق' },
  'btn.share': { en: 'Share Receipt', ar: 'مشاركة الإيصال' },
  'btn.copied': { en: 'Copied', ar: 'تم النسخ' },
  'btn.copy': { en: 'Copy', ar: 'نسخ' },
  'btn.refund': { en: 'Refund', ar: 'استرداد' },
  'btn.collect': { en: 'Collect', ar: 'تحصيل' },
  'btn.save': { en: 'Save Changes', ar: 'حفظ التغييرات' },
  'btn.logout': { en: 'Log Out', ar: 'تسجيل الخروج' },
  'btn.add_bank': { en: 'Add Bank Account', ar: 'إضافة حساب بنكي' },
  'btn.edit_profile': { en: 'Edit Profile', ar: 'تعديل الملف الشخصي' },
  'btn.skip': { en: 'Skip', ar: 'تخطي' },
  'btn.next': { en: 'Next', ar: 'التالي' },
  'btn.get_started': { en: 'Get Started', ar: 'ابدأ الآن' },
  'btn.show_all': { en: 'Show All', ar: 'عرض الكل' },
  'btn.reset': { en: 'Reset', ar: 'إعادة ضبط' },
  'btn.export': { en: 'Export', ar: 'تصدير' },

  // Home & Balance
  'home.total_balance': { en: 'Total Available Balance', ar: 'إجمالي الرصيد المتاح' },
  'home.pin_required': { en: 'PIN Required', ar: 'رمز السري مطلوب' },
  'home.hide': { en: 'Hide', ar: 'إخفاء' },
  'home.tap_to_view_pin': { en: 'Tap to enter PIN and view balance', ar: 'اضغط لإدخال الرمز السري وعرض الرصيد' },
  'home.sarie_rail': { en: 'Sarie 24/7 Rail', ar: 'شبكة سريع الفورية ٢٤/٧' },
  'home.accounts': { en: 'Accounts', ar: 'الحسابات' },
  'home.transfer_pay': { en: 'Transfer & Pay', ar: 'تحويل ومدفوعات' },
  'home.zero_fees': { en: 'Zero Fees', ar: 'بدون رسوم' },
  'home.scan_qr': { en: 'Scan QR', ar: 'مسح الباركود' },
  'home.send_money': { en: 'Send Money', ar: 'إرسال أموال' },
  'home.pay_anyone': { en: 'Pay Anyone', ar: 'تحويل لأي شخص' },
  'home.request_money': { en: 'Request Money', ar: 'طلب أموال' },
  'home.receive': { en: 'Receive', ar: 'استلام' },
  'home.bills_sadad': { en: 'Bills & Utilities', ar: 'الفواتير والخدمات' },
  'home.sadad_utilities': { en: 'Bills & Public Utilities', ar: 'الفواتير والخدمات العامة' },
  'home.bills_utilities': { en: 'Bills & Utilities', ar: 'الفواتير والخدمات' },
  'home.utilities_services': { en: 'Bills & Public Utilities', ar: 'الفواتير والخدمات العامة' },
  'home.recent_txns': { en: 'Recent Activity', ar: 'أحدث العمليات' },
  'home.view_all': { en: 'View All', ar: 'عرض الكل' },
  'home.linked_banks': { en: 'Linked Saudi Banks', ar: 'الحسابات البنكية السعودية' },
  'home.associated_sama': { en: 'Associated with SAMA', ar: 'مرخص وخاضع لإشراف البنك المركزي السعودي' },
  'home.payment_partner': { en: 'Official Payment Partner', ar: 'شريك المدفوعات المعتمد' },
  'home.secured_sama': { en: 'Secured by SAMA National Banking Rail', ar: 'محمي بواسطة البنية التحتية للبنك المركزي السعودي' },
  'home.electricity': { en: 'Electricity', ar: 'الكهرباء' },
  'home.telecom': { en: 'Telecom', ar: 'الاتصالات' },
  'home.water': { en: 'Water', ar: 'المياه' },
  'home.traffic_fines': { en: 'Traffic Fines', ar: 'المخالفات المرورية' },
  'home.verify_identity': { en: 'Verify Identity', ar: 'توثيق الهوية' },
  'home.verify_identity_sub': { en: 'Verify your identity to activate all features', ar: 'وثّق هويتك لتفعيل كافة الخدمات والمزايا' },

  // Authentication & Onboarding
  'auth.welcome': { en: 'Welcome to QtPay', ar: 'مرحباً بك في كيو تي باي' },
  'auth.account_type': { en: 'Select Account Type', ar: 'اختر نوع الحساب' },
  'auth.customer': { en: 'Customer', ar: 'عميل' },
  'auth.full_name': { en: 'Full Legal Name', ar: 'الاسم الكامل' },
  'auth.mobile_number': { en: 'Saudi Mobile Number', ar: 'رقم الجوال السعودي' },
  'auth.get_otp': { en: 'Get OTP & Verify', ar: 'الحصول على رمز التحقق' },
  'auth.enter_otp': { en: 'Enter 6-Digit OTP', ar: 'أدخل رمز التحقق المكون من ٦ أرقام' },
  'auth.otp_sent_to': { en: 'Sent via SMS to', ar: 'تم الإرسال عبر رسالة نصية إلى' },
  'auth.resend_otp': { en: 'Resend OTP in', ar: 'إعادة الإرسال بعد' },
  'auth.resend_now': { en: 'Resend OTP', ar: 'إعادة إرسال الرمز' },
  'auth.permissions_title': { en: 'Device Permissions', ar: 'أذونات الجهاز' },
  'auth.permissions_sub': { en: 'Enable device permissions for seamless payments', ar: 'فعّل صلاحيات الجهاز لتجربة دفع سلسة وآمنة' },
  'auth.perm_camera': { en: 'Camera for QR Payments', ar: 'الكاميرا لمسح باركود الدفع' },
  'auth.perm_notif': { en: 'Instant Payment Alerts', ar: 'تنبيهات العمليات الفورية' },
  'auth.perm_biometric': { en: 'Biometric Face ID / Fingerprint', ar: 'البصمة الحيوية لتأكيد العمليات' },
  'auth.allow_continue': { en: 'Allow & Continue', ar: 'سماح ومتابعة' },
  'auth.onboarding_slide1_title': { en: 'Pay Anyone Instantly', ar: 'تحويل فوري لأي شخص' },
  'auth.onboarding_slide1_sub': { en: 'Send and receive money across all Saudi banks with zero fees.', ar: 'إرسال واستلام الأموال عبر جميع البنوك السعودية فوراً وبدون أي رسوم.' },
  'auth.onboarding_slide2_title': { en: 'All Banks in One Place', ar: 'جميع بنوكك في مكان واحد' },
  'auth.onboarding_slide2_sub': { en: 'Link your accounts and view your balances at a glance.', ar: 'اربط حساباتك البنكية واطلع على جميع أرصدتك في واجهة موحدة.' },
  'auth.onboarding_slide3_title': { en: 'Safe & Protected', ar: 'أمان وحماية موثوقة' },
  'auth.onboarding_slide3_sub': { en: 'Secured by Absher verification and SAMA regulations.', ar: 'حماية متقدمة وموثقة عبر نفاذ وأبشر وتحت مظلة البنك المركزي السعودي.' },

  // Pay Anyone & Send
  'pay.send_money': { en: 'Send Money', ar: 'إرسال أموال' },
  'pay.select_route': { en: 'Select Payment Route', ar: 'اختر طريقة التحويل' },
  'pay.account_to_account': { en: 'Account to Account', ar: 'تحويل بالآيبان / الحساب' },
  'pay.mobile_transfer': { en: 'Mobile Number', ar: 'رقم الجوال' },
  'pay.sarie_id': { en: 'Sarie Alias / ID', ar: 'معرف سريع الفوري' },
  'pay.enter_amount': { en: 'Enter Amount', ar: 'أدخل المبلغ' },
  'pay.source_account': { en: 'Source Bank Account', ar: 'الحساب البنكي المصدر' },
  'pay.add_note': { en: 'Add note / Purpose', ar: 'إضافة ملاحظة / الغرض' },
  'pay.processing': { en: 'Processing via Sarie...', ar: 'جاري المعالجة عبر نظام سريع...' },
  'pay.success_title': { en: 'Payment Successful', ar: 'تم التحويل بنجاح' },
  'pay.recipient': { en: 'Recipient', ar: 'المستلم' },
  'pay.txn_reference': { en: 'Sarie Reference', ar: 'المرجع البنكي لسريع' },
  'pay.quick_contacts': { en: 'Quick Contacts', ar: 'جهات الاتصال السريعة' },
  'pay.recent_recipients': { en: 'Recent Recipients', ar: 'المستلمون مؤخراً' },
  'pay.instant_sarie_transfer': { en: 'Instant Sarie Transfer', ar: 'تحويل سريع فوري' },
  'pay.purpose_personal': { en: 'Personal & Friends', ar: 'شخصي وللأصدقاء' },
  'pay.purpose_rent': { en: 'Rent & Housing', ar: 'إيجار وسكن' },
  'pay.purpose_services': { en: 'Services & Bills', ar: 'خدمات وفواتير' },
  'pay.purpose_family': { en: 'Family Support', ar: 'مصاريف عائلية' },

  // Receive & Scan
  'receive.title': { en: 'Receive Money', ar: 'استلام أموال' },
  'receive.qr_sub': { en: 'Scan QR to pay instantly via Sarie', ar: 'امسح الباركود للتحويل الفوري عبر سريع' },
  'receive.copy_sarie_id': { en: 'Copy Sarie ID', ar: 'نسخ معرف سريع' },
  'receive.share_qr': { en: 'Share QR Code', ar: 'مشاركة رمز الاستجابة' },
  'scan.title': { en: 'Scan to Pay', ar: 'مسح للدفع' },
  'scan.align_qr': { en: 'Align QR Code within the frame', ar: 'وجّه الكاميرا نحو رمز الاستجابة' },
  'scan.upload_gallery': { en: 'Upload from Gallery', ar: 'تحميل من المعرض' },

  // Bank Accounts & Cards
  'banks.title': { en: 'Bank Accounts', ar: 'الحسابات البنكية' },
  'banks.linked': { en: 'Linked Saudi Accounts', ar: 'الحسابات السعودية المرتبطة' },
  'banks.add_bank': { en: 'Add Bank Account', ar: 'إضافة حساب بنكي' },
  'banks.primary': { en: 'PRIMARY', ar: 'الأساسي' },
  'banks.active': { en: 'ACTIVE', ar: 'نشط' },
  'banks.check_balance': { en: 'Check Balance', ar: 'استعلام عن الرصيد' },
  'banks.current_account': { en: 'Current Account', ar: 'حساب جاري' },
  'banks.savings_account': { en: 'Savings Account', ar: 'حساب ادخار' },
  'banks.set_primary': { en: 'Set as Primary', ar: 'تعيين كحساب أساسي' },
  'banks.refresh_balance': { en: 'Refresh Balances', ar: 'تحديث الأرصدة' },
  'cards.title': { en: 'Cards & Payment Methods', ar: 'البطاقات وطرق الدفع' },
  'cards.digital_mada': { en: 'Digital Debit Card (mada & Apple Pay)', ar: 'بطاقة مدى الرقمية (أبل باي)' },
  'cards.platinum': { en: 'QtPay Platinum', ar: 'كيو تي باي بلاتينيوم' },
  'cards.instant_debit': { en: 'Sarie Instant Debit', ar: 'خصم مباشر فوري - سريع' },
  'cards.cardholder': { en: 'Cardholder', ar: 'حامل البطاقة' },
  'cards.expires': { en: 'Expires', ar: 'تاريخ الانتهاء' },
  'cards.saved_cards': { en: 'Saved mada & Credit Cards', ar: 'بطاقات مدى والائتمان المحفوظة' },

  // Bills & Utilities
  'bills.title': { en: 'Bills & Public Utilities', ar: 'الفواتير والخدمات العامة' },
  'bills.electricity': { en: 'Saudi Electricity Company (SEC)', ar: 'الشركة السعودية للكهرباء (SEC)' },
  'bills.water': { en: 'National Water Company (NWC)', ar: 'شركة المياه الوطنية (NWC)' },
  'bills.telecom': { en: 'Telecom & Internet', ar: 'الاتصالات والإنترنت' },
  'bills.consumer_num': { en: 'Account / Consumer Number', ar: 'رقم الحساب / المشترك' },
  'bills.bill_amount': { en: 'Due Amount', ar: 'المبلغ المستحق' },
  'bills.due_date': { en: 'Due Date', ar: 'تاريخ الاستحقاق' },
  'bills.pay_now': { en: 'Pay Bill via Sarie', ar: 'دفع الفاتورة عبر سريع' },
  'bills.fetch_bill': { en: 'Fetch Bill', ar: 'استعلام عن الفاتورة' },
  'bills.paid_success': { en: 'Bill Paid Successfully', ar: 'تم سداد الفاتورة بنجاح' },

  // Spend Analysis & Analytics
  'spend.title': { en: 'Spend Analysis', ar: 'تحليل المصاريف' },
  'spend.total_spent': { en: 'Total Spending', ar: 'إجمالي المصروفات' },
  'spend.period_week': { en: 'Week', ar: 'أسبوع' },
  'spend.period_month': { en: 'Month', ar: 'شهر' },
  'spend.period_last_month': { en: 'Last Mo.', ar: 'الشهر الماضي' },
  'spend.period_year': { en: 'Year', ar: 'سنة' },
  'spend.daily_avg': { en: 'Daily Avg:', ar: 'المعدل اليومي:' },
  'spend.vs_last_period': { en: 'vs last period', ar: 'أقل من السابق' },
  'spend.budget_target': { en: 'Monthly Budget & Target', ar: 'الحد المالي والميزانية' },
  'spend.remaining_budget': { en: 'remaining of budget', ar: 'متبقي من الميزانية' },
  'spend.category_distribution': { en: 'Category Spend Distribution', ar: 'التوزيع الدائري للمصروفات' },
  'spend.timeline_trend': { en: 'Timeline Spending Trend', ar: 'المخطط الزمني للإنفاق' },
  'spend.category_details': { en: 'Category Details', ar: 'تفاصيل الفئات' },
  'spend.top_merchants': { en: 'Top Merchants', ar: 'أعلى المتاجر إنفاقاً' },
  'spend.smart_insights': { en: 'Smart Spend Insights', ar: 'رؤى ونصائح مالية ذكية' },
  'spend.export_statement': { en: 'Export Statement', ar: 'تصدير التقرير' },
  'spend.exported_success': { en: 'Spend statement exported successfully (PDF/CSV)', ar: 'تم تصدير تقرير المصروفات (PDF/CSV) بنجاح' },

  // Categories
  'cat.shopping': { en: 'Shopping & Retail', ar: 'التسوق والتجزئة' },
  'cat.food': { en: 'Food & Dining', ar: 'المطاعم والمقاهي' },
  'cat.bills': { en: 'Bills & Utilities', ar: 'الفواتير والخدمات' },
  'cat.transport': { en: 'Travel & Transport', ar: 'السفر والمواصلات' },
  'cat.transfers': { en: 'Transfers & Others', ar: 'التحويلات ومدفوعات أخرى' },
  'cat.health': { en: 'Health & Medical', ar: 'الصحة والرعاية' },

  // History & Notifications
  'history.title': { en: 'Transaction History', ar: 'سجل العمليات' },
  'history.all': { en: 'All', ar: 'الكل' },
  'history.transfers': { en: 'Transfers', ar: 'تحويلات' },
  'history.bills': { en: 'Bills', ar: 'فواتير' },
  'history.empty': { en: 'No transactions yet', ar: 'لا توجد عمليات سابقة' },
  'history.empty_sub': { en: 'Make your first transfer or bill payment to see activity here.', ar: 'قم بإجراء أول تحويل أو دفع فاتورة لعرض سجل العمليات هنا.' },
  'notif.title': { en: 'Notifications', ar: 'الإشعارات' },
  'notif.empty': { en: 'No new notifications', ar: 'لا توجد إشعارات جديدة' },

  // Profile & Settings
  'profile.title': { en: 'Profile & Settings', ar: 'الملف الشخصي والإعدادات' },
  'profile.my_qr': { en: 'My QR Code', ar: 'الباركود الخاص بي' },
  'profile.linked_banks': { en: 'Linked Bank Accounts', ar: 'الحسابات البنكية المرتبطة' },
  'profile.cards': { en: 'Payment Methods & Cards', ar: 'طرق الدفع والبطاقات' },
  'profile.security': { en: 'Security & Device Passcode', ar: 'الأمان ورمز الدخول' },
  'profile.privacy': { en: 'Data & Privacy', ar: 'البيانات والخصوصية' },
  'profile.help': { en: 'Help & Customer Support', ar: 'المساعدة ودعم العملاء' },
  'profile.app_links': { en: 'App Info & Licenses', ar: 'معلومات التطبيق والتراخيص' },
  'profile.language': { en: 'Language', ar: 'اللغة' },
  'profile.edit': { en: 'Edit Profile', ar: 'تعديل الملف الشخصي' },
  'profile.verified_kyc': { en: 'National ID Verified (Absher KYC)', ar: 'هوية وطنية موثقة عبر أبشر' },
  'profile.unverified_kyc': { en: 'Unverified ID', ar: 'هوية غير موثقة' },
  'profile.logout': { en: 'Log Out', ar: 'تسجيل الخروج' },

  // Security & Passcode
  'sec.enter_pin': { en: 'Enter PIN to View Balance', ar: 'أدخل الرمز السري لعرض الرصيد' },
  'sec.enter_pin_sub': { en: 'Enter 4-digit security PIN to view your total balance', ar: 'أدخل الرمز السري المكون من ٤ أرقام لعرض رصيدك الإجمالي' },
  'sec.select_lang': { en: 'Select Language', ar: 'اختر لغة التطبيق' },
  'sec.biometrics': { en: 'Biometric Authentication', ar: 'المصادقة بالبصمة الحيوية' },
  'sec.device_sessions': { en: 'Active Device Sessions', ar: 'الأجهزة النشطة' },

  // Saudi Banks
  'Al Rajhi Bank': { en: 'Al Rajhi Bank', ar: 'مصرف الراجحي' },
  'Saudi National Bank (SNB)': { en: 'Saudi National Bank (SNB)', ar: 'البنك الأهلي السعودي (SNB)' },
  'Riyad Bank': { en: 'Riyad Bank', ar: 'بنك الرياض' },
  'Alinma Bank': { en: 'Alinma Bank', ar: 'مصرف الإنماء' },
  'Saudi Awwal Bank (SAB)': { en: 'Saudi Awwal Bank (SAB)', ar: 'البنك السعودي الأول (SAB)' },
  'Arab National Bank (anb)': { en: 'Arab National Bank (anb)', ar: 'البنك العربي الوطني (anb)' },
  'Banque Saudi Fransi': { en: 'Banque Saudi Fransi', ar: 'البنك السعودي الفرنسي' },
  'Bank AlJazira': { en: 'Bank AlJazira', ar: 'بنك الجزيرة' },
  'Bank Albilad': { en: 'Bank Albilad', ar: 'بنك البلاد' },
  'Gulf International Bank': { en: 'Gulf International Bank (meem)', ar: 'بنك الخليج الدولي (ميم)' },

  // Saudi Entities & Merchants
  'Saudi Electricity Company (SEC)': { en: 'Saudi Electricity Company (SEC)', ar: 'الشركة السعودية للكهرباء (SEC)' },
  'Jarir Bookstore': { en: 'Jarir Bookstore', ar: 'مكتبة جرير' },
  'Lulu Hypermarket': { en: 'Lulu Hypermarket', ar: 'لولو هايبرماركت' },
  'HungerStation': { en: 'HungerStation', ar: 'هنقرستيشن' },
  'Nahdi Pharmacy': { en: 'Nahdi Pharmacy', ar: 'صيدليات النهدي' },
  'Panda Supermarket': { en: 'Panda Supermarket', ar: 'أسواق بنده' },
  'Dr. Sulaiman Al-Habib': { en: 'Dr. Sulaiman Al-Habib Hospital', ar: 'مستشفى د. سليمان الحبيب' },
  'STC Pay': { en: 'STC Pay', ar: 'إس تي سي باي' },
  'Uber Riyadh': { en: 'Uber Riyadh', ar: 'أوبر الرياض' },
  'Aramco Fuel': { en: 'Aramco Fuel Station', ar: 'محطات وقود أرامكو' },
  'Sarie Instant Transfer': { en: 'Sarie Instant Transfer', ar: 'تحويل سريع فوري' },
  'Sarie Transfer': { en: 'Sarie Transfer', ar: 'تحويل عبر سريع' },

  // Contacts
  'Tariq Al-Otaibi': { en: 'Tariq Al-Otaibi', ar: 'طارق العتيبي' },
  'Sara Al-Mansoor': { en: 'Sara Al-Mansoor', ar: 'سارة المنصور' },
  'Mohammed Al-Ghamdi': { en: 'Mohammed Al-Ghamdi', ar: 'محمد الغامدي' },
  'Abdullah Al-Shehri': { en: 'Abdullah Al-Shehri', ar: 'عبدالله الشهري' },
  'Reem Al-Dosari': { en: 'Reem Al-Dosari', ar: 'ريم الدوسري' },
  'Omar Khalid': { en: 'Omar Khalid', ar: 'عمر خالد' },
  'Fahad Al-Harbi': { en: 'Fahad Al-Harbi', ar: 'فهد الحربي' },

  // Time & Labels
  'TODAY': { en: 'TODAY', ar: 'اليوم' },
  'Today': { en: 'Today', ar: 'اليوم' },
  'YESTERDAY': { en: 'YESTERDAY', ar: 'أمس' },
  'Yesterday': { en: 'Yesterday', ar: 'أمس' },
  'Current Account': { en: 'Current Account', ar: 'حساب جاري' },
  'Savings Account': { en: 'Savings Account', ar: 'حساب ادخار' },

  // Services
  'services.all': { en: 'All Services & Utilities', ar: 'جميع الخدمات والمرافق' },
  'services.food': { en: 'Food & Dining', ar: 'المطاعم والكافيهات' },
  'services.shopping': { en: 'Shopping & Retail', ar: 'التسوق والتجزئة' },
  'services.travel': { en: 'Travel & Transport', ar: 'السفر والمواصلات' },
  'services.rewards': { en: 'Rewards & Cashback', ar: 'المكافآت واسترداد النقود' },
  'services.money_requests': { en: 'Money Requests', ar: 'طلبات الأموال' },
  'services.request_money': { en: 'Request Money', ar: 'طلب أموال' },
  'services.messages': { en: 'Payment Messages', ar: 'رسائل المدفوعات' },
  'services.upi_settings': { en: 'Sarie Alias & ID Settings', ar: 'إعدادات معرف سريع' },
  'services.security': { en: 'Security Center', ar: 'مركز الأمان والحماية' },
  'services.privacy': { en: 'Privacy Policy & Terms', ar: 'سياسة الخصوصية والشروط' },
  'services.help': { en: 'SAMA Support & Helpdesk', ar: 'الدعم والمساعدة الرسمية' },
};

export const translateText = (keyOrText: string, language: SupportedLanguage = 'English', defaultText?: string): string => {
  const isAr = language === 'العربية' || language === 'ar';

  // 1. Direct match by key
  const directMatch = TRANSLATIONS[keyOrText];
  if (directMatch) {
    return isAr ? directMatch.ar : directMatch.en;
  }

  // 2. Case-insensitive text match across English and Arabic keys
  const lowerKey = keyOrText.trim().toLowerCase();
  for (const [k, v] of Object.entries(TRANSLATIONS)) {
    if (k.toLowerCase() === lowerKey || v.en.toLowerCase() === lowerKey) {
      return isAr ? v.ar : v.en;
    }
  }

  return defaultText || keyOrText;
};

export const formatSaudiCurrency = (amount: number, language: SupportedLanguage = 'English'): string => {
  const isAr = language === 'العربية' || language === 'ar';
  const formattedNum = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  if (isAr) {
    return `${toArabicNumerals(formattedNum)} ر.س`;
  }
  return `SAR ${formattedNum}`;
};

export const formatLocalizedNumber = (val: string | number, language: SupportedLanguage = 'English'): string => {
  const isAr = language === 'العربية' || language === 'ar';
  if (isAr) {
    return toArabicNumerals(val);
  }
  return val.toString();
};

export const formatLocalizedDate = (date: Date, language: SupportedLanguage = 'English'): string => {
  const isAr = language === 'العربية' || language === 'ar';
  if (isAr) {
    return new Intl.DateTimeFormat('ar-SA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};
