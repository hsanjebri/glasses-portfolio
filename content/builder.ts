import type { PhotoKey } from './photos'
import type {
  AddOnId,
  BuilderConfig,
  BuilderOption,
  CaseId,
  CoatingId,
  Colourway,
  FrameShape,
  LensTier,
  LensType,
  SizeKey,
} from './types'

/**
 * Every option and price in the configurator. Prices are TND deltas against
 * BASE_PRICE. The configurator builds a frame in the shop's own workshop.
 * PLACEHOLDER — every price in this file.
 */

export const BASE_PRICE = 480 // PLACEHOLDER — the bare frame, no lenses

export const ENGRAVING_PRICE = 25 // PLACEHOLDER
export const ENGRAVING_MAX = 3
export const GIFT_BOX_PRICE = 60 // PLACEHOLDER

/* ── Étape 1 : la monture ── */

/**
 * A shape may restrict the materials it can be made in. When
 * `onlyColourways` is set, every other colourway renders disabled with
 * `colourwayReason` as the explanation.
 */
export type ShapeOption = BuilderOption<FrameShape> & {
  photo: PhotoKey
  onlyColourways?: string[]
  colourwayReason?: string
}

export const shapeOptions: ShapeOption[] = [
  { id: 'round', label: 'Ronde', blurb: 'Adoucit un visage anguleux. La plus discrète.', priceDelta: 0, photo: 'shapeRound' },
  { id: 'square', label: 'Carrée', blurb: 'Sourcil droit, angles francs. Une forme affirmée.', priceDelta: 0, photo: 'shapeSquare' },
  { id: 'cat-eye', label: 'Papillon', blurb: 'Relevée au coin externe, rien au nez.', priceDelta: 40, photo: 'shapeCat' }, // PLACEHOLDER
  {
    id: 'aviator',
    label: 'Aviateur',
    blurb: 'Double pont, verres en goutte. En métal uniquement.',
    priceDelta: 60, // PLACEHOLDER
    photo: 'shapeAviator',
    onlyColourways: ['titane', 'or-brosse'],
    colourwayReason: 'L’aviateur se monte sur une face en métal : les acétates ne sont pas disponibles.',
  },
  { id: 'rectangular', label: 'Rectangulaire', blurb: 'Basse et large. La plus facile à porter.', priceDelta: 0, photo: 'shapeRect' },
  { id: 'oversized', label: 'Oversize', blurb: 'Verres profonds, couverture large. Idéale en progressifs.', priceDelta: 70, photo: 'shapeOversized' }, // PLACEHOLDER
]

export type BuilderColourway = Colourway & { priceDelta: number; blurb: string }

/** Materials offered in the configurator. PLACEHOLDER — names and prices. */
export const builderColourways: BuilderColourway[] = [
  { id: 'havane', name: 'Havane', family: 'tortoise', swatch: ['#6b4423', '#2b1a0e'], priceDelta: 0, blurb: 'Écaille chaude, le motif court d’un cercle à l’autre.' },
  { id: 'noir', name: 'Noir', family: 'black', swatch: ['#111111', '#2a2a2a'], priceDelta: 0, blurb: 'Noir profond, rien à remarquer — c’est le but.' },
  { id: 'cristal', name: 'Cristal', family: 'crystal', swatch: ['#d9dcdf', '#f4f5f6'], priceDelta: 0, blurb: 'Transparent, laisse voir l’âme métallique.' },
  { id: 'ecaille-blonde', name: 'Écaille blonde', family: 'tortoise', swatch: ['#b07a3c', '#5a3818'], priceDelta: 30, blurb: 'Une écaille miel, plus claire et plus lumineuse.' }, // PLACEHOLDER
  { id: 'olive', name: 'Olive fumé', family: 'colour', swatch: ['#4a4e33', '#1f2113'], priceDelta: 40, blurb: 'Une écaille verte. Deux plaques par an seulement.' }, // PLACEHOLDER
  { id: 'titane', name: 'Titane naturel', family: 'silver', swatch: ['#a9adb0', '#dfe1e2'], priceDelta: 180, blurb: 'Face en métal : la plus légère, la plus solide.' }, // PLACEHOLDER
  { id: 'or-brosse', name: 'Or brossé', family: 'gold', swatch: ['#c2a054', '#e6cf8e'], priceDelta: 160, blurb: 'Face en métal, brossée pour ne pas briller.' }, // PLACEHOLDER
]

export const sizeOptions: BuilderOption<SizeKey>[] = [
  { id: 'narrow', label: 'Étroite', blurb: 'Verre de 46 mm, pont de 18 mm.', priceDelta: 0, icon: 'narrow' },
  { id: 'medium', label: 'Moyenne', blurb: 'Verre de 50 mm, pont de 20 mm.', priceDelta: 0, icon: 'medium' },
  { id: 'wide', label: 'Large', blurb: 'Verre de 54 mm, pont de 21 mm.', priceDelta: 20, icon: 'wide' }, // PLACEHOLDER
]

