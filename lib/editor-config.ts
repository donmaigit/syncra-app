import { 
  Type, Image as ImageIcon, Video, Square, Layout, 
  List, DollarSign, CheckSquare, HelpCircle, ShieldCheck, 
  Menu, MousePointer, MoreHorizontal, Clock, Calendar, ShoppingBag,
  Columns, AlignJustify, Percent, Share2, Send, TextCursorInput, Minus, Maximize, Star, Landmark, FileText,
  PanelTop
} from "lucide-react";

export type BlockType = 
  // Atoms
  | 'text' | 'headline' | 'image' | 'video' | 'button' | 'button_atom' | 'divider' | 'spacer' | 'icon' | 'bulleted_list'
  | 'input_field' | 'checkbox' | 'submit_button' | 'progress_bar' | 'social_share'
  // Sections
  | 'hero' | 'cta' | 'features' | 'pricing' | 'testimonials' | 'faq' 
  | 'steps' | 'footer' | 'navbar' | 'guarantee' | 'countdown' | 'tokusho_ho'
  // Layouts
  | 'columns_1' | 'columns_2' | 'columns_3' | 'columns_4'
  // Widgets
  | 'optin_form' | 'event_booking' | 'checkout';

export interface Block {
  id: string;
  type: BlockType;
  content: any;
  styles?: any;
  funnelId?: string;
}

