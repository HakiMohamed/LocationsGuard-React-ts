import React, { useState, useRef, useEffect } from 'react';
import { Reservation } from '../../types/reservation.types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Rnd } from 'react-rnd';
import CarrosserieDiagram from '../CarrosserieDiagram';
import { 
  FaPlus, FaMinus, FaFont, FaBold, FaItalic, FaUnderline, 
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify, 
  FaList, FaImage, FaSignature, FaTrash, FaCopy, FaPaste,
  FaDownload, FaTimes, FaUndo, FaRedo, FaPalette, FaFileAlt,
  FaStamp, FaMapMarkerAlt, FaIdCard, FaCalendarAlt, FaMoneyBillWave
} from 'react-icons/fa';

interface ContractEditorProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
}

interface ContractElement {
  id: string;
  type: 'text' | 'image' | 'signature' | 'diagram' | 'table' | 'stamp';
  content: string;
  position: { x: number, y: number };
  size: { width: number, height: number };
  style?: React.CSSProperties;
  page: number; // Page number where the element appears
}

interface Damage {
  x: number;
  y: number;
}

interface TableData {
  rows: number;
  cols: number;
  data: string[][];
}

const ContractEditor: React.FC<ContractEditorProps> = ({ isOpen, onClose, reservation }) => {
  // Basic editor state
  const [logo, setLogo] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState('14px');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [contractElements, setContractElements] = useState<ContractElement[]>([]);
  const [contractTitle, setContractTitle] = useState('عقد إيجار سيارة');
  const [currentElement, setCurrentElement] = useState<string | null>(null);
  const [showToolbox, setShowToolbox] = useState(false);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [textContent, setTextContent] = useState('');
  const [initialDamages, setInitialDamages] = useState<Damage[]>([]);
  const [returnDamages, setReturnDamages] = useState<Damage[]>([]);
  const [activeCarView, setActiveCarView] = useState<'initial' | 'return'>('initial');
  const [documentTheme, setDocumentTheme] = useState<'classic' | 'modern' | 'minimal' | 'moroccan'>('moroccan');
  const [templates, setTemplates] = useState<string[]>(['Standard', 'Premium', 'Économique', 'Marocain']);
  const [selectedTemplate, setSelectedTemplate] = useState('Marocain');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<'fr' | 'ar'>('fr');
  
  // Page handling
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState({ width: '210mm', height: '297mm' }); // A4 by default
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pageMargin, setPageMargin] = useState('15mm');
  
  // Clipboard functionality
  const [clipboard, setClipboard] = useState<ContractElement | null>(null);
  
  // Text formatting
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('right');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderlined, setIsUnderlined] = useState(false);
  
  // Element history for undo/redo
  const [history, setHistory] = useState<ContractElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // References
  const contractRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Initialize contract elements when the reservation changes
  useEffect(() => {
    if (reservation) {
      initializeContractElements();
    }
  }, [reservation]);

  // Focus on textarea when editing text
  useEffect(() => {
    if (editingText && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editingText]);

  // Apply theme when changed
  useEffect(() => {
    applyTheme(documentTheme);
  }, [documentTheme]);

  // Apply template when selected
  useEffect(() => {
    applyTemplate(selectedTemplate);
  }, [selectedTemplate]);
  
  // Save history when elements change
  useEffect(() => {
    if (contractElements.length > 0) {
      // Only save history if there's an actual change (not on initial load)
      if (history.length === 0 || JSON.stringify(contractElements) !== JSON.stringify(history[history.length - 1])) {
        // Remove any future history if we're not at the end
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, [...contractElements]]);
        setHistoryIndex(newHistory.length);
      }
    }
  }, [contractElements]);
  
  // Adjust pageRefs when totalPages changes
  useEffect(() => {
    pageRefs.current = Array(totalPages).fill(null);
  }, [totalPages]);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
        setMobileSidebarOpen(false);
      } else {
        setSidebarCollapsed(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const applyTheme = (theme: 'classic' | 'modern' | 'minimal' | 'moroccan') => {
    switch (theme) {
      case 'classic':
        setFontFamily('Times New Roman');
        setTextColor('#000000');
        setBackgroundColor('#ffffff');
        break;
      case 'modern':
        setFontFamily('Arial');
        setTextColor('#333333');
        setBackgroundColor('#f9f9f9');
        break;
      case 'minimal':
        setFontFamily('Calibri');
        setTextColor('#444444');
        setBackgroundColor('#ffffff');
        break;
      case 'moroccan':
        setFontFamily('Dubai');
        setTextColor('#1F2937');
        setBackgroundColor('#F8FAFC');
        break;
    }
  };

  const applyTemplate = (template: string) => {
    // Apply template-specific styling and content
    switch (template) {
      case 'Premium':
        setContractTitle(language === 'fr' ? 'CONTRAT DE LOCATION PREMIUM' : 'عقد إيجار سيارة فاخرة');
        // Add premium-specific clauses and styling
        break;
      case 'Économique':
        setContractTitle(language === 'fr' ? 'CONTRAT DE LOCATION ÉCONOMIQUE' : 'عقد إيجار سيارة اقتصادية');
        // Add economy-specific clauses and styling
        break;
      case 'Marocain':
        setContractTitle(language === 'fr' ? 'CONTRAT DE LOCATION DE VÉHICULE - MAROC' : 'عقد إيجار سيارة - المغرب');
        setDocumentTheme('moroccan');
        break;
      default:
        setContractTitle(language === 'fr' ? 'CONTRAT DE LOCATION DE VÉHICULE' : 'عقد إيجار سيارة');
        // Restore default content
        break;
    }
    
    // Re-initialize contract with template settings
    initializeContractElements();
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '___';
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
    } catch (error) {
      return '___';
    }
  };

  const formatDateTime = (date: string | Date | undefined) => {
    if (!date) return '___';
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr });
    } catch (error) {
      return '___';
    }
  };

  const getNumberOfDays = (startDate: Date | string | undefined, endDate: Date | string | undefined) => {
    if (!startDate || !endDate) return 0;
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  };

  const initializeContractElements = () => {
    if (!reservation) return;
    
    // Determine if we're using the Moroccan template
    const isMoroccan = selectedTemplate === 'Marocain';
    const isArabic = language === 'ar';
    
    const headerInfo = {
      id: 'header-info',
      type: 'text' as const,
      content: `
        <div class="text-center">
          <h1 class="text-2xl font-bold ${isArabic ? 'font-arabic' : ''}">${contractTitle}</h1>
          <p class="text-sm mt-2">${isArabic ? 'المرجع:' : 'Réf:'} ${reservation._id || '___'}</p>
        </div>
      `,
      position: { x: 50, y: 30 },
      size: { width: 700, height: 80 },
      page: 1,
      style: isArabic ? { direction: 'rtl', textAlign: 'right' } : {},
    };

    const clientInfo = {
      id: 'client-info',
      type: 'text' as const,
      content: `
        <div class="bg-gray-50 p-4 rounded-lg shadow-sm ${isArabic ? 'text-right' : ''}">
          <h3 class="font-bold text-lg bg-${isMoroccan ? 'green-700' : 'gray-800'} text-white p-2 mb-4 rounded ${isArabic ? 'font-arabic' : ''}">
            ${isArabic ? 'المستأجر السائق' : 'CONDUCTEUR LOCATAIRE'}
          </h3>
          <div class="grid grid-cols-2 gap-x-8">
            <div>
              <div class="mb-3">
                <span class="font-semibold">${isArabic ? 'اللقب:' : 'Nom :'}</span> ${reservation.client?.lastName || '___'}
              </div>
              <div class="mb-3">
                <span class="font-semibold">${isArabic ? 'الاسم:' : 'Prénom :'}</span> ${reservation.client?.firstName || '___'}
              </div>
              <div class="mb-3">
                <span class="font-semibold">${isArabic ? 'الهاتف:' : 'Téléphone :'}</span> ${reservation.client?.phoneNumber || '___'}
              </div>
            </div>
            <div>
              <div class="mb-3">
                <span class="font-semibold">${isArabic ? 'العنوان:' : 'Adresse :'}</span> ${reservation.client?.address || '___'}
              </div>
              <div class="mb-3">
                <span class="font-semibold">${isArabic ? 'الرمز البريدي:' : 'Code postal :'}</span> ${reservation.client?.postalCode || '___'}
              </div>
              <div class="mb-3">
                <span class="font-semibold">${isArabic ? 'المدينة:' : 'Ville :'}</span> ${reservation.client?.city || '___'}
              </div>
              <div class="mb-3">
                <span class="font-semibold">${isArabic ? 'البريد الإلكتروني:' : 'Email :'}</span> ${reservation.client?.email || '___'}
              </div>
            </div>
          </div>
          ${isMoroccan ? `
          <div class="mt-3 border-t pt-3">
            <div class="mb-3">
              <span class="font-semibold">${isArabic ? 'رقم بطاقة التعريف الوطنية:' : 'N° CIN :'}</span> ______________________
            </div>
            <div class="mb-3">
              <span class="font-semibold">${isArabic ? 'رقم رخصة القيادة:' : 'N° Permis de conduire :'}</span> ______________________
            </div>
            <div class="mb-3">
              <span class="font-semibold">${isArabic ? 'تاريخ الإصدار:' : 'Date de délivrance :'}</span> ______________________
            </div>
          </div>
          ` : ''}
        </div>
      `,
      position: { x: 50, y: 130 },
      size: { width: 700, height: isMoroccan ? 280 : 220 },
      page: 1,
      style: isArabic ? { direction: 'rtl' } : {},
    };

    const vehicleInfo = {
      id: 'vehicle-info',
      type: 'text' as const,
      content: `
        <div class="bg-gray-50 p-4 rounded-lg shadow-sm ${isArabic ? 'text-right' : ''}">
          <h3 class="font-bold text-lg bg-${isMoroccan ? 'green-700' : 'gray-800'} text-white p-2 mb-4 rounded ${isArabic ? 'font-arabic' : ''}">
            ${isArabic ? 'السيارة' : 'VÉHICULE'}
          </h3>
          <div class="grid grid-cols-2 gap-x-8">
            <div>
              <div class="mb-3">
                <span class="font-semibold">${isArabic ? 'العلامة التجارية:' : 'Marque :'}</span> ${reservation.automobile?.brand || '___'}
              </div>
              <div class="mb-3">
                <span class="font-semibold">${isArabic ? 'الطراز:' : 'Modèle :'}</span> ${reservation.automobile?.model || '___'}
              </div>
              <div class="mb-3">
                <span class="font-semibold">${isArabic ? 'رقم التسجيل:' : 'Immatriculation :'}</span> ${reservation.automobile?.licensePlate || '___'}
              </div>
              <div class="mb-3">
                <span class="font-semibold">${isArabic ? 'عدد الكيلومترات:' : 'Kilométrage :'}</span> ${reservation.automobile?.mileage || '___'} km
              </div>
            </div>
            <div>
              <div class="mb-3">
                <span class="font-semibold">${isArabic ? 'نوع الوقود:' : 'Carburant :'}</span> ${reservation.automobile?.fuelType || '___'}
              </div>
              <div class="mb-3">
                <span class="font-semibold">${isArabic ? 'نوع التأمين:' : 'Type d\'assurance :'}</span> ${reservation.automobile?.insuranceType || '___'}
              </div>
              <div class="mb-3">
                <span class="font-semibold">${isArabic ? 'مبلغ التحمل:' : 'Franchise :'}</span> ${reservation.automobile?.insuranceDeductible || '___'} ${isMoroccan ? 'DH' : '€'}
              </div>
              <div class="mb-3">
                <span class="font-semibold">${isArabic ? 'الضمان:' : 'Caution :'}</span> ${reservation.automobile?.deposit || '___'} ${isMoroccan ? 'DH' : '€'}
              </div>
            </div>
          </div>
          ${isMoroccan ? `
          <div class="mt-3 border-t pt-3">
            <div class="mb-3">
              <span class="font-semibold">${isArabic ? 'رقم الشاسيه:' : 'N° Châssis :'}</span> ______________________
            </div>
            <div class="mb-3">
              <span class="font-semibold">${isArabic ? 'تاريخ أول تسجيل:' : 'Date 1ère immatriculation :'}</span> ______________________
            </div>
          </div>
          ` : ''}
        </div>
      `,
      position: { x: 50, y: isMoroccan ? 430 : 370 },
      size: { width: 700, height: isMoroccan ? 280 : 220 },
      page: 1,
      style: isArabic ? { direction: 'rtl' } : {},
    };

    const rentalPeriod = {
      id: 'rental-period',
      type: 'text' as const,
      content: `
        <div class="bg-gray-50 p-4 rounded-lg shadow-sm ${isArabic ? 'text-right' : ''}">
          <h3 class="font-bold text-lg bg-${isMoroccan ? 'green-700' : 'gray-800'} text-white p-2 mb-4 rounded ${isArabic ? 'font-arabic' : ''}">
            ${isArabic ? 'فترة الإيجار' : 'PÉRIODE DE LOCATION'}
          </h3>
          <div class="grid grid-cols-2 gap-x-8 mb-6">
            <div class="border-r pr-4">
              <h4 class="font-bold mb-3">${isArabic ? 'المغادرة' : 'DÉPART'}</h4>
              <div class="mb-2">
                <span class="font-semibold">${isArabic ? 'التاريخ:' : 'Date :'}</span> ${formatDateTime(reservation.startDate)}
              </div>
              <div class="mb-2">
                <span class="font-semibold">${isArabic ? 'عدد الكيلومترات:' : 'Kilométrage :'}</span> ${reservation.automobile?.mileage || '___'} km
              </div>
              <div class="mb-2">
                <span class="font-semibold">${isArabic ? 'مستوى الوقود:' : 'Niveau carburant :'}</span> ______
              </div>
            </div>
            <div>
              <h4 class="font-bold mb-3">${isArabic ? 'العودة' : 'RETOUR'}</h4>
              <div class="mb-2">
                <span class="font-semibold">${isArabic ? 'التاريخ:' : 'Date :'}</span> ${formatDateTime(reservation.endDate)}
              </div>
              <div class="mb-2">
                <span class="font-semibold">${isArabic ? 'عدد الكيلومترات:' : 'Kilométrage :'}</span> ______
              </div>
              <div class="mb-2">
                <span class="font-semibold">${isArabic ? 'مستوى الوقود:' : 'Niveau carburant :'}</span> ______
              </div>
            </div>
          </div>
          <table class="w-full border-collapse border border-gray-300 overflow-hidden rounded">
            <tr class="bg-gray-100">
              <th class="border border-gray-300 p-2">${isArabic ? 'السعر اليومي' : 'Forfait journalier'}</th>
              <th class="border border-gray-300 p-2">${isArabic ? 'عدد الأيام' : 'Nombre de jours'}</th>
              <th class="border border-gray-300 p-2">${isArabic ? 'المجموع مع الضريبة' : 'Total TTC'}</th>
            </tr>
            <tr class="text-center">
              <td class="border border-gray-300 p-2">${reservation.automobile?.dailyRate || '___'} ${isMoroccan ? 'DH' : '€'}</td>
              <td class="border border-gray-300 p-2">${getNumberOfDays(reservation.startDate, reservation.endDate)}</td>
              <td class="border border-gray-300 p-2">${reservation.totalPrice || '___'} ${isMoroccan ? 'DH' : '€'}</td>
            </tr>
          </table>
          ${isMoroccan ? `
          <div class="mt-4 border-t pt-3">
            <div class="grid grid-cols-2 gap-x-8">
              <div>
                <div class="mb-2">
                  <span class="font-semibold">${isArabic ? 'الكيلومترات المسموح بها:' : 'Kilométrage autorisé :'}</span> ______ km/jour
                </div>
                <div class="mb-2">
                  <span class="font-semibold">${isArabic ? 'تكلفة الكيلومتر الإضافي:' : 'Coût du km supplémentaire :'}</span> ______ DH/km
                </div>
              </div>
              <div>
                <div class="mb-2">
                  <span class="font-semibold">${isArabic ? 'طريقة الدفع:' : 'Mode de paiement :'}</span> ______________________
                </div>
                <div class="mb-2">
                  <span class="font-semibold">${isArabic ? 'مبلغ مدفوع مقدما:' : 'Acompte versé :'}</span> ______ DH
                </div>
              </div>
            </div>
          </div>
          ` : ''}
        </div>
      `,
      position: { x: 50, y: 50 },
      size: { width: 700, height: isMoroccan ? 380 : 300 },
      page: 2,
      style: isArabic ? { direction: 'rtl' } : {},
    };

    const vehicleCondition = {
      id: 'vehicle-condition',
      type: 'text' as const,
      content: `
        <div class="border-2 border-gray-200 rounded-lg p-4 shadow-sm ${isArabic ? 'text-right' : ''}">
          <h3 class="font-bold text-lg mb-3 bg-${isMoroccan ? 'green-700' : 'gray-800'} text-white p-2 rounded ${isArabic ? 'font-arabic' : ''}">
            ${isArabic ? 'حالة السيارة' : 'ÉTAT DU VÉHICULE'}
          </h3>
          <div class="mb-4">
            <table class="w-full border-collapse rounded overflow-hidden">
              <tr class="bg-gray-100">
                <th class="border p-2">${isArabic ? 'العنصر' : 'Élément'}</th>
                <th class="border p-2">${isArabic ? 'الحالة عند المغادرة' : 'État au départ'}</th>
                <th class="border p-2">${isArabic ? 'الحالة عند العودة' : 'État au retour'}</th>
              </tr>
              <tr>
                <td class="border p-2">${isArabic ? 'الهيكل' : 'Carrosserie'}</td>
                <td class="border p-2" contenteditable="true">RAS</td>
                <td class="border p-2" contenteditable="true"></td>
              </tr>
              <tr>
                <td class="border p-2">${isArabic ? 'الإطارات' : 'Pneumatiques'}</td>
                <td class="border p-2" contenteditable="true">${isArabic ? 'حالة جيدة' : 'Bon état'}</td>
                <td class="border p-2" contenteditable="true"></td>
              </tr>
              <tr>
                <td class="border p-2">${isArabic ? 'الداخل' : 'Intérieur'}</td>
                <td class="border p-2" contenteditable="true">${isArabic ? 'نظيف' : 'Propre'}</td>
                <td class="border p-2" contenteditable="true"></td>
              </tr>
              <tr>
                <td class="border p-2">${isArabic ? 'مستوى الوقود' : 'Niveau carburant'}</td>
                <td class="border p-2" contenteditable="true">${isArabic ? 'ممتلئ' : 'Plein'}</td>
                <td class="border p-2" contenteditable="true"></td>
              </tr>
              ${isMoroccan ? `
              <tr>
                <td class="border p-2">${isArabic ? 'الوثائق' : 'Documents'}</td>
                <td class="border p-2" contenteditable="true">${isArabic ? 'كاملة' : 'Complets'}</td>
                <td class="border p-2" contenteditable="true"></td>
              </tr>
              <tr>
                <td class="border p-2">${isArabic ? 'عجلة احتياطية' : 'Roue de secours'}</td>
                <td class="border p-2" contenteditable="true">${isArabic ? 'موجودة' : 'Présente'}</td>
                <td class="border p-2" contenteditable="true"></td>
              </tr>
              <tr>
                <td class="border p-2">${isArabic ? 'طفاية الحريق' : 'Extincteur'}</td>
                <td class="border p-2" contenteditable="true">${isArabic ? 'موجودة' : 'Présent'}</td>
                <td class="border p-2" contenteditable="true"></td>
              </tr>
              <tr>
                <td class="border p-2">${isArabic ? 'مثلث التحذير' : 'Triangle'}</td>
                <td class="border p-2" contenteditable="true">${isArabic ? 'موجود' : 'Présent'}</td>
                <td class="border p-2" contenteditable="true"></td>
              </tr>
              ` : ''}
            </table>
          </div>
        </div>
      `,
      position: { x: 50, y: isMoroccan ? 450 : 370 },
      size: { width: 700, height: isMoroccan ? 400 : 250 },
      page: 2,
      style: isArabic ? { direction: 'rtl' } : {},
    };

    const carrosserieDiagram = {
      id: 'carrosserie-diagram',
      type: 'diagram' as const,
      content: 'diagramme-carrosserie',
      position: { x: 50, y: 50 },
      size: { width: 700, height: 380 },
      page: 3,
    };

    const termsAndConditions = {
      id: 'terms-conditions',
      type: 'text' as const,
      content: `
        <div class="border-2 border-gray-200 rounded-lg p-4 shadow-sm ${isArabic ? 'text-right' : ''}">
          <h3 class="font-bold text-lg mb-3 bg-${isMoroccan ? 'green-700' : 'gray-800'} text-white p-2 rounded ${isArabic ? 'font-arabic' : ''}">
            ${isArabic ? 'الشروط العامة للإيجار' : 'CONDITIONS GÉNÉRALES DE LOCATION'}
          </h3>
          
          <div class="space-y-4">
            <div>
              <h4 class="font-bold">${isArabic ? 'المادة 1 - شروط الإيجار' : 'Article 1 - Conditions requises pour louer'}</h4>
              <p>${isArabic ? 'يجب أن يكون المستأجر قد بلغ 21 عامًا على الأقل وحاصلًا على رخصة قيادة سارية منذ أكثر من سنتين.' : 'Le locataire doit être âgé d\'au moins 21 ans et titulaire d\'un permis de conduire valide depuis plus de 2 ans.'}</p>
            </div>
            
            <div>
              <h4 class="font-bold">${isArabic ? 'المادة 2 - الوثائق المطلوبة' : 'Article 2 - Documents à fournir'}</h4>
              <ul class="list-disc pl-5">
                <li>${isArabic ? 'رخصة قيادة سارية المفعول' : 'Permis de conduire valide'}</li>
                <li>${isArabic ? 'بطاقة التعريف الوطنية' : 'Carte d\'identité nationale'}</li>
                <li>${isArabic ? 'إثبات السكن لا يزيد عن 3 أشهر' : 'Justificatif de domicile de moins de 3 mois'}</li>
                <li>${isArabic ? 'ضمان بقيمة' : 'Caution de'} ${reservation.automobile?.deposit || '___'} ${isMoroccan ? 'DH' : '€'}</li>
              </ul>
            </div>
            
            <div>
              <h4 class="font-bold">${isArabic ? 'المادة 3 - استخدام السيارة' : 'Article 3 - Utilisation du véhicule'}</h4>
              <p>${isArabic ? 'يلتزم المستأجر بما يلي:' : 'Le locataire s\'engage à :'}</p>
              <ul class="list-disc pl-5">
                <li>${isArabic ? 'استخدام السيارة بعناية' : 'Utiliser le véhicule en bon père de famille'}</li>
                <li>${isArabic ? 'عدم التدخين في السيارة' : 'Ne pas fumer dans le véhicule'}</li>
                <li>${isArabic ? 'عدم تأجير السيارة من الباطن' : 'Ne pas sous-louer le véhicule'}</li>
                <li>${isArabic ? 'احترام قانون السير' : 'Respecter le code de la route'}</li>
                ${isMoroccan ? `<li>${isArabic ? 'عدم مغادرة التراب المغربي بالسيارة دون إذن كتابي' : 'Ne pas quitter le territoire marocain avec le véhicule sans autorisation écrite'}</li>` : ''}
              </ul>
            </div>
            
            <div>
              <h4 class="font-bold">${isArabic ? 'المادة 4 - التأمين والمسؤولية' : 'Article 4 - Assurance et responsabilité'}</h4>
              <p>${isArabic ? `السيارة مؤمنة ضد جميع المخاطر مع تحمل قدره ${reservation.automobile?.insuranceDeductible || '___'} ${isMoroccan ? 'درهم' : 'يورو'}.` : `Le véhicule est assuré tous risques avec une franchise de ${reservation.automobile?.insuranceDeductible || '___'} ${isMoroccan ? 'DH' : '€'}.`}</p>
              <p>${isArabic ? 'في حالة وقوع حادث مسؤول، يتحمل المستأجر مبلغ التحمل.' : 'En cas d\'accident responsable, la franchise reste à la charge du locataire.'}</p>
            </div>
            
            ${isMoroccan ? `
            <div>
              <h4 class="font-bold">${isArabic ? 'المادة 5 - القانون المطبق والاختصاص القضائي' : 'Article 5 - Loi applicable et juridiction compétente'}</h4>
              <p>${isArabic ? 'يخضع هذا العقد للقانون المغربي. في حالة نزاع، تكون محاكم المغرب هي المختصة.' : 'Ce contrat est soumis au droit marocain. En cas de litige, les tribunaux du Maroc sont compétents.'}</p>
            </div>
            ` : ''}
          </div>
        </div>
      `,
      position: { x: 50, y: 450 },
      size: { width: 700, height: 500 },
      page: 3,
      style: isArabic ? { direction: 'rtl' } : {},
    };

    const signatures = {
      id: 'signatures',
      type: 'text' as const,
      content: `
        <div class="border-2 border-gray-200 rounded-lg p-4 mt-8 shadow-sm ${isArabic ? 'text-right' : ''}">
          <div class="grid grid-cols-2 gap-8">
            <div>
              <p class="font-bold mb-2">${isArabic ? 'توقيع المستأجر' : 'Signature du locataire'}</p>
              <p class="text-sm italic mb-2">${isArabic ? '"قرأت ووافقت"' : '"Lu et approuvé, bon pour accord"'}</p>
              <div class="border-b-2 border-gray-400 h-20"></div>
            </div>
            <div>
              <p class="font-bold mb-2">${isArabic ? 'توقيع المؤجر' : 'Signature du loueur'}</p>
              <p class="text-sm italic mb-2">${isArabic ? 'عن الشركة' : 'Pour la société'}</p>
              <div class="border-b-2 border-gray-400 h-20"></div>
            </div>
          </div>
        </div>
      `,
      position: { x: 50, y: 50 },
      size: { width: 700, height: 200 },
      page: 4,
      style: isArabic ? { direction: 'rtl' } : {},
    };

    // Add Moroccan official stamp placeholder if using Moroccan template
    const officialStamp = isMoroccan ? {
      id: 'official-stamp',
      type: 'stamp' as const,
      content: 'stamp-placeholder',
      position: { x: 500, y: 270 },
      size: { width: 150, height: 150 },
      page: 4,
    } : null;

    const elements = [
      headerInfo,
      clientInfo,
      vehicleInfo,
      rentalPeriod,
      vehicleCondition,
      carrosserieDiagram,
      termsAndConditions,
      signatures
    ];

    if (officialStamp) {
      elements.push(officialStamp);
    }

    setContractElements(elements);
    setTotalPages(4);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
        
        // Add logo as a draggable element
        if (reader.result) {
          const logoElement: ContractElement = {
            id: 'logo',
            type: 'image',
            content: reader.result as string,
            position: { x: 50, y: 20 },
            size: { width: 120, height: 80 },
            page: 1,
          };
          
          // Remove old logo if exists
          const updatedElements = contractElements.filter(el => el.id !== 'logo');
          setContractElements([...updatedElements, logoElement]);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const addPage = () => {
    setTotalPages(prev => prev + 1);
  };
  
  const removePage = () => {
    if (totalPages > 1) {
      // Check if any elements are on the last page
      const elementsOnLastPage = contractElements.filter(element => element.page === totalPages);
      
      if (elementsOnLastPage.length > 0) {
        if (window.confirm(`Cette page contient ${elementsOnLastPage.length} élément(s). Voulez-vous vraiment la supprimer?`)) {
          // Move elements to previous page or delete them based on user preference
          const shouldMove = window.confirm("Voulez-vous déplacer ces éléments vers la page précédente? Cliquez sur 'Annuler' pour les supprimer.");
          
          if (shouldMove) {
            // Move elements to previous page
            const updatedElements = contractElements.map(element => {
              if (element.page === totalPages) {
                return { ...element, page: totalPages - 1 };
              }
              return element;
            });
            setContractElements(updatedElements);
          } else {
            // Delete elements on the last page
            const filteredElements = contractElements.filter(element => element.page !== totalPages);
            setContractElements(filteredElements);
          }
          
          setTotalPages(prev => prev - 1);
          // If current page was the deleted page, go to previous page
          if (currentPage === totalPages) {
            setCurrentPage(prev => prev - 1);
          }
        }
      } else {
        // No elements on the last page, safe to remove
        setTotalPages(prev => prev - 1);
        // If current page was the deleted page, go to previous page
        if (currentPage === totalPages) {
          setCurrentPage(prev => prev - 1);
        }
      }
    }
  };
  
  const changePage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  const generatePDF = async () => {
    if (!contractRef.current || !reservation) return;

    // Hide resize handles and toolbox during PDF generation
    setCurrentElement(null);
    setShowToolbox(false);

    // Wait a moment for UI to update
    setTimeout(async () => {
      try {
        const pdf = new jsPDF(pageOrientation, 'mm', [
          parseFloat(pageSize.width), 
          parseFloat(pageSize.height)
        ]);
        
        // For each page
        for (let i = 0; i < totalPages; i++) {
          if (pageRefs.current[i]) {
            const canvas = await html2canvas(pageRefs.current[i]!, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: backgroundColor
            });
            
            const imgData = canvas.toDataURL('image/png');
            if (i > 0) {
              pdf.addPage();
            }
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          }
        }
        
        pdf.save(`contrat-location-${reservation._id}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.');
      }
    }, 100);
  };

  const addTextElement = () => {
    const newElement: ContractElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: '<p>Nouveau texte</p>',
      position: { x: 50, y: 150 },
      size: { width: 300, height: 100 },
      page: currentPage,
    };
    
    setContractElements([...contractElements, newElement]);
    setCurrentElement(newElement.id);
    setShowToolbox(true);
  };
  
  const addImageElement = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            const newElement: ContractElement = {
              id: `image-${Date.now()}`,
              type: 'image',
              content: reader.result as string,
              position: { x: 50, y: 150 },
              size: { width: 300, height: 200 },
              page: currentPage,
            };
            
            setContractElements([...contractElements, newElement]);
            setCurrentElement(newElement.id);
            setShowToolbox(true);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };
  
  const addSignatureElement = () => {
    const newElement: ContractElement = {
      id: `signature-${Date.now()}`,
      type: 'signature',
      content: 'Signature',
      position: { x: 50, y: 150 },
      size: { width: 300, height: 150 },
      page: currentPage,
    };
    
    setContractElements([...contractElements, newElement]);
    setCurrentElement(newElement.id);
    setShowToolbox(true);
  };
  
  const addTableElement = () => {
    const rows = 3;
    const cols = 3;
    const tableData: TableData = {
      rows,
      cols,
      data: Array(rows).fill(0).map(() => Array(cols).fill(''))
    };
    
    // Create HTML for table
    const tableHTML = `
      <table class="w-full border-collapse border border-black rounded overflow-hidden">
        ${Array(rows).fill(0).map((_, rowIndex) => `
          <tr>
            ${Array(cols).fill(0).map((_, colIndex) => `
              <td class="border border-black p-2" data-editable="true"></td>
            `).join('')}
          </tr>
        `).join('')}
      </table>
    `;
    
    const newElement: ContractElement = {
      id: `table-${Date.now()}`,
      type: 'table',
      content: tableHTML,
      position: { x: 50, y: 150 },
      size: { width: 500, height: 200 },
      page: currentPage,
    };
    
    setContractElements([...contractElements, newElement]);
    setCurrentElement(newElement.id);
    setShowToolbox(true);
  };
  
  const addDiagramElement = () => {
    const newElement: ContractElement = {
      id: `diagram-${Date.now()}`,
      type: 'diagram',
      content: 'diagramme-carrosserie',
      position: { x: 50, y: 150 },
      size: { width: 500, height: 300 },
      page: currentPage,
    };
    
    setContractElements([...contractElements, newElement]);
    setCurrentElement(newElement.id);
    setShowToolbox(true);
  };

  const addStampElement = () => {
    const newElement: ContractElement = {
      id: `stamp-${Date.now()}`,
      type: 'stamp',
      content: 'stamp-placeholder',
      position: { x: 50, y: 150 },
      size: { width: 150, height: 150 },
      page: currentPage,
    };
    
    setContractElements([...contractElements, newElement]);
    setCurrentElement(newElement.id);
    setShowToolbox(true);
  };
  
  const handleMarkDamage = (x: number, y: number) => {
    if (activeCarView === 'initial') {
      setInitialDamages([...initialDamages, { x, y }]);
    } else {
      setReturnDamages([...returnDamages, { x, y }]);
    }
  };

  const updateElementPosition = (id: string, position: { x: number, y: number }) => {
    setContractElements(elements => 
      elements.map(element => 
        element.id === id ? { ...element, position } : element
      )
    );
  };

  const updateElementSize = (id: string, size: { width: number, height: number }) => {
    setContractElements(elements => 
      elements.map(element => 
        element.id === id ? { ...element, size } : element
      )
    );
  };
  
  const moveElementToPage = (id: string, targetPage: number) => {
    if (targetPage >= 1 && targetPage <= totalPages) {
      setContractElements(elements => 
        elements.map(element => 
          element.id === id ? { ...element, page: targetPage } : element
        )
      );
    }
  };

  const startEditingText = (element: ContractElement) => {
    if (element.type === 'text') {
      // Extract plain text from HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = element.content;
      setTextContent(tempDiv.innerText || tempDiv.textContent || '');
      setEditingText(element.id);
    }
  };

  const saveTextEdit = () => {
    if (editingText) {
      setContractElements(elements => 
        elements.map(element => 
          element.id === editingText 
            ? { ...element, content: `<p>${textContent.replace(/\n/g, '<br/>')}</p>` } 
            : element
        )
      );
      setEditingText(null);
      setTextContent('');
    }
  };

  const deleteElement = (id: string) => {
    setContractElements(elements => elements.filter(element => element.id !== id));
    setCurrentElement(null);
    setShowToolbox(false);
  };

  const updateElementStyle = (id: string, style: React.CSSProperties) => {
    setContractElements(elements => 
      elements.map(element => 
        element.id === id ? { ...element, style: { ...element.style, ...style } } : element
      )
    );
  };
  
  const copyElement = (id: string) => {
    const elementToCopy = contractElements.find(element => element.id === id);
    if (elementToCopy) {
      setClipboard({ ...elementToCopy });
    }
  };
  
  const pasteElement = () => {
    if (clipboard) {
      const newElement: ContractElement = {
        ...clipboard,
        id: `${clipboard.type}-${Date.now()}`,
        position: { x: clipboard.position.x + 20, y: clipboard.position.y + 20 }, // Offset slightly
        page: currentPage, // Paste to current page
      };
      
      setContractElements([...contractElements, newElement]);
      setCurrentElement(newElement.id);
    }
  };
  
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContractElements(history[historyIndex - 1]);
    }
  };
  
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContractElements(history[historyIndex + 1]);
    }
  };
  
  const changeTextFormatting = (formatType: 'bold' | 'italic' | 'underline' | 'align', value?: any) => {
    if (!currentElement) return;
    
    const element = contractElements.find(el => el.id === currentElement);
    if (!element || element.type !== 'text') return;
    
    let updatedStyle: React.CSSProperties = { ...element.style } || {};
    
    switch (formatType) {
      case 'bold':
        setIsBold(!isBold);
        updatedStyle.fontWeight = isBold ? 'normal' : 'bold';
        break;
      case 'italic':
        setIsItalic(!isItalic);
        updatedStyle.fontStyle = isItalic ? 'normal' : 'italic';
        break;
      case 'underline':
        setIsUnderlined(!isUnderlined);
        updatedStyle.textDecoration = isUnderlined ? 'none' : 'underline';
        break;
      case 'align':
        setTextAlign(value);
        updatedStyle.textAlign = value;
        break;
    }
    
    updateElementStyle(currentElement, updatedStyle);
  };

  const handleInlineEdit = (elementId: string, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'P' || target.tagName === 'H3' || target.tagName === 'STRONG' || target.tagName === 'SPAN' || target.tagName === 'TD') {
      event.stopPropagation();
      const currentText = target.innerText;
      const input = document.createElement('input');
      input.value = currentText;
      input.className = 'w-full p-1 border rounded';
      
      input.onblur = () => {
        const newText = input.value;
        if (target.tagName === 'STRONG') {
          target.innerHTML = newText;
        } else {
          target.innerText = newText;
        }
        
        setContractElements(elements =>
          elements.map(element => {
            if (element.id === elementId) {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = element.content;
              const elementToUpdate = tempDiv.querySelector(target.tagName.toLowerCase());
              if (elementToUpdate) {
                if (target.tagName === 'STRONG') {
                  elementToUpdate.innerHTML = newText;
                } else {
                  elementToUpdate.textContent = newText;
                }
              }
              return { ...element, content: tempDiv.innerHTML };
            }
            return element;
          })
        );
      };

      input.onkeypress = (e) => {
        if (e.key === 'Enter') {
          input.blur();
        }
      };

      target.innerHTML = '';
      target.appendChild(input);
      input.focus();
    }
  };
  
  const changePageProperties = (property: 'orientation' | 'size' | 'margin', value: any) => {
    switch (property) {
      case 'orientation':
        setPageOrientation(value);
        // Swap width and height if orientation changes
        if ((value === 'landscape' && pageOrientation === 'portrait') || 
            (value === 'portrait' && pageOrientation === 'landscape')) {
          setPageSize({
            width: pageSize.height,
            height: pageSize.width
          });
        }
        break;
      case 'size':
        // Predefined page sizes
        switch (value) {
          case 'a4':
            setPageSize({ width: '210mm', height: '297mm' });
            break;
          case 'a3':
            setPageSize({ width: '297mm', height: '420mm' });
            break;
          case 'letter':
            setPageSize({ width: '215.9mm', height: '279.4mm' });
            break;
          // Add other sizes as needed
        }
        break;
      case 'margin':
        setPageMargin(value);
        break;
    }
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
    // Re-initialize contract with new language
    setTimeout(() => {
      initializeContractElements();
    }, 100);
  };

  if (!isOpen || !reservation) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] mx-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-green-600 to-green-800 text-white rounded-t-lg">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-green-700 mr-2 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <h2 className="text-xl font-bold flex items-center">
              <FaFileAlt className="mr-2" />
              {language === 'fr' ? 'Éditeur de Contrat' : 'محرر العقود'}
            </h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center text-sm shadow-sm"
            >
              {language === 'fr' ? 'العربية' : 'Français'}
            </button>
            <button
              onClick={generatePDF}
              className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm shadow-sm"
            >
              <FaDownload className="mr-1.5" />
              {language === 'fr' ? 'Générer PDF' : 'إنشاء PDF'}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center text-sm shadow-sm"
            >
              <FaTimes className="mr-1.5" />
              {language === 'fr' ? 'Fermer' : 'إغلاق'}
            </button>
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="bg-gray-100 border-b flex flex-wrap overflow-x-auto sticky top-0 z-10">
          {/* Undo/Redo */}
          <div className="flex items-center border-r border-gray-300 px-2 py-1.5">
            <button 
              onClick={undo} 
              className="p-1.5 rounded-md hover:bg-gray-200 transition-colors" 
              title={language === 'fr' ? 'Annuler' : 'تراجع'}
              disabled={historyIndex <= 0}
            >
              <FaUndo className="w-4 h-4 text-gray-700" />
            </button>
            <button 
              onClick={redo} 
              className="p-1.5 rounded-md hover:bg-gray-200 transition-colors ml-1" 
              title={language === 'fr' ? 'Refaire' : 'إعادة'}
              disabled={historyIndex >= history.length - 1}
            >
              <FaRedo className="w-4 h-4 text-gray-700" />
            </button>
          </div>
          
          {/* Font settings */}
          <div className="flex items-center border-r border-gray-300 px-2 py-1.5">
            <select 
              value={fontFamily} 
              onChange={(e) => setFontFamily(e.target.value)}
              className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Calibri">Calibri</option>
              <option value="Dubai">Dubai</option>
              <option value="Scheherazade">Scheherazade</option>
            </select>
            <select 
              value={fontSize} 
              onChange={(e) => setFontSize(e.target.value)}
              className="text-sm border rounded-md px-2 py-1 ml-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="10px">10</option>
              <option value="12px">12</option>
              <option value="14px">14</option>
              <option value="16px">16</option>
              <option value="18px">18</option>
              <option value="24px">24</option>
            </select>
          </div>
          
          {/* Text formatting */}
          <div className="flex items-center border-r border-gray-300 px-2 py-1.5">
            <button 
              onClick={() => changeTextFormatting('bold')} 
              className={`p-1.5 rounded-md hover:bg-gray-200 transition-colors ${isBold ? 'bg-gray-300' : ''}`}
              title={language === 'fr' ? 'Gras' : 'غامق'}
            >
              <FaBold className="w-3.5 h-3.5 text-gray-700" />
            </button>
            <button 
              onClick={() => changeTextFormatting('italic')} 
              className={`p-1.5 rounded-md hover:bg-gray-200 transition-colors ml-1 ${isItalic ? 'bg-gray-300' : ''}`}
              title={language === 'fr' ? 'Italique' : 'مائل'}
            >
              <FaItalic className="w-3.5 h-3.5 text-gray-700" />
            </button>
            <button 
              onClick={() => changeTextFormatting('underline')} 
              className={`p-1.5 rounded-md hover:bg-gray-200 transition-colors ml-1 ${isUnderlined ? 'bg-gray-300' : ''}`}
              title={language === 'fr' ? 'Souligné' : 'مسطر'}
            >
              <FaUnderline className="w-3.5 h-3.5 text-gray-700" />
            </button>
          </div>
          
          {/* Text alignment */}
          <div className="flex items-center border-r border-gray-300 px-2 py-1.5">
            <button 
              onClick={() => changeTextFormatting('align', 'left')} 
              className={`p-1.5 rounded-md hover:bg-gray-200 transition-colors ${textAlign === 'left' ? 'bg-gray-300' : ''}`}
              title={language === 'fr' ? 'Aligner à gauche' : 'محاذاة لليسار'}
            >
              <FaAlignLeft className="w-3.5 h-3.5 text-gray-700" />
            </button>
            <button 
              onClick={() => changeTextFormatting('align', 'center')} 
              className={`p-1.5 rounded-md hover:bg-gray-200 transition-colors ml-1 ${textAlign === 'center' ? 'bg-gray-300' : ''}`}
              title={language === 'fr' ? 'Centrer' : 'توسيط'}
            >
              <FaAlignCenter className="w-3.5 h-3.5 text-gray-700" />
            </button>
            <button 
              onClick={() => changeTextFormatting('align', 'right')} 
              className={`p-1.5 rounded-md hover:bg-gray-200 transition-colors ml-1 ${textAlign === 'right' ? 'bg-gray-300' : ''}`}
              title={language === 'fr' ? 'Aligner à droite' : 'محاذاة لليمين'}
            >
              <FaAlignRight className="w-3.5 h-3.5 text-gray-700" />
            </button>
            <button 
              onClick={() => changeTextFormatting('align', 'justify')} 
              className={`p-1.5 rounded-md hover:bg-gray-200 transition-colors ml-1 ${textAlign === 'justify' ? 'bg-gray-300' : ''}`}
              title={language === 'fr' ? 'Justifier' : 'ضبط'}
            >
              <FaAlignJustify className="w-3.5 h-3.5 text-gray-700" />
            </button>
          </div>
          
          {/* Text/Background color */}
          <div className="flex items-center border-r border-gray-300 px-2 py-1.5">
            <div className="flex items-center">
              <span className="text-sm mr-1">{language === 'fr' ? 'Texte:' : 'نص:'}</span>
              <input 
                type="color" 
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-6 h-6 p-0 border rounded-md"
                title={language === 'fr' ? 'Couleur du texte' : 'لون النص'}
              />
            </div>
            <div className="flex items-center ml-2">
              <span className="text-sm mr-1">{language === 'fr' ? 'Fond:' : 'خلفية:'}</span>
              <input 
                type="color" 
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-6 h-6 p-0 border rounded-md"
                title={language === 'fr' ? 'Couleur de fond' : 'لون الخلفية'}
              />
            </div>
          </div>
          
          {/* Insert elements */}
          <div className="flex items-center px-2 py-1.5">
            <button 
              onClick={addTextElement} 
              className="p-1.5 rounded-md hover:bg-gray-200 transition-colors flex items-center" 
              title={language === 'fr' ? 'Ajouter du texte' : 'إضافة نص'}
            >
              <FaFont className="w-3.5 h-3.5 text-gray-700 mr-1" />
              <span className="text-sm hidden sm:inline">{language === 'fr' ? 'Texte' : 'نص'}</span>
            </button>
            <button 
              onClick={addTableElement} 
              className="p-1.5 rounded-md hover:bg-gray-200 transition-colors ml-1 flex items-center" 
              title={language === 'fr' ? 'Ajouter un tableau' : 'إضافة جدول'}
            >
              <FaList className="w-3.5 h-3.5 text-gray-700 mr-1" />
              <span className="text-sm hidden sm:inline">{language === 'fr' ? 'Tableau' : 'جدول'}</span>
            </button>
            <button 
              onClick={addImageElement} 
              className="p-1.5 rounded-md hover:bg-gray-200 transition-colors ml-1 flex items-center" 
              title={language === 'fr' ? 'Ajouter une image' : 'إضافة صورة'}
            >
              <FaImage className="w-3.5 h-3.5 text-gray-700 mr-1" />
              <span className="text-sm hidden sm:inline">{language === 'fr' ? 'Image' : 'صورة'}</span>
            </button>
            <button 
              onClick={addSignatureElement} 
              className="p-1.5 rounded-md hover:bg-gray-200 transition-colors ml-1 flex items-center" 
              title={language === 'fr' ? 'Ajouter un champ de signature' : 'إضافة حقل توقيع'}
            >
              <FaSignature className="w-3.5 h-3.5 text-gray-700 mr-1" />
              <span className="text-sm hidden sm:inline">{language === 'fr' ? 'Signature' : 'توقيع'}</span>
            </button>
            <button 
              onClick={addStampElement} 
              className="p-1.5 rounded-md hover:bg-gray-200 transition-colors ml-1 flex items-center" 
              title={language === 'fr' ? 'Ajouter un tampon' : 'إضافة ختم'}
            >
              <FaStamp className="w-3.5 h-3.5 text-gray-700 mr-1" />
              <span className="text-sm hidden sm:inline">{language === 'fr' ? 'Tampon' : 'ختم'}</span>
            </button>
          </div>
        </div>
        
        {/* Page control toolbar */}
        <div className="bg-gray-100 border-b p-2 flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-2">
            <button 
              onClick={addPage} 
              className="px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors border border-green-300 flex items-center" 
              title={language === 'fr' ? 'Ajouter une page' : 'إضافة صفحة'}
            >
              <FaPlus className="w-3 h-3 mr-1" />
              <span className="text-sm">{language === 'fr' ? 'Page' : 'صفحة'}</span>
            </button>
            <button 
              onClick={removePage} 
              className="px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors border border-red-300 flex items-center"
              disabled={totalPages <= 1}
              title={language === 'fr' ? 'Supprimer la dernière page' : 'حذف الصفحة الأخيرة'}
            >
              <FaMinus className="w-3 h-3 mr-1" />
              <span className="text-sm">{language === 'fr' ? 'Page' : 'صفحة'}</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-1 my-1 sm:my-0">
            <button 
              onClick={() => changePage(currentPage - 1)} 
              disabled={currentPage <= 1}
              className="p-1 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              title={language === 'fr' ? 'Page précédente' : 'الصفحة السابقة'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <div className="flex items-center bg-white px-3 py-1 rounded-md border">
              <span className="text-sm font-medium">
                {language === 'fr' 
                  ? `Page ${currentPage} sur ${totalPages}` 
                  : `صفحة ${currentPage} من ${totalPages}`}
              </span>
            </div>
            
            <button 
              onClick={() => changePage(currentPage + 1)} 
              disabled={currentPage >= totalPages}
              className="p-1 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              title={language === 'fr' ? 'Page suivante' : 'الصفحة التالية'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-2 flex-wrap">
            <select 
              value={pageOrientation} 
              onChange={(e) => changePageProperties('orientation', e.target.value)}
              className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
              title={language === 'fr' ? 'Orientation de la page' : 'اتجاه الصفحة'}
            >
              <option value="portrait">{language === 'fr' ? 'Portrait' : 'عمودي'}</option>
              <option value="landscape">{language === 'fr' ? 'Paysage' : 'أفقي'}</option>
            </select>
            
            <select 
              onChange={(e) => changePageProperties('size', e.target.value)}
              className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
              title={language === 'fr' ? 'Taille de la page' : 'حجم الصفحة'}
            >
              <option value="a4">A4</option>
              <option value="a3">A3</option>
              <option value="letter">{language === 'fr' ? 'Letter' : 'خطاب'}</option>
            </select>
            
            <select 
              value={pageMargin} 
              onChange={(e) => changePageProperties('margin', e.target.value)}
              className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
              title={language === 'fr' ? 'Marges de la page' : 'هوامش الصفحة'}
            >
              <option value="10mm">{language === 'fr' ? 'Étroites' : 'ضيقة'}</option>
              <option value="15mm">{language === 'fr' ? 'Normales' : 'عادية'}</option>
              <option value="25mm">{language === 'fr' ? 'Larges' : 'واسعة'}</option>
            </select>
          </div>
        </div>

        {/* Main content with sidebar and editor */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - hidden on mobile unless toggled */}
          <div className={`${sidebarCollapsed && !mobileSidebarOpen ? 'hidden' : 'block'} ${mobileSidebarOpen ? 'absolute inset-0 z-20' : 'relative'} md:relative`}>
            <div className={`flex h-full ${mobileSidebarOpen ? 'w-full' : 'w-64 md:w-72'}`}>
              {/* Semi-transparent overlay when mobile sidebar is open */}
              {mobileSidebarOpen && (
                <div 
                  className="bg-black bg-opacity-50 absolute inset-0 z-0" 
                  onClick={() => setMobileSidebarOpen(false)}
                ></div>
              )}
              
              <div className={`bg-gray-50 p-3 overflow-y-auto flex-1 ${mobileSidebarOpen ? 'relative z-10 w-64 shadow-xl' : 'w-full'}`}>
                {/* Close button for mobile */}
                {mobileSidebarOpen && (
                  <button 
                    className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    <FaTimes size={16} />
                  </button>
                )}
                
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h3 className="font-semibold mb-2 text-sm border-b pb-1 flex items-center">
                      <FaPlus className="mr-1.5 text-green-600" />
                      {language === 'fr' ? 'Ajouter des éléments' : 'إضافة عناصر'}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={addTextElement}
                        className="px-2 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center text-sm shadow-sm"
                      >
                        <FaFont className="mr-1.5" />
                        {language === 'fr' ? 'Texte' : 'نص'}
                      </button>
                      <button
                        onClick={addImageElement}
                        className="px-2 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center text-sm shadow-sm"
                      >
                        <FaImage className="mr-1.5" />
                        {language === 'fr' ? 'Image' : 'صورة'}
                      </button>
                      <button
                        onClick={addSignatureElement}
                        className="px-2 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center text-sm shadow-sm"
                      >
                        <FaSignature className="mr-1.5" />
                        {language === 'fr' ? 'Signature' : 'توقيع'}
                      </button>
                      <button
                        onClick={addTableElement}
                        className="px-2 py-1.5 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center justify-center text-sm shadow-sm"
                      >
                        <FaList className="mr-1.5" />
                        {language === 'fr' ? 'Tableau' : 'جدول'}
                      </button>
                      <button
                        onClick={addDiagramElement}
                        className="px-2 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center text-sm shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                        </svg>
                        {language === 'fr' ? 'Diagramme' : 'رسم بياني'}
                      </button>
                      <button
                        onClick={addStampElement}
                        className="px-2 py-1.5 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center justify-center text-sm shadow-sm"
                      >
                        <FaStamp className="mr-1.5" />
                        {language === 'fr' ? 'Tampon' : 'ختم'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h3 className="font-semibold mb-2 text-sm border-b pb-1 flex items-center">
                      <FaPalette className="mr-1.5 text-green-600" />
                      {language === 'fr' ? 'Style et apparence' : 'النمط والمظهر'}
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {language === 'fr' ? 'Thème' : 'السمة'}
                        </label>
                        <select 
                          value={documentTheme} 
                          onChange={(e) => setDocumentTheme(e.target.value as 'classic' | 'modern' | 'minimal' | 'moroccan')}
                          className="w-full border p-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="classic">{language === 'fr' ? 'Classique' : 'كلاسيكي'}</option>
                          <option value="modern">{language === 'fr' ? 'Moderne' : 'عصري'}</option>
                          <option value="minimal">{language === 'fr' ? 'Minimaliste' : 'بسيط'}</option>
                          <option value="moroccan">{language === 'fr' ? 'Marocain' : 'مغربي'}</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {language === 'fr' ? 'Modèle' : 'النموذج'}
                        </label>
                        <select 
                          value={selectedTemplate} 
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          className="w-full border p-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          {templates.map(template => (
                            <option key={template} value={template}>
                              {template === 'Standard' && language === 'ar' ? 'قياسي' : 
                               template === 'Premium' && language === 'ar' ? 'ممتاز' : 
                               template === 'Économique' && language === 'ar' ? 'اقتصادي' : 
                               template === 'Marocain' && language === 'ar' ? 'مغربي' : template}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {language === 'fr' ? 'Logo de l\'entreprise' : 'شعار الشركة'}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="w-full text-sm border p-1.5 rounded-md file:mr-2 file:py-1 file:px-2
                                      file:rounded-md file:border-0 file:text-sm file:bg-green-50 file:text-green-700
                                      hover:file:bg-green-100 focus:outline-none"
                        />
                        {logo && (
                          <div className="mt-2 p-1 border rounded-md flex justify-center bg-white">
                            <img src={logo || "/placeholder.svg"} alt={language === 'fr' ? 'Logo aperçu' : 'معاينة الشعار'} className="h-12 object-contain" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h3 className="font-semibold mb-2 text-sm border-b pb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M15 11a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1h8a1 1 0 011 1v5z" clipRule="evenodd" />
                      </svg>
                      {language === 'fr' ? 'Notes additionnelles' : 'ملاحظات إضافية'}
                    </h3>
                    <textarea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      className="w-full border p-2 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={3}
                      placeholder={language === 'fr' 
                        ? 'Ajoutez ici des notes complémentaires au contrat...' 
                        : 'أضف هنا ملاحظات تكميلية للعقد...'}
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                    />
                  </div>

                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h3 className="font-semibold mb-2 text-sm border-b pb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                        <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      {language === 'fr' ? 'État de la carrosserie' : 'حالة الهيكل'}
                    </h3>
                    <div className="flex mb-2 border rounded-md overflow-hidden">
                      <button
                        className={`flex-1 py-1.5 text-sm ${activeCarView === 'initial' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                        onClick={() => setActiveCarView('initial')}
                      >
                        {language === 'fr' ? 'Départ' : 'المغادرة'}
                      </button>
                      <button
                        className={`flex-1 py-1.5 text-sm ${activeCarView === 'return' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                        onClick={() => setActiveCarView('return')}
                      >
                        {language === 'fr' ? 'Retour' : 'العودة'}
                      </button>
                    </div>
                    <p className="text-xs mb-2 text-gray-600">
                      {activeCarView === 'initial' 
                        ? (language === 'fr' ? 'Cliquez sur le schéma pour marquer les dommages au départ' : 'انقر على الرسم البياني لتحديد الأضرار عند المغادرة')
                        : (language === 'fr' ? 'Cliquez sur le schéma pour marquer les dommages au retour' : 'انقر على الرسم البياني لتحديد الأضرار عند العودة')}
                    </p>
                    <div className="p-1 border rounded-md mb-2 bg-white">
                      <CarrosserieDiagram 
                        onMarkDamage={handleMarkDamage} 
                        damages={activeCarView === 'initial' ? initialDamages : returnDamages} 
                      />
                    </div>
                    <button
                      className="w-full px-2 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm shadow-sm flex items-center justify-center"
                      onClick={() => activeCarView === 'initial' ? setInitialDamages([]) : setReturnDamages([])}
                    >
                      <FaTrash className="mr-1.5" />
                      {language === 'fr' ? 'Effacer les marqueurs' : 'مسح العلامات'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Editor Area */}
          <div className="flex-1 overflow-hidden flex flex-col relative">
            {/* Toggle sidebar button for non-mobile */}
            <button 
              className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-r-lg p-1.5 shadow-md border border-l-0 focus:outline-none"
              onClick={toggleSidebar}
              title={sidebarCollapsed 
                ? (language === 'fr' ? "Afficher le panneau latéral" : "إظهار اللوحة الجانبية") 
                : (language === 'fr' ? "Masquer le panneau latéral" : "إخفاء اللوحة الجانبية")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-600 transition-transform ${sidebarCollapsed ? '' : 'transform rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Pages area */}
            <div className="flex-1 bg-gray-300 p-4 overflow-auto">
              {/* Page */}
              <div 
                ref={(el) => { 
                  pageRefs.current[currentPage - 1] = el;
                  if (currentPage === 1) contractRef.current = el;
                }} 
                className="mx-auto bg-white shadow-xl rounded-sm relative"
                style={{ 
                  width: pageOrientation === 'portrait' ? '210mm' : '297mm',
                  minHeight: pageOrientation === 'portrait' ? '297mm' : '210mm',
                  padding: pageMargin,
                  fontFamily: fontFamily,
                  fontSize: fontSize,
                  color: textColor,
                  backgroundColor: backgroundColor,
                }}
              >
                {/* Contract title */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold">
                    {contractTitle}
                  </h1>
                  <p className="text-sm mt-1 text-gray-600">Réf: {reservation._id}</p>
                </div>

                {/* Draggable elements - only show elements for current page */}
                {contractElements
                  .filter(element => element.page === currentPage)
                  .map((element) => (
                  <Rnd
                    key={element.id}
                    default={{
                      x: element.position.x,
                      y: element.position.y,
                      width: element.size.width,
                      height: element.size.height
                    }}
                    position={{ x: element.position.x, y: element.position.y }}
                    size={{ width: element.size.width, height: element.size.height }}
                    onDragStop={(e, d) => {
                      updateElementPosition(element.id, { x: d.x, y: d.y });
                    }}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      updateElementSize(element.id, {
                        width: parseInt(ref.style.width),
                        height: parseInt(ref.style.height)
                      });
                      updateElementPosition(element.id, position);
                    }}
                    className={`transition-shadow ${
                      currentElement === element.id 
                        ? 'ring-2 ring-green-500 shadow-lg z-20' 
                        : 'border-transparent hover:ring-1 hover:ring-gray-300 z-10'
                    } rounded-md`}
                    dragHandleClassName="drag-handle"
                    resizeHandleStyles={{
                      bottomRight: {
                        display: currentElement === element.id ? 'block' : 'none',
                        width: '12px',
                        height: '12px',
                        background: '#10b981',
                        borderRadius: '2px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                      }
                    }}
                    enableResizing={{
                      top: false, right: false, bottom: false, left: false, 
                      topRight: false, bottomRight: currentElement === element.id, 
                      bottomLeft: false, topLeft: false
                    }}
                    onClick={() => {
                      setCurrentElement(element.id);
                      setShowToolbox(true);
                    }}
                  >
                    <div className="relative h-full">
                      {/* Drag handle at top */}
                      <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-gray-100 cursor-move flex items-center justify-center opacity-0 hover:opacity-100 rounded-t-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9h8M8 15h8" />
                        </svg>
                      </div>
                      
                      <div 
                        className="h-full w-full p-2 overflow-auto"
                        style={element.style}
                        onClick={(e) => {
                          if (element.type === 'text') {
                            handleInlineEdit(element.id, e);
                          }
                        }}
                      >
                        {editingText === element.id ? (
                          <textarea
                            ref={textareaRef}
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            onBlur={saveTextEdit}
                            className="w-full h-full p-0 border-0 outline-none focus:ring-0 resize-none bg-transparent"
                            style={{
                              fontFamily: fontFamily,
                              fontSize: fontSize,
                              color: textColor,
                              direction: language === 'ar' ? 'rtl' : 'ltr'
                            }}
                          />
                        ) : element.type === 'image' ? (
                          <img src={element.content || "/placeholder.svg"} alt="Image" className="max-w-full max-h-full object-contain" />
                        ) : element.type === 'signature' ? (
                          <div className="p-2 border border-gray-200 rounded-md bg-white">
                            <p className="font-bold text-sm mb-1">{language === 'fr' ? 'Signature:' : 'التوقيع:'}</p>
                            <div className="border-b-2 border-gray-300 h-16 mt-2"></div>
                            <p className="text-xs mt-1 italic text-gray-500">{element.content}</p>
                          </div>
                        ) : element.type === 'diagram' ? (
                          <div className="w-full h-full">
                            <CarrosserieDiagram 
                              onMarkDamage={handleMarkDamage} 
                              damages={activeCarView === 'initial' ? initialDamages : returnDamages} 
                            />
                          </div>
                        ) : element.type === 'stamp' ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="border-4 border-red-600 rounded-full p-4 rotate-12 transform">
                              <div className="text-red-600 font-bold text-center">
                                {language === 'fr' ? 'TAMPON OFFICIEL' : 'ختم رسمي'}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div dangerouslySetInnerHTML={{ __html: element.content }} />
                        )}
                      </div>
                      
                      {/* Element toolbar */}
                      {currentElement === element.id && (
                        <div className="absolute -top-8 right-0 flex bg-white border shadow-sm rounded-t-md overflow-hidden">
                          <button 
                            onClick={() => copyElement(element.id)}
                            className="p-1.5 hover:bg-gray-100 text-gray-700 transition-colors" 
                            title={language === 'fr' ? 'Copier' : 'نسخ'}
                          >
                            <FaCopy className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={() => moveElementToPage(element.id, element.page === totalPages ? 1 : element.page + 1)}
                            className="p-1.5 hover:bg-gray-100 text-gray-700 transition-colors border-l border-r"
                            title={language === 'fr' 
                              ? `Déplacer vers la page ${element.page === totalPages ? '1' : element.page + 1}` 
                              : `نقل إلى الصفحة ${element.page === totalPages ? '1' : element.page + 1}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => deleteElement(element.id)}
                            className="p-1.5 hover:bg-red-100 text-red-600 transition-colors"
                            title={language === 'fr' ? 'Supprimer' : 'حذف'}
                          >
                            <FaTrash className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </Rnd>
                ))}

                {/* Additional notes section at the bottom if content exists */}
                {additionalNotes && currentPage === totalPages && (
                  <div className="absolute bottom-16 left-0 right-0 px-8">
                    <div className="p-3 border border-gray-300 rounded-md bg-gray-50">
                      <p className="font-bold mb-2">{language === 'fr' ? 'Notes additionnelles :' : 'ملاحظات إضافية :'}</p>
                      <p className="whitespace-pre-wrap text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>{additionalNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Toolbox for selected element */}
            {showToolbox && currentElement && (
              <div className="p-2 border-t bg-gray-100 flex items-center justify-between flex-wrap">
                <div className="flex items-center flex-wrap gap-2">
                  <button
                    onClick={() => deleteElement(currentElement)}
                    className="px-2 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center text-sm shadow-sm"
                  >
                    <FaTrash className="h-3 w-3 mr-1.5" />
                    {language === 'fr' ? 'Supprimer' : 'حذف'}
                  </button>
                  
                  <button
                    onClick={() => copyElement(currentElement)}
                    className="px-2 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm shadow-sm"
                  >
                    <FaCopy className="h-3 w-3 mr-1.5" />
                    {language === 'fr' ? 'Copier' : 'نسخ'}
                  </button>
                  
                  <button
                    onClick={pasteElement}
                    className={`px-2 py-1.5 ${clipboard ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} text-white rounded-md transition-colors flex items-center text-sm shadow-sm`}
                    disabled={!clipboard}
                  >
                    <FaPaste className="h-3 w-3 mr-1.5" />
                    {language === 'fr' ? 'Coller' : 'لصق'}
                  </button>
                  
                  {/* Page selector for current element */}
                  <div className="flex items-center">
                    <span className="text-sm mr-1">{language === 'fr' ? 'Page:' : 'صفحة:'}</span>
                    <select 
                      value={contractElements.find(el => el.id === currentElement)?.page || 1}
                      onChange={(e) => moveElementToPage(currentElement, parseInt(e.target.value))}
                      className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {Array.from({ length: totalPages }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Element specific actions */}
                <div className="mt-2 sm:mt-0">
                  {contractElements.find(el => el.id === currentElement)?.type === 'text' && (
                    <button
                      onClick={() => {
                        const element = contractElements.find(el => el.id === currentElement);
                        if (element && element.type === 'text') {
                          startEditingText(element);
                        }
                      }}
                      className="px-2 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center text-sm shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      {language === 'fr' ? 'Éditer le texte' : 'تحرير النص'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractEditor;
