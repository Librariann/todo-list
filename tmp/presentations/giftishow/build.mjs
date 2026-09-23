import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "/Users/librarian/Desktop/features/growdo/todo-list";
const SKILL_DIR = "/Users/librarian/.codex/plugins/cache/openai-primary-runtime/presentations/26.904.11930/skills/presentations";
const TMP_DIR = path.join(workspaceDir, "tmp/presentations/giftishow");
const FINAL_PPTX = path.join(
  workspaceDir,
  "output/pptx/GrowDo_기프티쇼_API_연동_서비스_기획서_편집본.pptx",
);
const RUNTIME_PYTHON = "/Users/librarian/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";

const { finalizePresentation } = await import(
  pathToFileURL(path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs")).href
);

const W = 1280;
const H = 720;
const FONT = "Apple SD Gothic Neo";
const CREAM = "#F7F3E9";
const PAPER = "#FFFCF5";
const INK = "#203128";
const DEEP = "#263A2F";
const GREEN = "#2F9A52";
const GREEN_DARK = "#1F6F3A";
const MINT = "#DDEBDD";
const MINT_LIGHT = "#EDF5EA";
const SAGE = "#AFCBB4";
const GOLD = "#D8AA4B";
const MUTED = "#6E786F";
const LINE = "#D7DDD3";
const WHITE = "#FFFFFF";

const logo = new Uint8Array(await fs.readFile(path.join(workspaceDir, "public/growdo-logo.png")));
const habitScreen = new Uint8Array(
  await fs.readFile(
    "/tmp/codex-remote-attachments/019fac72-f523-74b2-93a3-2a2089e71b50/FA307DB6-505D-4B1C-983C-2F21CCCBA2CA/1-Photo-1.jpg",
  ),
);
const rewardScreen = new Uint8Array(
  await fs.readFile(
    "/var/folders/x5/dmgc35kd2cq8j572y3zlhdzm0000gn/T/TemporaryItems/NSIRD_screencaptureui_5wWiDl/Screenshot 2026-09-20 at 6.09.15 PM.png",
  ),
);

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

function addText(slide, text, position, options = {}) {
  const box = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { fill: "none", width: 0 },
  });
  box.text = text;
  box.text.style = {
    typeface: FONT,
    fontSize: options.fontSize ?? 22,
    bold: options.bold ?? false,
    color: options.color ?? INK,
    alignment: options.alignment ?? "left",
    verticalAlignment: options.verticalAlignment ?? "top",
    autoFit: options.autoFit ?? "shrinkText",
    wrap: "square",
    lineSpacing: options.lineSpacing ?? 1.15,
    insets: options.insets ?? { top: 0, right: 0, bottom: 0, left: 0 },
  };
  return box;
}

function addRect(slide, position, fill, options = {}) {
  return slide.shapes.add({
    geometry: options.geometry ?? "rect",
    position,
    fill,
    line: options.line ?? { fill: "none", width: 0 },
    borderRadius: options.borderRadius,
  });
}

function addLine(slide, left, top, width, color = LINE, thickness = 1) {
  return slide.shapes.add({
    geometry: "line",
    position: { left, top, width, height: 0 },
    fill: "none",
    line: { style: "solid", fill: color, width: thickness },
  });
}

function addHeader(slide, section, title, subtitle = "", dark = false) {
  addText(slide, section, { left: 72, top: 46, width: 420, height: 24 }, {
    fontSize: 17,
    color: dark ? "#8FD19D" : GREEN,
    bold: true,
  });
  addText(slide, title, { left: 72, top: 82, width: 1120, height: 64 }, {
    fontSize: 37,
    color: dark ? WHITE : INK,
    bold: true,
  });
  if (subtitle) {
    addText(slide, subtitle, { left: 72, top: 148, width: 1080, height: 52 }, {
      fontSize: 19,
      color: dark ? "#C9D6CC" : MUTED,
      lineSpacing: 1.25,
    });
  }
}

function addFooter(slide, number, dark = false) {
  addLine(slide, 72, 680, 1136, dark ? "#587061" : LINE, 1);
  addText(slide, `GrowDo  |  기프티쇼 비즈 API 연동`, { left: 72, top: 688, width: 360, height: 20 }, {
    fontSize: 12,
    color: dark ? "#AFC0B3" : MUTED,
  });
  addText(slide, String(number), { left: 1160, top: 688, width: 48, height: 20 }, {
    fontSize: 12,
    color: dark ? "#AFC0B3" : MUTED,
    alignment: "right",
  });
}

