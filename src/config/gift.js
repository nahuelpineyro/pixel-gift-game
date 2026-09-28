/**
 * ============================================================================
 *  THIS IS THE ONLY FILE YOU NEED TO EDIT.
 * ============================================================================
 *
 *  Everything the player reads lives here. Change the names, the memories and
 *  the letter, and the game becomes yours. No other file has to be touched.
 *
 *  Writing rules the engine enforces:
 *    - Text is drawn with a 5x7 bitmap font and shown in UPPERCASE.
 *    - Supported: A-Z 0-9 . , ! ? ¿ ¡ ' " - _ : ; ( ) + * / = < > % & @ #
 *      and the accented Á É Í Ó Ú Ñ Ü.
 *    - Anything else is replaced by "?", so avoid emoji.
 *    - Use "\n" for a hard line break. Otherwise lines wrap on their own.
 *    - Each string in `lines` is one dialogue box. Keep them short.
 */

export const GIFT = {
  /** Who the game is for, and who it is from. */
  herName: 'MI AMOR',
  yourName: 'YO',

  /** Title screen. */
  title: 'PARA VOS',
  subtitle: 'UNA PEQUEÑA AVENTURA',
  pressStart: 'TOCÁ PARA EMPEZAR',

  /** Shown once, when the room scene starts for the first time. */
  intro: [
    'ESTE ES NUESTRO CUARTO.',
    'HAY SEIS COSAS ACÁ QUE GUARDAN\nUN RECUERDO NUESTRO.',
    'ENCONTRALOS TODOS Y LA PUERTA\nSE VA A ABRIR.',
  ],

  /**
   * The six memories. Order here is the order they are counted in, but she
   * can find them in any order. Keep exactly six unless you also edit the
   * room layout in src/scenes/RoomScene.js.
   */
  memories: [
    {
      id: 'almendra',
      name: 'ALMENDRA',
      lines: [
        'ALMENDRA.\nLA PERRITA QUE AMAMOS TANTO.',
        'MEDIO METRO DE PERRA\nY DOS METROS DE AMOR.',
        'ELLA YA ERA TUYA\nMUCHO ANTES DE CONOCERNOS.',
        'Y UN DÍA ME HIZO LUGAR\nEN SU MANADA.',
      ],
    },
    {
      id: 'mug',
      name: 'EL CAFÉ',
      lines: [
        'EL CAFÉ QUE COMPARTIMOS\nTODOS LOS DÍAS.',
        'NO FALTÓ NI UNO SOLO.\nNI UNO.',
      ],
    },
    {
      id: 'bed',
      name: 'LA CAMA',
      lines: [
        'LA CAMA DE LA QUE NO QUEREMOS\nSALIR AL DESPERTAR.',
        'CINCO MINUTOS MÁS.\nSIEMPRE CINCO MINUTOS MÁS.',
      ],
    },
    {
      id: 'bottle',
      name: 'EL LUBRICANTE',
      lines: [
        'EL LUBRICANTE DEL AMOR.',
        'NO PREGUNTES QUÉ HACE ACÁ.\nYA SABÉS MUY BIEN QUÉ HACE ACÁ.',
      ],
    },
    {
      id: 'oven',
      name: 'EL HORNO',
      lines: ['NUESTROS VINOS Y PIZZAS\nCASEROS.'],
    },
    {
      id: 'letter',
      name: 'LA CARTA',
      lines: [
        'LA LISTA DE TODAS LAS OBRAS\nQUE HICIMOS JUNTOS EN LA CASA.',
        'CADA PARED, CADA MUEBLE,\nCADA COSA QUE ARREGLAMOS.',
        'NO CONSTRUIMOS UNA CASA.\nCONSTRUIMOS NUESTRA CASA.',
      ],
    },
  ],

  /** Flavour text for the props that are not memories. */
  scenery: {},

  /** The door out of the room. */
  door: {
    locked: ['TODAVÍA FALTA ALGO.\nSEGUÍ BUSCANDO.'],
    unlocked: ['LA PUERTA SE ABRIÓ.'],
    hintFound: 'FALTAN {n}',
    allFound: ['LOS ENCONTRASTE TODOS.', 'ESCUCHÁ... LA PUERTA.'],
  },

  /** The balcony, right after stepping outside. */
  balcony: {
    arrival: [
      'SALISTE.',
      'ESTA NOCHE LAS ESTRELLAS\nBAJARON UN POCO MÁS.',
      'DICEN QUE VINIERON A VERTE.',
      'Y TE DEJARON ALGO\nEN LA BARANDA.',
    ],
  },

  /**
   * The ending. This is the actual gift — take your time with it.
   * Each string is one screen of text.
   */
  letter: [
    'NO SÉ HACER JUEGOS.',
    'APRENDÍ A HACER ESTE\nPORQUE ERA PARA VOS.',
    'CADA COSA QUE ENCONTRASTE\nPASÓ DE VERDAD.',
    'Y ME ACUERDO DE TODAS.',
    'GRACIAS POR CADA DÍA COMÚN,\nQUE AL FINAL SON LOS QUE CUENTAN.',
    'AUNQUE DISCUTAMOS Y TENGAMOS\nMOMENTOS DIFÍCILES,',
    'QUIERO QUE SEPAS QUE SIEMPRE\nTE VOY A AMAR.',
    'TE AMO.',
  ],

  /** The very last line, held on screen under the hearts. */
  signature: 'FIN  ♥',
};

/** Convenience lookups used by the scenes. */
export const MEMORY_IDS = GIFT.memories.map((memory) => memory.id);
export const MEMORY_COUNT = GIFT.memories.length;
export const memoryById = (id) => GIFT.memories.find((memory) => memory.id === id);
