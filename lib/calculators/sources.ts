import type { CalcId } from "./types";

/** A cited reference. `text` is the human-readable citation (same in every
 * locale); `url` is optional and only set when a stable canonical page exists. */
type Citation = { text: string; url?: string };

/**
 * Author/reviewer shown on every calculator (E-E-A-T trust signal). Google's
 * Quality Rater Guidelines reward a **named** author/reviewer for YMYL content —
 * edit this to your real, ideally credentialed, author/reviewer.
 */
export const CALC_AUTHOR = {
  name: "Ricardo Tapia",
  url: "https://ricardotapia.dev",
} as const;

/** ISO date of the last content review. Bump it whenever you revise calculator
 * copy or formulas — it surfaces as "Last updated" and as `dateModified`. */
export const CALC_LAST_REVIEWED = "2026-06-16";

/**
 * Calculators whose output touches health, nutrition or body composition (YMYL).
 * These additionally render a medical disclaimer and `MedicalWebPage` schema.
 * Pure training/strength tools (1RM, plate math, Wilks score) are excluded.
 */
export const HEALTH_CALCS: ReadonlySet<CalcId> = new Set<CalcId>([
  "tdee",
  "macros",
  "bodyfat",
  "bmi",
  "ffmi",
  "water",
  "idealweight",
  "deficit",
  "protein",
  "leanmass",
  "heartrate",
  "whtr",
  "calsburned",
]);

/** Authoritative source(s) behind each calculator's formula. Citations are
 * locale-independent (author names + years are universal); only the section
 * heading is translated. Text-only by design — a wrong link is worse than none. */
export const CALC_SOURCES: Record<CalcId, Citation[]> = {
  onerm: [
    {
      text: "Brzycki M. Strength testing—predicting a one-rep max from reps-to-fatigue. JOPERD. 1993;64(1):88-90.",
    },
    {
      text: "Epley B. Poundage chart. Boyd Epley Workout. Lincoln, NE; 1985.",
    },
  ],
  tdee: [
    {
      text: "Mifflin MD, St Jeor ST, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241-247.",
    },
    {
      text: "Harris JA, Benedict FG. A biometric study of human basal metabolism. Proc Natl Acad Sci. 1918;4(12):370-373.",
    },
    {
      text: "Katch FI, McArdle WD. Nutrition, Weight Control, and Exercise. Lea & Febiger; 1977.",
    },
  ],
  macros: [
    {
      text: "Institute of Medicine. Dietary Reference Intakes: Acceptable Macronutrient Distribution Ranges (AMDR). National Academies Press; 2005.",
    },
    {
      text: "Jäger R, et al. International Society of Sports Nutrition position stand: protein and exercise. J Int Soc Sports Nutr. 2017;14:20.",
    },
  ],
  bodyfat: [
    {
      text: "Hodgdon JA, Beckett MB. Prediction of percent body fat for U.S. Navy men and women from body circumferences and height. Naval Health Research Center; 1984.",
    },
    {
      text: "Jackson AS, Pollock ML. Generalized equations for predicting body density of men. Br J Nutr. 1978;40(3):497-504.",
    },
  ],
  bmi: [
    {
      text: "World Health Organization. Body mass index (BMI) and classification of overweight and obesity.",
    },
    {
      text: "Quetelet A. Sur l'homme et le développement de ses facultés. Bachelier; 1835.",
    },
  ],
  ffmi: [
    {
      text: "Kouri EM, Pope HG, Katz DL, Oliva P. Fat-free mass index in users and nonusers of anabolic-androgenic steroids. Clin J Sport Med. 1995;5(4):223-228.",
    },
  ],
  water: [
    {
      text: "EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific opinion on dietary reference values for water. EFSA Journal. 2010;8(3):1459.",
    },
    {
      text: "Institute of Medicine. Dietary Reference Intakes for Water, Potassium, Sodium, Chloride, and Sulfate. National Academies Press; 2004.",
    },
  ],
  plates: [],
  idealweight: [
    {
      text: "Devine BJ. Gentamicin therapy (ideal body weight formula). Drug Intell Clin Pharm. 1974;8:650-655.",
    },
    {
      text: "Robinson JD, et al. Determination of ideal body weight for drug dosage calculations. Am J Hosp Pharm. 1983;40(6):1016-1019.",
    },
  ],
  deficit: [
    {
      text: "Hall KD, et al. Quantification of the effect of energy imbalance on bodyweight. Lancet. 2011;378(9793):826-837.",
    },
    {
      text: "Wishnofsky M. Caloric equivalents of gained or lost weight. Am J Clin Nutr. 1958;6(5):542-546.",
    },
  ],
  protein: [
    {
      text: "Morton RW, et al. A systematic review, meta-analysis and meta-regression of protein supplementation on resistance training–induced gains in muscle mass and strength. Br J Sports Med. 2018;52(6):376-384.",
    },
    {
      text: "Jäger R, et al. International Society of Sports Nutrition position stand: protein and exercise. J Int Soc Sports Nutr. 2017;14:20.",
    },
  ],
  leanmass: [
    {
      text: "Boer P. Estimated lean body mass as an index for normalization of body fluid volumes. Am J Physiol. 1984;247(4):F632-F636.",
    },
  ],
  heartrate: [
    {
      text: "Tanaka H, Monahan KD, Seals DR. Age-predicted maximal heart rate revisited. J Am Coll Cardiol. 2001;37(1):153-156.",
    },
    {
      text: "Karvonen MJ, Kentala E, Mustala O. The effects of training on heart rate. Ann Med Exp Biol Fenn. 1957;35(3):307-315.",
    },
  ],
  whtr: [
    {
      text: "Ashwell M, Gunn P, Gibson S. Waist-to-height ratio as an indicator of early health risks: systematic review and meta-analysis. Obes Rev. 2012;13(3):275-286.",
    },
    {
      text: "Browning LM, Hsieh SD, Ashwell M. A systematic review of waist-to-height ratio as a screening tool: suggested boundary value of 0.5. Nutr Res Rev. 2010;23(2):247-269.",
    },
  ],
  wilks: [
    {
      text: "Wilks R. Wilks coefficient for powerlifting bodyweight normalization (IPF scoring).",
    },
  ],
  calsburned: [
    {
      text: "Ainsworth BE, et al. 2011 Compendium of Physical Activities: a second update of codes and MET values. Med Sci Sports Exerc. 2011;43(8):1575-1581.",
    },
  ],
};
