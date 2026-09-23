from pathlib import Path
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape, A4


ROOT = Path('/Users/librarian/Desktop/features/growdo/todo-list')
OUTPUT = ROOT / 'output/pdf/GrowDo_기프티쇼_API_연동_서비스_기획서.pdf'
LOGO = ROOT / 'public/growdo-logo.png'
HABIT_SCREEN = Path('/tmp/codex-remote-attachments/019fac72-f523-74b2-93a3-2a2089e71b50/FA307DB6-505D-4B1C-983C-2F21CCCBA2CA/1-Photo-1.jpg')
REWARD_SCREEN = Path('/var/folders/x5/dmgc35kd2cq8j572y3zlhdzm0000gn/T/TemporaryItems/NSIRD_screencaptureui_5wWiDl/Screenshot 2026-09-20 at 6.09.15\u202fPM.png')

PAGE_W, PAGE_H = landscape(A4)
FONT = 'AppleGothic'
FONT_PATH = '/System/Library/Fonts/Supplemental/AppleGothic.ttf'

CREAM = HexColor('#F7F3E9')
PAPER = HexColor('#FFFCF5')
INK = HexColor('#203128')
DEEP = HexColor('#263A2F')
GREEN = HexColor('#2F9A52')
GREEN_DARK = HexColor('#1F6F3A')
MINT = HexColor('#DDEBDD')
MINT_LIGHT = HexColor('#EDF5EA')
SAGE = HexColor('#AFCBB4')
GOLD = HexColor('#D8AA4B')
MUTED = HexColor('#6E786F')
LINE = HexColor('#D7DDD3')
WHITE = HexColor('#FFFFFF')
RED = HexColor('#C4513F')


def register_fonts():
    pdfmetrics.registerFont(TTFont(FONT, FONT_PATH))


def set_font(c, size, color=INK):
    c.setFont(FONT, size)
    c.setFillColor(color)


def wrap_text(text, size, max_width):
    words = text.split(' ')
    lines = []
    current = ''
    for word in words:
        candidate = word if not current else f'{current} {word}'
        if pdfmetrics.stringWidth(candidate, FONT, size) <= max_width:
            current = candidate
            continue
        if current:
            lines.append(current)
        current = word
    if current:
        lines.append(current)
    return lines


def paragraph(c, text, x, y, width, size=11, leading=None, color=MUTED, max_lines=None):
    leading = leading or size * 1.55
    lines = []
    for raw in text.split('\n'):
        if not raw:
            lines.append('')
        else:
            lines.extend(wrap_text(raw, size, width))
    if max_lines:
        lines = lines[:max_lines]
    set_font(c, size, color)
    cursor = y
    for line in lines:
        c.drawString(x, cursor, line)
        cursor -= leading
    return cursor


def label(c, text, x, y, color=GREEN):
    set_font(c, 8.5, color)
    label_text = c.beginText(x, y)
    label_text.setFont(FONT, 8.5)
    label_text.setFillColor(color)
    label_text.setCharSpace(1.6)
    label_text.textLine(text)
    c.drawText(label_text)


def title(c, text, x, y, size=27, color=INK):
    set_font(c, size, color)
    c.drawString(x, y, text)


def rounded(c, x, y, w, h, radius=14, fill=PAPER, stroke=None, width=1):
    c.setLineWidth(width)
    c.setFillColor(fill)
    if stroke:
        c.setStrokeColor(stroke)
        c.roundRect(x, y, w, h, radius, fill=1, stroke=1)
    else:
        c.roundRect(x, y, w, h, radius, fill=1, stroke=0)


def pill(c, text, x, y, fill=GREEN, color=WHITE, size=8.5, pad_x=10, h=22):
    w = pdfmetrics.stringWidth(text, FONT, size) + pad_x * 2
    rounded(c, x, y, w, h, h / 2, fill)
    set_font(c, size, color)
    c.drawCentredString(x + w / 2, y + 7, text)
    return w


def page_base(c, page_no, section, dark=False):
    c.setFillColor(DEEP if dark else CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    if dark:
        c.setStrokeColor(Color(1, 1, 1, alpha=0.16))
        footer_color = HexColor('#B7C5BA')
    else:
        c.setStrokeColor(LINE)
        footer_color = MUTED
    c.setLineWidth(0.7)
    c.line(44, 28, PAGE_W - 44, 28)
    set_font(c, 7.8, footer_color)
    c.drawString(44, 15, f'GROWDO  /  {section}')
    c.drawRightString(PAGE_W - 44, 15, f'{page_no:02d}')


def draw_contained_image(c, path, x, y, w, h, bg=WHITE, radius=18):
    rounded(c, x, y, w, h, radius, bg, LINE, 0.8)
    if not path.exists():
        set_font(c, 10, MUTED)
        c.drawCentredString(x + w / 2, y + h / 2, '이미지 준비 중')
        return
    image = ImageReader(str(path))
    iw, ih = image.getSize()
    scale = min((w - 12) / iw, (h - 12) / ih)
    dw, dh = iw * scale, ih * scale
    c.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, mask='auto')


