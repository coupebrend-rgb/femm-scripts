// ==UserScript==
// @name         FEMM Antwerpen - Klant- en merkspecifieke kortingen (Sigma/Nelf/Epifanes)
// @namespace    femm-antwerpen
// @version      2.2
// @description  Herberekent automatisch de nettoprijs en het kortingspercentage voor Sigma-, Nelf- en Epifanes-artikelen op basis van de klantspecifieke afspraken (bruto prijslijsten), terwijl je een verkooporder invoert.
// @match        https://start.exactonline.be/docs/SlsSalesOrderEntry.aspx*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/coupebrend-rgb/femm-scripts/main/femm-klant-merk-korting.user.js
// @downloadURL  https://raw.githubusercontent.com/coupebrend-rgb/femm-scripts/main/femm-klant-merk-korting.user.js
// ==/UserScript==

(function () {
  'use strict';

  // --- Bruto prijzen per artikel (Sigma / Nelf verf / Nelf thinner / Epifanes) ---
  // Bijgewerkt: 15-09-2026. Bron: prijslijsten Bezemer (Sigma), Nelf Code lijst, Epifanes prijslijst.
  // v2.1 (29-09-2026): Sigma +5 (001187, 001544, 002130, 004138, 004139); Epifanes 002272/004097/004098 op 130 en
  //       001076 verwijderd (staat in netto-lijst); manometers 004128-004137 in netto-lijst.
  // v2.2: 8 filters 004140-004147 in netto-lijst.
  // v1.4: 3 Sigma thinners toegevoegd (001545, 001916, 001372) - vallen onder "sigma" korting.
  const ARTICLES = {"002865": {"brand": "sigma", "name": "SIGMA ANTI-SKID POEDER 5 KG", "bruto": 133.0}, "000735": {"brand": "sigma", "name": "SIGMA COVER 280 1L", "bruto": 41.0}, "002378": {"brand": "sigma", "name": "SIGMA COVER 280 20L", "bruto": 439.0}, "001242": {"brand": "sigma", "name": "SIGMA COVER 280 4L", "bruto": 102.0}, "002131": {"brand": "sigma", "name": "SIGMA COVER 280 4L R/BR", "bruto": 102.0}, "001828": {"brand": "sigma", "name": "SIGMA COVER 280 HARDER 0.8L", "bruto": 32.0}, "002639": {"brand": "sigma", "name": "SIGMA COVER 280 HARDER 4L", "bruto": 126.0}, "002977": {"brand": "sigma", "name": "SIGMA COVER 280 PRIMER 4L", "bruto": 102.0}, "002469": {"brand": "sigma", "name": "SIGMA COVER 350 KLEUR 20L", "bruto": 643.0}, "002270": {"brand": "sigma", "name": "SIGMA COVER 380 BLACK 20L", "bruto": 511.0}, "000020": {"brand": "sigma", "name": "SIGMA COVER 380 BLACK 4L", "bruto": 124.0}, "002954": {"brand": "sigma", "name": "SIGMA COVER 380 HARDER 0.8L", "bruto": 34.0}, "002285": {"brand": "sigma", "name": "SIGMA COVER 380 HARDER 4L", "bruto": 151.0}, "002637": {"brand": "sigma", "name": "SIGMA COVER 435 4L KLEUR", "bruto": 140.0}, "001199": {"brand": "sigma", "name": "SIGMA COVER 456 KLEUR 4L", "bruto": 161.0}, "002756": {"brand": "sigma", "name": "SIGMA COVER 456 WIT 4L", "bruto": 129.0}, "002453": {"brand": "sigma", "name": "SIGMA DUR 1800 KLEUR 4L", "bruto": 235.0}, "002215": {"brand": "sigma", "name": "SIGMA DUR 520 4L KLEUR", "bruto": 138.0}, "002516": {"brand": "sigma", "name": "SIGMA DUR 550 H KLEUR 4L", "bruto": 178.0}, "001692": {"brand": "sigma", "name": "SIGMA DUR 550 WIT 4L", "bruto": 144.0}, "001542": {"brand": "sigma", "name": "SIGMA DUR 550 Z KLEUR 20L", "bruto": 690.0}, "000617": {"brand": "sigma", "name": "SIGMA DUR 550 Z KLEUR 4L", "bruto": 144.0}, "002283": {"brand": "sigma", "name": "SIGMA DUR 550 ZWART 4L", "bruto": 138.0}, "002126": {"brand": "sigma", "name": "SIGMA DUR HARDER 188/520/550 0.48 L", "bruto": 37.0}, "002302": {"brand": "sigma", "name": "SIGMA DUR HARDER 188/520/550 2.4 L", "bruto": 107.0}, "001986": {"brand": "sigma", "name": "SIGMA FAST 40 KLEUR 20L", "bruto": 377.0}, "002095": {"brand": "sigma", "name": "SIGMA FAST 40 KLEUR 5L", "bruto": 114.0}, "002214": {"brand": "sigma", "name": "SIGMA MARINE 40 KLEUR 5L", "bruto": 116.0}, "001908": {"brand": "sigma", "name": "SIGMA MARINE 40 WIT 5L", "bruto": 79.0}, "001906": {"brand": "sigma", "name": "SIGMA MARINE 40 ZWART 5L", "bruto": 116.0}, "001985": {"brand": "sigma", "name": "SIGMA MARINE 49 1L", "bruto": 26.0}, "002303": {"brand": "sigma", "name": "SIGMA MARINE 49 KLEUR 5L", "bruto": 122.0}, "002920": {"brand": "sigma", "name": "SIGMA MARINE 49 PERFECT WHITE 5L", "bruto": 106.0}, "002286": {"brand": "sigma", "name": "SIGMA PRIME 200 4L", "bruto": 135.0}, "002064": {"brand": "sigma", "name": "SIGMA THERM 500 5L", "bruto": 182.0}, "002008": {"brand": "sigma", "name": "SIGMA VIKOTE 18 LIGHT 5L", "bruto": 143.0}, "002007": {"brand": "sigma", "name": "SIGMA VIKOTE 42 20L ZWART", "bruto": 295.0}, "001543": {"brand": "sigma", "name": "SIGMA VIKOTE 56 20L", "bruto": 352.0}, "001547": {"brand": "sigma", "name": "SIGMA VIKOTE 56 KLEUR 5L", "bruto": 138.0}, "001827": {"brand": "sigma", "name": "SIGMA VIKOTE 56 WIT 5L", "bruto": 111.0}, "001884": {"brand": "sigma", "name": "SIGMA VIKOTE 56 ZWART 5L", "bruto": 113.0}, "001545": {"brand": "sigma", "name": "SIGMA THINNER 20-05 5L", "bruto": 65.0}, "001916": {"brand": "sigma", "name": "SIGMA THINNER 21-06 5L", "bruto": 65.0}, "001372": {"brand": "sigma", "name": "SIGMA THINNER 91-92 5L", "bruto": 62.0}, "001187": {"brand": "sigma", "name": "SIGMA MARINE 48 ZWART 5L", "bruto": 121.0}, "001544": {"brand": "sigma", "name": "SIGMA MARINE JACHTLAK KLEUR 4L", "bruto": 104.0}, "002130": {"brand": "sigma", "name": "SIGMA MARINE 48 KLEUR 5L", "bruto": 121.0}, "004138": {"brand": "sigma", "name": "SIGMA MARINE ONE 648Z KLEUR 5L", "bruto": 121.0}, "004139": {"brand": "sigma", "name": "SIGMA DUR 520 SET ALU LIGHT 4L", "bruto": 147.0}, "000243": {"brand": "epifanes", "name": "EPIFANES ALUMINIUM HR 1000 GRADEN 1L", "bruto": 30.0}, "001393": {"brand": "epifanes", "name": "EPIFANES ANTISLIPPOEDER 20 GR", "bruto": 7.77}, "001007": {"brand": "epifanes", "name": "EPIFANES ANTISLIPVERF 750 ML", "bruto": 32.15}, "001180": {"brand": "epifanes", "name": "EPIFANES BILGE VERF 2L", "bruto": 64.3}, "001091": {"brand": "epifanes", "name": "EPIFANES BILGE VERF 750ML", "bruto": 25.45}, "001340": {"brand": "epifanes", "name": "EPIFANES BOOTLAK 2L", "bruto": 60.74}, "000263": {"brand": "epifanes", "name": "EPIFANES BOOTLAK 750 ML", "bruto": 24.05}, "000248": {"brand": "epifanes", "name": "EPIFANES BOOTLAK BLANK 1 L", "bruto": 34.38}, "002605": {"brand": "epifanes", "name": "EPIFANES COMBI PLAMUUR 1000 GR", "bruto": 23.55}, "000956": {"brand": "epifanes", "name": "EPIFANES COMBI PLAMUUR TUBE", "bruto": 8.6}, "001390": {"brand": "epifanes", "name": "EPIFANES EASY-FLOW 1 L", "bruto": 23.55}, "001389": {"brand": "epifanes", "name": "EPIFANES EASY-FLOW 500 ML", "bruto": 12.89}, "001008": {"brand": "epifanes", "name": "EPIFANES EIGLANS BLANK 1 L", "bruto": 36.45}, "000399": {"brand": "epifanes", "name": "EPIFANES EPOXY FILLER 1500 1500ML", "bruto": 59.9}, "001032": {"brand": "epifanes", "name": "EPIFANES EPOXY FILLER 1500 750ML", "bruto": 36.1}, "002508": {"brand": "epifanes", "name": "EPIFANES EPOXY HB COAT 4L", "bruto": 168.93}, "002277": {"brand": "epifanes", "name": "EPIFANES FOUL-AWAY 2L", "bruto": 118.02}, "001386": {"brand": "epifanes", "name": "EPIFANES HAMERSLAGLAK 1 L", "bruto": 38.02}, "000247": {"brand": "epifanes", "name": "EPIFANES HARDHOUTOLIEVERNIS 1 L", "bruto": 36.45}, "002111": {"brand": "epifanes", "name": "EPIFANES MAHONIEBEITS 500ML", "bruto": 20.08}, "002140": {"brand": "epifanes", "name": "EPIFANES MATLAK ZWART 750ML", "bruto": 35.45}, "001381": {"brand": "epifanes", "name": "EPIFANES MONO-URETHANE BOOTLAK 750 ML", "bruto": 35.87}, "000764": {"brand": "epifanes", "name": "EPIFANES MONO-URETHANE BOOTLAK KLEUR 2L", "bruto": 106.86}, "000763": {"brand": "epifanes", "name": "EPIFANES MONO-URETHANE BOOTLAK WIT 2L", "bruto": 106.86}, "000727": {"brand": "epifanes", "name": "EPIFANES MULTI MARINE PRIMER 2 L", "bruto": 44.05}, "000862": {"brand": "epifanes", "name": "EPIFANES MULTI MARINE PRIMER 750 ML", "bruto": 23.55}, "000254": {"brand": "epifanes", "name": "EPIFANES MULTIFORTE 4 L", "bruto": 70.41}, "000251": {"brand": "epifanes", "name": "EPIFANES MULTILUX 2L", "bruto": 57.36}, "000249": {"brand": "epifanes", "name": "EPIFANES MULTILUX 750 ML", "bruto": 23.14}, "001383": {"brand": "epifanes", "name": "EPIFANES NAUTIFORTE 750 ML", "bruto": 35.87}, "002492": {"brand": "epifanes", "name": "EPIFANES NAUTIFORTE WIT 2L", "bruto": 93.97}, "002272": {"brand": "epifanes", "name": "EPIFANES POLY-URETHANE BOOTLAK 3 KG KLEUR", "bruto": 130.0}, "004097": {"brand": "epifanes", "name": "EPIFANES POLY-URETHANE BOOTLAK 3 KG WIT", "bruto": 130.0}, "001382": {"brand": "epifanes", "name": "EPIFANES POLY-URETHANE BOOTLAK 750 GR", "bruto": 43.39}, "001089": {"brand": "epifanes", "name": "EPIFANES POLY-URETHANE BOOTLAK 750 GR RAL KLEUR", "bruto": 50.17}, "004098": {"brand": "epifanes", "name": "EPIFANES POLYLUX WIT 3000 GR", "bruto": 130.0}, "002273": {"brand": "epifanes", "name": "EPIFANES PU KWASTVERDUNNING 1L", "bruto": 21.32}, "002764": {"brand": "epifanes", "name": "EPIFANES PU KWASTVERDUNNING 5L", "bruto": 105.12}, "002340": {"brand": "epifanes", "name": "EPIFANES PU SLOW REDUCER 1L", "bruto": 28.35}, "001028": {"brand": "epifanes", "name": "EPIFANES RAPIDCLEAR 750ML", "bruto": 34.38}, "001026": {"brand": "epifanes", "name": "EPIFANES SEAPOWER CLEANER + WAX 500ML", "bruto": 13.64}, "001029": {"brand": "epifanes", "name": "EPIFANES SEAPOWER COLOR RESTORER 500ML", "bruto": 17.27}, "001147": {"brand": "epifanes", "name": "EPIFANES SEAPOWER SUPER POLY BOAT WAX 500ML", "bruto": 17.27}, "000625": {"brand": "epifanes", "name": "EPIFANES TEAK OIL SEALER 1 L", "bruto": 22.73}, "000353": {"brand": "epifanes", "name": "EPIFANES VERDUNNER D-100 1L", "bruto": 15.37}, "000139": {"brand": "epifanes", "name": "EPIFANES VERDUNNER D-100 500ML", "bruto": 10.25}, "001391": {"brand": "epifanes", "name": "EPIFANES VERFAFBIJT 1 L", "bruto": 28.35}, "001949": {"brand": "epifanes", "name": "EPIFANES VERFVERDUNNING 1L", "bruto": 11.24}, "002670": {"brand": "epifanes", "name": "EPIFANES VERFVERDUNNING 5L", "bruto": 35.54}, "001143": {"brand": "epifanes", "name": "EPIFANES WATERLIJNVERF 250ML", "bruto": 12.98}, "002347": {"brand": "nelf_verf", "name": "NELF ANTISLIPPARELS 500G", "bruto": 14.95, "h_pct": 15.0}, "001433": {"brand": "nelf_verf", "name": "NELF RUIMVERF GK 20L", "bruto": 132.8, "h_pct": 15.0}, "001417": {"brand": "nelf_verf", "name": "NELFADUR LAKVERF 2DN KLEUR 5L", "bruto": 228.25, "h_pct": 40.0}, "001414": {"brand": "nelf_verf", "name": "NELFADUR LAKVERF 2DN WIT 5L", "bruto": 198.76, "h_pct": 40.0}, "001419": {"brand": "nelf_verf", "name": "NELFADUR TOPFIINSH ZG WIT 5L", "bruto": 173.47, "h_pct": 40.0}, "001422": {"brand": "nelf_verf", "name": "NELFADUR TOPFINISH SEMIGLOSS KLEUR 5L", "bruto": 197.67, "h_pct": 40.0}, "001420": {"brand": "nelf_verf", "name": "NELFADUR TOPFINISH ZG KLEUR 5L", "bruto": 191.13, "h_pct": 40.0}, "001421": {"brand": "nelf_verf", "name": "NELFADUR TOPFINSH SEMIGLOSS WIT 5L", "bruto": 179.36, "h_pct": 40.0}, "001909": {"brand": "nelf_verf", "name": "NELFAMAR CUPRUM 5L", "bruto": 173, "h_pct": 15.0}, "001527": {"brand": "nelf_verf", "name": "NELFAMAR HB VINYLCOATING 20L", "bruto": 324.22, "h_pct": 40.0}, "001749": {"brand": "nelf_verf", "name": "NELFAMAR MULTIGLOSS RV KLEUR 5L", "bruto": 146.79, "h_pct": 40.0}, "001750": {"brand": "nelf_verf", "name": "NELFAMAR MULTIGLOSS RV WIT 5L", "bruto": 117.65, "h_pct": 40.0}, "001428": {"brand": "nelf_verf", "name": "NELFAMAR PENETRERENDE RUIMVERF 20L", "bruto": 250.47, "h_pct": 40.0}, "001751": {"brand": "nelf_verf", "name": "NELFAMAR SD COATING KLEUR 5L", "bruto": 127.2, "h_pct": 40.0}, "001752": {"brand": "nelf_verf", "name": "NELFAMAR SD COATING WIT 5L", "bruto": 109.97, "h_pct": 40.0}, "001408": {"brand": "nelf_verf", "name": "NELFAMAR SUPERTOP GLOSS DIEPZWART 1L", "bruto": 28.22, "h_pct": 40.0}, "001409": {"brand": "nelf_verf", "name": "NELFAMAR SUPERTOP GLOSS DIEPZWART 2.5L", "bruto": 69.69, "h_pct": 40.0}, "001410": {"brand": "nelf_verf", "name": "NELFAMAR SUPERTOP GLOSS KLEUR 1L", "bruto": 34.52, "h_pct": 40.0}, "001411": {"brand": "nelf_verf", "name": "NELFAMAR SUPERTOP GLOSS KLEUR 2.5L", "bruto": 85.47, "h_pct": 40.0}, "001406": {"brand": "nelf_verf", "name": "NELFAMAR SUPERTOP GLOSS SNEEUWWIT 1L", "bruto": 28.22, "h_pct": 40.0}, "001429": {"brand": "nelf_verf", "name": "NELFAPOX FINISHING PLAMUUR 4KG", "bruto": 130.33, "h_pct": 15.0}, "002398": {"brand": "nelf_verf", "name": "NELFAPOX FW COATING 5L", "bruto": 202.96, "h_pct": 40.0}, "001418": {"brand": "nelf_verf", "name": "NELFAPOX REIPLAMUUR 4KG", "bruto": 132.68, "h_pct": 15.0}, "001748": {"brand": "nelf_verf", "name": "NELFAPOX STL PREMIUM COAT 20L", "bruto": 521.4, "h_pct": 40.0}, "001423": {"brand": "nelf_verf", "name": "NELFAPOX STL PREMIUM COAT 5L", "bruto": 132.22, "h_pct": 40.0}, "002562": {"brand": "nelf_verf", "name": "NELFAPRIME MULTIPRIMER ZF KLEUR 1L", "bruto": 25.24, "h_pct": 40.0}, "001405": {"brand": "nelf_verf", "name": "NELFAPRIME MULTIPRIMER ZF KLEUR 5L", "bruto": 122.88, "h_pct": 40.0}, "002556": {"brand": "nelf_verf", "name": "NELFAPRIME MULTIPRIMER ZF WIT 1L", "bruto": 21.33, "h_pct": 40.0}, "001219": {"brand": "nelf_verf", "name": "NELFAPRIME MULTIPRIMER ZF WIT 5L", "bruto": 103.06, "h_pct": 40.0}, "002561": {"brand": "nelf_verf", "name": "NELFAPRIME MULTIPRIMER ZF ZWART 1L", "bruto": 21.33, "h_pct": 40.0}, "002371": {"brand": "nelf_verf", "name": "NELFAPRIME MULTIPRIMER ZF ZWART 5L", "bruto": 103.06, "h_pct": 40.0}, "002825": {"brand": "nelf_thinner", "name": "NELFASOL VERDUNNER 2K PU 5L", "bruto": 54.66, "h_pct": 0.0}, "001434": {"brand": "nelf_thinner", "name": "NELFASOL VERDUNNER 3210 5L", "bruto": 28.68, "h_pct": 0.0}, "001435": {"brand": "nelf_thinner", "name": "NELFASOL VERDUNNER 3212 5L", "bruto": 40.04, "h_pct": 0.0}, "001436": {"brand": "nelf_thinner", "name": "NELFASOL VERDUNNER 3216 5L", "bruto": 40.48, "h_pct": 0.0}, "001437": {"brand": "nelf_thinner", "name": "NELFASOL VERDUNNER 3226 5L", "bruto": 35.47, "h_pct": 0.0}, "001438": {"brand": "nelf_thinner", "name": "NELFASOL VERDUNNER EP 5L", "bruto": 35.1, "h_pct": 0.0}};

  // --- Klantspecifieke afspraken per merk (uit de klantenlijst) ---
  // Elke klant heeft een lijst met namen (hoofdnaam + bijnaam + "idem"-aliassen) waarmee
  // Exact's klantnaam vergeleken wordt, en per merk een rekenregel:
  //   bruto_ak_pct        : prijs = bruto prijs, korting% = pct
  //   netto_pct           : prijs blijft Exact's eigen nettoprijs, enkel korting% = pct
  //   useH:true (enkel Nelf verf/Nelf, pct 40) : gebruik het artikel-specifieke H-percentage
  //                          uit de Nelf Code lijst i.p.v. het vaste percentage
  // general_discount_pct : optioneel veld, algemene korting voor niet-merk-specifieke artikelen.
  // v1.5: volledige CUSTOMERS-lijst herbouwd uit "updated klantenbestand.xlsx" (15-09-2026, 74 klanten
  //       met effectieve prijsafspraken). "Nelf" (gecombineerd) is overal omgezet naar aparte
  //       nelf_verf + nelf_thinner regels zodat de matching altijd werkt. Alle "(als wij 50% korting
  //       hebben)"- en "behalve op Double Coat"-voetnoten uit de klantenlijst zijn genegeerd: dit zijn
  //       interne marge-opmerkingen van FEMM zelf, geen voorwaarde op de klantkorting.
  const CUSTOMERS = [{"names": ["Ara Shipping","idem Petro Shipping"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 25},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Almeda SA"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Antwerp Barge Serv.","Verpus","idem Ara Shipping","en Petro Shipping"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 25},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["APS","Roro","Antwerp Pontoon Serv."],"brands": {"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Bargeline SA","Poolzee","idem Ortus","Oostzee","Tasmanzee"],"brands": {"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15},"nelf_verf": {"type": "netto_pct","pct": 15},"nelf_thinner": {"type": "netto_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Booij Duwvaart"],"brands": {"epifanes": {"type": "bruto_ak_pct","pct": 15}}},{"names": ["Beltra B","Trafuco"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 25},"nelf_thinner": {"type": "netto_pct","pct": 10},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 10},{"names": ["Bezemer"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"epifanes": {"type": "bruto_ak_pct","pct": 25}}},{"names": ["Botran","Erik Gasten, idem","Ara Sh. - Petro Sh."],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 25},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Bitumina Shipping","Roald Verstraeten"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["BDO NV","DB Dender","DB Thierry"],"brands": {"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["B & T Shipping","DB Cygnus"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Cebe Trans","DB Alvor","John Coupé"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Celko Shipping BV","MS Fiax"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Como Shipping"],"brands": {"nelf_verf": {"type": "netto_pct","pct": 15},"nelf_thinner": {"type": "netto_pct","pct": 15},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Coupe-Van Nimmen","DB Shaddix"],"brands": {"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Central Shipping Int.","div. schepen"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Coupé-Eelen","Vadasz","broer Barry Coupé"],"brands": {"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Coupé Barry","Zenith"],"brands": {"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Coupé Stefan","DB Merwedelta","DB Banco 2","DB Banco 6"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Celer SA","Seaford","idem Tankcon"],"brands": {"nelf_verf": {"type": "netto_pct","pct": 15},"nelf_thinner": {"type": "netto_pct","pct": 15},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Delta Shipping & Chartering","Riga","DSC"],"brands": {"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Deltatransport","Tallinn","Paul en Gisele Maes-Buelens","Dublin","Roro 1 - 2 - 8"],"brands": {"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Don Zimmani FV","Don Zimmani","Fabian De Wachter"],"brands": {"epifanes": {"type": "bruto_ak_pct","pct": 30}},"general_discount_pct": 10},{"names": ["Demunter Bjorn","Vilardo","schoonbroer v De Wachter"],"brands": {"epifanes": {"type": "bruto_ak_pct","pct": 15}}},{"names": ["Donau Shiffahrt"],"brands": {"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Eterno shipping","Jannick","idem Booij Duwvaart"],"brands": {"epifanes": {"type": "bruto_ak_pct","pct": 15}}},{"names": ["Euroshipping"],"brands": {"nelf_verf": {"type": "netto_pct","pct": 15},"nelf_thinner": {"type": "netto_pct","pct": 15},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Frank Rycquart Scheepvaart","DB Daisy","idem Donau Schiffahrt","DB Durme","DB Leie","DB Zenne"],"brands": {"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Gefo Gesellschaft"],"brands": {},"general_discount_pct": 7.5},{"names": ["Geffens Josiane","Banco 7"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Gasten Marc","Ortega","idem Ara Shipping","Ortega 2"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 25},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Gasten-Maes","Amberes"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 25},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Gitra"],"brands": {},"general_discount_pct": 15},{"names": ["Inland Cargo-Line","Beringzee","idem Bargeline","Westzee"],"brands": {"nelf_verf": {"type": "netto_pct","pct": 15},"nelf_thinner": {"type": "netto_pct","pct": 15},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Intraline","Noordzee","idem Bargeline","Zuidzee"],"brands": {"nelf_verf": {"type": "netto_pct","pct": 15},"nelf_thinner": {"type": "netto_pct","pct": 15},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Industrans"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Jelo SA"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Joko Shipping"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Kegels","Prestige"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 35},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 30}},"general_discount_pct": 10},{"names": ["Kamari","Roald Verstraeten"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Kawa Barging","Artega"],"brands": {},"general_discount_pct": 15},{"names": ["Luxshipping","Euroports","Erik Gasten","idem Ara Shipping"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 25},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Lujista Schiffahrt","Vera Pax","De Wachter Fabian","Vera Cruz"],"brands": {"sigma": {"type": "bruto_ak_pct","pct": 30}},"general_discount_pct": 10},{"names": ["Marin Barging","Coupé Stefan-Pius Sheila","bestelbon meesturen"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Mertens","Marco Polo"],"brands": {},"general_discount_pct": 5},{"names": ["Maiden","Perusa","idem Central Shipping enz."],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Maes Renaud","Florence","Thalassini"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 25},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0}},"general_discount_pct": 15},{"names": ["Minato Shipping SCA","MS Banzystad"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Minerva Shipping","Benjamin Hoeykens"],"brands": {},"general_discount_pct": 10},{"names": ["Nautica","Coupé Stefan-Pius Sheila"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Nerissa AG","Asteria","Roald Verstraeten"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Ortus"],"brands": {"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Ocean GmbH","Pamela","idem Central Shipping enz.","Symphony","Swiss Inland","Panopea","Merope"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Ocean Shipping","Odyssee","Roald Verstraeten"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Petro Shipping","idem Ara Shipping"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 25},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Pamela Shipping","idem Central Shipping enz."],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["River Shipping"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 25},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Symphony Shipping","idem Central Shipping enz."],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Scheldenatie"],"brands": {"sigma": {"type": "bruto_ak_pct","pct": 30}},"general_discount_pct": 10},{"names": ["Soflutra","Commodore"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Swiss Inland Shipping","Merope","Odessa","Panopea"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Trans Shipping"],"brands": {"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Tankcon","idem Euroshipping"],"brands": {"nelf_verf": {"type": "netto_pct","pct": 15},"nelf_thinner": {"type": "netto_pct","pct": 15},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["t'Kindt Jürgen","DB Banco 9","idem DB Cygnus"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Unita SA","idem Ara Shipping"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 25},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Victrol NV","idem DSC"],"brands": {"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Vesper FV","zoon van Mertens -","Marco Polo"],"brands": {},"general_discount_pct": 5},{"names": ["Vans Bunkers"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0}},"general_discount_pct": 15},{"names": ["Versus BV","Charis"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0}},"general_discount_pct": 15},{"names": ["Valerius Shipping","idem Kamari"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15},{"names": ["Vans Trans","Mai-W"],"brands": {"nelf_verf": {"type": "netto_pct","pct": 15}}},{"names": ["Zefiros"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 25},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0}}},{"names": ["Zelos Shipping","idem Kamari"],"brands": {"nelf_verf": {"type": "bruto_ak_pct","pct": 40,"useH": true},"nelf_thinner": {"type": "bruto_ak_pct","pct": 0},"sigma": {"type": "bruto_ak_pct","pct": 40},"epifanes": {"type": "bruto_ak_pct","pct": 15}},"general_discount_pct": 15}];

  // --- Artikelen met een vaste netto prijs ("NETTO - Netto prijzen - geen korting toegestaan") ---
  // Overgenomen uit femm-geen-korting.user.js (375 codes, bijgewerkt 31-08-2026) zodat er nu nog maar
  // één plek is die bepaalt welke artikelen nooit korting krijgen. Deze lijst overrulet bewust ELKE
  // klantafspraak - zowel merk-korting (Sigma/Nelf/Epifanes) als de algemene klantkorting.
  const NETTO_VASTE_PRIJZEN = {
  "000114": 302.5,
  "000354": 90.0,
  "000355": 40.7,
  "000559": 2350.0,
  "000684": 65.0,
  "000690": 295.0,
  "000732": 90.0,
  "001076": 40.0,
  "001300": 55.0,
  "001371": 214.0,
  "001407": 38.0,
  "001509": 620.0,
  "001689": 10.0,
  "001773": 214.2,
  "001989": 1073.0,
  "002057": 214.2,
  "002084": 985.0,
  "002091": 163.0,
  "002293": 236.84,
  "002312": 955.0,
  "002341": 66.0,
  "002342": 863.0,
  "002346": 1044.0,
  "002386": 790.0,
  "002387": 69.3,
  "002402": 88.0,
  "002440": 20.0,
  "002452": 49.0,
  "002552": 239.0,
  "002625": 605.0,
  "002626": 605.0,
  "002627": 863.0,
  "002628": 922.0,
  "002655": 605.0,
  "002656": 863.0,
  "002657": 1044.0,
  "002671": 863.0,
  "002693": 985.0,
  "002707": 605.0,
  "002708": 863.0,
  "002721": 985.0,
  "002861": 4.0,
  "002862": 91.52,
  "002863": 48.1,
  "002939": 22.7,
  "002944": 125.0,
  "002945": 195.0,
  "002995": 31.0,
  "002996": 37.0,
  "002997": 31.0,
  "002998": 150.0,
  "002999": 180.0,
  "003000": 150.0,
  "003005": 8.68,
  "003011": 15.0,
  "003374": 14.9,
  "003414": 85.0,
  "003415": 185.0,
  "003416": 340.0,
  "003417": 550.0,
  "003418": 830.0,
  "003419": 1250.0,
  "003420": 145.0,
  "003421": 330.0,
  "003422": 750.0,
  "003423": 1050.0,
  "003424": 330.0,
  "003425": 750.0,
  "003426": 1050.0,
  "003427": 67.5,
  "003428": 122.5,
  "003429": 195.0,
  "003505": 13.85,
  "003506": 13.85,
  "003507": 9.1,
  "003508": 7.58,
  "003528": 50.0,
  "003916": 175.0,
  "003917": 190.0,
  "003918": 215.0,
  "003919": 230.0,
  "003920": 245.0,
  "003921": 260.0,
  "003922": 275.0,
  "003923": 195.0,
  "003924": 210.0,
  "003925": 225.0,
  "003926": 240.0,
  "003927": 255.0,
  "003928": 270.0,
  "003929": 285.0,
  "003962": 2590.0,
  // Filters (netto prijzen staan al in Exact Online)
  "002887": null,
  "003150": null,
  "003151": null,
  "003152": null,
  "003153": null,
  "003154": null,
  "003155": null,
  "003156": null,
  "003157": null,
  "003158": null,
  "003159": null,
  "003160": null,
  "003161": null,
  "003164": null,
  "003165": null,
  "003166": null,
  "003167": null,
  "003168": null,
  "003169": null,
  "003170": null,
  "003171": null,
  "003172": null,
  "003173": null,
  "003174": null,
  "003175": null,
  "003176": null,
  "003177": null,
  "003178": null,
  "003179": null,
  "003180": null,
  "003181": null,
  "003182": null,
  "003183": null,
  "003184": null,
  "003185": null,
  "003187": null,
  "003188": null,
  "003189": null,
  "003190": null,
  "003191": null,
  "003192": null,
  "003193": null,
  "003194": null,
  "003195": null,
  "003196": null,
  "003197": null,
  "003198": null,
  "003199": null,
  "003200": null,
  "003206": null,
  "003207": null,
  "003209": null,
  "003210": null,
  "003211": null,
  "003212": null,
  "003213": null,
  "003214": null,
  "003215": null,
  "003216": null,
  "003217": null,
  "003218": null,
  "003219": null,
  "003220": null,
  "003221": null,
  "003222": null,
  "003223": null,
  "003224": null,
  "003227": null,
  "003228": null,
  "003229": null,
  "003230": null,
  "003231": null,
  "003232": null,
  "003233": null,
  "003234": null,
  "003235": null,
  "003236": null,
  "003237": null,
  "003238": null,
  "003239": null,
  "003240": null,
  "003241": null,
  "003242": null,
  "003243": null,
  "003244": null,
  "003245": null,
  "003246": null,
  "003247": null,
  "003248": null,
  "003249": null,
  "003250": null,
  "003251": null,
  "003252": null,
  "003253": null,
  "003254": null,
  "003255": null,
  "003256": null,
  "003257": null,
  "003258": null,
  "003259": null,
  "003260": null,
  "003261": null,
  "003262": null,
  "003265": null,
  "003266": null,
  "003267": null,
  "003268": null,
  "003269": null,
  "003270": null,
  "003271": null,
  "003272": null,
  "003273": null,
  "003274": null,
  "003275": null,
  "003276": null,
  "003277": null,
  "003278": null,
  "003279": null,
  "003280": null,
  "003281": null,
  "003282": null,
  "003283": null,
  "003284": null,
  "003285": null,
  "003286": null,
  "003287": null,
  "003288": null,
  "003289": null,
  "003290": null,
  "003291": null,
  "003292": null,
  "003293": null,
  "003294": null,
  "003295": null,
  "003296": null,
  "003297": null,
  "003298": null,
  "003299": null,
  "003300": null,
  "003301": null,
  "003302": null,
  "003303": null,
  "003304": null,
  "003305": null,
  "003306": null,
  "003307": null,
  "003309": null,
  "003310": null,
  "003311": null,
  "003312": null,
  "003313": null,
  "003314": null,
  "003315": null,
  "003316": null,
  "003317": null,
  "003318": null,
  "003319": null,
  "003320": null,
  "003321": null,
  "003322": null,
  "003323": null,
  "003324": null,
  "003325": null,
  "003326": null,
  "003327": null,
  "003328": null,
  "003329": null,
  "003330": null,
  "003331": null,
  "003332": null,
  "003333": null,
  "003334": null,
  "003335": null,
  "003336": null,
  "003337": null,
  "003338": null,
  "003339": null,
  "003340": null,
  "003341": null,
  "003342": null,
  "003344": null,
  "003345": null,
  "003346": null,
  "003347": null,
  "003348": null,
  "003349": null,
  "003350": null,
  "003351": null,
  "003353": null,
  "003354": null,
  "003355": null,
  "003356": null,
  "003357": null,
  "003358": null,
  "003359": null,
  "003360": null,
  "003361": null,
  "003362": null,
  "003363": null,
  "003372": null,
  "003373": null,
  "003375": null,
  "003376": null,
  "003451": null,
  "003452": null,
  "003453": null,
  "003454": null,
  "003455": null,
  "003456": null,
  "003457": null,
  "003458": null,
  "003459": null,
  "003460": null,
  "003461": null,
  "003462": null,
  "003464": null,
  "003465": null,
  "003466": null,
  "003467": null,
  "003468": null,
  "003469": null,
  "003470": null,
  "003471": null,
  "003472": null,
  "003473": null,
  "003474": null,
  "003475": null,
  "003476": null,
  "003477": null,
  "003478": null,
  "003479": null,
  "003480": null,
  "003481": null,
  "003482": null,
  "003483": null,
  "003484": null,
  "003485": null,
  "003486": null,
  "003487": null,
  "003488": null,
  "003489": null,
  "003490": null,
  "003491": null,
  "003492": null,
  "003493": null,
  "003494": null,
  "003495": null,
  "003496": null,
  "003497": null,
  "003498": null,
  "003499": null,
  "003500": null,
  "003501": null,
  "003502": null,
  "003503": null,
  "003509": null,
  "003511": null,
  "003512": null,
  "003513": null,
  "003514": null,
  "003611": null,
  "003612": null,
  "003698": null,
  "004128": null,
  "004129": null,
  "004130": null,
  "004131": null,
  "004132": null,
  "004133": null,
  "004134": null,
  "004135": null,
  "004136": null,
  "004137": null,
  "004140": null,
  "004141": null,
  "004142": null,
  "004143": null,
  "004144": null,
  "004145": null,
  "004146": null,
  "004147": null,
};

  function norm(s) {
    return (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  function findCustomerRule(customerName) {
    const target = norm(customerName);
    if (!target) return null;
    // 1) probeer eerst een match op de HOOFDnaam (names[0]) van elke klant
    for (const c of CUSTOMERS) {
      const primary = norm(c.names[0]);
      if (!primary) continue;
      if (target === primary || target.startsWith(primary) || primary.startsWith(target)) {
        if (Math.min(primary.length, target.length) >= 4) return c;
      }
    }
    // 2) anders, probeer een match op bijnamen / "idem"-aliassen
    for (const c of CUSTOMERS) {
      for (let i = 1; i < c.names.length; i++) {
        const alt = norm(c.names[i]);
        if (!alt) continue;
        if (target === alt || target.startsWith(alt) || alt.startsWith(target)) {
          if (Math.min(alt.length, target.length) >= 4) return c;
        }
      }
    }
    return null;
  }

  function fmt(n) {
    return n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function setFieldValue(el, value) {
    if (!el) return;
    const proto = Object.getPrototypeOf(el);
    const setter = Object.getOwnPropertyDescriptor(proto, 'value') &&
      Object.getOwnPropertyDescriptor(proto, 'value').set;
    if (setter) setter.call(el, value); else el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Tab' }));
    el.blur();
  }

  // Logt een diagnostische melding max. 1x per unieke situatie (voorkomt spam in de console
  // omdat scanAllRows() elke 1,5s opnieuw draait).
  const _loggedOnce = new Set();
  function debugOnce(key, msg) {
    if (_loggedOnce.has(key)) return;
    _loggedOnce.add(key);
    console.warn(msg);
  }

  function flashRow(el, msg) {
    const row = el.closest('tr');
    if (!row) return;
    row.style.backgroundColor = '#d9ecff';
    row.title = msg;
    // Blijft lichtblauw staan (geen automatisch terugzetten meer) zodat je
    // tijdens het hele invullen van de order kan zien welke regels aangepast zijn.
  }

  function rowIndexFromId(id) {
    const m = id.match(/^grd_r(\d+)_/);
    return m ? m[1] : null;
  }

  function getCurrentCustomerName(doc) {
    const el = doc.getElementById('OrderAccount_ref');
    return el ? el.textContent.trim() : '';
  }

  function findOrderDoc() {
    // Werkt zowel wanneer het script rechtstreeks in het bestelformulier-frame draait
    // (document bevat de grd_r... velden zelf) als wanneer het in de buitenste pagina
    // draait (met het formulier in een iframe met id "MainWindow").
    if (document.getElementById('OrderAccount_ref') || document.querySelector('input[id^="grd_r"][id$="_Item_alt"]')) {
      return document;
    }
    const iframe = document.getElementById('MainWindow');
    return (iframe && iframe.contentDocument) || null;
  }

  function ruleToPriceAndPct(rule, article) {
    let price = null; // null = nettoprijs van Exact niet aanraken
    let pct = rule.pct;

    if (rule.type === 'bruto_ak_pct') {
      price = article.bruto;
      if (rule.useH && typeof article.h_pct === 'number') {
        pct = article.h_pct;
      }
    } else if (rule.type === 'netto_pct') {
      price = null; // eigen nettoprijs van Exact blijft staan
    } else {
      return null;
    }
    return { price, pct };
  }

  function checkAndFixRow(doc, itemAltEl) {
    const idx = rowIndexFromId(itemAltEl.id);
    if (idx === null) return;
    const code = (itemAltEl.value || '').trim();
    if (!code) return;

    // Controleer of dit artikel een VASTE NETTOPRIJS heeft (prijs is al correct in Exact, alleen korting op 0% zetten)
    if (Object.prototype.hasOwnProperty.call(NETTO_VASTE_PRIJZEN, code)) {
      const discEl = doc.getElementById('grd_r' + idx + '_DiscountDisplay');
      const discHiddenEl = doc.getElementById('grd_r' + idx + '_DiscountDisplayHidden');
      if (!discEl) return;

      const targetPctStr = '0,00';
      const reason = '[FEMM] Rij ' + idx + ' (artikel ' + code + '): vaste nettoprijs-artikel - geen korting toegestaan (overrulet alle klantafspraken).';

      const currentPct = (discEl.value || '').trim();

      if (currentPct !== targetPctStr) {
        setFieldValue(discEl, targetPctStr);
        if (discHiddenEl) setFieldValue(discHiddenEl, targetPctStr);
        flashRow(discEl, reason);
      }
      return;
    }
    const article = ARTICLES[code];

    const customerName = getCurrentCustomerName(doc);
    const customer = findCustomerRule(customerName);
    if (!customer) return; // onbekende klant: niets aanpassen, normaal Exact-gedrag

    const priceEl = doc.getElementById('grd_r' + idx + '_PriceFCDisplay');
    const discEl = doc.getElementById('grd_r' + idx + '_DiscountDisplay');
    const discHiddenEl = doc.getElementById('grd_r' + idx + '_DiscountDisplayHidden');
    if (!discEl) {
      debugOnce('nodisc-' + idx, '[FEMM] Rij ' + idx + ' (artikel ' + code + '): kortingsveld grd_r' + idx + '_DiscountDisplay niet gevonden in de pagina - kan deze rij niet aanpassen.');
      return;
    }

    let targetPriceStr = null;
    let targetPctStr = null;
    let reason = '';

    if (article) {
      // Dit is een merk-artikel (Sigma/Nelf/Epifanes)
      const rule = customer.brands[article.brand];
      if (rule) {
        const calc = ruleToPriceAndPct(rule, article);
        if (calc) {
          targetPriceStr = calc.price !== null ? fmt(calc.price) : null;
          targetPctStr = fmt(calc.pct);
          reason = 'Automatisch aangepast: ' + article.brand + ' – klantafspraak ' + customer.names[0] + ' (bruto prijs' + (targetPriceStr !== null ? ' ' + targetPriceStr : ' [Exact eigen nettoprijs]') + ', korting ' + targetPctStr + '%).';
        }
      } else {
        debugOnce('norule-' + idx + '-' + code, '[FEMM] Rij ' + idx + ' (artikel ' + code + ', merk ' + article.brand + '): klant ' + customer.names[0] + ' heeft geen specifieke afspraak voor dit merk - niets aangepast.');
      }
    } else if (customer.general_discount_pct) {
      // Dit is GEEN merk-artikel (Sigma/Nelf/Epifanes), dus algemene korting toepassen (indien gekend)
      targetPctStr = fmt(customer.general_discount_pct);
      reason = 'Automatisch aangepast: algemene klantkorting ' + customer.names[0] + ' (' + targetPctStr + '%).';
    } else {
      debugOnce('nogeneral-' + idx + '-' + code, '[FEMM] Rij ' + idx + ' (artikel ' + code + ', niet in ARTICLES-lijst): klant ' + customer.names[0] + ' heeft geen algemene korting ingesteld - niets aangepast.');
    }

    if (!targetPctStr) return; // niets om aan te passen

    const currentPrice = (priceEl && priceEl.value || '').trim();
    const currentPct = (discEl.value || '').trim();

    let changed = false;

    if (targetPriceStr !== null && priceEl && currentPrice !== targetPriceStr) {
      setFieldValue(priceEl, targetPriceStr);
      changed = true;
    }
    if (currentPct !== targetPctStr) {
      setFieldValue(discEl, targetPctStr);
      if (discHiddenEl) setFieldValue(discHiddenEl, targetPctStr);
      changed = true;
    }

    if (changed) {
      flashRow(discEl, reason);
    }
  }

  function scanAllRows() {
    const doc = findOrderDoc();
    if (!doc) return;
    doc.querySelectorAll('input[id^="grd_r"][id$="_Item_alt"]').forEach(el => checkAndFixRow(doc, el));
  }

  function attachObservers() {
    const doc = findOrderDoc();
    if (!doc || !doc.body || doc.body.dataset.femmObserverAttached2) {
      if (!doc) setTimeout(attachObservers, 1000);
      return;
    }
    doc.body.dataset.femmObserverAttached2 = '1';

    doc.addEventListener('change', (e) => {
      const id = e.target && e.target.id;
      if (!id) return;
      if (id.endsWith('_Item_alt') || id === 'OrderAccount_alt' || id === 'OrderAccount') {
        setTimeout(scanAllRows, 200);
      }
    }, true);

    const observer = new MutationObserver(() => {
      clearTimeout(observer._t);
      observer._t = setTimeout(scanAllRows, 200);
    });
    observer.observe(doc.body, { childList: true, subtree: true });

    setInterval(scanAllRows, 1500);
    setTimeout(scanAllRows, 800);

    console.log('[FEMM] Klant-/merkkorting-script actief voor', Object.keys(ARTICLES).length, 'artikelen en', CUSTOMERS.length, 'klanten met specifieke afspraken.');
  }

  setTimeout(attachObservers, 500);
})();
