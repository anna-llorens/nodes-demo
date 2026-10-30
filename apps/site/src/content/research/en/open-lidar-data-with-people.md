---
title: "Open LiDAR data with people"
subtitle: "What exists, what is missing, and why it matters for measuring crowds."
description: "A review of open LiDAR datasets with people: none reaches the density of a serious crowd. What is missing, how the gap is filled today and what a good dataset should look like."
slug: "open-lidar-data-with-people"
date: "2026-10-30"
type: "Data review"
category: "lidar"
tags: ["lidar", "open-data", "datasets", "privacy", "crowds"]
author: "Anna Llorens Roig"
draft: false
card: "openData"
---

Algorithms for detecting people in point clouds have improved a great deal, but almost all of them were trained on data recorded from cars or robots, on streets with few people. For measuring real crowds with fixed sensors, open data is scarce, and most of it cannot be used outside research. That is the main bottleneck in the field today, and also an opportunity for anyone who wants to contribute.

## What makes a dataset useful for studying crowds

Not all data with people in it serves the same purpose. To measure and anticipate crowding, five things matter:

1. **Where the sensor looks from.** A LiDAR on a car roof sees pedestrians from the side and at low height; a fixed one on a lamppost or ceiling sees them from above, where they occlude each other less. A model trained on one viewpoint performs worse on the other.
2. **How many people there are.** Most driving scenes have few people per frame. A standing crowd at 4–5 people per m² is a different problem: bodies touch and clusters of points merge.
3. **What is labelled.** Counting needs one box per person; studying flows needs identifiers that follow each person over time; validating densities needs reference counts per zone.
4. **How long it lasts.** Crowds build up over minutes or hours. Clips of a few seconds are enough for detection, not for studying how a crowd evolves.
5. **What licence it has.** A non-commercial licence allows research but not use in a product; an open licence such as CC BY allows both, with attribution.

## The map of what exists

We found no open LiDAR dataset that reaches the density of a serious crowd (4–5 people per m²). The closest one with a published figure in people per m² is CrowdBot, recorded at markets in Lausanne, with up to 1 person per m². Review carried out on 30 October 2026; licences marked "not stated" do not appear in the paper or on the page we could open.

![Minimum distance distribution between people in CrowdBot, SCAND and JRDB, at low, medium and high density](../../../assets/research/open-data-crowdbot-distance.png)

