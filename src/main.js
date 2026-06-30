import { AUTH_CONFIG } from './auth-config.js';

const app = document.querySelector('#root');
const STORAGE_KEY = 'bondy.profile.v1';
const LAST_EMAIL_KEY = 'bondy.auth.email.v1';
const SIGNUP_PENDING_KEY = 'bondy.auth.pendingSignup.v1';
const MAP_POSITIONS_KEY = 'bondy.map.positions.v1';
const PENDING_PROFILE_SYNC_KEY = 'bondy.profile.pendingSync.v1';
const COMPANY_CACHE_KEY = 'bondy.company.cache.v1';
const REMOTE_PROFILE_TABLE = 'profiles';
const CONNECTION_REQUEST_TABLE = 'connection_requests';
const COMPANY_TABLE = 'companies';
const PROFILE_PHOTO_BUCKET = 'profile-photos';
const SUPPORT_EMAIL = 'bondy1.app@gmail.com';
const universityOptions = buildUniversityOptions();
const locationOptions = buildLocationOptions();
const companyOptions = buildCompanyOptions();
const savedUser = loadUser();
const authState = {
  client: null,
  configured: Boolean(AUTH_CONFIG.supabaseUrl && AUTH_CONFIG.supabaseAnonKey),
  user: null,
  ready: false
};

const state = {
  screen: savedUser ? 'map' : 'login',
  authMode: 'signin',
  introTab: '申請',
  connectionFilter: 'すべて',
  connectionQuery: '',
  mapMode: 'マップ',
  filter: 'すべて',
  mapCategoryDetail: '',
  mapFilterOpen: false,
  mapQuery: '',
  mapCenter: 'you',
  zoom: 1,
  mapPan: { x: 0, y: 0 },
  overlay: null,
  toast: '',
  handledRequests: {},
  handledConnectToken: '',
  saved: false,
  user: savedUser,
  cloudStatus: savedUser ? 'local' : 'none',
  connections: [],
  requests: [],
  notifications: [],
  mapCenterConnections: {},
  mapNodePositions: loadMapNodePositions(),
  pendingProfilePhotoFile: null,
  pendingProfilePhotoPreview: '',
  cropPointers: new Map(),
  cropDragStart: null,
  cropRaf: null,
  authSubmitting: false
};

const mapInteraction = {
  active: false,
  mode: '',
  node: null,
  pointerId: null,
  startX: 0,
  startY: 0,
  startPanX: 0,
  startPanY: 0,
  startNodeX: 0,
  startNodeY: 0,
  dragged: false,
  pointers: new Map(),
  pinchStartDistance: 0,
  pinchStartZoom: 1,
  pinchStartPanX: 0,
  pinchStartPanY: 0,
  pinchStartCenterX: 0,
  pinchStartCenterY: 0,
  raf: null
};

function buildUniversityOptions() {
  const core = [
    '北海道大学', '北海道教育大学', '室蘭工業大学', '小樽商科大学', '帯広畜産大学', '旭川医科大学', '北見工業大学', '弘前大学', '岩手大学', '東北大学',
    '宮城教育大学', '秋田大学', '山形大学', '福島大学', '茨城大学', '筑波大学', '筑波技術大学', '宇都宮大学', '群馬大学', '埼玉大学',
    '千葉大学', '東京大学', '東京医科歯科大学', '東京外国語大学', '東京学芸大学', '東京農工大学', '東京芸術大学', '東京工業大学', '東京海洋大学', 'お茶の水女子大学',
    '電気通信大学', '一橋大学', '横浜国立大学', '新潟大学', '長岡技術科学大学', '上越教育大学', '富山大学', '金沢大学', '福井大学', '山梨大学',
    '信州大学', '岐阜大学', '静岡大学', '浜松医科大学', '名古屋大学', '愛知教育大学', '名古屋工業大学', '豊橋技術科学大学', '三重大学', '滋賀大学',
    '滋賀医科大学', '京都大学', '京都教育大学', '京都工芸繊維大学', '大阪大学', '大阪教育大学', '神戸大学', '兵庫教育大学', '奈良教育大学', '奈良女子大学',
    '和歌山大学', '鳥取大学', '島根大学', '岡山大学', '広島大学', '山口大学', '徳島大学', '鳴門教育大学', '香川大学', '愛媛大学',
    '高知大学', '九州大学', '九州工業大学', '福岡教育大学', '佐賀大学', '長崎大学', '熊本大学', '大分大学', '宮崎大学', '鹿児島大学',
    '鹿屋体育大学', '琉球大学', '慶應義塾大学', '早稲田大学', '上智大学', '明治大学', '青山学院大学', '立教大学', '中央大学', '法政大学',
    '学習院大学', '成蹊大学', '成城大学', '明治学院大学', '國學院大學', '武蔵大学', '日本大学', '東洋大学', '駒澤大学', '専修大学',
    '東京理科大学', '芝浦工業大学', '東京都市大学', '工学院大学', '東京電機大学', '東京農業大学', '北里大学', '順天堂大学', '昭和大学', '東邦大学',
    '日本医科大学', '東京慈恵会医科大学', '聖路加国際大学', '国際基督教大学', '津田塾大学', '東京女子大学', '日本女子大学', '大妻女子大学', '共立女子大学', '実践女子大学',
    '同志社大学', '立命館大学', '関西大学', '関西学院大学', '京都産業大学', '近畿大学', '甲南大学', '龍谷大学', '大阪工業大学', '摂南大学',
    '関西外国語大学', '同志社女子大学', '京都女子大学', '武庫川女子大学', '神戸女学院大学', '南山大学', '名城大学', '中京大学', '愛知大学', '愛知学院大学',
    '金城学院大学', '椙山女学園大学', '藤田医科大学', '福岡大学', '西南学院大学', '久留米大学', '立命館アジア太平洋大学', '東北学院大学', '北海学園大学', '広島修道大学',
    '札幌医科大学', '公立はこだて未来大学', '青森公立大学', '岩手県立大学', '宮城大学', '秋田県立大学', '国際教養大学', '山形県立保健医療大学', '会津大学', '福島県立医科大学',
    '茨城県立医療大学', '群馬県立女子大学', '高崎経済大学', '前橋工科大学', '埼玉県立大学', '東京都立大学', '横浜市立大学', '神奈川県立保健福祉大学', '新潟県立大学', '長岡造形大学',
    '富山県立大学', '公立小松大学', '石川県立大学', '福井県立大学', '都留文科大学', '山梨県立大学', '長野大学', '長野県立大学', '岐阜県立看護大学', '情報科学芸術大学院大学',
    '静岡県立大学', '静岡文化芸術大学', '愛知県立大学', '愛知県立芸術大学', '名古屋市立大学', '三重県立看護大学', '滋賀県立大学', '京都府立大学', '京都府立医科大学', '大阪公立大学',
    '神戸市外国語大学', '兵庫県立大学', '奈良県立大学', '奈良県立医科大学', '和歌山県立医科大学', '公立鳥取環境大学', '島根県立大学', '岡山県立大学', '県立広島大学', '広島市立大学',
    '尾道市立大学', '山口県立大学', '周南公立大学', '香川県立保健医療大学', '愛媛県立医療技術大学', '高知県立大学', '高知工科大学', '北九州市立大学', '九州歯科大学', '福岡県立大学',
    '福岡女子大学', '長崎県立大学', '熊本県立大学', '大分県立看護科学大学', '宮崎県立看護大学', '宮崎公立大学', '鹿児島県立短期大学', '沖縄県立看護大学', '沖縄県立芸術大学', '名桜大学',
    '大東文化大学', '東海大学', '亜細亜大学', '帝京大学', '国士舘大学', '拓殖大学', '玉川大学', '明星大学', '桜美林大学', '東京経済大学',
    '武蔵野大学', '東京工科大学', '東京造形大学', '多摩美術大学', '武蔵野美術大学', '女子美術大学', '文化学園大学', '駿河台大学', '獨協大学', '文教大学',
    '神奈川大学', '関東学院大学', 'フェリス女学院大学', '鎌倉女子大学', '金沢工業大学', '常葉大学', '愛知淑徳大学', '名古屋外国語大学', '名古屋学院大学', '皇學館大学',
    '佛教大学', '京都橘大学', '京都外国語大学', '大阪経済大学', '大阪産業大学', '大阪学院大学', '桃山学院大学', '神戸学院大学', '神戸女子大学', '兵庫医科大学',
    '岡山理科大学', '安田女子大学', '松山大学', '九州産業大学', '中村学園大学', '熊本学園大学',
    '北海道科学大学', '北海道医療大学', '酪農学園大学', '北星学園大学', '札幌学院大学', '札幌大学', '札幌国際大学', '北翔大学',
    '青森中央学院大学', '八戸学院大学', '盛岡大学', '東北福祉大学', '東北医科薬科大学', '東北工業大学', '東北文化学園大学', '尚絅学院大学',
    'ノースアジア大学', '東北芸術工科大学', '奥羽大学', 'つくば国際大学', '常磐大学', '流通経済大学', '足利大学', '白鴎大学',
    '作新学院大学', '共愛学園前橋国際大学', '群馬医療福祉大学', '城西大学', '埼玉工業大学', '十文字学園女子大学', '日本工業大学', 'ものつくり大学',
    '淑徳大学', '城西国際大学', '千葉工業大学', '千葉商科大学', '麗澤大学', '和洋女子大学', '植草学園大学', '秀明大学',
    '跡見学園女子大学', '江戸川大学', '嘉悦大学', '杏林大学', '恵泉女学園大学', '国立音楽大学', 'こども教育宝仙大学', '産業能率大学',
    '白百合女子大学', '杉野服飾大学', '大正大学', '高千穂大学', '宝塚大学', '東京医療保健大学', '東京音楽大学', '東京家政大学',
    '東京家政学院大学', '東京工芸大学', '東京純心大学', '東京女子医科大学', '東京聖栄大学', '東京成徳大学', '東京富士大学', '東京未来大学',
    '東洋学園大学', '二松学舎大学', '日本体育大学', '日本社会事業大学', '日本獣医生命科学大学', '日本赤十字看護大学', '日本文化大学', 'ルーテル学院大学',
    '相模女子大学', '湘南工科大学', '鶴見大学', '田園調布学園大学', '桐蔭横浜大学', '東洋英和女学院大学', '横浜商科大学', '横浜創英大学',
    '新潟医療福祉大学', '新潟国際情報大学', '新潟薬科大学', '金沢学院大学', '金沢星稜大学', '北陸大学', '仁愛大学', '福井工業大学',
    '山梨学院大学', '松本大学', '岐阜聖徳学園大学', '岐阜医療科学大学', '朝日大学', '中部学院大学', '静岡理工科大学', '聖隷クリストファー大学',
    '常葉大学', '愛知医科大学', '愛知工業大学', '愛知産業大学', '愛知東邦大学', '桜花学園大学', '大同大学', '中部大学',
    '東海学園大学', '豊田工業大学', '名古屋学芸大学', '名古屋経済大学', '名古屋芸術大学', '名古屋産業大学', '日本福祉大学', '人間環境大学',
    '鈴鹿医療科学大学', '四日市大学', '成安造形大学', 'びわこ成蹊スポーツ大学', '大谷大学', '京都医療科学大学', '京都看護大学', '京都光華女子大学',
    '京都精華大学', '京都先端科学大学', '京都美術工芸大学', '京都文教大学', '花園大学', '平安女学院大学', '追手門学院大学', '大阪医科薬科大学',
    '大阪大谷大学', '大阪音楽大学', '大阪観光大学', '大阪経済法科大学', '大阪芸術大学', '大阪国際大学', '大阪商業大学', '大阪樟蔭女子大学',
    '大阪体育大学', '大阪電気通信大学', '大阪人間科学大学', '関西医科大学', '関西福祉科学大学', '四天王寺大学', '阪南大学', '梅花女子大学',
    '森ノ宮医療大学', '大和大学', '芦屋大学', '大手前大学', '関西国際大学', '甲南女子大学', '神戸海星女子学院大学', '神戸芸術工科大学',
    '神戸国際大学', '神戸松蔭大学', '神戸親和大学', '園田学園女子大学', '宝塚医療大学', '姫路大学', '流通科学大学', '天理大学',
    '帝塚山大学', '畿央大学', '奈良学園大学', '高野山大学', '鳥取看護大学', '岡山商科大学', '川崎医科大学', '川崎医療福祉大学',
    '吉備国際大学', '倉敷芸術科学大学', '就実大学', 'ノートルダム清心女子大学', '広島工業大学', '広島国際大学', '広島経済大学', '広島女学院大学',
    '広島文化学園大学', '福山大学', '福山平成大学', '宇部フロンティア大学', '梅光学院大学', '四国大学', '徳島文理大学', '高松大学',
    '松山東雲女子大学', '聖カタリナ大学', '九州共立大学', '九州国際大学', '九州女子大学', '久留米工業大学', '産業医科大学', '純真学園大学',
    '筑紫女学園大学', '日本経済大学', '福岡工業大学', '福岡女学院大学', '西九州大学', '活水女子大学', '長崎国際大学', '長崎純心大学',
    '崇城大学', '尚絅大学', '九州看護福祉大学', '別府大学', '日本文理大学', '南九州大学', '宮崎産業経営大学', '鹿児島国際大学',
    '志學館大学', '第一工科大学', '沖縄大学', '沖縄国際大学'
  ];
  const areas = [
    '北海道', '札幌', '函館', '旭川', '青森', '弘前', '岩手', '盛岡', '宮城', '仙台', '秋田', '山形', '福島', '郡山', '茨城', '水戸',
    '栃木', '宇都宮', '群馬', '高崎', '埼玉', '浦和', '千葉', '柏', '東京', '多摩', '神奈川', '横浜', '川崎', '新潟', '長岡', '富山',
    '石川', '金沢', '福井', '山梨', '甲府', '長野', '松本', '岐阜', '静岡', '浜松', '愛知', '名古屋', '三重', '津', '滋賀', '京都',
    '大阪', '堺', '兵庫', '神戸', '奈良', '和歌山', '鳥取', '島根', '岡山', '広島', '福山', '山口', '徳島', '香川', '高松', '愛媛',
    '松山', '高知', '福岡', '北九州', '久留米', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄', '那覇'
  ];
  const suffixes = ['大学', '学院大学', '国際大学', '工科大学', '情報大学', '医療大学', '看護大学', '医療福祉大学', '経済大学', '産業大学', '文理大学'];
  return [...new Set([...core, ...areas.flatMap((area) => suffixes.map((suffix) => `${area}${suffix}`))])];
}

function buildLocationOptions() {
  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県',
    '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
    '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
    '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県',
    '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];
  const cities = [
    '札幌市', '仙台市', 'さいたま市', '千葉市', '新宿区', '渋谷区', '港区', '世田谷区', '目黒区', '品川区',
    '横浜市', '川崎市', '相模原市', '新潟市', '金沢市', '静岡市', '浜松市', '名古屋市', '京都市', '大阪市',
    '堺市', '神戸市', '岡山市', '広島市', '北九州市', '福岡市', '熊本市', '那覇市'
  ];
  return [...prefectures, ...cities];
}

function buildCompanyOptions() {
  const starterCompanies = `Sony Group^sony.com|Nintendo^nintendo.com|Panasonic^panasonic.com|Hitachi^hitachi.com|NEC^nec.com|Fujitsu^fujitsu.com|NTT^ntt.co.jp|NTT Docomo^docomo.ne.jp|KDDI^kddi.com|SoftBank^softbank.jp|Rakuten^rakuten.com|LINE Yahoo^lycorp.co.jp|Mercari^mercari.com|CyberAgent^cyberagent.co.jp|DeNA^dena.com|GREE^gree.co.jp|DMM^dmm.com|SmartNews^smartnews.com|Money Forward^moneyforward.com|freee^freee.co.jp|Sansan^sansan.com|Plaid^plaid.co.jp|Visional^visional.inc|Wantedly^wantedly.com|Cookpad^cookpad.com|Kakaku.com^kakaku.com|ZOZO^zozo.com|GMO Internet Group^gmo.jp|Mixi^mixi.co.jp|Recruit^recruit.co.jp|Riot Games Japan^riotgames.com|Capcom^capcom.co.jp|Square Enix^square-enix.com|Bandai Namco^bandainamco.co.jp|SEGA^sega.co.jp|Toyota^toyota.com|Honda^honda.com|Nissan^nissan-global.com|Mazda^mazda.com|Subaru^subaru.co.jp|Mitsubishi Motors^mitsubishi-motors.com|Suzuki^suzuki.co.jp|Yamaha Motor^yamaha-motor.com|Denso^denso.com|Bridgestone^bridgestone.com|Fast Retailing^fastretailing.com|Uniqlo^uniqlo.com|Muji^muji.com|Shiseido^shiseido.com|Kao^kao.com|Kirin^kirinholdings.com|Asahi Group^asahigroup-holdings.com|Suntory^suntory.com|Itochu^itochu.co.jp|Mitsubishi Corporation^mitsubishicorp.com|Mitsui & Co.^mitsui.com|Marubeni^marubeni.com|Sumitomo Corporation^sumitomocorp.com|Seven & i Holdings^7andi.com|Aeon^aeon.info|I-ne^i-ne.co.jp|MUFG^mufg.jp|SMBC^smbc.co.jp|Mizuho^mizuho-fg.co.jp|Nomura^nomura.com|Daiwa Securities^daiwa-grp.jp|Japan Airlines^jal.com|ANA^ana.co.jp|Yamato Transport^kuronekoyamato.co.jp|Sagawa Express^sagawa-exp.co.jp|Apple^apple.com|Microsoft^microsoft.com|Google^google.com|Alphabet^abc.xyz|Amazon^amazon.com|Meta^meta.com|Facebook^facebook.com|Instagram^instagram.com|Threads^threads.net|WhatsApp^whatsapp.com|X^x.com|TikTok^tiktok.com|ByteDance^bytedance.com|YouTube^youtube.com|LinkedIn^linkedin.com|OpenAI^openai.com|Anthropic^anthropic.com|Perplexity^perplexity.ai|NVIDIA^nvidia.com|AMD^amd.com|Intel^intel.com|IBM^ibm.com|Oracle^oracle.com|Salesforce^salesforce.com|Adobe^adobe.com|SAP^sap.com|ServiceNow^servicenow.com|Cisco^cisco.com|Dell^dell.com|HP^hp.com|Dropbox^dropbox.com|Box^box.com|Slack^slack.com|Zoom^zoom.us|Notion^notion.so|Figma^figma.com|Canva^canva.com|GitHub^github.com|GitLab^gitlab.com|Atlassian^atlassian.com|Shopify^shopify.com|Stripe^stripe.com|PayPal^paypal.com|Square^squareup.com|Airbnb^airbnb.com|Uber^uber.com|Lyft^lyft.com|Netflix^netflix.com|Spotify^spotify.com|Discord^discord.com|Reddit^reddit.com|Pinterest^pinterest.com|Snap^snap.com|Accenture^accenture.com|Deloitte^deloitte.com|PwC^pwc.com|EY^ey.com|KPMG^kpmg.com|McKinsey & Company^mckinsey.com|Boston Consulting Group^bcg.com|Bain & Company^bain.com|Goldman Sachs^goldmansachs.com|JPMorgan Chase^jpmorganchase.com|Morgan Stanley^morganstanley.com|Bank of America^bankofamerica.com|Citigroup^citigroup.com|Visa^visa.com|Mastercard^mastercard.com|Tesla^tesla.com|BMW^bmw.com|Mercedes-Benz^mercedes-benz.com|Volkswagen^volkswagen.com|Audi^audi.com|Porsche^porsche.com|Hyundai^hyundai.com|Kia^kia.com|BYD^byd.com|Ford^ford.com|General Motors^gm.com|Rivian^rivian.com|Lucid Motors^lucidmotors.com|LVMH^lvmh.com|Dior^dior.com|Louis Vuitton^louisvuitton.com|Chanel^chanel.com|Hermes^hermes.com|Gucci^gucci.com|Prada^prada.com|Nike^nike.com|Adidas^adidas.com|Zara^zara.com|H&M^hm.com|Shein^shein.com|Walmart^walmart.com|Target^target.com|Costco^costco.com|Starbucks^starbucks.com|McDonald's^mcdonalds.com|Coca-Cola^coca-cola.com|PepsiCo^pepsico.com|Nestle^nestle.com|Procter & Gamble^pg.com|Unilever^unilever.com|L'Oreal^loreal.com|Samsung^samsung.com|LG^lg.com|Hybe^hybecorp.com|Naver^naver.com|Kakao^kakaocorp.com|Alibaba^alibaba.com|Tencent^tencent.com|Huawei^huawei.com|Xiaomi^mi.com|Baidu^baidu.com|Meituan^meituan.com|Pinduoduo^pinduoduo.com|Temu^temu.com`
    .split('|')
    .map((entry) => {
      const [name, domain] = entry.split('^');
      return normalizeCompanyOption({ name, label: name, domain });
    });
  const featured = [
    { name: 'Microsoft', label: 'Microsoft', domain: 'microsoft.com', logo: 'microsoft' },
    { name: 'Tesla', label: 'Tesla', domain: 'tesla.com', logo: 'tesla' },
    { name: 'Christian Dior Couture', label: 'Christian Dior Couture', domain: 'dior.com', logo: 'dior' },
    { name: 'Google', label: 'Google', domain: 'google.com', logo: 'google' },
    { name: 'Apple', label: 'Apple', domain: 'apple.com', logo: 'apple' },
    { name: 'Amazon', label: 'Amazon', domain: 'amazon.com', logo: 'amazon' },
    { name: 'Meta', label: 'Meta', domain: 'meta.com', logo: 'meta' },
    { name: 'LINEヤフー', label: 'LINEヤフー', domain: 'lycorp.co.jp', logo: 'lineYahoo' },
    { name: 'サイバーエージェント', label: 'サイバーエージェント', domain: 'cyberagent.co.jp', logo: 'cyberAgent' },
    { name: '楽天グループ', label: '楽天グループ', domain: 'rakuten.com', logo: 'rakuten' },
    { name: 'メルカリ', label: 'メルカリ', domain: 'mercari.com', logo: 'mercari' },
    { name: 'リクルート', label: 'リクルート', domain: 'recruit.co.jp', logo: 'recruit' },
    { name: 'DeNA', label: 'DeNA', domain: 'dena.com', logo: 'dena' },
    { name: 'SmartHR', label: 'SmartHR', domain: 'smarthr.co.jp', logo: 'smarthr' },
    { name: 'LayerX', label: 'LayerX', domain: 'layerx.co.jp', logo: 'layerx' },
    { name: 'Sansan', label: 'Sansan', domain: 'sansan.com', logo: 'sansan' },
    { name: 'freee', label: 'freee', domain: 'freee.co.jp', logo: 'freee' },
    { name: 'note', label: 'note', domain: 'note.com', logo: 'noteCompany' }
  ];
  const merged = [...loadSavedCompanies(), ...featured.map(normalizeCompanyOption), ...starterCompanies];
  return merged
    .filter((company) => !isRemovedCompany(company.name))
    .filter((company, index, list) => list.findIndex((item) => item.name.toLowerCase() === company.name.toLowerCase()) === index);
}

const icons = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4.5-4.5"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  mapPin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  hand: '<path d="M8.6 12.4 5.4 9.2a2.8 2.8 0 0 1 0-4l.2-.2a2.8 2.8 0 0 1 3.9 0l1.4 1.4"/><path d="m15.4 12.4 3.2-3.2a2.8 2.8 0 0 0 0-4l-.2-.2a2.8 2.8 0 0 0-3.9 0l-4.7 4.7a1.8 1.8 0 0 0 2.5 2.5l1.2-1.2"/><path d="m7.5 11.5 5.2 5.2a2 2 0 0 0 2.8 0l.4-.4a2 2 0 0 0 0-2.8l-3.1-3.1"/><path d="m9.2 15.2 2.2 2.2a2 2 0 0 0 2.8 0"/><path d="m6.1 10.1-2.1 2.1 5.9 5.9a2 2 0 0 0 2.8 0l.2-.2"/><path d="m17.9 10.1 2.1 2.1-4.7 4.7"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9 4.6a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1Z"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2 2 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  share: '<path d="M4 12v8h16v-8"/><path d="M12 16V3"/><path d="m7 8 5-5 5 5"/>',
  camera: '<path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3Z"/><circle cx="12" cy="13" r="3"/>',
  grad: '<path d="m22 10-10-5-10 5 10 5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
  brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5h8v2"/><path d="M3 12h18"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  link: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>',
  map: '<path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3Z"/><path d="M9 3v15M15 6v15"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="13" cy="18" r="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  minus: '<path d="M5 12h14"/>',
  home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>',
  flag: '<path d="M5 22V4h12l-1 5 1 5H5"/>',
  heart: '<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21l8.8-8.3a5 5 0 0 0 0-7.1Z"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 15v2"/>',
  userPlus: '<path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="M5.7 5.7 18.3 18.3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-5"/>',
  palette: '<path d="M12 22a10 10 0 1 1 10-10c0 1.7-1.3 3-3 3h-1.8c-.8 0-1.2 1-.7 1.6l.4.5c1.1 1.4.1 3.9-1.8 4.5-1 .3-2 .4-3.1.4Z"/><circle cx="7.5" cy="10.5" r=".7"/><circle cx="10" cy="7.5" r=".7"/><circle cx="14" cy="7.5" r=".7"/><circle cx="16.5" cy="10.5" r=".7"/>',
  document: '<path d="M6 2h9l5 5v15H6Z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  logout: '<path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M14 4h5v16h-5"/>',
  locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.8 1c-.8 1.3-2.4 1.7-2.7 3"/><path d="M12 17h.01"/>',
  building: '<path d="M4 21V5l8-3 8 3v16"/><path d="M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V6a2 2 0 0 1 2-2h10"/>',
  external: '<path d="M15 3h6v6"/><path d="m10 14 11-11"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  qr: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"/><path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.1-1.5 6.1-6.6a5.1 5.1 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.6s-1.1-.3-3.7 1.4a12.8 12.8 0 0 0-6.7 0C6.7 1.4 5.6 1.7 5.6 1.7a4.8 4.8 0 0 0-.1 3.6A5.1 5.1 0 0 0 4.1 9c0 5.1 3.1 6.3 6.1 6.6a3.4 3.4 0 0 0-.9 2.6V22"/>',
  youtube: '<path d="M22 12s0-3.4-.4-5a3 3 0 0 0-2.1-2.1C17.9 4.5 12 4.5 12 4.5s-5.9 0-7.5.4A3 3 0 0 0 2.4 7C2 8.6 2 12 2 12s0 3.4.4 5a3 3 0 0 0 2.1 2.1c1.6.4 7.5.4 7.5.4s5.9 0 7.5-.4a3 3 0 0 0 2.1-2.1c.4-1.6.4-5 .4-5Z"/><path d="m10 15 5-3-5-3Z"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z"/>',
  music: '<path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
  messageCircle: '<path d="M21 12a8 8 0 0 1-8 8H7l-4 2 1.5-4.5A8 8 0 1 1 21 12Z"/>',
  at: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>'
};

