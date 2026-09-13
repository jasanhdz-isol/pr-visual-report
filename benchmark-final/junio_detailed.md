# Reporte de Actividades - Junio

**Fecha de generación:** 13/9/2026

## Resumen del mes

Durante el mes de **Junio** se completaron **4 Pull Requests** con un total de **241 capturas de pantalla** documentando los cambios realizados.

### Categorías

- **Nuevas funcionalidades:** 3 PRs
- **Refactorizaciones:** 1 PRs

---

## Pull Requests del mes

### 1. [PR #842](https://github.com/Servicios-Liverpool-Infraestructura/automatizacion_foro_fotografico_frontend/pull/842) - skeleton loaders

> Este Pull Request introduce la funcionalidad de "skeleton loaders" en la aplicación de logística. El objetivo principal es mejorar la experiencia del usuario al mostrar indicadores visuales de carga e...

- **Capturas:** 18 imágenes (descripción + 17 partes de diff)

### 2. [PR #846](https://github.com/Servicios-Liverpool-Infraestructura/automatizacion_foro_fotografico_frontend/pull/846) - GOB-1790 logistics alignment

> Esta PR mejora la experiencia de usuario de la interfaz de Logística y Gestión de Usuarios.

  Cambios incluidos:

  - Normaliza el espaciado y el relleno en las subpáginas de Logística para mantener ...

- **Capturas:** 10 imágenes (descripción + 9 partes de diff)

### 3. [PR #855](https://github.com/Servicios-Liverpool-Infraestructura/automatizacion_foro_fotografico_frontend/pull/855) - waiting photograph status

