"""Export the checked Markdown handoff guides and twist addendum as linked PDFs.

Run only after the guide sources reflect the final verified build checkpoint:
  python scripts/build-guides.py
Outputs: output/pdf/*.pdf; QA manifest: tmp/pdfs/manifest.json
No network access or external document converter is needed.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
from pathlib import Path

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    CondPageBreak,
    Flowable,
    Frame,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    XPreformatted,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf"
QA = ROOT / "tmp" / "pdfs"
GUIDES = [
    ("OWNER_NEXT_STEPS", "STEMBridge_Owner_Next_Steps", "OWNER ACTION GUIDE", "01"),
    ("TEAM_TESTING_GUIDE", "STEMBridge_Team_Testing_Guide", "TEAM TESTING GUIDE", "02"),
    ("LIVE_JUDGING_GUIDE", "STEMBridge_Live_Judging_Guide", "LIVE JUDGING GUIDE", "03"),
    ("OFFLINE_TWIST_GUIDE", "STEMBridge_Offline_Twist_Guide", "OFFLINE TWIST GUIDE", "04"),
]
PDF_NAMES = {source + ".md": output + ".pdf" for source, output, _, _ in GUIDES}
INK = colors.HexColor("#213D36")
TEXT = colors.HexColor("#283A35")
MUTED = colors.HexColor("#5B6D65")
LINE = colors.HexColor("#D5DED5")
SAGE = colors.HexColor("#E7EEE4")
PAPER = colors.HexColor("#FBFCF9")
PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 18 * mm
CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN


def register_fonts() -> None:
    font_dir = Path("C:/Windows/Fonts")
    for suffix, filename in [("", "calibri.ttf"), ("-Bold", "calibrib.ttf"),
                             ("-Italic", "calibrii.ttf"), ("-BoldItalic", "calibriz.ttf")]:
        pdfmetrics.registerFont(TTFont("Guide" + suffix, str(font_dir / filename)))
    pdfmetrics.registerFontFamily("Guide", normal="Guide", bold="Guide-Bold",
                                  italic="Guide-Italic", boldItalic="Guide-BoldItalic")
    pdfmetrics.registerFont(TTFont("Guide-Code", str(font_dir / "consola.ttf")))


def normalize(value: str) -> str:
    # Consistent ASCII dashes also avoid glyph substitution in PDF viewers.
    return (value.replace("\u2014", " - ").replace("\u2013", "-")
            .replace("\u2011", "-").replace("\u2010", "-")
            .replace("\u2212", "-").replace("\ufeff", ""))


def link_target(url: str, source: Path) -> str:
    if re.match(r"^[a-zA-Z]+://", url):
        return url
    name = Path(url).name
    if name in PDF_NAMES:
        return PDF_NAMES[name]
    # Other references open the source in the project's existing GitHub repository.
    try:
        relative = (source.parent / url).resolve().relative_to(ROOT).as_posix()
        return "https://github.com/arnavkhurd/stembridge/blob/main/" + relative
    except ValueError:
        return url


def inline(value: str, source: Path) -> str:
    value = normalize(value)
    tokens: list[str] = []

    def token(rendered: str) -> str:
        tokens.append(rendered)
        return f"\x00{len(tokens) - 1}\x00"

    value = re.sub(r"`([^`]+)`", lambda m: token(
        '<font name="Guide-Code" size="9.5">' + html.escape(m[1]) + "</font>"), value)
    value = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", lambda m: token(
        '<link href="' + html.escape(link_target(m[2], source), quote=True)
        + '" color="#315F51"><u>' + html.escape(m[1]) + "</u></link>"), value)
    value = html.escape(value)
    value = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", value)
    value = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<i>\1</i>", value)
    return re.sub(r"\x00(\d+)\x00", lambda m: tokens[int(m[1])], value)


def styles() -> dict[str, ParagraphStyle]:
    body = ParagraphStyle("body", fontName="Guide", fontSize=11.3, leading=15.5,
                          textColor=TEXT, spaceAfter=7, alignment=TA_LEFT,
                          allowWidows=0, allowOrphans=0)
    return {
        "body": body,
        "title": ParagraphStyle("title", parent=body, fontName="Guide-Bold", fontSize=26,
                                leading=29.5, textColor=INK, spaceAfter=13, keepWithNext=True),
        "h2": ParagraphStyle("h2", parent=body, fontName="Guide-Bold", fontSize=16,
                             leading=19, textColor=INK, spaceBefore=13, spaceAfter=8,
                             keepWithNext=False),
        "h3": ParagraphStyle("h3", parent=body, fontName="Guide-Bold", fontSize=12.5,
                             leading=16, textColor=INK, spaceBefore=9, spaceAfter=6,
                             keepWithNext=False),
        "bullet": ParagraphStyle("bullet", parent=body, leftIndent=14,
                                 firstLineIndent=0, bulletIndent=1, spaceAfter=6),
        "check": ParagraphStyle("check", parent=body, spaceAfter=0),
        "table": ParagraphStyle("table", parent=body, fontSize=10.6, leading=14,
                                spaceAfter=0, splitLongWords=True),
        "tablehead": ParagraphStyle("tablehead", parent=body, fontName="Guide-Bold",
                                    fontSize=10.6, leading=13.7, textColor=INK, spaceAfter=0),
        "code": ParagraphStyle("code", parent=body, fontName="Guide-Code", fontSize=9.6,
                               leading=13.5, backColor=SAGE, borderPadding=10,
                               spaceBefore=5, spaceAfter=9),
        "eyebrow": ParagraphStyle("eyebrow", parent=body, fontName="Guide-Bold", fontSize=9,
                                  leading=12, textColor=MUTED, spaceAfter=8),
    }


class CheckItem(Flowable):
    """An empty drawn checkbox, so no font-dependent square glyph is needed."""

    def __init__(self, paragraph: Paragraph):
        super().__init__()
        self.paragraph = paragraph
        self.spaceAfter = 7

    def wrap(self, availWidth: float, availHeight: float) -> tuple[float, float]:
        self.par_width, self.par_height = self.paragraph.wrap(availWidth - 18, availHeight)
        self.width, self.height = availWidth, self.par_height
        return self.width, self.height

    def draw(self) -> None:
        self.canv.setStrokeColor(MUTED)
        self.canv.setLineWidth(0.8)
        self.canv.rect(1, self.height - 11.8, 8, 8, stroke=1, fill=0)
        self.paragraph.drawOn(self.canv, 18, 0)


class GuideDocument(BaseDocTemplate):
    def __init__(self, path: Path, label: str, title: str):
        super().__init__(str(path), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                         topMargin=24 * mm, bottomMargin=20 * mm, title=title,
                         author="STEMBridge", subject=label, pageCompression=1)
        self.label = label
        self.bookmark_count = 0
        frame = Frame(MARGIN, 20 * mm, CONTENT_WIDTH, PAGE_HEIGHT - 44 * mm,
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates(PageTemplate(id="guide", frames=frame, onPage=self.decorate))

    def decorate(self, canvas, doc) -> None:
        canvas.saveState()
        canvas.setFillColor(INK)
        canvas.setFont("Guide-Bold", 11)
        canvas.drawString(MARGIN, PAGE_HEIGHT - 13 * mm, "STEMBridge")
        canvas.setFont("Guide", 8.2)
        canvas.setFillColor(MUTED)
        canvas.drawRightString(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 13 * mm, self.label)
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(0.6)
        canvas.line(MARGIN, PAGE_HEIGHT - 16 * mm, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 16 * mm)
        canvas.line(MARGIN, 15 * mm, PAGE_WIDTH - MARGIN, 15 * mm)
        canvas.setFont("Guide", 8.2)
        canvas.drawString(MARGIN, 10 * mm, "28 September 2026  |  Submission deadline: 4:10 PM IST")
        canvas.drawRightString(PAGE_WIDTH - MARGIN, 10 * mm, f"Page {doc.page}")
        canvas.restoreState()

    def afterFlowable(self, flowable) -> None:
        if isinstance(flowable, Paragraph) and flowable.style.name == "h2":
            self.bookmark_count += 1
            key = f"section-{self.bookmark_count}"
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(flowable.getPlainText(), key, 0, closed=False)


def table_widths(headers: list[str]) -> list[float]:
    count = len(headers)
    if count == 4 and headers[0].lower() == "id":
        return [CONTENT_WIDTH * r for r in [0.08, 0.42, 0.40, 0.10]]
    if count == 4 and headers[0].lower() == "account":
        return [CONTENT_WIDTH * r for r in [0.10, 0.18, 0.29, 0.43]]
    if count == 2:
        first = headers[0].lower()
        second = headers[1].lower()
        ratio = 0.58 if any(word in second for word in ["fills in", "answer", "fill in"]) else 0.20 if "time" in first else 0.35 if "variable" in first else 0.32
        return [CONTENT_WIDTH * ratio, CONTENT_WIDTH * (1 - ratio)]
    if count == 3:
        first = headers[0].lower()
        if first == "check":
            return [CONTENT_WIDTH * r for r in [0.48, 0.27, 0.25]]
        if first == "gate":
            return [CONTENT_WIDTH * r for r in [0.46, 0.17, 0.37]]
        ratios = [0.10, 0.50, 0.40] if "numbered task" in headers[1].lower() else [0.14, 0.34, 0.52] if "time" in first else [0.23, 0.38, 0.39]
        return [CONTENT_WIDTH * r for r in ratios]
    return [CONTENT_WIDTH / count] * count


def parse_markdown(source: Path, number: str) -> tuple[list, str]:
    style = styles()
    lines = source.read_text(encoding="utf-8-sig").splitlines()
    story: list = [Paragraph(f"GUIDE {number}", style["eyebrow"])]
    index = 0
    title = source.stem

    while index < len(lines):
        line = lines[index].strip()
        if not line:
            index += 1
            continue
        if line.startswith("```"):
            code_lines = []
            index += 1
            while index < len(lines) and not lines[index].strip().startswith("```"):
                code_lines.append(normalize(lines[index]))
                index += 1
            story.append(XPreformatted(html.escape("\n".join(code_lines)), style["code"]))
            index += 1
            continue
        if line.startswith("|"):
            rows = []
            while index < len(lines) and lines[index].strip().startswith("|"):
                cells = [cell.strip() for cell in lines[index].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-+:?", cell.replace(" ", "")) for cell in cells):
                    rows.append(cells)
                index += 1
            if not rows:
                continue
            widths = table_widths(rows[0])
            rendered = [[Paragraph(inline(cell, source), style["tablehead" if r == 0 else "table"])
                         for cell in row] for r, row in enumerate(rows)]
            table = Table(rendered, colWidths=widths, repeatRows=1, hAlign="LEFT",
                          spaceBefore=3, spaceAfter=10, splitByRow=1)
            table.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BACKGROUND", (0, 0), (-1, 0), SAGE),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [PAPER, colors.white]),
                ("LINEBELOW", (0, 0), (-1, 0), 0.7, LINE),
                ("LINEBELOW", (0, 1), (-1, -1), 0.35, LINE),
                ("LEFTPADDING", (0, 0), (-1, -1), 9),
                ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]))
            story.append(table)
            continue
        heading = re.match(r"^(#{1,6})\s+(.+)$", line)
        if heading:
            level = len(heading[1])
            text = heading[2]
            kind = "title" if level == 1 else "h2" if level == 2 else "h3"
            if kind == "h2":
                story.append(CondPageBreak(150))
            elif kind == "h3":
                story.append(CondPageBreak(120))
            story.append(Paragraph(inline(text, source), style[kind]))
            if level == 1:
                title = normalize(text)
            index += 1
            continue
        checkbox = re.match(r"^- \[ \]\s+(.*)$", line)
        if checkbox:
            story.append(CheckItem(Paragraph(inline(checkbox[1], source), style["check"])))
            index += 1
            continue
        bullet = re.match(r"^[-*]\s+(.*)$", line)
        if bullet:
            story.append(Paragraph(inline(bullet[1], source), style["bullet"], bulletText="•"))
            index += 1
            continue
        numbered = re.match(r"^(\d+)\.\s+(.*)$", line)
        if numbered:
            story.append(Paragraph(inline(numbered[2], source), style["bullet"],
                                   bulletText=numbered[1] + "."))
            index += 1
            continue
        if re.fullmatch(r"[-*_]{3,}", line):
            story.append(Spacer(1, 7))
            index += 1
            continue
        paragraph = [line]
        index += 1
        while index < len(lines) and lines[index].strip():
            next_line = lines[index].strip()
            if re.match(r"^(#|\||```|[-*]\s|\d+\.\s)", next_line):
                break
            paragraph.append(next_line)
            index += 1
        text = " ".join(paragraph)
        paragraph_style = style["body"]
        # Keep short bold-only question headings with their answers.
        if text.startswith("**") and text.endswith("**") and text.count("**") == 2:
            paragraph_style = style["h3"]
        story.append(Paragraph(inline(text, source), paragraph_style))
    return story, title


def build(selected: list[str] | None = None) -> None:
    register_fonts()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    QA.mkdir(parents=True, exist_ok=True)
    manifest = []
    for stem, filename, label, number in GUIDES:
        if selected and stem not in selected:
            continue
        source = ROOT / "docs" / (stem + ".md")
        if not source.exists():
            raise FileNotFoundError(f"Final source is missing: {source}")
        output = OUTPUT / (filename + ".pdf")
        story, title = parse_markdown(source, number)
        GuideDocument(output, label, title).build(story)
        reader = PdfReader(output)
        extracted = "\n\n".join(page.extract_text() or "" for page in reader.pages)
        (QA / (filename + "_extracted.txt")).write_text(extracted, encoding="utf-8")
        manifest.append({
            "source": str(source), "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
            "pdf": str(output), "pages": len(reader.pages), "bytes": output.stat().st_size,
            "page_text_lengths": [len(page.extract_text() or "") for page in reader.pages],
            "outline_entries": len(reader.outline),
        })
    (QA / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--only", nargs="+", choices=[item[0] for item in GUIDES])
    args = parser.parse_args()
    build(args.only)