function icon(name, size = 24) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
}

function render() {
  app.innerHTML = `${state.screen === 'login' ? loginScreen() : state.screen === 'register' ? registerScreen() : appScreen()}${overlay()}${state.toast ? `<div class="toast">${state.toast}</div>` : ''}`;
}

async function renderMapTransition(update) {
  if (typeof update !== 'function') return render();
  update();
  render();
}

function wait(ms = 0) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function loadUser() {
  return loadStoredUser(STORAGE_KEY);
}

function loadMapNodePositions() {
  try {
    const value = JSON.parse(localStorage.getItem(MAP_POSITIONS_KEY));
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

function saveMapNodePosition(node) {
  if (!node?.id) return;
  state.mapNodePositions[node.id] = { x: node.x, y: node.y };
  localStorage.setItem(MAP_POSITIONS_KEY, JSON.stringify(state.mapNodePositions));
}

function loadStoredUser(key) {
  try {
    const user = JSON.parse(localStorage.getItem(key));
    return user ? normalizeUser(user) : null;
  } catch {
    return null;
  }
}

function saveUserLocal(user) {
  state.user = normalizeUser(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user));
  const key = accountProfileKey();
  if (key) localStorage.setItem(key, JSON.stringify(state.user));
  return state.user;
}

async function saveUser(user, options = {}) {
  const saved = saveUserLocal(user);
  if (options.remote !== false) {
    if (!authState.client || !authState.user) {
      state.cloudStatus = 'local';
      return saved;
    }
    const synced = await saveRemoteUser(saved, options);
    if (synced) {
      clearProfileSyncPending();
    } else {
      markProfileSyncPending(saved);
    }
  }
  return saved;
}

function loadLastEmail() {
  return localStorage.getItem(LAST_EMAIL_KEY) || '';
}

function saveLastEmail(email) {
  const cleanEmail = String(email || '').trim();
  if (cleanEmail) localStorage.setItem(LAST_EMAIL_KEY, cleanEmail);
}

function accountProfileKey() {
  const identity = authState.user?.id || authState.user?.email || '';
  return identity ? `bondy.profile.account.${encodeURIComponent(identity)}.v1` : '';
}

function pendingProfileSyncKey() {
  const identity = authState.user?.id || authState.user?.email || loadLastEmail() || 'guest';
  return `${PENDING_PROFILE_SYNC_KEY}.${encodeURIComponent(identity)}`;
}

function loadPendingProfileSync() {
  return loadStoredUser(pendingProfileSyncKey());
}

function markProfileSyncPending(user) {
  localStorage.setItem(pendingProfileSyncKey(), JSON.stringify(normalizeUser(user)));
  state.cloudStatus = 'pending';
}

function clearProfileSyncPending() {
  localStorage.removeItem(pendingProfileSyncKey());
  state.cloudStatus = authState.user ? 'synced' : 'local';
}

function loadAccountUser() {
  const key = accountProfileKey();
  return key ? loadStoredUser(key) : null;
}

async function loadRemoteUser() {
  if (!authState.client || !authState.user) return null;
  const { data, error } = await authState.client
    .from(REMOTE_PROFILE_TABLE)
    .select('profile')
    .eq('id', authState.user.id)
    .maybeSingle();
  if (error) {
    console.warn('Remote profile load failed', error);
    state.cloudStatus = 'pending';
    return null;
  }
  if (data?.profile) state.cloudStatus = 'synced';
  return data?.profile ? normalizeUser(data.profile) : null;
}

async function saveRemoteUser(user, options = {}) {
  if (!authState.client || !authState.user) return false;
  state.cloudStatus = 'syncing';
  const profile = normalizeUser({
    ...user,
    email: user.email || authState.user.email || ''
  });
  const { error } = await authState.client
    .from(REMOTE_PROFILE_TABLE)
    .upsert({
      id: authState.user.id,
      email: authState.user.email || profile.email,
      handle: profile.handle || authState.user.id,
      profile,
      updated_at: new Date().toISOString()
    });
  if (error) {
    console.warn('Remote profile save failed', error);
    state.cloudStatus = 'pending';
    if (!options.silent) showToast('プロフィールのクラウド保存設定を確認してください');
    return false;
  }
  state.cloudStatus = 'synced';
  return true;
}

async function syncPendingProfile(options = {}) {
  if (!authState.client || !authState.user) return false;
  const pendingUser = loadPendingProfileSync();
  if (!pendingUser) return true;
  saveUserLocal({
    ...pendingUser,
    email: pendingUser.email || authState.user.email || ''
  });
  const synced = await saveRemoteUser(state.user, { ...options, silent: true });
  if (synced) {
    clearProfileSyncPending();
    if (!options.silent) showToast('クラウドに同期しました');
  }
  return synced;
}

function photoFileExtension(file) {
  const byName = String(file?.name || '').split('.').pop()?.toLowerCase();
  if (byName && /^[a-z0-9]{2,5}$/.test(byName)) return byName === 'jpeg' ? 'jpg' : byName;
  const byType = String(file?.type || '').split('/').pop()?.toLowerCase();
  return byType && /^[a-z0-9]{2,5}$/.test(byType) ? (byType === 'jpeg' ? 'jpg' : byType) : 'jpg';
}

async function uploadProfilePhoto(file) {
  if (!file) return '';
  if (!authState.client || !authState.user) return readFileAsDataUrl(file);
  const extension = photoFileExtension(file);
  const path = `${authState.user.id}/avatar.${extension}`;
  const { error } = await authState.client.storage
    .from(PROFILE_PHOTO_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type || 'image/jpeg',
      upsert: true
    });
  if (error) {
    console.warn('Profile photo upload failed', error);
    showToast('写真Storageの設定を確認してください');
    return readFileAsDataUrl(file);
  }
  const { data } = authState.client.storage
    .from(PROFILE_PHOTO_BUCKET)
    .getPublicUrl(path);
  return data?.publicUrl ? `${data.publicUrl}?v=${Date.now()}` : readFileAsDataUrl(file);
}

function profileFromRemoteRow(row) {
  if (!row) return null;
  const profile = normalizeUser(row.profile || {});
  return {
    id: row.id,
    email: row.email || profile.email,
    handle: row.handle || profile.handle,
    profile: {
      ...profile,
      email: profile.email || row.email || '',
      handle: profile.handle || row.handle || ''
    }
  };
}

function connectTokenFromValue(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return url.searchParams.get('connect') || url.pathname.split('/').filter(Boolean).pop() || raw;
  } catch {
    return raw.replace(/^@/, '');
  }
}

async function findProfileByIdOrHandle(value) {
  if (!authState.client || !authState.user) {
    showToast('ログインすると検索できます');
    return null;
  }
  const token = connectTokenFromValue(value);
  if (!token) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token);
  const query = authState.client
    .from(REMOTE_PROFILE_TABLE)
    .select('id,email,handle,profile')
    .limit(1);
  const { data, error } = isUuid
    ? await query.eq('id', token)
    : await query.ilike('handle', token);
  if (error) {
    console.warn('Profile search failed', error);
    showToast('プロフィール検索の設定を確認してください');
    return null;
  }
  const found = profileFromRemoteRow(data?.[0]);
  if (!found) showToast('該当するユーザーが見つかりません');
  return found;
}

async function isHandleAvailable(handle) {
  const cleanHandle = String(handle || '').trim().replace(/^@/, '');
  if (!cleanHandle) return false;
  if (!authState.client || !authState.user) return true;
  const { data, error } = await authState.client
    .from(REMOTE_PROFILE_TABLE)
    .select('id')
    .ilike('handle', cleanHandle)
    .neq('id', authState.user.id)
    .limit(1);
  if (error) {
    console.warn('Handle availability check failed', error);
    showToast('IDの確認に失敗しました。少し時間を置いてください');
    return false;
  }
  if (data?.length) {
    showToast('そのIDはすでに使われています');
    return false;
  }
  return true;
}

async function sendConnectionRequest(targetId, message = '') {
  if (!authState.client || !authState.user) {
    showToast('ログインすると申請できます');
    return false;
  }
  if (!targetId || targetId === authState.user.id) {
    showToast('自分には申請できません');
    return false;
  }
  const cleanMessage = relationshipFromValue(message) || '紹介';
  const { data: existingRows, error: existingError } = await authState.client
    .from(CONNECTION_REQUEST_TABLE)
    .select('id,status')
    .or(`and(requester_id.eq.${authState.user.id},recipient_id.eq.${targetId}),and(requester_id.eq.${targetId},recipient_id.eq.${authState.user.id})`)
    .in('status', ['pending', 'accepted'])
    .limit(1);
  if (existingError) {
    console.warn('Connection duplicate check failed', existingError);
  }
  const existing = existingRows?.[0];
  if (existing?.status === 'accepted') {
    showToast('すでにつながっています');
    return false;
  }
  if (existing?.status === 'pending') {
    const { error: updateError } = await authState.client
      .from(CONNECTION_REQUEST_TABLE)
      .update({ message: cleanMessage, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (!updateError) {
      showToast('申請を更新しました');
      return true;
    }
    console.warn('Connection request update failed', updateError);
  }
  const { error } = await authState.client
    .from(CONNECTION_REQUEST_TABLE)
    .insert({
      requester_id: authState.user.id,
      recipient_id: targetId,
      message: cleanMessage,
      status: 'pending'
    });
  if (error) {
    if (error.code === '23505') {
      const { error: retryError } = await authState.client
        .from(CONNECTION_REQUEST_TABLE)
        .update({
          status: 'pending',
          message: cleanMessage,
          updated_at: new Date().toISOString()
        })
        .eq('requester_id', authState.user.id)
        .eq('recipient_id', targetId);
      if (!retryError) {
        showToast('申請を送信しました');
        return true;
      }
      console.warn('Connection request retry failed', retryError);
      showToast('すでに申請済みです');
      return false;
    }
    console.warn('Connection request failed', error);
    showToast('申請保存の設定を確認してください');
    return false;
  }
  showToast('申請を送信しました');
  return true;
}

async function showConnectTarget(value) {
  const target = await findProfileByIdOrHandle(value);
  if (!target) return false;
  state.overlay = { type: 'connect-profile', target };
  render();
  return true;
}

async function handleIncomingConnect() {
  const token = new URLSearchParams(window.location.search).get('connect');
  if (!token || token === state.handledConnectToken) return;
  const shown = await showConnectTarget(token);
  if (shown) state.handledConnectToken = token;
}

function requestPersonFromRow(row, profilesById) {
  const remote = profilesById.get(row.requester_id);
  const profile = remote?.profile || {};
  const name = profile.name || remote?.handle || 'ユーザー';
  const tag = relationshipFromValue(row.message) || (profile.school ? '大学' : profile.company ? 'ビジネス' : '紹介');
  return {
    id: row.id,
    requesterId: row.requester_id,
    name,
    handle: profile.handle || remote?.handle || '',
    tag,
    desc: profile.company || profile.school || (remote?.handle ? `@${remote.handle}` : 'Bondyユーザー'),
    common: `${tag}として申請`,
    time: relativeTime(row.created_at),
    photo: profile.photo || '',
    school: profile.school || '',
    highSchool: profile.highSchool || '',
    university: profile.university || '',
    vocationalSchool: profile.vocationalSchool || '',
    highSchoolPublic: profile.highSchoolPublic ?? profile.schoolPublic ?? true,
    universityPublic: profile.universityPublic ?? profile.schoolPublic ?? true,
    vocationalSchoolPublic: profile.vocationalSchoolPublic ?? profile.schoolPublic ?? true,
    highSchoolCurrent: profile.highSchoolCurrent ?? false,
    universityCurrent: profile.universityCurrent ?? false,
    vocationalSchoolCurrent: profile.vocationalSchoolCurrent ?? false,
    careers: normalizeCareers(profile),
    company: profile.company || '',
    companyRole: profile.companyRole || '',
    companyName: profile.companyName || '',
    companyPeriod: profile.companyPeriod || '',
    companyLocation: profile.companyLocation || '',
    location: profile.location || '',
    birthday: profile.birthday || '',
    locationPublic: profile.locationPublic ?? true,
    birthdayPublic: profile.birthdayPublic ?? false,
    sns: profile.sns || {},
    snsPublic: profile.snsPublic || {}
  };
}

function relationshipTypes() {
  return ['大学', 'ビジネス', '地元', '家族', 'イベント', '恋人'];
}

function relationshipFromValue(value) {
  const cleanValue = String(value || '').trim();
  return relationshipTypes().includes(cleanValue) ? cleanValue : '';
}

function personIdentityKey(person = {}) {
  const id = String(person.id || '').trim();
  if (id) return `id:${id}`;
  const handle = String(person.handle || '').trim().toLowerCase();
  if (handle) return `handle:${handle}`;
  const name = String(person.name || '').trim().toLowerCase();
  return name ? `name:${name}` : '';
}

function mergePersonRecord(base = {}, next = {}) {
  const mergedTags = [...new Set([
    ...(Array.isArray(base.tags) ? base.tags : [base.tag]).filter(Boolean),
    ...(Array.isArray(next.tags) ? next.tags : [next.tag]).filter(Boolean)
  ])];
  return {
    ...next,
    ...base,
    id: base.id || next.id,
    requestId: base.requestId || next.requestId,
    requesterId: base.requesterId || next.requesterId,
    recipientId: base.recipientId || next.recipientId,
    name: base.name || next.name,
    handle: base.handle || next.handle,
    photo: base.photo || next.photo,
    desc: base.desc || next.desc,
    time: base.time || next.time,
    tag: base.tag || next.tag,
    tags: mergedTags
  };
}

function uniquePeopleByIdentity(people = []) {
  const byKey = new Map();
  const unique = [];
  people.forEach((person) => {
    const key = personIdentityKey(person);
    if (!key) {
      unique.push(person);
      return;
    }
    const existing = byKey.get(key);
    if (existing) {
      const merged = mergePersonRecord(existing, person);
      Object.assign(existing, merged);
      return;
    }
    byKey.set(key, person);
    unique.push(person);
  });
  return unique;
}

function removalPayload(userId, relationship) {
  return `removed:${userId}:${relationshipFromValue(relationship) || '紹介'}`;
}

function removalFromValue(value) {
  const match = String(value || '').match(/^removed:([^:]+):(.+)$/);
  if (!match) return null;
  return { userId: match[1], relationship: relationshipFromValue(match[2]) || '紹介' };
}

function relativeTime(value) {
  const time = new Date(value).getTime();
  if (!time) return '';
  const diff = Math.max(0, Date.now() - time);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'たった今';
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}日前`;
  return `${Math.floor(days / 7)}週間前`;
}

async function loadIncomingRequests(options = {}) {
  if (!authState.client || !authState.user) return false;
  const { data, error } = await authState.client
    .from(CONNECTION_REQUEST_TABLE)
    .select('id,requester_id,recipient_id,status,message,created_at,updated_at')
    .eq('recipient_id', authState.user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('Connection request load failed', error);
    if (!options.silent) showToast('申請の読み込み設定を確認してください');
    return false;
  }
  const requesterIds = [...new Set((data || []).map((row) => row.requester_id).filter(Boolean))];
  const profilesById = new Map();
  if (requesterIds.length) {
    const { data: profiles, error: profileError } = await authState.client
      .from(REMOTE_PROFILE_TABLE)
      .select('id,email,handle,profile')
      .in('id', requesterIds);
    if (profileError) {
      console.warn('Request profile load failed', profileError);
    } else {
      (profiles || []).forEach((row) => profilesById.set(row.id, profileFromRemoteRow(row)));
    }
  }
  state.requests = (data || []).map((row) => requestPersonFromRow(row, profilesById));
  render();
  return true;
}

function connectionPersonFromRow(row, profilesById, centerId = authState.user?.id) {
  const currentId = centerId;
  const otherId = row.requester_id === currentId ? row.recipient_id : row.requester_id;
  const remote = profilesById.get(otherId);
  const profile = remote?.profile || {};
  const safeProfile = privacySafeProfile(profile);
  const tag = relationshipFromValue(row.message) || (profile.school ? '大学' : profile.company ? 'ビジネス' : '紹介');
  const name = profile.name || remote?.handle || 'ユーザー';
  return {
    id: otherId,
    requestId: row.id,
    requesterId: row.requester_id,
    recipientId: row.recipient_id,
    name,
    handle: profile.handle || remote?.handle || '',
    tag,
    desc: connectionDescription(safeProfile, remote),
    common: `${tag}のつながり`,
    time: relativeTime(row.updated_at || row.created_at),
    photo: profile.photo || '',
    ...safeProfile
  };
}

function connectionDescription(profile = {}, remote = {}) {
  return profile.company
    || profile.companyName
    || profile.school
    || profile.university
    || profile.highSchool
    || profile.vocationalSchool
    || (remote?.handle ? `@${remote.handle}` : 'Bondyユーザー');
}

function privacySafeProfile(profile = {}) {
  const normalized = normalizeUser(profile);
  return {
    school: normalized.schoolPublic === false ? '' : normalized.school,
    highSchool: normalized.highSchoolPublic === false ? '' : normalized.highSchool,
    university: normalized.universityPublic === false ? '' : normalized.university,
    vocationalSchool: normalized.vocationalSchoolPublic === false ? '' : normalized.vocationalSchool,
    highSchoolPublic: normalized.highSchoolPublic,
    universityPublic: normalized.universityPublic,
    vocationalSchoolPublic: normalized.vocationalSchoolPublic,
    highSchoolCurrent: normalized.highSchoolCurrent,
    universityCurrent: normalized.universityCurrent,
    vocationalSchoolCurrent: normalized.vocationalSchoolCurrent,
    careers: careerItems(normalized, { respectPrivacy: true }),
    company: normalized.companyPublic === false ? '' : normalized.company,
    companyRole: normalized.companyPublic === false ? '' : normalized.companyRole,
    companyName: normalized.companyPublic === false ? '' : normalized.companyName,
    companyPeriod: normalized.companyPublic === false ? '' : normalized.companyPeriod,
    companyLocation: normalized.companyPublic === false ? '' : normalized.companyLocation,
    location: normalized.locationPublic === false ? '' : normalized.location,
    birthday: normalized.birthdayPublic === false ? '' : normalized.birthday,
    locationPublic: normalized.locationPublic,
    birthdayPublic: normalized.birthdayPublic,
    sns: normalized.sns,
    snsPublic: normalized.snsPublic
  };
}

async function loadAcceptedConnections(options = {}) {
  if (!authState.client || !authState.user) return false;
  const { data, error } = await authState.client
    .from(CONNECTION_REQUEST_TABLE)
    .select('id,requester_id,recipient_id,status,message,created_at,updated_at')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${authState.user.id},recipient_id.eq.${authState.user.id}`)
    .order('updated_at', { ascending: false });
  if (error) {
    console.warn('Accepted connections load failed', error);
    if (!options.silent) showToast('つながりの読み込み設定を確認してください');
    return false;
  }
  const otherIds = [...new Set((data || []).map((row) => row.requester_id === authState.user.id ? row.recipient_id : row.requester_id).filter(Boolean))];
  const profilesById = new Map();
  if (otherIds.length) {
    const { data: profiles, error: profileError } = await authState.client
      .from(REMOTE_PROFILE_TABLE)
      .select('id,email,handle,profile')
      .in('id', otherIds);
    if (profileError) {
      console.warn('Connection profile load failed', profileError);
    } else {
      (profiles || []).forEach((row) => profilesById.set(row.id, profileFromRemoteRow(row)));
    }
  }
  state.connections = uniquePeopleByIdentity((data || []).map((row) => connectionPersonFromRow(row, profilesById)));
  render();
  return true;
}