*Minimum distance for pedestrians not interacting with the robot (green), pedestrians interacting with it (orange) and the robot itself (yellow), at three density levels in CrowdBot, SCAND and JRDB. This is the kind of behavioural analysis a well-documented open dataset makes possible. Source: [CrowdBot v2, EPFL (Zenodo)](https://zenodo.org/records/17730560), CC BY 4.0.*

| Dataset | Sensor and mounting | Scene | Size | How many people | Licence |
| --- | --- | --- | --- | --- | --- |
| [CrowdBot v2](https://zenodo.org/records/17730560) (EPFL, 2025) | 2 Velodyne VLP-16 on a robot | Weekly and Christmas markets in Lausanne | About 250,000 frames, about 200 min | 0.1–1.0 people/m² | CC BY 4.0 |
| [PointCloudPeople](https://huggingface.co/datasets/LukasPro/PointCloudPeople) (2025) | Blickfeld Qb2, fixed | A single measurement point | About 2,000 clouds, 110 GB | At least 1 person per cloud | CC BY 4.0 |
| [JRDB](https://jrdb.erc.monash.edu/) (Stanford and Monash) | 2 16-beam Velodyne on a robot | 30 locations on a campus | 64 min, 1.8 million 3D boxes | Over 200 people in view in the busiest scenes | CC BY-NC-SA 3.0 |
| [STCrowd](https://arxiv.org/pdf/2204.01026) (CVPR 2022) | 128-beam Ouster on a vehicle | Campus and streets, in rain and sun | 10,891 frames, 219,000 pedestrians | 20 per frame on average, over 30 in the densest | Not stated |
| [HuCenLife](https://arxiv.org/pdf/2307.14392) (ICCV 2023) | Ouster OS1-128, fixed rig | Shopping mall, campus, park, gym | 6,185 frames, 65,265 people | About 11 per scene, peaks of 70 | Not stated |
| [PCP-MV](https://arxiv.org/abs/2505.16029) (2025) | Livox and cameras on a vehicle | Streets in China chosen for their density | 10,966 frames | Measures local density: 3.8 vs 0.7 in nuScenes | Not stated; unclear whether it will be released |
| [IMPTC](https://arxiv.org/html/2307.06165v1) (2023) | 3 LiDAR on lampposts at 5 m | Signalised urban intersection | About 8 h, 2,500 pedestrian and cyclist trajectories | Few people at a time | Non-commercial research only |
| [TUMTraf / A9](https://github.com/tum-traffic-dataset/tum-traffic-dataset-dev-kit) (TU Munich, 2023) | 2 Ouster OS1-64 on a gantry at 7 m | Intersection in Garching | 4,800 frames, 38,045 objects | Only 2,507 are pedestrians | CC BY-NC-ND 4.0 |
| [nuScenes](https://arxiv.org/pdf/1903.11027) (driving reference) | 32-beam LiDAR on a car | Boston and Singapore | 1,000 scenes, 1.4 million boxes | About 7 pedestrians per keyframe | CC BY-NC-SA 4.0 |
| [LiDAR-CS](https://arxiv.org/html/2301.12515v2) (2023) | Simulated, 6 sensor patterns, one Livox | Real backgrounds with CAD objects | 84,000 frames, 230,000 pedestrians | Synthetic | Not stated |

**The two densest real-crowd datasets do not use LiDAR.** The [Fête des Lumières dataset from Lyon](https://arxiv.org/pdf/2410.05288) (*Scientific Data*, 2025) records about 7,000 trajectories at densities of up to 4 people per m², but with overhead cameras, a camera on the city hall tower and phone GPS. The [Jülich pedestrian dynamics archive](https://arxiv.org/pdf/2303.02319) gathers laboratory experiments with about 1,000 participants, recorded with 21 overhead cameras and motion sensors.

**The real systems with the most LiDAR do not publish data.** Nagoya station has 20 LiDAR in its concourse and Osaka University a testbed with 70; neither shares its point clouds. The Nagoya authors note that there are no public point-cloud datasets of stations ([Hishida et al.](https://www.its-jp.org/wp-content/uploads/2025/12/2025-1-A-08_paper.pdf)). The [ATC](https://dil.atr.jp/crest2010_HRI/ATC_dataset) dataset from Osaka covered 900 m² of a shopping centre with 49 3D sensors for 92 days, but it publishes trajectories, not point clouds.

## What is missing

**1. Real density.** Open LiDAR datasets stay at around 1 person per m². Safety guidance starts to worry from 2 and speaks of serious risk between 4 and 5. The range that most needs measuring is exactly the one with no data. At those densities bodies occlude each other, point clouds merge and detectors trained on isolated pedestrians fail; without real data there is no way of knowing by how much. Occlusion affects the camera and the LiDAR alike, and it already appears at about 20 people per frame ([Cong et al., STCrowd](https://arxiv.org/pdf/2204.01026)).

**2. Fixed, elevated sensors.** Most data comes from cars or robots moving at waist height. A fixed sensor on a pole or ceiling sees the scene from above, with less occlusion and a background that does not change. The few datasets with a fixed sensor (IMPTC, TUMTraf, HuCenLife) look at traffic intersections or scenes with a few dozen people.

**3. Pedestrians in quantity.** In driving data, people are a minority. In TUMTraf, under 7 % of annotated objects are pedestrians (2,507 of 38,045, our calculation). nuScenes has about 7 pedestrians per keyframe.

**4. Long durations.** Studying how a crowd builds up requires hours of continuous recording at the same place: arrival, peak and departure. Almost all datasets are clips of seconds or minutes. ATC from Osaka does cover months, but only publishes trajectories.

**5. Licences that allow building things.** Of the datasets reviewed, only CrowdBot v2 and PointCloudPeople allow commercial use (CC BY 4.0). The rest are non-commercial, no-derivatives or available on request. This holds back collaboration between universities and companies, which is exactly where the technology gets tested on the street.

**6. Ground truth.** Many annotations are automatic detections or hand-drawn boxes in quiet scenes. What is missing is data with an independent count (people counted at a gate, for example) to compare against.

This is not just our impression. A 2026 review of LiDAR for crowd management ([Khanfor et al., *IEEE Internet of Things Magazine*](https://arxiv.org/abs/2603.27663)) names the lack of real crowd data as one of the field's main obstacles, alongside the cost of processing and of the sensor.

## How the gap is filled today

If real data does not exist, it gets manufactured. There are four routes, each with its catch.

**Driving simulators.** [CARLA](https://carla.readthedocs.io/en/latest/ref_sensors/), which is open source, includes a LiDAR that casts rays over a 3D scene with animated pedestrians. It makes it easy to generate thousands of labelled frames, but the pedestrians are generic models and the sensor does not reproduce noise, missed returns or the reflectivity of real clothing well.

**Physical LiDAR simulators.** [HELIOS++](https://github.com/3dgeo-heidelberg/helios), from Heidelberg University, simulates the beam and the sensor trajectory with more physical realism. It was built for topography and vegetation, not crowds, so people have to be added by hand.

**Mixing real and synthetic.** [LiDAR-CS](https://arxiv.org/html/2301.12515v2) places synthetic objects on real backgrounds and renders the same scene with six sensor patterns, to study what happens when the LiDAR changes. A 2026 study with a MEMS LiDAR ([arXiv 2602.01764](https://arxiv.org/abs/2602.01764)) combines about 2,100 real clouds with as many synthetic ones, precisely to comply with the GDPR without recording so many people. [Paved2Paradise](https://arxiv.org/abs/2312.01117) proposes recording people separately in an empty car park and pasting them onto other backgrounds; it publishes the method, not a dataset.

**Laboratory experiments.** Pedestrian dynamics groups, such as the one at [Jülich](https://ped.fz-juelich.de/da/doku.php), have spent years running experiments with hundreds of volunteers in corridors, bottlenecks and crossings. The data is open and very valuable, but it is recorded with cameras and volunteers behave like volunteers: no hurry, no alcohol, no closed exit.

The common catch is the same: **a model trained on clean data can fail exactly when the scene gets difficult**. Synthetic data is a good starting point, but it does not replace validation with real people and an independent count.

## What a good fixed-LiDAR crowd dataset should look like

For anyone who wants to fill the gap, this would be a reasonable list:

- **Fixed, elevated sensors**, at the height of a pole or lamppost, with several overlapping viewpoints. And with mounting metadata: height, tilt, position and calibration between sensors.
- **Real densities**, at least up to 3–4 people per m², recorded at events, stations or venue exits, not in experiments.
- **An independent count**: people counted at an entrance, turnstiles or a manual count on video, so the error can be measured.
- **Continuous hours**, covering arrival, peak and dispersal, under different conditions (night, rain, winter clothing).
- **Several sensors**, because 16–128-beam mechanical LiDAR and non-repetitive scan patterns (Livox-style) see the same person very differently.
- **An open licence**, ideally CC BY 4.0, so universities and companies can work with the same data.

### The privacy problem

For years LiDAR has been described as anonymous because it does not see faces. That can no longer be said without qualification. [LidarGait](https://arxiv.org/abs/2211.10598) (CVPR 2023) recognises people by their gait in point clouds, with 1,050 subjects. [ReID3D](https://arxiv.org/abs/2312.03033) (CVPR 2024) re-identifies 320 people recorded with four Livox LiDAR with 94 % accuracy at the first attempt. And a 2026 KIT study with 199 participants ([MultiGait](https://arxiv.org/abs/2609.01036)) concludes that LiDAR does not protect identity better than video when gait is analysed.

Publishing point clouds of real people therefore means publishing data that may be personal. There are intermediate options:

- publishing **cropped or lower-resolution clouds**, with only each person's box and no long sequences of the same individual;
- publishing **aggregated trajectories and densities**, as ATC from Osaka does;
- giving access to full clouds **under a data-use agreement**, as JRDB or SUSTech1K do;
- and carrying out an **impact assessment** before recording, with visible signage on site.

None is perfect, but leaving the field without data is not either: these systems are being installed anyway, and without open data nobody can check how accurate they are.

### An opportunity to collaborate

No single group can build a dataset like this alone. It needs event organisers or station operators who grant access, 3D perception researchers who annotate and compare methods, crowd dynamics specialists who define what to measure, and lawyers who design how to publish it. If you work in any of these fields and are interested, this is one of the pieces most needed.

## Sources

**LiDAR datasets with people**

- [CrowdBot v2, EPFL (Zenodo)](https://zenodo.org/records/17730560)
- [PointCloudPeople, Hugging Face](https://huggingface.co/datasets/LukasPro/PointCloudPeople) · Haas et al., *Sensors* 25(10):3114, 2025
- [JRDB, Stanford and Monash](https://jrdb.erc.monash.edu/)
- [STCrowd, CVPR 2022](https://arxiv.org/pdf/2204.01026)
- [HuCenLife, ICCV 2023](https://arxiv.org/pdf/2307.14392)
- [PCP-MV, 2025](https://arxiv.org/abs/2505.16029)
- [IMPTC, 2023](https://arxiv.org/html/2307.06165v1)
- [TUMTraf / A9, TU Munich](https://github.com/tum-traffic-dataset/tum-traffic-dataset-dev-kit)
- [nuScenes, Caesar et al.](https://arxiv.org/pdf/1903.11027)
- [LiDAR-CS, 2023](https://arxiv.org/html/2301.12515v2)
- [ATC, Osaka](https://dil.atr.jp/crest2010_HRI/ATC_dataset)

**Real crowds without LiDAR**

- [Fête des Lumières, Lyon](https://arxiv.org/pdf/2410.05288) (*Scientific Data*, 2025)
- Jülich pedestrian dynamics archive: [website](https://ped.fz-juelich.de/da/doku.php) · [paper](https://arxiv.org/pdf/2303.02319)

**Systems without published data, and reviews**

- [Hishida et al., Nagoya station](https://www.its-jp.org/wp-content/uploads/2025/12/2025-1-A-08_paper.pdf) (ITS Japan, 2025)
- Khanfor et al., [*LiDAR for Crowd Management*](https://arxiv.org/abs/2603.27663), IEEE IoT Magazine, 2026

**Simulation and synthetic data**

- [CARLA, sensors](https://carla.readthedocs.io/en/latest/ref_sensors/)
- [HELIOS++](https://github.com/3dgeo-heidelberg/helios)
- [MEMS LiDAR and synthetic data, 2026](https://arxiv.org/abs/2602.01764)
- [Paved2Paradise](https://arxiv.org/abs/2312.01117)

**Privacy and re-identification**

- [LidarGait, CVPR 2023](https://arxiv.org/abs/2211.10598)
- [ReID3D, CVPR 2024](https://arxiv.org/abs/2312.03033)
- [MultiGait, KIT 2026](https://arxiv.org/abs/2609.01036)

*Review carried out on 30 October 2026. Licences and figures may change; check each dataset's page before using it.*
