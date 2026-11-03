# Análisis de lógica de negocio — Black Club (Paraguay)

Fecha: 2026-11-02 · Alcance: reserva pública, agenda, caja/POS, clientes, tarifas, reportes.

Leyenda: 🔴 rompe la operación o pierde plata · 🟠 fricción importante · 🟢 mejora / diferencial.

---

## 1. Reserva pública (el corazón del producto)

### Cómo funciona hoy
Elegís día (próximos 7) → elegís cancha y hora (bloques de 60 min) → completás nombre, teléfono, paletas, pelotas y mesa en el bar → se crea una "Solicitud Pendiente" → se abre WhatsApp con un mensaje → recepción confirma a mano.

### Falencias
| # | Problema | Impacto |
|---|---|---|
| R1 🔴 | **La tarifa Prime nunca se cobra.** Cada cancha tiene `prime_rate`, pero la web, el CRM y el servidor usan siempre la tarifa normal. Ningún lado define desde qué hora empieza el Prime. | Se pierde la diferencia en los horarios más pedidos (17:00–23:00). |
| R2 🔴 | **Las solicitudes nunca vencen.** El vencimiento automático solo cancela "Seña Pendiente", pero la web crea "Solicitud Pendiente". Además, la función de vencimiento no está programada. Una solicitud que nadie atiende bloquea el turno para siempre. | Se pierden turnos vendibles; se pueden ocupar a propósito. |
| R3 🔴 | **WhatsApp no abre en iPhone.** Se llama a `window.open` después de esperar al servidor, y Safari bloquea esas ventanas emergentes. | El cliente reserva y el club nunca recibe el mensaje. |
| R4 🟠 | **Turnos de 60 minutos fijos.** En Paraguay y la región el estándar del pádel es **90 minutos** (y también 60 o 120). Con bloques de 1 h, un partido de 90 min ocupa 2 turnos o deja medias horas muertas. | No refleja cómo juega la gente; la grilla se llena mal. |
| R5 🟠 | **Hay que elegir cancha antes que hora.** La gente piensa "quiero jugar el jueves a las 19". Hoy ve 3 grillas de 17 botones cada una. | Mucho scroll en el celular y más abandono. |
| R6 🟠 | **El formulario pide de más.** Paletas, pelotas y mesa en el bar en el mismo paso que los datos. | Más fricción en el paso que cierra la venta. |
| R7 🟠 | **El teléfono no se valida ni se normaliza.** Acepta cualquier texto, así que el mismo cliente queda guardado como "0981…", "+595 981…" y "981…". | Clientes duplicados y enlaces de WhatsApp que fallan. |
| R8 🟠 | **Los precios de paleta y pelotas están fijos en la pantalla** (30.000 y 70.000). Si el dueño los cambia, el cliente sigue viendo el precio viejo. | El precio mostrado no coincide con el cobrado. |
| R9 🟠 | **Solo se ven 7 días**, sin calendario. | No se puede reservar con más anticipación (torneos, viernes de la semana siguiente). |
| R10 🟠 | **El cliente no puede ver ni cancelar su reserva.** Recibe un código pero no tiene dónde usarlo. | Todas las cancelaciones pasan por WhatsApp y llegan tarde; turnos vacíos. |
| R11 🟢 | No hay "recordar mis datos". El cliente frecuente tipea nombre y teléfono cada vez. | |
| R12 🟢 | No hay un botón para compartir con los otros 3 jugadores (link al partido). | |

### Propuesta
1. **Flujo de 3 toques:** Día → Hora (se muestran todas las canchas libres a esa hora, con precio) → Confirmar (nombre y WhatsApp, recordados en el dispositivo). El equipamiento queda como "extras" opcionales y plegados.
2. **Duración configurable por club (60 / 90 / 120)**, con 90 por defecto si así se decide. La grilla se arma por **hora de inicio** con pasos de 30 min, y el servidor valida que no se solape con otra reserva. Esto reemplaza al índice único actual, que solo compara turnos idénticos.
3. **Precio según la hora:** Normal o Prime según el horario Prime configurable (por ejemplo, lunes a viernes desde las 17:00, más fines de semana completos). Lo calcula el servidor y la web lo muestra antes de confirmar.
4. **Vencimiento real:** una solicitud sin confirmar se libera a los N minutos (configurable, por ejemplo 30), con una tarea programada en la base (`pg_cron`). Recepción ve una cuenta regresiva.
5. **WhatsApp que siempre abre:** después de confirmar se muestra una pantalla de éxito con un botón grande "Enviar por WhatsApp". El navegador no bloquea el clic directo.
6. **Teléfono paraguayo:** se normaliza a `+595 9XX XXX XXX`, se valida que sea un celular (09xx) y se usa como identificador del cliente.
7. **Mi reserva:** un link con código (`/r/BC-1234`) para ver el estado, agregarla al calendario y cancelarla hasta X horas antes (política configurable).

---

## 2. Agenda / recepción