async function loadMapCenterConnections(centerId, options = {}) {
  if (!authState.client || !authState.user || !centerId || centerId === 'you') return [];
  console.log('centerId', centerId);
  const rpcRows = await loadMapCenterConnectionsViaRpc(centerId, options);
  const { data, error } = await authState.client
    .from(CONNECTION_REQUEST_TABLE)
    .select('id,requester_id,recipient_id,status,message,created_at,updated_at')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${centerId},recipient_id.eq.${centerId}`)
    .order('updated_at', { ascending: false });
  if (error) {
    console.warn('Map center connections load failed', error);
    if (rpcRows) {
      state.mapCenterConnections[centerId] = rpcRows;
      return rpcRows;
    }
    state.mapCenterConnections[centerId] = [];
    return [];
  }
  console.log('map center rows', data);
  const otherIds = [...new Set((data || [])
    .map((row) => row.requester_id === centerId ? row.recipient_id : row.requester_id)
    .filter(Boolean))];
  console.log('map center otherIds', otherIds);
  const profilesById = new Map();
  if (otherIds.length) {
    const { data: profiles, error: profileError } = await authState.client
      .from(REMOTE_PROFILE_TABLE)
      .select('id,email,handle,profile')
      .in('id', otherIds);
    console.log('map center profiles', profiles);
    if (profileError) {
      console.warn('Map center profiles load failed', profileError);
    } else {
      (profiles || []).forEach((row) => profilesById.set(row.id, profileFromRemoteRow(row)));
    }
  }
  const rows = (data || [])
    .map((row) => connectionPersonFromRow(row, profilesById, centerId))
    .map((person) => ({
      ...person,
      name: person.id === authState.user?.id ? 'あなた' : person.name,
      tag: person.id === authState.user?.id ? 'あなた' : person.tag,
      requestId: '',
      readOnly: true
    }));
  const bestRows = uniquePeopleByIdentity(rpcRows && rpcRows.length > rows.length ? rpcRows : rows);
  state.mapCenterConnections[centerId] = bestRows;
  return bestRows;
}

async function warmMapSearchConnections() {
  if (!authState.client || !authState.user) return;
  const targets = connectionRowsData()
    .map((person) => person.id)
    .filter((id) => id && !state.mapCenterConnections[id])
    .slice(0, 24);
  if (!targets.length) return;
  await Promise.allSettled(targets.map((id) => loadMapCenterConnections(id, { silent: true })));
}

async function loadMapCenterConnectionsViaRpc(centerId, options = {}) {
  try {
    const { data, error } = await authState.client.rpc('get_map_center_connections', { center_id: centerId });
    if (error) {
      console.warn('Map center RPC failed, falling back to direct query', error);
      return null;
    }
    console.log('map center rows', data);
    const rows = uniquePeopleByIdentity((data || []).map((item) => {
      const profile = normalizeUser(item.profile || item);
      const personId = item.connected_user_id || item.other_id || item.user_id || item.profile_id || item.id;
      const isSelf = personId === authState.user?.id;
      return {
        id: personId,
        requestId: item.request_id || '',
        requesterId: item.requester_id || '',
        recipientId: item.recipient_id || '',
        name: isSelf ? 'あなた' : (profile.name || item.name || item.handle || 'ユーザー'),
        handle: profile.handle || item.handle || '',
        tag: isSelf ? 'あなた' : (relationshipFromValue(item.relationship || item.message || item.tag) || 'つながり'),
        desc: connectionDescription(privacySafeProfile(profile), item),
        common: '公開つながり',
        time: relativeTime(item.updated_at || item.created_at),
        photo: profile.photo || item.photo || '',
        ...privacySafeProfile(profile),
        readOnly: true
      };
    }).filter((person) => person.id));
    console.log('map center otherIds', rows.map((person) => person.id));
    console.log('map center profiles', rows);
    state.mapCenterConnections[centerId] = rows;
    return rows;
  } catch (error) {
    console.warn('Map center RPC unavailable', error);
    return null;
  }
}

async function loadRemovalNotifications(options = {}) {
  if (!authState.client || !authState.user) return false;
  const { data, error } = await authState.client
    .from(CONNECTION_REQUEST_TABLE)
    .select('id,requester_id,recipient_id,status,message,updated_at,created_at')
    .eq('status', 'removed')
    .or(`requester_id.eq.${authState.user.id},recipient_id.eq.${authState.user.id}`)
    .order('updated_at', { ascending: false })
    .limit(30);
  if (error) {
    console.warn('Removal notifications load failed', error);
    if (!options.silent) showToast('通知の読み込み設定を確認してください');
    return false;
  }
  const rows = (data || [])
    .map((row) => ({ row, removal: removalFromValue(row.message) }))
    .filter(({ removal }) => removal && removal.userId !== authState.user.id);
  const userIds = [...new Set(rows.map(({ removal }) => removal.userId))];
  const profilesById = new Map();
  if (userIds.length) {
    const { data: profiles } = await authState.client
      .from(REMOTE_PROFILE_TABLE)
      .select('id,email,handle,profile')
      .in('id', userIds);
    (profiles || []).forEach((row) => profilesById.set(row.id, profileFromRemoteRow(row)));
  }
  state.notifications = rows.map(({ row, removal }) => {
    const remote = profilesById.get(removal.userId);
    const profile = remote?.profile || {};
    const name = profile.name || remote?.handle || 'ユーザー';
    return {
      id: row.id,
      name,
      relationship: removal.relationship,
      time: relativeTime(row.updated_at || row.created_at),
      body: `${name}さんが${removal.relationship}のつながりを削除しました`
    };
  });
  render();
  return true;
}

async function updateConnectionRequestStatus(requestId, result) {
  if (!authState.client || !authState.user) return false;
  const status = result === '承認' ? 'accepted' : 'rejected';
  const { error } = await authState.client
    .from(CONNECTION_REQUEST_TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('recipient_id', authState.user.id);
  if (error) {
    console.warn('Connection request update failed', error);
    showToast('申請の更新設定を確認してください');
    return false;
  }
  if (status === 'accepted') await loadAcceptedConnections({ silent: true });
  return true;
}

async function findRelatedConnectionRequestId(personId = '') {
  if (!authState.client || !authState.user || !personId) return '';
  const { data, error } = await authState.client
    .from(CONNECTION_REQUEST_TABLE)
    .select('id')
    .eq('status', 'accepted')
    .or(`and(requester_id.eq.${authState.user.id},recipient_id.eq.${personId}),and(requester_id.eq.${personId},recipient_id.eq.${authState.user.id})`)
    .order('updated_at', { ascending: false })
    .limit(1);
  if (error) {
    console.warn('Related connection lookup failed', error);
    return '';
  }
  return data?.[0]?.id || '';
}

function directConnectionForPerson(person = {}) {
  const personId = String(person.id || '').trim();
  const personHandle = String(person.handle || '').trim().toLowerCase();
  const personName = String(person.name || '').trim().toLowerCase();
  return connectionRowsData().find((connection) => {
    const connectionId = String(connection.id || '').trim();
    const connectionHandle = String(connection.handle || '').trim().toLowerCase();
    const connectionName = String(connection.name || '').trim().toLowerCase();
    return (personId && connectionId && personId === connectionId)
      || (personHandle && connectionHandle && personHandle === connectionHandle)
      || (personName && connectionName && personName === connectionName && !personHandle);
  }) || null;
}

async function updateConnectionRelationship(requestId, relationship, personId = '') {
  if (!authState.client || !authState.user) return false;
  const cleanRelationship = relationshipFromValue(relationship);
  const resolvedRequestId = requestId || await findRelatedConnectionRequestId(personId);
  if (!cleanRelationship || (!resolvedRequestId && !personId)) {
    showToast('つながり情報を再読み込みしてください');
    return false;
  }
  let saved = false;
  if (resolvedRequestId) {
    const { error } = await authState.client
      .from(CONNECTION_REQUEST_TABLE)
      .update({ message: cleanRelationship, updated_at: new Date().toISOString() })
      .eq('id', resolvedRequestId)
      .eq('status', 'accepted');
    if (error) {
      console.warn('Connection relationship update failed', error);
      showToast('関係の変更設定を確認してください');
      return false;
    }
    saved = true;
  }
  if (personId) {
    const { error: pairError } = await authState.client
      .from(CONNECTION_REQUEST_TABLE)
      .update({ message: cleanRelationship, updated_at: new Date().toISOString() })
      .eq('status', 'accepted')
      .or(`and(requester_id.eq.${authState.user.id},recipient_id.eq.${personId}),and(requester_id.eq.${personId},recipient_id.eq.${authState.user.id})`);
    if (pairError && !saved) {
      console.warn('Connection relationship pair update failed', pairError);
      showToast('関係の変更設定を確認してください');
      return false;
    }
    saved = true;
  }
  state.connections.forEach((person) => {
    if (person.requestId === resolvedRequestId || person.id === personId) person.tag = cleanRelationship;
  });
  await loadAcceptedConnections({ silent: true });
  if (personId) {
    Object.values(state.mapCenterConnections).forEach((rows) => {
      rows.forEach((person) => {
        if (person.requestId === resolvedRequestId || person.id === personId) person.tag = cleanRelationship;
      });
    });
  }
  return true;
}

async function removeConnection(requestId, relationship, personId = '') {
  if (!authState.client || !authState.user) return false;
  const resolvedRequestId = requestId || await findRelatedConnectionRequestId(personId);
  if (!resolvedRequestId) {
    showToast('つながり情報を再読み込みしてください');
    return false;
  }
  const removalResult = await authState.client
    .from(CONNECTION_REQUEST_TABLE)
    .update({
      status: 'removed',
      message: removalPayload(authState.user.id, relationship),
      updated_at: new Date().toISOString()
    })
    .eq('id', resolvedRequestId)
    .eq('status', 'accepted')
    .select('id');
  let removedRows = removalResult.data;
  let error = removalResult.error;
  if (error && (error.code === '23514' || String(error.message || '').includes('connection_requests_status_check'))) {
    const fallbackResult = await authState.client
      .from(CONNECTION_REQUEST_TABLE)
      .update({
        status: 'rejected',
        message: removalPayload(authState.user.id, relationship),
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedRequestId)
      .eq('status', 'accepted')
      .select('id');
    removedRows = fallbackResult.data;
    error = fallbackResult.error;
  }
  if (error) {
    console.warn('Connection removal failed', error);
    showToast('つながり削除の設定を確認してください');
    return false;
  }
  if (!removedRows?.length && personId && requestId) {
    const fallbackRequestId = await findRelatedConnectionRequestId(personId);
    if (fallbackRequestId && fallbackRequestId !== requestId) {
      return removeConnection(fallbackRequestId, relationship, personId);
    }
  }
  if (!removedRows?.length) {
    showToast('つながり情報を再読み込みしてください');
    return false;
  }
  state.connections = state.connections.filter((person) => person.requestId !== resolvedRequestId && person.id !== personId);
  if (personId) {
    Object.keys(state.mapCenterConnections || {}).forEach((centerId) => {
      state.mapCenterConnections[centerId] = (state.mapCenterConnections[centerId] || []).filter((person) => person.id !== personId);
    });
  }
  if (!state.connections.some((person) => person.id === state.mapCenter)) {
    state.mapCenter = 'you';
  }
  await loadAcceptedConnections({ silent: true });
  return true;
}

async function startQrScanner() {
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast('このブラウザではID検索を使ってください');
    return;
  }
  const root = document.createElement('div');
  root.className = 'qr-scanner-root';
  root.innerHTML = `
    <div class="scrim"></div>
    <section class="qr-scanner">
      <h2>QRコードを読み取る</h2>
      <video playsinline muted></video>
      <p>相手のBondy QRコードを枠内に入れてください。</p>
      <button type="button">閉じる</button>
    </section>
  `;
  document.body.appendChild(root);
  const video = root.querySelector('video');
  const close = root.querySelector('button');
  let stream;
  let scanning = true;
  const stop = () => {
    scanning = false;
    stream?.getTracks().forEach((track) => track.stop());
    root.remove();
  };
  close.addEventListener('click', stop);
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
    await video.play();
    const detector = 'BarcodeDetector' in window ? new BarcodeDetector({ formats: ['qr_code'] }) : null;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!detector) await loadJsQr();
    const scan = async () => {
      if (!scanning) return;
      try {
        let value = '';
        if (detector) {
          const codes = await detector.detect(video);
          value = codes[0]?.rawValue || '';
        } else if (window.jsQR && video.videoWidth && video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          value = window.jsQR(imageData.data, imageData.width, imageData.height)?.data || '';
        }
        if (value) {
          stop();
          await showConnectTarget(value);
          return;
        }
      } catch (error) {
        console.warn('QR scan failed', error);
      }
      requestAnimationFrame(scan);
    };
    scan();
  } catch (error) {
    console.warn('Camera unavailable', error);
    stop();
    showToast('カメラを使えませんでした。ID検索を使ってください');
  }
}

function loadJsQr() {
  if (window.jsQR) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
    script.onload = resolve;
    script.onerror = () => {
      console.warn('jsQR fallback failed to load');
      reject(new Error('jsQR fallback failed to load'));
    };
    document.head.appendChild(script);
  });
}

async function restoreAccountUser() {
  if (!authState.user) return false;
  const email = authState.user.email || '';
  const pendingUser = loadPendingProfileSync();
  if (pendingUser) {
    saveUserLocal({ ...pendingUser, email: pendingUser.email || email });
    await syncPendingProfile({ silent: true });
    return true;
  }
  const remoteUser = await loadRemoteUser();
  if (remoteUser) {
    saveUserLocal({ ...remoteUser, email: remoteUser.email || email });
    await syncPendingProfile({ silent: true });
    return true;
  }
  const accountUser = loadAccountUser();
  if (accountUser) {
    saveUserLocal({ ...accountUser, email: accountUser.email || email });
    const synced = await saveRemoteUser(state.user, { silent: true });
    if (synced) clearProfileSyncPending();
    else markProfileSyncPending(state.user);
    return true;
  }
  if (state.user && (!state.user.email || state.user.email === email)) {
    saveUserLocal({ ...state.user, email: state.user.email || email });
    const synced = await saveRemoteUser(state.user, { silent: true });
    if (synced) clearProfileSyncPending();
    else markProfileSyncPending(state.user);
    return true;
  }
  state.user = null;
  localStorage.removeItem(STORAGE_KEY);
  return false;
}

function profileIsComplete(user = state.user) {
  const profile = normalizeUser(user || {});
  return Boolean(profile.name && profile.handle && (profile.school || profile.company || normalizeCareers(profile).length));
}

async function finishAuthenticatedEntry(message = '') {
  await hydrateCompanyOptions();
  await loadIncomingRequests({ silent: true });
  await loadAcceptedConnections({ silent: true });
  warmMapSearchConnections().then(() => state.screen === 'map' && render());
  await loadRemovalNotifications({ silent: true });
  await handleIncomingConnect();
  if (state.overlay?.type === 'connect-profile') return;
  if (profileIsComplete()) {
    go('map', message);
    return;
  }
  go('register', 'プロフィールを登録してください');
}

async function initAuth() {
  if (!authState.configured) {
    authState.ready = true;
    return;
  }
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    authState.client = createClient(AUTH_CONFIG.supabaseUrl, AUTH_CONFIG.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    });
    const { data } = await authState.client.auth.getSession();
    authState.user = data.session?.user || null;
    if (authState.user?.email) saveLastEmail(authState.user.email);
    if (authState.user) await restoreAccountUser();
    const needsProfile = authState.user && !profileIsComplete();
    if (authState.user && state.authMode !== 'updatePassword' && (state.screen === 'login' || needsProfile)) {
      await finishAuthenticatedEntry('');
    } else if (authState.user) {
      await loadIncomingRequests({ silent: true });
      await loadAcceptedConnections({ silent: true });
      await loadRemovalNotifications({ silent: true });
      await handleIncomingConnect();
    }
    if (!authState.user && state.screen !== 'login' && state.screen !== 'register') {
      state.authMode = 'signin';
      go('login');
    }
    authState.client.auth.onAuthStateChange(async (event, session) => {
      authState.user = session?.user || null;
      if (authState.user?.email) saveLastEmail(authState.user.email);
      if (authState.user) await restoreAccountUser();
      if (event === 'PASSWORD_RECOVERY') {
        state.screen = 'login';
        state.authMode = 'updatePassword';
        render();
        return;
      }
      if (event === 'SIGNED_IN') {
        await finishAuthenticatedEntry(profileIsComplete() ? 'ログインしました' : '');
        return;
      }
      if (authState.user) {
        await loadIncomingRequests({ silent: true });
        await loadAcceptedConnections({ silent: true });
        await loadRemovalNotifications({ silent: true });
        await handleIncomingConnect();
      }
    });
  } catch (error) {
    console.error(error);
    showToast('認証サービスの読み込みに失敗しました');
  } finally {
    authState.ready = true;
  }
}

async function signUpWithEmail(email, password) {
  if (!authState.configured || !authState.client) {
    showToast('Supabase設定を入れると認証メールを送れます');
    return;
  }
  saveLastEmail(email);
  localStorage.setItem(SIGNUP_PENDING_KEY, email);
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { data, error } = await authState.client.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectTo }
  });
  if (error) {
    showToast(error.message);
    return;
  }
  if (data.session?.user) {
    authState.user = data.session.user;
    await restoreAccountUser();
    go('register', 'プロフィールを登録してください');
    return;
  }
  showToast('認証メールを送信しました');
}

async function sendPasswordReset(email) {
  if (!authState.configured || !authState.client) {
    showToast('Supabase設定を入れると再設定メールを送れます');
    return;
  }
  saveLastEmail(email);
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { error } = await authState.client.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    showToast(error.message);
    return;
  }
  showToast('再設定メールを送信しました');
}

async function updatePassword(password) {
  if (!authState.configured || !authState.client) {
    showToast('Supabase設定を確認してください');
    return;
  }
  const { error } = await authState.client.auth.updateUser({ password });
  if (error) {
    showToast(error.message);
    return;
  }
  state.authMode = 'signin';
  go('map', 'パスワードを更新しました');
}

async function signInWithEmail(email, password) {
  if (!authState.configured || !authState.client) {
    showToast('Supabase設定を入れるとログインできます');
    return;
  }
  saveLastEmail(email);
  localStorage.removeItem(SIGNUP_PENDING_KEY);
  const { data, error } = await authState.client.auth.signInWithPassword({ email, password });
  if (error) {
    showToast(error.message);
    return;
  }
  authState.user = data.user || authState.user;
  await restoreAccountUser();
  await finishAuthenticatedEntry('ログインしました');
}

async function signInWithProvider(provider) {
  if (!authState.configured || !authState.client) {
    showToast('Supabase設定を確認してください');
    return;
  }
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { error } = await authState.client.auth.signInWithOAuth({
    provider,
    options: { redirectTo }
  });
  if (error) showToast(error.message);
}

function currentUser() {
  const email = authState.user?.email || loadLastEmail();
  const fallbackHandle = email ? email.split('@')[0] : '';
  const user = state.user || {};
  return normalizeUser({
    ...user,
    email: user.email || email,
    handle: user.handle || fallbackHandle,
    name: user.name || fallbackHandle
  });
}

function normalizeUser(user) {
  const emptySns = Object.fromEntries(snsFields().map(({ key }) => [key, '']));
  const defaultSnsPublic = Object.fromEntries(snsFields().map(({ key }) => [key, true]));
  const legacySchool = user?.school || '';
  const legacyCompany = user?.company || '';
  return {
    name: '',
    handle: '',
    email: '',
    school: '',
    highSchool: '',
    university: '',
    vocationalSchool: '',
    company: '',
    companyRole: '',
    companyName: '',
    companyPeriod: '',
    companyLocation: '',
    careers: [],
    location: '',
    birthday: '',
    photo: '',
    schoolPublic: true,
    highSchoolPublic: true,
    universityPublic: true,
    vocationalSchoolPublic: true,
    highSchoolCurrent: false,
    universityCurrent: false,
    vocationalSchoolCurrent: false,
    companyPublic: true,
    locationPublic: true,
    birthdayPublic: false,
    sns: emptySns,
    snsPublic: defaultSnsPublic,
    ...user,
    highSchool: user?.highSchool || '',
    university: user?.university || legacySchool,
    vocationalSchool: user?.vocationalSchool || '',
    companyRole: user?.companyRole || '',
    companyName: user?.companyName || legacyCompany,
    companyPeriod: user?.companyPeriod || '',
    companyLocation: user?.companyLocation || '',
    careers: normalizeCareers(user),
    school: user?.school || user?.university || user?.vocationalSchool || user?.highSchool || '',
    company: user?.company || [user?.companyRole, user?.companyName].filter(Boolean).join(' / '),
    sns: {
      ...emptySns,
      ...(user?.sns || {})
    },
    snsPublic: {
      ...defaultSnsPublic,
      ...(user?.snsPublic || {})
    },
    schoolPublic: user?.schoolPublic ?? true,
    highSchoolPublic: user?.highSchoolPublic ?? user?.schoolPublic ?? true,
    universityPublic: user?.universityPublic ?? user?.schoolPublic ?? true,
    vocationalSchoolPublic: user?.vocationalSchoolPublic ?? user?.schoolPublic ?? true,
    highSchoolCurrent: user?.highSchoolCurrent ?? false,
    universityCurrent: user?.universityCurrent ?? false,
    vocationalSchoolCurrent: user?.vocationalSchoolCurrent ?? false,
    companyPublic: user?.companyPublic ?? true,
    locationPublic: user?.locationPublic ?? true,
    birthdayPublic: user?.birthdayPublic ?? false
  };
}

function snsFields() {
  return [
    { key: 'instagram', label: 'Instagram', icon: snsLogo('instagram', 'Instagram') },
    { key: 'x', label: 'X', icon: snsLogo('x', 'X') },
    { key: 'threads', label: 'Threads', icon: snsLogo('threads', 'Threads') },
    { key: 'tiktok', label: 'TikTok', icon: snsLogo('tiktok', 'TikTok') },
    { key: 'bereal', label: 'BeReal', icon: snsLogo('bereal', 'BeReal') },
    { key: 'setlog', label: 'Setlog', icon: snsLogo('setlog', 'Setlog') },
    { key: 'facebook', label: 'Facebook', icon: snsLogo('facebook', 'Facebook') },
    { key: 'youtube', label: 'YouTube', icon: snsLogo('youtube', 'YouTube') },
    { key: 'linkedin', label: 'LinkedIn', icon: snsLogo('linkedin', 'LinkedIn') },
    { key: 'note', label: 'note', icon: snsLogo('note', 'note') }
  ];
}

function normalizeCareers(user = {}) {
  const source = Array.isArray(user.careers) ? user.careers : [];
  const careers = source.map((career, index) => {
    const type = career?.type === 'past' || career?.current === false
      ? 'past'
      : career?.type === 'current' || career?.current === true
        ? 'current'
        : (index === 0 ? 'current' : 'past');
    const dates = normalizeCareerDates(career);
    return {
      role: String(career?.role || career?.title || '').trim(),
      company: String(career?.company || career?.name || '').trim(),
      type,
      startYear: dates.startYear,
      startMonth: dates.startMonth,
      endYear: type === 'current' ? '' : dates.endYear,
      endMonth: type === 'current' ? '' : dates.endMonth,
      period: formatCareerPeriod({
        startYear: dates.startYear,
        startMonth: dates.startMonth,
        endYear: type === 'current' ? '' : dates.endYear,
        endMonth: type === 'current' ? '' : dates.endMonth,
        type
      }) || dates.period,
      location: String(career?.location || '').trim(),
      logo: String(career?.logo || findCompanyLogo(career?.company || career?.name || '') || '').trim(),
      domain: String(career?.domain || findCompanyDomain(career?.company || career?.name || '') || '').trim(),
      logoUrl: String(career?.logoUrl || career?.logo_url || companyLogoUrl(career?.company || career?.name || '', career?.domain || '') || '').trim(),
      public: career?.public ?? user.companyPublic ?? true
    };
  }).filter((career) => career.role || career.company || career.period || career.location);
  if (careers.length) return careers;
  const legacyDates = normalizeCareerDates(user);
  const legacy = {
    role: String(user.companyRole || '').trim(),
    company: String(user.companyName || user.company || '').trim(),
    type: 'current',
    startYear: legacyDates.startYear,
    startMonth: legacyDates.startMonth,
    endYear: legacyDates.endYear,
    endMonth: legacyDates.endMonth,
    period: legacyDates.period,
    location: String(user.companyLocation || '').trim(),
    logo: findCompanyLogo(user.companyName || user.company || ''),
    domain: findCompanyDomain(user.companyName || user.company || ''),
    logoUrl: companyLogoUrl(user.companyName || user.company || '', findCompanyDomain(user.companyName || user.company || '')),
    public: user.companyPublic ?? true
  };
  return legacy.role || legacy.company || legacy.period || legacy.location ? [legacy] : [];
}

function normalizeCareerDates(career = {}) {
  const startYear = String(career?.startYear || career?.start_year || '').trim();
  const startMonth = normalizeMonth(career?.startMonth || career?.start_month || '');
  const endYear = String(career?.endYear || career?.end_year || '').trim();
  const endMonth = normalizeMonth(career?.endMonth || career?.end_month || '');
  const period = formatCareerPeriod({ startYear, startMonth, endYear, endMonth, type: career?.type || (career?.current ? 'current' : '') })
    || String(career?.period || career?.companyPeriod || '').trim();
  return { startYear, startMonth, endYear, endMonth, period };
}

function normalizeMonth(value) {
  const month = String(value || '').replace('月', '').padStart(2, '0');
  return /^(0[1-9]|1[0-2])$/.test(month) ? month : '';
}

function formatCareerPeriod({ startYear = '', startMonth = '', endYear = '', endMonth = '', type = '' } = {}) {
  const start = formatYearMonth(startYear, startMonth);
  const end = type === 'current' ? '現在' : formatYearMonth(endYear, endMonth);
  if (start && end) return `${start} - ${end}`;
  if (start) return type === 'current' ? `${start} - 現在` : start;
  if (end && type !== 'current') return end;
  return '';
}

function formatYearMonth(year = '', month = '') {
  const cleanYear = String(year || '').trim();
  const cleanMonth = normalizeMonth(month);
  return cleanYear && cleanMonth ? `${cleanYear}年${Number(cleanMonth)}月` : cleanYear ? `${cleanYear}年` : '';
}

function careerYearOptions(selectedYear = '') {
  const currentYear = new Date().getFullYear();
  const selected = String(selectedYear || '').trim();
  const start = Math.max(1950, Math.min(Number(selected) || currentYear, currentYear) - 80);
  const end = Math.max(currentYear + 5, Number(selected) || currentYear);
  const years = [];
  for (let year = end; year >= start; year -= 1) years.push(year);
  return `<option value="">年</option>${years.map((year) => `<option value="${year}" ${String(year) === selected ? 'selected' : ''}>${year}年</option>`).join('')}`;
}

function careerMonthOptions(selectedMonth = '') {
  const selected = normalizeMonth(selectedMonth);
  return `<option value="">月</option>${Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, '0');
    return `<option value="${month}" ${month === selected ? 'selected' : ''}>${index + 1}月</option>`;
  }).join('')}`;
}

function careerDateSelects(career = {}, type = 'past') {
  const isCurrent = type === 'current';
  return `
    <div class="career-period-grid">
      <div class="career-period-row">
        <span>開始</span>
        <div class="career-period-selects">
          <select name="careerStartYear[]" aria-label="開始年">${careerYearOptions(career.startYear)}</select>
          <select name="careerStartMonth[]" aria-label="開始月">${careerMonthOptions(career.startMonth)}</select>
        </div>
      </div>
      ${isCurrent ? `
        <input type="hidden" name="careerEndYear[]" value="">
        <input type="hidden" name="careerEndMonth[]" value="">
        <div class="career-period-row">
          <span>終了</span>
          <b class="career-period-now">現在</b>
        </div>
      ` : `
        <div class="career-period-row">
          <span>終了</span>
          <div class="career-period-selects">
            <select name="careerEndYear[]" aria-label="終了年">${careerYearOptions(career.endYear)}</select>
            <select name="careerEndMonth[]" aria-label="終了月">${careerMonthOptions(career.endMonth)}</select>
          </div>
        </div>
      `}
    </div>
  `;
}

function findCompanyLogo(company = '') {
  const clean = String(company || '').trim().toLowerCase();
  if (isRemovedCompany(clean)) return '';
  return companyOptions.find((option) => option.name.toLowerCase() === clean || option.label.toLowerCase() === clean)?.logo || '';
}

function findCompanyDomain(company = '') {
  const clean = String(company || '').trim().toLowerCase();
  if (isRemovedCompany(clean)) return '';
  return companyOptions.find((option) => option.name.toLowerCase() === clean || option.label.toLowerCase() === clean)?.domain || '';
}

function findCompanyLogoUrl(company = '', domainValue = '') {
  const clean = String(company || '').trim().toLowerCase();
  if (isRemovedCompany(clean)) return '';
  const domain = domainValue || findCompanyDomain(company);
  if (domain) return companyLogoUrl(company, domain);
  return companyOptions.find((option) => option.name.toLowerCase() === clean || option.label.toLowerCase() === clean)?.logoUrl || '';
}

function normalizeCompanyOption(company = {}) {
  const name = String(company.name || company.label || '').trim();
  const label = String(company.label || name).trim();
  if (isRemovedCompany(name)) return { name: '', label: '', domain: '', logoUrl: '', logo: '' };
  const domain = normalizeDomain(company.domain || company.website || '');
  const logoUrl = String(company.logoUrl || company.logo_url || '').trim() || (domain ? companyLogoUrl(name, domain) : '');
  return {
    name,
    label,
    domain,
    logoUrl,
    logo: company.logo && !String(company.logo).startsWith('http') ? company.logo : companyLogoSlug(name)
  };
}

function normalizeDomain(value = '') {
  return String(value || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .toLowerCase();
}

function loadSavedCompanies() {
  try {
    const raw = JSON.parse(localStorage.getItem(COMPANY_CACHE_KEY) || '[]');
    return Array.isArray(raw) ? raw.map(normalizeCompanyOption).filter((company) => company.name && !isRemovedCompany(company.name)) : [];
  } catch {
    return [];
  }
}

function isRemovedCompany(name = '') {
  return ['株式会社mesh', 'mesh'].includes(String(name || '').trim().toLowerCase());
}

function saveCompanyCandidate(company = {}) {
  const normalized = normalizeCompanyOption(company);
  if (!normalized.name) return;
  const current = loadSavedCompanies().filter((item) => item.name.toLowerCase() !== normalized.name.toLowerCase());
  localStorage.setItem(COMPANY_CACHE_KEY, JSON.stringify([normalized, ...current].slice(0, 120)));
  void saveCompanyCandidateRemote(normalized);
}

async function saveCompanyCandidateRemote(company = {}) {
  if (!authState.configured || !authState.client || !authState.user || !company.name) return;
  try {
    await authState.client.from(COMPANY_TABLE).upsert({
      name: company.name,
      domain: company.domain || null,
      logo_url: company.logoUrl || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'name' });
  } catch {
    // The app still works if the optional shared company table has not been created yet.
  }
}

async function hydrateCompanyOptions() {
  if (!authState.configured || !authState.client || !authState.user) return;
  try {
    const { data, error } = await authState.client
      .from(COMPANY_TABLE)
      .select('name,domain,logo_url')
      .order('updated_at', { ascending: false })
      .limit(500);
    if (error || !Array.isArray(data)) return;
    const existing = new Set(companyOptions.map((company) => company.name.toLowerCase()));
    data.map((item) => normalizeCompanyOption({
      name: item.name,
      domain: item.domain,
      logoUrl: item.logo_url
    })).forEach((company) => {
      if (!company.name || existing.has(company.name.toLowerCase())) return;
      companyOptions.unshift(company);
      existing.add(company.name.toLowerCase());
    });
  } catch {
    // The optional shared company table can be added later without blocking the app.
  }
}

async function searchLogoDevBrands(query = '') {
  const endpoint = AUTH_CONFIG.logoDevBrandSearchUrl || '';
  const apiKey = AUTH_CONFIG.logoDevApiKey || '';
  if (!endpoint || !apiKey) return [];
  try {
    const url = new URL(endpoint);
    url.searchParams.set('q', query);
    url.searchParams.set('query', query);
    url.searchParams.set('token', apiKey);
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'x-api-key': apiKey
      }
    });
    if (!response.ok) return [];
    const payload = await response.json();
    const items = Array.isArray(payload) ? payload : payload.results || payload.brands || payload.data || [];
    return items.map((item) => normalizeCompanyOption({
      name: item.name || item.title || item.brand,
      label: item.name || item.title || item.brand,
      domain: item.domain || item.website || item.url,
      logoUrl: item.logoUrl || item.logo_url || item.logo
    })).filter((company) => company.name);
  } catch {
    return [];
  }
}

function companyLogoSlug(name = '') {
  const custom = {
    'LINE Yahoo': 'lineYahoo',
    'CyberAgent': 'cyberAgent',
    'Money Forward': 'moneyForward',
    'Boston Consulting Group': 'bcg',
    'McKinsey & Company': 'mckinsey',
    'Mitsubishi Corporation': 'mitsubishiCorp',
    'Mitsui & Co.': 'mitsui',
    'Seven & i Holdings': 'sevenI',
    'Japan Airlines': 'jal',
    'Yamato Transport': 'yamato',
    'Sagawa Express': 'sagawa',
    'GMO Internet Group': 'gmo',
    'Fast Retailing': 'fastRetailing',
    'Louis Vuitton': 'louisVuitton',
    "L'Oreal": 'loreal',
    "McDonald's": 'mcdonalds'
  };
  if (custom[name]) return custom[name];
  return String(name || 'company')
    .replace(/&/g, 'and')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'company';
}

function companyInitial(name = '') {
  return String(name || 'B').trim().slice(0, 1).toUpperCase();
}

function logoHue(value = '') {
  return [...String(value || 'Bondy')].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
}

function educationItems(user = {}, options = {}) {
  const respectPrivacy = options.respectPrivacy === true;
  return [
    ['高校', user.highSchool, user.highSchoolPublic, user.highSchoolCurrent],
    ['大学', user.university || user.school, user.universityPublic, user.universityCurrent],
    ['専門学校', user.vocationalSchool, user.vocationalSchoolPublic, user.vocationalSchoolCurrent]
  ].filter(([, value, isPublic]) => String(value || '').trim() && (!respectPrivacy || isPublic !== false));
}

function hiddenEducationItems(user = {}) {
  return [
    ['高校', user.highSchool, user.highSchoolPublic, user.highSchoolCurrent],
    ['大学', user.university || user.school, user.universityPublic, user.universityCurrent],
    ['専門学校', user.vocationalSchool, user.vocationalSchoolPublic, user.vocationalSchoolCurrent]
  ].filter(([, value, isPublic]) => String(value || '').trim() && isPublic === false);
}

function educationSummary(user = {}, options = {}) {
  const items = educationItems(user, options);
  if (items.length) return items.map(([label, value]) => `${label}：${value}`).join(' / ');
  if (options.respectPrivacy && hiddenEducationItems(user).length) return '非公開';
  return '';
}

function careerItems(user = {}, options = {}) {
  const respectPrivacy = options.respectPrivacy === true;
  return normalizeCareers(user).filter((career) => !respectPrivacy || career.public !== false);
}

function hiddenCareerItems(user = {}) {
  return normalizeCareers(user).filter((career) => career.public === false);
}

function primaryCareer(user = {}, options = {}) {
  return careerItems(user, options)[0] || null;
}

function careerSummary(user = {}, options = {}) {
  const career = primaryCareer(user, options);
  if (career) return [career.role, career.company].filter(Boolean).join(' / ') || user.company || '';
  if (options.respectPrivacy && hiddenCareerItems(user).length) return '非公開';
  return user.company || '';
}

function careerInfo(user = {}) {
  const career = primaryCareer(user) || {};
  return {
    title: career.role || user.companyRole || '',
    company: career.company || user.companyName || user.company || '',
    period: career.period || user.companyPeriod || '',
    location: career.location || user.companyLocation || '',
    logo: career.logo || findCompanyLogo(career.company || user.companyName || user.company || ''),
    domain: career.domain || findCompanyDomain(career.company || user.companyName || user.company || ''),
    logoUrl: career.logoUrl || findCompanyLogoUrl(career.company || user.companyName || user.company || '', career.domain || '')
  };
}

function companyLogoMarkup(logo = '', fallback = 'B', domain = '', logoUrlValue = '') {
  const companyName = fallback || 'B';
  const cleanDomain = normalizeDomain(domain || findCompanyDomain(companyName));
  const logoUrl = cleanDomain
    ? companyLogoUrl(companyName, cleanDomain)
    : String(logoUrlValue || '').trim() || companyNameLogoUrl(companyName);

  console.log('logo debug', companyName, cleanDomain, logoUrl);

  const escapedName = escapeHtml(companyName);
  const fallbackHtml = companyFallbackLogoMarkup(companyName);

  if (!logoUrl) return fallbackHtml;

  return `<span class="company-logo-shell is-loading">${fallbackHtml}<img class="company-logo-img" src="${escapeHtml(logoUrl)}" alt="${escapedName} logo" loading="lazy" referrerpolicy="origin" onload="handleCompanyLogoLoad(this)" onerror="handleCompanyLogoError(this)"></span>`;
}

window.handleCompanyLogoLoad = function handleCompanyLogoLoad(image) {
  const shell = image.closest?.('.company-logo-shell');
  const tooSmall = Math.max(image.naturalWidth || 0, image.naturalHeight || 0) < 72;
  if (tooSmall) {
    image.remove();
    shell?.classList.remove('is-loading');
    return;
  }
  shell?.classList.remove('is-loading');
  shell?.classList.add('has-logo');
};

window.handleCompanyLogoError = function handleCompanyLogoError(image) {
  console.warn('Logo failed', image.alt, image.src);
  const shell = image.closest?.('.company-logo-shell');
  image.remove();
  shell?.classList.remove('is-loading');
};

function companyFallbackLogoMarkup(companyName = 'B') {
  const clean = String(companyName || '').trim().toLowerCase();
  const initial = escapeHtml(companyInitial(companyName));
  const escapedName = escapeHtml(companyName || 'company');
  if (clean === 'microsoft') {
    return '<div class="company-logo-fallback company-logo-microsoft" aria-label="Microsoft logo fallback"><i></i><i></i><i></i><i></i></div>';
  }
  return `<div class="company-logo-fallback" aria-label="${escapedName} logo fallback">${initial}</div>`;
}

function companyLogoUrl(company = '', domainValue = '') {
  const apiKey = AUTH_CONFIG.logoDevApiKey || window.LOGO_DEV_TOKEN || '';
  const domain = normalizeDomain(domainValue || findCompanyDomain(company));
  if (!apiKey) {
    console.warn('Logo.dev token is empty');
    return '';
  }
  if (!domain) return '';
  return `https://img.logo.dev/${encodeURIComponent(domain)}?token=${encodeURIComponent(apiKey)}&size=256&format=png&fallback=404&v=91`;
}