def draw_logo(c, x, y, size):
    if LOGO.exists():
        c.drawImage(str(LOGO), x, y, size, size, mask='auto')
    else:
        rounded(c, x, y, size, size, 10, GREEN)
        set_font(c, size * 0.42, WHITE)
        c.drawCentredString(x + size / 2, y + size * 0.34, 'G')


def icon_circle(c, x, y, text, fill=GREEN):
    c.setFillColor(fill)
    c.circle(x, y, 14, fill=1, stroke=0)
    set_font(c, 9.5, WHITE)
    c.drawCentredString(x, y - 3.5, text)


def info_card(c, x, y, w, h, kicker, heading, body, accent=GREEN):
    rounded(c, x, y, w, h, 14, PAPER, LINE, 0.7)
    label(c, kicker, x + 16, y + h - 22, accent)
    set_font(c, 15, INK)
    c.drawString(x + 16, y + h - 47, heading)
    paragraph(c, body, x + 16, y + h - 68, w - 32, 9, 14, MUTED)


def draw_cover(c):
    c.setFillColor(DEEP)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(HexColor('#355343'))
    c.circle(PAGE_W - 65, PAGE_H + 20, 180, fill=1, stroke=0)
    c.setFillColor(HexColor('#31483A'))
    c.circle(PAGE_W - 20, 10, 110, fill=1, stroke=0)
    c.setFillColor(HexColor('#8BBF97'))
    c.circle(PAGE_W - 118, 138, 16, fill=1, stroke=0)

    draw_logo(c, 54, PAGE_H - 90, 42)
    set_font(c, 21, WHITE)
    c.drawString(106, PAGE_H - 76, 'GrowDo')
    label(c, 'SERVICE INTEGRATION PROPOSAL', 54, PAGE_H - 126, HexColor('#91CDA0'))

    title(c, '기프티쇼 비즈 API 연동', 54, PAGE_H - 190, 31, WHITE)
    title(c, '서비스 기획서', 54, PAGE_H - 232, 31, WHITE)
    paragraph(
        c,
        '습관과 목표 달성으로 적립한 포인트를\n모바일 쿠폰으로 안전하게 교환하는 리워드 경험',
        56,
        PAGE_H - 274,
        400,
        13,
        21,
        HexColor('#D9E6DC'),
    )

    pill(c, '고객관리', 56, 92, GREEN)
    pill(c, '모바일 쿠폰 자동 발급', 137, 92, HexColor('#3D5D49'))
    set_font(c, 9, HexColor('#B7C5BA'))
    c.drawString(56, 57, '작성일  2026.09.23     버전  1.0')
    c.drawRightString(PAGE_W - 54, 57, '담당 문의  okpc0305@gmail.com')


def draw_service_overview(c):
    page_base(c, 2, '서비스 개요')
    label(c, '01  SERVICE OVERVIEW', 48, PAGE_H - 52)
    title(c, '오늘의 실천이 보상으로 이어지는 자기관리 서비스', 48, PAGE_H - 88, 23)
    paragraph(
        c,
        'GrowDo는 사용자가 습관, 할 일, 목표를 기록하고 달성 흐름을 이어가도록 돕는 웹 및 모바일 서비스입니다. 기록을 완료하면 챌린지가 자동 진행되고, 달성 포인트는 서비스 안의 모바일 쿠폰으로 교환할 수 있습니다.',
        48,
        PAGE_H - 116,
        500,
        10.5,
        17,
        MUTED,
    )

    card_y = 214
    card_w = 135
    gap = 10
    cards = [
        ('01', '기록', '습관·할 일·목표를\n성격과 주기에 맞게 관리'),
        ('02', '달성', '완료 기록과 연속 달성으로\n챌린지 진행도를 반영'),
        ('03', '적립', '도전과제 달성 기준에 따라\n서비스 포인트를 지급'),
        ('04', '교환', '적립 포인트로 원하는\n모바일 쿠폰을 선택'),
    ]
    for i, (num, heading, body) in enumerate(cards):
        x = 48 + i * (card_w + gap)
        rounded(c, x, card_y, card_w, 104, 14, PAPER, LINE, 0.7)
        icon_circle(c, x + 26, card_y + 77, num, GREEN if i < 3 else GOLD)
        set_font(c, 14, INK)
        c.drawString(x + 48, card_y + 72, heading)
        paragraph(c, body, x + 16, card_y + 45, card_w - 30, 8.7, 14, MUTED)

    draw_contained_image(c, HABIT_SCREEN, 640, 52, 155, 266, PAPER, 22)
    label(c, 'ACTUAL MOBILE UI', 652, 38, GREEN)

    rounded(c, 48, 60, 570, 124, 16, MINT_LIGHT)
    label(c, 'CORE VALUE', 68, 158)
    paragraph(
        c,
        '“억지로 소비시키는 보상”이 아니라, 꾸준함을 이어주는 작은 동기',
        68,
        130,
        525,
        14,
        20,
        INK,
    )
    paragraph(
        c,
        '쿠폰은 현금성 거래나 재판매를 위한 수단이 아닙니다. 이용자가 서비스 안에서 직접 달성한 기록과 포인트를 기반으로 본인 계정에 지급하는 고객 리워드입니다.',
        68,
        88,
        525,
        8.5,
        13,
        MUTED,
    )


