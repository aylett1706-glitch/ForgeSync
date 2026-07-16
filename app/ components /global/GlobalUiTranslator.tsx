import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getTranslationDictionary } from '@/lib/globalTranslationDictionary';

const DICTIONARIES = {
  es: {
    Dashboard: 'Panel', Hubs: 'Centros', 'Hub Management': 'Gestión de centros', Participants: 'Participantes', Workers: 'Trabajadores', Rostering: 'Turnos', Maintenance: 'Mantenimiento', Incidents: 'Incidentes', Reports: 'Informes', Documents: 'Documentos', Forms: 'Formularios', Settings: 'Configuración', Search: 'Buscar', 'Create Hub': 'Crear centro', Edit: 'Editar', Delete: 'Eliminar', Active: 'Activo', Safety: 'Seguridad', Compliance: 'Cumplimiento', Funding: 'Financiación', Property: 'Propiedad', People: 'Personas', Operations: 'Operaciones', Cancel: 'Cancelar', Save: 'Guardar', 'Save Changes': 'Guardar cambios', Loading: 'Cargando', Notifications: 'Notificaciones', Messages: 'Mensajes', Training: 'Formación', Resources: 'Recursos', 'Sign Out': 'Cerrar sesión', Logout: 'Cerrar sesión'
  },
  fr: {
    Dashboard: 'Tableau de bord', Hubs: 'Pôles', 'Hub Management': 'Gestion des pôles', Participants: 'Participants', Workers: 'Intervenants', Rostering: 'Planning', Maintenance: 'Maintenance', Incidents: 'Incidents', Reports: 'Rapports', Documents: 'Documents', Forms: 'Formulaires', Settings: 'Paramètres', Search: 'Rechercher', 'Create Hub': 'Créer un pôle', Edit: 'Modifier', Delete: 'Supprimer', Active: 'Actif', Safety: 'Sécurité', Compliance: 'Conformité', Funding: 'Financement', Property: 'Propriété', People: 'Personnes', Operations: 'Opérations', Cancel: 'Annuler', Save: 'Enregistrer', 'Save Changes': 'Enregistrer les modifications', Loading: 'Chargement', Notifications: 'Notifications', Messages: 'Messages', Training: 'Formation', Resources: 'Ressources', 'Sign Out': 'Se déconnecter', Logout: 'Se déconnecter'
  },
  de: {
    Dashboard: 'Dashboard', Hubs: 'Standorte', 'Hub Management': 'Standortverwaltung', Participants: 'Teilnehmende', Workers: 'Mitarbeitende', Rostering: 'Dienstplanung', Maintenance: 'Wartung', Incidents: 'Vorfälle', Reports: 'Berichte', Documents: 'Dokumente', Forms: 'Formulare', Settings: 'Einstellungen', Search: 'Suchen', 'Create Hub': 'Standort erstellen', Edit: 'Bearbeiten', Delete: 'Löschen', Active: 'Aktiv', Safety: 'Sicherheit', Compliance: 'Compliance', Funding: 'Finanzierung', Property: 'Immobilie', People: 'Personen', Operations: 'Betrieb', Cancel: 'Abbrechen', Save: 'Speichern', 'Save Changes': 'Änderungen speichern', Loading: 'Wird geladen', Notifications: 'Benachrichtigungen', Messages: 'Nachrichten', Training: 'Schulung', Resources: 'Ressourcen', 'Sign Out': 'Abmelden', Logout: 'Abmelden'
  },
  ar: {
    Dashboard: 'لوحة التحكم', Hubs: 'المراكز', 'Hub Management': 'إدارة المراكز', Participants: 'المشاركون', Workers: 'العاملون', Rostering: 'الجدولة', Maintenance: 'الصيانة', Incidents: 'الحوادث', Reports: 'التقارير', Documents: 'المستندات', Forms: 'النماذج', Settings: 'الإعدادات', Search: 'بحث', 'Create Hub': 'إنشاء مركز', Edit: 'تعديل', Delete: 'حذف', Active: 'نشط', Safety: 'السلامة', Compliance: 'الامتثال', Funding: 'التمويل', Property: 'الموقع', People: 'الأشخاص', Operations: 'العمليات', Cancel: 'إلغاء', Save: 'حفظ', 'Save Changes': 'حفظ التغييرات', Loading: 'جارٍ التحميل', Notifications: 'الإشعارات', Messages: 'الرسائل', Training: 'التدريب', Resources: 'الموارد', 'Sign Out': 'تسجيل الخروج', Logout: 'تسجيل الخروج'
  },
  zh: {
    Dashboard: '仪表板', Hubs: '枢纽', 'Hub Management': '枢纽管理', Participants: '参与者', Workers: '工作人员', Rostering: '排班', Maintenance: '维护', Incidents: '事件', Reports: '报告', Documents: '文档', Forms: '表单', Settings: '设置', Search: '搜索', 'Create Hub': '创建枢纽', Edit: '编辑', Delete: '删除', Active: '启用', Safety: '安全', Compliance: '合规', Funding: '资金', Property: '物业', People: '人员', Operations: '运营', Cancel: '取消', Save: '保存', 'Save Changes': '保存更改', Loading: '加载中', Notifications: '通知', Messages: '消息', Training: '培训', Resources: '资源', 'Sign Out': '退出登录', Logout: '退出登录'
  },
  ja: {
    Dashboard: 'ダッシュボード', Hubs: 'ハブ', 'Hub Management': 'ハブ管理', Participants: '参加者', Workers: '職員', Rostering: 'シフト管理', Maintenance: '保守', Incidents: 'インシデント', Reports: 'レポート', Documents: '文書', Forms: 'フォーム', Settings: '設定', Search: '検索', 'Create Hub': 'ハブを作成', Edit: '編集', Delete: '削除', Active: '有効', Safety: '安全', Compliance: 'コンプライアンス', Funding: '資金', Property: '物件', People: '人員', Operations: '運用', Cancel: 'キャンセル', Save: '保存', 'Save Changes': '変更を保存', Loading: '読み込み中', Notifications: '通知', Messages: 'メッセージ', Training: '研修', Resources: 'リソース', 'Sign Out': 'サインアウト', Logout: 'ログアウト'
  },
  ko: {
    Dashboard: '대시보드', Hubs: '허브', 'Hub Management': '허브 관리', Participants: '참여자', Workers: '직원', Rostering: '근무표', Maintenance: '유지보수', Incidents: '사고', Reports: '보고서', Documents: '문서', Forms: '양식', Settings: '설정', Search: '검색', 'Create Hub': '허브 만들기', Edit: '편집', Delete: '삭제', Active: '활성', Safety: '안전', Compliance: '준수', Funding: '자금', Property: '시설', People: '사람', Operations: '운영', Cancel: '취소', Save: '저장', 'Save Changes': '변경사항 저장', Loading: '로딩 중', Notifications: '알림', Messages: '메시지', Training: '교육', Resources: '자료', 'Sign Out': '로그아웃', Logout: '로그아웃'
  },
  hi: {
    Dashboard: 'डैशबोर्ड', Hubs: 'हब', 'Hub Management': 'हब प्रबंधन', Participants: 'प्रतिभागी', Workers: 'कर्मचारी', Rostering: 'रोस्टरिंग', Maintenance: 'रखरखाव', Incidents: 'घटनाएँ', Reports: 'रिपोर्ट', Documents: 'दस्तावेज़', Forms: 'फ़ॉर्म', Settings: 'सेटिंग्स', Search: 'खोजें', 'Create Hub': 'हब बनाएँ', Edit: 'संपादित करें', Delete: 'हटाएँ', Active: 'सक्रिय', Safety: 'सुरक्षा', Compliance: 'अनुपालन', Funding: 'फंडिंग', Property: 'संपत्ति', People: 'लोग', Operations: 'संचालन', Cancel: 'रद्द करें', Save: 'सहेजें', 'Save Changes': 'बदलाव सहेजें', Loading: 'लोड हो रहा है', Notifications: 'सूचनाएँ', Messages: 'संदेश', Training: 'प्रशिक्षण', Resources: 'संसाधन', 'Sign Out': 'साइन आउट', Logout: 'लॉग आउट'
  },
  pt: {
    Dashboard: 'Painel', Hubs: 'Centros', 'Hub Management': 'Gestão de centros', Participants: 'Participantes', Workers: 'Trabalhadores', Rostering: 'Escalas', Maintenance: 'Manutenção', Incidents: 'Incidentes', Reports: 'Relatórios', Documents: 'Documentos', Forms: 'Formulários', Settings: 'Configurações', Search: 'Pesquisar', 'Create Hub': 'Criar centro', Edit: 'Editar', Delete: 'Eliminar', Active: 'Ativo', Safety: 'Segurança', Compliance: 'Conformidade', Funding: 'Financiamento', Property: 'Propriedade', People: 'Pessoas', Operations: 'Operações', Cancel: 'Cancelar', Save: 'Guardar', 'Save Changes': 'Guardar alterações', Loading: 'A carregar', Notifications: 'Notificações', Messages: 'Mensagens', Training: 'Formação', Resources: 'Recursos', 'Sign Out': 'Terminar sessão', Logout: 'Terminar sessão'
  },
  it: {
    Dashboard: 'Dashboard', Hubs: 'Hub', 'Hub Management': 'Gestione hub', Participants: 'Partecipanti', Workers: 'Operatori', Rostering: 'Turni', Maintenance: 'Manutenzione', Incidents: 'Incidenti', Reports: 'Report', Documents: 'Documenti', Forms: 'Moduli', Settings: 'Impostazioni', Search: 'Cerca', 'Create Hub': 'Crea hub', Edit: 'Modifica', Delete: 'Elimina', Active: 'Attivo', Safety: 'Sicurezza', Compliance: 'Conformità', Funding: 'Finanziamento', Property: 'Struttura', People: 'Persone', Operations: 'Operazioni', Cancel: 'Annulla', Save: 'Salva', 'Save Changes': 'Salva modifiche', Loading: 'Caricamento', Notifications: 'Notifiche', Messages: 'Messaggi', Training: 'Formazione', Resources: 'Risorse', 'Sign Out': 'Esci', Logout: 'Esci'
  },
  nl: {
    Dashboard: 'Dashboard', Hubs: 'Hubs', 'Hub Management': 'Hubbeheer', Participants: 'Deelnemers', Workers: 'Medewerkers', Rostering: 'Roosters', Maintenance: 'Onderhoud', Incidents: 'Incidenten', Reports: 'Rapporten', Documents: 'Documenten', Forms: 'Formulieren', Settings: 'Instellingen', Search: 'Zoeken', 'Create Hub': 'Hub maken', Edit: 'Bewerken', Delete: 'Verwijderen', Active: 'Actief', Safety: 'Veiligheid', Compliance: 'Naleving', Funding: 'Financiering', Property: 'Locatie', People: 'Mensen', Operations: 'Operaties', Cancel: 'Annuleren', Save: 'Opslaan', 'Save Changes': 'Wijzigingen opslaan', Loading: 'Laden', Notifications: 'Meldingen', Messages: 'Berichten', Training: 'Training', Resources: 'Bronnen', 'Sign Out': 'Afmelden', Logout: 'Afmelden'
  },
  sv: {
    Dashboard: 'Instrumentpanel', Hubs: 'Hubbar', 'Hub Management': 'Hubbhantering', Participants: 'Deltagare', Workers: 'Medarbetare', Rostering: 'Schemaläggning', Maintenance: 'Underhåll', Incidents: 'Incidenter', Reports: 'Rapporter', Documents: 'Dokument', Forms: 'Formulär', Settings: 'Inställningar', Search: 'Sök', 'Create Hub': 'Skapa hubb', Edit: 'Redigera', Delete: 'Ta bort', Active: 'Aktiv', Safety: 'Säkerhet', Compliance: 'Efterlevnad', Funding: 'Finansiering', Property: 'Fastighet', People: 'Personer', Operations: 'Verksamhet', Cancel: 'Avbryt', Save: 'Spara', 'Save Changes': 'Spara ändringar', Loading: 'Laddar', Notifications: 'Aviseringar', Messages: 'Meddelanden', Training: 'Utbildning', Resources: 'Resurser', 'Sign Out': 'Logga ut', Logout: 'Logga ut'
  },
  pl: {
    Dashboard: 'Panel', Hubs: 'Centra', 'Hub Management': 'Zarządzanie centrami', Participants: 'Uczestnicy', Workers: 'Pracownicy', Rostering: 'Grafik', Maintenance: 'Utrzymanie', Incidents: 'Zdarzenia', Reports: 'Raporty', Documents: 'Dokumenty', Forms: 'Formularze', Settings: 'Ustawienia', Search: 'Szukaj', 'Create Hub': 'Utwórz centrum', Edit: 'Edytuj', Delete: 'Usuń', Active: 'Aktywne', Safety: 'Bezpieczeństwo', Compliance: 'Zgodność', Funding: 'Finansowanie', Property: 'Obiekt', People: 'Osoby', Operations: 'Operacje', Cancel: 'Anuluj', Save: 'Zapisz', 'Save Changes': 'Zapisz zmiany', Loading: 'Ładowanie', Notifications: 'Powiadomienia', Messages: 'Wiadomości', Training: 'Szkolenie', Resources: 'Zasoby', 'Sign Out': 'Wyloguj', Logout: 'Wyloguj'
  },
  tr: {
    Dashboard: 'Kontrol paneli', Hubs: 'Merkezler', 'Hub Management': 'Merkez yönetimi', Participants: 'Katılımcılar', Workers: 'Çalışanlar', Rostering: 'Vardiya planı', Maintenance: 'Bakım', Incidents: 'Olaylar', Reports: 'Raporlar', Documents: 'Belgeler', Forms: 'Formlar', Settings: 'Ayarlar', Search: 'Ara', 'Create Hub': 'Merkez oluştur', Edit: 'Düzenle', Delete: 'Sil', Active: 'Aktif', Safety: 'Güvenlik', Compliance: 'Uyumluluk', Funding: 'Finansman', Property: 'Tesis', People: 'Kişiler', Operations: 'Operasyonlar', Cancel: 'İptal', Save: 'Kaydet', 'Save Changes': 'Değişiklikleri kaydet', Loading: 'Yükleniyor', Notifications: 'Bildirimler', Messages: 'Mesajlar', Training: 'Eğitim', Resources: 'Kaynaklar', 'Sign Out': 'Çıkış yap', Logout: 'Çıkış yap'
  },
  id: {
    Dashboard: 'Dasbor', Hubs: 'Hub', 'Hub Management': 'Manajemen hub', Participants: 'Peserta', Workers: 'Pekerja', Rostering: 'Jadwal kerja', Maintenance: 'Pemeliharaan', Incidents: 'Insiden', Reports: 'Laporan', Documents: 'Dokumen', Forms: 'Formulir', Settings: 'Pengaturan', Search: 'Cari', 'Create Hub': 'Buat hub', Edit: 'Edit', Delete: 'Hapus', Active: 'Aktif', Safety: 'Keselamatan', Compliance: 'Kepatuhan', Funding: 'Pendanaan', Property: 'Properti', People: 'Orang', Operations: 'Operasi', Cancel: 'Batal', Save: 'Simpan', 'Save Changes': 'Simpan perubahan', Loading: 'Memuat', Notifications: 'Notifikasi', Messages: 'Pesan', Training: 'Pelatihan', Resources: 'Sumber daya', 'Sign Out': 'Keluar', Logout: 'Keluar'
  },
  th: {
    Dashboard: 'แดชบอร์ด', Hubs: 'ศูนย์', 'Hub Management': 'การจัดการศูนย์', Participants: 'ผู้เข้าร่วม', Workers: 'เจ้าหน้าที่', Rostering: 'ตารางงาน', Maintenance: 'การบำรุงรักษา', Incidents: 'เหตุการณ์', Reports: 'รายงาน', Documents: 'เอกสาร', Forms: 'แบบฟอร์ม', Settings: 'การตั้งค่า', Search: 'ค้นหา', 'Create Hub': 'สร้างศูนย์', Edit: 'แก้ไข', Delete: 'ลบ', Active: 'ใช้งาน', Safety: 'ความปลอดภัย', Compliance: 'การปฏิบัติตาม', Funding: 'เงินทุน', Property: 'สถานที่', People: 'บุคคล', Operations: 'การดำเนินงาน', Cancel: 'ยกเลิก', Save: 'บันทึก', 'Save Changes': 'บันทึกการเปลี่ยนแปลง', Loading: 'กำลังโหลด', Notifications: 'การแจ้งเตือน', Messages: 'ข้อความ', Training: 'การฝึกอบรม', Resources: 'ทรัพยากร', 'Sign Out': 'ออกจากระบบ', Logout: 'ออกจากระบบ'
  },
  vi: {
    Dashboard: 'Bảng điều khiển', Hubs: 'Trung tâm', 'Hub Management': 'Quản lý trung tâm', Participants: 'Người tham gia', Workers: 'Nhân viên', Rostering: 'Lịch làm việc', Maintenance: 'Bảo trì', Incidents: 'Sự cố', Reports: 'Báo cáo', Documents: 'Tài liệu', Forms: 'Biểu mẫu', Settings: 'Cài đặt', Search: 'Tìm kiếm', 'Create Hub': 'Tạo trung tâm', Edit: 'Sửa', Delete: 'Xóa', Active: 'Đang hoạt động', Safety: 'An toàn', Compliance: 'Tuân thủ', Funding: 'Tài trợ', Property: 'Cơ sở', People: 'Người', Operations: 'Vận hành', Cancel: 'Hủy', Save: 'Lưu', 'Save Changes': 'Lưu thay đổi', Loading: 'Đang tải', Notifications: 'Thông báo', Messages: 'Tin nhắn', Training: 'Đào tạo', Resources: 'Tài nguyên', 'Sign Out': 'Đăng xuất', Logout: 'Đăng xuất'
  },
  ms: {
    Dashboard: 'Papan pemuka', Hubs: 'Hab', 'Hub Management': 'Pengurusan hab', Participants: 'Peserta', Workers: 'Pekerja', Rostering: 'Jadual kerja', Maintenance: 'Penyelenggaraan', Incidents: 'Insiden', Reports: 'Laporan', Documents: 'Dokumen', Forms: 'Borang', Settings: 'Tetapan', Search: 'Cari', 'Create Hub': 'Cipta hab', Edit: 'Edit', Delete: 'Padam', Active: 'Aktif', Safety: 'Keselamatan', Compliance: 'Pematuhan', Funding: 'Pembiayaan', Property: 'Premis', People: 'Orang', Operations: 'Operasi', Cancel: 'Batal', Save: 'Simpan', 'Save Changes': 'Simpan perubahan', Loading: 'Memuatkan', Notifications: 'Pemberitahuan', Messages: 'Mesej', Training: 'Latihan', Resources: 'Sumber', 'Sign Out': 'Log keluar', Logout: 'Log keluar'
  },
  ro: {
    Dashboard: 'Tablou de bord', Hubs: 'Centre', 'Hub Management': 'Administrare centre', Participants: 'Participanți', Workers: 'Lucrători', Rostering: 'Planificare ture', Maintenance: 'Mentenanță', Incidents: 'Incidente', Reports: 'Rapoarte', Documents: 'Documente', Forms: 'Formulare', Settings: 'Setări', Search: 'Caută', 'Create Hub': 'Creează centru', Edit: 'Editează', Delete: 'Șterge', Active: 'Activ', Safety: 'Siguranță', Compliance: 'Conformitate', Funding: 'Finanțare', Property: 'Proprietate', People: 'Persoane', Operations: 'Operațiuni', Cancel: 'Anulează', Save: 'Salvează', 'Save Changes': 'Salvează modificările', Loading: 'Se încarcă', Notifications: 'Notificări', Messages: 'Mesaje', Training: 'Instruire', Resources: 'Resurse', 'Sign Out': 'Deconectare', Logout: 'Deconectare'
  },
  uk: {
    Dashboard: 'Панель', Hubs: 'Хаби', 'Hub Management': 'Керування хабами', Participants: 'Учасники', Workers: 'Працівники', Rostering: 'Розклад', Maintenance: 'Обслуговування', Incidents: 'Інциденти', Reports: 'Звіти', Documents: 'Документи', Forms: 'Форми', Settings: 'Налаштування', Search: 'Пошук', 'Create Hub': 'Створити хаб', Edit: 'Редагувати', Delete: 'Видалити', Active: 'Активний', Safety: 'Безпека', Compliance: 'Відповідність', Funding: 'Фінансування', Property: 'Об’єкт', People: 'Люди', Operations: 'Операції', Cancel: 'Скасувати', Save: 'Зберегти', 'Save Changes': 'Зберегти зміни', Loading: 'Завантаження', Notifications: 'Сповіщення', Messages: 'Повідомлення', Training: 'Навчання', Resources: 'Ресурси', 'Sign Out': 'Вийти', Logout: 'Вийти'
  },
};