function companyNameLogoUrl(company = '') {
  const apiKey = AUTH_CONFIG.logoDevApiKey || window.LOGO_DEV_TOKEN || '';
  const name = String(company || '').trim();
  if (!apiKey) {
    console.warn('Logo.dev token is empty');
    return '';
  }
  if (!name || name === 'B') return '';
  return `https://img.logo.dev/name/${encodeURIComponent(name)}?token=${encodeURIComponent(apiKey)}&size=256&format=png&fallback=404&v=91`;
}

function snsLogo(key, label) {
  const sources = {
    instagram: 'instagram.png',
    x: 'x.png',
    threads: 'threads.svg',
    tiktok: 'tiktok.png',
    bereal: 'bereal.png',
    setlog: 'setlog.webp',
    facebook: 'facebook.png',
    youtube: 'youtube.png',
    linkedin: 'linkedin.png',
    note: 'note.svg'
  };
  return `<img class="sns-logo sns-logo-${key}" src="./assets/social/${sources[key]}" alt="${escapeHtml(label)}" loading="lazy">`;
}

function snsFromForm(formData) {
  return Object.fromEntries(snsFields().map(({ key }) => [key, normalizeSnsAccount(key, String(formData.get(key) || '').trim())]));
}

function snsPublicFromForm(formData) {
  return Object.fromEntries(snsFields().map(({ key }) => [key, formData.get(`${key}Public`) !== 'false']));
}

function normalizeSnsAccount(platform, value = '') {
  if (value && typeof value === 'object') {
    const username = String(value.username || '').replace(/^@/, '').trim();
    const url = String(value.url || '').trim() || snsProfileUrl(platform, username);
    return username || url ? { platform, username, url } : '';
  }
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('{')) {
    try {
      return normalizeSnsAccount(platform, JSON.parse(raw));
    } catch {}
  }
  let username = raw.replace(/^@/, '').trim();
  let url = '';
  try {
    const parsed = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    const pathUser = parsed.pathname.split('/').filter(Boolean)[0] || '';
    username = decodeURIComponent(pathUser || username).replace(/^@/, '').trim();
    url = parsed.href;
  } catch {
    username = username.replace(/^https?:\/\//, '').split('/').filter(Boolean).pop() || username;
  }
  if (!url) url = snsProfileUrl(platform, username);
  return { platform, username, url };
}

function snsProfileUrl(platform, username = '') {
  const clean = String(username || '').replace(/^@/, '').trim();
  if (!clean) return '';
  const bases = {
    instagram: 'https://www.instagram.com/',
    x: 'https://x.com/',
    threads: 'https://www.threads.net/@',
    tiktok: 'https://www.tiktok.com/@',
    bereal: 'https://bereal.com/',
    setlog: 'https://setlog.com/',
    facebook: 'https://www.facebook.com/',
    youtube: 'https://www.youtube.com/@',
    linkedin: 'https://www.linkedin.com/in/',
    note: 'https://note.com/'
  };
  return `${bases[platform] || ''}${encodeURIComponent(clean)}${platform === 'instagram' ? '/' : ''}`;
}

function snsAccountValue(account) {
  if (!account) return '';
  if (typeof account === 'string') return account;
  return JSON.stringify(account);
}

function snsDisplayName(account) {
  if (!account) return '未登録';
  if (typeof account === 'string') return account.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  return account.username ? `@${account.username}` : account.url || '登録済み';
}

function snsStatusLabel(account) {
  return account ? '登録済み' : '未登録';
}

function snsStatusMarkup(account) {
  if (!account) return '<span class="sns-status-text">未登録</span>';
  return '<span class="sns-status-check" aria-label="登録済み">✓</span>';
}

function profileDataFromForm(formData, current = {}) {
  const highSchool = String(formData.get('highSchool') || '').trim();
  const university = String(formData.get('university') || '').trim();
  const vocationalSchool = String(formData.get('vocationalSchool') || '').trim();
  const careerRoles = formData.getAll('careerRole[]');
  const careerCompanies = formData.getAll('careerCompany[]');
  const careerTypes = formData.getAll('careerType[]');
  const careerStartYears = formData.getAll('careerStartYear[]');
  const careerStartMonths = formData.getAll('careerStartMonth[]');
  const careerEndYears = formData.getAll('careerEndYear[]');
  const careerEndMonths = formData.getAll('careerEndMonth[]');
  const careerLocations = formData.getAll('careerLocation[]');
  const careerLogos = formData.getAll('careerLogo[]');
  const careerDomains = formData.getAll('careerDomain[]');
  const careerLogoUrls = formData.getAll('careerLogoUrl[]');
  const careers = careerRoles.map((role, index) => {
    const company = String(careerCompanies[index] || '').trim();
    const domain = String(careerDomains[index] || findCompanyDomain(company) || '').trim();
    const type = careerTypes[index] === 'current' ? 'current' : 'past';
    const startYear = String(careerStartYears[index] || '').trim();
    const startMonth = normalizeMonth(careerStartMonths[index] || '');
    const endYear = type === 'current' ? '' : String(careerEndYears[index] || '').trim();
    const endMonth = type === 'current' ? '' : normalizeMonth(careerEndMonths[index] || '');
    return {
      role: String(role || '').trim(),
      company,
      type,
      startYear,
      startMonth,
      endYear,
      endMonth,
      period: formatCareerPeriod({ startYear, startMonth, endYear, endMonth, type }),
      location: String(careerLocations[index] || '').trim(),
      logo: String(careerLogos[index] || findCompanyLogo(company) || '').trim(),
      domain,
      logoUrl: String(careerLogoUrls[index] || findCompanyLogoUrl(company, domain) || '').trim(),
      public: formData.get(`careerPublic-${index}`) !== 'false'
    };
  }).filter((career) => career.role || career.company || career.period || career.location);
  const primary = careers.find((career) => career.type === 'current') || {};
  const school = university || vocationalSchool || highSchool;
  const company = [primary.role, primary.company].filter(Boolean).join(' / ');
  return {
    ...current,
    name: String(formData.get('name') || '').trim(),
    handle: String(formData.get('handle') || '').trim().replace(/^@/, ''),
    highSchool,
    university,
    vocationalSchool,
    school,
    highSchoolPublic: formData.get('highSchoolPublic') === 'true',
    universityPublic: formData.get('universityPublic') === 'true',
    vocationalSchoolPublic: formData.get('vocationalSchoolPublic') === 'true',
    highSchoolCurrent: formData.get('highSchoolCurrent') === 'true',
    universityCurrent: formData.get('universityCurrent') === 'true',
    vocationalSchoolCurrent: formData.get('vocationalSchoolCurrent') === 'true',
    companyRole: primary.role || '',
    companyName: primary.company || '',
    companyPeriod: primary.period || '',
    companyLocation: primary.location || '',
    careers,
    company,
    location: String(formData.get('location') || '').trim(),
    birthday: String(formData.get('birthday') || '').trim(),
    schoolPublic: [formData.get('highSchoolPublic'), formData.get('universityPublic'), formData.get('vocationalSchoolPublic')].some((value) => value === 'true'),
    companyPublic: careers.some((career) => career.public !== false),
    locationPublic: formData.get('locationPublic') === 'true',
    birthdayPublic: formData.get('birthdayPublic') === 'true',
    sns: snsFromForm(formData),
    snsPublic: snsPublicFromForm(formData)
  };
}

function missingRequiredProfileFields(user = {}) {
  const missing = [];
  if (!String(user.name || '').trim()) missing.push('名前');
  if (!String(user.handle || '').trim()) missing.push('ユーザーID');
  if (!(user.school || user.company || normalizeCareers(user).length)) missing.push('学校または会社');
  return missing;
}

function statusBar() {
  return '';
}

function brand(small = false) {
  return `<div class="brand ${small ? 'brand-small' : ''}">B</div>`;
}

function avatar(type = 'man1', size = 58) {
  const source = {
    man1: 'man1.jpg',
    man2: 'man2.jpg',
    woman1: 'woman1.jpg',
    woman2: 'woman2.jpg',
    profile: 'profile.jpg'
  }[type] || 'man1.jpg';
  return `<div class="avatar ${type}" style="--size:${size}px"><img src="./assets/avatars/${source}" alt=""></div>`;
}

function profileAvatar(size = 58) {
  const user = currentUser();
  if (user.photo) {
    return `<div class="avatar profile-avatar" style="--size:${size}px"><img src="${user.photo}" alt=""></div>`;
  }
  return initialsAvatar(user.name || user.handle || user.email || 'あなた', size);
}

function initialsAvatar(name = 'ユーザー', size = 58) {
  const initials = String(name || 'ユーザー').trim().slice(0, 2).toUpperCase();
  return `<div class="avatar initial-avatar" style="--size:${size}px"><b>${escapeHtml(initials)}</b></div>`;
}

function personModalContent(person) {
  const name = person?.name || 'ユーザー';
  const avatarHtml = person?.photo
    ? `<div class="avatar" style="--size:70px"><img src="${escapeHtml(person.photo)}" alt=""></div>`
    : person?.avatar
      ? avatar(person.avatar, 70)
      : initialsAvatar(name, 70);
  const desc = person?.desc || '登録したプロフィール情報を確認できます。';
  const identity = person?.handle ? `@${person.handle}` : desc;
  const directConnection = directConnectionForPerson(person);
  const editableConnection = Boolean(directConnection?.requestId || (!person?.readOnly && person?.requestId));
  const editableRequestId = directConnection?.requestId || person?.requestId || '';
  const editableTag = directConnection?.tag || person?.tag || '';
  const editablePersonId = directConnection?.id || person?.id || '';
  return `
    <header class="person-modal-header">
      <div class="modal-avatar">${avatarHtml}</div>
      <div>
        <h2>${escapeHtml(name)}</h2>
        <p>${escapeHtml(identity)}</p>
      </div>
    </header>
    ${personProfileDetails(person)}
    ${editableConnection ? `
      <fieldset class="relationship-picker manage-relationship">
        <legend>関係を変更</legend>
        ${relationshipTypes().map((type) => `<label><input type="radio" name="manageRelationshipType" value="${escapeHtml(type)}" ${editableTag === type ? 'checked' : ''}>${type === '恋人' ? icon('heart', 15) : escapeHtml(type)}</label>`).join('')}
      </fieldset>
      <div class="connection-manage-actions">
        <button data-action="update-relationship" data-request-id="${escapeHtml(editableRequestId)}" data-person-id="${escapeHtml(editablePersonId)}">関係を保存</button>
        <button class="danger-button" data-action="remove-connection" data-request-id="${escapeHtml(editableRequestId)}" data-person-id="${escapeHtml(editablePersonId)}" data-relationship="${escapeHtml(editableTag)}">つながりを削除</button>
      </div>
    ` : ''}
    <button data-close>閉じる</button>
  `;
}