def draw_user_flow(c):
    page_base(c, 3, '사용자 이용 흐름')
    label(c, '02  USER JOURNEY', 48, PAGE_H - 52)
    title(c, '포인트 적립부터 내 쿠폰 확인까지', 48, PAGE_H - 88, 23)
    paragraph(
        c,
        '교환은 로그인한 이용자가 자신의 포인트로 직접 요청하며, 발급된 쿠폰은 동일 계정의 내 쿠폰함에서만 확인할 수 있습니다.',
        48,
        PAGE_H - 116,
        560,
        10.5,
        17,
        MUTED,
    )

    steps = [
        ('1', '활동 완료', '습관·할 일·목표 달성'),
        ('2', '포인트 적립', '챌린지 기준 충족 시 지급'),
        ('3', '보상 선택', '원하는 모바일 쿠폰 확인'),
        ('4', '교환 확정', '포인트와 재고를 검증'),
        ('5', '쿠폰 확인', '본인 내 쿠폰함에서 열람'),
    ]
    start_x, y, box_w, box_h, gap = 48, 300, 132, 92, 14
    for i, (num, heading, body) in enumerate(steps):
        x = start_x + i * (box_w + gap)
        rounded(c, x, y, box_w, box_h, 14, PAPER, LINE, 0.7)
        icon_circle(c, x + 22, y + box_h - 22, num, GREEN if i != 4 else GOLD)
        set_font(c, 12, INK)
        c.drawString(x + 16, y + 43, heading)
        paragraph(c, body, x + 16, y + 24, box_w - 28, 7.9, 12, MUTED)
        if i < len(steps) - 1:
            c.setStrokeColor(SAGE)
            c.setLineWidth(1.5)
            c.line(x + box_w + 3, y + box_h / 2, x + box_w + gap - 3, y + box_h / 2)
            c.setFillColor(SAGE)
            c.circle(x + box_w + gap - 3, y + box_h / 2, 2.2, fill=1, stroke=0)

    draw_contained_image(c, REWARD_SCREEN, 48, 52, 190, 224, PAPER, 18)

    rounded(c, 262, 52, 506, 224, 16, DEEP)
    label(c, 'REWARD POLICY', 286, 246, HexColor('#8FD19D'))
    set_font(c, 17, WHITE)
    c.drawString(286, 216, '교환 정책의 기본 원칙')
    policies = [
        ('본인 요청', '이용자가 보상 상품과 포인트 사용을 직접 확정'),
        ('정상 적립', '서비스 내 달성 활동으로 지급된 포인트만 사용'),
        ('1회 발급', '동일 교환 요청의 중복 발급과 중복 차감을 차단'),
        ('소유자 열람', '발급된 쿠폰은 해당 이용자 계정에만 연결'),
        ('만료 안내', 'API 응답의 유효기간을 쿠폰 상세 화면에 표시'),
    ]
    yy = 184
    for idx, (head, body) in enumerate(policies, 1):
        c.setFillColor(HexColor('#3E5A49'))
        c.circle(298, yy + 3, 9, fill=1, stroke=0)
        set_font(c, 7.8, WHITE)
        c.drawCentredString(298, yy, str(idx))
        set_font(c, 10, WHITE)
        c.drawString(316, yy, head)
        set_font(c, 8.3, HexColor('#C9D6CC'))
        c.drawString(390, yy, body)
        yy -= 29


