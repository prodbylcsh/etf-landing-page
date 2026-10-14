# BestBrookies · ETF z NYSE a jejich česká dvojčata

Landing page (lead magnet) pro českého drobného investora, který přichází z reklamy na mobilu. Stránka porovná slavná ETF z newyorské burzy a výměnou za e-mail pošle **„Startovací balíček ETF“**: překladač 12 ETF na evropská dvojčata, checklist před prvním nákupem (PDF) a šablonu investičního plánu (Excel).

> Kompletní zadání a rozhodnutí: [`SPEC.md`](SPEC.md)

| Co | Kde |
|---|---|
| Stránka, varianta A (výchozí) | `/` nebo `/?v=dvojce` |
| Stránka, varianta B | `/?v=poplatky` |
| Živý debug měření (funnel) | `/?debug=1` |
| Reklamní kreativy (2 varianty, feed + story) | `/reklama`, PNG v [`public/ads/`](public/ads) |
| Checklist + překladač (PDF, 6 stran) | [`/bestbrookies-etf-checklist-2026.pdf`](public/bestbrookies-etf-checklist-2026.pdf) (šablona `/tahak`) |
| Šablona „Můj ETF plán“ (Excel) | [`/bestbrookies-etf-plan-2026.xlsx`](public/bestbrookies-etf-plan-2026.xlsx) (generátor `scripts/build-template.py`) |
| Ochrana údajů | `/ochrana-udaju` |

---

## 1. Koncept v kostce

