import { ELanguages, ELanguageTitle } from '../../../types'
import { IUser } from '../../../types'

enum EFlags_en {
  nsfw = 'NSFW',
  religious = 'religious',
  political = 'political',
  racist = 'racist',
  sexist = 'sexist',
  explicit = 'explicit',
}

enum EFlags_es {
  nsfw = 'NSFW',
  religious = 'religioso',
  political = 'político',
  racist = 'racista',
  sexist = 'sexista',
  explicit = 'explícito',
}

enum EFlags_fr {
  nsfw = 'NSFW',
  religious = 'religieux',
  political = 'politique',
  racist = 'raciste',
  sexist = 'sexiste',
  explicit = 'explicite',
}

enum EFlags_de {
  nsfw = 'NSFW',
  religious = 'religiös',
  political = 'politisch',
  racist = 'rassistisch',
  sexist = 'sexistisch',
  explicit = 'explizit',
}

enum EFlags_pt {
  nsfw = 'NSFW',
  religious = 'religioso',
  political = 'político',
  racist = 'racista',
  sexist = 'sexista',
  explicit = 'explícito',
}

enum EFlags_cs {
  nsfw = 'NSFW',
  religious = 'náboženský',
  political = 'politický',
  racist = 'rasistický',
  sexist = 'sexistický',
  explicit = 'explicitní',
}
enum EFlags_fi {
  nsfw = 'NSFW',
  religious = 'uskonnollinen',
  political = 'poliittinen',
  racist = 'rasistinen',
  sexist = 'seksistinen',
  explicit = 'sopimaton',
}
export interface TFlagsLanguages {
  en: EFlags_en
  es: EFlags_es
  fr: EFlags_fr
  de: EFlags_de
  pt: EFlags_pt
  cs: EFlags_cs
  fi: EFlags_fi
}

export interface IFlagsLanguages {
  en: typeof EFlags_en
  es: typeof EFlags_es
  fr: typeof EFlags_fr
  de: typeof EFlags_de
  pt: typeof EFlags_pt
  cs: typeof EFlags_cs
  fi: typeof EFlags_fi
}

export type EFlags = TFlagsLanguages[keyof TFlagsLanguages]

export const FlagsLanguage: IFlagsLanguages = {
  en: {
    nsfw: EFlags_en.nsfw,
    religious: EFlags_en.religious,
    political: EFlags_en.political,
    racist: EFlags_en.racist,
    sexist: EFlags_en.sexist,
    explicit: EFlags_en.explicit,
  },
  es: {
    nsfw: EFlags_es.nsfw,
    religious: EFlags_es.religious,
    political: EFlags_es.political,
    racist: EFlags_es.racist,
    sexist: EFlags_es.sexist,
    explicit: EFlags_es.explicit,
  },
  fr: {
    nsfw: EFlags_fr.nsfw,
    religious: EFlags_fr.religious,
    political: EFlags_fr.political,
    racist: EFlags_fr.racist,
    sexist: EFlags_fr.sexist,
    explicit: EFlags_fr.explicit,
  },
  de: {
    nsfw: EFlags_de.nsfw,
    religious: EFlags_de.religious,
    political: EFlags_de.political,
    racist: EFlags_de.racist,
    sexist: EFlags_de.sexist,
    explicit: EFlags_de.explicit,
  },
  pt: {
    nsfw: EFlags_pt.nsfw,
    religious: EFlags_pt.religious,
    political: EFlags_pt.political,
    racist: EFlags_pt.racist,
    sexist: EFlags_pt.sexist,
    explicit: EFlags_pt.explicit,
  },
  cs: {
    nsfw: EFlags_cs.nsfw,
    religious: EFlags_cs.religious,
    political: EFlags_cs.political,
    racist: EFlags_cs.racist,
    sexist: EFlags_cs.sexist,
    explicit: EFlags_cs.explicit,
  },
  fi: {
    nsfw: EFlags_fi.nsfw,
    religious: EFlags_fi.religious,
    political: EFlags_fi.political,
    racist: EFlags_fi.racist,
    sexist: EFlags_fi.sexist,
    explicit: EFlags_fi.explicit,
  },
}

