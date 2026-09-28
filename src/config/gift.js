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
    'HAY CINCO COSAS ACÁ QUE GUARDAN\nUN RECUERDO NUESTRO.',
    'ENCONTRALOS TODOS Y LA PUERTA\nSE VA A ABRIR.',
  ],

  /**
   * The five memories. Order here is the order they are counted in, but she
   * can find them in any order. Keep exactly five unless you also edit the
   * room layout in src/scenes/RoomScene.js.
   */
  memories: [
    {
      id: 'photo',
      name: 'LA FOTO',
      lines: [
        'LA PRIMERA FOTO QUE NOS SACAMOS\nJUNTOS.',
        'SALIMOS LOS DOS CON CARA RARA\nY IGUAL ES MI FAVORITA.',
      ],
    },
    {
      id: 'window',
      name: 'LA VENTANA',
      lines: [
        'ACÁ NOS QUEDAMOS MIRANDO\nLA CIUDAD HASTA TARDE.',
        'VOS DIJISTE QUE LAS LUCES\nPARECÍAN ESTRELLAS CAÍDAS.',
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
      id: 'almendra',
      name: 'ALMENDRA',
      lines: [
        'ALMENDRA.\nLA PERRITA QUE AMAMOS TANTO.',
        'MEDIO METRO DE PERRA\nY DOS METROS DE AMOR.',
        'NOS ELIGIÓ A LOS DOS\nEL MISMO DÍA.',
      ],
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
  scenery: {
    bed: [
      'LA CAMA DE LA QUE NO QUEREMOS\nSALIR AL DESPERTAR.',
      'CINCO MINUTOS MÁS.\nSIEMPRE CINCO MINUTOS MÁS.',
    ],
    bottle: [
      'EL LUBRICANTE DEL AMOR.',
      'NO PREGUNTES QUÉ HACE ACÁ.\nYA SABÉS MUY BIEN QUÉ HACE ACÁ.',
    ],
    plant: ['LA PLANTA QUE JURASTE\nQUE IBAS A MATAR.', 'SIGUE VIVA. COMO NOSOTROS.'],
    rug: ['ACÁ BAILAMOS UNA VEZ,\nSIN MÚSICA.'],
  },

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
      'ES LA MISMA CIUDAD DE SIEMPRE,\nPERO DE NOCHE ES OTRA COSA.',
      'HAY ALGO ESPERÁNDOTE\nEN LA BARANDA.',
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
    'TE AMO.',
  ],

  /** The very last line, held on screen under the hearts. */
  signature: 'FIN  ♥',

  /** Shown on the title screen once the game has been finished. */
  replayNote: 'YA LA TERMINASTE  ★',
};

/** Convenience lookups used by the scenes. */
export const MEMORY_IDS = GIFT.memories.map((memory) => memory.id);
export const MEMORY_COUNT = GIFT.memories.length;
export const memoryById = (id) => GIFT.memories.find((memory) => memory.id === id);
