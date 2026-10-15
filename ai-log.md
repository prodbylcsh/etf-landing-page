# AI log – BestBrookies: landing page pro srovnání ETF z NYSE

> Rekonstrukce průběhu spolupráce s AI asistentem (Claude Code).
> Starší část konverzace byla automaticky zhuštěna, proto jde o podrobný souhrn,
> ne o doslovný přepis všech zpráv. Citace zpráv uživatele jsou doslovné tam, kde byly dostupné.

Repozitář: `prodbylcsh/etf-landing-page`
Vývojová větev: `claude/etf-comparison-landing-v5oml3` → mergnuto do `main`
Hosting: Vercel (produkční větev `main`)

---

## 1. Zadání

**Uživatel (zadání, shrnuto):**
- Landing page porovnávající ETF obchodované na NYSE pro české drobné investory, kteří přicházejí z mobilních reklam.
- Funguje jako lead magnet optimalizovaný na získání kontaktu. Nesmí vypadat jako „základní výstup z Claude“. Musí být připravená k nasazení reklam „zítra“.
- Definovat cílovou skupinu, nabízenou hodnotu a okamžik, kdy se ptát na kontakt.
- Navrhnout 2 verze reklamy. První obrazovka musí navazovat na příslib reklamy.
- Interaktivní prvky (srovnání, kalkulačka poplatků…) mají vést k zachycení kontaktu.
- Formulář s minimem polí a promyšlené, co přijde po odeslání.
- Reálná data se zdroji a měření celé cesty.
- README: zdůvodnění pořadí sekcí, očekávaná konverze, 3 A/B hypotézy seřazené podle dopadu.
- Nasazení na free hosting (Vercel).

**Uživatel:** „Namísto toho abys to rovnou implementoval, chci, aby ses nejdřív důkladně zamyslel… vymyslel roadmapu… prostředí (github, supabase?, služby pro data etf, API tokeny)… cílová skupina drobný investor… struktura stránky… featury (counter protočených peněz na NYSE)… front-end framework… .md soubor… Pokud budeš mít otázky, ptej se… teprve potom vytvoř .md soubor. Já následně nastavím to, co bude potřeba.“

**AI:** Připravilo plán (prostředí, služby a API, psychologie cílové skupiny, struktura, featury včetně živého počítadla obratu NYSE, volba frameworku) a položilo doplňující otázky.

## 2. Odpovědi na otázky

**Uživatel:** „1) značka: BestBrookies 2) design: kombinace 3) brevo 4) volitelný checkbox 5) vykání 6) ano 7) nekoupím a nemám, tohle bude jen vývojový projekt (ale přistupovat k jeho zpracování jako kdyby se v případě dobrého řešení mohlo nasadit) 8) Vercel 9) není potřeba dělat reálne reklamy… bude potřeba vytvořit ty dvě obrazvoky reklamy. … supabase … nasimulovat … emailing … připravit kód … to pdf by taky bylo fajn vytvořit. zbytek zní fajn, a klidně se pusť do práce. jakmile budeš ode mě něco doplnit… řekni, ideální dodej postup.“

**AI:** Sepsalo `SPEC.md` a postavilo MVP:
- **Stack:** Astro 5 (statický výstup + serverová API route), Preact islands, nanostores, Tailwind CSS v4, adaptér `@astrojs/vercel`.
- **Data:**
  - Alpha Vantage (ETF profil, měsíční řady, listing; rozpočet 25 volání/den);
  - kurzy ČNB;
  - GitHub Action `data.yml`, která data pravidelně obnovuje, commituje `market.json` a znovu generuje PDF.
- **Lead flow:**
  - `POST /api/lead` → Supabase (REST), Brevo (e-mail + seznamy), Meta CAPI;
  - bez klíčů běží v mock režimu;
  - ochrana: honeypot, kontrola času vyplnění, rate limit.
- **Měření:**
  - `dataLayer`, PostHog (líné načtení, EU, bez ukládání do souhlasu), Meta Pixel až po souhlasu;
  - debug panel `?debug=1`.
- **Lead magnet:**
  - PDF tahák/checklist renderovaný přes Playwright;
  - personalizovaný e-mail;
  - později i Excel šablona plánu.
