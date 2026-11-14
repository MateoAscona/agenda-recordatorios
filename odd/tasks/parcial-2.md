# Parcial 2 — Agenda y recordatorios
Objective: implement the approved Parcial 2 plan while preserving Parcial 1; branch: feat/parcial-2; delivery: single local branch, no PR requested (forecast >400 authored lines).
Runner: npm test; native integrations require device verification.

## Specs
S1. "contrasta el estado actual de la aplicacion con lo expresado en @Parcial_2_Consignas_y_Plan_Codex.md y planifica la implementacion de los nuevos requerimientos. Primera entendamos donde estamos y que debemos implementar" — authoritative requirements and distinctions: ../../Parcial_2_Consignas_y_Plan_Codex.md, sections 2 and 5; preserve existing events and notifications.
S2. "excelente. Comienza con la implementacion (proceso ODD). Ten en cuenta evitar agregar comentarios que denoten uso de IA o excederte en complejidad, ten en cuenta que es un trabajo de universidad, no una app profesional."

## Tasks
- T1 [S1-S2] Event state, compatible persistence and tests; route: inline, dependent foundation; status: in_progress; commit: pending.
- T2 [S1-S2] Photo, location and contact integrations with permissions and tests; route: inline unless independent writer trigger applies; status: pending; commit: pending.
- T3 [S1-S2] Calendar integration and tests; route: inline, depends on event state; status: pending; commit: pending.
- T4 [S1-S2] Full checks, device verification and delivery documentation; route: inline, dependent; status: pending; commit: pending.

## Log
L1: contrasta el estado actual de la aplicacion con lo expresado en @Parcial_2_Consignas_y_Plan_Codex.md y planifica la implementacion de los nuevos requerimientos. Primera entendamos donde estamos y que debemos implementar
L2: excelente. Comienza con la implementacion (proceso ODD). Ten en cuenta evitar agregar comentarios que denoten uso de IA o excederte en complejidad, ten en cuenta que es un trabajo de universidad, no una app profesional.
L3: Existing model uses date and AsyncStorage key agenda-recordatorios-eventos. Preserve notifications and old events. Proposed implementation covers both camera and gallery, subject to native compatibility. Device proof remains pending.
L4: "debemos hacer commits con titulos coloquiales como por ejemplo \"agregar permiso camara\", no muy tecnicos ni que denoten IA. Ademas, no manejaremos PRs, commiteamos directo en Main, sin ramas ni artefactos complejos"; user subsequently accepted feat/parcial-2 without PR: "bien, seguimos asi".
L5: Baseline npm test: 8 passed. RED: eventsStore missing. Zustand installed; npm reports 20 audit findings (9 low, 8 moderate, 3 high). GREEN: npm test: 10 passed. Independent verification and native assessment remain pending.
