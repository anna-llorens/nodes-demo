# Artículo: Wifi y Bluetooth cuentan móviles, no personas

Estado: listo para publicar (2 nov 2026, @Anna). Versión en español y en inglés.
Imagen: `wifi_error_por_punto_es.svg` (ES) y `wifi_error_per_point_en.svg` (EN), en esta misma carpeta. Va donde pone [IMAGEN].
Documento de trabajo original: https://claude.ai/artifact/BzmBKWvaCZPdZ5TjmV6k5d

---

## ES

# Wifi y Bluetooth cuentan móviles, no personas

Para saber cuánta gente pasa por un lugar y a qué hora, organizadores de eventos, centros comerciales y autoridades utilizan desde hace años sensores que captan las señales wifi y Bluetooth de los móviles: pequeñas cajas en farolas, fachadas o techos, sin cámaras, que se instalan rápido y cuestan poco. Están en calles comerciales, estaciones y terminales de aeropuerto, y en España se han desplegado por ejemplo en destinos turísticos como [Córdoba](https://www.eldebate.com/espana/la-voz-de-cordoba/actualidad/20250219/hacia-nuevo-modelo-gestion-turistica-cordoba_271588_amp.html), [Guardamar del Segura](https://alicanteplaza.es/alicanteplaza/guardamar-adjudicapor-180000-euros-un-sistema-para-contabilizar-y-monitorizar-a-los-turistas) o [Altea](https://alicanteplaza.es/alicanteplaza/altea-implantara-un-sistema-de-control-de-aforo-en-sus-playas-y-el-casco-antiguo).

Su funcionamiento es sencillo. Un móvil con el wifi activado emite de vez en cuando mensajes para buscar redes conocidas, aunque no se conecte a ninguna; con el Bluetooth ocurre algo parecido. El sensor escucha esos mensajes y cuenta los dispositivos distintos que pasan cerca. De ahí salen cifras de afluencia, tiempos de estancia o recorridos. La pregunta es cuánto se parecen esas cifras al número real de personas.

En diciembre de 2017, un sensor colocado junto a un escaparate de Oxford Street, en Londres, captó unas 60.000 señales wifi en media hora. En ese tiempo pasaron por delante 3.722 personas, contadas a mano. Sin procesar, el error medio del sensor rondaba el 425 %; filtrando por intensidad de señal bajaba a alrededor del 30 % ([Soundararaj, Cheshire y Longley, UCL](https://discovery.ucl.ac.uk/id/eprint/10068691/1/Cheshire_Estimating%20real-time%20highstreet%20footfall%20from%20wi-fi%20probe%20requests_AAM.pdf)).

El ejemplo resume el problema. Un sensor wifi o Bluetooth no ve personas: oye a los móviles buscar redes. Pasar de ahí a una cifra de visitantes es una estimación, y su calidad depende de cómo se calibre.

## Por qué no salen las cuentas

- **No hay un móvil por persona.** Hay quien no lleva móvil o lo lleva con el wifi apagado, y quien lleva móvil, reloj y tableta. Routers, impresoras y otros equipos fijos también emiten.
- **Cada móvil habla a su ritmo.** La frecuencia con que un teléfono emite depende de la marca, de la versión del sistema y de si la pantalla está encendida. En el aeropuerto de Múnich, frente a las tarjetas de embarque escaneadas en el control de seguridad, el wifi contaba de más y el Bluetooth de menos: detectaba solo un 4 % de los dispositivos que veía el wifi ([Schauer, Werner y Marcus, 2014](https://www.bgd.ed.tum.de/pdf/2014_CROWDDENSITIES_Werner.pdf)).
- **La señal no respeta la calle.** Atraviesa paredes y llega de tiendas, terrazas o paradas de autobús cercanas. En Londres, los puntos con asientos junto al sensor contaban de más.

A eso se suma la dirección MAC aleatoria: para proteger la privacidad, los móviles cambian su identificador, por defecto desde iOS 14 y Android 10, así que un mismo teléfono puede contarse varias veces.

## El error se mueve

Lo importante no es que haya error, sino que no se queda quieto.

- **Por sitio.** En cinco puntos de calles comerciales de Londres, el error bruto iba del 87 % al 928 %. Hizo falta un factor de corrección distinto en cada punto, entre 0,51 y 1,60, y aun así el error calibrado quedó entre el 9 % y el 55 % (UCL).

[IMAGEN: wifi_error_por_punto_es.svg]
Alt: Gráfico de barras: error del conteo wifi frente a un conteo manual en cinco puntos de Londres, sin procesar (del 87 % al 928 %) y tras filtrar y calibrar (del 9 % al 55 %).
Pie: Error medio del mismo tipo de sensor en cinco puntos de Londres. Fuente: Soundararaj, Cheshire y Longley (UCL), IJGIS 2020; datos por punto de la tesis de Soundararaj (2019), tabla 4.8.

- **Por hora.** En Gold Coast (Australia), comparando 17 sensores wifi con cámaras, el número de personas por dispositivo detectado osciló sobre todo entre 0,2 y 2 a lo largo del día, con picos de 2,8 ([Solmaz et al., 2019](https://arxiv.org/abs/1909.08522)). Un único coeficiente diario aplana justo los picos que interesa ver.
- **Con el tiempo.** Los investigadores de UCL descartaron un factor fijo porque la proporción de móviles con MAC aleatoria crecía año a año. Los fabricantes siguen cambiando ese comportamiento: desde iOS 18, el usuario puede elegir una dirección que rota cada dos semanas ([Apple](https://support.apple.com/en-us/102509)). Las autoridades españolas de protección de datos recuerdan que la forma de generar direcciones aleatorias no está estandarizada ([guía de AEPD, APDCAT, AVPD y CTPDA, 2024](https://www.aepd.es/guides/wi-fi-tracking-technologies-guidance-for-data-controllers.pdf)). Una serie de varios años sin recalibrar puede reflejar actualizaciones de teléfonos en lugar de visitantes.

## El mejor caso, y qué necesitó

El resultado más preciso que hemos encontrado viene de una biblioteca de la Université libre de Bruxelles. Durante nueve semanas de 2019, su sistema wifi llegó a un error medio del 12,7 % (MAPE: la desviación porcentual media frente a la referencia) ([Determe et al., IEEE Systems Journal, 2022](https://arxiv.org/abs/2010.10370)).

Pero fue en un edificio con accesos controlados, antes de iOS 14, y con un factor de extrapolación ajustado frente a un sistema de cámaras. Incluso ahí, ese factor cambió de una semana a otra, entre 4,66 y 5,47. **El wifi se acercó a la realidad cuando otro método le decía cuánta gente había.**

## Qué se deduce

El wifi y el Bluetooth tienen su sitio: son baratos, funcionan con cualquier tiempo y sirven para ver tendencias y flujos en áreas grandes. Pero para decidir sobre aforo o seguridad no basta con un factor calculado una vez. Hace falta un método que cuente cuerpos, no dispositivos, o al menos una referencia independiente y permanente con la que recalibrar.

## Tres preguntas antes de comprar el dato

1. ¿Frente a qué referencia se calibró (conteo manual, cámara, torniquete) y durante cuánto tiempo?
2. ¿Qué error se midió después, por punto y por franja horaria?
3. ¿Cada cuánto se recalibra, y quién lo hace tras cada actualización de iOS o Android?

Si el sistema llega a tratar datos personales, hay un motivo más: el RGPD exige que los datos sean exactos, y la guía de la AEPD lo recuerda expresamente para las estimaciones probabilísticas.

## Conclusión

Las señales de los móviles son una buena herramienta para seguir tendencias: cuántos visitantes hubo este mes frente al anterior, qué calles se llenan antes, cómo se reparten los flujos en un área grande. Pero una cifra de afluencia vale lo que vale su validación. Para interpretarla hay que saber qué registra el sensor, cómo convierte esos registros en personas, frente a qué referencia se comprobó, durante cuánto tiempo y con qué error.

Esa validación tiene que corresponder al uso: lo que basta para comparar dos temporadas no basta para decidir sobre el aforo de un recinto o la gestión de una multitud. Por eso el margen de error debería ser visible para quien usa el dato y publicarse junto con el método. Mientras no lo sea, y mientras no haya una referencia independiente que lo recalibre, el wifi y el Bluetooth dicen cuántos móviles hay, no cuánta gente.

*Revisión hecha el 2 de noviembre de 2026. Los estudios con referencia real que conocemos son anteriores a la generalización de la MAC aleatoria.*

---

## EN

# Wi-Fi and Bluetooth count phones, not people

*Sensors that listen to phone signals are cheap and cover a lot of ground. But their error is not a fixed number: it changes with the place, the hour and every phone update.*

To find out how many people pass through a place and when, event organisers, shopping centres and authorities have for years used sensors that pick up phones' Wi-Fi and Bluetooth signals: small boxes on lampposts, façades or ceilings, with no cameras, that are quick to install and cheap. They sit in shopping streets, stations and airport terminals, and in Spain they have been deployed in tourist destinations such as [Córdoba](https://www.eldebate.com/espana/la-voz-de-cordoba/actualidad/20250219/hacia-nuevo-modelo-gestion-turistica-cordoba_271588_amp.html), [Guardamar del Segura](https://alicanteplaza.es/alicanteplaza/guardamar-adjudicapor-180000-euros-un-sistema-para-contabilizar-y-monitorizar-a-los-turistas) and [Altea](https://alicanteplaza.es/alicanteplaza/altea-implantara-un-sistema-de-control-de-aforo-en-sus-playas-y-el-casco-antiguo).

The principle is simple. A phone with Wi-Fi on sends out messages from time to time to look for known networks, even if it never connects to one; Bluetooth does something similar. The sensor listens for those messages and counts the distinct devices passing nearby. That produces footfall figures, dwell times and routes. The question is how closely those figures match the real number of people.

In December 2017, a sensor next to a shop window on Oxford Street, London, picked up some 60,000 Wi-Fi signals in half an hour. In that time 3,722 people walked past, counted by hand. Unprocessed, the sensor's average error was around 425%; filtering by signal strength brought it down to about 30% ([Soundararaj, Cheshire and Longley, UCL](https://discovery.ucl.ac.uk/id/eprint/10068691/1/Cheshire_Estimating%20real-time%20highstreet%20footfall%20from%20wi-fi%20probe%20requests_AAM.pdf)).

That example sums up the problem. A Wi-Fi or Bluetooth sensor does not see people: it hears phones looking for networks. Turning that into a visitor count is an estimate, and its quality depends on how it is calibrated.

## Why the numbers don't add up

- **There isn't one phone per person.** Some people carry no phone or have Wi-Fi off; others carry a phone, a watch and a tablet. Routers, printers and other fixed devices also transmit.
- **Every phone talks at its own pace.** How often a phone transmits depends on the brand, the OS version and whether the screen is on. At Munich Airport, compared with boarding passes scanned at security, Wi-Fi overcounted and Bluetooth undercounted: it detected only 4% of the devices Wi-Fi saw ([Schauer, Werner and Marcus, 2014](https://www.bgd.ed.tum.de/pdf/2014_CROWDDENSITIES_Werner.pdf)).
- **The signal ignores the street.** It goes through walls and comes from nearby shops, terraces and bus stops. In London, spots with seating next to the sensor overcounted.

On top of that comes MAC address randomisation: to protect privacy, phones change their identifier, by default since iOS 14 and Android 10, so the same phone can be counted several times.

## The error moves

The point is not that there is error, but that it does not stay still.

- **By place.** At five points on London shopping streets, raw error ranged from 87% to 928%. Each point needed its own correction factor, between 0.51 and 1.60, and even then calibrated error stayed between 9% and 55% (UCL).

[IMAGE: wifi_error_per_point_en.svg]
Alt: Bar chart: Wi-Fi count error against a manual count at five points in London, unprocessed (87% to 928%) and after filtering and calibration (9% to 55%).
Caption: Mean error of the same type of sensor at five points in London. Source: Soundararaj, Cheshire and Longley (UCL), IJGIS 2020; per-point data from Soundararaj's PhD thesis (2019), table 4.8.

- **By hour.** In Gold Coast, Australia, comparing 17 Wi-Fi sensors with cameras, the number of people per detected device mostly ranged from 0.2 to 2 over the day, peaking at 2.8 ([Solmaz et al., 2019](https://arxiv.org/abs/1909.08522)). A single daily factor flattens exactly the peaks you want to see.
- **Over time.** The UCL researchers dropped a fixed factor because the share of phones with random MAC addresses grew year after year. Manufacturers keep changing that behaviour: since iOS 18, users can choose an address that rotates every two weeks ([Apple](https://support.apple.com/en-us/102509)). Spain's data protection authorities note that the way random addresses are generated is not standardised ([AEPD, APDCAT, AVPD and CTPDA guidance, 2024](https://www.aepd.es/guides/wi-fi-tracking-technologies-guidance-for-data-controllers.pdf)). A multi-year series that is never recalibrated may reflect phone updates rather than visitors.

## The best case, and what it took

The most accurate result we found comes from a library at the Université libre de Bruxelles. Over nine weeks in 2019, its Wi-Fi system reached an average error of 12.7% (MAPE: the mean percentage deviation from the reference) ([Determe et al., IEEE Systems Journal, 2022](https://arxiv.org/abs/2010.10370)).

But that was in a building with controlled entrances, before iOS 14, and with an extrapolation factor fitted against a camera system. Even there, the factor changed from week to week, between 4.66 and 5.47. **Wi-Fi got close to reality when another method was telling it how many people there were.**

## What follows

Wi-Fi and Bluetooth have their place: they are cheap, work in any weather and are useful for trends and flows over large areas. But to decide on capacity or safety, a factor computed once is not enough. You need a method that counts bodies, not devices, or at least an independent, permanent reference to recalibrate against.

## Three questions before buying the data

1. What reference was it calibrated against (manual count, camera, turnstile), and for how long?
2. What error was measured afterwards, per point and per time slot?
3. How often is it recalibrated, and who does it after each iOS or Android update?

If the system ends up processing personal data, there is one more reason: the GDPR requires data to be accurate, and the AEPD guidance stresses this for probabilistic estimates.

## Conclusion

Phone signals are a good tool for following trends: how many visitors came this month compared with last, which streets fill up first, how flows spread across a large area. But a footfall figure is only as good as its validation. To interpret it you need to know what the sensor records, how it turns those records into people, what reference it was checked against, for how long and with what error.

That validation has to match the use: what is enough to compare two seasons is not enough to decide on a venue's capacity or how to manage a crowd. That is why the margin of error should be visible to whoever uses the figure and published alongside the method. Until it is, and until there is an independent reference to recalibrate against, Wi-Fi and Bluetooth tell you how many phones there are, not how many people.

*Review carried out on 2 November 2026. The studies with a real reference that we know of predate widespread MAC randomisation.*
