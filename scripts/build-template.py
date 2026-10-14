#!/usr/bin/env python3
"""Vytvoří Excel šablonu „Můj ETF plán“ (součást Startovacího balíčku) do public/.

Listy:
  Můj plán      – vstupy (žluté buňky) a projekce na 40 let se vzorci + graf ETF vs. fond
  Dvojčata      – 12 ETF z NYSE a jejich evropská dvojčata (ISIN, TER, zdroj)
  Deník nákupů  – evidence nákupů s automatickým hlídáním časového testu (3 roky)

Použití: python3 scripts/build-template.py
"""
import json
from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.chart import LineChart, Reference
from openpyxl.comments import Comment
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'bestbrookies-etf-plan-2026.xlsx'
universe = json.loads((ROOT / 'src/data/universe.json').read_text())
market = json.loads((ROOT / 'src/data/market.json').read_text())

FONT = 'Arial'
INK = '0A0A0A'
MUTED = '71717A'
f_base = Font(name=FONT, size=10, color=INK)
f_muted = Font(name=FONT, size=9, color=MUTED)
f_title = Font(name=FONT, size=18, bold=True, color=INK)
f_h = Font(name=FONT, size=10, bold=True, color='FFFFFF')
f_bold = Font(name=FONT, size=10, bold=True, color=INK)
f_input = Font(name=FONT, size=11, bold=True, color='0000FF')  # vstupy = modrá
f_big = Font(name=FONT, size=14, bold=True, color=INK)
f_red = Font(name=FONT, size=14, bold=True, color='C0392B')
fill_input = PatternFill('solid', fgColor='FFFF00')  # buňky k vyplnění = žlutá
fill_head = PatternFill('solid', fgColor=INK)
fill_soft = PatternFill('solid', fgColor='F4F4F5')
line = Side(style='thin', color='E4E4E7')
border = Border(bottom=line)
CZK = '#,##0 "Kč";-#,##0 "Kč";"-"'
EUR = '#,##0.00 "€";-#,##0.00 "€";"-"'
PCT = '0.00%'

wb = Workbook()

# ------------------------------------------------------------------ List 1: Můj plán
ws = wb.active
ws.title = 'Můj plán'
ws.sheet_view.showGridLines = False
for col, w in zip('ABCDEFG', [30, 16, 18, 18, 18, 4, 40]):
    ws.column_dimensions[col].width = w

ws['A1'] = 'Můj ETF plán'
ws['A1'].font = f_title
ws['A2'] = 'BestBrookies · Startovací balíček ETF 2026 · Vyplňte žluté buňky, zbytek se dopočítá sám.'
ws['A2'].font = f_muted

inputs = [
    ('Měsíční vklad', 3000, CZK, 'Kolik budete investovat každý měsíc.'),
    ('Očekávaný výnos ročně (před poplatky)', 0.07, PCT, 'Předpoklad. S&P 500 vydělal za 20 let cca 10 % ročně v USD, budoucnost může být horší.'),
    ('Poplatek vašeho ETF (TER)', 0.0007, PCT, 'Např. VUAA / CSPX 0,07 %. Najdete v listu Dvojčata.'),
    ('Poplatek fondu pro srovnání', universe['benchmarks']['czechFundTer']['value'], PCT, 'Průměr 57 akciových fondů v ČR 1,98 % (Consequ 2022 dle E15). Zadejte poplatek svého fondu.'),
    ('Počet let', 25, '0 "let"', 'Na jak dlouho investujete (1–40).'),
]
ws['A4'] = 'VSTUPY'
ws['A4'].font = f_muted
for i, (label, val, fmt, note) in enumerate(inputs):
    r = 5 + i
    ws.cell(r, 1, label).font = f_base
    c = ws.cell(r, 2, val)
    c.font, c.fill, c.number_format = f_input, fill_input, fmt
    c.alignment = Alignment(horizontal='right')
    ws.cell(r, 7, note).font = f_muted
dv = DataValidation(type='whole', operator='between', formula1='1', formula2='40', showErrorMessage=True, error='Zadejte 1 až 40 let.')
ws.add_data_validation(dv)
dv.add('B9')