| # | Problema | Impacto |
|---|---|---|
| A1 🔴 | **Rechazar o cancelar una reserva deja su cuenta abierta en Caja** con el monto de la cancha. | Cuentas fantasma en caja y recaudación inflada en el panel. |
| A2 🔴 | **Los turnos fijos ("Abono Fijo Semanal") son solo una etiqueta.** No se repiten solos cada semana. En Paraguay, los fijos son buena parte del ingreso de un club. | Recepción los carga a mano cada semana y se olvida alguno. |
| A3 🟠 | No hay forma de **bloquear una cancha** por mantenimiento, clase o torneo sin inventar una reserva falsa. | Datos sucios. |
| A4 🟠 | No se registra el **no-show** (el que no vino). | No se puede aplicar una política ni identificar a los clientes problemáticos. |
| A5 🟠 | Estados confusos y duplicados: "Solicitud Pendiente", "Seña Pendiente", "Confirmada", "En Cancha", "En Pista", "Finalizada". | Recepción no sabe qué tocar. |
| A6 🟢 | No se puede **mover** una reserva a otra hora o cancha; hay que cancelarla y crearla de nuevo. | |

### Propuesta
- Estados simples: **Pendiente → Confirmada → Jugando → Cobrada**, más **Cancelada** y **No vino**. Cancelar o marcar "no vino" cierra la cuenta (sin cobro, o cobrando la penalidad si se configura).
- **Turnos fijos de verdad:** "Repetir todos los jueves 19:00 hasta…". Se generan las próximas 8 semanas y se pueden pausar o cancelar todos de una vez.
- **Bloqueos** de cancha con motivo (mantenimiento, clase, torneo).
- Agenda mobile-first: una columna por cancha con scroll horizontal, tocar un hueco libre para reservar y tocar una reserva para ver sus acciones (confirmar, iniciar, cobrar, mover, cancelar). La "tarjeta de solicitud entrante" queda arriba con la cuenta regresiva.

---

## 3. Caja / POS

| # | Problema | Impacto |
|---|---|---|
| C1 🔴 | **No hay cierre de caja.** La tabla `daily_cash_registers` existe pero la app nunca la usa. | No hay arqueo diario; imposible controlar a recepción. |
| C2 🟠 | **Un solo medio de pago por cuenta.** En Paraguay un grupo de 4 suele pagar mezclado: 2 en efectivo, 1 por transferencia y 1 con QR. | Recepción anota a mano en otro lado. |
| C3 🟠 | **Medios de pago incompletos:** "Tarjeta", "Efectivo" y "Transferencia Itaú". Faltan **QR (Bancard / bancos)**, **transferencia SIPAP** a cualquier banco y **billeteras** (Tigo Money, Personal). | |
| C4 🟠 | **Facturación:** en Paraguay el cliente suele pedir factura con **RUC y razón social**, y desde la facturación electrónica (SIFEN) el comprobante tiene que llevar esos datos. Hoy no se guardan. | Recepción pide los datos por WhatsApp o los anota en papel. |
| C5 🟢 | Hay calculadora para dividir entre jugadores, pero no queda registrado quién pagó qué. | |
| C6 🟢 | No hay **consumos sin reserva** (venta de barra a alguien que no juega, o a un socio). | |

### Propuesta
- **Pagos parciales:** cada cuenta acepta varios cobros (monto + medio), con "dividir entre 4" en un toque y un saldo que baja hasta 0. Medios: Efectivo, Transferencia, QR, Tarjeta de débito o crédito, Billetera.
- **Datos de factura** opcionales por cuenta (RUC con dígito verificador validado, razón social). Quedan listos para cargar en el sistema de facturación del club (no se emite el comprobante electrónico; eso lo hace su software).
- **Apertura y cierre de caja** por turno de recepción: monto inicial, total por medio de pago, efectivo contado contra el esperado, diferencia y quién cerró.
- **Venta rápida de barra** sin reserva.

---

## 4. Clientes

| # | Problema | Mejora |
|---|---|---|
| P1 🟠 | La ficha se crea por nombre o teléfono, y se duplica (ver R7). | El teléfono normalizado es la clave única. |
| P2 🟠 | La categoría (4ta, 5ta…) siempre es "4ta" por defecto y nadie la mantiene. | Que el cliente la elija opcionalmente al reservar; útil para armar partidos y torneos. |
| P3 🟢 | No hay historial por cliente (reservas, gasto, no-shows, último partido). | Ficha con historial y un botón de WhatsApp directo. |
| P4 🟢 | No hay segmentos útiles: frecuentes, inactivos hace 30 días, deudores. | Filtros listos para mandar promos por WhatsApp. |

---

## 5. Tarifas y configuración

- Hoy hay tarifas por cancha (Normal y Prime) y precios de paleta y pelotas. Falta:
  - **Horario Prime configurable** (días y horas).
  - **Duración del turno.**
  - **Horario de apertura** por día (por ejemplo, domingo hasta las 22).
  - **Minutos de vencimiento** de una solicitud.
  - **Política de cancelación** (horas de anticipación).
- Todo en **una sola pantalla de "Configuración del club"** para el dueño, en vez de valores repartidos por el código.

---

## 6. Panel del dueño

