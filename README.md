# BestBrookies · ETF z NYSE a jejich česká dvojčata

Landing page (lead magnet) pro českého drobného investora, který přichází z reklamy na mobilu. Stránka porovná slavná ETF z newyorské burzy a výměnou za e-mail pošle **„Startovací balíček ETF“**: překladač 12 ETF na evropská dvojčata, checklist před prvním nákupem (PDF) a šablonu investičního plánu (Excel).

> Kompletní zadání a rozhodnutí: [`SPEC.md`](SPEC.md)

| Co | Kde |
|---|---|
| Stránka, varianta A „Růst“ (výchozí) | `/` nebo `/?v=rust` (starší `?v=dvojce` funguje jako alias) |
| Stránka, varianta B „Poplatky“ | `/?v=poplatky` |
| Živý debug měření (funnel) | `/?debug=1` |
| Reklamní kreativy (2 varianty, feed + story) | `/reklama`, PNG v [`public/ads/`](public/ads) |
| Checklist + překladač (PDF, 6 stran) | [`/bestbrookies-etf-checklist-2026.pdf`](public/bestbrookies-etf-checklist-2026.pdf) (šablona `/tahak`) |
| Šablona „Můj ETF plán“ (Excel) | [`/bestbrookies-etf-plan-2026.xlsx`](public/bestbrookies-etf-plan-2026.xlsx) (generátor `scripts/build-template.py`) |
| Ochrana údajů | `/ochrana-udaju` |

---

## 1. Koncept v kostce

**Hlavní sdělení:** *„Z 3 000 Kč měsíčně může být 1,5 milionu. Bez akciových tipů a drahého poradce: jeden levný fond, který za vás koupí 500 největších firem.“* Stránka prodává výsledek (růst peněz, jistotu na stáří), ne technický detail. Technické věci (ticker, TER, PRIIPs, evropská „dvojčata“) přicházejí až ve srovnání a v balíčku, kde už je návštěvník zvědavý.