const textState = new WeakMap();
const attributeState = new WeakMap();
const ignoredTags = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'CODE', 'PRE']);
const translatableAttributes = ['placeholder', 'aria-label', 'title'];
const translationCaches = new Map();
const pendingTranslations = new Map();
let flushTimer = null;
let refreshTranslations = () => {};

const getLanguageCode = () => (window.__forgeGlobalExperience?.language_code || document.documentElement.lang || 'en').split('-')[0];

const getDictionary = () => {
  const code = getLanguageCode();
  const dictionary = code === 'en' ? null : { ...(DICTIONARIES[code] || {}), ...(getTranslationDictionary(code) || {}) };
  return dictionary && Object.keys(dictionary).length ? dictionary : null;
};

const getCache = (languageCode) => {
  if (translationCaches.has(languageCode)) return translationCaches.get(languageCode);
  const cache = new Map();
  try {
    Object.entries(JSON.parse(localStorage.getItem(`forge_ui_translation_cache_${languageCode}`) || '{}')).forEach(([source, translation]) => {
      if (source && translation) cache.set(source, translation);
    });
  } catch {
    localStorage.removeItem(`forge_ui_translation_cache_${languageCode}`);
  }
  translationCaches.set(languageCode, cache);
  return cache;
};

const persistCache = (languageCode) => {
  const cache = getCache(languageCode);
  localStorage.setItem(`forge_ui_translation_cache_${languageCode}`, JSON.stringify(Object.fromEntries(cache.entries())));
};

