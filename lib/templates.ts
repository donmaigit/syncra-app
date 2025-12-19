// Define types
export interface FunnelTemplate {
  id: string;
  name: string;
  description: string;
  language: 'ja' | 'en';
  category: 'high-ticket' | 'lead-gen' | 'webinar' | 'sales' | 'other';
  thumbnail: string; 
  initialSteps: {
    name: string;
    slug: string;
    type: string;
    content: any[];
  }[];
}

const uuid = () => "blk-" + Math.random().toString(36).substr(2, 9);

// ==========================================
// BLOCK HELPERS
// ==========================================

const heroBlock = (title: string, subtitle: string, btnText: string, url = "#next", bg = '#ffffff', text = '#0f172a') => ({
  id: uuid(), type: 'hero',
  content: { title, subtitle, buttonText: btnText, buttonUrl: btnText ? url : "" },
  styles: { textAlign: 'center', backgroundColor: bg, textColor: text }
});

const videoBlock = (videoId: string, bg = '#ffffff', title = "") => ({
  id: uuid(), type: 'video',
  content: { title, videoId, provider: "youtube" },
  styles: { backgroundColor: bg }
});

const ctaBlock = (title: string, btnText: string, url = "#next", bg = '#ffffff', text = '#0f172a') => ({
  id: uuid(), type: 'cta',
  content: { title, subtitle: "", buttonText: btnText, buttonUrl: url },
  styles: { backgroundColor: bg, textColor: text }
});

const formBlock = (title: string, btnText: string, bg = '#f8fafc', text = '#0f172a') => ({
  id: uuid(), type: 'optin_form',
  content: { title, buttonText: btnText, fields: { showName: true, showPhone: true } },
  styles: { backgroundColor: bg, textColor: text }
});

// ==========================================
// THE TEMPLATE LIBRARY
// ==========================================