- **Reklamy:** dvě varianty, každá s vlastní hero sekcí přes parametr `?v=`. Feed i story PNG, OG obrázek a náhledová stránka `/reklama`.
- **Právní věci:** stránka Ochrana údajů, cookie lišta, upozornění na rizika.

## 3. Klíče, nasazení a merge

**Uživatel:** „klíč je přidán do github, vercel jsem deploynul, ale nechal jsem main větev, protože chci abys mergnul do mainu. do vercelu jsem přidal shared environment variable z posthog“

**AI:**
- Mergnulo vývojovou větev do `main`.
- Upravilo build tak, aby přijímal PostHog klíč pod více názvy (`PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_KEY`, `POSTHOG_KEY`…).
- Ověřilo běh datové GitHub Action.

## 4. Redesign (zpětná vazba k designu)

**Uživatel (shrnuto):**
- Font působí divně, chce moderní minimalistickou paletu.
- Struktura je chaotická; hero má na notebooku zabírat celou obrazovku s jasným fokusem.
- Víc animací a přechodů (načtení, hover, scroll, hover nad obsahem PDF taháku).
- Místo textu obrázky/SVG.
- Nejlépe fungující lead magnety jsou šablony a checklisty.
- Nastavitelné nástroje a moderní vizualizace dat.

(Mezitím: „I hit my usage limit while you were working, but it has reset now. Please continue from where you left off.“)

**AI:**
- **Typografie a paleta:** písmo Geist + Geist Mono, minimalistická paleta, celoobrazovkový hero.
- **Animace:**
  - reveal animace při scrollu (IntersectionObserver);
  - count-up čísel;
  - animované SVG grafy;
  - hover efekty, mimo jiné u náhledu obsahu balíčku.
- **Lead magnet:** checklist (PDF) + Excel šablona „Můj plán / Dvojčata / Deník nákupů“ (vzorce ověřené přepočtem, 0 chyb).
- **Nástroje:**
  - nastavitelná kalkulačka poplatků s posuvníky a vlastním poplatkem fondu;
  - srovnání ETF s grafem vývoje a metrikami;
  - responzivní grafy, paleta ověřená na přístupnost.
- **Opravy:** horizontální přetečení na mobilu a konflikty transformací v Tailwindu.
- **Testy:** screenshoty na mobilu (390 px) a desktopu (1440 px).

## 5. Přepis textů (copywriting a psychologie)

**Uživatel (shrnuto):**
- Bublina NYSE se vykresluje pod nadpisem hero sekce.
- Struktura je teď skvělá, ale texty jsou moc technické, bez emocí a příliš točené kolem „NYSE nejde koupit, dáme vám dvojče“.
- „Lidi chtěj vydělat peníze, jednoduše, rychle, snadno, bez rizika…“ Vysvětlit, proč zrovna tato ETF.
- „Zkus si nejprve projít na webu nějaké guides, kurzy zdarma, sources, tipy a triky.“
- Inspirace: stránka XTB o VOO.

**AI:**
- **Rešerše:**
  - copywriting podle PAS (problém → rozjitření → řešení);
  - pravidla ESMA (rizika musí být viditelná);
  - český průzkum (73 % se bojí ztráty, 71 % neví jak začít);
  - Buffettův dopis z roku 2013;
  - inflace podle ČSÚ.
- **Nová hlavní varianta „Růst“ (`?v=rust`):**
  - nadpis „Z 3 000 Kč měsíčně může být 1,5 milionu.“;
  - interaktivní růstová kalkulačka (částka, roky);
  - vždy s předpokladem výnosu a upozorněním na riziko.
- **Nové sekce:**
  - Inflace („Peníze na účtu potichu chudnou.“);
  - Proč index („Jeden nákup. Přes 500 největších firem.“);
  - Srovnání;
  - Poplatky;
  - Balíček zdarma;
  - Důvěra + FAQ („Můžu přijít o peníze?“…);
  - Finální výzva („Začněte tento měsíc. Za 20 let si poděkujete.“).
- **Bublina NYSE:** opravena (z-index / stacking context).
- **Na novou komunikaci navázáno:**
  - reklamy (A „Růst“, B „Poplatky“);
  - PDF;
  - e-mail;
  - `SPEC.md` (kap. 16–17);
  - README.

## 6. Kontrola stavu + PostHog

