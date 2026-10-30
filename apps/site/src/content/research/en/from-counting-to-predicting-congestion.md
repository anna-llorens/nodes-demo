---
title: "From counting to predicting congestion"
subtitle: "Local density, flow and early warning signs in crowds."
description: "Why counting people is not enough to anticipate a dangerous crowd: local density, flow per metre, crowd pressure and the lessons of Jamarat, Itaewon and Hillsborough."
slug: "from-counting-to-predicting-congestion"
date: "2026-10-30"
type: "Research analysis"
category: "crowd"
tags: ["crowd-dynamics", "density", "pedestrian-flow", "safety", "prediction"]
author: "Anna Llorens Roig"
draft: false
card: "prediction"
---

Knowing how many people are in a venue is not enough to anticipate dangerous congestion. What anticipates it is measuring, zone by zone and minute by minute, local density (people per m²), flow per metre of width and how much speeds vary. An occupancy figure that looks fine overall can hide a spot where nobody can move any more.

## Why counting is not enough

An entrance counter tells you how many people have come in, not where they are. And crowds do not spread evenly: they gather in front of stages, exits, stairs and crossings. On the Jamarat Bridge (Mecca, 2006), the video analysis by Helbing and colleagues showed that the maximum local density was double the average: the average rarely went above 6 people/m², but some spots exceeded 10 ([Helbing et al., 2007](https://arxiv.org/pdf/physics/0701203)).

The clearest historical case is Hillsborough (Sheffield, 15 April 1989, 97 dead). The stadium had a computerised system that showed the control room the running total for each turnstile section, but it could not warn that a particular pen had exceeded its safe capacity. Lord Justice Taylor's interim report attributed the immediate cause to three failures: no maximum capacities were set, entry to each pen was not controlled by numbers, and there was no effective visual monitoring of density ([Taylor report](https://en.wikisource.org/wiki/Page:Hillsborough_Taylor_Interim_Report_Cm765.pdf/15)).

The lesson is not to count better, but to measure other things in other places.

## Density: thresholds depend on context

There is no universal figure for dangerous density. Reference values change with four factors:

- **Whether the crowd is walking or standing still.** Walking needs much more space than standing.
- **People's body size.** Helbing and colleagues had to scale their Jamarat densities by 0.7 to compare them with European data, because of differences in body area ([Helbing et al., 2007](https://arxiv.org/pdf/physics/0701203)).
- **Geometry:** bottlenecks, turns, ramps and stairs.
- **The direction of flows.** Opposing flows and crossings reduce capacity.

| Context | Value | What it means | Source |
| --- | --- | --- | --- |
| Walkway, Fruin level A | ≤ 0.3 people/m² | Everyone chooses their speed and overtakes without conflict | [Fruin, 1971](https://onlinepubs.trb.org/Onlinepubs/hrr/1971/355/355-001.pdf) |
| Walkway, Fruin level E | ≈ 1.1–2.2 people/m² | Close to capacity, with frequent stops | [Fruin, 1971](https://onlinepubs.trb.org/Onlinepubs/hrr/1971/355/355-001.pdf) |
| Walkway, Fruin level F | ≥ 2.2 people/m² | Shuffling movement; the flow breaks down | [Fruin, 1971](https://onlinepubs.trb.org/Onlinepubs/hrr/1971/355/355-001.pdf) |
| One-way walking flow | < 0.8 free; 0.8–1.6 risk of instability; > 1.6 congestion almost certain | Transition from stable to congested flow | [Gerlach and Seyfried, Univ. of Wuppertal](https://svpt.uni-wuppertal.de/fileadmin/bauing/svpt/Publikationen/LoPa_EVC_Beitrag_english.pdf) |
| Maximum capacity of a walking flow | ≈ 1.75 people/m² | Density with the highest throughput | Weidmann (1993), in [Gerlach and Seyfried](https://svpt.uni-wuppertal.de/fileadmin/bauing/svpt/Publikationen/LoPa_EVC_Beitrag_english.pdf) |
| Events in general | 2 people/m² | Usual assessment limit | [G. Keith Still](https://www.gkstill.com/Support/crowd-density/CrowdDensity-1.html) |
| Moving queues | 4 people/m² | Reference value for queues | [G. Keith Still](https://www.gkstill.com/Support/crowd-density/CrowdDensity-1.html) |
| Standing, static crowd | 5 people/m² | Upper limit in viewing areas | [G. Keith Still](https://www.gkstill.com/Support/crowd-density/CrowdDensity-1.html) |
| Standing terraces in stadiums (UK) | 4.7 people/m² | Green Guide figure, criticised for not adjusting for body size | [G. Keith Still](https://www.gkstill.com/Support/crowd-density/CrowdDensity-1.html) |
| Jamarat Bridge, local density | > 6 people/m² | Local flow drops to a third or less | [Helbing et al., 2007](https://arxiv.org/pdf/physics/0701203) |
| Itaewon, alley, 22:25 | 9.07–10.74 people/m² | Estimate from the Korean police investigation | [Hankyung](https://www.hankyung.com/article/2023011313587), [Korea Times](https://www.koreatimes.co.kr/southkorea/society/20230113/police-wrap-up-monthslong-probe-into-itaewon-crush-23-officials-referred-to-prosecution) |

Some figures seem to contradict each other: Fruin places flow breakdown around 2.2 people/m², while Still accepts 5 for a standing crowd. It is not a contradiction: the first figure is for people walking and the second for people standing still. That is why a single alarm figure makes no sense.

Fruin's levels are still in use: the New York City Department of City Planning's pedestrian level of service study applies them to sidewalks, corridors and subway stairs ([NYC Planning](https://www.nyc.gov/assets/planning/download/pdf/plans/transportation/td_fullpedlosb.pdf)).

## Flow and the fundamental diagram

Specific flow is the number of people crossing each metre of width per second. It is obtained by multiplying density by speed:

**J = ρ × v**

where *J* is the flow in people/(m·s), *ρ* the density in people/m² and *v* the speed in m/s. The relationship between the three is called the **fundamental diagram**, and its basic shape is always the same:

1. With few people, flow increases as density increases.
2. At a critical point, flow reaches its maximum.
3. Beyond that point, more density means less flow: people keep arriving but fewer leave, and the area fills up faster and faster.

Some reference figures:

- **Weidmann (ETH Zurich, 1993)**, combining 25 datasets: capacity of about 1.22 people/(m·s) at 1.75 people/m² and 0.7 m/s; free walking speed of 1.34 m/s; movement stops at around 5.4 people/m² ([summary in Gerlach and Seyfried](https://svpt.uni-wuppertal.de/fileadmin/bauing/svpt/Publikationen/LoPa_EVC_Beitrag_english.pdf)).
- **Fruin (1971)** measured a maximum flow of about 1.4 people/(m·s) in one-way walkways, and warned that designing for that capacity means a dense crowd and stop-start movement ([Fruin, 1971](https://onlinepubs.trb.org/Onlinepubs/hrr/1971/355/355-001.pdf)).
- **Gerlach and Seyfried**, following the German FGSV EVC guideline: capacity of 1.3–1.6 people/(m·s) at about 1.75 people/m² ([University of Wuppertal](https://svpt.uni-wuppertal.de/fileadmin/bauing/svpt/Publikationen/LoPa_EVC_Beitrag_english.pdf)).
- **G. Keith Still** observes the critical density in moving flows between 2 and 4 people/m², and warns that it changes with the event and the audience ([gkstill.com](https://www.gkstill.com/Support/crowd-flow/MovingDensity.html)).

The diagrams do not agree with each other. According to a review by Seyfried and colleagues, the density of maximum flow ranges from 1.75 to 7 people/m² depending on the study, and the density at which everything stops from 3.8 to 10 people/m² ([review](https://www.researchgate.net/publication/336286296_An_overview_of_fundamental_diagrams_of_pedestrian_dynamics)). Population, culture, geometry and the direction of flows all play a part.

A practical consequence: in bottleneck experiments, **congestion appears before theoretical capacity is reached**. That is why the German guideline recommends sizing passages at the limit of still-stable flow, not at the maximum, and assessing the busiest 2 minutes rather than the hourly average ([Gerlach and Seyfried](https://svpt.uni-wuppertal.de/fileadmin/bauing/svpt/Publikationen/LoPa_EVC_Beitrag_english.pdf)).

## Crowd pressure and turbulence

At very high densities, bodies are in contact and forces are transmitted and add up. Density then stops describing the danger well.

In 2007 Helbing, Johansson and Al-Abideen proposed a finer indicator, **crowd pressure**: local density multiplied by the local variance of speed ([Helbing et al., 2007](https://arxiv.org/pdf/physics/0701203)). It is not the mechanical pressure each person feels, but a measure of how irregular movement is at a dense spot. If everyone moves together at the same pace, variance is low; if each person is pushed in a different direction, it shoots up.

When this pressure exceeded **0.02/s²**, the flow became turbulent: involuntary displacements in all directions, with stumbles and falls spreading around them. The authors warn that the value depends on how local density is measured, specifically on the chosen radius, so it is not a universal constant.

In 2002 Fruin explained how a crowd crush kills: almost all deaths are caused by **compressive asphyxia**, not by the "trampling" the media usually talk about ([Fruin, 2002](https://www.workingwithcrowds.com/wp-content/uploads/2018/02/THE-CAUSES-AND-PREVENTION-OF-CROWD-DISASTERS-by-John-J.-Fruin-Ph.D.-P.E..pdf)).

## Jamarat, 12 January 2006: warning signs that were visible

The Jamarat Bridge disaster in Mina (Mecca) is the best-documented case of early warning signs. The Saudi health minister reported 345 dead on the same day ([RFE/RL](https://www.rferl.org/a/1064646.html)); other, later sources put the figure as high as 363.

Helbing and his team analysed video of a 27.7 × 22.5 m area in front of the bridge entrance and obtained more than 30 million position and speed pairs between 11:45 and 12:30 ([Helbing et al., 2007](https://arxiv.org/pdf/physics/0701203)). This was the sequence:

1. **Around 11:53**, the flow changed from orderly to **stop-and-go waves**, just as the outflow fell below 0.8 people/(m·s). The waves lasted more than 20 minutes.
2. **At 12:19**, with even higher densities, **turbulence** appeared: crowd pressure exceeded 0.02/s².
3. **About 10 minutes later** the disaster began, more than 30 minutes after the flow had dropped below the critical threshold.

Other findings: local densities exceeded 10 people/m²; above 6, local flow dropped to a third or less, so far fewer people were leaving than arriving; and the disaster happened in a flat, open area without significant counterflows.

The authors conclude that these signs can be detected live with automatic video analysis. At the following Hajj, automatic counting with the cameras, one-way circulation, removal of accumulation points and group schedules were introduced; according to the authors themselves, it was a safe Hajj.

## What the disasters teach

In almost all these cases, data or warnings were available. What was missing was turning them into timely decisions.

| Date | Place | What happened | Lesson for measurement |
| --- | --- | --- | --- |
| 29 Jan 2025 | Maha Kumbh Mela, Prayagraj (India) | At least 30 dead and 60 injured according to the Kumbh authorities; around 1:00 the crowd broke through the barriers | There were more than 2,700 cameras, some with AI. Installing cameras is not enough if the data does not lead to timely action; a judicial commission is investigating |
| 29 Oct 2022 | Itaewon, Seoul (South Korea) | 159 dead in a sloping alley 3.2–4 m wide; estimated density of 7.72–8.39 people/m² at 22:15 and 9.07–10.74 at 22:25 ([Hankyung](https://www.hankyung.com/article/2023011313587)) | There were 11 emergency calls between 18:34 and 22:11 ([Korea Times](https://www.koreatimes.co.kr/southkorea/society/20230113/police-wrap-up-monthslong-probe-into-itaewon-crush-23-officials-referred-to-prosecution)). Seoul had a real-time population system based on mobile data, but nobody was monitoring it for safety ([Kyunghyang](https://www.khan.co.kr/article/202210312119015)) |
| 5 Nov 2021 | Astroworld, Houston (USA) | 10 dead; according to the press, the police report describes an audience already dangerously compressed hours before the main act ([Houston Landing](https://www.houstonlanding.org/houston-police-astroworld-report-contains-1266-pages-but-no-blame-for-tragedy/)) | The compression was slow and visible, and staff noticed it |
| 1 Nov 2012 | Madrid Arena, Madrid (Spain) | 5 young women dead; capacity of 10,620 and at least 16,605 attendees; only 3 of 8 vomitories open ([ruling](https://www.icab.es/export/sites/icab/.galleries/documents-noticies/2016/sentencia-488-2016-de-l-audiencia-provincial-de-madrid.-cas-madrid-arena-.pdf), [Público](https://www.publico.es/sociedad/diez-hechos-probados-ocurrio-madrid-arena-sentencia.html)) | Capacity was set per floor, but tickets did not specify a floor and conditions inside were not monitored |
| 24 Jul 2010 | Love Parade, Duisburg (Germany) | 21 dead and more than 500 injured; a single tunnel for entry and exit; turbulence from 16:34; no mobile service from 15:30 to 18:00 and no public address on the ramp ([Helbing and Mukerji, 2012](https://arxiv.org/pdf/1206.5856)) | Without separated flows or communications, the situation was not perceived in time; attempts to escape were seen as indiscipline |
| 12 Jan 2006 | Jamarat Bridge, Mina (Saudi Arabia) | 345–363 dead depending on the source; stop-and-go waves followed by turbulence | Flow and pressure indicators gave between 10 and 30 minutes of warning ([Helbing et al., 2007](https://arxiv.org/pdf/physics/0701203)) |
| 15 Apr 1989 | Hillsborough Stadium, Sheffield (UK) | 97 dead; the central pens were overfilled when gate C was opened | Counting by turnstile section did not warn of a full pen: measurement per zone was needed ([Taylor report](https://en.wikisource.org/wiki/Page:Hillsborough_Taylor_Interim_Report_Cm765.pdf/15)) |

After Itaewon, since March 2024 Korea has required local governments to prepare safety plans for large gatherings even when there is no organiser. For Halloween 2026, Seoul is assigning 361 of its 1,094 cameras with crowd detection to the party areas, with automatic alerts at around 5–6 people/m² ([Aju Press](https://www.ajupress.com/view/20261028164131128)).

## What the rules say in Spain

Spanish regulations require **calculating and planning capacity**, not measuring actual density during the event.

- **Royal Decree 393/2007, Basic Self-Protection Standard.** Among others, it requires a self-protection plan for outdoor activities with 20,000 or more attendees and indoor shows with 2,000 or more. The plan must identify and quantify the people who may be present ([BOE](https://www.boe.es/buscar/act.php?id=BOE-A-2007-6237), in Spanish). Some city councils lower the threshold; Zaragoza sets it at 10,000 attendees ([Zaragoza City Council](https://www.zaragoza.es/sede/servicio/tramite/4032), in Spanish).
- **Valencian Community.** Shows on public roads with more than 1,000 expected people need municipal authorisation and must meet capacity and evacuation requirements ([Generalitat Valenciana](https://comunica.gva.es/es/detalle?id=377011872&site=373422856), in Spanish). Order 3/2025 on opening hours also sets how far in advance doors must open depending on capacity: for example, 2 hours between 15,000 and 35,000 people and 4 hours above 75,000 ([DOGV](https://dogv.gva.es/datos/2025/12/22/pdf/2025_48041_es.pdf), in Spanish).

In short, the rules ask how many people fit and how they get out. They do not ask how many people are in each zone right now or how fast it is filling up. The gap is not only Spanish: Gerlach and Seyfried point out that, worldwide, regulations mainly cover emergencies and say very little about the ordinary operation of flows ([University of Wuppertal](https://svpt.uni-wuppertal.de/fileadmin/bauing/svpt/Publikationen/LoPa_EVC_Beitrag_english.pdf)).

## Which indicators help anticipate

No single indicator is enough. These are the most useful, from simplest to most complex:

1. **Local density, not average density.** Measured in small cells, a few metres across, at critical points: bottlenecks, stage fronts, entrances and stairs.
2. **Throughput per metre of width** at each critical section, compared with a stable design value and not with maximum capacity. If throughput falls while density rises, that section has already moved to the congested side of the fundamental diagram.
3. **Net accumulation per zone:** entries minus exits. At the Love Parade, between 14:00 and 15:00, 280–600 people per minute were entering one area and 6–80 were leaving ([Helbing and Mukerji, 2012](https://arxiv.org/pdf/1206.5856)).
4. **Time to a threshold.** Combines the two previous indicators and turns the data into a deadline for decisions. For example: a 400 m² zone with a threshold of 4 people/m² holds 1,600 people; if there are 800 and a net 100 enter per minute, about 8 minutes remain.
5. **Stop-and-go waves.** They show that fewer people are leaving than arriving. At Jamarat they appeared more than 30 minutes before the disaster.
6. **Speed variance and crowd pressure.** They detect the transition to turbulence; at Jamarat the disaster came about 10 minutes later.
7. **Counterflows and crossings.** They reduce capacity and destabilise the flow; after Jamarat and the Love Parade, one-way circulation became the norm.
8. **Human signals:** emergency calls, people climbing fences or poles, screaming. At Itaewon and Duisburg they appeared before the outcome; they are data, not noise.

Recent research is moving in this direction, though with little field evidence. A 2026 systematic review concludes that crowd crushes are largely preventable with integrated strategies, but it finds only two studies that tested early warning systems ([Chowhan et al., *Public Health Reviews*, 2026](https://www.ssph-journal.org/journals/public-health-reviews/articles/10.3389/phrs.2026.1609310/full)).

## Conclusion

Counting answers how many people there are. Safety needs to know where they are, how fast they are arriving and how they are moving. Crowd science does not offer a magic number, but a logic: watch local density with thresholds adapted to whether the crowd is walking or standing, measure flow per metre against a stable value, and treat stop-and-go waves and irregular speeds as early alarms.

## Limits of this data

- **Thresholds depend on the method.** Helbing's figures depend on the measurement radius; Fruin's come from US commuters in 1971; Weidmann's combine heterogeneous studies. None should be applied without adapting it to the audience and the space.
- **Some figures are only in secondary sources:** the Jamarat death toll, the details of the Astroworld report (known through the press) and the number of cameras at the Kumbh Mela.
- **Some data differs between sources:** the number injured at the Love Parade (more than 500 or more than 650), the dimensions of its ramp and the width of the Itaewon alley (from about 3 to about 4 m).
- **No case allows us to claim that a particular technology would have prevented the disaster.** The analyses attribute these disasters to chains of failures in planning, communication and decision-making.

## Sources

- Helbing, Johansson and Al-Abideen (2007). [Dynamics of crowd disasters: An empirical study](https://arxiv.org/pdf/physics/0701203). *Physical Review E* 75, 046109.
- Helbing and Mukerji (2012). [Crowd disasters as systemic failures: analysis of the Love Parade disaster](https://arxiv.org/pdf/1206.5856).
- Fruin (1971). [Designing for pedestrians: A level-of-service concept](https://onlinepubs.trb.org/Onlinepubs/hrr/1971/355/355-001.pdf). *Highway Research Record* 355.
- Fruin (2002). [The Causes and Prevention of Crowd Disasters](https://www.workingwithcrowds.com/wp-content/uploads/2018/02/THE-CAUSES-AND-PREVENTION-OF-CROWD-DISASTERS-by-John-J.-Fruin-Ph.D.-P.E..pdf).
- Gerlach and Seyfried, University of Wuppertal. [Love Parade and the FGSV EVC guideline](https://svpt.uni-wuppertal.de/fileadmin/bauing/svpt/Publikationen/LoPa_EVC_Beitrag_english.pdf).
- [An overview of fundamental diagrams of pedestrian dynamics](https://www.researchgate.net/publication/336286296_An_overview_of_fundamental_diagrams_of_pedestrian_dynamics).
- G. Keith Still. [Crowd density](https://www.gkstill.com/Support/crowd-density/CrowdDensity-1.html) and [moving density](https://www.gkstill.com/Support/crowd-flow/MovingDensity.html).
- NYC Department of City Planning. [Pedestrian Level of Service Study](https://www.nyc.gov/assets/planning/download/pdf/plans/transportation/td_fullpedlosb.pdf).
- Lord Justice Taylor (1989). [Hillsborough Stadium Disaster, interim report](https://en.wikisource.org/wiki/Page:Hillsborough_Taylor_Interim_Report_Cm765.pdf/15).
- RFE/RL (2006). [Jamarat disaster figures](https://www.rferl.org/a/1064646.html).
- Provincial Court of Madrid. [Ruling 488/2016, Madrid Arena](https://www.icab.es/export/sites/icab/.galleries/documents-noticies/2016/sentencia-488-2016-de-l-audiencia-provincial-de-madrid.-cas-madrid-arena-.pdf) (in Spanish); [proven facts in Público](https://www.publico.es/sociedad/diez-hechos-probados-ocurrio-madrid-arena-sentencia.html) (in Spanish).
- Houston Landing (2023). [Astroworld police report](https://www.houstonlanding.org/houston-police-astroworld-report-contains-1266-pages-but-no-blame-for-tragedy/).
- Itaewon: [Korea Times, end of the police investigation](https://www.koreatimes.co.kr/southkorea/society/20230113/police-wrap-up-monthslong-probe-into-itaewon-crush-23-officials-referred-to-prosecution); [Hankyung](https://www.hankyung.com/article/2023011313587) (in Korean); [Kyunghyang Shinmun](https://www.khan.co.kr/article/202210312119015) (in Korean); [Aju Press, 2026](https://www.ajupress.com/view/20261028164131128).
- [Royal Decree 393/2007, Basic Self-Protection Standard](https://www.boe.es/buscar/act.php?id=BOE-A-2007-6237) (BOE, in Spanish).
- Generalitat Valenciana. [Note on the festivities circular](https://comunica.gva.es/es/detalle?id=377011872&site=373422856) and [Order 3/2025 on opening hours](https://dogv.gva.es/datos/2025/12/22/pdf/2025_48041_es.pdf) (in Spanish).
- Chowhan, Hudda, Sharma and Bhardwaj (2026). [Systematic review on preventing crowd crushes](https://www.ssph-journal.org/journals/public-health-reviews/articles/10.3389/phrs.2026.1609310/full). *Public Health Reviews* 47.