export const FUNNEL_TEMPLATES: FunnelTemplate[] = [
  
  // ---------------------------------------------------------------------------
  // 1. HIGH TICKET VSL FUNNEL (PRO VERSION - JA)
  // ---------------------------------------------------------------------------
  {
    id: 'ja-vsl-high-ticket',
    name: 'ハイチケット個別相談 (VSL+審査)',
    description: '【推奨】コーチ・コンサル向け。動画で信頼を構築し、審査制の個別相談へ誘導する高成約ファネル。',
    language: 'ja',
    category: 'high-ticket',
    thumbnail: '/templates/vsl-app-ja.jpg',
    initialSteps: [
      { name: "VSL (動画) ページ", slug: "", type: "page", content: [
          // 1. Hook Headline (PAS Formula)
          heroBlock(
            "集客のために、毎日SNSを更新することに疲れていませんか？", 
            "広告費ゼロ・完全自動で、月商100万円安定させる「3つの仕組み」を初公開。", 
            "", 
            "#next", 
            "#0f172a", // Dark bg
            "#ffffff"  // White text
          ),
          // 2. The Video
          videoBlock("dQw4w9WgXcQ", "#0f172a"),
          // 3. Authority/Profile Section
          { 
            id: uuid(), type: 'features', 
            content: { 
              title: "なぜ、このメソッドが機能するのか？", 
              items: [
                {title: "自動化", desc: "寝ている間もリードを獲得し続ける仕組みを構築します。"},
                {title: "高単価化", desc: "安売り競争から脱却し、あなたの価値を正当に評価してもらう方法。"},
                {title: "再現性", desc: "センスや才能に頼らず、誰でも実践可能なステップバイステップ。"}
              ] 
            }, 
            styles: { backgroundColor: "#ffffff" } 
          },
          // 4. Social Proof
          {
            id: uuid(), type: 'testimonials',
            content: {
              title: "受講生の実績",
              reviews: [
                { name: "佐藤 様 (コンサルタント)", text: "導入からわずか1ヶ月で月商300万を達成しました。以前は1日中DMを送っていましたが、今は向こうから相談が来ます。" },
                { name: "鈴木 様 (コーチ)", text: "セールスが苦手でしたが、この仕組みのおかげで「お願いします」と言われるようになりました。" }
              ]
            },
            styles: { backgroundColor: "#f8fafc" }
          },
          // 5. Call To Action
          ctaBlock("個別相談会の枠には限りがあります", "審査フォームへ進む", "/shinsa", "#0f172a", "#ffffff"),
          { id: uuid(), type: 'footer', content: { copyright: "© 2025 Syncra Inc." }, styles: {} }
      ]},
      
      { name: "審査フォーム", slug: "shinsa", type: "page", content: [
          { id: uuid(), type: 'progress_bar', content: { percent: 50, label: "ステップ 1/2: エントリー情報の入力" }, styles: {} },
          // Urgency
          { id: uuid(), type: 'countdown', content: { title: "今月の募集締め切りまで" }, styles: { backgroundColor: "#ffffff" } },
          { id: uuid(), type: 'headline', content: { text: "無料個別相談エントリー", level: "h2" }, styles: { textAlign: 'center', textColor: '#0f172a' } },
          { id: uuid(), type: 'text', content: { text: "<p style='text-align:center;'>現在、応募多数につき審査制とさせていただいております。<br>本気でビジネスを伸ばしたい方のみ、ご入力ください。</p>" }, styles: {} },
          // Form with Name/Phone enabled
          { id: uuid(), type: 'optin_form', content: { title: "", buttonText: "審査に申し込む", fields: { showName: true, showPhone: true } }, styles: {} },
          { id: uuid(), type: 'footer', content: { copyright: "© 2025 Syncra Inc." }, styles: {} }
      ]},
      
      { name: "日程調整 (サンクス)", slug: "booking", type: "thank_you", content: [
          { id: uuid(), type: 'progress_bar', content: { percent: 100, label: "完了率 100% - 申し込み完了", color: "#22c55e" }, styles: {} },
          { id: uuid(), type: 'headline', content: { text: "エントリーを受け付けました", level: "h1" }, styles: { textAlign: 'center', textColor: '#0f172a' } },
          { id: uuid(), type: 'text', content: { text: "<p style='text-align:center;'>審査に通過された方には、48時間以内に担当者よりご連絡いたします。<br>念のため、以下のカレンダーから面談候補日を仮押さえしてください。</p>" }, styles: {} },
          { id: uuid(), type: 'event_booking', content: { title: "面談希望日を選択する" }, styles: { textColor: '#0f172a' } }
      ]}
    ]
  },

  // ---------------------------------------------------------------------------
  // 2. WEBINAR REGISTRATION
  // ---------------------------------------------------------------------------
  {
    id: 'ja-webinar-reg',
    name: 'ウェビナー登録ページ',
    description: '集客に特化したシンプルな登録ページ。',
    language: 'ja',
    category: 'webinar',
    thumbnail: '/templates/webinar-reg-ja.jpg',
    initialSteps: [
      { name: "登録ページ", slug: "", type: "optin", content: [
          heroBlock("緊急開催！オンライン特別セミナー", "定員になり次第、締め切ります。", "席を確保する", "#000000", "#ffffff"),
          { id: uuid(), type: 'countdown', content: { title: "開始まで残り" }, styles: { backgroundColor: '#000000', textColor: '#ffffff' } },
          formBlock("参加登録はこちら", "今すぐ無料で参加する", "#ffffff", "#0f172a")
      ]},
      { name: "視聴ページ", slug: "watch", type: "page", content: [
          videoBlock("dQw4w9WgXcQ", "#000000", "LIVE配信中")
      ]}
    ]
  },

  // ... (Other templates remain same for brevity, can be upgraded similarly) ...
  {
    id: 'en-vsl-high-ticket',
    name: 'High Ticket VSL Funnel (Qualified)',
    description: 'Video Sales Letter followed by a qualification form to filter high-quality leads.',
    language: 'en',
    category: 'high-ticket',
    thumbnail: '/templates/vsl-app-en.jpg',
    initialSteps: [
      { name: "VSL Page", slug: "", type: "page", content: [
          heroBlock("How to Scale to 7-Figures Without Burnout", "Watch the free training below.", "", "#0f172a", "#ffffff"),
          videoBlock("dQw4w9WgXcQ", "#0f172a"),
          ctaBlock("Ready to Scale?", "Apply Now", "/application", "#ffffff", "#0f172a")
      ]},
      { name: "Application", slug: "application", type: "page", content: [
          { id: uuid(), type: 'progress_bar', content: { percent: 50, label: "50% Complete" }, styles: {} },
          { id: uuid(), type: 'headline', content: { text: "Strategy Session Application", level: "h2" }, styles: { textAlign: 'center', textColor: '#0f172a' } },
          { id: uuid(), type: 'submit_button', content: { text: "Submit Application", width: "full" }, styles: {} }
      ]},
      { name: "Booking Page", slug: "booking", type: "thank_you", content: [
          { id: uuid(), type: 'progress_bar', content: { percent: 100, label: "100% Complete", color: "#22c55e" }, styles: {} },
          { id: uuid(), type: 'headline', content: { text: "Application Received!", level: "h1" }, styles: { textAlign: 'center', textColor: '#0f172a' } },
          { id: uuid(), type: 'event_booking', content: { title: "Select a Time" }, styles: { textColor: '#0f172a' } }
      ]}
    ]
  },
  {
    id: 'en-webinar-reg',
    name: 'Webinar Registration',
    description: 'Clean opt-in page for live or automated webinars.',
    language: 'en',
    category: 'webinar',
    thumbnail: '/templates/webinar-reg-en.jpg',
    initialSteps: [
      { name: "Registration Page", slug: "", type: "optin", content: [
          heroBlock("Free Masterclass: The Future of AI", "Join us live on Thursday at 8 PM EST.", "Save My Spot", "#000000", "#ffffff"),
          { id: uuid(), type: 'countdown', content: { title: "Starting In:" }, styles: { backgroundColor: '#000000', textColor: '#ffffff' } },
          formBlock("Join the Masterclass", "Save My Spot Now")
      ]},
      { name: "Broadcast Room", slug: "watch", type: "page", content: [
          videoBlock("dQw4w9WgXcQ", "#000000", "Live Stream")
      ]}
    ]
  },
  {
    id: 'ja-ebook-dl',
    name: 'リード獲得 (電子書籍)',
    description: '電子書籍やホワイトペーパーの配布に最適な構成。',
    language: 'ja',
    category: 'lead-gen',
    thumbnail: '/templates/ebook-dl-ja.jpg',
    initialSteps: [
      { name: "オプトインページ", slug: "", type: "optin", content: [
          heroBlock("【無料公開】売上を2倍にする「3つの秘訣」", "期間限定。今すぐPDFレポートをダウンロードしてください。", "無料で受け取る", "#ffffff", "#0f172a"),
          { id: uuid(), type: 'image', content: { src: "https://placehold.co/400x500?text=E-Book+Cover", alt: "Book Cover" }, styles: {} },
          formBlock("送付先を入力してください", "レポートを無料で受け取る")
      ]},
      { name: "サンクスページ", slug: "thank-you", type: "thank_you", content: [
          heroBlock("登録ありがとうございます！", "メールボックスをご確認ください。", "", "/dashboard/contacts", "#ffffff", "#0f172a"),
          { id: uuid(), type: 'social_share', content: { platforms: { facebook: true, twitter: true, line: true } }, styles: {} }
      ]}
    ]
  },
  {
    id: 'en-ebook-dl',
    name: 'Lead Magnet (E-Book)',
    description: 'Simple squeeze page to give away a PDF in exchange for an email.',
    language: 'en',
    category: 'lead-gen',
    thumbnail: '/templates/ebook-dl-en.jpg',
    initialSteps: [
      { name: "Squeeze Page", slug: "", type: "optin", content: [
          heroBlock("Get The Ultimate Marketing Checklist", "Download the free PDF guide.", "Download Now", "#ffffff", "#0f172a"),
          { id: uuid(), type: 'image', content: { src: "https://placehold.co/400x500?text=Checklist+Cover", alt: "Book Cover" }, styles: {} },
          formBlock("Enter your details", "Download PDF")
      ]},
      { name: "Thank You", slug: "thank-you", type: "thank_you", content: [
          heroBlock("Check Your Inbox!", "Your free report is waiting.", "", "/dashboard/contacts", "#ffffff", "#0f172a"),
          { id: uuid(), type: 'social_share', content: { platforms: { facebook: true, twitter: true } }, styles: {} }
      ]}
    ]
  },
  {
    id: 'ja-tripwire-funnel',
    name: 'トリップワイヤ型セールス',
    description: '超低価格商品で顧客化し、すぐに高単価商品をオファーする構成。',
    language: 'ja',
    category: 'sales',
    thumbnail: '/templates/tripwire-ja.jpg',
    initialSteps: [
      { name: "オファーページ", slug: "", type: "sales", content: [
          heroBlock("【限定価格】売上を倍増させる戦略ガイド", "本日限り、たった1,000円で完全攻略ガイドを入手。", "今すぐ購入する (¥1,000)", "/checkout", "#ffedd5", "#7c2d12"),
          { id: uuid(), type: 'checkout', content: { title: "購入手続き", price: 1000, productName: "戦略ガイド PDF" }, styles: {} }
      ]},
      { name: "サンクス (アップセル)", slug: "upsell", type: "thank_you", content: [
          heroBlock("購入完了！", "購入者限定の特別オファーがあります。", "限定オファーを見る", "/offer-page")
      ]}
    ]
  },
  {
    id: 'en-tripwire-funnel',
    name: 'Tripwire Sales Funnel',
    description: 'Converts leads into customers with a low-cost, high-value offer followed by an upsell.',
    language: 'en',
    category: 'sales',
    thumbnail: '/templates/tripwire-en.jpg',
    initialSteps: [
      { name: "Offer Page", slug: "", type: "sales", content: [
          heroBlock("Limited Time Offer: The Strategy Guide", "Get the complete guide for just $7.", "Buy Now ($7)", "/checkout", "#ffedd5", "#7c2d12"),
          { id: uuid(), type: 'checkout', content: { title: "Secure Checkout", price: 700, productName: "Strategy Guide PDF" }, styles: {} }
      ]},
      { name: "Upsell Page", slug: "upsell", type: "thank_you", content: [
          heroBlock("Your Order Is Confirmed!", "Wait! Access this one-time exclusive upgrade now.", "Yes, Upgrade Me", "/final-thank-you")
      ]}
    ]
  },
  {
    id: 'ja-challenge-funnel',
    name: '5日間チャレンジ登録',
    description: '参加をコミットさせることで、リードの質を高める構成。',
    language: 'ja',
    category: 'lead-gen',
    thumbnail: '/templates/challenge-ja.jpg',
    initialSteps: [
      { name: "登録ページ", slug: "", type: "optin", content: [
          heroBlock("5日間で売上を倍増させる限定チャレンジ！", "今日から参加登録を受付開始します。", "無料で参加登録", "#ffffff", "#0f172a"),
          { id: uuid(), type: 'features', content: { title: "チャレンジ内容", items: [{title: "Day 1", desc: "戦略策定"}, {title: "Day 2", desc: "集客実践"}] }, styles: {} },
          formBlock("今すぐ参加する", "無料登録")
      ]},
      { name: "詳細サンクス", slug: "thank-you", type: "thank_you", content: [
          heroBlock("登録完了しました！", "詳細をLINEでお送りします。", "LINEで受け取る", "https://line.me")
      ]}
    ]
  },
  {
    id: 'en-challenge-funnel',
    name: '5-Day Challenge Funnel',
    description: 'High-commitment lead generation funnel, usually tied to an external group.',
    language: 'en',
    category: 'lead-gen',
    thumbnail: '/templates/challenge-en.jpg',
    initialSteps: [
      { name: "Registration Page", slug: "", type: "optin", content: [
          heroBlock("The 5-Day Scale Challenge", "Join the free event starting next Monday.", "Register for Free", "#ffffff", "#0f172a"),
          { id: uuid(), type: 'features', content: { title: "Schedule", items: [{title: "Day 1", desc: "Strategy"}, {title: "Day 2", desc: "Traffic"}] }, styles: {} },
          formBlock("Join The Challenge", "Register Now")
      ]},
      { name: "Confirmation", slug: "thank-you", type: "thank_you", content: [
          heroBlock("You're In!", "Check your email for the first steps.", "Go to Dashboard", "/dashboard")
      ]}
    ]
  },
  {
    id: 'ja-service-lp',
    name: 'コンサルティングLP (長文)',
    description: 'サービス内容を深く説明し、信頼性を高めてから直接相談を促す1枚LP。',
    language: 'ja',
    category: 'sales',
    thumbnail: '/templates/long-form-ja.jpg',
    initialSteps: [
      { name: "ランディングページ", slug: "", type: "page", content: [
          heroBlock("あなたのビジネスを次のステージへ。", "トップコンサルタントが無料であなたの課題を診断します。", "無料診断を申し込む", "#0f172a", "#ffffff"),
          { id: uuid(), type: 'text', content: { text: "<p>ここに詳細なプロフィールと実績を入力してください。</p>" }, styles: {} },
          { id: uuid(), type: 'testimonials', content: { title: "お客様の声", reviews: [{name:"田中様", text:"売上が3倍になりました。"}] }, styles: {} },
          ctaBlock("無料診断を申し込む", "今すぐ診断開始", "#0f172a", "#ffffff")
      ]}
    ]
  },
  {
    id: 'en-service-lp',
    name: 'Consulting Sales Landing Page',
    description: 'A single, high-trust page to establish authority and drive direct contact.',
    language: 'en',
    category: 'sales',
    thumbnail: '/templates/long-form-en.jpg',
    initialSteps: [
      { name: "Sales Page", slug: "", type: "page", content: [
          heroBlock("The Expert Strategy You've Been Missing.", "Free 30-minute discovery session.", "Book Your Free Session", "#0f172a", "#ffffff"),
          { id: uuid(), type: 'text', content: { text: "<p>Insert your detailed bio and case studies here.</p>" }, styles: {} },
          { id: uuid(), type: 'testimonials', content: { title: "Client Wins", reviews: [{name:"John D.", text:"Revenue tripled in 3 months."}] }, styles: {} },
          ctaBlock("Book Your Free Session", "Schedule Now", "#0f172a", "#ffffff")
      ]}
    ]
  },
  {
    id: 'ja-shindan-funnel',
    name: '診断/クイズファネル',
    description: '顧客をセグメント化し、最適な商品への誘導やリード情報獲得に活用。',
    language: 'ja',
    category: 'lead-gen',
    thumbnail: '/templates/quiz-ja.jpg',
    initialSteps: [
      { name: "診断開始ページ", slug: "", type: "page", content: [
          heroBlock("あなたはどのタイプ？", "30秒診断で最適なビジネス戦略を無料診断！", "診断をスタート", "#ffffff", "#0f172a"),
          ctaBlock("今すぐスタート", "診断を始める", "#ffffff", "#0f172a")
      ]},
      { name: "結果ページ", slug: "results", type: "page", content: [
          heroBlock("診断結果が確定しました。", "最適な戦略をPDFで受け取るには...", "PDFを無料で受け取る", "#ffffff", "#0f172a"),
          formBlock("結果を受け取る", "送信する")
      ]}
    ]
  },
  {
    id: 'en-quiz-funnel',
    name: 'Quiz/Assessment Funnel',
    description: 'Engages users with a quiz, then captures email for results delivery.',
    language: 'en',
    category: 'lead-gen',
    thumbnail: '/templates/quiz-en.jpg',
    initialSteps: [
      { name: "Quiz Page", slug: "", type: "page", content: [
          heroBlock("What Type of Entrepreneur Are You?", "Take the 30-second assessment to find out.", "Start Quiz", "#ffffff", "#0f172a"),
          ctaBlock("Start Quiz", "Click Here", "#ffffff", "#0f172a")
      ]},
      { name: "Results Page", slug: "results", type: "page", content: [
          heroBlock("Your Results Are Ready.", "Enter your email to get your personalized plan.", "Get My Plan", "#ffffff", "#0f172a"),
          formBlock("Send My Results", "Submit")
      ]}
    ]
  },
  {
    id: 'ja-kiji-lp',
    name: '記事広告型ファネル',
    description: '信頼性と論理性を最大限に高め、直接購入へ誘導する1枚完結型のLP。',
    language: 'ja',
    category: 'other',
    thumbnail: '/templates/article-lp-ja.jpg',
    initialSteps: [
      { name: "記事ページ", slug: "", type: "page", content: [
          { id: uuid(), type: 'headline', content: { text: "【最新】2025年の集客トレンドと対策", level: "h1" }, styles: { textAlign: 'left' } },
          { id: uuid(), type: 'text', content: { text: "<p>あなたのビジネスが成長しない3つの理由について解説します...</p>" }, styles: { textAlign: 'left' } },
          ctaBlock("無料相談を予約する", "無料相談へ", "/booking", "#f0f9ff", "#0f172a")
      ]},
      { name: "予約ページ", slug: "booking", type: "page", content: [
          { id: uuid(), type: 'event_booking', content: { title: "日程を選択する" }, styles: { textColor: '#0f172a' } }
      ]}
    ]
  },
  {
    id: 'en-article-optin',
    name: 'Pre-Sell Article Funnel',
    description: 'Soft-sell approach using educational content to prime the lead for an opt-in.',
    language: 'en',
    category: 'other',
    thumbnail: '/templates/article-lp-en.jpg',
    initialSteps: [
      { name: "Article Page", slug: "", type: "page", content: [
          { id: uuid(), type: 'headline', content: { text: "The 3 Reasons Your Competitors Are Winning", level: "h1" }, styles: { textAlign: 'left' } },
          { id: uuid(), type: 'text', content: { text: "<p>A deep dive into modern marketing failures and how to fix them...</p>" }, styles: { textAlign: 'left' } },
          ctaBlock("Get The Free Checklist", "Download Now", "/download", "#f0f9ff", "#0f172a")
      ]},
      { name: "Optin Page", slug: "download", type: "optin", content: [
          formBlock("Download Your Checklist", "Enter Email")
      ]}
    ]
  },
  {
    id: 'ja-vsl-fast-lp',
    name: 'VSLダイレクトオファー',
    description: '教育動画を見せた後、すぐに予約フォームを表示する最短構成。',
    language: 'ja',
    category: 'high-ticket',
    thumbnail: '/templates/vsl-fast-ja.jpg',
    initialSteps: [
      { name: "VSL & Booking", slug: "", type: "page", content: [
          heroBlock("【最短成功法】30日で結果を出す戦略", "以下の動画で、その秘密を公開。", "日程調整へ", "/booking", "#0f172a", "#ffffff"),
          videoBlock("dQw4w9WgXcQ", "#0f172a")
      ]},
      { name: "予約ページ", slug: "booking", type: "page", content: [
          { id: uuid(), type: 'event_booking', content: { title: "日程を選択する" }, styles: { textColor: '#0f172a' } }
      ]}
    ]
  },
  {
    id: 'en-vsl-fast-lp',
    name: 'VSL Direct Booking',
    description: 'A 2-step funnel: Video and immediate calendar booking on the next page.',
    language: 'en',
    category: 'high-ticket',
    thumbnail: '/templates/vsl-fast-en.jpg',
    initialSteps: [
      { name: "Video & CTA", slug: "", type: "page", content: [
          heroBlock("The 6-Figure System Exposed", "Watch the full breakdown below.", "Book Your Call", "/booking", "#0f172a", "#ffffff"),
          videoBlock("dQw4w9WgXcQ", "#0f172a")
      ]},
      { name: "Booking Page", slug: "booking", type: "page", content: [
          { id: uuid(), type: 'event_booking', content: { title: "Schedule Your Call" }, styles: { textColor: '#0f172a' } }
      ]}
    ]
  },
  {
    id: 'ja-choubun-lp',
    name: '長文セールスLP (購入)',
    description: '信頼性と論理性を最大限に高め、直接購入へ誘導する1枚完結型のLP。',
    language: 'ja',
    category: 'sales',
    thumbnail: '/templates/lfsl-sales-ja.jpg',
    initialSteps: [
      { name: "購入ページ", slug: "", type: "sales", content: [
          heroBlock("【期間限定】人生を変える究極のメソッド", "なぜ今すぐ行動すべきか、全てを公開します。", "今すぐ購入する", "/checkout", "#ffffff", "#0f172a"),
          { id: uuid(), type: 'text', content: { text: "<p>長い説得力のある文章がここに入ります...</p>" }, styles: {} },
          { id: uuid(), type: 'guarantee', content: { title: "30日間返金保証", text: "満足いただけなければ全額返金します。" }, styles: {} },
          ctaBlock("購入を確定する", "購入手続きへ", "/checkout")
      ]}
    ]
  },
  {
    id: 'en-lfsl-sales',
    name: 'Long-Form Sales Letter',
    description: 'High-authority, high-volume text designed to convert cold traffic directly to purchase.',
    language: 'en',
    category: 'sales',
    thumbnail: '/templates/lfsl-sales-en.jpg',
    initialSteps: [
      { name: "Sales Page", slug: "", type: "sales", content: [
          heroBlock("The Blueprint to Financial Freedom", "Scroll down to read the full story.", "Buy The Course", "/checkout", "#ffffff", "#0f172a"),
          { id: uuid(), type: 'text', content: { text: "<p>Long persuasive copy goes here...</p>" }, styles: {} },
          { id: uuid(), type: 'guarantee', content: { title: "30-Day Guarantee", text: "Risk-free purchase." }, styles: {} },
          ctaBlock("I'm Ready to Buy", "Proceed to Checkout", "/checkout")
      ]}
    ]
  }
];