function personProfileDetails(person = {}) {
  const rows = [
    ['mapPin', '所在地', person.locationPublic ? (person.location || '未入力') : '非公開'],
    ['calendar', '誕生日', person.birthdayPublic ? (person.birthday || '未入力') : '非公開']
  ];
  return `
    <section class="person-detail-list">
      <div>${icon('grad', 20)}<span>学校</span><strong>${escapeHtml(educationSummary(person, { respectPrivacy: true }) || '未入力')}</strong></div>
      ${careerDisplay(person, 'compact', { respectPrivacy: true })}
      ${rows.map(([ic, label, value]) => `<div>${icon(ic, 20)}<span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}
      <div>${icon('link', 20)}<span>SNS</span><strong class="person-sns">${snsLinks({ sns: person.sns || {}, snsPublic: person.snsPublic || {} }, { respectPrivacy: true })}</strong></div>
    </section>
  `;
}

function personOverlayFromNode(node, fallbackName = 'ユーザー') {
  return {
    type: 'person',
    name: node?.name || fallbackName,
    avatar: node?.avatar,
    photo: node?.photo || '',
    desc: node?.desc || (node?.tag ? `${node.tag}のつながりです。` : '登録したプロフィール情報を確認できます。'),
    handle: node?.handle || '',
    tag: node?.tag,
    requestId: node?.requestId,
    readOnly: node?.readOnly ?? false,
    school: node?.school || '',
    highSchool: node?.highSchool || '',
    university: node?.university || '',
    vocationalSchool: node?.vocationalSchool || '',
    highSchoolPublic: node?.highSchoolPublic ?? node?.schoolPublic ?? true,
    universityPublic: node?.universityPublic ?? node?.schoolPublic ?? true,
    vocationalSchoolPublic: node?.vocationalSchoolPublic ?? node?.schoolPublic ?? true,
    highSchoolCurrent: node?.highSchoolCurrent ?? false,
    universityCurrent: node?.universityCurrent ?? false,
    vocationalSchoolCurrent: node?.vocationalSchoolCurrent ?? false,
    careers: normalizeCareers(node),
    company: node?.company || '',
    companyRole: node?.companyRole || '',
    companyName: node?.companyName || '',
    companyPeriod: node?.companyPeriod || '',
    companyLocation: node?.companyLocation || '',
    location: node?.location || '',
    birthday: node?.birthday || '',
    locationPublic: node?.locationPublic ?? true,
    birthdayPublic: node?.birthdayPublic ?? false,
    sns: node?.sns || {},
    snsPublic: node?.snsPublic || {}
  };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char]);
}

function loginScreen() {
  const mode = state.authMode;
  const rememberedEmail = escapeHtml(loadLastEmail() || authState.user?.email || state.user?.email || '');
  const authCopy = {
    signin: {
      title: 'おかえりなさい',
      lead: 'メールアドレスとパスワードでログイン',
      submit: 'ログイン',
      intent: 'signin',
      autocomplete: 'current-password'
    },
    signup: {
      title: '新規登録',
      lead: 'メール認証でアプリを始める',
      submit: '認証メールを送る',
      intent: 'signup',
      autocomplete: 'new-password'
    },
    forgot: {
      title: 'パスワード再設定',
      lead: '登録メールに再設定リンクを送ります',
      submit: '再設定メールを送る',
      intent: 'reset'
    },
    updatePassword: {
      title: '新しいパスワード',
      lead: 'これから使うパスワードを設定してください',
      submit: 'パスワードを更新',
      intent: 'update-password',
      autocomplete: 'new-password'
    }
  }[mode] || {};
  const needsPassword = mode !== 'forgot';
  const needsEmail = mode !== 'updatePassword';
  return `
    <main class="phone login-screen">
      ${statusBar()}
      <section class="login-brand">
        ${brand()}
        <h1>Bondy</h1>
        <p>人との出会いを、資産に。</p>
      </section>
      <form class="email-auth-form auth-card" data-auth-form>
        <div class="auth-card-title">
          <h2>${authCopy.title}</h2>
          <p>${authCopy.lead}</p>
        </div>
        ${needsEmail ? `<label>メールアドレス<input name="email" type="email" autocomplete="email" required placeholder="you@example.com" value="${rememberedEmail}"></label>` : ''}
        ${needsPassword ? `<label>パスワード<input name="password" type="password" autocomplete="${authCopy.autocomplete}" required minlength="8" placeholder="8文字以上"></label>` : ''}
        ${mode === 'signup' || mode === 'updatePassword' ? '<label>パスワード確認<input name="passwordConfirm" type="password" autocomplete="new-password" required minlength="8" placeholder="もう一度入力"></label>' : ''}
        <button class="pill primary ${state.authSubmitting ? 'is-loading' : ''}" name="intent" value="${authCopy.intent}" type="submit" ${state.authSubmitting ? 'disabled' : ''}>${state.authSubmitting ? '<span class="button-spinner"></span>ログイン中…' : `${mode === 'signin' ? '' : icon('mail', 25)}${authCopy.submit}`}</button>
        ${mode === 'signin' ? '<button class="auth-text-button" type="button" data-action="auth-mode" data-auth-mode="forgot">パスワードを忘れた方</button>' : ''}
        ${mode === 'signin' ? '<button class="pill secondary" type="button" data-action="auth-mode" data-auth-mode="signup">新規登録</button>' : '<button class="pill secondary" type="button" data-action="auth-mode" data-auth-mode="signin">ログインに戻る</button>'}
        ${authState.configured ? '' : '<p class="auth-note">メール認証を使うには Supabase の設定が必要です。</p>'}
      </form>
      ${mode === 'signin' ? `<section class="login-actions compact">
        <div class="divider"><span></span><em>または</em><span></span></div>
        <button class="social google" data-action="google-login"><b>G</b><span>Googleで続ける</span></button>
      </section>` : ''}
      <p class="terms">ログインすることで、利用規約とプライバシーポリシーに<br>同意したものとみなされます</p>
      <div class="home-indicator"></div>
    </main>
  `;
}

function registerScreen() {
  return `
    <main class="phone register-screen">
      ${statusBar()}
      <header class="register-header">
        ${brand(true)}
        <div>
          <h1>プロフィール登録</h1>
          <p>あなたの情報を入力して、アプリを始めましょう。</p>
        </div>
      </header>
      <form class="register-form" data-register-form>
        ${profileFormFields(currentUser())}
        <button class="pill primary" type="submit">${icon('userPlus', 22)}登録して始める</button>
      </form>
      <button class="register-reset" data-action="back-login">戻る</button>
      <div class="home-indicator"></div>
    </main>
  `;
}

function profileFormFields(user = normalizeUser({}), mode = 'register') {
  const careers = normalizeCareers(user);
  const currentCareer = careers.find((career) => career.type === 'current') || { role: '', company: '', type: 'current', startYear: '', startMonth: '', endYear: '', endMonth: '', period: '', location: '', logo: '', public: true };
  const pastCareerCards = careers.filter((career) => career.type !== 'current');
  return `
    <section class="form-section">
      <h2>基本情報</h2>
      <label><span class="field-label">名前<span class="required-mark">＊</span></span><input name="name" required value="${escapeHtml(user.name)}" placeholder="あなたの名前"></label>
      <label><span class="field-label">ユーザーID<span class="required-mark">＊</span></span><input name="handle" required value="${escapeHtml(user.handle)}" placeholder="好きなID"></label>
      ${profileEditRow('所在地', locationField('location', user.location, false), visibilityField('locationPublic', '所在地', user.locationPublic))}
      ${profileEditRow('誕生日', '<input name="birthday" type="date" value="' + escapeHtml(user.birthday) + '">', visibilityField('birthdayPublic', '誕生日', user.birthdayPublic))}
    </section>
    <section class="form-section profile-input-section">
      <h2>学歴 <span class="required-chip">学校または会社 必須</span></h2>
      <p class="form-section-note">学校または会社のどちらかを入力してください。学校を分けて入れると、つながりの共通点が見つけやすくなります。</p>
      ${educationEditRow('高校', educationTextField('highSchool', user.highSchool, '例：東京都立 Bondy 高校'), 'highSchoolPublic', user.highSchoolPublic, 'highSchoolCurrent', user.highSchoolCurrent)}
      ${educationEditRow('大学', universityField('university', user.university || user.school, false, false), 'universityPublic', user.universityPublic, 'universityCurrent', user.universityCurrent)}
      ${educationEditRow('専門学校', educationTextField('vocationalSchool', user.vocationalSchool, '例：Bondy デザイン専門学校'), 'vocationalSchoolPublic', user.vocationalSchoolPublic, 'vocationalSchoolCurrent', user.vocationalSchoolCurrent)}
    </section>
    <section class="form-section profile-input-section">
      <h2>現在の仕事 <span class="required-chip">学校または会社 必須</span></h2>
      <p class="form-section-note">いまの仕事や所属している会社を入力できます。</p>
      <div class="career-edit-list current-career-list">
        ${careerEditCard(currentCareer, 0, 'current')}
      </div>
    </section>
    <section class="form-section profile-input-section">
      <div class="form-section-title-row">
        <h2>今までの職歴</h2>
        <button type="button" class="icon-add-button" data-career-add aria-label="職歴を追加">${icon('plus', 22)}</button>
      </div>
      <p class="form-section-note">インターン、前職、プロジェクトなどを追加できます。</p>
      <div class="career-edit-list past-career-list">
        ${pastCareerCards.map((career, index) => careerEditCard(career, index + 1, 'past')).join('')}
      </div>
    </section>
    <fieldset class="form-section sns-fieldset">
      <legend>SNS</legend>
      <p class="sns-fieldset-note">入力したSNSは自分のプロフィールでは確認できます。公開にしたSNSだけ友達に表示されます。</p>
      ${snsFields().map(({ key, label, icon: snsIcon }) => `
        <div class="sns-edit-row">
          <input name="${key}" type="hidden" value="${escapeHtml(snsAccountValue(user.sns[key]))}">
          <button type="button" class="sns-register-button" data-sns-register="${escapeHtml(key)}" data-sns-label="${escapeHtml(label)}">
            <span class="sns-register-icon">${snsIcon}</span>
            ${snsStatusMarkup(user.sns[key])}
          </button>
          ${visibilityField(`${key}Public`, label, user.snsPublic[key])}
        </div>
      `).join('')}
    </fieldset>
    <section class="form-section">
      <h2>写真</h2>
      <label>プロフィール写真<input name="photo" type="file" accept="image/*"></label>
      ${mode === 'edit' && user.photo ? '<p class="form-note">新しい写真を選ばない場合、現在の写真を使います。</p>' : ''}
    </section>
  `;
}

function careerEditCard(career = {}, index = 0, type = 'past') {
  const company = career.company || '';
  const logo = career.logo || findCompanyLogo(company);
  const isCurrent = type === 'current';
  const careerWithType = { ...career, type: isCurrent ? 'current' : 'past' };
  return `
    <div class="career-edit-card ${isCurrent ? 'is-current-career' : ''}">
      <div class="sns-edit-head">
        <span><b>${isCurrent ? '現在' : `経歴 ${index}`}</b></span>
        <div class="career-edit-actions">
          ${careerVisibilityField(index, career.public ?? true)}
          ${isCurrent ? '' : `<button type="button" class="career-remove-button" data-career-remove aria-label="職歴を削除">${icon('x', 17)}</button>`}
        </div>
      </div>
      <input type="hidden" name="careerType[]" value="${isCurrent ? 'current' : 'past'}">
      <input name="careerRole[]" value="${escapeHtml(career.role || '')}" placeholder="職種・役割 例：Solution Engineer">
      ${companyField(company, logo, career.domain || findCompanyDomain(company), career.logoUrl || findCompanyLogoUrl(company, career.domain))}
      ${careerDateSelects(careerWithType, isCurrent ? 'current' : 'past')}
      <input name="careerLocation[]" value="${escapeHtml(career.location || '')}" placeholder="場所 例：日本 東京都 品川区">
    </div>
  `;
}

function profileEditRow(label, control, visibility) {
  return `
    <div class="profile-edit-row">
      <div class="sns-edit-head">
        <span><b>${escapeHtml(label)}</b></span>
        ${visibility}
      </div>
      ${control}
    </div>
  `;
}

function educationEditRow(label, control, visibilityName, isPublic, currentName, isCurrent) {
  return profileEditRow(label, `
    <div class="education-edit-control">
      ${control}
      <label class="current-school-check">
        <input type="checkbox" name="${currentName}" value="true" ${isCurrent ? 'checked' : ''}>
        <span>現在在学中</span>
      </label>
    </div>
  `, visibilityField(visibilityName, label, isPublic));
}

function careerVisibilityField(index, isPublic) {
  return visibilityField(`careerPublic-${index}`, `職歴${index + 1}`, isPublic);
}

function universityField(name, value = '', showLabel = true, required = true) {
  const label = value || '学校名を検索して選択';
  return `
    <label class="university-field education-field ${value ? 'has-school' : ''}">${showLabel ? '学校' : ''}
      <input type="hidden" name="${name}" value="${escapeHtml(value)}" ${required ? 'required' : ''}>
      <div class="education-field-control">
        <button type="button" class="university-select" data-university-open>
          <span>${escapeHtml(label)}</span>
          ${icon('chevronDown', 18)}
        </button>
        <button type="button" class="school-clear-button" data-school-clear aria-label="学校を削除">${icon('x', 16)}</button>
      </div>
    </label>
  `;
}

function educationTextField(name, value = '', placeholder = '') {
  return `
    <label class="education-field ${value ? 'has-school' : ''}">
      <div class="education-field-control">
        <input name="${name}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}">
        <button type="button" class="school-clear-button" data-school-clear aria-label="学校を削除">${icon('x', 16)}</button>
      </div>
    </label>
  `;
}

function companyField(value = '', logo = '', domainValue = '', logoUrlValue = '') {
  const label = value || '企業を選択または入力';
  const domain = domainValue || findCompanyDomain(value);
  const logoUrl = logoUrlValue || findCompanyLogoUrl(value, domain);
  return `
    <label class="company-field ${value ? 'has-company' : ''}">
      <input type="hidden" name="careerCompany[]" value="${escapeHtml(value)}">
      <input type="hidden" name="careerLogo[]" value="${escapeHtml(logo || findCompanyLogo(value))}">
      <input type="hidden" name="careerDomain[]" value="${escapeHtml(domain)}">
      <input type="hidden" name="careerLogoUrl[]" value="${escapeHtml(logoUrl)}">
      <div class="company-field-control">
        <button type="button" class="university-select company-select" data-company-open>
          <span><b>${escapeHtml(label)}</b></span>
          ${icon('chevronDown', 18)}
        </button>
        <button type="button" class="company-clear-button" data-company-clear aria-label="会社を削除">${icon('x', 16)}</button>
      </div>
    </label>
  `;
}

function locationField(name, value = '', showLabel = true) {
  const label = value || '地域を選択';
  return `
    <label class="location-field">${showLabel ? '所在地' : ''}
      <input type="hidden" name="${name}" value="${escapeHtml(value)}">
      <button type="button" class="university-select location-select" data-location-open>
        <span>${escapeHtml(label)}</span>
        ${icon('chevronDown', 18)}
      </button>
    </label>
  `;
}

function visibilityField(name, label, isPublic) {
  return `
    <fieldset class="visibility-field">
      <legend>${label}</legend>
      <label><input type="radio" name="${name}" value="true" ${isPublic ? 'checked' : ''}>公開</label>
      <label><input type="radio" name="${name}" value="false" ${!isPublic ? 'checked' : ''}>非公開</label>
    </fieldset>
  `;
}

function appScreen() {
  return `
    <main class="phone app-phone ${state.screen}-screen">
      ${statusBar()}
      ${state.screen === 'map' ? mapScreen() : ''}
      ${state.screen === 'connections' ? connectionsScreen() : ''}
      ${state.screen === 'intro' ? introScreen() : ''}
      ${state.screen === 'profile' ? profileScreen() : ''}
      ${state.screen === 'settings' ? settingsScreen() : ''}
      ${state.screen === 'editProfile' ? editProfileScreen() : ''}
      ${['settings', 'editProfile'].includes(state.screen) ? '' : bottomNav()}
      <div class="home-indicator"></div>
    </main>
  `;
}

function appHeader(title = '', extra = '') {
  return extra ? `<div class="app-actions">${extra}</div>` : '';
}

function topHeader(title, extra = '') {
  return appHeader(title, extra);
}

function mapScreen() {
  if (state.mapCategoryDetail) return mapCategoryDetailScreen(state.mapCategoryDetail);
  const searchResults = mapSearchResults();
  return `
    <header class="map-lux-header">
      <h1>Bondy</h1>
      <div class="map-lux-actions">
        <button class="map-search-trigger" type="button" data-action="toggle-map-search" aria-label="検索">${icon('search', 34)}</button>
        ${profileAvatar(46)}
      </div>
    </header>
    <aside class="map-category-sidebar">
      ${mapFilters().map(mapSidebarButton).join('')}
    </aside>
    <section class="map-search-shell ${state.mapSearchOpen || state.mapQuery.trim() ? 'has-query' : ''}">
        <label class="map-search-box">
          ${icon('search', 17)}
          <input type="search" value="${escapeHtml(state.mapQuery)}" placeholder="名前・ID・会社・学校などを入力" data-map-search autocomplete="off">
        </label>
        ${mapSearchResultsMarkup(searchResults)}
    </section>
    <section class="map-interactive-panel">
      ${networkGraph([])}
    </section>
    <div class="map-floating-buttons">
      <button type="button" data-action="scan-qr" aria-label="QR交換">${icon('qr', 23)}<span>QR交換</span></button>
      <button class="primary-map-action" type="button" data-action="add" aria-label="追加">${icon('plus', 31)}</button>
      <button type="button" data-action="open-add-menu" aria-label="招待">${icon('userPlus', 23)}<span>招待</span></button>
      <button type="button" data-action="share-profile" aria-label="名刺交換">${icon('document', 23)}<span>名刺交換</span></button>
    </div>
  `;
}

function switchButton(label, ic) {
  return `<button class="${state.mapMode === label ? 'active' : ''}" data-mode="${label}">${icon(ic, 23)}${label}</button>`;
}

function chipIcon(filter) {
  return icon({ 'すべて': 'home', '大学': 'grad', 'ビジネス': 'brief', '地元': 'mapPin', '家族': 'users', 'イベント': 'flag', '恋人': 'heart' }[filter], 18);
}

function chipLabel(filter) {
  return filter === '恋人' ? '' : filter === 'イベント' ? '<span class="event-chip-label"><b>イベント</b><small>留学 趣味・活動</small></span>' : filter;
}

function mapFilters() {
  return ['すべて', '家族', '地元', '大学', 'イベント', 'ビジネス', '恋人'];
}

function relationshipColor(type) {
  return {
    'すべて': '#111111',
    '大学': '#8D63FF',
    'ビジネス': '#4DA3FF',
    '地元': '#55C34A',
    '家族': '#FF5C5C',
    'イベント': '#F4A623',
    '恋人': '#FF72B6',
    'あなた': '#94a3b8',
    '紹介': '#111111'
  }[type] || '#111111';
}

function relationshipTint(type) {
  return {
    'すべて': '#ffffff',
    '大学': '#ffffff',
    'ビジネス': '#ffffff',
    '地元': '#ffffff',
    '家族': '#ffffff',
    'イベント': '#ffffff',
    '恋人': '#ffffff'
  }[type] || '#ffffff';
}

function mapFilterLabel(filter) {
  if (filter === '恋人') return '♡';
  if (filter === '大学') return '学校';
  return filter === 'すべて' ? 'すべて' : escapeHtml(filter);
}

function mapSidebarButton(filter) {
  const selected = state.filter === filter;
  return `
    <button class="map-side-button ${selected ? 'selected' : ''} ${filter === '恋人' ? 'heart-side-button' : ''}" type="button" data-filter="${escapeHtml(filter)}" style="--cat-color:${relationshipColor(filter)}">
      ${chipIcon(filter)}
      <span>${mapFilterLabel(filter)}</span>
    </button>
  `;
}

function mapFilterOption(filter) {
  const selected = state.filter === filter;
  const label = mapFilterLabel(filter);
  return `<button class="filter-choice ${selected ? 'selected' : ''} ${filter === '恋人' ? 'heart-filter-button' : ''}" style="--filter-color:${relationshipColor(filter)};--filter-bg:${relationshipTint(filter)}" data-filter="${escapeHtml(filter)}" aria-label="${escapeHtml(filter)}">${label}</button>`;
}

function connectionRowsData() {
  return uniquePeopleByIdentity(state.connections || []);
}

function mapSearchPeoplePool() {
  return uniquePeopleByIdentity([
    ...connectionRowsData(),
    ...Object.values(state.mapCenterConnections || {}).flat()
  ]).filter((person) => person.id && person.id !== authState.user?.id);
}

function personSearchText(person = {}) {
  return [
    person.name,
    person.handle,
    person.desc,
    person.common,
    person.tag,
    person.school,
    person.highSchool,
    person.university,
    person.vocationalSchool,
    person.company,
    person.companyRole,
    person.companyName,
    person.companyPeriod,
    person.companyLocation,
    person.location,
    person.birthday,
    careerSummary(person),
    ...(careerItems(person, { respectPrivacy: true }) || []).flatMap((career) => [career.role, career.company, career.period, career.location])
  ].filter(Boolean).join(' ').toLowerCase();
}

function mapSearchResults() {
  const query = state.mapQuery.trim().toLowerCase();
  if (!query) return [];
  return mapSearchPeoplePool()
    .filter((person) => personSearchText(person).includes(query))
    .slice(0, 8);
}

function mapSearchResultsMarkup(results = mapSearchResults()) {
  if (!state.mapQuery.trim()) return '';
  return `<div class="map-search-results">${results.length ? results.map(mapSearchResultRow).join('') : '<p>見つかりませんでした</p>'}</div>`;
}

function mapSearchResultRow(person) {
  const canCenter = connectionRowsData().some((connection) => connection.id === person.id);
  return `
    <button class="map-search-result" type="button" data-map-search-person="${escapeHtml(person.id)}" data-centerable="${canCenter ? 'true' : 'false'}">
      ${personAvatar(person, 34)}
      <span><b>${escapeHtml(person.name || person.handle || 'ユーザー')}</b><small>${escapeHtml(person.handle ? `@${person.handle}` : person.desc || relationshipLabel(person.tag))}</small></span>
      <em>${canCenter ? '中心にする' : 'プロフィール'}</em>
    </button>
  `;
}

function mapCategoryDetailScreen(filter) {
  const item = mapCategoryItems().find((category) => category.filter === filter) || mapCategoryItems()[0];
  const people = categoryPeople(filter);
  const searchResults = mapSearchResults();
  const count = displayCategoryCount(filter, item.fallbackCount);
  return `
    <header class="category-detail-header">
      <button class="category-detail-back" type="button" data-action="back-map-overview" aria-label="戻る">${icon('chevronLeft', 34)}</button>
      <h1>${escapeHtml(item.label)}のつながり</h1>
      <div class="map-lux-actions">
        <button class="map-search-trigger" type="button" data-action="toggle-map-search" aria-label="検索">${icon('search', 34)}</button>
        ${profileAvatar(46)}
      </div>
    </header>
    <section class="map-search-shell ${state.mapSearchOpen || state.mapQuery.trim() ? 'has-query' : ''}">
      <label class="map-search-box">
        ${icon('search', 17)}
        <input type="search" value="${escapeHtml(state.mapQuery)}" placeholder="名前・ID・会社・学校などを入力" data-map-search autocomplete="off">
      </label>
      ${mapSearchResultsMarkup(searchResults)}
    </section>
    <section class="category-detail-map" style="--cat-color:${item.color}">
      <div class="detail-orbits" aria-hidden="true"></div>
      <svg class="detail-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        ${categoryDetailNodes(people, item).map((node) => `<line x1="50" y1="50" x2="${node.x}" y2="${node.y}" />`).join('')}
      </svg>
      <div class="detail-center">
        <span class="detail-center-avatar">${profileAvatar(112)}</span>
        <b>あなた</b>
        <span><i></i>${escapeHtml(item.label)}のつながり ${count}人</span>
      </div>
      ${categoryDetailNodes(people, item).map(categoryDetailNode).join('')}
      ${categoryMoreNodes(people, item)}
    </section>
    <div class="map-floating-buttons category-detail-actions">
      <button type="button" data-action="scan-qr" aria-label="QR交換">${icon('qr', 23)}<span>QR交換</span></button>
      <button class="primary-map-action" type="button" data-action="add" aria-label="追加">${icon('plus', 31)}</button>
      <button type="button" data-action="open-add-menu" aria-label="招待">${icon('userPlus', 23)}<span>招待</span></button>
      <button type="button" data-action="share-profile" aria-label="名刺交換">${icon('document', 23)}<span>名刺交換</span></button>
    </div>
    <nav class="category-detail-switcher">
      ${mapCategoryItems().map((category) => {
        const active = category.filter === filter;
        const categoryCountValue = displayCategoryCount(category.filter, category.fallbackCount);
        return `<button class="${active ? 'active' : ''}" type="button" data-map-category-detail="${escapeHtml(category.filter)}" style="--cat-color:${category.color}">${icon(category.iconName, 24)}<span>${escapeHtml(category.label)}</span><b>${categoryCountValue}人</b></button>`;
      }).join('')}
      <button type="button" data-action="back-map-overview">${icon('grid', 24)}<span>すべて</span></button>
    </nav>
  `;
}

function categoryPeople(filter) {
  return connectionRowsData().filter((person) => person.tag === filter);
}

function categoryDetailNodes(people, item) {
  const fallback = [
    { name: '田中 莉子', desc: '株式会社LayerX', companyRole: 'プロダクトマネージャー', avatar: 'woman1' },
    { name: '佐藤 大輔', desc: 'Salesforce Japan', companyRole: 'ソリューションエンジニア', avatar: 'man1' },
    { name: '山本 彩', desc: 'Google Japan', companyRole: 'マーケティング', avatar: 'woman2' },
    { name: '鈴木 健太', desc: '株式会社SmartHR', companyRole: 'カスタマーサクセス', avatar: 'man2' },
    { name: '中村 優太', desc: '株式会社リクルート', companyRole: '法人営業', avatar: 'man1' },
    { name: '伊藤 美咲', desc: '株式会社メルカリ', companyRole: 'データアナリスト', avatar: 'woman1' }
  ].map((person) => ({ ...person, tag: item.filter }));
  const source = people.length ? people : fallback;
  const positions = [
    [50, 21], [74, 34], [72, 62], [50, 78], [28, 62], [26, 34]
  ];
  return source.slice(0, 6).map((person, index) => ({
    ...person,
    x: positions[index]?.[0] || 50,
    y: positions[index]?.[1] || 50,
    color: item.color
  }));
}

function categoryDetailNode(person) {
  return `
    <button class="category-detail-node" type="button" data-person-id="${escapeHtml(person.id || person.name)}" style="--x:${person.x}%;--y:${person.y}%;--cat-color:${person.color}">
      ${personAvatar(person, 58)}
      <b>${escapeHtml(person.name || person.handle || 'ユーザー')}</b>
      <small>${escapeHtml(person.desc || person.company || '')}</small>
      <em>${escapeHtml(person.companyRole || person.companyName || relationshipLabel(person.tag))}</em>
    </button>
  `;
}

function categoryMoreNodes(people, item) {
  const remaining = Math.max(0, displayCategoryCount(item.filter, item.fallbackCount) - 6);
  if (!remaining) return '';
  return `<span class="category-detail-more" style="--cat-color:${item.color}">+${remaining}人</span>`;
}

function mapNodeData() {
  const positions = [
    [50, 18], [74, 30], [80, 58], [68, 78], [50, 84], [30, 78],
    [20, 58], [27, 30], [88, 44], [12, 44], [38, 16], [62, 16]
  ];
  return connectionRowsData().map((person, index) => {
    const [x, y] = positions[index % positions.length];
    const saved = state.mapNodePositions[person.id] || {};
    return {
      ...person,
      x: Number.isFinite(saved.x) ? saved.x : x,
      y: Number.isFinite(saved.y) ? saved.y : y,
      color: relationshipColor(person.tag),
      centerable: state.mapCenter === 'you'
    };
  });
}

function networkGraph(nodes) {
  const categories = mapCategoryItems();
  return `
    <section class="network" data-map-workspace>
      <div class="map-canvas" data-map-canvas style="transform:none">
        <div class="diorama-rings" aria-hidden="true"></div>
        <svg class="diorama-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          ${categories.map((item) => `<line x1="50" y1="47" x2="${item.lineX}" y2="${item.lineY}" />`).join('')}
        </svg>
        <div class="diorama-center" aria-label="あなた">
          <span class="center-avatar-ring">${profileAvatar(104)}</span>
          <b>あなた</b>
          <span class="center-connection-pill"><i></i>つながり ${mapTotalCount()}人</span>
        </div>
        ${categories.map(categoryIsland).join('')}
      </div>
    </section>
  `;
}

function mapCategoryItems() {
  return [
    { key: 'family', filter: '家族', label: '家族', fallbackCount: 15, iconName: 'users', color: '#F06292', x: 29, y: 25, lineX: 37, lineY: 35 },
    { key: 'local', filter: '地元', label: '地元', fallbackCount: 32, iconName: 'mapPin', color: '#20C997', x: 70, y: 25, lineX: 62, lineY: 35 },
    { key: 'business', filter: 'ビジネス', label: 'ビジネス', fallbackCount: 78, iconName: 'brief', color: '#2BA7E8', x: 22, y: 48, lineX: 36, lineY: 48 },
    { key: 'school', filter: '大学', label: '学校', fallbackCount: 48, iconName: 'grad', color: '#A35BEE', x: 78, y: 48, lineX: 64, lineY: 48 },
    { key: 'heart', filter: '恋人', label: '♡', fallbackCount: 8, iconName: 'heart', color: '#F55F9F', x: 31, y: 70, lineX: 40, lineY: 60 },
    { key: 'event', filter: 'イベント', label: 'イベント', fallbackCount: 25, iconName: 'flag', color: '#F6A623', x: 66, y: 70, lineX: 60, lineY: 60 }
  ];
}

function categoryCount(filter) {
  return connectionRowsData().filter((person) => person.tag === filter).length;
}

function displayCategoryCount(filter, fallback = 0) {
  const totalConnections = connectionRowsData().length;
  const count = categoryCount(filter);
  return totalConnections ? count : fallback;
}

function mapTotalCount() {
  const total = connectionRowsData().length;
  return total || 243;
}

function categoryIsland(item) {
  const count = displayCategoryCount(item.filter, item.fallbackCount);
  return `
    <button class="category-island category-${item.key} ${state.filter === item.filter ? 'is-selected' : ''}" type="button" data-map-category-detail="${escapeHtml(item.filter)}" style="--x:${item.x}%;--y:${item.y}%;--cat-color:${item.color}">
      <span class="category-card-glow" aria-hidden="true"></span>
      <span class="category-card">
        <span class="category-card-main">
          <span class="category-card-icon">${icon(item.iconName, 31)}</span>
          <span class="category-card-copy">
            <b>${escapeHtml(item.label)}</b>
            <strong>${count}人</strong>
          </span>
        </span>
        <span class="category-card-bottom">
          <span class="category-face-stack">${categoryFaceStack(item.filter)}</span>
          <span class="category-arrow">${icon('chevronRight', 18)}</span>
        </span>
      </span>
    </button>
  `;
}

function categoryFaceStack(filter) {
  const faces = connectionRowsData().filter((person) => person.tag === filter).slice(0, 3);
  const fallback = [
    { avatar: 'man1', name: 'A' },
    { avatar: 'woman1', name: 'B' },
    { avatar: 'woman2', name: 'C' }
  ];
  return (faces.length ? faces : fallback).slice(0, 3).map((person, index) => {
    const html = person.photo
      ? `<span class="category-face"><img src="${escapeHtml(person.photo)}" alt=""></span>`
      : person.avatar
        ? `<span class="category-face">${avatar(person.avatar, 28)}</span>`
        : personAvatar(person, 28).replace('class="avatar', 'class="category-face avatar');
    return `<span class="category-face-wrap" style="--face-index:${index}">${html}</span>`;
  }).join('');
}

function categoryDioramaMarkup(key) {
  const iconName = {
    family: 'users',
    local: 'mapPin',
    school: 'grad',
    business: 'brief',
    event: 'flag',
    heart: 'heart'
  }[key] || 'users';
  return `
    <span class="premium-category-object premium-${key}">
      <i class="premium-shadow"></i>
      <i class="premium-orbit orbit-back"></i>
      <i class="premium-plinth">
        <i class="premium-plinth-top"></i>
        <i class="premium-plinth-face"></i>
        <i class="premium-core-glow"></i>
      </i>
      <span class="premium-symbol">${icon(iconName, 34)}</span>
      <i class="premium-orbit orbit-front"></i>
      <i class="premium-spark spark-a"></i>
      <i class="premium-spark spark-b"></i>
      <i class="premium-spark spark-c"></i>
    </span>
  `;
}

function categoryLabelMarkup(item) {
  if (item.key === 'heart') {
    return `<span class="category-label category-label-compact">${icon(item.iconName, 23)}<span><small>${item.count}人</small></span></span>`;
  }
  return `<span class="category-label">${icon(item.iconName, 23)}<span>${escapeHtml(item.label)}<small>${item.count}人</small></span></span>`;
}

function mapConnectionLine(node, index) {
  const key = escapeHtml(node.id || node.name);
  const color = escapeHtml(node.color || '#111');
  return `
    <line class="line-base" data-line-node="${key}" x1="50" y1="50" x2="${node.x}" y2="${node.y}" stroke="${color}" />
    <line class="line-flow" data-flow-node="${key}" style="--flow-delay:${(index * -0.18).toFixed(2)}s" x1="50" y1="50" x2="${node.x}" y2="${node.y}" stroke="${color}" />
  `;
}

function relationshipLabel(value) {
  return value === '恋人' ? '♡' : (value || 'つながり');
}

function mapRelationshipMark(value) {
  return escapeHtml({
    '大学': '学',
    'ビジネス': '仕',
    '地元': '地',
    '家族': '家',
    'イベント': '旗',
    '恋人': '♡',
    'あなた': '自'
  }[value] || 'B');
}

function mapCanvasStyle() {
  return `transform: translate3d(${state.mapPan.x}px, ${state.mapPan.y}px, 0) scale(${state.zoom})`;
}

function mapVisibleNodes() {
  if (state.mapCenter === 'you') {
    return mapNodeData().map((node) => {
      node.centerable = true;
      return node;
    });
  }
  const rows = state.mapCenterConnections[state.mapCenter] || [];
  return rows.map((person, index) => {
    const angle = (-90 + (360 / Math.max(rows.length, 1)) * index) * Math.PI / 180;
    const radius = rows.length > 8 ? 35 : 31;
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    const saved = state.mapNodePositions[person.id] || {};
    return {
      ...person,
      x: Number.isFinite(saved.x) ? saved.x : x,
      y: Number.isFinite(saved.y) ? saved.y : y,
      color: relationshipColor(person.tag),
      centerable: false
    };
  });
}

function personByIdOrName(value) {
  const mapCenterRows = Object.values(state.mapCenterConnections || {}).flat();
  return connectionRowsData().find((person) => person.id === value || person.name === value)
    || mapCenterRows.find((person) => person.id === value || person.name === value)
    || state.requests.find((person) => person.id === value || person.name === value);
}

function personAvatar(person, size = 58) {
  if (person?.photo) return `<div class="avatar" style="--size:${size}px"><img src="${escapeHtml(person.photo)}" alt=""></div>`;
  if (person?.avatar) return avatar(person.avatar, size);
  return initialsAvatar(person?.name || 'ユーザー', size);
}

function mapCenterProfile() {
  const user = currentUser();
  if (state.mapCenter === 'you') {
    return {
      name: user.name || user.handle || 'あなた',
      badge: 'あなた',
      avatar: 'user'
    };
  }
  const selected = personByIdOrName(state.mapCenter) || connectionRowsData()[0] || {};
  return {
    name: selected.name || 'ユーザー',
    badge: selected.tag || 'つながり',
    avatar: selected.avatar,
    photo: selected.photo
  };
}

function mapCenterAvatar(center = mapCenterProfile()) {
  if (center.photo) return `<div class="avatar profile-avatar" style="--size:82px"><img src="${escapeHtml(center.photo)}" alt=""></div>`;
  if (center.avatar === 'user') return profileAvatar(82);
  return avatar(center.avatar, 82);
}

async function withButtonPending(button, label, task) {
  if (!button) return task();
  if (button.disabled) return false;
  const originalHtml = button.innerHTML;
  const originalWidth = button.offsetWidth;
  button.disabled = true;
  button.classList.add('is-saving');
  if (originalWidth) button.style.minWidth = `${originalWidth}px`;
  button.textContent = label;
  try {
    return await task();
  } finally {
    button.disabled = false;
    button.classList.remove('is-saving');
    button.style.minWidth = '';
    button.innerHTML = originalHtml;
  }
}

function animateNodePress(button, options = {}) {
  if (!button) return Promise.resolve();
  const duration = options.pressDuration || 170;
  const scale = options.scale || 1.12;
  return new Promise((resolve) => {
    if (!button.animate) {
      window.setTimeout(resolve, duration);
      return;
    }
    const animation = button.animate([
      { transform: 'translate(-50%, -29px) scale(1)', filter: 'brightness(1)' },
      { transform: `translate(-50%, -29px) scale(${scale})`, filter: 'brightness(1.14)' },
      { transform: 'translate(-50%, -29px) scale(1)', filter: 'brightness(1)' }
    ], {
      duration,
      easing: 'cubic-bezier(.22, 1, .36, 1)'
    });
    animation.onfinish = resolve;
    animation.oncancel = resolve;
  });
}

function animateNodeToCenter(button, options = {}) {
  return animateNodePress(button, options);
}

function mapList() {
  const rows = state.mapMode === 'リスト'
    ? emptyPanel('まだつながりはありません', '新しい人を追加すると、ここに一覧で表示されます。')
    : emptyPanel('タイムラインは空です', 'つながりが増えると、出会いや紹介の履歴がここに並びます。');
  return `<section class="mode-panel"><h3>${state.mapMode}</h3>${rows}</section>`;
}

function emptyPanel(title, body) {
  return `<div class="empty-state">${icon('users', 34)}<h4>${title}</h4><p>${body}</p></div>`;
}

function connectionsScreen() {
  const filters = ['すべて', '大学', 'ビジネス', '地元', '家族', 'イベント', '恋人'];
  const rows = filteredConnectionRows();
  return `
    <section class="connection-filter-bar">
      <div class="connection-filter-scroll">
        ${filters.map((filter) => `<button class="${state.connectionFilter === filter ? 'active' : ''} ${filter === '恋人' ? 'heart-chip' : ''}" data-connection-filter="${filter}" aria-label="${filter}">${chipIcon(filter)}${chipLabel(filter)}</button>`).join('')}
      </div>
      <label class="connection-search">
        ${icon('search', 18)}
        <input type="search" value="${escapeHtml(state.connectionQuery)}" placeholder="つながりを検索" data-connection-search autocomplete="off">
      </label>
    </section>
    <section class="connections-list">${connectionsListContent(rows)}</section>
  `;
}

function filteredConnectionRows() {
  const allRows = connectionRowsData();
  const filteredRows = state.connectionFilter === 'すべて'
    ? allRows
    : allRows.filter((person) => person.tag === state.connectionFilter);
  const rawQuery = state.connectionQuery.trim();
  const query = rawQuery.toLowerCase();
  if (!query) return filteredRows;
  return filteredRows.filter((person) => {
    const haystack = [person.name, person.desc, person.common, person.tag, person.school, person.highSchool, person.university, person.vocationalSchool, person.company, person.companyRole, person.companyName, person.companyLocation, careerSummary(person), person.location]
      .filter(Boolean)
      .join(' ');
    return haystack.toLowerCase().includes(query) || haystack.includes(rawQuery);
  });
}

function connectionsListContent(rows = filteredConnectionRows()) {
  return rows.length
    ? rows.map(connectionRow).join('')
    : emptyPanel('該当するつながりはありません', '種類や検索ワードを変えると一覧を切り替えられます。');
}

function connectionRow(person) {
  return `
    <article class="connection-row" data-person-id="${escapeHtml(person.id || '')}" data-person="${escapeHtml(person.name)}">
      ${personAvatar(person, 58)}
      <button class="connection-copy" type="button">
        <h3>${escapeHtml(person.name)}${connectionTag(person.tag)}</h3>
        <p>${escapeHtml(person.desc)}</p>
      </button>
      <time>${escapeHtml(person.time)}</time>
      ${icon('chevronRight', 25)}
    </article>
  `;
}

function connectionTag(tag) {
  return tag === '恋人'
    ? `<small aria-label="恋人">${icon('heart', 15)}</small>`
    : `<small>${escapeHtml(tag)}</small>`;
}

function pendingIntroRequests() {
  return state.requests.filter((request) => !state.handledRequests[request.id]);
}

function introScreen() {
  const pendingCount = pendingIntroRequests().length;
  const hasIntroNotice = pendingCount > 0 || state.notifications.length > 0;
  return `
    ${appHeader('', `${buttonIcon('search', 'search')}${buttonIcon('bell', 'notifications', hasIntroNotice ? 'dot' : '')}`)}
    <div class="screen-tabs tabs">
      ${['申請', '紹介された', '紹介した'].map((tab) => `<button class="${state.introTab === tab ? 'active' : ''}" data-tab="${tab}">${tab}${tab === '申請' && pendingCount ? `<b>${pendingCount}</b>` : ''}</button>`).join('')}
    </div>
    <section class="request-list">
      ${introRows()}
    </section>
  `;
}

function introRows() {
  if (state.introTab !== '申請') {
    return `<div class="intro-empty">${emptyPanel(`${state.introTab}はまだありません`, '紹介が届くとここに表示されます。')}</div>`;
  }
  if (!state.requests.length) {
    return `<div class="intro-empty">${emptyPanel('申請はまだありません', '紹介申請が届くと、承認や拒否をここで管理できます。')}</div>`;
  }
  return state.requests.map((person) => {
    const handled = state.handledRequests[person.id];
    const requestAvatar = person.photo
      ? `<div class="avatar" style="--size:58px"><img src="${escapeHtml(person.photo)}" alt=""></div>`
      : initialsAvatar(person.name, 58);
    return `
      <article class="request-row ${handled ? 'handled' : ''}">
        <button class="request-avatar-button" data-person-id="${person.id}" data-person="${escapeHtml(person.name)}" aria-label="${escapeHtml(person.name)}のプロフィールを見る">${requestAvatar}</button>
        <button class="request-copy" data-person-id="${person.id}" data-person="${escapeHtml(person.name)}">
          <h3>${escapeHtml(person.name)}<small>${escapeHtml(person.tag)}</small></h3>
          <p>${escapeHtml(person.desc)}</p>
          <p>共通のつながり：${escapeHtml(person.common)}</p>
        </button>
        <div class="request-side">
          <time>${person.time} ${icon('chevronRight', 18)}</time>
          ${handled ? `<span>${handled}済み</span>` : `<div><button data-request="${person.id}" data-result="拒否">拒否</button><button class="accept" data-request="${person.id}" data-result="承認">承認</button></div>`}
        </div>
      </article>
    `;
  }).join('');
}

function profileScreen() {
  const user = currentUser();
  return `
    <header class="profile-actions">
      <span></span>
      <button class="profile-more-button" data-action="settings" aria-label="設定">...</button>
    </header>
    <section class="profile-hero">
      <label class="profile-photo direct-photo-picker" aria-label="プロフィール写真を変更">${profileAvatar(104)}<input type="file" accept="image/*" data-photo-input><span>${icon('camera', 20)}</span></label>
      <div class="profile-identity">
        <h1>${escapeHtml(user.name || '未設定')} <span>登録済み</span></h1>
        <p>@${escapeHtml(user.handle || 'your.id')}</p>
        <div class="profile-quick-actions">
          <button class="profile-share-button" data-action="edit">プロフィールを編集</button>
          <button class="profile-share-button" data-action="share-profile">プロフィールを共有</button>
        </div>
      </div>
    </section>
    <section class="info-rows">
      ${educationDisplay(user, { editable: true })}
      ${careerDisplay(user, '', { editable: true })}
      ${infoRow('mapPin', '所在地', user.locationPublic ? (user.location || '未入力') : '非公開', 'locationPublic', user.locationPublic)}
      ${infoRow('calendar', '誕生日', user.birthdayPublic ? (user.birthday || '未入力') : '非公開', 'birthdayPublic', user.birthdayPublic)}
      <div class="info-row">${icon('link', 25)}<span>SNS</span><strong class="sns">${snsLinks(user, { respectPrivacy: false })}</strong></div>
    </section>
    <section class="stats-card profile-stats">${[['users', 'つながり', String(connectionRowsData().length)], ['user', '共通の知人', '0'], ['users', 'グループ', '0']].map(([ic, label, value]) => `<div>${icon(ic, 28)}<span>${label}</span><b>${value}</b></div>`).join('')}</section>
  `;
}

function cloudSyncBadge() {
  const status = authState.user ? state.cloudStatus : 'local';
  const labels = {
    synced: ['cloud', 'クラウド保存済み'],
    syncing: ['sync', '同期中'],
    pending: ['pending', '同期待ち'],
    local: ['local', 'この端末に保存'],
    none: ['local', '未保存']
  };
  const [className, label] = labels[status] || labels.local;
  return `<span class="cloud-sync-badge ${className}">${label}</span>`;
}

function profileLink(user = currentUser()) {
  const token = authState.user?.id || user.handle || 'me';
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}?connect=${encodeURIComponent(token)}`;
}