- Hoy muestra métricas del día, calculadas en el navegador a partir de lo que está cargado.
- Lo útil para un dueño en Paraguay:
  - **Ocupación %** por cancha y franja (mañana / siesta / tarde / noche).
  - **Ingresos por medio de pago.**
  - **Comparación con la semana anterior.**
  - **Top clientes.**
  - **No-shows.**
  - **Cierres de caja** con diferencias.

---

## 7. Región (Paraguay) — checklist

- Moneda: Guaraníes sin decimales, con separador de miles con punto (`160.000 Gs.`). ✅ Ya está bien.
- Zona horaria: `America/Asuncion`. Paraguay usa **UTC-3 fijo** desde octubre de 2024 (eliminó el horario de verano). El servidor ya la usa, pero **la web calcula "hoy" y "hora pasada" con el reloj del dispositivo**: hay que unificarlo.
- Celulares: formato `09XX XXX XXX`, internacional `+595 9XX XXX XXX`.
- Pagos: efectivo, transferencia (SIPAP), QR y tarjetas (Bancard), billeteras (Tigo Money, Personal).
- Factura: RUC con dígito verificador y razón social (facturación electrónica SIFEN).
- Idioma: español rioplatense o paraguayo ("vos", "reservá"). La app mezcla "usted" y "vos"; hay que unificarlo en **vos**.
- Turnos de 90 minutos como estándar (configurable).

---

## 8. Diseño / UX (mobile first)

- El portal tiene mucho texto de marketing ("Quiet Athletic Luxury", "Sistema Operativo Deportivo") y poca acción. La reserva tiene que estar a **un toque** desde que abre la página.
- Las grillas de 17 botones por cancha son pesadas en el celular. Mejor: chips de hora en una fila deslizable y tarjetas de cancha libre debajo.
- En el CRM, la navegación con 5 secciones está bien. En el celular conviene una **barra inferior fija** (Agenda, Caja, Clientes, Más) en lugar de la barra superior deslizable.
- Botones grandes (mínimo 44 px), contraste AA y estados vacíos con una acción clara.

---

## 9. Priorización propuesta

| Fase | Contenido |
|---|---|
| **1. Reserva sin trabas** | R1 Prime, R2 vencimiento, R3 WhatsApp, R4 duración, R5–R8 flujo de 3 toques, teléfono PY, hora de Asunción, "Mi reserva" |
| **2. Recepción** | Estados simples, A1 cuentas fantasma, turnos fijos, bloqueos, no-show, agenda mobile |
| **3. Caja** | Pagos parciales y mixtos, medios PY, datos de factura, apertura y cierre de caja, venta rápida |
| **4. Dueño** | Configuración del club en una pantalla, panel de ocupación e ingresos, clientes con historial y segmentos |

---

## 10. Estado de implementación (2026-11-02)

Decisiones del club: turnos de **60 / 90 / 120 min a elección del cliente**, **sin tarifa Prime** (precio por hora × duración), solicitudes web que **vencen a los 60 min**, **sin seña**.

| Punto | Estado |
|---|---|
| R1 Prime | No aplica (decisión: sin Prime) |
| R2 vencimiento | ✅ `pg_cron` cada 5 min + liberación al reservar |
| R3 WhatsApp en iPhone | ✅ botón directo en la pantalla de éxito |
| R4 duración | ✅ 60/90/120, inicio cada 30 min, sin solapamientos (restricción en la base) |
| R5–R8 flujo | ✅ Día → duración → hora (canchas libres) → cancha → confirmar; extras plegados; precios desde la configuración |
| R7 / P1 teléfono | ✅ normalizado `+595 9XX…`, validado en web y servidor |
| R9 ventana | ✅ configurable (14 días) |
| R10 Mi reserva | ✅ consultar y cancelar con código + celular, con política de horas |
| R11 recordar datos | ✅ |
| A1 cuentas fantasma | ✅ cancelar / no vino cierra la cuenta |
| A2 turnos fijos | ✅ 4/8/12 semanas, saltea fechas ocupadas |
| A3 bloqueos | ✅ |
| A4 no-show | ✅ |
| A5 estados | ✅ Pendiente / Confirmada / Jugando / Finalizada / Cancelada / No vino |
| A6 mover | ✅ cancha, día, hora y duración |
| C1 cierre de caja | ✅ apertura con fondo, cierre con arqueo y diferencia |
| C2–C3 pagos | ✅ mixtos: Efectivo, Transferencia, QR, Débito, Crédito, Billetera; dividir en 2/4; vuelto |
| C4 factura | ✅ RUC validado (dígito verificador SET) + razón social |
| C6 venta sin reserva | ✅ |
| P3–P4 clientes | ✅ historial, segmentos, WhatsApp |
| §5 configuración | ✅ pantalla de Ajustes del dueño |
| §6 panel | ✅ facturación, ocupación por franja y cancha, medios de pago, top clientes, cierres |
| Formularios gym / torneos | ✅ ahora se guardan en Supabase (antes solo en el navegador) |

Pendiente: R12 (link para compartir el partido), emisión de factura electrónica SIFEN (requiere el sistema de facturación del club), notificaciones automáticas por WhatsApp Business API.