# Pomocné měsíční sazby
ws['A11'] = 'Měsíční čistý výnos ETF'
ws['B11'] = '=(1+$B$6-$B$7)^(1/12)-1'
ws['A12'] = 'Měsíční čistý výnos fondu'
ws['B12'] = '=(1+$B$6-$B$8)^(1/12)-1'
for r in (11, 12):
    ws.cell(r, 1).font = f_muted
    ws.cell(r, 2).font = f_muted
    ws.cell(r, 2).number_format = '0.0000%'

# Shrnutí
ws['A14'] = 'VÝSLEDEK'
ws['A14'].font = f_muted
summary = [
    ('Vložíte celkem', '=$B$5*12*$B$9', f_big),
    ('Hodnota s ETF', '=INDEX($C$21:$C$60,$B$9)', f_big),
    ('Hodnota s fondem', '=INDEX($D$21:$D$60,$B$9)', f_big),
    ('Poplatky vám ukousnou', '=B16-B17', f_red),
]
for i, (label, formula, font) in enumerate(summary):
    r = 15 + i
    ws.cell(r, 1, label).font = f_bold
    c = ws.cell(r, 2, formula)
    c.font, c.number_format = font, CZK
    c.alignment = Alignment(horizontal='right')

# Tabulka projekce (40 let, prázdné po zvoleném počtu let)
heads = ['Rok', 'Vloženo', 'Hodnota s ETF', 'Hodnota s fondem', 'Ukousnuto poplatky']
for j, h in enumerate(heads):
    c = ws.cell(20, 1 + j, h)
    c.font, c.fill = f_h, fill_head
    c.alignment = Alignment(horizontal='center' if j == 0 else 'right')
for k in range(1, 41):
    r = 20 + k
    ws.cell(r, 1, k).alignment = Alignment(horizontal='center')
    ws.cell(r, 2, f'=$B$5*12*A{r}')
    # budoucí hodnota pravidelné investice, vklad na začátku měsíce (ošetřena nulová sazba)
    ws.cell(r, 3, f'=IF($B$11=0,$B$5*12*A{r},$B$5*((1+$B$11)^(12*A{r})-1)/$B$11*(1+$B$11))')
    ws.cell(r, 4, f'=IF($B$12=0,$B$5*12*A{r},$B$5*((1+$B$12)^(12*A{r})-1)/$B$12*(1+$B$12))')
    ws.cell(r, 5, f'=C{r}-D{r}')
    for j in range(1, 6):
        c = ws.cell(r, j)
        c.font = f_base
        c.border = border
        if j > 1:
            c.number_format = CZK
    if k % 2 == 0:
        for j in range(1, 6):
            ws.cell(r, j).fill = fill_soft
ws['A62'] = 'Zelený řádek = váš zvolený počet let. Ilustrativní výpočet: konstantní výnos, vklad na začátku měsíce, bez daní a poplatků brokera. Není investiční doporučení.'
ws['A62'].font = f_muted

# Zvýraznění zvoleného roku
from openpyxl.formatting.rule import FormulaRule

ws.conditional_formatting.add('A21:E60', FormulaRule(formula=['$A21=$B$9'], fill=PatternFill('solid', fgColor='C9F24B'), font=Font(bold=True)))

chart = LineChart()
chart.title = 'ETF vs. fond: hodnota investice'
chart.y_axis.title = 'Kč'
chart.x_axis.title = 'Rok'
chart.height, chart.width = 9, 17
data = Reference(ws, min_col=2, max_col=4, min_row=20, max_row=60)
chart.add_data(data, titles_from_data=True)
chart.set_categories(Reference(ws, min_col=1, min_row=21, max_row=60))
colors = ['A1A1AA', '1BAF7A', 'EB6834']
for s, col in zip(chart.series, colors):
    s.graphicalProperties.line.solidFill = col
    s.graphicalProperties.line.width = 22000
    s.smooth = False
chart.series[0].graphicalProperties.line.dashStyle = 'dash'
ws.add_chart(chart, 'G4')
ws.freeze_panes = 'A21'