function addStep(slide, x, y, number, title, body, accent = GREEN) {
  const circle = addRect(
    slide,
    { left: x, top: y, width: 44, height: 44 },
    accent,
    { geometry: "ellipse" },
  );
  circle.text = String(number);
  circle.text.style = {
    typeface: FONT,
    fontSize: 19,
    bold: true,
    color: WHITE,
    alignment: "center",
    verticalAlignment: "middle",
    autoFit: "none",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };
  addText(slide, title, { left: x + 58, top: y - 2, width: 190, height: 28 }, {
    fontSize: 22,
    bold: true,
  });
  addText(slide, body, { left: x + 58, top: y + 31, width: 224, height: 58 }, {
    fontSize: 16,
    color: MUTED,
    lineSpacing: 1.2,
  });
}

// Slide 1: cover
{
  const slide = presentation.slides.add();
  slide.background.fill = DEEP;
  slide.images.add({
    blob: logo,
    contentType: "image/png",
    alt: "GrowDo 로고",
    fit: "contain",
    position: { left: 72, top: 66, width: 58, height: 58 },
  });
  addText(slide, "GrowDo", { left: 145, top: 72, width: 230, height: 48 }, {
    fontSize: 33,
    bold: true,
    color: WHITE,
  });
  addText(slide, "기프티쇼 비즈 API 연동", { left: 72, top: 206, width: 760, height: 72 }, {
    fontSize: 51,
    bold: true,
    color: WHITE,
  });
  addText(slide, "서비스 기획서", { left: 72, top: 276, width: 520, height: 70 }, {
    fontSize: 51,
    bold: true,
    color: WHITE,
  });
  addText(
    slide,
    "사용자가 습관과 목표를 달성해 적립한 포인트를\n모바일 쿠폰으로 교환하는 고객 보상 서비스",
    { left: 76, top: 384, width: 720, height: 92 },
    { fontSize: 23, color: "#D9E6DC", lineSpacing: 1.35 },
  );
  addText(slide, "작성일  2026.09.23", { left: 76, top: 626, width: 280, height: 24 }, {
    fontSize: 15,
    color: "#B7C5BA",
  });
  addText(slide, "담당 문의  okpc0305@gmail.com", { left: 816, top: 626, width: 390, height: 24 }, {
    fontSize: 15,
    color: "#B7C5BA",
    alignment: "right",
  });
}

// Slide 2: service overview
{
  const slide = presentation.slides.add();
  slide.background.fill = CREAM;
  addHeader(
    slide,
    "01  서비스 개요",
    "기록과 달성을 연결하는 자기관리 서비스",
    "GrowDo는 습관, 할 일, 목표를 기록하고 달성 흐름을 이어가도록 돕는 웹 및 모바일 서비스입니다.",
  );

  addStep(slide, 84, 246, 1, "기록", "반복 행동과 오늘 할 일을\n성격에 맞게 나누어 관리");
  addLine(slide, 106, 334, 252, SAGE, 2);
  addStep(slide, 84, 365, 2, "달성", "완료 기록을 바탕으로\n챌린지 진행도를 반영");
  addLine(slide, 106, 453, 252, SAGE, 2);
  addStep(slide, 84, 484, 3, "보상", "챌린지 포인트로\n모바일 쿠폰을 교환", GOLD);

  addRect(slide, { left: 760, top: 210, width: 326, height: 430 }, PAPER, {
    borderRadius: 28,
    line: { style: "solid", fill: LINE, width: 1 },
  });
  slide.images.add({
    blob: habitScreen,
    contentType: "image/jpeg",
    alt: "GrowDo 습관 화면",
    fit: "contain",
    geometry: "roundRect",
    borderRadius: 22,
    position: { left: 806, top: 224, width: 234, height: 398 },
  });
  addText(slide, "실제 모바일 화면", { left: 1098, top: 600, width: 110, height: 22 }, {
    fontSize: 13,
    color: GREEN,
    alignment: "right",
  });

  addText(
    slide,
    "포인트와 쿠폰은 서비스 활동을 이어가는 작은 보상으로 운영합니다. 현금 환급이나 재판매 기능은 제공하지 않습니다.",
    { left: 405, top: 266, width: 290, height: 126 },
    { fontSize: 21, color: INK, lineSpacing: 1.35 },
  );
  addLine(slide, 405, 422, 250, GREEN, 4);
  addText(slide, "대상 이용자", { left: 405, top: 453, width: 120, height: 24 }, {
    fontSize: 16,
    bold: true,
    color: GREEN_DARK,
  });
  addText(slide, "만 14세 이상 GrowDo 회원", { left: 405, top: 485, width: 270, height: 32 }, {
    fontSize: 21,
    bold: true,
  });
  addText(slide, "가입 방식", { left: 405, top: 545, width: 120, height: 24 }, {
    fontSize: 16,
    bold: true,
    color: GREEN_DARK,
  });
  addText(slide, "Google · Apple · 카카오 · 네이버", { left: 405, top: 577, width: 310, height: 34 }, {
    fontSize: 19,
  });
  addFooter(slide, 2);
  slide.speakerNotes.textFrame.setText("GrowDo 실제 모바일 화면은 신청 서비스에서 캡처한 자료입니다.");
}