function profileQr(value) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(value)}`;
  return `<img src="${src}" alt="プロフィール交換用QRコード" loading="lazy">`;
}

function settingsScreen() {
  const sections = [
    {
      title: 'アカウント',
      rows: [
        ['user', 'プロフィールを編集', 'edit', ''],
        ['lock', 'アカウントとセキュリティ', 'account-security', ''],
        ['bell', '通知設定', 'notifications', '']
      ]
    },
    {
      title: 'つながり',
      rows: [
        ['users', 'つながりの管理', 'manage-connections', ''],
        ['userPlus', '知り合いかもを管理', 'suggested-users', ''],
        ['ban', 'ブロックしたユーザー', 'blocked-users', '']
      ]
    },
    {
      title: '表示・プライバシー',
      rows: [
        ['eye', 'プロフィールの公開範囲', 'profile-visibility', ''],
        ['shield', 'プライバシー設定', 'privacy-settings', ''],
        ['palette', '表示設定', 'display', '']
      ]
    },
    {
      title: 'その他',
      rows: [
        ['help', 'ヘルプ・サポート', 'help-support', ''],
        ['document', '利用規約', 'terms', ''],
        ['shield', 'プライバシーポリシー', 'privacy-policy', ''],
        ['info', 'バージョン情報', 'version-info', 'Ver. 1.2.0']
      ]
    }
  ];

  return `
    <section class="settings-screen-content">
      <header class="settings-header">
        <button data-nav="profile">${icon('chevronRight', 24)}</button>
        <h1>設定</h1>
      </header>
      ${sections.map((section) => `
        <section class="settings-section">
          <h2>${section.title}</h2>
          ${section.rows.map(([ic, label, action, meta]) => settingsRow(ic, label, action, meta)).join('')}
        </section>
      `).join('')}
      <button class="settings-row logout-row" data-action="logout">
        ${icon('logout', 25)}
        <span>ログアウト</span>
        ${icon('chevronRight', 25)}
      </button>
    </section>
  `;
}

function settingsRow(ic, label, action, meta = '') {
  return `
    <button class="settings-row" data-action="${action}">
      ${icon(ic, 25)}
      <span>${label}</span>
      ${meta ? `<em>${meta}</em>` : ''}
      ${icon('chevronRight', 25)}
    </button>
  `;
}

function editProfileScreen() {
  const user = currentUser();
  return `
    <section class="edit-profile-screen">
      <header class="edit-profile-header">
        <button data-nav="profile">${icon('chevronRight', 24)}</button>
        <div>
          <h1>プロフィール編集</h1>
          <p>登録時と同じ項目をまとめて編集できます。</p>
        </div>
      </header>
      <form class="register-form edit-profile-form" data-edit-form>
        ${profileFormFields(user, 'edit')}
        <button class="pill primary" type="submit">保存</button>
      </form>
    </section>
  `;
}

function educationDisplay(user = {}, options = {}) {
  const items = educationItems(user, { respectPrivacy: options.respectPrivacy });
  if (!items.length) {
    const value = options.respectPrivacy && hiddenEducationItems(user).length ? '非公開' : '未入力';
    return infoRow('grad', '学校', value);
  }
  const visibilityNames = { '高校': 'highSchoolPublic', '大学': 'universityPublic', '専門学校': 'vocationalSchoolPublic' };
  return `
    <div class="education-card">
      ${items.map(([label, value, isPublic, isCurrent]) => `
        <div class="education-row">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}${isCurrent ? '<small>在学中</small>' : ''}</strong>
          ${options.editable ? `<button class="visibility-toggle ${isPublic !== false ? 'is-public' : ''}" data-visibility-toggle="${visibilityNames[label]}">${isPublic !== false ? '公開' : '非公開'}</button>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function careerDisplay(user = {}, variant = '', options = {}) {
  const careers = careerItems(user, { respectPrivacy: options.respectPrivacy })
    .map((career, index) => ({ ...career, sourceIndex: index }));
  if (!careers.length) {
    const hiddenValue = options.respectPrivacy && hiddenCareerItems(user).length ? '非公開' : '未入力';
    return variant === 'compact'
      ? `<div>${icon('brief', 20)}<span>職歴</span><strong>${hiddenValue}</strong></div>`
      : infoRow('brief', '職歴', hiddenValue);
  }
  const compact = variant === 'compact';
  if (!compact) {
    const currentCareer = careers.find((career) => career.type === 'current');
    const pastCareers = careers.filter((career) => career.type !== 'current');
    return `
      <div class="career-list">
        ${currentCareer ? `
          <div class="career-group">
            <span class="career-group-title">現在</span>
            ${careerCardMarkup(currentCareer, currentCareer.sourceIndex, options)}
          </div>
        ` : ''}
        ${pastCareers.length ? `
          <div class="career-group">
            <span class="career-group-title">経歴</span>
            ${pastCareers.map((career) => careerCardMarkup(career, career.sourceIndex, options)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }
  return `
    <div class="career-list compact-career-list">
      ${careers.map((career, index) => careerCardMarkup(career, index, options, true)).join('')}
      </div>
  `;
}

function careerCardMarkup(career = {}, index = 0, options = {}, compact = false) {
  const visibilityIndex = Number.isInteger(career.sourceIndex) ? career.sourceIndex : index;
  return `
    <div class="${compact ? 'career-card compact-career-card' : 'career-card'}">
      ${companyLogoMarkup(career.logo, career.company || career.role || 'B', career.domain, career.logoUrl)}
      <div>
        ${career.role ? `<h3>${escapeHtml(career.role)}</h3>` : ''}
        <p>${escapeHtml(career.company || '会社未入力')}</p>
        ${career.period ? `<small>${escapeHtml(career.period)}</small>` : ''}
        ${career.location ? `<small>${escapeHtml(career.location)}</small>` : ''}
      </div>
      ${options.editable ? `<button class="visibility-toggle ${career.public !== false ? 'is-public' : ''}" data-career-visibility="${visibilityIndex}">${career.public !== false ? '公開' : '非公開'}</button>` : ''}
    </div>
  `;
}

function infoRow(ic, label, value, visibilityKey = '', isPublic = true) {
  return `<div class="info-row">${icon(ic, 25)}<span>${label}</span><strong>${value}</strong>${visibilityKey ? `<button class="visibility-toggle ${isPublic ? 'is-public' : ''}" data-visibility-toggle="${visibilityKey}">${isPublic ? '公開' : '非公開'}</button>` : ''}</div>`;
}

function snsLinks(user, options = {}) {
  const sns = user.sns || {};
  const publicMap = user.snsPublic || {};
  const respectPrivacy = options.respectPrivacy !== false;
  const links = snsFields()
    .map(({ key, icon: label }) => {
      const account = normalizeSnsAccount(key, sns[key]);
      return [key, label, account?.url || '', account?.username || ''];
    })
    .filter(([key, , url]) => url && (!respectPrivacy || publicMap[key] !== false));
  if (!links.length) return '<small>未連携</small>';
  return links.map(([name, label, url, username]) => `<a class="sns-link sns-${escapeHtml(name)}" href="${escapeHtml(url)}" target="_blank" rel="noreferrer" aria-label="${name}" title="${escapeHtml(username ? `@${username}` : name)}">${label}</a>`).join('');
}

function buttonIcon(ic, action, cls = '') {
  return `<button class="${cls}" data-action="${action}">${icon(ic, 30)}</button>`;
}

function bottomNav() {
  const items = [['map', 'map', 'マップ'], ['connections', 'users', 'つながり'], ['intro', 'home', '紹介'], ['profile', 'user', 'プロフィール']];
  return `<nav class="bottom-nav">${items.map(([screen, ic, label]) => `<button class="${isActiveNav(screen, label) ? 'active' : ''}" data-nav="${screen}">${icon(ic, 27)}<span>${label}</span></button>`).join('')}</nav>`;
}

function isActiveNav(screen, label) {
  if (state.screen === 'intro') return label === '紹介';
  return state.screen === screen;
}

function overlay() {
  if (!state.overlay) return '';
  const type = state.overlay.type;
  const user = currentUser();
  if (type === 'person') return modal(personModalContent(state.overlay), 'person-modal');
  if (type === 'photo-crop') return modal(photoCropContent(state.overlay), 'photo-crop-modal');
  if (type === 'sns-register') return modal(snsRegisterContent(state.overlay), 'sns-register-modal');
  if (type === 'share-profile') return modal(shareProfileContent(), 'connect-modal profile-share-modal');
  if (type === 'connect-profile') return modal(connectProfileContent(state.overlay.target), 'connect-modal');
  if (type === 'search') return modal(idSearchContent('検索'), 'connect-modal');
  if (type === 'filter') return modal(`<h2>絞り込み</h2><div class="modal-grid filter-grid">${mapFilters().map(mapFilterOption).join('')}</div><button data-close>閉じる</button>`);
  if (type === 'display') return modal(`<h2>表示設定</h2><label><input type="checkbox" checked> つながりの強さを表示</label><label><input type="checkbox" checked> 共通点を表示</label><label><input type="checkbox"> 名前だけ表示</label><button data-close>完了</button>`);
  if (type === 'settings') return modal(`<h2>設定</h2><p>ログイン中のプロフィールはクラウドに保存され、同じアカウントで復元できます。</p><button data-action="restart-registration">最初から登録し直す</button><button data-close>閉じる</button>`);
  if (type === 'notifications') return modal(notificationsContent(), 'connect-modal');
  if (type === 'account-security') return modal(`<h2>アカウントとセキュリティ</h2><p>ログイン中のメールアドレス：${escapeHtml(authState.user?.email || currentUser().email || '未ログイン')}</p><p>パスワードを変更したい場合は、ログイン画面の「パスワードを忘れた方」から再設定できます。</p><button data-action="logout">ログアウト</button><button data-close>閉じる</button>`);
  if (type === 'manage-connections') return modal(`<h2>つながりの管理</h2><p>現在のつながり数は ${connectionRowsData().length} 人です。承認済みの申請がここに反映されます。</p><button data-action="add">つながりを追加</button><button data-close>閉じる</button>`);
  if (type === 'profile-visibility') return modal(`<h2>プロフィールの公開範囲</h2><p>学校、会社、所在地、誕生日、SNSごとのリンクはプロフィール編集から公開・非公開を選べます。SNSリンクは入力して公開にしたものだけプロフィールに表示されます。</p><button data-action="edit">プロフィールを編集</button><button data-close>閉じる</button>`);
  if (type === 'privacy-settings') return modal(`<h2>プライバシー設定</h2><p>プロフィール情報はログイン中のアカウントに紐づいて保存されます。公開範囲はプロフィール編集から変更できます。</p><button data-action="edit">公開設定を変更</button><button data-close>閉じる</button>`);
  if (type === 'version-info') return modal(`<h2>バージョン情報</h2><p>Bondy Web App<br>Ver. 1.3.0</p><p>プロフィールのクラウド保存、Googleログイン、マップ操作改善に対応しています。</p><button data-close>閉じる</button>`);
  if (type === 'help-support') return modal(helpSupportContent(), 'document-modal');
  if (type === 'terms') return modal(termsContent(), 'document-modal');
  if (type === 'privacy-policy') return modal(privacyPolicyContent(), 'document-modal');
  return modal(addConnectionContent(), 'connect-modal');
}

function addConnectionContent() {
  return `
    <h2>つながりを追加</h2>
    <p>QRコードを読み取るか、相手のIDを検索して申請を送れます。</p>
    <button data-action="scan-qr">${icon('qr', 20)}QRコードを読み取る</button>
    ${idSearchContent('IDで検索', false)}
    <button data-nav="profile">自分のQRコードを表示</button>
    <button data-close>閉じる</button>
  `;
}

function notificationsContent() {
  return `
    <h2>通知</h2>
    ${state.notifications.length
      ? `<div class="notification-list">${state.notifications.map((item) => `
        <article>
          <strong>${escapeHtml(item.body)}</strong>
          <time>${escapeHtml(item.time)}</time>
        </article>
      `).join('')}</div>`
      : '<p>通知はまだありません。</p>'}
    <button data-close>閉じる</button>
  `;
}

function shareProfileContent() {
  const profileUrl = profileLink();
  return `
    <h2>プロフィールを共有</h2>
    <p>QRコードを見せると、相手があなたに申請できます。</p>
    <div class="qr large-qr" aria-label="${escapeHtml(profileUrl)}">${profileQr(profileUrl)}</div>
    <button data-action="copy-link">${icon('link', 20)}プロフィールリンクをコピー</button>
    <button data-action="save-qr">${icon('download', 18)}QRコードを保存</button>
    <button data-close>閉じる</button>
  `;
}

function idSearchContent(title = 'IDで検索', wrap = true) {
  const form = `
    <form class="id-search-form" data-id-search-form>
      <h3>${title}</h3>
      <label>@ID またはプロフィールURL<input name="query" class="modal-input" placeholder="@your.id"></label>
      <button type="submit">${icon('search', 18)}検索する</button>
    </form>
  `;
  return wrap ? `${form}<button data-close>閉じる</button>` : form;
}

function connectProfileContent(target) {
  if (!target) return `<h2>ユーザーが見つかりません</h2><p>IDを確認してもう一度検索してください。</p><button data-action="add">検索に戻る</button>`;
  const profile = target.profile;
  const title = profile.name || target.handle || 'ユーザー';
  const subtitle = [educationSummary(profile), careerSummary(profile)].filter(Boolean).join(' / ') || `@${target.handle || 'unknown'}`;
  return `
    <div class="connect-preview">
      <div class="avatar initial-avatar" style="--size:72px"><b>${escapeHtml((title || 'U').slice(0, 2).toUpperCase())}</b></div>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(subtitle)}</p>
      <small>@${escapeHtml(target.handle || profile.handle || '')}</small>
    </div>
    <fieldset class="relationship-picker">
      <legend>何の関係でつながりますか？</legend>
      ${relationshipTypes().map((type, index) => `<label><input type="radio" name="relationshipType" value="${escapeHtml(type)}" ${index === 0 ? 'checked' : ''}>${type === '恋人' ? icon('heart', 15) : escapeHtml(type)}</label>`).join('')}
    </fieldset>
    <button data-action="send-request" data-target-id="${escapeHtml(target.id)}">申請を送る</button>
    <button data-action="add">別の人を探す</button>
  `;
}

function helpSupportContent() {
  return `
    <header><h2>ヘルプ・サポート</h2><button data-close>閉じる</button></header>
    <div class="document-body">
      <section><h3>お問い合わせ</h3><p>不具合、ログイン、プロフィール、データ保存に関する相談はメールで受け付けています。</p><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></section>
      <section><h3>返信について</h3><p>内容を確認のうえ、順次返信します。お問い合わせ時は、利用している端末、ブラウザ、発生した画面を一緒に送ると確認しやすくなります。</p></section>
      <section><h3>よくある確認</h3><p>Googleログインがうまく開けない場合は、SafariまたはChromeで開き直してください。プロフィールが復元されない場合は、同じアカウントでログインしているか確認してください。</p></section>
    </div>
  `;
}

function termsContent() {
  return `
    <header><h2>利用規約</h2><button data-close>閉じる</button></header>
    <div class="document-body">
      <p class="document-date">最終更新日：2026年6月21日</p>
      <section><h3>1. 適用</h3><p>本規約は、Bondyの利用条件を定めるものです。ユーザーは本アプリを利用することで、本規約に同意したものとみなされます。</p></section>
      <section><h3>2. アカウント</h3><p>ユーザーは正確な情報を登録し、自分の責任でアカウントを管理するものとします。不正利用が疑われる場合は、速やかにサポートへ連絡してください。</p></section>
      <section><h3>3. 禁止事項</h3><p>虚偽情報の登録、第三者へのなりすまし、迷惑行為、法令または公序良俗に反する行為、本アプリの運営を妨げる行為を禁止します。</p></section>
      <section><h3>4. サービスの変更</h3><p>本アプリは、機能の追加、変更、停止を行う場合があります。重要な変更がある場合は、可能な範囲でアプリ内またはその他の方法で通知します。</p></section>
      <section><h3>5. 免責</h3><p>本アプリは、つながりや紹介に関する情報の完全性、正確性、有用性を保証するものではありません。ユーザー間のやり取りは各自の責任で行ってください。</p></section>
      <section><h3>6. お問い合わせ</h3><p>本規約に関する問い合わせ先：<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p></section>
    </div>
  `;
}

function privacyPolicyContent() {
  return `
    <header><h2>プライバシーポリシー</h2><button data-close>閉じる</button></header>
    <div class="document-body">
      <p class="document-date">最終更新日：2026年6月21日</p>
      <section><h3>1. 取得する情報</h3><p>メールアドレス、プロフィール情報、学校、所在地、誕生日、SNSリンク、プロフィール写真、ログインに必要な認証情報を取得する場合があります。</p></section>
      <section><h3>2. 利用目的</h3><p>アカウント管理、プロフィール表示、つながりや紹介機能の提供、問い合わせ対応、品質改善、不正利用防止のために利用します。</p></section>
      <section><h3>3. 保存と復元</h3><p>ログインしたアカウントで同じ情報を復元できるよう、プロフィール情報をSupabaseに保存します。端末内にも表示高速化のため一部情報を保存することがあります。</p></section>
      <section><h3>4. 第三者提供</h3><p>法令に基づく場合を除き、本人の同意なく個人情報を第三者に提供しません。ログインやデータ保存にはSupabaseおよびGoogle等の外部サービスを利用する場合があります。</p></section>
      <section><h3>5. 公開範囲</h3><p>プロフィールの所在地や誕生日など、一部項目は公開・非公開を選択できます。公開設定はユーザー自身で管理してください。</p></section>
      <section><h3>6. お問い合わせ</h3><p>個人情報の確認、修正、削除などの相談先：<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p></section>
    </div>
  `;
}

function modal(content, cls = '') {
  return `<div class="scrim" data-close></div><section class="modal-sheet ${cls}">${content}</section>`;
}

function photoCropContent(crop = {}) {
  return `
    <header><h2>写真を調整</h2><button data-close>閉じる</button></header>
    <div class="crop-editor">
      <p class="crop-hint">写真を指で動かして、2本指で拡大できます。</p>
      <div class="crop-frame" data-crop-frame>
        <img src="${escapeHtml(crop.src || '')}" alt="" draggable="false" style="--crop-scale:${crop.zoom || 1};--crop-x:${crop.x || 0}px;--crop-y:${crop.y || 0}px">
      </div>
      <div class="crop-actions">
        <button type="button" data-action="crop-reset">リセット</button>
      </div>
      <button class="pill primary" data-action="save-cropped-photo">この写真にする</button>
    </div>
  `;
}

function snsRegisterContent(data = {}) {
  const account = normalizeSnsAccount(data.platform, data.value);
  const value = account?.username ? `@${account.username}` : '';
  const label = data.label || data.platform || 'SNS';
  return `
    <header><h2>${escapeHtml(label)}アカウントを登録</h2><button class="modal-close-icon" data-close aria-label="閉じる">×</button></header>
    <form class="sns-register-form" data-sns-register-form>
      <input type="hidden" name="platform" value="${escapeHtml(data.platform || '')}">
      <input type="hidden" name="label" value="${escapeHtml(label)}">
      <label>${escapeHtml(label)}のURLまたはユーザー名
        <input name="account" value="${escapeHtml(value)}" placeholder="@username またはプロフィールURL" autocomplete="off">
      </label>
      <div class="sns-register-actions">
        <button type="button" data-action="preview-sns-account">${escapeHtml(label)}で確認</button>
        <button type="submit">登録する</button>
      </div>
    </form>
  `;
}

function go(screen, message = '') {
  state.screen = screen;
  state.overlay = null;
  if (message) showToast(message);
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function showToast(message) {
  state.toast = message;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    state.toast = '';
    render();
  }, 1700);
}

function openOverlay(type) {
  state.overlay = { type };
  render();
}

app.addEventListener('click', async (event) => {
  const universityButton = event.target.closest('[data-university-open]');
  const locationButton = event.target.closest('[data-location-open]');
  const companyButton = event.target.closest('[data-company-open]');
  const companyClearButton = event.target.closest('[data-company-clear]');
  const schoolClearButton = event.target.closest('[data-school-clear]');
  const snsRegisterButton = event.target.closest('[data-sns-register]');
  const careerAddButton = event.target.closest('[data-career-add]');
  const careerRemoveButton = event.target.closest('[data-career-remove]');
  const action = event.target.closest('[data-action]')?.dataset.action;
  const nav = event.target.closest('[data-nav]')?.dataset.nav;
  const tab = event.target.closest('[data-tab]')?.dataset.tab;
  const connectionFilter = event.target.closest('[data-connection-filter]')?.dataset.connectionFilter;
  const mode = event.target.closest('[data-mode]')?.dataset.mode;
  const mapCategoryDetail = event.target.closest('[data-map-category-detail]')?.dataset.mapCategoryDetail;
  const filter = event.target.closest('[data-filter]')?.dataset.filter;
  const visibilityToggle = event.target.closest('[data-visibility-toggle]')?.dataset.visibilityToggle;
  const careerVisibility = event.target.closest('[data-career-visibility]')?.dataset.careerVisibility;
  const request = event.target.closest('[data-request]');
  const centerProfileButton = event.target.closest('[data-center-profile]');
  const mapNodeButton = event.target.closest('[data-map-node]');
  const mapSearchPersonButton = event.target.closest('[data-map-search-person]');
  const personClickIsAction = Boolean(event.target.closest('[data-action], .relationship-picker, .connection-manage-actions'));
  const personElement = personClickIsAction ? null : event.target.closest('[data-person], [data-person-id]');
  const person = personElement?.dataset.person;
  const personId = personElement?.dataset.personId;
  const toastButton = event.target.closest('[data-toast]')?.dataset.toast;

  if (universityButton) {
    openOptionPicker(universityButton, {
      fieldSelector: '.university-field',
      title: '学校を選択',
      searchPlaceholder: '学校名で検索',
      freeInputLabel: '入力した名前を使う',
      options: universityOptions
    });
    return;
  }
  if (locationButton) {
    openOptionPicker(locationButton, {
      fieldSelector: '.location-field',
      title: '地域を選択',
      searchPlaceholder: '地域名で検索',
      freeInputLabel: '入力した地域を使う',
      options: locationOptions
    });
    return;
  }
  if (companyClearButton) {
    clearCompanyField(companyClearButton.closest('.company-field'));
    return;
  }
  if (schoolClearButton) {
    clearEducationField(schoolClearButton.closest('.education-field'));
    return;
  }
  if (companyButton) {
    openOptionPicker(companyButton, {
      fieldSelector: '.company-field',
      title: '企業を選択',
      searchPlaceholder: '企業名で検索',
      freeInputLabel: '入力した企業名を使う',
      options: companyOptions,
      remoteSearch: true
    });
    return;
  }
  if (snsRegisterButton) {
    const field = snsRegisterButton.closest('.sns-edit-row');
    const input = field?.querySelector(`input[name="${snsRegisterButton.dataset.snsRegister}"]`);
    state.overlay = {
      type: 'sns-register',
      platform: snsRegisterButton.dataset.snsRegister,
      label: snsRegisterButton.dataset.snsLabel,
      value: input?.value || ''
    };
    render();
    return;
  }
  if (careerAddButton) {
    const list = document.querySelector('.past-career-list');
    if (!list) return;
    const index = document.querySelectorAll('.career-edit-card').length;
    list.insertAdjacentHTML('beforeend', careerEditCard({}, index, 'past'));
    refreshCareerNumbers();
    return;
  }
  if (careerRemoveButton) {
    careerRemoveButton.closest('.career-edit-card')?.remove();
    refreshCareerNumbers();
    return;
  }
  if (event.target.closest('[data-close]')) {
    state.overlay = null;
    render();
    return;
  }
  if (nav) {
    state.mapCategoryDetail = '';
    go(nav);
    if (nav === 'intro') await loadIncomingRequests({ silent: true });
    if (nav === 'connections' || nav === 'map' || nav === 'profile') await loadAcceptedConnections({ silent: true });
    if (nav === 'map') warmMapSearchConnections().then(() => state.screen === 'map' && render());
    if (nav === 'connections' || nav === 'map' || nav === 'profile') await loadRemovalNotifications({ silent: true });
    return;
  }
  if (tab) {
    state.introTab = tab;
    render();
    if (tab === '申請') await loadIncomingRequests({ silent: true });
    return;
  }
  if (connectionFilter) {
    state.connectionFilter = connectionFilter;
    render();
    return;
  }
  if (mapCategoryDetail) {
    state.mapCategoryDetail = mapCategoryDetail;
    state.filter = mapCategoryDetail;
    state.mapSearchOpen = false;
    state.mapQuery = '';
    state.overlay = null;
    render();
    warmMapSearchConnections().then(() => state.screen === 'map' && render());
    return;
  }
  if (mode) {
    state.mapMode = mode;
    showToast(`${mode}表示に切り替えました`);
    render();
    return;
  }
  if (filter) {
    state.filter = filter;
    state.overlay = null;
    state.mapFilterOpen = false;
    showToast(`${mapFilterLabel(filter)}で絞り込みました`);
    render();
    return;
  }
  if (visibilityToggle) {
    const current = currentUser();
    const updatedUser = saveUserLocal({
      ...current,
      [visibilityToggle]: !current[visibilityToggle]
    });
    saveRemoteUser(updatedUser).catch(() => {});
    showToast(updatedUser[visibilityToggle] ? '公開にしました' : '非公開にしました');
    render();
    return;
  }
  if (careerVisibility !== undefined) {
    const current = currentUser();
    const careers = normalizeCareers(current).map((career, index) => index === Number(careerVisibility)
      ? { ...career, public: career.public === false }
      : career);
    const updatedUser = saveUserLocal({
      ...current,
      careers,
      companyPublic: careers.some((career) => career.public !== false)
    });
    saveRemoteUser(updatedUser).catch(() => {});
    showToast(careers[Number(careerVisibility)]?.public !== false ? '公開にしました' : '非公開にしました');
    render();
    return;
  }
  if (request) {
    const requestId = request.dataset.request;
    const result = request.dataset.result;
    const updated = await withButtonPending(request, result === '承認' ? '承認中...' : '拒否中...', () => updateConnectionRequestStatus(requestId, result));
    if (!updated) return;
    state.handledRequests[requestId] = result;
    state.requests = state.requests.filter((item) => item.id !== requestId);
    if (result === '承認') await loadAcceptedConnections({ silent: true });
    showToast(`${result}しました`);
    render();
    return;
  }
  if (centerProfileButton) {
    if (mapInteraction.dragged) {
      mapInteraction.dragged = false;
      return;
    }
    const node = personByIdOrName(centerProfileButton.dataset.centerProfile);
    state.overlay = personOverlayFromNode(node);
    render();
    return;
  }
  if (mapSearchPersonButton) {
    const targetId = mapSearchPersonButton.dataset.mapSearchPerson;
    const target = mapSearchPeoplePool().find((person) => person.id === targetId) || personByIdOrName(targetId);
    if (mapSearchPersonButton.dataset.centerable === 'true') {
      state.mapCenter = targetId;
      state.filter = 'すべて';
      state.mapQuery = '';
      state.mapPan = { x: 0, y: 0 };
      state.zoom = 1;
      render();
      loadMapCenterConnections(targetId, { silent: true }).then(() => render());
      return;
    }
    state.overlay = personOverlayFromNode(target, target?.name || 'ユーザー');
    render();
    return;
  }
  if (mapNodeButton) {
    if (mapInteraction.dragged) {
      mapInteraction.dragged = false;
      return;
    }
    const centerId = mapNodeButton.dataset.mapNode || mapNodeButton.dataset.personId;
    const visibleNode = mapVisibleNodes().find((node) => node.id === centerId);
    const node = visibleNode || personByIdOrName(centerId);
    if (state.mapCenter !== 'you' && centerId === authState.user?.id) {
      state.mapCenter = 'you';
      state.filter = 'すべて';
      state.mapQuery = '';
      state.mapPan = { x: 0, y: 0 };
      state.zoom = 1;
      render();
      return;
    }
    if (mapNodeButton.dataset.centerable === 'true') {
      state.mapCenter = centerId;
      state.filter = 'すべて';
      state.mapPan = { x: 0, y: 0 };
      state.zoom = 1;
      state.toast = `${node?.name || mapNodeButton.dataset.personName || 'ユーザー'}を中心にしました`;
      render();
      loadMapCenterConnections(centerId, { silent: true }).then(() => render());
      return;
    }
    state.overlay = personOverlayFromNode(node, mapNodeButton.dataset.personName || 'ユーザー');
    render();
    return;
  }
  if (person || personId) {
    const requestPerson = personByIdOrName(personId || person);
    state.overlay = personOverlayFromNode(requestPerson, person);
    render();
    return;
  }
  if (toastButton) {
    state.overlay = null;
    showToast(toastButton);
    render();
    return;
  }
  if (!action) return;
  if (action === 'auth-mode') {
    state.authMode = event.target.closest('[data-auth-mode]')?.dataset.authMode || 'signin';
    render();
    return;
  }
  if (action === 'google-login') return signInWithProvider('google');
  if (action === 'filter' && state.screen === 'map') {
    state.mapFilterOpen = !state.mapFilterOpen;
    state.overlay = null;
    render();
    return;
  }
  if (action === 'back-map-overview') {
    state.mapCategoryDetail = '';
    state.filter = 'すべて';
    state.mapSearchOpen = false;
    state.mapQuery = '';
    render();
    return;
  }
  if (action === 'toggle-map-search') {
    state.mapSearchOpen = !state.mapSearchOpen;
    render();
    if (state.mapSearchOpen) {
      warmMapSearchConnections().then(() => {
        if (state.screen === 'map' && (state.mapSearchOpen || state.mapQuery.trim())) render();
      });
      requestAnimationFrame(() => document.querySelector('[data-map-search]')?.focus());
    }
    return;
  }
  if (action === 'notifications') {
    await loadRemovalNotifications({ silent: true });
    return openOverlay(action);
  }
  if (action === 'back-login') {
    state.authMode = 'signin';
    return go('login');
  }
  if (action === 'settings') return go('settings');
  if (action === 'edit') return go('editProfile');
  if (action === 'restart-registration') {
    const key = accountProfileKey();
    localStorage.removeItem(STORAGE_KEY);
    if (key) localStorage.removeItem(key);
    state.user = null;
    state.connections = [];
    state.requests = [];
    state.overlay = null;
    return go('register', '最初から登録できます');
  }
  if (['search', 'filter', 'add', 'display', 'share-profile', 'help-support', 'terms', 'privacy-policy', 'account-security', 'manage-connections', 'profile-visibility', 'privacy-settings', 'version-info'].includes(action)) return openOverlay(action);
  if (action === 'scan-qr') return startQrScanner();
  if (action === 'send-request') {
    const sendButton = event.target.closest('[data-action]');
    const targetId = event.target.closest('[data-target-id]')?.dataset.targetId;
    const relationship = event.target.closest('.modal-sheet')?.querySelector('input[name="relationshipType"]:checked')?.value || '紹介';
    const sent = await withButtonPending(sendButton, '申請中...', () => sendConnectionRequest(targetId, relationship));
    if (sent) {
      state.overlay = null;
      render();
    }
    return;
  }
  if (action === 'update-relationship') {
    const saveButton = event.target.closest('[data-action]');
    const requestId = event.target.closest('[data-request-id]')?.dataset.requestId;
    const targetPersonId = event.target.closest('[data-person-id]')?.dataset.personId || '';
    const relationship = event.target.closest('.modal-sheet')?.querySelector('input[name="manageRelationshipType"]:checked')?.value || '';
    const updated = await withButtonPending(saveButton, '保存中...', () => updateConnectionRelationship(requestId, relationship, targetPersonId));
    if (updated) {
      state.overlay = null;
      showToast('関係を変更しました');
      render();
    }
    return;
  }
  if (action === 'remove-connection') {
    const button = event.target.closest('[data-request-id]');
    const requestId = button?.dataset.requestId;
    const targetPersonId = button?.dataset.personId || '';
    const relationship = button?.dataset.relationship || '';
    const removed = await withButtonPending(button, '削除中...', () => removeConnection(requestId, relationship, targetPersonId));
    if (removed) {
      state.overlay = null;
      showToast('つながりを削除しました');
      render();
    }
    return;
  }
  if (action === 'logout') {
    state.overlay = null;
    await authState.client?.auth.signOut();
    state.authMode = 'signin';
    return go('login', 'ログアウトしました');
  }
  if (['suggested-users', 'blocked-users'].includes(action)) {
    return showToast('この設定は準備中です');
  }
  if (action === 'locate') {
    state.mapCenter = 'you';
    state.mapPan = { x: 0, y: 0 };
    state.zoom = 1;
    render();
    return showToast('あなたを中心に戻しました');
  }
  if (action === 'fit-map') {
    state.mapPan = { x: 0, y: 0 };
    state.zoom = 1;
    render();
    return showToast('マップ全体を表示しました');
  }
  if (action === 'zoom-in' || action === 'zoom-out') {
    state.zoom = clampZoom(state.zoom + (action === 'zoom-in' ? 0.12 : -0.12));
    state.mapPan = constrainMapPan(state.mapPan);
    showToast(`ズーム ${Math.round(state.zoom * 100)}%`);
    render();
    return;
  }
  if (action === 'share') {
    navigator.share?.({ title: 'Bondy プロフィール', url: 'https://bondy.app/yuta.mesh' }).catch(() => {});
    return showToast('共有メニューを開きました');
  }
  if (action === 'copy-link') {
    navigator.clipboard?.writeText(profileLink()).catch(() => {});
    return showToast('プロフィールリンクをコピーしました');
  }
  if (action === 'save-qr') {
    await withButtonPending(event.target.closest('[data-action]'), '保存中...', async () => {
      state.saved = true;
      await new Promise((resolve) => setTimeout(resolve, 300));
      showToast('QRコードを保存しました');
      return true;
    });
    render();
    return;
  }
  if (action === 'preview-sns-account') {
    const form = event.target.closest('[data-sns-register-form]');
    const formData = new FormData(form);
    const account = normalizeSnsAccount(String(formData.get('platform') || ''), String(formData.get('account') || ''));
    if (!account?.url) return showToast('ユーザー名かURLを入力してください');
    window.open(account.url, '_blank', 'noopener,noreferrer');
    return;
  }
  if (action === 'camera') return showToast('写真変更を開きました');
  if (action === 'crop-reset' && state.overlay?.type === 'photo-crop') {
    state.overlay.x = 0;
    state.overlay.y = 0;
    state.overlay.zoom = 1;
    updateCropImage();
    return;
  }
  if (action === 'save-cropped-photo') {
    if (!state.overlay?.file || state.overlay.type !== 'photo-crop') return;
    showToast('写真を保存中...');
    const croppedFile = await createCroppedPhotoFile(state.overlay);
    if (state.overlay.mode === 'form') {
      state.pendingProfilePhotoFile = croppedFile;
      state.pendingProfilePhotoPreview = await readFileAsDataUrl(croppedFile);
      showToast('写真を設定しました。保存ボタンで反映されます');
    } else {
      const photoUrl = await uploadProfilePhoto(croppedFile);
      await saveUser({
        ...currentUser(),
        photo: photoUrl
      });
      state.user = normalizeUser({ ...currentUser(), photo: photoUrl });
      showToast(authState.user ? 'プロフィール写真をクラウド保存しました' : 'プロフィール写真を変更しました');
    }
    if (state.overlay.src?.startsWith('blob:')) URL.revokeObjectURL(state.overlay.src);
    state.overlay = null;
    render();
    return;
  }
});

app.addEventListener('input', (event) => {
  const cropControl = event.target.closest('[data-crop-control]');
  if (cropControl && state.overlay?.type === 'photo-crop') {
    state.overlay[cropControl.dataset.cropControl] = Number(cropControl.value);
    const image = document.querySelector('.crop-frame img');
    if (image) {
      image.style.setProperty('--crop-scale', state.overlay.zoom || 1);
      image.style.setProperty('--crop-x', `${state.overlay.x || 0}px`);
      image.style.setProperty('--crop-y', `${state.overlay.y || 0}px`);
    }
    return;
  }
  const connectionSearch = event.target.closest('[data-connection-search]');
  const mapSearch = event.target.closest('[data-map-search]');
  const educationInput = event.target.closest('.education-field input');
  if (educationInput) {
    educationInput.closest('.education-field')?.classList.toggle('has-school', Boolean(educationInput.value.trim()));
  }
  if (mapSearch) {
    state.mapQuery = mapSearch.value;
    const shell = mapSearch.closest('.map-search-shell');
    shell?.querySelector('.map-search-results')?.remove();
    if (state.mapQuery.trim()) shell?.insertAdjacentHTML('beforeend', mapSearchResultsMarkup());
    return;
  }
  if (!connectionSearch) return;
  state.connectionQuery = connectionSearch.value;
  const list = document.querySelector('.connections-list');
  if (list) list.innerHTML = connectionsListContent();
});

function openOptionPicker(trigger, config) {
  document.querySelector('.university-picker-root')?.remove();
  const field = trigger.closest(config.fieldSelector);
  const hiddenInput = field.querySelector('input[type="hidden"]');
  const logoInput = field.querySelector('input[name="careerLogo[]"]');
  const domainInput = field.querySelector('input[name="careerDomain[]"]');
  const logoUrlInput = field.querySelector('input[name="careerLogoUrl[]"]');
  const currentValue = hiddenInput.value;
  const root = document.createElement('div');
  root.className = 'university-picker-root';
  root.innerHTML = `
    <div class="university-picker-scrim" data-university-close></div>
    <section class="university-picker">
      <header>
        <h2>${escapeHtml(config.title)}</h2>
        <button type="button" data-university-close>閉じる</button>
      </header>
      <input class="university-search" type="search" placeholder="${escapeHtml(config.searchPlaceholder)}" value="${escapeHtml(currentValue)}" autocomplete="off">
      <div class="university-list"></div>
      <button type="button" class="university-free-input">${escapeHtml(config.freeInputLabel)}</button>
    </section>
  `;
  document.body.appendChild(root);

  const search = root.querySelector('.university-search');
  const list = root.querySelector('.university-list');
  const freeInputButton = root.querySelector('.university-free-input');

  let searchRun = 0;
  const updateList = async () => {
    const run = ++searchRun;
    const query = search.value.trim().toLowerCase();
    const normalizedQuery = search.value.trim();
    let matches = config.options
      .filter((option) => {
        const name = typeof option === 'string' ? option : option.name;
        const label = typeof option === 'string' ? option : option.label;
        return !query || name.toLowerCase().includes(query) || label.toLowerCase().includes(query) || name.includes(normalizedQuery);
      })
      .slice(0, 80);
    if (config.remoteSearch && normalizedQuery.length >= 2 && matches.length < 8) {
      list.innerHTML = '<p>Logo.devで候補を探しています...</p>';
      const remoteMatches = await searchLogoDevBrands(normalizedQuery);
      if (run !== searchRun) return;
      const seen = new Set(matches.map((option) => (typeof option === 'string' ? option : option.name).toLowerCase()));
      matches = [
        ...matches,
        ...remoteMatches.filter((option) => {
          const key = option.name.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
      ].slice(0, 80);
    }
    list.innerHTML = matches.map((option) => {
      const name = typeof option === 'string' ? option : option.name;
      const label = typeof option === 'string' ? option : option.label;
      const logo = typeof option === 'string' ? '' : option.logo;
      const domain = typeof option === 'string' ? '' : option.domain;
      const logoUrl = typeof option === 'string' ? '' : option.logoUrl;
      return `<button type="button" data-university-value="${escapeHtml(name)}" data-company-logo="${escapeHtml(logo || '')}" data-company-domain="${escapeHtml(domain || '')}" data-company-logo-url="${escapeHtml(logoUrl || '')}">${logo || domain || logoUrl ? companyLogoMarkup(logo, label, domain, logoUrl) : ''}<span>${escapeHtml(label)}</span></button>`;
    }).join('')
      || '<p>候補がありません。入力した名前を使えます。</p>';
  };

  const choose = (value, logo = '', domain = '', logoUrl = '') => {
    const cleanValue = value.trim();
    if (!cleanValue) return;
    const cleanLogo = logo || findCompanyLogo(cleanValue);
    const cleanDomain = domain || findCompanyDomain(cleanValue);
    const cleanLogoUrl = logoUrl || findCompanyLogoUrl(cleanValue, cleanDomain);
    hiddenInput.value = cleanValue;
    if (logoInput) logoInput.value = cleanLogo;
    if (domainInput) domainInput.value = cleanDomain;
    if (logoUrlInput) logoUrlInput.value = cleanLogoUrl;
    if (logoInput || domainInput || logoUrlInput) {
      saveCompanyCandidate({ name: cleanValue, label: cleanValue, logo: cleanLogo, domain: cleanDomain, logoUrl: cleanLogoUrl });
    }
    const triggerLabel = trigger.querySelector('span');
    if (triggerLabel) {
      triggerLabel.innerHTML = logoInput
        ? `<b>${escapeHtml(cleanValue)}</b>`
        : escapeHtml(cleanValue);
    }
    field.classList.toggle('has-company', Boolean(cleanValue));
    field.classList.toggle('has-school', Boolean(cleanValue));
    root.remove();
  };

  search.addEventListener('input', updateList);
  list.addEventListener('click', (event) => {
    const option = event.target.closest('[data-university-value]');
    if (option) choose(option.dataset.universityValue, option.dataset.companyLogo || '', option.dataset.companyDomain || '', option.dataset.companyLogoUrl || '');
  });
  freeInputButton.addEventListener('click', () => choose(search.value));
  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-university-close]')) root.remove();
  });

  updateList();
  setTimeout(() => search.focus(), 50);
}

function clearCompanyField(field) {
  if (!field) return;
  field.querySelector('input[name="careerCompany[]"]')?.setAttribute('value', '');
  field.querySelector('input[name="careerLogo[]"]')?.setAttribute('value', '');
  field.querySelector('input[name="careerDomain[]"]')?.setAttribute('value', '');
  field.querySelector('input[name="careerLogoUrl[]"]')?.setAttribute('value', '');
  field.querySelectorAll('input[type="hidden"]').forEach((input) => {
    input.value = '';
  });
  const label = field.querySelector('.company-select span');
  if (label) label.innerHTML = '<b>企業を選択または入力</b>';
  field.classList.remove('has-company');
}

function clearEducationField(field) {
  if (!field) return;
  const input = field.querySelector('input');
  if (input) {
    input.value = '';
    input.setAttribute('value', '');
  }
  const label = field.querySelector('.university-select span');
  if (label) label.textContent = '学校名を検索して選択';
  field.classList.remove('has-school');
}

function refreshCareerNumbers() {
  document.querySelectorAll('.career-edit-list .career-edit-card').forEach((card, index) => {
    const title = card.querySelector('.sns-edit-head b');
    const isCurrent = card.classList.contains('is-current-career');
    if (title) title.textContent = isCurrent ? '現在' : `経歴 ${index}`;
    const fieldset = card.querySelector('.visibility-field');
    const legend = fieldset?.querySelector('legend');
    if (legend) legend.textContent = isCurrent ? '現在の仕事' : `経歴${index}`;
    fieldset?.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.name = `careerPublic-${index}`;
    });
  });
}