export enum ECategory_en {
  // Any = 'Any',
  Misc = 'Misc',
  Programming = 'Programming',
  Dark = 'Dark',
  Pun = 'Pun',
  Spooky = 'Spooky',
  Christmas = 'Christmas',
  ChuckNorris = 'Chuck Norris',
  DadJoke = 'Dad Joke',
}
export enum ECategory_es {
  // Any = 'Cualquiera',
  Misc = 'Varios',
  Programming = 'Programación',
  Dark = 'Oscuro',
  Pun = 'Juego de palabras',
  Spooky = 'Espeluznante',
  Christmas = 'Navidad',
  ChuckNorris = 'Chuck Norris',
  DadJoke = 'Chiste de papá',
}
export enum ECategory_fr {
  // Any = "N'importe quel",
  Misc = 'Divers',
  Programming = 'Programmation',
  Dark = 'Sombre',
  Pun = 'Jeu de mots',
  Spooky = 'Effrayant',
  Christmas = 'Noël',
  ChuckNorris = 'Chuck Norris',
  DadJoke = 'Blague de papa',
}
export enum ECategory_de {
  // Any = 'Jede',
  Misc = 'Verschiedenes',
  Programming = 'Programmierung',
  Dark = 'Dunkel',
  Pun = 'Wortspiel',
  Spooky = 'Unheimlich',
  Christmas = 'Weihnachten',
  ChuckNorris = 'Chuck Norris',
  DadJoke = 'Papa-Witz',
}
export enum ECategory_pt {
  // Any = 'Qualquer',
  Misc = 'Diversos',
  Programming = 'Programação',
  Dark = 'Escuro',
  Pun = 'Jogo de palavras',
  Spooky = 'Assustador',
  Christmas = 'Natal',
  ChuckNorris = 'Chuck Norris',
  DadJoke = 'Piada de pai',
}
export enum ECategory_cs {
  // Any = 'Jakýkoliv',
  Misc = 'Různé',
  Programming = 'Programování',
  Dark = 'Temný',
  Pun = 'Hra slov',
  Spooky = 'Strašidelný',
  Christmas = 'Vánoce',
  ChuckNorris = 'Chuck Norris',
  DadJoke = 'Otcovský vtip',
}
//translated to Finnish´:
export enum ECategory_fi {
  // Any = 'Mikä tahansa',
  Misc = 'Sekalaista',
  Programming = 'Ohjelmointi',
  Dark = 'Synkkä',
  Pun = 'Sanaleikki',
  Spooky = 'Halloween',
  Christmas = 'Joulu',
  ChuckNorris = 'Chuck Norris',
  DadJoke = 'Iskävitsi',
}
export const CategoryByLanguagesConst = {
  en: ECategory_en,
  es: ECategory_es,
  fr: ECategory_fr,
  de: ECategory_de,
  pt: ECategory_pt,
  cs: ECategory_cs,
  fi: ECategory_fi,
}
export interface CategoryByLanguages {
  en: ECategory_en
  es: ECategory_es
  fr: ECategory_fr
  de: ECategory_de
  pt: ECategory_pt
  cs: ECategory_cs
  fi: ECategory_fi
}

//export type ECategory = CategoryByLanguages[keyof CategoryByLanguages]
export enum ECategories {
  Misc = 'Misc',
  Programming = 'Programming',
  Dark = 'Dark',
  Pun = 'Pun',
  Spooky = 'Spooky',
  Christmas = 'Christmas',
  ChuckNorris = 'ChuckNorris',
  DadJoke = 'DadJoke',
}

export interface IJokeCategoryByLanguage {
  en: typeof ECategory_en
  es: typeof ECategory_es
  fr: typeof ECategory_fr
  de: typeof ECategory_de
  pt: typeof ECategory_pt
  cs: typeof ECategory_cs
  fi: typeof ECategory_fi
}

export type TCategoryByLanguages =
  | typeof ECategory_en
  | typeof ECategory_cs
  | typeof ECategory_de
  | typeof ECategory_es
  | typeof ECategory_fr
  | typeof ECategory_pt
  | typeof ECategory_fi

export enum EJokeType {
  single = 'single',
  twopart = 'twopart',
}
export enum ESafemode {
  Safe = '&safe-mode',
  Unsafe = '',
}

export enum EContains {
  Contains = '?contains=',
  DoesNotContain = '',
}
export enum EQueryKey {
  Contains = 'contains=',
  None = '',
}

export interface IJokeCommonFields {
  _id?: string
  id?: string | undefined
  jokeId: string
  type: EJokeType
  category: ECategories
  subCategories: string[] | undefined
  language: ELanguages
  safe: boolean
  user: IUser['_id'][]
  flags: {
    nsfw: boolean
    religious: boolean
    political: boolean
    racist: boolean
    sexist: boolean
    explicit: boolean
  }
  private?: boolean // only for submitted jokes
  verified?: boolean
  anonymous?: boolean
  author?: IUser['_id']
  createdAt?: string
  updatedAt?: string
}

export interface IJokeSingle extends IJokeCommonFields {
  type: EJokeType.single
  joke: string
}

export interface IJokeTwoPart extends IJokeCommonFields {
  type: EJokeType.twopart
  setup: string
  delivery: string
}

export type IJoke = IJokeSingle | IJokeTwoPart

export interface INorrisJoke {
  categories: string[]
  icon_url: string
  id: string
  url: string
  value: string
}

export interface IDadJoke {
  id: string
  joke: string
  status: number
}

