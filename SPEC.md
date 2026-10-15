# BestBrookies – ETF z NYSE pro české investory
## Specifikace projektu (zadání pro vývoj)

> Stav: schváleno 14. 10. 2026 · Branch: `claude/etf-comparison-landing-v5oml3`
> Charakter: koncepční projekt, zpracovaný tak, aby se dal při dobrém výsledku nasadit a pustit na něj reklamu.

---

## 1. Zadání v jedné větě

Mobilní landing page, která českému drobnému investorovi z reklamy během několika vteřin ukáže srovnání ETF obchodovaných na NYSE, a výměnou za e-mail mu dá **„ETF tahák 2026“**, tedy přehled, co si místo amerických ETF reálně koupí v Česku.

### Kritérium úspěchu
„Mohli bychom na ni zítra spustit reklamu?“ To znamená:
- rychlé načtení na mobilu (LCP < 2 s na 4G, Lighthouse mobile ≥ 90 ve všech kategoriích),
- message match s reklamou,
- reálná data se zdroji,
- měřený funnel,
- funkční odeslání formuláře a doručení hodnoty,
- právně obhajitelné texty.

---

## 2. Klíčový insight (proč tahle stránka dává smysl)

Slavná ETF z NYSE (VOO, SPY, IVV, VTI, SCHD…) si drobný investor v EU **nekoupí**. Kvůli nařízení **PRIIPs** musí fond mít evropský dokument KID a americké fondy ho nevydávají. Evropský broker je proto retailovým klientům neprodá.
Zdroje: [justETF](https://www.justetf.com/en/news/etf/us-domiciled-etfs.html), [Evropský parlament](https://www.europarl.europa.eu/doceo/document/E-9-2021-004745_EN.html).

Návštěvník zná tickery z YouTube a Redditu, ale u svého brokera je nenajde. **Stránka tento problém řeší.** Ke každému ETF z NYSE ukáže **evropské dvojče** (UCITS ETF / ETC se stejným nebo nejbližším indexem), které si v ČR koupí.

---

## 3. Cílová skupina

**Drobný (retailový) investor:** investuje vlastní úspory v menších částkách, bez profesionálního statusu, a regulace ho chrání nejvíc (proto se ho týká i PRIIPs).
Kontext ČR:
- Česká spořitelna eviduje přes 750 tis. investorů (+12 % meziročně),
- asi 59 % investorů využívá fondy nebo ETF ([Index prosperity](https://www.businessinfo.cz/clanky/index-prosperity-pres-8-z-10-cechu-zhodnocuje-sve-uspory-a-vice-nez-polovina-populace-aktivne-investuje/)),
- spouštěčem byl inflační šok 2022–23 ([Seznam Zprávy](https://www.seznamzpravy.cz/clanek/ekonomika-b2b-investuji-uz-ctyri-z-peti-cechu-inflacni-sok-pusobil-jako-budicek-301142)).

### Primární persona: „Odhodlaný začátečník“
- 25–40 let, příjem 35–70 tis. Kč, úspory na spořicím účtu nebo v bankovním podílovém fondu.
- O S&P 500 slyšel z YouTube, podcastu nebo od kolegy. Má XTB, Trading 212, Revolut nebo George, případně si účet právě zakládá.
- Přichází z reklamy na Instagramu nebo Facebooku, na mobilu, má 3–8 vteřin pozornosti.

### Sekundární persona: „Optimalizátor“
- Už investuje 2–5 tis. Kč měsíčně a chce vědět, jestli nepřeplácí a jestli má „ten správný“ fond.

### Psychologie

| Strachy | Motivace | Co si myslí |
|---|---|---|
| že vybere špatně (paralýza z výběru) | porazit inflaci | „Všichni říkají S&P 500, ale který?“ |
| skryté poplatky | finanční nezávislost | „Proč mi broker VOO nenabízí?“ |
| ztráta a krach | jistota pro rodinu | „Co daně a papírování?“ |
| podvod / finfluenceři | pocit kontroly | „Nechci číst 40 stran prospektu.“ |
| angličtina a byrokracie | FOMO: ostatní bohatnou | „Nemám čas, ale nechci to propásnout.“ |

**Job to be done:** „Za minutu mi ukažte, které ETF má smysl, a řekněte mi, co přesně si mám koupit u svého brokera, abych neudělal chybu.“

**Emoční oblouk stránky:**
1. **Zvědavost a „aha“:** VOO, SPY i IVV jsou stejný index s jiným poplatkem, a navíc žádný z nich v ČR nekoupíte.
2. **Bolest ze ztráty:** poplatek typického českého fondu (asi 2 %) vás za 25 let stojí statisíce.
3. **Úleva a kontrola:** tady je dvojče: ticker, ISIN, poplatek. Hotovo.

---

## 4. Hodnota a lead magnet

### Co návštěvník dostane za e-mail
**ETF tahák 2026 (PDF + e-mail)**, obsah:
1. **Překladač NYSE → Česko:** 12 nejznámějších ETF z NYSE a jejich evropská dvojčata (ticker, ISIN, TER, akumulační/distribuční, typ replikace, poznámka „přesné dvojče / nejbližší alternativa“).
2. **Srovnání nákladů:** kolik stojí 0,07 % vs. 2 % (typický český akciový podílový fond) za 10, 20 a 30 let.
3. **Daně v ČR na jedné straně:**
   - časový test 3 roky,
   - limit příjmů 100 000 Kč za rok,
   - akumulační vs. distribuční fondy,
   - DIP (odpočet až 48 000 Kč/rok).
   Vše s odkazy na zdroje a upozorněním, že nejde o daňové poradenství.
4. **Jak koupit za 5 minut:** obecný postup (vyhledat ISIN, limitní příkaz, pravidelná investice).
5. Personalizovaný výsledek z kalkulačky nebo srovnání (v e-mailu).

### Hodnota viditelná před formulářem
- Většina obsahu je zdarma: srovnání, kalkulačka poplatků, stroj času.
- **Jedno dvojče je odkryté zdarma** (VOO → VUAA) jako důkaz hodnoty. Ostatní jsou v tabulce rozmazaná se zámkem 🔒.
- Náhled taháku (mockup tří stránek PDF) je vidět v hero sekci i u formuláře.

### Kdy žádáme o kontakt
| Moment | Kde | Proč |
|---|---|---|
| **Primární:** hned po prvním „aha“ (klik na zamčené dvojče, výsledek kalkulačky) | inline pod výsledkem nebo bottom sheet | nejvyšší zvědavost a investovaná námaha (efekt nedokončené úlohy) |
| Sekundární: hero | jedno pole a tlačítko pod titulkem | pro návštěvníky s jasným záměrem; stojí to málo místa |
| Sticky CTA | spodní lišta na mobilu po odscrollování hero | formulář je vždy na jeden tap |
| Finální sekce | „Co je v taháku“ a formulář | pro ty, kdo dočtou až dolů |

### Formulář
- **Jediné povinné pole: e-mail.**
- Volitelný, **nezaškrtnutý** checkbox: „Chci i krátkou sérii e-mailů o ETF a daních (max. 1× týdně, odhlásíte se jedním klikem).“
- Mikrotext pod tlačítkem: „Tahák pošleme jen na tento e-mail. Žádný spam, žádné volání.“ s odkazem na zásady ochrany údajů.
- Tlačítko: **„Poslat tahák“** (varianta „Odemknout dvojčata“ u zámku).
- Ochrana proti spamu: honeypot pole, minimální doba vyplnění (> 2 s), validace e-mailu na klientovi i serveru.

### Co se stane po odeslání
1. **Okamžitě na stránce:** všechna dvojčata se odemknou (stav se uloží do `localStorage`), objeví se karta „Hotovo“ s tlačítkem **Stáhnout PDF** a odkazem „Sdílet tahák s kamarádem“ (Web Share API).
2. **Do 1 minuty e-mail (Brevo, transakční):** odkaz na PDF a personalizované shrnutí (vybraná ETF, výsledek kalkulačky).
3. **Navazující série** (jen se souhlasem z checkboxu, Brevo automation):
   - D+2: „Jak koupit dvojče u XTB / Trading 212 / Fio krok za krokem“,
   - D+5: „Daně z ETF v ČR jednoduše“,
   - D+10: „DIP: až 7 200 Kč ročně od státu“,
   - pak měsíční „ETF update“.
4. V projektu jsou **Supabase a Brevo připravené v kódu, ale bez reálného účtu běží v mock režimu** (viz kap. 10).

---

## 5. Reklama (2 varianty) a message match

Reklamy se nespouštějí. Dodávají se **dvě obrazovky kreativy** (1080×1350 feed + 1080×1920 story) jako HTML stránka `/reklama` a exportované PNG v `public/ads/`. Hero stránky se přepíná parametrem `?v=`.

### A) `?v=dvojce`: „Nekoupíte“ (zvědavost, insider)
- **Vizuál:** karta „VOO“ s razítkem „V ČR NEKOUPÍTE“, šipka ke kartě „dvojče ✓“.
- **Primární text:** „Slavné americké ETF VOO u českého brokera nekoupíte. Existuje ale jeho evropské dvojče: stejný index, podobný poplatek. Ukážeme vám dvojčata 12 nejznámějších ETF z NYSE.“
- **Titulek:** „Chcete VOO? Kupte jeho dvojče.“ · CTA: *Zjistit více*
- **Hero na stránce:** „Chcete VOO? V Česku ho nekoupíte. **Tady je jeho dvojče.**“

### B) `?v=poplatky`: „Poplatky“ (averze ke ztrátě)
- **Vizuál:** dva sloupce peněz, z jednoho „ukousnuto“ X Kč.
- **Primární text:** „Typický český akciový fond si bere kolem 2 % ročně. ETF ze stejného trhu 0,07 %. Při 3 000 Kč měsíčně je to za 25 let rozdíl X Kč. Spočítejte si to za 10 vteřin.“
- **Titulek:** „Kolik vám ukousnou poplatky?“ · CTA: *Spočítat*
- **Hero na stránce:** „Kolik vám za 25 let **ukousnou poplatky**?“ s rychlou volbou částky a okamžitým výsledkem.

Výchozí varianta (bez parametru) = **A (dvojče)**, nejsilnější a nejunikátnější sdělení. Varianta se zapisuje ke všem událostem a k leadu.

---

## 6. Struktura stránky (mobile-first, 375 px)

| # | Sekce | Obsah | Proč je právě tady |
|---|---|---|---|
| 0 | **Burzovní pruh** (sticky top, 32 px) | živý čítač: „Za dobu, co jste tady (0:42), se ve 12 největších ETF z NYSE protočilo 5,1 mld. Kč“; mimo obchodní hodiny „NYSE otevře za 3 h 12 min“ | pohyb a pocit „živé burzy“ v první vteřině, bez ztráty místa |
| 1 | **Hero** (podle `?v=`) | titulek, podtitulek, interaktivní mini-prvek (A: chips tickerů → karta „nekoupíte → dvojče“; B: chips částek → „ukousnou X Kč“), e-mailové pole, náhled taháku, řádek „Data: Alpha Vantage, ČNB, emitenti · aktualizováno DD. MM.“ | message match s reklamou; hodnota, interakce a důvěra nad zlomem |
| 2 | **Srovnání ETF (souboj)** | výběr až 3 ze 12 ETF, karty: TER, aktiva, výnos 1/5/10 let, dividenda, „koupíte v ČR?“, dvojče (1 zdarma, ostatní 🔒) | největší „aha“ (stejný index, jiný poplatek) a primární brána ke kontaktu |
| 3 | **Kalkulačky** (2 záložky) | **Poplatky:** částka, roky; ETF vs. typický český fond (~2 %). **Stroj času:** „kdybyste před N lety dávali X Kč měsíčně do …“, reálná historická data v Kč | rozvine emoce (ztráta i zisk), osobní čísla; CTA „Poslat výpočet e-mailem“ |
| 4 | **Co je v taháku + formulář** | mockup PDF, 4 odrážky obsahu, formulář | pro ty, kdo potřebují celek; obsah je konkrétní a hmatatelný |
| 5 | **Proč nám věřit** | zdroje a metodika, „nejsme broker ani poradce“, aktualizace dat | strach z podvodu řešíme ve chvíli, kdy návštěvník váhá |
| 6 | **FAQ** | Je to zdarma? Pošlete spam? Proč nekoupím VOO? Co daně? Kdo za tím stojí? | odstraní poslední námitky |
| 7 | **Finální CTA + patička** | e-mail, právní upozornění, zásady ochrany údajů, zdroje | poslední příležitost |
| — | **Sticky CTA** (spodní lišta) | „Poslat tahák zdarma →“ | objeví se po hero, skryje se, když je formulář na obrazovce |
| — | **Consent lišta** | nenápadný pruh dole (ne modální okno) | ČR vyžaduje opt-in pro marketingové cookies; na mobilu nesmí zakrýt obsah |

---

## 7. Interaktivní prvky (MVP)

1. **Burzovní pruh (live ticker)**
   - Základ: průměrný denní objem v USD (objem × cena) 12 sledovaných ETF za poslední 3 ukončené měsíce ÷ délka seance (23 400 s).
   - Za obchodních hodin NYSE (9:30–16:00 ET, pracovní dny) běží rychlostí X Kč/s od příchodu návštěvníka.
   - Mimo hodiny ukazuje odpočet do otevření a „průměrně za sekundu obchodu“.
   - **Čísla jsou pravdivá** (žádných „500 mld. za pár sekund“), metodika je v tooltipu.
2. **Srovnání ETF (souboj):** předvybráno VOO / SPY / IVV. Řádky: poplatek (TER), aktiva, výnos 1/5/10 let (USD, s dividendami), dividendový výnos, rok vzniku, „Koupíte v ČR?“, dvojče.
3. **Kalkulačka poplatků:** měsíční vklad (1 000–20 000 Kč), doba (5–35 let), předpoklad hrubého výnosu 7 % p. a. (nastavitelný). Výstup: konečná hodnota pro ETF (TER dvojčete) vs. fond s 2 %, rozdíl v Kč a graf.
4. **Stroj času:** ETF (výchozí SPY, nejdelší historie), měsíční vklad, začátek (5/10/15/20 let zpět). Výpočet z **reálných měsíčních cen** (adjusted close vč. dividend) a **měsíčních kurzů USD/CZK z ČNB**. Výstup: vloženo vs. hodnota dnes v Kč a graf.
5. **Fáze 2 (mimo MVP):** kvíz „Najdi svůj ETF“, skládání portfolia, sdílení výsledku. Pozor: kvíz je kandidát na A/B test.

Každý prvek má CTA vedoucí ke kontaktu (zámek, „Poslat výpočet“, „Uložit do taháku“).

---

## 8. Data

### Výběr 12 ETF (všechna ověřena jako kotovaná na NYSE / NYSE Arca přes Alpha Vantage `LISTING_STATUS`)
| NYSE ETF | Kategorie | Evropské dvojče (ISIN) | TER dvojčete | Typ shody |
|---|---|---|---|---|
| VOO | S&P 500 | Vanguard S&P 500 UCITS ETF Acc, VUAA (IE00BFMXXD54) | 0,07 % | přesné (zdarma odkryté) |
| SPY | S&P 500 | iShares Core S&P 500 UCITS ETF Acc, CSPX (IE00B5BMR087) | 0,07 % | přesné |
| IVV | S&P 500 | iShares Core S&P 500 UCITS ETF Acc, CSPX (IE00B5BMR087) | 0,07 % | přesné |
| VTI | celý trh USA | Invesco MSCI USA UCITS ETF Acc (IE00B60SX170) | 0,05 % | nejbližší (bez small caps) |
| VT | celý svět | Vanguard FTSE All-World UCITS ETF Acc, VWCE (IE00BK5BQT80) | 0,14 % (od 28. 7. 2026) | přesné |
| VEA | vyspělé trhy mimo USA | iShares MSCI World ex-USA UCITS ETF Acc (IE000R4ZNTN3) | 0,15 % | nejbližší |
| VWO | rozvíjející se trhy | iShares Core MSCI EM IMI UCITS ETF Acc, EIMI (IE00BKM4GZ66) | 0,18 % | nejbližší |
| SCHD | dividendy USA | SPDR S&P US Dividend Aristocrats UCITS ETF Dist (IE00B6YX5D40) | 0,35 % | nejbližší (jiný index) |
| VIG | dividendový růst USA | WisdomTree US Quality Dividend Growth UCITS ETF Acc, DGRA (IE00BZ56RG20) | 0,33 % | nejbližší (jiný index) |
| VNQ | nemovitosti USA (REIT) | iShares US Property Yield UCITS ETF Dist (IE00B1FZSF77) | 0,40 % | nejbližší |
| GLD | zlato | iShares Physical Gold ETC, SGLN (IE00B4ND3602) | 0,12 % | přesné (ETC, ne UCITS) |
| AGG | dluhopisy USA | iShares US Aggregate Bond UCITS ETF Dist (IE00B44CGS96) | 0,25 % | přesné (index) |

Poznámka: QQQ a BND jsou kotované na Nasdaqu, proto ve výběru nejsou. Ve FAQ to vysvětlíme jako důkaz pečlivosti.

### Zdroje

| Data | Zdroj | Aktualizace |
|---|---|---|
| TER, čistá aktiva, dividendový výnos, sektory | Alpha Vantage `ETF_PROFILE` | týdně |
| Měsíční ceny (adjusted close), objemy | Alpha Vantage `TIME_SERIES_MONTHLY_ADJUSTED` | denně |
| Seznam ETF a burza kotace | Alpha Vantage `LISTING_STATUS` | týdně |
| Kurzy USD/CZK (aktuální i historické měsíční) | ČNB `denni_kurz.txt`, `rok.txt` | denně |
| Dvojčata (ISIN, TER) | ručně ověřeno 14. 10. 2026, odkaz na zdroj u každého řádku (`data/twins.json`) | ručně, čtvrtletně |
| Průměrný poplatek českého akciového fondu (~1,98 %) | Consequ 2022 dle [E15](https://www.e15.cz/byznys/finance-a-bankovnictvi/tri-pismena-ktera-rozhodnou-o-duchodu-cesi-se-rozinvestovali-riskuji-zbytecne-utracene-miliony-1434277) | ručně |

**Datová pipeline:**
- `scripts/fetch-data.mjs` načte data a vytvoří `src/data/market.json` (každá hodnota s `source` a `asOf`).
- Spouští ji GitHub Action `data.yml`:
  - denně ve 23:30 UTC a ručně (`workflow_dispatch`),
  - commitne JSON a vygeneruje PDF tahák,
  - Vercel se redeployuje automaticky z commitu.
- Free limit Alpha Vantage je 25 dotazů/den. Skript je inkrementální: obnovuje nejstarší položky v rámci rozpočtu a profily jen jednou týdně.
- Klíč je **pouze v GitHub Secrets** (`ALPHAVANTAGE_API_KEY`), nikdy se nedostane do prohlížeče.

---

## 9. Měření (celá cesta příchod → odeslání)

**Nástroje:**
- **PostHog** (EU cloud, free tier): funnely, session replay, feature flags pro A/B testy.
  - Bez souhlasu běží v **cookieless režimu** (`persistence: 'memory'`), po souhlasu `localStorage+cookie`.
  - Bez klíče se události posílají do `window.dataLayer`, konzole a **debug panelu** (`?debug=1`), který ukazuje funnel živě.
- **Server:** `lead_created` se zapisuje i serverově (Supabase / mock log) jako zdroj pravdy.
- **Meta Pixel + Conversions API:** kód je připraven, zapíná se env proměnnou a jen po souhlasu. Událost `Lead` s `event_id` kvůli deduplikaci.
- **Vercel Speed Insights:** LCP, INP, CLS.

**Události (vždy s `variant`, `utm_*`, `device`, `t_since_load`):**
- Příchod a obsah: `page_view`, `hero_view`, `ticker_seen`, `section_view` (id), `scroll_depth` (25/50/75/100).
- Interakce: `first_interaction` (čas od načtení), `hero_chip_click`, `compare_change`, `lock_click`, `calc_change`, `calc_result_view`, `timemachine_change`.
- Formulář: `form_view` (umístění), `form_focus`, `form_submit`, `form_error` (důvod), `lead_created`.
- Po odeslání: `unlock_view`, `pdf_download`, `share_click`, `consent_update`.

**Funnel (dashboard v PostHogu):**
`page_view → first_interaction → lock_click | calc_result_view → form_focus → form_submit → lead_created`

---

## 10. Architektura a technologie

| Vrstva | Volba | Důvod |
|---|---|---|
| Framework | **Astro 5** (statický výstup + on-demand API routy) | HTML bez zbytečného JS, top LCP na mobilu |
| Interaktivita | **Preact islands** + `nanostores` (sdílený stav: odemčeno, varianta, výsledek) | 3 kB runtime, hydratace jen tam, kde je potřeba |
| CSS | **Tailwind CSS v4** + CSS proměnné (design tokeny) | rychlý vývoj, konzistentní systém |
| Fonty | self-hosted přes Fontsource (latin-ext pro češtinu) | bez blokujících requestů na Google |
| Grafy | vlastní SVG komponenty | lehké a plně ve vlastním stylu |
| Hosting | **Vercel** (`@astrojs/vercel`) | zdarma, preview deploye; pro ostrý provoz Pro (Hobby je nekomerční) |
| Leady (DB) | **Supabase** REST (`leads`, `events`), migrace v `supabase/migrations` | připraveno v kódu, **mock režim bez env** |
| E-mail | **Brevo** API (kontakt + seznam + transakční šablona) | připraveno v kódu, **mock režim bez env** |
| PDF | Astro stránka `/tahak` (tisková šablona) vyrenderovaná Playwrightem do `public/bestbrookies-etf-tahak-2026.pdf` | stejná data jako web, generuje se v CI |
| Reklamy | stránka `/reklama` a PNG export Playwrightem | |

**Mock režim:** pokud chybí `SUPABASE_URL` / `BREVO_API_KEY`, endpoint `/api/lead`:
- validuje vstup,
- zaloguje „would insert / would send“,
- vrátí `{ ok: true, mock: true }`.

Frontend se chová stejně, takže celou cestu lze otestovat.

**Env proměnné:**
- server: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BREVO_API_KEY`, `BREVO_LIST_ID`, `BREVO_TEMPLATE_ID`, `META_CAPI_TOKEN`;
- veřejné: `PUBLIC_POSTHOG_KEY`, `PUBLIC_POSTHOG_HOST`, `PUBLIC_META_PIXEL_ID`;
- GitHub Actions: `ALPHAVANTAGE_API_KEY`.

### Struktura repa
```
src/
  pages/        index.astro, tahak.astro, reklama.astro, ochrana-udaju.astro, api/lead.ts
  components/   *.astro (statické sekce), islands/*.tsx (Preact)
  lib/          format.ts (cs-CZ), finance.ts (výpočty), track.ts, store.ts, market.ts
  data/         market.json (generováno), twins.json (ručně), content.ts (texty)
  styles/       global.css (tokeny, Tailwind)
scripts/        fetch-data.mjs, render-pdf.mjs, render-ads.mjs
supabase/       migrations/0001_init.sql
emails/         tahak.html (Brevo šablona), sequence.md
.github/workflows/data.yml
```

---

## 11. Design

**Směr: „finanční deník s terminálem“.** Světlý papírový základ (důvěra a serióznost redakční analýzy) a tmavé „terminálové“ prvky jen tam, kde jsou živá data (burzovní pruh, výsledky kalkulaček, ticker karty). Nesmí působit jako šablona:
- žádné fialové přechody,
- žádné tři karty s emoji,
- žádné obecné ilustrace,
- žádný font Inter.

- **Barvy (tokeny):**
  - papír `#F3EEE4`, inkoust `#15171A`, šedá `#5F5A51`, linka `#D8D0C0`;
  - akcent **cihlová / razítko** `#D9442B` (zámky, razítko „nekoupíte“, CTA);
  - terminál `#0F1214` s fosforovou zelenou `#3DDC84` a jantarovou `#F5B700`;
  - pozitivní `#0E7A4F`.
- **Typografie:**
  - titulky **Fraunces** (variabilní serif, „novinový“ charakter),
  - text **Instrument Sans**,
  - čísla **JetBrains Mono** (tabulkové číslice).
  Vše s latin-ext.
- **Prvky:** tenké linky jako v novinách, razítka, „výstřižky“ karet, tabulkové číslice, jemné animace čísel (count-up), ticker páska.
- **Logo BestBrookies:** wordmark a symbol „potůčku“ (brook), tedy vlnovka, která přechází v rostoucí graf. Claim: „ETF bez mlhy.“
- **Mobil:**
  - tap targety ≥ 44 px, písmo ≥ 16 px v inputech (iOS nezoomuje),
  - žádné horizontální scrollování stránky (tabulky jako karty),
  - `prefers-reduced-motion` respektovat.
- **Oslovení: vykání.** Tón: věcný, sebevědomý, bez žargonu; anglický termín vždy s českým vysvětlením.

---

## 12. Právní a etické mantinely
- Stránka je **informační a vzdělávací, není investičním doporučením** (BestBrookies není investiční zprostředkovatel). Formulace „srovnání“ a „dvojče se stejným/nejbližším indexem“, nikdy „kupte“.
- Upozornění: minulá výkonnost nezaručuje budoucí výnosy; investice nesou riziko ztráty; měnové riziko USD/CZK.
- GDPR:
  - účel „zaslání taháku“ (plnění na žádost),
  - marketingová série jen se samostatným souhlasem (checkbox),
  - stránka `/ochrana-udaju`, správce = fiktivní BestBrookies s. r. o. (placeholder IČO).
- Žádná falešná čísla (sociální důkaz, počty stažení), dokud nejsou reálná.
- Daňové informace s odkazem na zdroj a doporučením ověřit u daňového poradce.

---

## 13. Očekávaná konverze a A/B hypotézy

**Očekávaná konverze** (studený mobilní provoz z Mety, 1 pole, interaktivní obsah, silný lead magnet): **5–8 % návštěvníků → lead.** Model funnelu na 100 příchodů:
- 60 projde za hero,
- 35 interaguje,
- 20 klikne na zámek nebo uvidí výsledek,
- 9 začne vyplňovat,
- **6–7 odešle**.

Zdůvodnění a benchmarky budou v README.

**A/B hypotézy (podle očekávaného dopadu):**
1. **Načasování žádosti:** zámek po interakci vs. formulář jako hlavní prvek hero (dopad asi ±30 % relativně).
2. **Hlavní sdělení hero:** „dvojče“ (zvědavost) vs. „poplatky“ (ztráta); zároveň test reklamních kreativ.
3. **Míra zamčení:** 1 dvojče zdarma + zbytek zamčený vs. vše zamčené vs. vše odemčené (tahák jako „uložit si“).

---

## 14. Roadmapa
| Fáze | Výstup |
|---|---|
| 1 | SPEC.md (tento dokument) |
| 2 | Scaffold (Astro, Tailwind, Preact), design tokeny, datová pipeline a GitHub Action |
| 3 | Sekce a islands: pruh, hero A/B, srovnání, kalkulačky, formulář, FAQ |
| 4 | `/api/lead` (Supabase/Brevo s mockem), tracking a consent, debug panel |
| 5 | PDF tahák, e-mailová šablona a sekvence, stránka reklam a PNG |
| 6 | QA: Lighthouse, reálný mobil (Playwright 375 px), přístupnost, texty |
| 7 | README (pořadí sekcí, konverze, hypotézy, setup), nasazení na Vercel |

## 15. Co dodá zadavatel
1. `ALPHAVANTAGE_API_KEY` do GitHub Secrets (nutné pro reálná data).
2. Import repa do Vercelu (nutné pro veřejnou URL).
3. Volitelně: PostHog projekt (`PUBLIC_POSTHOG_KEY`) pro reálné měření funnelu.

---

## 16. Revize 2: redesign (14. 10. 2026)

Na základě zpětné vazby zadavatele. Tato kapitola má přednost před kap. 4, 6, 7 a 11, pokud se liší.

**Design (nahrazuje kap. 11):**
- Font Geist + Geist Mono (latin-ext). Fraunces, Instrument Sans a JetBrains Mono se už nepoužívají.
- Minimalistická paleta: bílá, inkoust `#0A0A0A`, šedé, jediný akcent limetka `#C9F24B` / zelená `#0F9D63`, červená `#E34948` jen pro „nekoupíte“ a ztráty. Grafy: ověřené sloty modrá / oranžová / aqua.
- Hero přes celou obrazovku (i na notebooku), každá sekce jedno sdělení, víc vzduchu, méně textu.
- Obrázky místo textu: vlajky USA/EU, schéma PRIIPs o 4 krocích, poplatky jako „ukousnutá sušenka“ (koláč, úhel = přesný podíl), náhled balíčku.
- Animace:
  - nástup nadpisu po slovech,
  - reveal sekcí při scrollu,
  - vykreslování čar grafů, count-up čísel,
  - tok peněz USA → EU,
  - hover zvednutí karet a rozvinutí balíčku,
  - plynulé FAQ.
  Vše respektuje `prefers-reduced-motion`.

**Lead magnet (nahrazuje kap. 4):** „Startovací balíček ETF“
1. Překladač 12 ETF → dvojčata (PDF).
2. Checklist před prvním nákupem: 10 kroků (PDF, 6 stran celkem včetně poplatků a daní).
3. Excel šablona „Můj ETF plán“: vstupy, projekce na 40 let s grafem, list dvojčat, deník nákupů s hlídáním časového testu.

Zdůvodnění: checklisty a šablony patří k nejlépe konvertujícím formátům lead magnetů.

**Struktura (nahrazuje kap. 6):**
1. Hero
2. Proč VOO nekoupíte
3. Souboj ETF (graf pravidelné investice v Kč, dříve „stroj času“, je teď součástí srovnání)
4. Kalkulačka poplatků
5. Startovací balíček
6. Důvěra + FAQ
7. Finální CTA

Burzovní pruh se změnil na živý odznak v hero.

**Nástroje (doplňuje kap. 7):** všechny vstupy jsou nastavitelné, včetně poplatku vlastního fondu uživatele a vlastní měsíční částky (slider i ruční zadání).

---

## 17. Revize 3: sdělení a texty (15. 10. 2026)

Na základě zpětné vazby („texty jsou technické, předpokládají znalosti a nevzbuzují emoci“) a průzkumu copywritingových zdrojů (viz README, kap. 2).

**Hlavní sdělení:** z „VOO v Česku nekoupíte, tady je dvojče“ na **„Z 3 000 Kč měsíčně může být 1,5 milionu. Bez akciových tipů a drahého poradce.“** Prodáváme výsledek a jednoduchost, ne technický detail.
- „Dvojčata“ zůstávají jako praktický háček ve srovnání a v balíčku („kde to koupit v Česku“), ne jako hlavní sdělení.
- Číslo v nadpisu se počítá ze stejných předpokladů jako kalkulačka (7 % ročně, 20 let, zaokrouhleno dolů).

**Struktura podle PAS:**
1. Hero s kalkulačkou růstu
2. Problém: peníze na účtu chudnou (inflace ČSÚ)
3. Řešení: jeden nákup, 500 firem (složení S&P 500, 4 přínosy, Buffett)
4. Srovnání: které ETF vybrat
5. Kalkulačka poplatků
6. Balíček
7. Důvěra + FAQ (odpovědi na obavy z průzkumu)
8. Finální CTA

**Varianty:** `?v=rust` (výchozí, místo `dvojce`, alias zachován) a `?v=poplatky`. Reklama A přepracována na „Růst“.

**Mantinely:**
- Nikdy „bez rizika“ ani „rychle zbohatnout“.
- Každé číslo o výnosu má hned u sebe předpoklad a větu, že výnos není zaručený (ESMA: rizika stejně výrazně jako přínosy).

**Opravená chyba:** vysvětlující okénko u živého odznaku NYSE se zobrazovalo pod nadpisem hero (stacking context animace). Obal odznaku má teď vlastní `z-index`.
