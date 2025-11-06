// index.js — handles UI, translations, validation and QR generation using QRCode library from CDN
(function () {
    const el = id => document.getElementById(id);
    const qs = s => document.querySelector(s);

    // Elements
    const type = el('type');
    const inputUrl = el('inputUrl');
    const inputText = el('inputText');
    const generateBtn = el('generate');
    const clearBtn = el('clear');
    const downloadBtn = el('download');
    const canvas = el('qrCanvas');
    const qrImg = el('qrImg');
    const sizeSlider = el('size');
    const langSel = el('lang');
    const themeToggle = el('themeToggle');
    const note = el('note');

    // Contact fields
    const c_name = el('c_name');
    const c_org = el('c_org');
    const c_phone = el('c_phone');
    const c_email = el('c_email');

    // Other fields
    const inputSMS = el('inputSMS');
    const inputSMSBody = el('inputSMSBody');
    const inputEmail = el('inputEmail');
    const inputEmailSubject = el('inputEmailSubject');
    const inputEmailBody = el('inputEmailBody');

    // Simple translations
    const translations = {
        'en': {
            title: 'QR Code Generator', label_type: 'Content type', label_url: 'URL', label_text: 'Text', label_contact: 'Contact', label_sms: 'SMS', label_email: 'Email', generate: 'Generate', clear: 'Clear', download: 'Download', preview: 'Preview', note: 'Notes: Inputs are validated. Avoid extremely long text. JavaScript URLs are blocked.', size: 'Size', footer: 'Lightweight front-end QR generator — works in-browser. Translations & theme available.'
        },
        'ja': {
            title: 'QRコードジェネレーター', label_type: 'コンテンツタイプ', label_url: 'URL', label_text: 'テキスト', label_contact: '連絡先', label_sms: 'SMS', label_email: 'メール', generate: '生成', clear: 'クリア', download: 'ダウンロード', preview: 'プレビュー', note: '注: 入力は検証されます。非常に長いテキストは避けてください。javascript: URLはブロックされます。', size: 'サイズ', footer: '軽量なフロントエンドQRジェネレータ — ブラウザで動作します。'
        },
        'ko': {
            title: 'QR 코드 생성기', label_type: '내용 유형', label_url: 'URL', label_text: '텍스트', label_contact: '연락처', label_sms: 'SMS', label_email: '이메일', generate: '생성', clear: '지우기', download: '다운로드', preview: '미리보기', note: '참고: 입력은 검증됩니다. 지나치게 긴 텍스트를 피하세요. javascript: URL은 차단됩니다.', size: '크기', footer: '경량 프론트엔드 QR 생성기 — 브라우저에서 작동합니다.'
        },
        'fr': {
            title: 'Générateur de QR Code', label_type: 'Type de contenu', label_url: 'URL', label_text: 'Texte', label_contact: 'Contact', label_sms: 'SMS', label_email: 'Email', generate: 'Générer', clear: 'Effacer', download: 'Télécharger', preview: 'Aperçu', note: 'Remarques : les entrées sont validées. Évitez les textes très longs. Les URL javascript: sont bloquées.', size: 'Taille', footer: 'Générateur QR léger côté client — fonctionne dans le navigateur.'
        },
        'zh-TW': {
            title: 'QR 碼產生器', label_type: '內容類型', label_url: '網址', label_text: '文字', label_contact: '聯絡方式', label_sms: '簡訊', label_email: '電子郵件', generate: '產生', clear: '清除', download: '下載', preview: '預覽', note: '備註：輸入會驗證。請避免過長文字。javascript: 類型網址會被阻擋。', size: '大小', footer: '輕量前端 QR 產生器 — 可在瀏覽器中運行。'
        }
    };

    // UI helpers
    function $(sel) { return document.querySelector(sel) }
    function show(id) { document.getElementById(id).classList.remove('hidden') }
    function hide(id) { document.getElementById(id).classList.add('hidden') }

    function updateFields() {
        const t = type.value;
        ['fieldUrl', 'fieldText', 'fieldContact', 'fieldSMS', 'fieldEmail'].forEach(id => hide(id));
        if (t === 'url') show('fieldUrl');
        else if (t === 'text') show('fieldText');
        else if (t === 'contact') show('fieldContact');
        else if (t === 'sms') show('fieldSMS');
        else if (t === 'email') show('fieldEmail');
    }

    function setLang(l) {
        const map = translations[l] || translations.en;
        document.documentElement.lang = l;
        document.body.setAttribute('data-lang', l);
        // write a few UI strings
        document.querySelector('[data-i18n="title"]').textContent = map.title;
        document.querySelector('[data-i18n="label_type"]').textContent = map.label_type;
        document.querySelector('[data-i18n="label_url"]').textContent = map.label_url;
        document.querySelector('[data-i18n="label_text"]').textContent = map.label_text;
        document.querySelector('[data-i18n="label_contact"]').textContent = map.label_contact;
        document.querySelector('[data-i18n="label_sms"]').textContent = map.label_sms;
        document.querySelector('[data-i18n="label_email"]').textContent = map.label_email;
        generateBtn.textContent = map.generate;
        clearBtn.textContent = map.clear;
        downloadBtn.textContent = map.download;
        document.querySelector('[data-i18n="preview"]').textContent = map.preview;
        note.textContent = map.note;
        document.querySelector('[data-i18n="size"]').textContent = map.size;
        document.querySelector('footer small').textContent = map.footer;
    }

    // Validation helpers
    function isSafeUrl(u) {
        if (!u) return false;
        const lower = u.trim().toLowerCase();
        if (lower.startsWith('javascript:')) return false;
        // allow http(s), mailto, tel
        return true;
    }

    // Build payload based on selected type
    function buildPayload() {
        const t = type.value;
        if (t === 'url') {
            let v = inputUrl.value.trim();
            if (!v) return { ok: false, msg: 'URL empty' };
            if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(v)) {
                v = 'https://' + v; // auto add scheme
            }
            if (!isSafeUrl(v)) return { ok: false, msg: 'Prohibited URL' };
            if (v.length > 2048) return { ok: false, msg: 'URL too long' };
            return { ok: true, data: v };
        }
        if (t === 'text') {
            const v = inputText.value;
            if (!v) return { ok: false, msg: 'Text empty' };
            if (v.length > 800) return { ok: false, msg: 'Text too long' };
            return { ok: true, data: v };
        }
        if (t === 'contact') {
            // vCard 3.0
            const n = (c_name.value || '').replace(/\r|\n/g, ' ');
            const org = (c_org.value || '').replace(/\r|\n/g, ' ');
            const tel = (c_phone.value || '').replace(/\s+/g, '');
            const email = (c_email.value || '').replace(/\s+/g, '');
            let v = 'BEGIN:VCARD\nVERSION:3.0\n';
            if (n) v += `FN:${n}\n`;
            if (org) v += `ORG:${org}\n`;
            if (tel) v += `TEL:${tel}\n`;
            if (email) v += `EMAIL:${email}\n`;
            v += 'END:VCARD';
            if (v.length > 1200) return { ok: false, msg: 'Contact content too long' };
            return { ok: true, data: v };
        }
        if (t === 'sms') {
            const to = inputSMS.value.trim();
            if (!to) return { ok: false, msg: 'SMS number empty' };
            const body = inputSMSBody.value || '';
            const payload = `SMSTO:${to}:${body}`;
            return { ok: true, data: payload };
        }
        if (t === 'email') {
            const to = inputEmail.value.trim();
            if (!to) return { ok: false, msg: 'Email empty' };
            const subject = encodeURIComponent(inputEmailSubject.value || '');
            const body = encodeURIComponent(inputEmailBody.value || '');
            let mailto = `mailto:${to}`;
            const params = [];
            if (subject) params.push(`subject=${subject}`);
            if (body) params.push(`body=${body}`);
            if (params.length) mailto += '?' + params.join('&');
            return { ok: true, data: mailto };
        }
        return { ok: false, msg: 'Unknown type' };
    }

    // Generate QR via QRCode.toCanvas (from CDN)
    async function generate() {
        const p = buildPayload();
        if (!p.ok) { alert(p.msg); return; }
        const sz = parseInt(sizeSlider.value, 10) || 256;
        // options: errorCorrectionLevel for resilience
        try {
            // draw to canvas
            await QRCode.toCanvas(canvas, p.data, { width: sz, margin: 1, color: { dark: '#000000', light: '#FFFFFF' } });
            // expose image preview
            const dataUrl = canvas.toDataURL('image/png');
            qrImg.src = dataUrl;
            qrImg.classList.remove('hidden');
            canvas.classList.add('hidden');
            downloadBtn.disabled = false;
        } catch (err) {
            console.error(err);
            alert('Failed to generate QR');
        }
    }

    function clearAll() {
        // reset form fields
        document.getElementById('qrForm').reset();
        updateFields();
        // clear canvas and preview
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        qrImg.src = '';
        qrImg.classList.add('hidden');
        canvas.classList.remove('hidden');
        downloadBtn.disabled = true;
    }

    function download() {
        // ensure there's an image
        const src = qrImg.src || canvas.toDataURL('image/png');
        if (!src) return;
        const a = document.createElement('a');
        a.href = src;
        a.download = 'qrcode.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    // toggle showing canvas vs img when size changes or user clicks preview
    sizeSlider.addEventListener('input', () => {
        const v = parseInt(sizeSlider.value, 10);
        canvas.width = v; canvas.height = v;
        // if image exists, regenerate to new size
        if (!qrImg.classList.contains('hidden')) {
            generate();
        }
    });

    generateBtn.addEventListener('click', generate);
    clearBtn.addEventListener('click', clearAll);
    downloadBtn.addEventListener('click', download);

    type.addEventListener('change', updateFields);
    langSel.addEventListener('change', () => setLang(langSel.value));

    // theme toggle
    themeToggle.addEventListener('click', () => {
        const body = document.body;
        const isDark = body.classList.toggle('dark');
        themeToggle.setAttribute('aria-pressed', String(isDark));
    });

    // clicking preview image toggles between image and canvas
    qrImg.addEventListener('click', () => {
        qrImg.classList.add('hidden');
        canvas.classList.remove('hidden');
    });
    canvas.addEventListener('click', () => {
        if (qrImg.src) { qrImg.classList.remove('hidden'); canvas.classList.add('hidden'); }
    });

    // initial setup
    updateFields();
    setLang('en');
    // set canvas initial size
    canvas.width = canvas.height = parseInt(sizeSlider.value, 10) || 256;

})();