def draw_api(c):
    page_base(c, 4, 'API 연동 계획', dark=True)
    label(c, '03  API INTEGRATION', 48, PAGE_H - 52, HexColor('#8FD19D'))
    title(c, '교환 요청과 쿠폰 발급을 하나의 안전한 흐름으로', 48, PAGE_H - 88, 23, WHITE)
    paragraph(
        c,
        '1차 연동 희망 방식은 바코드 이미지 수신형(I)이며, 운영 협의에 따라 PIN 수신형(Y)도 함께 검토합니다.',
        48,
        PAGE_H - 116,
        620,
        10.5,
        17,
        HexColor('#C9D6CC'),
    )

    actors = [
        (90, 'GrowDo 사용자', '교환 요청'),
        (295, 'GrowDo 백엔드', '검증·거래 처리'),
        (515, '기프티쇼 API', '쿠폰 발급'),
        (722, '비공개 저장소', '쿠폰 보호'),
    ]
    y_top, y_bottom = 330, 92
    for x, head, sub in actors:
        rounded(c, x - 62, y_top, 124, 48, 12, HexColor('#344A3D'), Color(1, 1, 1, alpha=0.12), 0.6)
        set_font(c, 11, WHITE)
        c.drawCentredString(x, y_top + 27, head)
        set_font(c, 7.5, HexColor('#AFC0B3'))
        c.drawCentredString(x, y_top + 12, sub)
        c.setStrokeColor(Color(1, 1, 1, alpha=0.18))
        c.setLineWidth(0.8)
        c.line(x, y_top, x, y_bottom)

    events = [
        (305, 90, 295, '1  포인트 교환 요청'),
        (270, 295, 90, '2  포인트·중복·상품 검증'),
        (235, 295, 515, '3  쿠폰 발급 API 호출'),
        (200, 515, 295, '4  PIN·이미지·유효기간 응답'),
        (165, 295, 722, '5  암호화·비공개 저장'),
        (130, 295, 90, '6  내 쿠폰 정보 반환'),
    ]
    for y, x1, x2, text_value in events:
        c.setStrokeColor(HexColor('#82C792') if x2 > x1 else HexColor('#D8B66B'))
        c.setLineWidth(1.6)
        c.line(x1, y, x2, y)
        direction = 1 if x2 > x1 else -1
        c.setFillColor(c._strokeColorObj)
        c.line(x2, y, x2 - direction * 7, y + 3.5)
        c.line(x2, y, x2 - direction * 7, y - 3.5)
        set_font(c, 8.2, HexColor('#D9E5DB'))
        c.drawCentredString((x1 + x2) / 2, y + 7, text_value)

    rounded(c, 48, 48, 720, 32, 10, HexColor('#31483A'))
    set_font(c, 8.4, HexColor('#C9D6CC'))
    c.drawString(64, 59, '외부 API 실패 시 발급 성공 여부를 확인하고, 미발급이면 포인트 차감을 확정하지 않도록 처리합니다.')


def draw_security(c):
    page_base(c, 5, '보안 및 운영 정책')
    label(c, '04  SECURITY & OPERATIONS', 48, PAGE_H - 52)
    title(c, '중복 발급과 쿠폰 노출을 방지하는 운영 설계', 48, PAGE_H - 88, 23)
    paragraph(
        c,
        '쿠폰은 유가성 정보로 취급합니다. 교환 거래의 정합성, 발급 데이터 보호, 사용자 소유권 확인을 각각 분리해 적용합니다.',
        48,
        PAGE_H - 116,
        620,
        10.5,
        17,
        MUTED,
    )

    cards = [
        ('01  TRANSACTION', '중복 교환 방지', 'UUID 기반 멱등성 키와 DB 고유 제약을 사용하고, 사용자·보상·재고 행을 트랜잭션 안에서 잠급니다.'),
        ('02  ENCRYPTION', '쿠폰 PIN 암호화', '쿠폰 번호는 AES-256-GCM 방식으로 암호화해 저장하며 운영 화면과 로그에 평문을 남기지 않습니다.'),
        ('03  PRIVATE IMAGE', '쿠폰 이미지 비공개', '쿠폰 이미지는 공개 URL로 제공하지 않습니다. GrowDo가 사용자 소유권을 확인한 뒤 비공개 이미지 서버를 경유합니다.'),
        ('04  OWNER ACCESS', '본인 계정만 열람', '발급 쿠폰은 사용자 보상 이력과 1:1로 연결되며, 다른 사용자 번호로 조회해도 이미지와 PIN을 반환하지 않습니다.'),
    ]
    positions = [(48, 235), (414, 235), (48, 80), (414, 80)]
    for (kicker, heading, body), (x, y) in zip(cards, positions):
        info_card(c, x, y, 340, 130, kicker, heading, body, GREEN if y > 100 else GOLD)

    rounded(c, 48, 48, 706, 20, 10, MINT)
    set_font(c, 7.8, GREEN_DARK)
    c.drawCentredString(401, 55, '모든 쿠폰 문의와 클레임은 GrowDo 고객지원에서 1차 확인하고 필요한 발급 이력을 추적합니다.')


