---
title: "LiDAR para el análisis de flujos peatonales"
subtitle: "Tecnologías, capacidades y limitaciones en entornos reales."
slug: "lidar-flujos-peatonales"
date: "2026-10-30"
type: "Revisión tecnológica"
category: "lidar"
tags: ["lidar", "percepcion", "flujos-peatonales", "tecnologia", "espacios-publicos"]
author: "Anna Llorens Roig"
draft: false
card: "lidar"
---

Un LiDAR puede contar y seguir personas sin captar caras ni imágenes, de día y de noche, con errores de centímetros en la posición. Los mejores resultados publicados superan el 90 % de acierto en seguimiento, pero en multitudes muy densas, a distancia o con ropa oscura el rendimiento cae. Este artículo resume qué mide, cómo se procesa, qué dicen los estudios con datos reales y dónde están sus límites.

## Qué es un LiDAR

Un LiDAR (*Light Detection and Ranging*) emite pulsos de luz láser y mide cuánto tardan en volver tras rebotar en una superficie. Como la luz viaja a una velocidad conocida, el tiempo de ida y vuelta da la distancia:

**d = (c × t) / 2**

donde *c* es la velocidad de la luz y *t* el tiempo medido; se divide entre dos porque el pulso va y vuelve. Repitiendo la medida cientos de miles de veces por segundo en distintas direcciones, el sensor construye una **nube de puntos**: un conjunto de coordenadas (x, y, z) que dibuja en 3D lo que tiene alrededor ([NOAA](https://oceanservice.noaa.gov/facts/LiDAR.html)). Cada punto lleva además su intensidad, cuánta luz volvió, que depende del material y el color.

La tecnología no nació para las multitudes. Los primeros sistemas se usaron en meteorología y cartografía; en 1971 la misión Apolo 15 cartografió la Luna con un altímetro láser ([Wikipedia](https://en.wikipedia.org/wiki/Lidar)). Después se convirtió en un sensor clave de los vehículos autónomos, y en los últimos años se prueba para medir flujos de personas en estaciones, aeropuertos y espacios públicos ([Khanfor et al., 2026](https://arxiv.org/html/2603.27663v1)).

Hay sensores con espejos giratorios que barren 360°, sensores de estado sólido con un campo de visión más estrecho y sensores con patrones de barrido no repetitivos que van rellenando la escena con el tiempo. Para monitorizar personas suelen montarse fijos, en altura: en una farola, un techo o un mástil.

## Qué se puede medir

La revisión de Khanfor y colaboradores, publicada en *IEEE Internet of Things Magazine* en 2026, ordena la monitorización de multitudes con LiDAR en cuatro tareas ([Khanfor et al., 2026](https://arxiv.org/html/2603.27663v1)).

| Tarea | Qué se obtiene | Para qué sirve |
| --- | --- | --- |
| Detección | Presencia y posición de cada persona en 3D | Saber qué zonas están ocupadas |
| Conteo | Número de personas, total o por zona; densidad en personas por m² | Aforo, mapas de densidad, entradas y salidas por una línea |
| Seguimiento | Trayectoria, dirección y velocidad de cada persona entre fotogramas | Flujos, colas, tiempos de permanencia, cuellos de botella |
| Comportamiento | Patrones normales y desviaciones: flujo detenido, contraflujo, dispersión repentina | Detectar situaciones que se apartan de lo habitual |

De la nube de puntos se extraen varios tipos de rasgos: geométricos (altura de 1,5 a 2 m, proporciones), de distribución espacial (distancia entre personas, agrupamientos), temporales (velocidad y dirección entre fotogramas) y de reflectividad, que ayudan a separar personas del entorno ([Khanfor et al., 2026](https://arxiv.org/html/2603.27663v1)).

El seguimiento es lo que distingue al LiDAR de un contador en una puerta. Medir velocidades permite calcular indicadores que la densidad sola no da, como la «presión de multitud» que propusieron Helbing y colaboradores: densidad multiplicada por la varianza de la velocidad, que en el accidente del puente de Jamarat (La Meca, 2006) anunció la turbulencia antes del desastre ([Helbing et al., 2007](https://arxiv.org/pdf/physics/0701203)).

## Cómo se cuenta y se sigue a una persona

Una nube de puntos no trae etiquetas: es un conjunto desordenado de coordenadas, sin la rejilla de una imagen, así que necesita algoritmos propios ([Khanfor et al., 2026](https://arxiv.org/html/2603.27663v1)). El proceso habitual con un sensor fijo tiene cinco pasos:

1. **Filtrar y quitar el fondo.** Se eliminan el ruido, el suelo y todo lo que no se mueve (fachadas, farolas, mobiliario). Con un sensor fijo, el fondo se aprende una vez y se resta en cada fotograma.
2. **Agrupar.** Los puntos que quedan se reúnen en grupos por proximidad (clustering); cada grupo es un candidato a objeto.
3. **Clasificar.** Se decide qué grupos son personas, por su forma y tamaño o con una red neuronal entrenada para nubes de puntos (PointPillars, CenterPoint, PointNet++ y similares).
4. **Seguir.** Cada persona detectada se asocia con la del fotograma anterior para formar una trayectoria, normalmente con un filtro de Kalman que predice dónde estará.
5. **Agregar.** Las trayectorias se convierten en métricas por zona: recuento, densidad, entradas y salidas, velocidad, tiempo de permanencia.

Todo esto puede hacerse en un ordenador pequeño junto al sensor. Se han publicado sistemas que cuentan en una Jetson Nano en 17,4 ms por muestra ([Chen et al., ASU](https://visa.lab.asu.edu/web/wp-content/uploads/2026/01/ICDCSa.pdf)) y una red de 20 sensores en una estación procesada con Jetson Orin NX ([Hishida et al., 2026](https://www.its-jp.org/wp-content/uploads/2025/12/2025-1-A-08_paper.pdf)). Procesar en el sitio tiene una ventaja añadida: la nube de puntos puede descartarse allí mismo y enviar solo las métricas.

Gran parte de las piezas existen como software abierto con licencias que permiten uso comercial: el SDK de Livox ([MIT](https://github.com/Livox-SDK/Livox-SDK2)), Autoware con módulos de segmentación de suelo, agrupamiento, detección y seguimiento multiobjeto ([Apache-2.0](https://github.com/autowarefoundation/autoware_universe)), OpenPCDet para entrenar detectores 3D ([Apache-2.0](https://github.com/open-mmlab/OpenPCDet)), y las librerías [PCL](https://github.com/PointCloudLibrary/pcl) (BSD) y [Open3D](https://github.com/isl-org/Open3D) (MIT).

## A qué distancia ve a las personas

El alcance que anuncia una ficha técnica no es el alcance para contar personas. Los fabricantes lo dan para una reflectividad concreta, y la ropa suele reflejar mucho menos que un panel de calibración.

Un ejemplo con un sensor compacto habitual, el Livox Mid-360S:

| Superficie | Reflectividad (905–910 nm) | Alcance |
| --- | --- | --- |
| Panel blanco de calibración | 80 % | Hasta 70 m ([ficha](https://crkphotoimaging.com.au/products/livoxmid360s/livox-mid-360s-lidar---100m-range)) |
| Referencia del fabricante | 10 % | 40 m ([ficha](https://crkphotoimaging.com.au/products/livoxmid360s/livox-mid-360s-lidar---100m-range)) |
| Poliéster negro comercial | Menos del 3 % ([patente US11656388](https://patents.google.com/patent/US11656388)) | Por debajo de 40 m |
| Ropa clara, piel, pelo | Intermedia, según el color | Sin cifra publicada |
| Chalecos reflectantes | Alta | La excepción |

La precisión también cambia con la distancia. Un estudio que midió 35 unidades del Mid-360 encontró que todas cumplían la especificación, con un salto en el error vertical hacia los 10–12 m ([Mitka y Klapa, 2025](https://isprs-archives.copernicus.org/articles/XLVIII-1-W6-2025/147/2025/isprs-archives-XLVIII-1-W6-2025-147-2025-metrics.html)).

**La colocación pesa tanto como el sensor.** Muchos LiDAR compactos están pensados para robots y miran sobre todo hacia arriba: el Mid-360 ve de −7° a 52° en vertical ([Livox](https://www.livoxtech.com/mid-360/specs)). Montado a unos metros de altura en posición normal, apenas ve las cabezas cercanas; montado boca abajo, mirando al suelo, cubre mejor la zona próxima. Altura e inclinación deben entrar en cualquier cálculo de cobertura, y conviene simularlas antes de instalar.

Como orden de magnitud, estas son las personas que caben en el círculo que vigila un sensor, según su radio útil y la densidad:

| Radio útil | Área | A 2 pers/m² | A 4 pers/m² |
| --- | --- | --- | --- |
| 10 m | 314 m² | unas 630 | unas 1.260 |
| 20 m | 1.257 m² | unas 2.500 | unas 5.000 |
| 40 m | 5.027 m² | unas 10.000 | unas 20.000 |

Área = π × radio². En la práctica, varios sensores con zonas solapadas dan mejor resultado que uno solo intentando cubrir mucho, sobre todo cuando la gente se tapa entre sí.

## Qué dice la evidencia

Los estudios con sensores reales dan buenos resultados con densidades bajas y medias, y bajan claramente cuando la gente va muy junta. Las métricas habituales son MOTA y HOTA para el seguimiento (de 0 a 1, o en %, más alto es mejor), mAP y F1 para la detección, y el error medio en número de personas para el conteo.

| Estudio | Montaje | Resultado |
| --- | --- | --- |
| [Hishida et al., Univ. de Nagoya y JR Central, 2026](https://www.its-jp.org/wp-content/uploads/2025/12/2025-1-A-08_paper.pdf) | 20 LiDAR a 10 Hz en el vestíbulo de la estación de Nagoya, procesados con Jetson Orin NX | HOTA superior al 90 % en unos 900 m² |
| [Univ. de Osaka, seguimiento con oclusiones](https://mc.net.ist.osaka-u.ac.jp/en/themes/topics/lidar-pointcloud-tracking/) | Un sensor en pared, entrada de un centro comercial | MOTA 0,914 con oclusiones fuertes |
| [Ohno et al., Univ. de Osaka](https://arxiv.org/pdf/2303.09915) | 70 LiDAR en un edificio | Reconoce a la misma persona al pasar de un sensor a otro sin usar imagen |
| [Chen et al., Arizona State Univ.](https://arxiv.org/pdf/2311.18077) | LiDAR en una farola del campus | Error medio de 0,38 personas en el conteo; 17,4 ms por muestra en Jetson Nano ([versión posterior](https://visa.lab.asu.edu/web/wp-content/uploads/2026/01/ICDCSa.pdf)) |
| [Jayawickrama et al., Aalto, 2026](https://arxiv.org/html/2603.04938) | LiDAR mirando hacia abajo desde 2,94 m | MOTA 0,83, IDF1 0,93; unos 35 ms por fotograma |
| [Belbachir et al., NORCE, 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12304050/) | LiDAR de 128 haces en un congreso | Un Random Forest logra F1 de 0,93 en 12 ms, igual que PointNet y 2,5 veces más rápido |
| [Romero Blanch, Escalera et al., UB y CVC, 2024](https://openaccess.thecvf.com/content/WACV2024W/RWS/papers/Blanch_LiDAR-Assisted_3D_Human_Detection_for_Video_Surveillance_WACVW_2024_paper.pdf) | LiDAR para videovigilancia | mAP de peatones de 0,876 entre 0 y 20 m |
| [Lorente, Casas, Royo y Caminal, UPC, 2021](https://arxiv.org/pdf/2105.01151) | Peatones en nubes de puntos con PointNet++ | 99,1 % de precisión y 98,6 % de recall con datos propios |
| [Li et al., 2025](https://arxiv.org/abs/2505.16029) | LiDAR y cámaras con peatones muy agrupados | MOTA de solo 0,17 a 0,35 |

Dos lecturas. La primera: no hace falta un modelo enorme; en el borde, métodos sencillos rinden casi igual y mucho más rápido. La segunda: la cifra que importa depende del escenario. Un 90 % en un vestíbulo de estación no se traslada a una multitud apretada en la calle, donde los mejores sistemas siguen teniendo dificultades.

También hay despliegues fuera del laboratorio. Ferrocarrils de la Generalitat Valenciana probó un sistema con LiDAR en la estación de Luceros de Alicante ([Outsight](https://www.outsight.ai/insights/sice-fvg-train-station/)); Network Rail compró un sistema de vigilancia de multitudes con LiDAR para la estación de Waterloo tras varias pruebas ([GOV.UK](https://www.gov.uk/government/news/crowd-watch-dasa-funded-ai-and-lidar-innovation-helps-enhance-crowd-safety)); y en la costa alemana del mar del Norte casi 60 sensores informan a los turistas de la ocupación de las playas ([Blickfeld](https://www.blickfeld.com/case-studies/visitor-guidance-at-the-north-sea/)). Estos casos los publican los proveedores y no incluyen cifras de precisión.

## Limitaciones

- **Oclusión y densidad.** Las personas se tapan entre sí. Con multitudes muy apretadas el seguimiento se degrada, y a mucha distancia baja la resolución ([Khanfor et al., 2026](https://arxiv.org/html/2603.27663v1)). Es el límite más importante para medir aglomeraciones.
- **Alcance real.** Depende de la ropa, la altura y la inclinación del sensor; el valor de la ficha es un máximo en condiciones favorables.
- **Coste y cálculo.** Los sensores de alta resolución son caros y procesar nubes de puntos en tiempo real exige hardware dedicado; la misma revisión lo cita como barrera principal junto al almacenamiento ([Khanfor et al., 2026](https://arxiv.org/html/2603.27663v1)).
- **Clima.** Funciona de noche y aguanta lluvia o niebla ligeras, pero el rendimiento baja con lluvia intensa o niebla densa.
- **Calibración entre sensores.** Varios LiDAR deben conocer su posición relativa y sincronizar sus relojes. Los métodos recientes logran errores de 5 cm y 1° en casos difíciles, pero están pensados para sensores montados en un mismo vehículo ([Duan et al., 2024](https://arxiv.org/abs/2405.05589)).
- **Pocos datos abiertos.** Casi todos los conjuntos de datos de multitudes con LiDAR vienen de vehículos o robots y tienen licencia no comercial, como [STCrowd](https://github.com/4DVLab/STCrowd) (219.000 peatones, CC BY-NC-SA). Con sensor fijo y licencia abierta destacan [PointCloudPeople](https://huggingface.co/datasets/LukasPro/PointCloudPeople/blob/main/README.md) (CC BY 4.0) y, desde robot en mercados de Lausana, [CrowdBot v2](https://zenodo.org/records/17730560) (CC BY 4.0). Cada instalación nueva necesita sus propios datos de validación.
- **La privacidad no es automática.** La nube de puntos no tiene caras, pero se ha demostrado que se puede reconocer a una persona por su forma de caminar con LiDAR: LidarGait identifica a 1.050 personas y en exterior lo hace mejor que con cámara ([Shen et al., CVPR 2023](https://arxiv.org/abs/2211.10598v2)). Si se guardan trayectorias o nubes en bruto, los datos pueden seguir siendo personales; lo prudente es procesar en el propio sensor, conservar solo métricas agregadas y tratar los identificadores temporales como datos seudonimizados ([AEPD](https://www.aepd.es/prensa-y-comunicacion/blog/anonimizacion-y-seudonimizacion)).

## LiDAR, cámara y otras opciones

Ningún sensor gana en todo. Las cámaras siguen siendo la fuente principal del mercado de conteo de personas ([DHS/NUSTL, 2024](https://dhs.gov/sites/default/files/2024-06/24_0624_st_crowdcountsmsr.pdf)): son más baratas, más maduras y muchas ciudades ya las tienen instaladas. El LiDAR aporta otra cosa: geometría en metros, independencia de la luz y ausencia de imágenes.

|  | LiDAR 3D | Cámara con visión artificial | Wifi o Bluetooth |
| --- | --- | --- | --- |
| Qué mide | Posición y forma en 3D | Imagen en color | Dispositivos que emiten señal |
| Cuenta | Personas | Personas | Teléfonos, no personas |
| De noche | Sí, emite su propia luz | Depende de la iluminación | Sí |
| Imágenes de personas | No | Sí, salvo que se anonimicen al procesar | No |
| Velocidad y trayectoria | Directas, en metros | Estimadas desde la imagen | Muy aproximadas |
| Coste | Alto | Bajo o medio; puede reutilizar cámaras existentes | Bajo |
| Punto débil | Oclusión, alcance real, coste | Oclusión en multitudes densas, luz, privacidad | No ve a quien no lleva teléfono o lo lleva apagado |

La tabla resume la comparación de [Khanfor et al., 2026](https://arxiv.org/html/2603.27663v1) y la revisión de métodos de [Hussein et al., 2024](https://doaj.org/article/4224bb6c632a44c380696688fd4c77df), que señala que el vídeo falla en multitudes densas porque las personas se ocultan unas a otras.

En la práctica, los sistemas más completos combinan fuentes. En los aeropuertos del grupo Manchester Airports se usan a la vez LiDAR, cámaras estéreo 3D y la red wifi del aeropuerto ([Airports International](https://www.airportsinternational.com/node/166153)). El LiDAR encaja mejor donde hace falta medir con precisión en zonas concretas, de noche o sin captar imágenes.

## Fuentes

- Khanfor, Zaghouani, Ghazzai, Alsharoa y Setti (2026). [LiDAR for Crowd Management: Applications, Benefits, and Future Directions](https://arxiv.org/html/2603.27663v1). *IEEE Internet of Things Magazine*.
- NOAA. [What is LIDAR?](https://oceanservice.noaa.gov/facts/LiDAR.html)
- [Lidar](https://en.wikipedia.org/wiki/Lidar), Wikipedia.
- Helbing, Johansson y Al-Abideen (2007). [Dynamics of crowd disasters: An empirical study](https://arxiv.org/pdf/physics/0701203). *Physical Review E* 75, 046109.
- Hishida et al. (2026). [Seguimiento de personas con LiDAR en la estación de Nagoya](https://www.its-jp.org/wp-content/uploads/2025/12/2025-1-A-08_paper.pdf).
- Ohno et al. [Privacy-preserving Pedestrian Tracking using Distributed 3D LiDARs](https://arxiv.org/pdf/2303.09915).
- Universidad de Osaka. [Seguimiento con nubes de puntos y oclusiones](https://mc.net.ist.osaka-u.ac.jp/en/themes/topics/lidar-pointcloud-tracking/).
- Chen et al., Arizona State University. [Conteo con LiDAR en farolas](https://arxiv.org/pdf/2311.18077) y [HAWC-CC](https://visa.lab.asu.edu/web/wp-content/uploads/2026/01/ICDCSa.pdf).
- Jayawickrama et al. (2026). [LiDAR cenital para detección y seguimiento de personas](https://arxiv.org/html/2603.04938).
- Belbachir et al. (2025). [Detección de personas con LiDAR en un congreso](https://pmc.ncbi.nlm.nih.gov/articles/PMC12304050/).
- Romero Blanch, Escalera et al. (2024). [LiDAR-Assisted 3D Human Detection for Video Surveillance](https://openaccess.thecvf.com/content/WACV2024W/RWS/papers/Blanch_LiDAR-Assisted_3D_Human_Detection_for_Video_Surveillance_WACVW_2024_paper.pdf). WACV Workshops.
- Lorente, Casas, Royo y Caminal (2021). [Detección de peatones en nubes de puntos con PointNet++](https://arxiv.org/pdf/2105.01151).
- Li et al. (2025). [Peatones muy agrupados con LiDAR y cámaras](https://arxiv.org/abs/2505.16029).
- Mitka y Klapa (2025). [Precisión del Livox Mid-360](https://isprs-archives.copernicus.org/articles/XLVIII-1-W6-2025/147/2025/isprs-archives-XLVIII-1-W6-2025-147-2025-metrics.html). ISPRS Archives.
- Duan et al. (2024). [Rotation Initialization and Stepwise Refinement for Universal LiDAR Calibration](https://arxiv.org/abs/2405.05589).
- Shen et al. (2023). [LidarGait](https://arxiv.org/abs/2211.10598v2). CVPR.
- AEPD. [Anonimización y seudonimización](https://www.aepd.es/prensa-y-comunicacion/blog/anonimizacion-y-seudonimizacion).
- DHS/NUSTL (2024). [Crowd counting market survey](https://dhs.gov/sites/default/files/2024-06/24_0624_st_crowdcountsmsr.pdf).
- Hussein et al. (2024). [Revisión de detección de anomalías en multitudes](https://doaj.org/article/4224bb6c632a44c380696688fd4c77df). *Franklin Open* 8.
- Fichas y casos: [Livox Mid-360S](https://crkphotoimaging.com.au/products/livoxmid360s/livox-mid-360s-lidar---100m-range), [especificaciones Mid-360](https://www.livoxtech.com/mid-360/specs), [patente US11656388](https://patents.google.com/patent/US11656388), [FGV y Luceros](https://www.outsight.ai/insights/sice-fvg-train-station/), [Network Rail](https://www.gov.uk/government/news/crowd-watch-dasa-funded-ai-and-lidar-innovation-helps-enhance-crowd-safety), [mar del Norte](https://www.blickfeld.com/case-studies/visitor-guidance-at-the-north-sea/), [Manchester Airports](https://www.airportsinternational.com/node/166153).
- Datos y software: [STCrowd](https://github.com/4DVLab/STCrowd), [PointCloudPeople](https://huggingface.co/datasets/LukasPro/PointCloudPeople/blob/main/README.md), [CrowdBot v2](https://zenodo.org/records/17730560), [Livox-SDK2](https://github.com/Livox-SDK/Livox-SDK2), [Autoware](https://github.com/autowarefoundation/autoware_universe), [OpenPCDet](https://github.com/open-mmlab/OpenPCDet), [PCL](https://github.com/PointCloudLibrary/pcl), [Open3D](https://github.com/isl-org/Open3D).