export interface IJokeType {
  _id?: string
  type: EJokeType
  createdAt?: string
  updatedAt?: string
}

export interface IJokeSubmissionSingleJSON {
  formatVersion: number
  category: ECategories
  type: EJokeType
  joke: string
  flags: {
    nsfw: boolean
    religious: boolean
    political: boolean
    racist: boolean
    sexist: boolean
    explicit: boolean
  }
  lang: ELanguages
}

export interface IJokeSubmissionTwoPartJSON {
  formatVersion: number
  category: ECategories
  type: EJokeType
  setup: string
  delivery: string
  flags: {
    nsfw: boolean
    religious: boolean
    political: boolean
    racist: boolean
    sexist: boolean
    explicit: boolean
  }
  lang: ELanguages
}

export enum EExtraCategories {
  none = 'None',
  ChuckNorris = 'Chuck Norris',
  DadJokes = 'Dad Jokes',
}

enum EAuthor {
  en = 'Author',
  es = 'Autor',
  fr = 'Auteur',
  de = 'Autor',
  pt = 'Autor',
  cs = 'Autor',
  fi = 'Tekijä',
}

enum EAge {
  en = 'Age',
  es = 'Edad',
  fr = 'Âge',
  de = 'Alter',
  pt = 'Idade',
  cs = 'Věk',
  fi = 'Ikä',
}

enum EPopularity {
  en = 'Popularity',
  es = 'Popularidad',
  fr = 'Popularité',
  de = 'Beliebtheit',
  pt = 'Popularidade',
  cs = 'Oblíbenost',
  fi = 'Suosio',
}
enum ECategoryTitle {
  en = 'Category',
  es = 'Categoría',
  fr = 'Catégorie',
  de = 'Kategorie',
  pt = 'Categoria',
  cs = 'Kategorie',
  fi = 'Kategoria',
}

export const ESortBy = {
  popularity: EPopularity,
  language: ELanguageTitle,
  category: ECategoryTitle,
  name: EAuthor,
  age: EAge,
}

export interface ILang {
  en: string
  es: string
  fr: string
  de: string
  pt: string
  cs: string
  fi: string
}
export interface INorrisCatTran {
  any: ILang
  animal: ILang
  career: ILang
  celebrity: ILang
  dev: ILang
  fashion: ILang
  food: ILang
  history: ILang
  money: ILang
  movie: ILang
  music: ILang
  science: ILang
  sport: ILang
  travel: ILang
}
export const norrisCategoryTranslations: INorrisCatTran = {
  any: {
    en: 'Any',
    es: 'Cualquiera',
    fr: "N'importe quel",
    de: 'Jede',
    pt: 'Qualquer',
    cs: 'Jakýkoliv',
    fi: 'Mikä tahansa',
  },
  animal: {
    en: 'Animal',
    es: 'Animal',
    fr: 'Animal',
    de: 'Tier',
    pt: 'Animal',
    cs: 'Zvíře',
    fi: 'Eläin',
  },
  career: {
    en: 'Career',
    es: 'Carrera',
    fr: 'Carrière',
    de: 'Karriere',
    pt: 'Carreira',
    cs: 'Kariéra',
    fi: 'Ura',
  },
  celebrity: {
    en: 'Celebrity',
    es: 'Celebridad',
    fr: 'Célébrité',
    de: 'Berühmtheit',
    pt: 'Celebridade',
    cs: 'Celebrity',
    fi: 'Julkkis',
  },
  dev: {
    en: 'Dev',
    es: 'Dev',
    fr: 'Dev',
    de: 'Dev',
    pt: 'Dev',
    cs: 'Dev',
    fi: 'Dev',
  },
  fashion: {
    en: 'Fashion',
    es: 'Moda',
    fr: 'Mode',
    de: 'Mode',
    pt: 'Moda',
    cs: 'Móda',
    fi: 'Muoti',
  },
  food: {
    en: 'Food',
    es: 'Comida',
    fr: 'Nourriture',
    de: 'Essen',
    pt: 'Comida',
    cs: 'Jídlo',
    fi: 'Ruoka',
  },
  history: {
    en: 'History',
    es: 'Historia',
    fr: 'Histoire',
    de: 'Geschichte',
    pt: 'História',
    cs: 'Historie',
    fi: 'Historia',
  },
  money: {
    en: 'Money',
    es: 'Dinero',
    fr: 'Argent',
    de: 'Geld',
    pt: 'Dinheiro',
    cs: 'Peníze',
    fi: 'Raha',
  },
  movie: {
    en: 'Movie',
    es: 'Película',
    fr: 'Film',
    de: 'Film',
    pt: 'Filme',
    cs: 'Film',
    fi: 'Elokuva',
  },
  music: {
    en: 'Music',
    es: 'Música',
    fr: 'Musique',
    de: 'Musik',
    pt: 'Música',
    cs: 'Hudba',
    fi: 'Musiikki',
  },
  science: {
    en: 'Science',
    es: 'Ciencia',
    fr: 'Science',
    de: 'Wissenschaft',
    pt: 'Ciência',
    cs: 'Věda',
    fi: 'Tiede',
  },
  sport: {
    en: 'Sport',
    es: 'Deporte',
    fr: 'Sport',
    de: 'Sport',
    pt: 'Esporte',
    cs: 'Sport',
    fi: 'Urheilu',
  },
  travel: {
    en: 'Travel',
    es: 'Viaje',
    fr: 'Voyage',
    de: 'Reise',
    pt: 'Viagem',
    cs: 'Cestování',
    fi: 'Matkustaminen',
  },
}