**Insight:** Většinu slavných ETF z NYSE (VOO, SPY, IVV, VTI, SCHD…) si drobný investor v EU nekoupí. Kvůli nařízení PRIIPs jim chybí dokument KID ([justETF](https://www.justetf.com/en/news/etf/us-domiciled-etfs.html), [Evropský parlament](https://www.europarl.europa.eu/doceo/document/E-9-2021-004745_EN.html)). Návštěvník zná tickery z YouTube, ale u brokera je nenajde. Stránka tenhle problém řeší a ke každému ETF ukáže **evropské dvojče** (stejný nebo nejbližší index, ISIN, poplatek).

**Cílová skupina:** „Odhodlaný začátečník“, 25–40 let, úspory na spořicím účtu nebo v drahém bankovním fondu. O S&P 500 už slyšel, ale bojí se, že vybere špatně, přeplatí na poplatcích nebo se zamotá do daní. Sekundárně „optimalizátor“, který už investuje a chce vědět, jestli nepřeplácí. Podrobně viz [SPEC.md, kap. 3](SPEC.md#3-cílová-skupina).

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

## 2. Design

- **Typografie:** Geist a Geist Mono (čísla, tickery, ISIN), self-hosted s latin-ext pro češtinu.
- **Paleta:** bílá, inkoustová černá, škála šedé a jediný akcent: limetka pro zvýraznění a CTA na tmavém pozadí, zelená pro „dobré“ hodnoty. Červená jen pro „v ČR nekoupíte“ a ukousnuté poplatky.
- **Barvy grafů:** sloty 1–3 ověřené palety (modrá, oranžová, aqua), ověřené validátorem na rozlišitelnost pro barvoslepé. Barva patří ETF, ne pořadí.
- **Rytmus:** hero přes celou obrazovku, každá další sekce má jedno sdělení, jeden nadpis a jednu akci. Velkorysé mezery, karty místo tabulek.
- **Obrázky místo textu:**
  - vlajky USA/EU u dvojčat,
  - „proč VOO nekoupíte“ jako schéma o 4 krocích s ikonami,
  - poplatky jako „ukousnutá sušenka“ (koláčový graf, úhel výseče = přesný podíl ztráty, navazuje na značku Brookies),
  - náhled balíčku jako trojice dokumentů.
- **Pohyb** (vše vypnuto při `prefers-reduced-motion`):
  - nadpis hero naskakuje po slovech, ostatní prvky postupně s rozostřením;
  - sekce se odhalují při scrollu;
  - čáry grafů se vykreslují, čísla „dopočítávají“;
  - v hero teče animovaný tok peněz z USA do EU;
  - karty se při najetí myší zvednou, balíček se rozvine;
  - FAQ se plynule rozbaluje.
- **Data-viz:** graf „Kdybyste před N lety investovali X Kč měsíčně“ s až 3 ETF (reálné ceny a kurzy ČNB), crosshair s tooltipem, koncové popisky a souhrnné dlaždice; metriky jako pruhy; mezera ETF vs. fond jako šrafovaná plocha. Grafy se přizpůsobují skutečné šířce, takže písmo je čitelné i na mobilu.

---

## 3. Pořadí sekcí a proč

| # | Sekce | Zdůvodnění |
|---|---|---|
| 1 | **Hero přes celou obrazovku**, podle reklamy | Návštěvník má 3–8 vteřin. Titulek doslova opakuje příslib reklamy (message match). Hned vedle je **interaktivní vizuál** (výběr tickeru → „v ČR ne“ → dvojče, nebo výběr částky → sušenka s ukousnutou částkou) a e-mailové pole. Živý odznak NYSE („za 0:42, co jste tu, se zobchodovalo 1,9 mld. Kč“) dodá pohyb a pocit živé burzy. Nic dalšího v prvním záběru není, oko ví, kam se dívat. |
| 2 | **Proč VOO nekoupíte** (schéma o 4 krocích) | Než ukážeme čísla, vysvětlíme problém. Obrázky místo odstavce: americký fond → chybí KID → broker nesmí → řešení: dvojče. Za 5 vteřin je jasné, proč stránka existuje. |
| 3 | **Souboj ETF** | Největší „aha“: VOO, SPY a IVV dávají skoro stejný výsledek, ale liší se poplatkem a koupit nejde ani jedno. Nastavitelný graf v korunách, metriky jako pruhy, pod tím dvojčata. První je zdarma, ostatní jsou zamčená, a to je **primární brána ke kontaktu**. |
| 4 | **Kalkulačka poplatků** | Druhá emoce: ztráta v korunách. Návštěvník zadá vlastní částku a **poplatek svého fondu**, takže výsledek je osobní a motivace si ho uložit („Poslat výpočet + šablonu“) vysoká. |
| 5 | **Startovací balíček** + formulář | Pro ty, kdo potřebují celek: tři konkrétní soubory s náhledem. Checklist a šablona jsou hmatatelné a jejich hodnota je zřejmá před vyplněním e-mailu. |
| 6 | **Proč nám věřit + FAQ** | Strach z podvodu a finfluencerů řešíme až u váhajících, ne v hero sekci, kde by brzdil. FAQ odstraní poslední námitky: zdarma, spam, PRIIPs, daně, kde koupit, proč chybí QQQ. |
| 7 | **Finální CTA** | Poslední příležitost s jednoznačným příslibem („Za minutu víte, co si koupit místo VOO“). |

Cookie lišta se ukáže až po prvním scrollu nebo po 8 s, aby nezakrývala hero. Před souhlasem se nic neukládá (PostHog běží v paměti, Meta Pixel se nenačte).

---

## 4. Reklamy

Dvě varianty, každá pro feed 1080×1350 i story 1080×1920. Náhledy a texty jsou na `/reklama`, PNG v `public/ads/`.

| | A · „Nekoupíte“ (zvědavost) | B · „Poplatky“ (averze ke ztrátě) |
|---|---|---|
| Vizuál | Karta VOO s vlajkou USA a „✕ v ČR ne“ → karta VUAA s vlajkou EU a „✓ koupíte“ | Ukousnutá sušenka (−24 %) a „−569 tis.“ |
| Titulek | Chcete VOO? Kupte si jeho dvojče. | Kolik vám ukousnou poplatky? |
| Cíl | `/?v=dvojce&utm_content=a_dvojce` | `/?v=poplatky&utm_content=b_poplatky` |
| Hero | „Chcete VOO? Kupte si jeho dvojče.“ + výběr tickeru a dvojče | „Kolik vám ukousnou poplatky?“ + výběr částky a sušenka |

Varianta se nastaví inline skriptem ještě před vykreslením (bez probliknutí) a zapisuje se ke každé události i k leadu.

---

## 5. Měření celé cesty

**Nástroje:**
- **PostHog** (EU, free tier) pro funnely, session replay a feature flagy. Bez klíče se události posílají do `window.dataLayer` a do debug panelu `?debug=1`.
- **Meta Pixel + Conversions API** (událost `Lead`, deduplikace přes `event_id`). Spouští se jen po souhlasu.
- **Serverový záznam leadu** (Supabase) jako zdroj pravdy.

Každá událost nese `variant`, `utm_*`, `device` a `t_since_load`.

| Fáze | Události |
|---|---|
| Příchod | `page_view`, `ticker_seen`, `hero_view` |
| Pozornost | `section_view` (hero, why, compare, calculators, tahak, faq, final), `scroll_depth` 25/50/75/100, `faq_open` |
| Interakce | `first_interaction` (čas od načtení), `ticker_info`, `hero_chip_click`, `compare_change`, `timemachine_change` (graf srovnání), `calc_change`, `calc_result_view`, `lock_click` (kde) |
| Formulář | `form_view` (umístění), `sheet_open/close`, `form_focus`, `form_submit`, `form_error` (důvod), **`lead_created`** |
| Po konverzi | `pdf_download`, `xlsx_download`, `share_click`, `consent_update` |

**Hlavní funnel:** `page_view → first_interaction → lock_click | calc_result_view → form_focus → form_submit → lead_created` (rozpad podle `variant` a `placement`).

---

## 6. Očekávaná konverze

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

## 7. Hypotézy pro A/B test (podle očekávaného dopadu)

Při konverzi 6,5 % a cíli zachytit relativní změnu 20 % (α = 0,05, síla 80 %) je potřeba **zhruba 6 000 návštěv na variantu**. Testujeme vždy jednu hypotézu najednou, rozdělení přes PostHog feature flag nebo URL parametr u reklamních sad.

1. **Načasování žádosti o e-mail (největší dopad, odhad ±25–35 % relativně).**
   - *Hypotéza:* Když e-mail požadujeme až po interakci (zámek u dvojčete nebo výsledku), konvertuje víc lidí, než když je formulář hlavním prvkem hero sekce. Návštěvník nejdřív dostane důkaz hodnoty a zámek pak zneužije efekt nedokončené úlohy.
   - *Varianty:* A = interakce v hero a zámek (současný stav); B = hero jen s formulářem a náhledem PDF.
   - *Metrika:* `lead_created / page_view`. Kontrolní: podíl `pdf_download`.
2. **Hlavní sdělení: zvědavost vs. ztráta (odhad ±15–25 %).**
   - *Hypotéza:* „Chcete VOO? V Česku ho nekoupíte“ přitáhne a konvertuje lépe než „Kolik vám ukousnou poplatky?“, protože řeší konkrétní frustraci a je unikátní. Poplatky zná z reklam každý.
   - *Varianty:* `?v=dvojce` vs. `?v=poplatky`, každá se svou kreativou.
   - *Metrika:* cena za lead (CTR reklamy × konverze stránky), ne jen konverze stránky.
3. **Míra zamčení (odhad ±10–15 %).**
   - *Hypotéza:* Jedno dvojče zdarma (VOO) + zbytek zamčený konvertuje lépe než (a) vše zamčené (menší důvěra, pocit „nic nedostanu“) i (b) vše odemčené s balíčkem jen jako „uložit si“ (menší motivace).
   - *Metrika:* `lead_created / page_view` a kvalita leadů (otevření e-mailu, `pdf_download`).

---

## 8. Data a zdroje

| Data | Zdroj | Aktualizace |
|---|---|---|
| TER, majetek, dividendový výnos amerických ETF | [Alpha Vantage](https://www.alphavantage.co/documentation/) `ETF_PROFILE` | týdně |
| Měsíční ceny vč. dividend, objemy, výnosy 1/5/10/20 let | Alpha Vantage `TIME_SERIES_MONTHLY_ADJUSTED` | každý pracovní den |
| Burza kotace a počet ETF na NYSE (3 023) | Alpha Vantage `LISTING_STATUS` | týdně |
| Kurz USD/CZK (aktuální i měsíční historie od 2005) | [ČNB](https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt) | denně |
| Evropská dvojčata (ISIN, TER) | dokumenty emitentů a databáze ETF, u každého řádku odkaz (`src/data/universe.json`) | ručně, ověřeno 14. 10. 2026 |
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

## 9. Architektura

- **Astro 5** (statické HTML, API route jen pro formulář) a **Preact islands** (hydratace až při zobrazení, `client:visible`).
- **Tailwind CSS v4** s design tokeny, self-hosted fonty Geist a Geist Mono (latin-ext).
- **Grafy** jsou vlastní SVG (crosshair a tooltip, paleta ověřená na barvoslepost).
- **Vercel** (`@astrojs/vercel`).
- Animace: CSS a jeden malý IntersectionObserver (žádná animační knihovna). Celý JS stránky je zhruba 35 kB gzip; PostHog se načítá líně až v idle. Měsíční řady pro graf se načítají až u grafu (`/data/series.json`).

```
src/pages/          index.astro · tahak.astro (PDF) · reklama.astro · ochrana-udaju.astro · api/lead.ts · data/series.json.ts
src/components/     islands/*.tsx (TickerPill, TwinVisual, FeeHero, CookieChart, EtfCompare, FeeCalculator, LeadForm, LeadSheet, StickyCta, ConsentBar, DebugPanel) · Words, PriipsFlow, StarterPack · icons.tsx · ads/*.astro
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

## 10. Spuštění a nasazení

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

## 11. Právní mantinely
- Stránka je informační a vzdělávací, **není investičním doporučením** a vyhýbá se formulacím „kupte“.
- Upozornění na riziko a na minulou výkonnost je na stránce, v PDF i v e-mailu.
- GDPR:
  - zaslání balíčku = plnění žádosti,
  - marketingová série jen se samostatným souhlasem,
  - marketingové cookies jen po opt-in.
- Žádná vymyšlená čísla ani falešný sociální důkaz.
- Provozovatel BestBrookies s.r.o. je pro účely konceptu **fiktivní**.
