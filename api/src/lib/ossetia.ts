export const OSSETIA_CITIES = [
  'Владикавказ',
  'Беслан',
  'Моздок',
  'Алагир',
  'Ардон',
  'Дигора',
  'Архонская',
  'Эльхотово',
  'Октябрьское',
  'Чикола',
  'Гизель',
  'Ногир',
  'Михайловское',
  'Заводской',
  'Сунжа',
  'Хумалаг',
  'Ир',
  'Майрамадаг',
  'Кадгарон',
  'Ольгинское',
] as const;

export type OssetiaCity = (typeof OSSETIA_CITIES)[number];

export function isOssetiaCity(value: string): value is OssetiaCity {
  return (OSSETIA_CITIES as readonly string[]).includes(value);
}