> Esta PR añade soporte para el nuevo estado de enriquecimiento `WAITING_PHOTOGRAPH` en el flujo de resumen de enriquecimiento de Front QA.

  Cambios incluidos:

  - Añade la etiqueta de estado `Pendie...

- **Capturas:** 3 imágenes (descripción + 2 partes de diff)

### 4. [PR #857](https://github.com/Servicios-Liverpool-Infraestructura/automatizacion_foro_fotografico_frontend/pull/857) - refactor logistics

> Esta PR moderniza el microfrontend de logística a través de refactorizaciones incrementales centradas en la mantenibilidad, la consistencia y la limpieza segura sin cambiar el comportamiento del negoc...

- **Capturas:** 210 imágenes (descripción + 209 partes de diff)

---

## Capturas

### 1. PR #842 - skeleton loaders

Este Pull Request introduce la funcionalidad de "skeleton loaders" en la aplicación de logística. El objetivo principal es mejorar la experiencia del usuario al mostrar indicadores visuales de carga en lugar de elementos vacíos mientras se recuperan los datos.

Específicamente, se han realizado los siguientes cambios: se ha creado un componente `FileCardSkeleton` que renderiza una versión esquelética del `FileCard`, mostrando la estructura y el diseño esperado con elementos de `Skeleton`. Además, se ha modificado el componente `FiltersContainer` para que muestre `Skeleton` para los filtros de negocio, origen y estado mientras se están cargando, utilizando la nueva funcionalidad de `loading` expuesta por `useGetFunction`.

![PR #842 descripción](junio_pr842_desc.png)

**Diff (17 partes):**

![PR #842 diff](junio_pr842_diff_0.png)

![PR #842 diff](junio_pr842_diff_1.png)

![PR #842 diff](junio_pr842_diff_2.png)

![PR #842 diff](junio_pr842_diff_3.png)

![PR #842 diff](junio_pr842_diff_4.png)

![PR #842 diff](junio_pr842_diff_5.png)

![PR #842 diff](junio_pr842_diff_6.png)

![PR #842 diff](junio_pr842_diff_7.png)

![PR #842 diff](junio_pr842_diff_8.png)

![PR #842 diff](junio_pr842_diff_9.png)

![PR #842 diff](junio_pr842_diff_10.png)

![PR #842 diff](junio_pr842_diff_11.png)

![PR #842 diff](junio_pr842_diff_12.png)

![PR #842 diff](junio_pr842_diff_13.png)

![PR #842 diff](junio_pr842_diff_14.png)

![PR #842 diff](junio_pr842_diff_15.png)

![PR #842 diff](junio_pr842_diff_16.png)

---

### 2. PR #846 - GOB-1790 logistics alignment

Esta PR mejora la experiencia de usuario de la interfaz de Logística y Gestión de Usuarios.

  Cambios incluidos:

  - Normaliza el espaciado y el relleno en las subpáginas de Logística para mantener el contenido alineado durante las transiciones de ruta.
  - Actualiza el espaciado de los títulos/saludos de la página de Logística para que la navegación entre subpáginas no muestre saltos de diseño visibles.
  - Añade un hook reutilizable useDebouncedValue en @libs/hooks.
  - Refactoriza el flujo de búsqueda de Operadores para separar la entrada escrita, la búsqueda enviada, la acción de borrar, el comportamiento de desenfoque y la selección de sugerencias.
  - Aplica debounce a la búsqueda de correo electrónico de Operadores para que las solicitudes se ejecuten después de que el usuario deje de escribir.
  - Mantiene el comportamiento de búsqueda inmediata para Enter, desenfoque, "ver más", borrar y sugerencias seleccionadas.

![PR #846 descripción](junio_pr846_desc.png)

**Diff (9 partes):**

![PR #846 diff](junio_pr846_diff_0.png)

![PR #846 diff](junio_pr846_diff_1.png)

![PR #846 diff](junio_pr846_diff_2.png)

![PR #846 diff](junio_pr846_diff_3.png)

![PR #846 diff](junio_pr846_diff_4.png)

![PR #846 diff](junio_pr846_diff_5.png)

![PR #846 diff](junio_pr846_diff_6.png)

![PR #846 diff](junio_pr846_diff_7.png)

![PR #846 diff](junio_pr846_diff_8.png)

---

### 3. PR #855 - waiting photograph status

Esta PR añade soporte para el nuevo estado de enriquecimiento `WAITING_PHOTOGRAPH` en el flujo de resumen de enriquecimiento de Front QA.

  Cambios incluidos:

  - Añade la etiqueta de estado `Pendiente de imagen`.
  - Renderiza `WAITING_PHOTOGRAPH` utilizando el mismo estilo de chip verde `successTag` que se utiliza actualmente para `Finalizado`.
  - Añade `Pendiente de imagen` al filtro de estado del resumen de enriquecimiento.
  - Mapea la opción de filtro seleccionada a `WAITING_PHOTOGRAPH` para que se envíe correctamente en la solicitud de asignaciones de producto.

![PR #855 descripción](junio_pr855_desc.png)

**Diff (2 partes):**

![PR #855 diff](junio_pr855_diff_0.png)

![PR #855 diff](junio_pr855_diff_1.png)

---

### 4. PR #857 - refactor logistics

Esta PR moderniza el microfrontend de logística a través de refactorizaciones incrementales centradas en la mantenibilidad, la consistencia y la limpieza segura sin cambiar el comportamiento del negocio.

El trabajo incluye una limpieza página por página de los flujos principales de logística: Delivery, DeliveryScan, HomePicker, Inbound, Outbound, OutboundScan, PalletContainers, ScanMerch y Scanning. Varios componentes de página grandes se simplificaron extrayendo piezas de UI locales, estabilizando manejadores, normalizando el estado de las pestañas y reduciendo la lógica duplicada o innecesaria.

También elimina código muerto confirmado en los componentes de logística activos: importaciones no utilizadas, valores de hook no utilizados, props no utilizados, componentes locales inalcanzables, callbacks redundantes y estilos obsoletos. Se corrigió un pequeño error en SearchProcessChange, donde al enviar con Enter se hacía referencia a un valor indefinido en lugar del texto de búsqueda normalizado actual.

El estilo se limpió moviendo los estilos JSX en línea a módulos CSS con ámbito, manteniendo intacto el estilo de SVG/iconos para evitar regresiones visuales. Finalmente, se eliminaron los archivos de logística _deprecated previamente puestos en cuarentena después de confirmar que ya no formaban parte del árbol de origen activo.

En general, esta PR reduce la deuda técnica, mejora la consistencia del código en las páginas/componentes de logística y deja el módulo en un estado más seguro para futuros trabajos de características.

![PR #857 descripción](junio_pr857_desc.png)

**Diff (209 partes):**

![PR #857 diff](junio_pr857_diff_0.png)

![PR #857 diff](junio_pr857_diff_1.png)

![PR #857 diff](junio_pr857_diff_2.png)

![PR #857 diff](junio_pr857_diff_3.png)

![PR #857 diff](junio_pr857_diff_4.png)

![PR #857 diff](junio_pr857_diff_5.png)

![PR #857 diff](junio_pr857_diff_6.png)

![PR #857 diff](junio_pr857_diff_7.png)

![PR #857 diff](junio_pr857_diff_8.png)

![PR #857 diff](junio_pr857_diff_9.png)

![PR #857 diff](junio_pr857_diff_10.png)

![PR #857 diff](junio_pr857_diff_11.png)

![PR #857 diff](junio_pr857_diff_12.png)

![PR #857 diff](junio_pr857_diff_13.png)

![PR #857 diff](junio_pr857_diff_14.png)

![PR #857 diff](junio_pr857_diff_15.png)

![PR #857 diff](junio_pr857_diff_16.png)

![PR #857 diff](junio_pr857_diff_17.png)

![PR #857 diff](junio_pr857_diff_18.png)

![PR #857 diff](junio_pr857_diff_19.png)

![PR #857 diff](junio_pr857_diff_20.png)

![PR #857 diff](junio_pr857_diff_21.png)

![PR #857 diff](junio_pr857_diff_22.png)

![PR #857 diff](junio_pr857_diff_23.png)

![PR #857 diff](junio_pr857_diff_24.png)

![PR #857 diff](junio_pr857_diff_25.png)

![PR #857 diff](junio_pr857_diff_26.png)

![PR #857 diff](junio_pr857_diff_27.png)

![PR #857 diff](junio_pr857_diff_28.png)

![PR #857 diff](junio_pr857_diff_29.png)

![PR #857 diff](junio_pr857_diff_30.png)

![PR #857 diff](junio_pr857_diff_31.png)

![PR #857 diff](junio_pr857_diff_32.png)

![PR #857 diff](junio_pr857_diff_33.png)

![PR #857 diff](junio_pr857_diff_34.png)

![PR #857 diff](junio_pr857_diff_35.png)

![PR #857 diff](junio_pr857_diff_36.png)

![PR #857 diff](junio_pr857_diff_37.png)

![PR #857 diff](junio_pr857_diff_38.png)

![PR #857 diff](junio_pr857_diff_39.png)

![PR #857 diff](junio_pr857_diff_40.png)

![PR #857 diff](junio_pr857_diff_41.png)

![PR #857 diff](junio_pr857_diff_42.png)

![PR #857 diff](junio_pr857_diff_43.png)

![PR #857 diff](junio_pr857_diff_44.png)

![PR #857 diff](junio_pr857_diff_45.png)

![PR #857 diff](junio_pr857_diff_46.png)

![PR #857 diff](junio_pr857_diff_47.png)

![PR #857 diff](junio_pr857_diff_48.png)

![PR #857 diff](junio_pr857_diff_49.png)

![PR #857 diff](junio_pr857_diff_50.png)

![PR #857 diff](junio_pr857_diff_51.png)

![PR #857 diff](junio_pr857_diff_52.png)

![PR #857 diff](junio_pr857_diff_53.png)

![PR #857 diff](junio_pr857_diff_54.png)

![PR #857 diff](junio_pr857_diff_55.png)

![PR #857 diff](junio_pr857_diff_56.png)

![PR #857 diff](junio_pr857_diff_57.png)

![PR #857 diff](junio_pr857_diff_58.png)

![PR #857 diff](junio_pr857_diff_59.png)

![PR #857 diff](junio_pr857_diff_60.png)

![PR #857 diff](junio_pr857_diff_61.png)

![PR #857 diff](junio_pr857_diff_62.png)

![PR #857 diff](junio_pr857_diff_63.png)

![PR #857 diff](junio_pr857_diff_64.png)

![PR #857 diff](junio_pr857_diff_65.png)

![PR #857 diff](junio_pr857_diff_66.png)

![PR #857 diff](junio_pr857_diff_67.png)

![PR #857 diff](junio_pr857_diff_68.png)

![PR #857 diff](junio_pr857_diff_69.png)

![PR #857 diff](junio_pr857_diff_70.png)

![PR #857 diff](junio_pr857_diff_71.png)

![PR #857 diff](junio_pr857_diff_72.png)

![PR #857 diff](junio_pr857_diff_73.png)

![PR #857 diff](junio_pr857_diff_74.png)

![PR #857 diff](junio_pr857_diff_75.png)

![PR #857 diff](junio_pr857_diff_76.png)

![PR #857 diff](junio_pr857_diff_77.png)

![PR #857 diff](junio_pr857_diff_78.png)

![PR #857 diff](junio_pr857_diff_79.png)

![PR #857 diff](junio_pr857_diff_80.png)

![PR #857 diff](junio_pr857_diff_81.png)

![PR #857 diff](junio_pr857_diff_82.png)

![PR #857 diff](junio_pr857_diff_83.png)

![PR #857 diff](junio_pr857_diff_84.png)

![PR #857 diff](junio_pr857_diff_85.png)

![PR #857 diff](junio_pr857_diff_86.png)

![PR #857 diff](junio_pr857_diff_87.png)

![PR #857 diff](junio_pr857_diff_88.png)

![PR #857 diff](junio_pr857_diff_89.png)

![PR #857 diff](junio_pr857_diff_90.png)

![PR #857 diff](junio_pr857_diff_91.png)

![PR #857 diff](junio_pr857_diff_92.png)

![PR #857 diff](junio_pr857_diff_93.png)

![PR #857 diff](junio_pr857_diff_94.png)

![PR #857 diff](junio_pr857_diff_95.png)

![PR #857 diff](junio_pr857_diff_96.png)

![PR #857 diff](junio_pr857_diff_97.png)

![PR #857 diff](junio_pr857_diff_98.png)

![PR #857 diff](junio_pr857_diff_99.png)

![PR #857 diff](junio_pr857_diff_100.png)

![PR #857 diff](junio_pr857_diff_101.png)

![PR #857 diff](junio_pr857_diff_102.png)

![PR #857 diff](junio_pr857_diff_103.png)

![PR #857 diff](junio_pr857_diff_104.png)

![PR #857 diff](junio_pr857_diff_105.png)

![PR #857 diff](junio_pr857_diff_106.png)

![PR #857 diff](junio_pr857_diff_107.png)

![PR #857 diff](junio_pr857_diff_108.png)

![PR #857 diff](junio_pr857_diff_109.png)

![PR #857 diff](junio_pr857_diff_110.png)

![PR #857 diff](junio_pr857_diff_111.png)

![PR #857 diff](junio_pr857_diff_112.png)

![PR #857 diff](junio_pr857_diff_113.png)

![PR #857 diff](junio_pr857_diff_114.png)

![PR #857 diff](junio_pr857_diff_115.png)

![PR #857 diff](junio_pr857_diff_116.png)

![PR #857 diff](junio_pr857_diff_117.png)

![PR #857 diff](junio_pr857_diff_118.png)

![PR #857 diff](junio_pr857_diff_119.png)

![PR #857 diff](junio_pr857_diff_120.png)

![PR #857 diff](junio_pr857_diff_121.png)

![PR #857 diff](junio_pr857_diff_122.png)

![PR #857 diff](junio_pr857_diff_123.png)

![PR #857 diff](junio_pr857_diff_124.png)

![PR #857 diff](junio_pr857_diff_125.png)

![PR #857 diff](junio_pr857_diff_126.png)

![PR #857 diff](junio_pr857_diff_127.png)

![PR #857 diff](junio_pr857_diff_128.png)

![PR #857 diff](junio_pr857_diff_129.png)

![PR #857 diff](junio_pr857_diff_130.png)

![PR #857 diff](junio_pr857_diff_131.png)

![PR #857 diff](junio_pr857_diff_132.png)

![PR #857 diff](junio_pr857_diff_133.png)

![PR #857 diff](junio_pr857_diff_134.png)

![PR #857 diff](junio_pr857_diff_135.png)

![PR #857 diff](junio_pr857_diff_136.png)

![PR #857 diff](junio_pr857_diff_137.png)

![PR #857 diff](junio_pr857_diff_138.png)

![PR #857 diff](junio_pr857_diff_139.png)

![PR #857 diff](junio_pr857_diff_140.png)

![PR #857 diff](junio_pr857_diff_141.png)

![PR #857 diff](junio_pr857_diff_142.png)

![PR #857 diff](junio_pr857_diff_143.png)

![PR #857 diff](junio_pr857_diff_144.png)

![PR #857 diff](junio_pr857_diff_145.png)

![PR #857 diff](junio_pr857_diff_146.png)

![PR #857 diff](junio_pr857_diff_147.png)

![PR #857 diff](junio_pr857_diff_148.png)

![PR #857 diff](junio_pr857_diff_149.png)

![PR #857 diff](junio_pr857_diff_150.png)

![PR #857 diff](junio_pr857_diff_151.png)

![PR #857 diff](junio_pr857_diff_152.png)

![PR #857 diff](junio_pr857_diff_153.png)

![PR #857 diff](junio_pr857_diff_154.png)

![PR #857 diff](junio_pr857_diff_155.png)

![PR #857 diff](junio_pr857_diff_156.png)

![PR #857 diff](junio_pr857_diff_157.png)

![PR #857 diff](junio_pr857_diff_158.png)

![PR #857 diff](junio_pr857_diff_159.png)

![PR #857 diff](junio_pr857_diff_160.png)

![PR #857 diff](junio_pr857_diff_161.png)

![PR #857 diff](junio_pr857_diff_162.png)

![PR #857 diff](junio_pr857_diff_163.png)

![PR #857 diff](junio_pr857_diff_164.png)

![PR #857 diff](junio_pr857_diff_165.png)

![PR #857 diff](junio_pr857_diff_166.png)

![PR #857 diff](junio_pr857_diff_167.png)

![PR #857 diff](junio_pr857_diff_168.png)

![PR #857 diff](junio_pr857_diff_169.png)

![PR #857 diff](junio_pr857_diff_170.png)

![PR #857 diff](junio_pr857_diff_171.png)

![PR #857 diff](junio_pr857_diff_172.png)

![PR #857 diff](junio_pr857_diff_173.png)

![PR #857 diff](junio_pr857_diff_174.png)

![PR #857 diff](junio_pr857_diff_175.png)

![PR #857 diff](junio_pr857_diff_176.png)

![PR #857 diff](junio_pr857_diff_177.png)

![PR #857 diff](junio_pr857_diff_178.png)

![PR #857 diff](junio_pr857_diff_179.png)

![PR #857 diff](junio_pr857_diff_180.png)

![PR #857 diff](junio_pr857_diff_181.png)

![PR #857 diff](junio_pr857_diff_182.png)

![PR #857 diff](junio_pr857_diff_183.png)

![PR #857 diff](junio_pr857_diff_184.png)

![PR #857 diff](junio_pr857_diff_185.png)

![PR #857 diff](junio_pr857_diff_186.png)

![PR #857 diff](junio_pr857_diff_187.png)

![PR #857 diff](junio_pr857_diff_188.png)

![PR #857 diff](junio_pr857_diff_189.png)

![PR #857 diff](junio_pr857_diff_190.png)

![PR #857 diff](junio_pr857_diff_191.png)

![PR #857 diff](junio_pr857_diff_192.png)

![PR #857 diff](junio_pr857_diff_193.png)

![PR #857 diff](junio_pr857_diff_194.png)

![PR #857 diff](junio_pr857_diff_195.png)

![PR #857 diff](junio_pr857_diff_196.png)

![PR #857 diff](junio_pr857_diff_197.png)

![PR #857 diff](junio_pr857_diff_198.png)

![PR #857 diff](junio_pr857_diff_199.png)

![PR #857 diff](junio_pr857_diff_200.png)

![PR #857 diff](junio_pr857_diff_201.png)

![PR #857 diff](junio_pr857_diff_202.png)

![PR #857 diff](junio_pr857_diff_203.png)

![PR #857 diff](junio_pr857_diff_204.png)

![PR #857 diff](junio_pr857_diff_205.png)

![PR #857 diff](junio_pr857_diff_206.png)

![PR #857 diff](junio_pr857_diff_207.png)

![PR #857 diff](junio_pr857_diff_208.png)

---