**Uživatel:** „nyní je to perfektní. je vše pushnuté, mergnuté? Existují ty dvě verze reklamy? A poslední věc, kterou bych potřeboval dosnastavit - v posthog vidím visitors 0 page views 0 takže to asi nefunguje. jde o ten "defaultní" projekt (žádný jsem nevytvářel), poradil bys mi znovu jak toto mám nastavit? toto bude poslední krok“

**AI:**
- **Stav:** vše pushnuté, `main` = vývojová větev.
- **Reklamy:**
  - A „Růst“: `public/ads/ad-a-feed.png`, `public/ads/ad-a-story.png`;
  - B „Poplatky“: `public/ads/ad-b-feed.png`, `public/ads/ad-b-story.png`;
  - `public/og.png` a náhled na `/reklama`.
- **Příčina nul v PostHogu:** přehled Web analytics počítá jen událost `$pageview`, která byla vypnutá. Opraveno (`capture_pageview: true`, `capture_pageleave: true`) a do debug panelu přidán stav PostHogu.
- **Postup nastavení:**
  1. Klíč `phc_…`: PostHog → Settings → Project → Project API key.
  2. Region: EU je výchozí; pro US je potřeba `PUBLIC_POSTHOG_HOST`.
  3. Proměnná `PUBLIC_POSTHOG_KEY` ve Vercelu (Production).
  4. Redeploy.
  5. Kontrola přes `?debug=1` („připojeno phc_…“).
  6. PostHog → Activity.
  7. Testovat bez adblocku.

## 7. Chyba ve Vercelu (screenshot)

**Uživatel:** Screenshot hlášky: „Environment variables with a public framework prefix cannot use `visibility: secret`. Use `visibility: config` instead.“

**AI:**
- Zvolit typ **Config**, protože PostHog project key je veřejný (končí v JavaScriptu v prohlížeči).
- Pak uložit, Redeploy a ověřit přes `?debug=1`.

## 8. README

**Uživatel:** „je vygenerovaný readme?“

**AI:**
- README existuje (12 kapitol) a obsahuje vše ze zadání.
- Doplněn postup pro PostHog: typ Config, nutnost Redeploy, ověření, adblock.
- Commit `de7a696`, pushnuto do větve i do `main`.

---

## Výsledný stav projektu

**Stránka (`/`):**
- Hero (A „Růst“ / B „Poplatky“) se živou bublinou NYSE.
- Inflace → Proč index → Srovnání ETF → Kalkulačka poplatků → Balíček zdarma → Důvěra + FAQ → Finální výzva.
- Sticky CTA a lead sheet.

**Lead magnet:**
- PDF checklist a „překladač“ (americké ETF → evropská UCITS dvojčata s ISIN);
- Excel šablona plánu;
- personalizovaný e-mail.

**Formulář:** jen e-mail + volitelný souhlas s dalšími e-maily.

**Měření:**
- události po celé cestě (`page_view` → `section_view` → `scroll_depth` → `first_interaction` → `form_view` → `lead_created`);
- PostHog, Meta Pixel/CAPI po souhlasu;
- debug panel `?debug=1`.

**Data:** Alpha Vantage + ČNB, automaticky obnovované GitHub Action; zdroje uvedené v patičce a v README.

**README:**

| Kapitola | Obsah |
|---|---|
| 1. Koncept | koncept v kostce |
| 2. Sdělení a psychologie | z čeho texty vycházejí (se zdroji) |
| 3. Design | |
| 4. Pořadí sekcí | 8 sekcí se zdůvodněním |
| 5. Reklamy | obě varianty |
| 6. Měření | měření celé cesty |
| 7. Očekávaná konverze | 5–8 % (benchmarky Unbounce 6,6 %, finance 8,4 %) |
| 8. A/B hypotézy | 3 hypotézy podle dopadu (kdy se ptát na e-mail; zisk vs. ztráta; míra zamčení obsahu); ~6 000 návštěv na variantu |
| 9. Data a zdroje | |
| 10. Architektura | |
| 11. Spuštění a nasazení | |
| 12. Právní mantinely | |

**Zbývá na straně uživatele:**
- PostHog proměnná typu Config + Redeploy;
- volitelně klíče Supabase a Brevo (bez nich běží formulář v mock režimu).