/** Millimetre values shown in the preview caption, by size. */
export const sizeDimensions: Record<SizeKey, { lensWidth: number; bridge: number; templeLength: number }> = {
  narrow: { lensWidth: 46, bridge: 18, templeLength: 142 },
  medium: { lensWidth: 50, bridge: 20, templeLength: 145 },
  wide: { lensWidth: 54, bridge: 21, templeLength: 148 },
}

/* ── Étape 2 : les verres ── */

export const lensTypeOptions: BuilderOption<LensType>[] = [
  { id: 'plano', label: 'Sans correction', blurb: 'Un verre neutre, pour la monture seule.', priceDelta: 0, icon: 'plano' },
  { id: 'single-vision', label: 'Unifocaux', blurb: 'Une seule correction, de près ou de loin.', priceDelta: 140, icon: 'single-vision' }, // PLACEHOLDER
  { id: 'progressive', label: 'Progressifs', blurb: 'Loin en haut, près en bas, sans ligne entre les deux.', priceDelta: 420, icon: 'progressive' }, // PLACEHOLDER
  { id: 'sun', label: 'Solaires', blurb: 'Teintés catégorie 3, avec ou sans correction.', priceDelta: 180, icon: 'sun' }, // PLACEHOLDER
]

/* ── Étape 3 : la qualité ── */

export const lensTierOptions: BuilderOption<LensTier>[] = [
  { id: 'std-15', label: 'Standard 1,5', blurb: 'L’indice de base, jusqu’à −2,00 environ.', priceDelta: 0, icon: 'std-15' },
  { id: 'thin-16', label: 'Aminci 1,6', blurb: 'Un cinquième plus fin au bord. Utile au-delà de −2,00.', priceDelta: 120, icon: 'thin-16' }, // PLACEHOLDER
  { id: 'ultra-167', label: 'Extra-fin 1,67', blurb: 'Le plus fin que nous montons. Pour les fortes corrections.', priceDelta: 260, icon: 'ultra-167' }, // PLACEHOLDER
]

export const coatingOptions: BuilderOption<CoatingId>[] = [
  { id: 'anti-reflective', label: 'Antireflet', blurb: 'Supprime les reflets : on voit vos yeux, pas la lampe.', priceDelta: 90, icon: 'anti-reflective' }, // PLACEHOLDER
  { id: 'blue-light', label: 'Filtre lumière bleue', blurb: 'Retient 40 % de la lumière à 450 nm. Légère teinte chaude.', priceDelta: 110, icon: 'blue-light' }, // PLACEHOLDER
  { id: 'photochromic', label: 'Photochromique', blurb: 'Fonce dehors, s’éclaircit à l’intérieur en deux minutes.', priceDelta: 210, icon: 'photochromic' }, // PLACEHOLDER
  {
    id: 'polarised',
    label: 'Polarisant',
    blurb: 'Coupe l’éblouissement de la mer et du bitume.',
    priceDelta: 150, // PLACEHOLDER
    icon: 'polarised',
    availableWhen: { lensType: ['sun'] },
    unavailableReason: 'Le polarisant ne s’applique qu’à un verre teinté — choisissez « Solaires » à l’étape 2.',
  },
]

/* ── Étape 4 : les accessoires ── */

export const addOnOptions: (BuilderOption<AddOnId> & { maxQty: number; photo: PhotoKey })[] = [
  { id: 'chain', label: 'Chaîne de lunettes', blurb: 'Métal argenté, embouts silicone, 70 cm.', priceDelta: 95, photo: 'chain', maxQty: 2 }, // PLACEHOLDER
  { id: 'care-kit', label: 'Kit d’entretien', blurb: 'Spray sans alcool, chamoisine et tournevis.', priceDelta: 40, photo: 'kit', maxQty: 3 }, // PLACEHOLDER
  { id: 'extra-cloth', label: 'Chamoisine en plus', blurb: 'Une microfibre de plus, pour l’autre sac.', priceDelta: 18, photo: 'cloth', maxQty: 5 }, // PLACEHOLDER
]

/* ── Étape 5 : l'écrin ── */

export const caseOptions: (BuilderOption<CaseId> & { photo: PhotoKey })[] = [
  { id: 'hard', label: 'Étui rigide', blurb: 'Coque aimantée, doublée de feutrine.', priceDelta: 0, photo: 'caseHard' },
  { id: 'leather', label: 'Étui en cuir', blurb: 'Cuir pleine fleur, rabat à pression.', priceDelta: 55, photo: 'caseLeather' }, // PLACEHOLDER
  { id: 'pochette', label: 'Pochette velours', blurb: 'Douce, elle sert aussi de chiffon.', priceDelta: -20, photo: 'pochette' }, // PLACEHOLDER
]

/* ── Valeurs par défaut ── */

export const defaultConfig: BuilderConfig = {
  shape: 'round',
  colourway: 'havane',
  size: 'medium',
  lensType: 'single-vision',
  lensTier: 'std-15',
  coatings: ['anti-reflective'],
  addOns: {},
  caseId: 'hard',
  giftBox: false,
  engraving: '',
}