export const getBlockDefinitions = (locale: string) => {
  const isJa = locale === 'ja';

  return [
    // ============================================================
    // TAB 1: ELEMENTS
    // ============================================================
    { 
      tab: 'elements', category: isJa ? '基本' : 'Basic',
      type: 'headline', labelKey: isJa ? '見出し' : 'Headline', icon: Type, 
      defaultContent: { text: isJa ? '魅力的な見出し' : 'Catchy Headline', level: 'h2' } 
    },
    { 
      tab: 'elements', category: isJa ? '基本' : 'Basic',
      type: 'text', labelKey: isJa ? 'テキスト' : 'Paragraph', icon: AlignJustify, 
      defaultContent: { text: isJa ? 'ここに本文を入力...' : 'Start typing here...' } 
    },
    { 
      tab: 'elements', category: isJa ? '基本' : 'Basic',
      type: 'bulleted_list', labelKey: isJa ? '箇条書き' : 'Bullet List', icon: List, 
      defaultContent: { items: ['Benefit 1', 'Benefit 2', 'Benefit 3'] } 
    },
    { 
      tab: 'elements', category: isJa ? '基本' : 'Basic',
      type: 'button_atom', labelKey: isJa ? 'ボタン' : 'Button', icon: MousePointer, 
      defaultContent: { text: isJa ? 'クリック' : 'Click Here', url: '#' } 
    },
    { 
      tab: 'elements', category: isJa ? 'メディア' : 'Media',
      type: 'image', labelKey: isJa ? '画像' : 'Image', icon: ImageIcon, 
      defaultContent: { url: '', alt: 'Image' } 
    },
    { 
      tab: 'elements', category: isJa ? 'メディア' : 'Media',
      type: 'video', labelKey: isJa ? '動画' : 'Video', icon: Video, 
      defaultContent: { url: '' } 
    },
    { 
      tab: 'elements', category: isJa ? 'レイアウト' : 'Layout',
      type: 'divider', labelKey: isJa ? '区切り線' : 'Divider', icon: Minus, 
      defaultContent: { thickness: 1, color: '#e2e8f0' } 
    },
    { 
      tab: 'elements', category: isJa ? 'レイアウト' : 'Layout',
      type: 'spacer', labelKey: isJa ? 'スペーサー' : 'Spacer', icon: Maximize, 
      defaultContent: { height: 50 } 
    },
    { 
      tab: 'elements', category: isJa ? 'フォーム' : 'Form',
      type: 'input_field', labelKey: isJa ? '入力欄' : 'Input', icon: TextCursorInput, 
      defaultContent: { label: 'Name', placeholder: 'Enter name...', inputType: 'text' } 
    },
    { 
      tab: 'elements', category: isJa ? 'フォーム' : 'Form',
      type: 'submit_button', labelKey: isJa ? '送信ボタン' : 'Submit Btn', icon: Send, 
      defaultContent: { text: 'Submit', width: 'full' } 
    },
    { 
      tab: 'elements', category: isJa ? 'マーケティング' : 'Marketing',
      type: 'progress_bar', labelKey: isJa ? '進捗バー' : 'Progress', icon: Percent, 
      defaultContent: { percent: 50, color: "#9333ea" } 
    },
    { 
      tab: 'elements', category: isJa ? 'マーケティング' : 'Marketing',
      type: 'social_share', labelKey: isJa ? 'SNSシェア' : 'Social Share', icon: Share2, 
      defaultContent: { platforms: { facebook: true, twitter: true, line: true } } 
    },

    // ============================================================
    // TAB 2: BLOCKS
    // ============================================================
    
    // --- HEADER / FOOTER GROUP ---
    { 
      tab: 'blocks', 
      category: 'HEADER / FOOTER', 
      type: 'navbar', 
      labelKey: isJa ? 'ナビバー' : 'Navbar', 
      icon: PanelTop, 
      defaultContent: { 
        logoType: 'text', 
        logoText: 'LOGO', 
        logoImage: '', 
        links: [{text:'Home', url:'#'}, {text:'Contact', url:'#'}] 
      }
    },
    { 
      tab: 'blocks', 
      category: 'HEADER / FOOTER',
      type: 'footer', 
      labelKey: isJa ? 'フッター' : 'Footer', 
      icon: Layout, 
      defaultContent: { 
        copyright: "Copyright © 2025 · Syncra Inc. · All Rights Reserved.", 
        links: [{text:'Privacy', url:'#'}, {text:'Terms', url:'#'}] 
      }
    },

    // --- SECTIONS ---
    { 
      tab: 'blocks', category: isJa ? 'ヘッダー' : 'Hero',
      type: 'hero', labelKey: 'Hero Section', icon: Layout, 
      defaultContent: { title: 'Big Headline', subtitle: 'Subtext...', buttonText: 'Get Started' }
    },
    { 
      tab: 'blocks', category: isJa ? 'ヘッダー' : 'Hero',
      type: 'cta', labelKey: isJa ? 'CTA (アクション)' : 'Call to Action', icon: MousePointer, 
      defaultContent: { title: "Ready to Start?", subtitle: "Join thousands of others today.", buttonText: "Join Now", buttonUrl: "#" }
    },

    { 
      tab: 'blocks', category: isJa ? 'コンテンツ' : 'Content',
      type: 'features', labelKey: isJa ? '特徴 (3列)' : 'Features (3 Col)', icon: Layout, 
      defaultContent: { 
        title: 'Our Features', 
        items: [
          {title: 'Feature 1', desc: 'Description for feature 1.'},
          {title: 'Feature 2', desc: 'Description for feature 2.'},
          {title: 'Feature 3', desc: 'Description for feature 3.'}
        ] 
      }
    },
    { 
      tab: 'blocks', category: isJa ? 'コンテンツ' : 'Content',
      type: 'pricing', labelKey: isJa ? '料金表' : 'Pricing', icon: DollarSign, 
      defaultContent: { 
        title: 'Simple Pricing', 
        plans: [
          {name: 'Starter', price: '¥1,000', button: 'Choose'},
          {name: 'Pro', price: '¥5,000', button: 'Choose', highlight: true},
          {name: 'Enterprise', price: '¥10,000', button: 'Contact'}
        ] 
      }
    },
    { 
      tab: 'blocks', category: isJa ? 'コンテンツ' : 'Content',
      type: 'faq', labelKey: 'FAQ', icon: HelpCircle, 
      defaultContent: { 
        title: "Frequently Asked Questions", 
        items: [
          { q: "What is your return policy?", a: "We offer a 30-day money-back guarantee." },
          { q: "Do you support shipping?", a: "Yes, we ship worldwide." },
          { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time." }
        ] 
      }
    },
    { 
      tab: 'blocks', category: isJa ? 'ソーシャル' : 'Social',
      type: 'testimonials', labelKey: isJa ? 'お客様の声' : 'Testimonials', icon: Star, 
      defaultContent: { 
        title: "What People Say", 
        reviews: [
          { name: "John Doe", text: "This product changed my life! Highly recommended." },
          { name: "Jane Smith", text: "Amazing service and support. 5 stars!" },
          { name: "Mike Johnson", text: "I increased my revenue by 200% using this." }
        ] 
      }
    },

    // --- MARKETING ---
    { 
      tab: 'blocks', category: isJa ? 'マーケティング' : 'Marketing',
      type: 'countdown', labelKey: isJa ? 'タイマー' : 'Timer', icon: Clock, 
      defaultContent: { title: "Offer Ends In", endDate: new Date(Date.now() + 86400000).toISOString() }
    },
    { 
      tab: 'blocks', category: isJa ? 'マーケティング' : 'Marketing',
      type: 'guarantee', labelKey: isJa ? '保証バッジ' : 'Guarantee', icon: ShieldCheck, 
      defaultContent: { title: "30 Days Guarantee", text: "Money back." }
    },
    // LEGAL
    { 
      tab: 'blocks', category: 'Legal',
      type: 'tokusho_ho', labelKey: isJa ? '特定商取引法' : 'Legal Table', icon: FileText, 
      defaultContent: { 
        company: "株式会社サンプル",
        rep: "山田 太郎",
        address: "東京都渋谷区...",
        phone: "03-0000-0000",
        email: "support@example.com",
        price: isJa ? "各商品ページに記載" : "See product page",
        charges: isJa ? "消費税、送料" : "Tax, Shipping",
        payment: isJa ? "クレジットカード、銀行振込" : "Credit Card",
        delivery: isJa ? "決済完了後、即時" : "Immediate upon payment",
        returns: isJa ? "デジタルコンテンツのため原則不可" : "No returns"
      }
    },

    // --- LAYOUTS ---
    { 
      tab: 'blocks', category: isJa ? 'レイアウト' : 'Structure',
      type: 'columns_1', labelKey: isJa ? '1カラム' : '1 Column', icon: Square, 
      defaultContent: { col1: 'Content' }
    },
    { 
      tab: 'blocks', category: isJa ? 'レイアウト' : 'Structure',
      type: 'columns_2', labelKey: isJa ? '2カラム' : '2 Columns', icon: Columns, 
      defaultContent: { col1: 'Left', col2: 'Right' }
    },
    { 
      tab: 'blocks', category: isJa ? 'レイアウト' : 'Structure',
      type: 'columns_3', labelKey: isJa ? '3カラム' : '3 Columns', icon: Layout, 
      defaultContent: { col1: '1', col2: '2', col3: '3' }
    },
    { 
      tab: 'blocks', category: isJa ? 'レイアウト' : 'Structure',
      type: 'columns_4', labelKey: isJa ? '4カラム' : '4 Columns', icon: Layout, 
      defaultContent: { col1: '1', col2: '2', col3: '3', col4: '4' }
    },

    // --- WIDGETS ---
    { 
      tab: 'blocks', 
      category: isJa ? 'ウィジェット' : 'Widgets',
      type: 'optin_form', 
      labelKey: isJa ? '登録フォーム' : 'Optin Form', 
      icon: CheckSquare, 
      defaultContent: { 
        title: "Join Our Newsletter", 
        subtext: "Sign up to get the latest updates.",
        buttonText: "Register Now",
		fields: { showName: true, showPhone: true, showAddress: false, enableZipAutoFill: true, useLineLogin: false }
      }
    },
    { 
      tab: 'blocks', category: isJa ? 'ウィジェット' : 'Widgets',
      type: 'event_booking', labelKey: isJa ? 'イベント / 予約' : 'Events / Calendar', icon: Calendar, 
      defaultContent: { title: "Book a Call" }
    },
    { 
      tab: 'blocks', category: isJa ? 'ウィジェット' : 'Widgets',
      type: 'checkout', labelKey: isJa ? '決済フォーム' : 'Checkout', icon: ShoppingBag, 
      defaultContent: { 
        productName: "Premium Product", 
        price: 9800, 
        buttonText: isJa ? '支払う' : 'Pay Now',
        enableCard: true,
        enableBank: true,
        bankName: isJa ? "〇〇銀行" : "Bank Name", 
        branchName: isJa ? "本店営業部" : "Branch", 
        accountType: isJa ? "普通" : "Savings", 
        accountNumber: "1234567", 
        accountHolder: isJa ? "カ）シンクラ" : "Company Inc.",
        fields: { showAddress: true, enableZipAutoFill: true }
      }
    }
  ];
};