def draw_operations(c):
    page_base(c, 6, '운영 계획 및 요청 사항')
    label(c, '05  OPERATING PLAN', 48, PAGE_H - 52)
    title(c, '소규모 베타부터 안정적으로 시작하겠습니다', 48, PAGE_H - 88, 23)
    paragraph(
        c,
        '초기에는 단일 커피 쿠폰 중심으로 운영 검증을 진행하고, 발급·실패·사용자 문의 데이터를 확인한 뒤 상품과 발급량을 단계적으로 확대할 계획입니다.',
        48,
        PAGE_H - 116,
        620,
        10.5,
        17,
        MUTED,
    )

    left_x, top = 48, 328
    rows = [
        ('이용 목적', '고객관리 및 서비스 이용 리워드'),
        ('초기 상품', '스타벅스 커피 등 소액 모바일 쿠폰'),
        ('예상 규모', '베타 월 10-30건 내외, 이용자 증가에 따라 확대'),
        ('발급 시점', '사용자가 포인트 교환을 확정한 즉시'),
        ('희망 방식', '바코드 이미지 수신(I), 필요 시 PIN 수신(Y)'),
        ('고객 문의', 'GrowDo가 직접 1차 접수 및 처리'),
    ]
    rounded(c, left_x, 126, 420, 236, 16, PAPER, LINE, 0.7)
    label(c, 'OPERATING SUMMARY', left_x + 20, top + 10)
    yy = top - 18
    for head, body in rows:
        set_font(c, 8.5, GREEN_DARK)
        c.drawString(left_x + 20, yy, head)
        set_font(c, 9.2, INK)
        c.drawString(left_x + 108, yy, body)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.5)
        c.line(left_x + 20, yy - 12, left_x + 400, yy - 12)
        yy -= 31

    rounded(c, 492, 228, 276, 134, 16, DEEP)
    label(c, 'REQUEST', 514, 337, HexColor('#8FD19D'))
    set_font(c, 16, WHITE)
    c.drawString(514, 308, 'API 연동발송 서비스 승인')
    paragraph(
        c,
        'GrowDo의 포인트 보상 기능에서 모바일 쿠폰을 자동 발급할 수 있도록 상용 인증키 발급 및 연동 검토를 요청드립니다.',
        514,
        282,
        226,
        9.2,
        14.5,
        HexColor('#D2DED5'),
    )

    rounded(c, 492, 126, 276, 86, 16, MINT_LIGHT, LINE, 0.7)
    label(c, 'CONTACT', 514, 190)
    set_font(c, 12, INK)
    c.drawString(514, 166, 'GrowDo 서비스 운영')
    set_font(c, 9.2, MUTED)
    c.drawString(514, 145, 'okpc0305@gmail.com  /  https://growdo.kr')

    set_font(c, 7.5, MUTED)
    c.drawString(48, 101, '참고 자료')
    paragraph(
        c,
        '기프티쇼 비즈 API 연동규격서  https://biz.giftishow.com/external/down/api_qna.pdf\n기프티쇼 비즈 API 이용 안내  https://biz.giftishow.com/blog/mobile-coupon-api-guide',
        48,
        84,
        720,
        7.3,
        12,
        MUTED,
    )


def build():
    register_fonts()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=(PAGE_W, PAGE_H), pageCompression=1)
    c.setTitle('GrowDo 기프티쇼 API 연동 서비스 기획서')
    c.setAuthor('GrowDo')
    c.setSubject('기프티쇼 비즈 API 연동발송 서비스 가입 심사용 기획서')

    pages = [
        draw_cover,
        draw_service_overview,
        draw_user_flow,
        draw_api,
        draw_security,
        draw_operations,
    ]
    for index, draw in enumerate(pages):
        draw(c)
        if index < len(pages) - 1:
            c.showPage()
    c.save()
    print(OUTPUT)


if __name__ == '__main__':
    build()