const shouldAutoTranslate = (value) => {
  const text = value.trim();
  return text.length > 1
    && text.length <= 220
    && /[A-Za-z]/.test(text)
    && !/^https?:\/\//i.test(text)
    && !/^[\w.-]+@[\w.-]+\.\w+$/.test(text)
    && !/^[\d\s.,:%$£€¥()+\-/]+$/.test(text);
};

const flushPendingTranslations = () => {
  flushTimer = null;
  const jobs = Array.from(pendingTranslations.entries()).map(([languageCode, sources]) => [languageCode, Array.from(sources).slice(0, 80)]);
  pendingTranslations.clear();

  jobs.forEach(([languageCode, texts]) => {
    if (!texts.length) return;
    base44.functions.invoke('translateUiBatch', { language_code: languageCode, texts }).then((response) => {
      const cache = getCache(languageCode);
      Object.entries(response.data?.translations || {}).forEach(([source, translation]) => {
        if (source && translation) cache.set(source, translation);
      });
      persistCache(languageCode);
      refreshTranslations();
    });
  });
};

const queueAutoTranslation = (source, languageCode) => {
  if (languageCode === 'en' || !shouldAutoTranslate(source)) return;
  const cache = getCache(languageCode);
  if (cache.has(source)) return;
  if (!pendingTranslations.has(languageCode)) pendingTranslations.set(languageCode, new Set());
  pendingTranslations.get(languageCode).add(source);
  if (!flushTimer) flushTimer = setTimeout(flushPendingTranslations, 250);
};