app.addEventListener('submit', async (event) => {
  const authForm = event.target.closest('[data-auth-form]');
  const registerForm = event.target.closest('[data-register-form]');
  const editForm = event.target.closest('[data-edit-form]');
  const idSearchForm = event.target.closest('[data-id-search-form]');
  const snsRegisterForm = event.target.closest('[data-sns-register-form]');
  if (!authForm && !registerForm && !editForm && !idSearchForm && !snsRegisterForm) return;
  event.preventDefault();

  if (snsRegisterForm) {
    const formData = new FormData(snsRegisterForm);
    const platform = String(formData.get('platform') || '');
    const account = normalizeSnsAccount(platform, String(formData.get('account') || ''));
    if (!account) {
      showToast('ユーザー名かURLを入力してください');
      return;
    }
    const input = document.querySelector(`.edit-profile-form input[name="${cssEscape(platform)}"], .register-form input[name="${cssEscape(platform)}"]`);
    if (input) {
      input.value = snsAccountValue(account);
      const row = input.closest('.sns-edit-row');
      const button = row?.querySelector('.sns-register-button');
      const status = button?.querySelector('.sns-status-text, .sns-status-check');
      if (status) status.outerHTML = snsStatusMarkup(account);
    }
    state.overlay = null;
    document.querySelector('.scrim')?.remove();
    document.querySelector('.sns-register-modal')?.remove();
    return;
  }

  if (idSearchForm) {
    const formData = new FormData(idSearchForm);
    await showConnectTarget(String(formData.get('query') || ''));
    return;
  }

  if (authForm) {
    if (state.authSubmitting) return;
    const formData = new FormData(authForm);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    const passwordConfirm = String(formData.get('passwordConfirm') || '');
    const intent = event.submitter?.value || 'signin';
    if (intent === 'reset') {
      await sendPasswordReset(email);
      return;
    }
    if (!email && intent !== 'update-password') {
      showToast('メールアドレスを入力してください');
      return;
    }
    if (!password) {
      showToast('パスワードを入力してください');
      return;
    }
    if (password.length < 8) {
      showToast('パスワードは8文字以上にしてください');
      return;
    }
    if ((intent === 'signup' || intent === 'update-password') && password !== passwordConfirm) {
      showToast('確認用パスワードが一致しません');
      return;
    }
    if (intent === 'signin') {
      state.authSubmitting = true;
      render();
      try {
        await signInWithEmail(email, password);
      } finally {
        state.authSubmitting = false;
        render();
      }
      return;
    }
    if (intent === 'update-password') {
      await updatePassword(password);
      return;
    }
    await signUpWithEmail(email, password);
    return;
  }

  if (registerForm) {
    const formData = new FormData(registerForm);
    const photo = formData.get('photo');
    const current = currentUser();
    const user = {
      ...profileDataFromForm(formData, current),
      email: authState.user?.email || current.email || '',
      photo: state.pendingProfilePhotoFile ? await uploadProfilePhoto(state.pendingProfilePhotoFile) : photo && photo.size ? await uploadProfilePhoto(photo) : current.photo
    };
    const missing = missingRequiredProfileFields(user);
    if (missing.length) {
      showToast(`必須項目を入力してください：${missing.join('、')}`);
      return;
    }
    const saved = await withButtonPending(event.submitter, '登録中...', async () => {
      if (!await isHandleAvailable(user.handle)) return false;
      await saveUser(user);
      return true;
    });
    if (!saved) return;
    state.pendingProfilePhotoFile = null;
    state.pendingProfilePhotoPreview = '';
    localStorage.removeItem(SIGNUP_PENDING_KEY);
    go('profile', '登録しました');
    return;
  }

  if (editForm) {
    const formData = new FormData(editForm);
    const photo = formData.get('photo');
    const current = currentUser();
    const nextPhoto = state.pendingProfilePhotoFile ? await uploadProfilePhoto(state.pendingProfilePhotoFile) : photo && photo.size ? await uploadProfilePhoto(photo) : current.photo;
    const draftUser = {
      ...profileDataFromForm(formData, current),
      photo: nextPhoto,
    };
    const missing = missingRequiredProfileFields(draftUser);
    if (missing.length) {
      showToast(`必須項目を入力してください：${missing.join('、')}`);
      return;
    }
    const saved = await withButtonPending(event.submitter, '保存中...', async () => {
      if (!await isHandleAvailable(draftUser.handle)) return false;
      await saveUser(draftUser);
      return true;
    });
    if (!saved) return;
    state.pendingProfilePhotoFile = null;
    state.pendingProfilePhotoPreview = '';
    state.overlay = null;
    go('profile', 'プロフィールを保存しました');
  }
});