// Slide 3: user journey
{
  const slide = presentation.slides.add();
  slide.background.fill = CREAM;
  addHeader(
    slide,
    "02  사용자 이용 흐름",
    "포인트 적립부터 내 쿠폰 확인까지",
    "로그인한 이용자가 자신의 포인트로 교환을 요청하고, 발급된 쿠폰은 같은 계정에서만 확인합니다.",
  );

  addRect(slide, { left: 74, top: 218, width: 318, height: 400 }, PAPER, {
    borderRadius: 24,
    line: { style: "solid", fill: LINE, width: 1 },
  });
  slide.images.add({
    blob: rewardScreen,
    contentType: "image/png",
    alt: "GrowDo 보상 화면",
    fit: "contain",
    geometry: "roundRect",
    borderRadius: 18,
    position: { left: 108, top: 232, width: 250, height: 372 },
  });

  const flow = [
    ["01", "활동 완료", "습관, 할 일 또는 목표 완료"],
    ["02", "포인트 적립", "챌린지 기준 충족 시 지급"],
    ["03", "보상 선택", "원하는 모바일 쿠폰 선택"],
    ["04", "교환 확정", "포인트와 발급 조건 검증"],
    ["05", "쿠폰 확인", "내 쿠폰함에서 본인만 열람"],
  ];
  let y = 226;
  for (let i = 0; i < flow.length; i += 1) {
    const [num, title, body] = flow[i];
    addText(slide, num, { left: 454, top: y + 2, width: 46, height: 26 }, {
      fontSize: 16,
      bold: true,
      color: i === flow.length - 1 ? GOLD : GREEN,
    });
    addText(slide, title, { left: 518, top: y, width: 180, height: 32 }, {
      fontSize: 23,
      bold: true,
    });
    addText(slide, body, { left: 720, top: y + 3, width: 400, height: 30 }, {
      fontSize: 18,
      color: MUTED,
    });
    if (i < flow.length - 1) addLine(slide, 454, y + 58, 676, LINE, 1);
    y += 74;
  }

  addRect(slide, { left: 454, top: 604, width: 676, height: 42 }, MINT_LIGHT, {
    borderRadius: 12,
  });
  addText(
    slide,
    "쿠폰 유효기간은 API 응답값을 기준으로 상세 화면에 표시합니다.",
    { left: 476, top: 614, width: 630, height: 24 },
    { fontSize: 16, color: GREEN_DARK, alignment: "center" },
  );
  addFooter(slide, 3);
  slide.speakerNotes.textFrame.setText("GrowDo 실제 보상 화면은 신청 서비스에서 캡처한 자료입니다.");
}