const translateText = (value, dictionary) => {
  const trimmed = value.trim();
  if (!trimmed) return value;

  const languageCode = getLanguageCode();
  const cached = getCache(languageCode).get(trimmed);
  if (cached) return value.replace(trimmed, cached);

  let translated = value;
  if (dictionary?.[trimmed]) {
    translated = value.replace(trimmed, dictionary[trimmed]);
  } else if (dictionary) {
    Object.entries(dictionary)
      .sort((a, b) => b[0].length - a[0].length)
      .forEach(([source, target]) => {
        translated = translated.replaceAll(source, target);
      });
  }

  queueAutoTranslation(trimmed, languageCode);
  return translated;
};

const getNextTranslationState = (currentValue, previousState, dictionary) => {
  let source = previousState?.source || currentValue;

  if (previousState && currentValue !== previousState.translated && currentValue !== previousState.source) {
    source = currentValue;
  }

  const translated = translateText(source, dictionary);
  return { source, translated };
};

const translateAttributes = (dictionary) => {
  document.querySelectorAll('[placeholder], [aria-label], [title]').forEach((element) => {
    const saved = attributeState.get(element) || {};

    translatableAttributes.forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (!value) return;

      const next = getNextTranslationState(value, saved[attribute], dictionary);
      saved[attribute] = next;

      if (value !== next.translated) {
        element.setAttribute(attribute, next.translated);
      }
    });

    attributeState.set(element, saved);
  });
};

const translatePage = () => {
  if (!document.body) return;
  const dictionary = getDictionary();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ignoredTags.has(parent.tagName) || parent.closest('[data-no-translate="true"]')) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    const next = getNextTranslationState(node.nodeValue, textState.get(node), dictionary);
    textState.set(node, next);

    if (node.nodeValue !== next.translated) {
      node.nodeValue = next.translated;
    }
  });

  translateAttributes(dictionary);
};

export default function GlobalUiTranslator() {
  useEffect(() => {
    let frame;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(translatePage);
    };

    refreshTranslations = schedule;
    schedule();
    window.addEventListener('forge-global-experience-change', schedule);
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: translatableAttributes,
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('forge-global-experience-change', schedule);
      if (refreshTranslations === schedule) refreshTranslations = () => {};
    };
  }, []);

  return null;
}