app.addEventListener('change', async (event) => {
  const photoInput = event.target.closest('[data-photo-input], input[name="photo"][type="file"]');
  if (!photoInput) return;
  const file = photoInput.files?.[0];
  if (!file) return;
  state.overlay = {
    type: 'photo-crop',
    mode: photoInput.matches('[data-photo-input]') ? 'immediate' : 'form',
    file,
    src: URL.createObjectURL(file),
    zoom: 1,
    x: 0,
    y: 0
  };
  render();
});

app.addEventListener('pointerdown', (event) => {
  const cropFrame = event.target.closest('[data-crop-frame]');
  if (!cropFrame || state.overlay?.type !== 'photo-crop') return;
  event.preventDefault();
  cropFrame.setPointerCapture?.(event.pointerId);
  state.cropPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  state.cropDragStart = {
    x: state.overlay.x || 0,
    y: state.overlay.y || 0,
    zoom: state.overlay.zoom || 1,
    startX: event.clientX,
    startY: event.clientY,
    distance: cropPointerDistance()
  };
});

app.addEventListener('pointermove', (event) => {
  if (state.overlay?.type !== 'photo-crop' || !state.cropPointers.has(event.pointerId)) return;
  event.preventDefault();
  state.cropPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (state.cropPointers.size >= 2) {
    const distance = cropPointerDistance();
    const startDistance = state.cropDragStart?.distance || distance || 1;
    state.overlay.zoom = clamp((state.cropDragStart?.zoom || 1) * (distance / startDistance), 1, 2.8);
  } else {
    state.overlay.x = clamp((state.cropDragStart?.x || 0) + event.clientX - (state.cropDragStart?.startX || event.clientX), -180, 180);
    state.overlay.y = clamp((state.cropDragStart?.y || 0) + event.clientY - (state.cropDragStart?.startY || event.clientY), -180, 180);
  }
  updateCropImage();
});

app.addEventListener('pointerup', clearCropPointer);
app.addEventListener('pointercancel', clearCropPointer);

app.addEventListener('pointerdown', (event) => {
  const workspace = event.target.closest('[data-map-workspace]');
  if (!workspace || state.screen !== 'map') return;
  if (event.target.closest('[data-map-category-detail], .category-island, .category-detail-switcher, .map-floating-buttons, .map-search-shell, .bottom-nav')) return;
  event.preventDefault();
  event.stopPropagation();
  const nodeButton = event.target.closest('[data-map-node]');
  mapInteraction.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

  if (mapInteraction.pointers.size === 2) {
    const center = pointerCenter();
    mapInteraction.mode = 'pinch';
    mapInteraction.active = false;
    mapInteraction.node = null;
    mapInteraction.pinchStartDistance = pointerDistance();
    mapInteraction.pinchStartZoom = state.zoom;
    mapInteraction.pinchStartPanX = state.mapPan.x;
    mapInteraction.pinchStartPanY = state.mapPan.y;
    mapInteraction.pinchStartCenterX = center.x;
    mapInteraction.pinchStartCenterY = center.y;
    return;
  }

  mapInteraction.active = true;
  mapInteraction.mode = nodeButton ? 'node' : 'pan';
  mapInteraction.node = nodeButton ? mapVisibleNodes().find((node) => (node.id || node.name) === nodeButton.dataset.mapNode) : null;
  mapInteraction.pointerId = event.pointerId;
  mapInteraction.startX = event.clientX;
  mapInteraction.startY = event.clientY;
  mapInteraction.startPanX = state.mapPan.x;
  mapInteraction.startPanY = state.mapPan.y;
  mapInteraction.startNodeX = mapInteraction.node?.x || 0;
  mapInteraction.startNodeY = mapInteraction.node?.y || 0;
  mapInteraction.dragged = false;
  workspace.setPointerCapture?.(event.pointerId);
});

app.addEventListener('pointermove', (event) => {
  if (mapInteraction.pointers.has(event.pointerId)) {
    mapInteraction.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  }
  const workspace = document.querySelector('[data-map-workspace]');
  if (!workspace || state.screen !== 'map') return;
  if (mapInteraction.pointers.has(event.pointerId) || mapInteraction.active) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (mapInteraction.mode === 'pinch' && mapInteraction.pointers.size >= 2) {
    const rect = workspace.getBoundingClientRect();
    const distance = pointerDistance();
    if (mapInteraction.pinchStartDistance) {
      const nextZoom = clampZoom(mapInteraction.pinchStartZoom * (distance / mapInteraction.pinchStartDistance));
      const center = pointerCenter();
      const originX = mapInteraction.pinchStartCenterX - rect.left;
      const originY = mapInteraction.pinchStartCenterY - rect.top;
      const startScale = mapInteraction.pinchStartZoom;
      const worldX = (originX - mapInteraction.pinchStartPanX) / startScale;
      const worldY = (originY - mapInteraction.pinchStartPanY) / startScale;
      state.zoom = nextZoom;
      state.mapPan = constrainMapPan({
        x: center.x - rect.left - worldX * nextZoom,
        y: center.y - rect.top - worldY * nextZoom
      }, rect);
      scheduleMapCanvasUpdate();
      mapInteraction.dragged = true;
    }
    return;
  }

  if (!mapInteraction.active || event.pointerId !== mapInteraction.pointerId) return;
  const dx = event.clientX - mapInteraction.startX;
  const dy = event.clientY - mapInteraction.startY;
  if (Math.hypot(dx, dy) > 4) mapInteraction.dragged = true;

  if (mapInteraction.mode === 'node' && mapInteraction.node) {
    const rect = workspace.getBoundingClientRect();
    mapInteraction.node.x = Math.max(4, Math.min(96, Number((mapInteraction.startNodeX + (dx / (rect.width * state.zoom)) * 100).toFixed(1))));
    mapInteraction.node.y = Math.max(5, Math.min(95, Number((mapInteraction.startNodeY + (dy / (rect.height * state.zoom)) * 100).toFixed(1))));
    updateDraggedNode(mapInteraction.node);
    return;
  }

  if (mapInteraction.mode === 'pan') {
    state.mapPan = constrainMapPan({
      x: mapInteraction.startPanX + dx,
      y: mapInteraction.startPanY + dy
    }, workspace.getBoundingClientRect());
    scheduleMapCanvasUpdate();
  }
}, { passive: false });

app.addEventListener('pointerup', finishMapPointer);
app.addEventListener('pointercancel', finishMapPointer);

app.addEventListener('wheel', (event) => {
  const workspace = event.target.closest('[data-map-workspace]');
  if (!workspace || state.screen !== 'map') return;
  event.preventDefault();
  const rect = workspace.getBoundingClientRect();
  const nextZoom = clampZoom(state.zoom + (event.deltaY < 0 ? 0.08 : -0.08));
  const localX = event.clientX - rect.left;
  const localY = event.clientY - rect.top;
  const worldX = (localX - state.mapPan.x) / state.zoom;
  const worldY = (localY - state.mapPan.y) / state.zoom;
  state.zoom = nextZoom;
  state.mapPan = constrainMapPan({
    x: localX - worldX * nextZoom,
    y: localY - worldY * nextZoom
  }, rect);
  scheduleMapCanvasUpdate();
}, { passive: false });

function finishMapPointer(event) {
  mapInteraction.pointers.delete(event.pointerId);
  if (mapInteraction.pointers.size < 2 && mapInteraction.mode === 'pinch') {
    mapInteraction.mode = '';
  }
  if (event.pointerId !== mapInteraction.pointerId) return;
  if (mapInteraction.mode === 'node' && mapInteraction.node && mapInteraction.dragged) {
    saveMapNodePosition(mapInteraction.node);
  }
  mapInteraction.active = false;
  mapInteraction.node = null;
  mapInteraction.pointerId = null;
}

function pointerDistance() {
  const points = [...mapInteraction.pointers.values()];
  if (points.length < 2) return 0;
  return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
}

function pointerCenter() {
  const points = [...mapInteraction.pointers.values()];
  if (!points.length) return { x: 0, y: 0 };
  const total = points.reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), { x: 0, y: 0 });
  return { x: total.x / points.length, y: total.y / points.length };
}

function clampZoom(value) {
  return Math.max(0.65, Math.min(3, Number(value.toFixed(3))));
}

function constrainMapPan(pan, rect = document.querySelector('[data-map-workspace]')?.getBoundingClientRect()) {
  if (!rect) return pan;
  const overflowX = Math.max(0, rect.width * state.zoom - rect.width);
  const overflowY = Math.max(0, rect.height * state.zoom - rect.height);
  const slackX = Math.max(86, rect.width * 0.24);
  const slackY = Math.max(96, rect.height * 0.2);
  return {
    x: Math.max(-overflowX - slackX, Math.min(slackX, pan.x)),
    y: Math.max(-overflowY - slackY, Math.min(slackY, pan.y))
  };
}

function clientToMapPoint(clientX, clientY, workspace) {
  const rect = workspace.getBoundingClientRect();
  const x = ((clientX - rect.left - state.mapPan.x) / (rect.width * state.zoom)) * 100;
  const y = ((clientY - rect.top - state.mapPan.y) / (rect.height * state.zoom)) * 100;
  return {
    x: Math.max(4, Math.min(96, Number(x.toFixed(1)))),
    y: Math.max(5, Math.min(95, Number(y.toFixed(1))))
  };
}

function updateMapCanvas() {
  const canvas = document.querySelector('[data-map-canvas]');
  if (canvas) canvas.style.transform = `translate3d(${state.mapPan.x}px, ${state.mapPan.y}px, 0) scale(${state.zoom})`;
}

function scheduleMapCanvasUpdate() {
  if (mapInteraction.raf) cancelAnimationFrame(mapInteraction.raf);
  mapInteraction.raf = requestAnimationFrame(() => {
    mapInteraction.raf = null;
    updateMapCanvas();
  });
}

function updateDraggedNode(node) {
  const nodeKey = node.id || node.name;
  const button = document.querySelector(`[data-map-node="${cssEscape(nodeKey)}"]`);
  if (button) {
    button.style.left = `${node.x}%`;
    button.style.top = `${node.y}%`;
  }
  const line = document.querySelector(`.lines line[data-line-node="${cssEscape(nodeKey)}"]`);
  const flowLine = document.querySelector(`.lines line[data-flow-node="${cssEscape(nodeKey)}"]`);
  [line, flowLine].filter(Boolean).forEach((targetLine) => {
    targetLine.setAttribute('x2', node.x);
    targetLine.setAttribute('y2', node.y);
  });
  const token = document.querySelector(`.line-token[data-token-node="${cssEscape(nodeKey)}"]`);
  if (token) {
    token.style.setProperty('--dx', `${node.x - 50}%`);
    token.style.setProperty('--dy', `${node.y - 50}%`);
  }
}

function cssEscape(value) {
  return window.CSS?.escape ? CSS.escape(value) : String(value).replace(/"/g, '\\"');
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updateCropImage() {
  if (state.cropRaf) return;
  state.cropRaf = requestAnimationFrame(() => {
    state.cropRaf = null;
    const image = document.querySelector('.crop-frame img');
    if (!image || state.overlay?.type !== 'photo-crop') return;
    image.style.setProperty('--crop-scale', state.overlay.zoom || 1);
    image.style.setProperty('--crop-x', `${state.overlay.x || 0}px`);
    image.style.setProperty('--crop-y', `${state.overlay.y || 0}px`);
  });
}

function cropPointerDistance() {
  const points = [...state.cropPointers.values()];
  if (points.length < 2) return 0;
  return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
}

function clearCropPointer(event) {
  if (!state.cropPointers.has(event.pointerId)) return;
  state.cropPointers.delete(event.pointerId);
  state.cropDragStart = null;
}

async function createCroppedPhotoFile(crop) {
  const image = await loadImage(crop.src);
  const canvas = document.createElement('canvas');
  const size = 720;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f3f3f3';
  ctx.fillRect(0, 0, size, size);
  const baseScale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
  const scale = baseScale * (crop.zoom || 1);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const x = (size - width) / 2 + (crop.x || 0) * 3;
  const y = (size - height) / 2 + (crop.y || 0) * 3;
  ctx.drawImage(image, x, y, width, height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  return new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

render();
initAuth();