// Slide 4: API integration
{
  const slide = presentation.slides.add();
  slide.background.fill = DEEP;
  addHeader(
    slide,
    "03  API 연동 계획",
    "교환 요청과 쿠폰 발급 처리",
    "1차 연동 희망 방식은 바코드 이미지 수신형(I)이며, 운영 협의에 따라 PIN 수신형(Y)도 함께 검토합니다.",
    true,
  );

  const actors = [
    [100, "GrowDo 사용자"],
    [390, "GrowDo 백엔드"],
    [680, "기프티쇼 API"],
    [970, "비공개 저장소"],
  ];
  for (const [x, name] of actors) {
    addText(slide, name, { left: x, top: 230, width: 210, height: 34 }, {
      fontSize: 21,
      bold: true,
      color: WHITE,
      alignment: "center",
    });
    addLine(slide, x + 105, 276, 0, "#587061", 1);
    const lifeline = slide.shapes.add({
      geometry: "line",
      position: { left: x + 105, top: 276, width: 0, height: 314 },
      fill: "none",
      line: { style: "dashed", fill: "#587061", width: 1 },
    });
    void lifeline;
  }

  const messages = [
    [306, 205, 495, "1  포인트 교환 요청", GREEN],
    [360, 495, 205, "2  포인트·중복·상품 검증", GOLD],
    [414, 495, 785, "3  쿠폰 발급 API 호출", GREEN],
    [468, 785, 495, "4  PIN·이미지·유효기간 응답", GOLD],
    [522, 495, 1075, "5  암호화 및 비공개 저장", GREEN],
    [576, 495, 205, "6  내 쿠폰 정보 반환", GOLD],
  ];
  for (const [top, from, to, text, color] of messages) {
    const left = Math.min(from, to);
    const width = Math.abs(to - from);
    const arrow = addRect(slide, { left, top, width, height: 20 }, color, {
      geometry: to > from ? "rightArrow" : "leftArrow",
    });
    arrow.fill = color;
    addText(slide, text, { left, top: top - 24, width, height: 22 }, {
      fontSize: 15,
      color: "#D9E5DB",
      alignment: "center",
    });
  }
  addFooter(slide, 4, true);
  slide.speakerNotes.textFrame.setText(
    "출처: 기프티쇼 비즈 API 연동규격서 https://biz.giftishow.com/external/down/api_qna.pdf\n규격서의 발송 구분값 I(바코드 이미지), Y(PIN 번호) 설명을 참고했습니다.",
  );
}

// Slide 5: security and operations
{
  const slide = presentation.slides.add();
  slide.background.fill = CREAM;
  addHeader(
    slide,
    "04  보안 및 운영 정책",
    "중복 발급과 쿠폰 정보 노출 방지",
    "교환 거래의 정합성, 발급 데이터 보호, 사용자 소유권 확인을 각각 분리해 적용합니다.",
  );

  addLine(slide, 640, 232, 0, LINE, 1);
  slide.shapes.add({
    geometry: "line",
    position: { left: 640, top: 232, width: 0, height: 330 },
    fill: "none",
    line: { style: "solid", fill: LINE, width: 1 },
  });
  addLine(slide, 82, 396, 1116, LINE, 1);

  const items = [
    [86, 244, "01", "중복 교환 방지", "UUID 기반 멱등성 키와 DB 고유 제약을 적용합니다. 교환 중에는 사용자, 보상, 재고 행을 트랜잭션에서 잠급니다."],
    [682, 244, "02", "쿠폰 PIN 암호화", "쿠폰 번호는 AES-256-GCM 방식으로 암호화합니다. 운영 화면과 로그에는 평문 PIN을 남기지 않습니다."],
    [86, 422, "03", "쿠폰 이미지 비공개", "공개 S3 URL을 제공하지 않습니다. GrowDo가 소유권을 확인한 뒤 비공개 이미지 서버를 통해 이미지를 전달합니다."],
    [682, 422, "04", "본인 계정만 열람", "발급 쿠폰은 사용자 보상 이력과 연결합니다. 다른 사용자 번호로 요청하면 PIN과 이미지를 반환하지 않습니다."],
  ];
  for (const [x, y, num, heading, body] of items) {
    addText(slide, num, { left: x, top: y, width: 50, height: 26 }, {
      fontSize: 16,
      bold: true,
      color: Number(num) <= 2 ? GREEN : GOLD,
    });
    addText(slide, heading, { left: x, top: y + 36, width: 470, height: 38 }, {
      fontSize: 27,
      bold: true,
    });
    addText(slide, body, { left: x, top: y + 88, width: 470, height: 78 }, {
      fontSize: 17,
      color: MUTED,
      lineSpacing: 1.25,
    });
  }
  addText(
    slide,
    "쿠폰 문의와 클레임은 GrowDo 고객지원에서 1차 확인하고 발급 이력을 추적합니다.",
    { left: 154, top: 618, width: 972, height: 30 },
    { fontSize: 17, color: GREEN_DARK, alignment: "center" },
  );
  addFooter(slide, 5);
}