**Cílová skupina:** „Odhodlaný začátečník“, 25–40 let, úspory na spořicím účtu nebo v drahém bankovním fondu. Ví, že by měl něco dělat, ale neví co. Sekundárně „optimalizátor“, který už investuje a chce vědět, jestli nepřeplácí. Podrobně viz [SPEC.md, kap. 3](SPEC.md#3-cílová-skupina).

**Insight, na kterém je praktický háček:** Většinu slavných ETF z NYSE (VOO, SPY, SCHD…) si drobný investor v EU nekoupí, protože jim chybí evropský dokument KID ([justETF](https://www.justetf.com/en/news/etf/us-domiciled-etfs.html)). Balíček proto ke každému ukáže evropskou verzi, kterou v Česku koupíte. Je to argument pro „proč si stáhnout návod“, ne hlavní sdělení.

**Co dostane za e-mail (Startovací balíček):**
- **Překladač NYSE → Evropa:** všech 12 dvojčat s ISIN, poplatkem a typem.
- **Checklist před prvním nákupem (PDF):** 10 kroků od rezervy po pravidelný nákup, plus poplatky a daně v ČR. Checklisty a šablony patří mezi nejlépe konvertující typy lead magnetů: jsou konkrétní, rychle použitelné a jejich hodnota je zřejmá z názvu.
- **Šablona „Můj ETF plán“ (Excel):** vlastní vklad, výnos a poplatek → projekce na 40 let s grafem, list dvojčat a deník nákupů, který hlídá 3letý časový test.
- **Okamžitě na stránce** se odemknou všechna dvojčata a nabídnou se oba soubory ke stažení.
- **Do e-mailu** přijde personalizované shrnutí (ETF, která řešil, a výsledek kalkulačky) s oběma odkazy.
- **Volitelně** (samostatný checkbox) krátká série e-mailů: jak koupit u brokera, daně, DIP.

**Hodnota je vidět před formulářem:**
- srovnání a kalkulačka jsou zdarma a plně nastavitelné (vklad, doba, **poplatek vašeho vlastního fondu**, výnos),
- dvojče k VOO je odkryté jako ukázka,
- sekce balíčku ukazuje náhled všech tří souborů; při najetí myší se karty rozvinou a checklist se sám odškrtá.

**Kdy žádáme o kontakt:**
- **Primárně** v momentě nejvyšší zvědavosti: klik na zamčené dvojče nebo „Poslat výpočet“ u kalkulačky otevře bottom sheet s formulářem.
- **Sekundárně:** pole v hero sekci (pro rozhodnuté), sticky lišta na mobilu, sekce balíčku a finální CTA.

**Formulář:** jediné povinné pole (e-mail), volitelný nezaškrtnutý souhlas se sérií, honeypot a kontrola minimální doby vyplnění.

---

## 2. Sdělení a psychologie (z čeho texty vycházejí)

Texty jsou postavené na ověřených principech konverzního copywritingu a na datech o tom, jak Češi o investování přemýšlejí:

| Princip / zjištění | Zdroj | Jak se to propsalo do stránky |
|---|---|---|
| Nadpis přečte asi 8 z 10 lidí, zbytek stránky asi 2 z 10. Nadpis má slibovat výsledek (benefit), ne funkci, a mít kolem 10 slov. | [GetResponse: landing page copywriting](https://www.getresponse.com/blog/writing-copy-landing-page), [Earlybird](https://earlybird.im/blog/landing-page-copywriting-guidelines) | Hero: „Z 3 000 Kč měsíčně může být 1,5 milionu.“ (8 slov, konkrétní číslo, výsledek). Hned pod ním kalkulačka, která slib dokáže na vlastních číslech. |
| Rámec **PAS** (problém → zesílení → řešení) a přínosy místo funkcí. | [Copyblogger: Problem-Agitate-Solve](https://copyblogger.com/problem-agitate-solve/) | Pořadí sekcí: peníze na účtu chudnou (inflace ČSÚ) → poplatky ukusují statisíce → řešení: jeden levný indexový fond. |
| 73 % neinvestujících Čechů brzdí **strach ze ztráty**, 71 % pocit, že tomu nerozumí. Hlavní motivací je **jistota na stáří**, ne touha po zisku. Polovina lidí už potkala podvodnou nabídku. | [E15: Strach ze ztráty jako hlavní brzda](https://www.e15.cz/finexpert/banky-a-ucty/strach-ze-ztraty-jako-hlavni-brzda-proc-cesi-stale-vahaji-s-investovanim-1434418) | Texty slibují jednoduchost a klid („bez tipů, 10 minut měsíčně“), ne rychlé zbohatnutí. FAQ začíná otázkou „Můžu přijít o peníze?“ a poctivě na ni odpovídá. Důvěra: „Nic neprodáváme, nikdy vám nebudeme volat.“ |
| Autorita a sociální důkaz zvyšují důvěru. | [BirdSend: opt-in rates](https://academy.birdsend.co/post-high-opt-in-rates-part-2/) | Citát Warrena Buffetta (90 % do levného indexového fondu na S&P 500, [dopis akcionářům 2013](https://www.berkshirehathaway.com/letters/2013ltr.pdf)) jako odpověď na „proč zrovna tato ETF“. |
| Pravidla ESMA pro investiční marketing: rizika musí být vidět stejně výrazně jako přínosy, ne v patičce. | [ESMA guidelines on marketing communications](https://www.esma.europa.eu/sites/default/files/library/esma34-45-1272_guidelines_on_marketing_communications.pdf) | Každé číslo o výnosu má hned pod sebou předpoklad a větu „výnos není zaručený, hodnota může i klesat“. Nikde neslibujeme „bez rizika“. |
| Hodnota lead magnetu musí být zřejmá z názvu a konkrétní. Checklisty a šablony patří k nejlépe konvertujícím formátům. | [Leadpages: lead magnet examples](https://leadpages.com/lead-generation-guide/lead-magnet-landing-page-examples) | „Checklist pro začátečníky“, „Excel plán: Kolik budu mít“, „Které ETF koupit a kde“. |

**Slovník:** jargon nahrazujeme: TER → „poplatek“, index → „500 největších firem“, UCITS / dvojče → „evropská verze, kterou koupíte v Česku“, NYSE → „newyorská burza“. Tickery (VOO…) se objevují až ve srovnání, vždy s popisem, co v nich je.

---

## 3. Design

- **Typografie:** Geist a Geist Mono (čísla, tickery, ISIN), self-hosted s latin-ext pro češtinu.
- **Paleta:** bílá, inkoustová černá, škála šedé a jediný akcent: limetka pro zvýraznění a CTA na tmavém pozadí, zelená pro „dobré“ hodnoty. Červená jen pro „v ČR nekoupíte“ a ukousnuté poplatky.
- **Barvy grafů:** sloty 1–3 ověřené palety (modrá, oranžová, aqua), ověřené validátorem na rozlišitelnost pro barvoslepé. Barva patří ETF, ne pořadí.
- **Rytmus:** hero přes celou obrazovku, každá další sekce má jedno sdělení, jeden nadpis a jednu akci. Velkorysé mezery, karty místo tabulek.
- **Obrázky místo textu:**
  - inflace jako „smršťující se“ pruh a sloupcový graf (ČSÚ),
  - složení S&P 500 ETF jako pruh (NVIDIA, Apple, Microsoft… + stovky dalších),
  - vlajky USA/EU u evropských verzí fondů,
  - poplatky jako „ukousnutá sušenka“ (koláčový graf, úhel výseče = přesný podíl ztráty, navazuje na značku Brookies),
  - náhled balíčku jako trojice dokumentů.
- **Pohyb** (vše vypnuto při `prefers-reduced-motion`):
  - nadpis hero naskakuje po slovech, ostatní prvky postupně s rozostřením;
  - sekce se odhalují při scrollu;
  - čáry grafů se vykreslují, čísla „dopočítávají“;
  - graf v hero se při změně částky překreslí;
  - karty se při najetí myší zvednou, balíček se rozvine;
  - FAQ se plynule rozbaluje.
- **Data-viz:** graf „Kdybyste před N lety investovali X Kč měsíčně“ s až 3 ETF (reálné ceny a kurzy ČNB), crosshair s tooltipem, koncové popisky a souhrnné dlaždice; metriky jako pruhy; mezera ETF vs. fond jako šrafovaná plocha. Grafy se přizpůsobují skutečné šířce, takže písmo je čitelné i na mobilu.

---

## 4. Pořadí sekcí a proč

| # | Sekce | Zdůvodnění |
|---|---|---|
| 1 | **Hero přes celou obrazovku** podle reklamy | Návštěvník má 3–8 vteřin. Nadpis slibuje konkrétní výsledek („Z 3 000 Kč měsíčně může být 1,5 milionu“) a hned vedle je **kalkulačka**, kde si ho ověří na vlastních číslech, s předpokladem a rizikem pod výsledkem. Tlačítko „Chci začít, pošlete mi návod“ a e-mailové pole. Živý odznak newyorské burzy dodá pohyb. |
| 2 | **Problém: peníze na účtu chudnou** | PAS, krok „problém“. Reálná inflace ČSÚ: 100 000 Kč z roku 2016 má dnes hodnotu asi 64 400 Kč. Animovaný pruh a sloupcový graf to ukážou bez dlouhého textu. Končí mostem: „Investovat neznamená sázet na jednu akcii. Stačí jeden fond.“ |
| 3 | **Řešení: jeden nákup, 500 firem** | Odpověď na „proč právě tato ETF“: skutečné složení S&P 500 ETF (NVIDIA, Apple, Microsoft…) jako pruh, 4 přínosy (rozložené riziko, mini poplatek, historie, 10 minut měsíčně) a citát Warrena Buffetta jako autorita. |
| 4 | **Srovnání: které ETF vybrat** | Pro ty, kdo už chtějí vybírat. Nastavitelný graf „kdybyste před N lety investovali X Kč měsíčně“ na reálných datech, metriky jako pruhy a praktický háček: americké verze v Česku nekoupíte, evropské ano. První je zdarma, ostatní v balíčku = **brána ke kontaktu**. |
| 5 | **Kalkulačka poplatků** | PAS, krok „zesílení“: ztráta v korunách. Návštěvník zadá částku a **poplatek svého fondu**, výsledek je osobní a „Poslat výpočet“ přirozený další krok. |
| 6 | **Startovací balíček** + formulář | Tři konkrétní věci s náhledem: které ETF a kde koupit, checklist, Excel plán. Hodnota je zřejmá před vyplněním e-mailu. |
| 7 | **Důvěra + FAQ** | Odpovídá na největší obavy Čechů z průzkumu: ztráta peněz, „nerozumím tomu“, „nemám dost peněz“, „kde je háček“. |
| 8 | **Finální CTA** | „Začněte tento měsíc. Za 20 let si poděkujete.“ Emoce budoucího já, jedno pole. |

Cookie lišta se ukáže až po prvním scrollu nebo po 8 s, aby nezakrývala hero. Před souhlasem se nic neukládá (PostHog běží v paměti, Meta Pixel se nenačte).

---

## 5. Reklamy

Dvě varianty, každá pro feed 1080×1350 i story 1080×1920. Náhledy a texty jsou na `/reklama`, PNG v `public/ads/`.

| | A · „Růst“ (touha po výsledku) | B · „Poplatky“ (averze ke ztrátě) |
|---|---|---|
| Vizuál | „1 519 021 Kč“ a graf vklady vs. výnos za 20 let, předpoklad a riziko přímo v kreativě | Ukousnutá sušenka (−24 %) a „−569 tis.“ |
| Titulek | Z 3 000 Kč měsíčně může být 1,5 milionu. | Kolik vám ukousnou poplatky? |
| Cíl | `/?v=rust&utm_content=a_rust` | `/?v=poplatky&utm_content=b_poplatky` |
| Hero | Stejný nadpis + kalkulačka růstu | „Kolik vám ukousnou poplatky?“ + výběr částky a sušenka |

Varianta se nastaví inline skriptem ještě před vykreslením (bez probliknutí) a zapisuje se ke každé události i k leadu.

---

## 6. Měření celé cesty

**Nástroje:**
- **PostHog** (EU, free tier) pro funnely, session replay a feature flagy. Bez klíče se události posílají do `window.dataLayer` a do debug panelu `?debug=1`.
- **Meta Pixel + Conversions API** (událost `Lead`, deduplikace přes `event_id`). Spouští se jen po souhlasu.
- **Serverový záznam leadu** (Supabase) jako zdroj pravdy.

Každá událost nese `variant`, `utm_*`, `device` a `t_since_load`.

| Fáze | Události |
|---|---|
| Příchod | `page_view`, `ticker_seen`, `hero_view` |
| Pozornost | `section_view` (hero, why, solution, compare, calculators, tahak, faq, final), `scroll_depth` 25/50/75/100, `faq_open` |
| Interakce | `first_interaction` (čas od načtení), `ticker_info`, `hero_chip_click`, `compare_change`, `timemachine_change` (graf srovnání), `calc_change`, `calc_result_view`, `lock_click` (kde) |
| Formulář | `form_view` (umístění), `sheet_open/close`, `form_focus`, `form_submit`, `form_error` (důvod), **`lead_created`** |
| Po konverzi | `pdf_download`, `xlsx_download`, `share_click`, `consent_update` |

**Hlavní funnel:** `page_view → first_interaction → lock_click | calc_result_view → form_focus → form_submit → lead_created` (rozpad podle `variant` a `placement`).

---

## 7. Očekávaná konverze

**Odhad: 5–8 % návštěvníků → lead** (studený mobilní provoz z Mety). Pro plánování počítáme se středem **6,5 %**.

Opora:
- Unbounce Conversion Benchmark Report 2024: medián landing pages napříč obory **6,6 %**, finanční služby **8,4 %** ([MarketingProfs](https://marketingprofs.com/charts/2024/52374/landing-page-conversion-benchmarks), [Martech](https://martech.org/whitepaper/conversion-benchmark-report-2024/)).
- **Dolů nás táhne:** studený provoz z placených sociálních sítí, mobil, neznámá značka a téma peněz (vyšší nedůvěra).
- **Nahoru nás táhne:**
  - jedno pole,
  - hodnota viditelná a ochutnaná před formulářem,
  - interakce hned v hero (kdo klikne, konvertuje výrazně častěji),
  - zámek jako přirozený další krok,
  - okamžité odemčení bez čekání na e-mail.

Modelový funnel na 100 příchodů:

| Krok | Návštěvníků | Mezikrok |
|---|---|---|
| Příchod | 100 | |
| Projde za hero (scroll ≥ 25 %) | 60 | 60 % |
| Interaguje (chip, srovnání, kalkulačka) | 35 | 58 % |
| Vidí zámek nebo výsledek kalkulačky | 22 | 63 % |
| Začne vyplňovat | 10 | 45 % |
| **Odešle** | **6–7** | 65 % |

---

## 8. Hypotézy pro A/B test (podle očekávaného dopadu)

Při konverzi 6,5 % a cíli zachytit relativní změnu 20 % (α = 0,05, síla 80 %) je potřeba **zhruba 6 000 návštěv na variantu**. Testujeme vždy jednu hypotézu najednou, rozdělení přes PostHog feature flag nebo URL parametr u reklamních sad.

1. **Načasování žádosti o e-mail (největší dopad, odhad ±25–35 % relativně).**
   - *Hypotéza:* Když e-mail požadujeme až po interakci (zámek u dvojčete nebo výsledku), konvertuje víc lidí, než když je formulář hlavním prvkem hero sekce. Návštěvník nejdřív dostane důkaz hodnoty a zámek pak zneužije efekt nedokončené úlohy.
   - *Varianty:* A = kalkulačka v hero, e-mail až po výsledku nebo u zámku (současný stav); B = hero jen s formulářem a náhledem balíčku.
   - *Metrika:* `lead_created / page_view`. Kontrolní: podíl `pdf_download`.
2. **Hlavní sdělení: zisk vs. ztráta (odhad ±15–25 %).**
   - *Hypotéza:* „Z 3 000 Kč měsíčně může být 1,5 milionu“ (konkrétní výsledek, touha) přitáhne a konvertuje lépe než „Kolik vám ukousnou poplatky?“ (averze ke ztrátě). Začátečník ještě žádné poplatky neplatí, takže ho víc osloví, co může získat. U „optimalizátorů“ s bankovním fondem může vyhrát varianta B, proto vyhodnotit i podle segmentu (věk, zdroj).
   - *Varianty:* `?v=rust` vs. `?v=poplatky`, každá se svou kreativou.
   - *Metrika:* cena za lead (CTR reklamy × konverze stránky), ne jen konverze stránky.
3. **Míra zamčení (odhad ±10–15 %).**
   - *Hypotéza:* Jedno dvojče zdarma (VOO) + zbytek zamčený konvertuje lépe než (a) vše zamčené (menší důvěra, pocit „nic nedostanu“) i (b) vše odemčené s balíčkem jen jako „uložit si“ (menší motivace).
   - *Metrika:* `lead_created / page_view` a kvalita leadů (otevření e-mailu, `pdf_download`).

---

## 9. Data a zdroje

| Data | Zdroj | Aktualizace |
|---|---|---|
| TER, majetek, dividendový výnos amerických ETF | [Alpha Vantage](https://www.alphavantage.co/documentation/) `ETF_PROFILE` | týdně |
| Měsíční ceny vč. dividend, objemy, výnosy 1/5/10/20 let | Alpha Vantage `TIME_SERIES_MONTHLY_ADJUSTED` | každý pracovní den |
| Burza kotace a počet ETF na NYSE (3 023) | Alpha Vantage `LISTING_STATUS` | týdně |
| Kurz USD/CZK (aktuální i měsíční historie od 2005) | [ČNB](https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt) | denně |
| Evropská dvojčata (ISIN, TER) | dokumenty emitentů a databáze ETF, u každého řádku odkaz (`src/data/universe.json`) | ručně, ověřeno 14. 10. 2026 |
| Inflace ČR 2016–2025 (průměrné roční míry) | [ČSÚ](https://csu.gov.cz/pak/prumerna-rocni-mira-inflace-v-cr-v-roce-2025-byla-25) | ručně, ročně |
| Složení S&P 500 ETF (největší firmy a jejich váhy) | Alpha Vantage `ETF_PROFILE` (VOO) | týdně |
| Citát Warrena Buffetta | [Berkshire Hathaway, dopis akcionářům 2013](https://www.berkshirehathaway.com/letters/2013ltr.pdf) | ručně |
| Poplatek typického českého akciového fondu (1,98 %) | Consequ 2022 dle [E15](https://www.e15.cz/byznys/finance-a-bankovnictvi/tri-pismena-ktera-rozhodnou-o-duchodu-cesi-se-rozinvestovali-riskuji-zbytecne-utracene-miliony-1434277) | ručně |

**Datová pipeline:**
- [`scripts/fetch-data.mjs`](scripts/fetch-data.mjs) vytvoří [`src/data/market.json`](src/data/market.json).
- Spouští ji GitHub Action [`data.yml`](.github/workflows/data.yml):
  - každý pracovní den po zavření NYSE, ručně, nebo po změně výběru ETF,
  - commitne data a přegeneruje PDF; Vercel pak nasadí novou verzi.
- Free tier Alpha Vantage má 25 dotazů za den. Skript je inkrementální: obnovuje nejstarší položky a profily jen jednou týdně.
- API klíč je jen v GitHub Secrets, nikdy v prohlížeči. Stránka je čistě statická a výpadek API ji nerozbije.

Výběr 12 ETF je ověřený jako kotovaný na NYSE / NYSE Arca. QQQ a BND jsou na Nasdaqu, proto ve výběru nejsou (a FAQ to vysvětluje).

---

## 10. Architektura

- **Astro 5** (statické HTML, API route jen pro formulář) a **Preact islands** (hydratace až při zobrazení, `client:visible`).
- **Tailwind CSS v4** s design tokeny, self-hosted fonty Geist a Geist Mono (latin-ext).
- **Grafy** jsou vlastní SVG (crosshair a tooltip, paleta ověřená na barvoslepost).
- **Vercel** (`@astrojs/vercel`).
- Animace: CSS a jeden malý IntersectionObserver (žádná animační knihovna). Celý JS stránky je zhruba 35 kB gzip; PostHog se načítá líně až v idle. Měsíční řady pro graf se načítají až u grafu (`/data/series.json`).

```
src/pages/          index.astro · tahak.astro (PDF) · reklama.astro · ochrana-udaju.astro · api/lead.ts · data/series.json.ts
src/components/     islands/*.tsx (TickerPill, GrowthHero, FeeHero, CookieChart, EtfCompare, FeeCalculator, LeadForm, LeadSheet, StickyCta, ConsentBar, DebugPanel) · Words, InflationSection, WhyIndex, StarterPack · icons.tsx · ads/*.astro
src/lib/            market.ts (data) · finance.ts (výpočty) · format.ts (cs-CZ) · track.ts (měření) · store.ts (stav) · server/* (Supabase, Brevo, Meta CAPI, e-mail)
src/data/           universe.json (kurátorovaný výběr a dvojčata) · market.json (generováno)
scripts/            fetch-data.mjs · render-pdf.mjs · render-ads.mjs · build-template.py (Excel)
supabase/           migrations/0001_init.sql (tabulka leads + RLS + přehled leads_daily)
```

### Lead flow (`POST /api/lead`)
1. Validace, honeypot, minimální doba vyplnění a rate limit.
2. **Supabase:** upsert do `leads` (e-mail, souhlas, varianta, umístění formuláře, poslední interakce, ETF, výsledek kalkulačky, UTM, čas na stránce).
3. **Brevo:** kontakt do seznamu (se souhlasem i do seznamu pro sérii) a transakční e-mail s personalizovaným shrnutím a odkazem na PDF ([šablona](src/lib/server/email-template.ts)).
4. **Meta CAPI:** událost `Lead` jen se souhlasem s marketingovými cookies.

**Mock režim:** bez env proměnných endpoint validuje, zaloguje „would insert / would send“ a vrátí `{ ok: true, mock: true }`. Frontend se chová stejně, takže jde otestovat celá cesta bez účtů.

---

## 11. Spuštění a nasazení

```bash
npm install
npm run dev            # http://localhost:4321  (?debug=1, ?v=poplatky)
npm run build
npm run data           # stáhne data (potřebuje ALPHAVANTAGE_API_KEY; ČNB funguje i bez něj)
npm run pdf            # po buildu: vyrenderuje PDF (checklist + překladač)
npm run ads            # po buildu: exportuje PNG kreativy + og.png
python3 scripts/build-template.py   # Excel šablona (přepočet: LibreOffice, viz skript)
```

V sandboxu za proxy spouštějte `npm run data` s `NODE_USE_ENV_PROXY=1`.

**Vercel:**
1. vercel.com → Add New → Project → Import `etf-landing-page`. Framework se detekuje automaticky (Astro).
2. Produkční větev je `main`. Každý commit do `main` (i ten od datového bota) spustí nové nasazení.
3. Volitelně Environment Variables podle [`.env.example`](.env.example). Bez nich běží formulář v mock režimu.

Pozn.: Vercel Hobby je podle podmínek pro nekomerční použití. Pro ostrý provoz reklam použijte Vercel Pro nebo Cloudflare Pages.

**Volitelné služby (vše má free tier):**
- **Alpha Vantage:** klíč z [alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key), uložit do GitHub → Settings → Secrets and variables → Actions jako `ALPHAVANTAGE_API_KEY`.
- **PostHog:** [eu.posthog.com](https://eu.posthog.com) → nový projekt → Project API key, uložit do Vercelu jako `PUBLIC_POSTHOG_KEY` (funguje i `NEXT_PUBLIC_POSTHOG_KEY` / `POSTHOG_KEY` z integrace PostHog ↔ Vercel). Pro projekt v US cloudu nastavte `PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`.
- **Supabase:** projekt v regionu Frankfurt, spustit [`0001_init.sql`](supabase/migrations/0001_init.sql), do Vercelu dát `SUPABASE_URL` a `SUPABASE_SERVICE_ROLE_KEY`.
- **Brevo:** ověřit odesílací doménu (SPF/DKIM), vytvořit 2 seznamy, do Vercelu dát `BREVO_API_KEY`, `BREVO_LIST_ID`, `BREVO_NURTURE_LIST_ID` a `BREVO_SENDER_EMAIL`.

---

## 12. Právní mantinely
- Stránka je informační a vzdělávací, **není investičním doporučením** a vyhýbá se formulacím „kupte“.
- Upozornění na riziko a na minulou výkonnost je na stránce, v PDF i v e-mailu.
- GDPR:
  - zaslání balíčku = plnění žádosti,
  - marketingová série jen se samostatným souhlasem,
  - marketingové cookies jen po opt-in.
- Žádná vymyšlená čísla ani falešný sociální důkaz.
- Provozovatel BestBrookies s.r.o. je pro účely konceptu **fiktivní**.