export const jokeCategoryByLanguage: IJokeCategoryByLanguage = {
  en: {
    Programming: ECategory_en.Programming,
    Misc: ECategory_en.Misc,
    Dark: ECategory_en.Dark,
    Pun: ECategory_en.Pun,
    Spooky: ECategory_en.Spooky,
    Christmas: ECategory_en.Christmas,
    ChuckNorris: ECategory_en.ChuckNorris,
    DadJoke: ECategory_en.DadJoke,
  },
  es: {
    Programming: ECategory_es.Programming,
    Misc: ECategory_es.Misc,
    Dark: ECategory_es.Dark,
    Pun: ECategory_es.Pun,
    Spooky: ECategory_es.Spooky,
    Christmas: ECategory_es.Christmas,
    ChuckNorris: ECategory_es.ChuckNorris,
    DadJoke: ECategory_es.DadJoke,
  },
  fr: {
    Programming: ECategory_fr.Programming,
    Misc: ECategory_fr.Misc,
    Dark: ECategory_fr.Dark,
    Pun: ECategory_fr.Pun,
    Spooky: ECategory_fr.Spooky,
    Christmas: ECategory_fr.Christmas,
    ChuckNorris: ECategory_fr.ChuckNorris,
    DadJoke: ECategory_fr.DadJoke,
  },
  de: {
    Programming: ECategory_de.Programming,
    Misc: ECategory_de.Misc,
    Dark: ECategory_de.Dark,
    Pun: ECategory_de.Pun,
    Spooky: ECategory_de.Spooky,
    Christmas: ECategory_de.Christmas,
    ChuckNorris: ECategory_de.ChuckNorris,
    DadJoke: ECategory_de.DadJoke,
  },
  pt: {
    Programming: ECategory_pt.Programming,
    Misc: ECategory_pt.Misc,
    Dark: ECategory_pt.Dark,
    Pun: ECategory_pt.Pun,
    Spooky: ECategory_pt.Spooky,
    Christmas: ECategory_pt.Christmas,
    ChuckNorris: ECategory_pt.ChuckNorris,
    DadJoke: ECategory_pt.DadJoke,
  },
  cs: {
    Programming: ECategory_cs.Programming,
    Misc: ECategory_cs.Misc,
    Dark: ECategory_cs.Dark,
    Pun: ECategory_cs.Pun,
    Spooky: ECategory_cs.Spooky,
    Christmas: ECategory_cs.Christmas,
    ChuckNorris: ECategory_cs.ChuckNorris,
    DadJoke: ECategory_cs.DadJoke,
  },
  fi: {
    Programming: ECategory_fi.Programming,
    Misc: ECategory_fi.Misc,
    Dark: ECategory_fi.Dark,
    Pun: ECategory_fi.Pun,
    Spooky: ECategory_fi.Spooky,
    Christmas: ECategory_fi.Christmas,
    ChuckNorris: ECategory_fi.ChuckNorris,
    DadJoke: ECategory_fi.DadJoke,
  },
}

export const jokeCategoryAny = {
  en: 'Any',
  es: 'Cualquiera',
  fr: "N'importe quel",
  de: 'Irgendein',
  pt: 'Qualquer',
  cs: 'Jakýkoliv',
  fi: 'Mikä tahansa',
}
export enum EJokeSetup {
  en = 'Setup',
  es = 'Configurar',
  fr = 'Configuration',
  de = 'Einrichtung',
  pt = 'Configuração',
  cs = 'Nastavení',
  fi = 'Pohjustus',
}
export enum EJokeDelivery {
  en = 'Punchline',
  es = 'Remate',
  fr = 'Pointe',
  de = 'Pointe',
  pt = 'Punchline',
  cs = 'Pointe',
  fi = 'Huipennus',
}

export interface IJokeContent {
  success: boolean
  message: string
  joke: IJoke
}

export interface IJokeContentError {
  success: boolean
  message: string
  error: unknown
}

export interface IJokeResponse {
  success: boolean
  message: string
  joke: IJoke | null
  error?: unknown
}