// Slide 6: operating plan and request
{
  const slide = presentation.slides.add();
  slide.background.fill = CREAM;
  addHeader(
    slide,
    "05  운영 계획 및 요청 사항",
    "소규모 베타 운영 후 발급량 확대",
    "초기에는 커피 쿠폰 중심으로 발급과 문의 흐름을 검증하고, 운영 결과를 확인한 뒤 상품을 확대할 계획입니다.",
  );

  const rows = [
    ["이용 목적", "고객관리 및 서비스 이용 리워드"],
    ["초기 상품", "스타벅스 커피 등 소액 모바일 쿠폰"],
    ["예상 규모", "베타 월 10-30건 내외, 이용자 증가에 따라 확대"],
    ["발급 시점", "사용자가 포인트 교환을 확정한 즉시"],
    ["희망 방식", "바코드 이미지 수신(I), 필요 시 PIN 수신(Y)"],
    ["고객 문의", "GrowDo가 직접 1차 접수 및 처리"],
  ];
  let y = 236;
  for (const [head, body] of rows) {
    addText(slide, head, { left: 82, top: y, width: 140, height: 28 }, {
      fontSize: 17,
      bold: true,
      color: GREEN_DARK,
    });
    addText(slide, body, { left: 238, top: y, width: 510, height: 30 }, {
      fontSize: 18,
    });
    addLine(slide, 82, y + 42, 666, LINE, 1);
    y += 58;
  }

  addRect(slide, { left: 818, top: 234, width: 390, height: 224 }, DEEP, {
    borderRadius: 22,
  });
  addText(slide, "연동 요청", { left: 850, top: 266, width: 120, height: 24 }, {
    fontSize: 16,
    bold: true,
    color: "#8FD19D",
  });
  addText(slide, "API 연동발송\n서비스 승인", { left: 850, top: 310, width: 318, height: 88 }, {
    fontSize: 34,
    bold: true,
    color: WHITE,
    lineSpacing: 1.15,
  });
  addText(slide, "상용 인증키 발급과 연동 검토를 요청드립니다.", { left: 850, top: 408, width: 310, height: 28 }, {
    fontSize: 17,
    color: "#D2DED5",
  });

  addText(slide, "GrowDo 서비스 운영", { left: 818, top: 500, width: 260, height: 32 }, {
    fontSize: 23,
    bold: true,
  });
  addText(slide, "okpc0305@gmail.com", { left: 818, top: 542, width: 260, height: 26 }, {
    fontSize: 17,
    color: MUTED,
  });
  addText(slide, "https://growdo.kr", { left: 818, top: 574, width: 260, height: 26 }, {
    fontSize: 17,
    color: MUTED,
  });
  addText(
    slide,
    "예상 규모는 베타 운영 기준이며 실제 이용자 수에 따라 변동될 수 있습니다.",
    { left: 82, top: 622, width: 666, height: 24 },
    { fontSize: 14, color: MUTED },
  );
  addFooter(slide, 6);
  slide.speakerNotes.textFrame.setText(
    "참고: 기프티쇼 비즈 API 연동규격서 https://biz.giftishow.com/external/down/api_qna.pdf\n참고: 모바일 쿠폰 API 가이드 https://biz.giftishow.com/blog/mobile-coupon-api-guide",
  );
}

await fs.mkdir(TMP_DIR, { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });
const stagingDir = path.join(workspaceDir, ".codex-finalizer");
await fs.mkdir(stagingDir, { recursive: true });
const candidatePath = path.join(stagingDir, "growdo-giftishow-candidate.pptx");
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

const requirements = {
  explicitTotalSlideCount: 6,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
};
const fontPolicy = { basis: "design", families: [FONT] };
const expectedSlideSizeEmu = "12192000,6858000";

await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(
    SKILL_DIR,
    "container_tools/inspect_presentation_package_integrity.py",
  ),
  layoutValidatorPath: path.join(
    SKILL_DIR,
    "container_tools/inspect_presentation_layout_geometry.py",
  ),
  layoutArgs: [
    "--expected-slide-size-emu",
    expectedSlideSizeEmu,
    "--validate-heading-fit",
    "--validate-heading-punctuation",
    "--cover-role",
    "cover",
    "--cover-word-limit",
    "45",
    "--folio-mode",
    "actual_unpadded",
  ],
  requiredNativeTableOwnerSlides: [],
  fontPolicy,
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, "GrowDo_Giftishow_PPTX.validation.json"),
});

console.log(FINAL_PPTX);