# ------------------------------------------------------------------ List 2: Dvojčata
wd = wb.create_sheet('Dvojčata')
wd.sheet_view.showGridLines = False
wd['A1'] = 'Překladač NYSE → Evropa'
wd['A1'].font = f_title
asof = (market.get('etfs', {}).get('VOO', {}).get('profile', {}) or {}).get('asOf') or ''
wd['A2'] = f"Americká ETF drobný investor v EU nekoupí (PRIIPs). Dvojčata ověřena {universe['twinsVerifiedAt']}, TER USA: Alpha Vantage {asof}. Před nákupem si přečtěte KID."
wd['A2'].font = f_muted
cols = ['NYSE', 'Co sleduje', 'TER USA', 'Evropské dvojče', 'Ticker', 'ISIN', 'TER dvojčete', 'Dividendy', 'Shoda', 'Zdroj']
widths = [8, 26, 10, 46, 14, 16, 12, 12, 20, 60]
for j, (h, w) in enumerate(zip(cols, widths)):
    c = wd.cell(4, 1 + j, h)
    c.font, c.fill = f_h, fill_head
    wd.column_dimensions[get_column_letter(1 + j)].width = w
for i, e in enumerate(universe['etfs']):
    r = 5 + i
    t = e['twin']
    us_ter = (market.get('etfs', {}).get(e['ticker'], {}).get('profile', {}) or {}).get('ter')
    row = [e['ticker'], e['categoryCz'], us_ter, t['name'], t.get('ticker') or '', t['isin'], t['ter'], 'akumulační' if t['policy'] == 'acc' else 'distribuční', 'stejný index' if t['match'] == 'exact' else 'nejbližší alternativa', t['sourceUrl']]
    for j, v in enumerate(row):
        c = wd.cell(r, 1 + j, v)
        c.font = f_bold if j in (0, 5) else f_base
        c.border = border
        if j in (2, 6):
            c.number_format = '0.00##%'
    if t['note']:
        wd.cell(r, 4).comment = Comment(t['note'], 'BestBrookies')
wd.freeze_panes = 'A5'

# ------------------------------------------------------------------ List 3: Deník nákupů
wj = wb.create_sheet('Deník nákupů')
wj.sheet_view.showGridLines = False
wj['A1'] = 'Deník nákupů'
wj['A1'].font = f_title
wj['A2'] = 'Zapisujte každý nákup. Sloupec „Osvobozeno od“ hlídá časový test 3 roky (zisk z prodeje po této době je v ČR osvobozen od daně). Řádek 5 je ukázka, přepište ho.'
wj['A2'].font = f_muted
jh = ['Datum nákupu', 'ETF (ticker)', 'ISIN', 'Počet kusů', 'Cena za kus (€)', 'Částka (€)', 'Osvobozeno od', 'Stav']
jw = [14, 14, 16, 12, 16, 14, 16, 26]
for j, (h, w) in enumerate(zip(jh, jw)):
    c = wj.cell(4, 1 + j, h)
    c.font, c.fill = f_h, fill_head
    wj.column_dimensions[get_column_letter(1 + j)].width = w
example = [date(2026, 10, 15), 'VUAA', 'IE00BFMXXD54', 2, 118.5]
for r in range(5, 55):
    for j in range(5):
        c = wj.cell(r, 1 + j, example[j] if r == 5 else None)
        c.font, c.fill, c.border = f_input, fill_input, border
    wj.cell(r, 1).number_format = 'd. m. yyyy'
    wj.cell(r, 5).number_format = EUR
    wj.cell(r, 6, f'=IF(OR(D{r}="",E{r}=""),"",D{r}*E{r})').number_format = EUR
    wj.cell(r, 7, f'=IF(A{r}="","",EDATE(A{r},36))').number_format = 'd. m. yyyy'
    wj.cell(r, 8, f'=IF(A{r}="","",IF(TODAY()>=G{r},"osvobozeno ✓","ještě "&TEXT(G{r}-TODAY(),"0")&" dní"))')
    for j in (6, 7, 8):
        wj.cell(r, j).font = f_base
        wj.cell(r, j).border = border
wj['E57'] = 'Celkem investováno'
wj['E57'].font = f_bold
wj['F57'] = '=SUM(F5:F54)'
wj['F57'].font = f_bold
wj['F57'].number_format = EUR
wj.freeze_panes = 'A5'

wb.calculation.fullCalcOnLoad = True
OUT.parent.mkdir(exist_ok=True)
wb.save(OUT)
print(f'[xlsx] Uloženo {OUT.relative_to(ROOT)}')
