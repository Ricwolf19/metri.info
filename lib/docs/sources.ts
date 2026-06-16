import { CALC_AUTHOR } from "@/lib/calculators/sources";

/** A cited reference. `text` is the human-readable citation (same in every
 * locale); `url` is optional and only set when a stable canonical page exists. */
type Citation = { text: string; url?: string };

/** Author/reviewer shown on docs — shared with the calculators so the site has a
 * single, consistent byline. Edit in `lib/calculators/sources.ts`. */
export const DOC_AUTHOR = CALC_AUTHOR;

/** ISO date of the last knowledge-base review. Bump when you revise articles. */
export const DOC_LAST_REVIEWED = "2026-06-16";

/**
 * Docs whose subject is health/nutrition/recovery (YMYL). These render a
 * `MedicalWebPage` (instead of `Article`) with author/reviewer + lastReviewed,
 * which is what Google's Quality Rater Guidelines expect for such topics. Pure
 * training/technique articles stay `Article`.
 */
export const HEALTH_DOCS: ReadonlySet<string> = new Set<string>([
  "bmi-healthy-weight",
  "bmr-tdee-guide",
  "body-fat-guide",
  "ffmi-guide",
  "hydration",
  "hydration-calculator-guide",
  "macros",
  "macros-calculator-guide",
  "tdee",
  "personalizing-your-diet",
  "sleep",
  "supplements",
]);

/**
 * Peer-reviewed / authoritative sources per article, keyed by slug (EN and ES
 * share slugs). Text-only by design — a wrong link is worse than none. Articles
 * without an entry simply render no sources section (intro/glossary pages).
 */
export const DOC_SOURCES: Record<string, Citation[]> = {
  "bmi-healthy-weight": [
    {
      text: "World Health Organization. Body mass index (BMI) and classification of overweight and obesity.",
    },
    {
      text: "Nuttall FQ. Body mass index: obesity, BMI, and health: a critical review. Nutr Today. 2015;50(3):117-128.",
    },
  ],
  "bmr-tdee-guide": [
    {
      text: "Mifflin MD, St Jeor ST, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241-247.",
    },
    {
      text: "Harris JA, Benedict FG. A biometric study of human basal metabolism. Proc Natl Acad Sci. 1918;4(12):370-373.",
    },
  ],
  "body-fat-guide": [
    {
      text: "Jackson AS, Pollock ML. Generalized equations for predicting body density of men. Br J Nutr. 1978;40(3):497-504.",
    },
    {
      text: "Hodgdon JA, Beckett MB. Prediction of percent body fat for U.S. Navy men and women from body circumferences and height. Naval Health Research Center; 1984.",
    },
  ],
  "ffmi-guide": [
    {
      text: "Kouri EM, Pope HG, Katz DL, Oliva P. Fat-free mass index in users and nonusers of anabolic-androgenic steroids. Clin J Sport Med. 1995;5(4):223-228.",
    },
  ],
  hydration: [
    {
      text: "EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific opinion on dietary reference values for water. EFSA Journal. 2010;8(3):1459.",
    },
    {
      text: "Institute of Medicine. Dietary Reference Intakes for Water, Potassium, Sodium, Chloride, and Sulfate. National Academies Press; 2004.",
    },
  ],
  "hydration-calculator-guide": [
    {
      text: "EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific opinion on dietary reference values for water. EFSA Journal. 2010;8(3):1459.",
    },
    {
      text: "Sawka MN, et al. American College of Sports Medicine position stand: exercise and fluid replacement. Med Sci Sports Exerc. 2007;39(2):377-390.",
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
  "macros-calculator-guide": [
    {
      text: "Institute of Medicine. Dietary Reference Intakes: Acceptable Macronutrient Distribution Ranges (AMDR). National Academies Press; 2005.",
    },
    {
      text: "Helms ER, Aragon AA, Fitschen PJ. Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation. J Int Soc Sports Nutr. 2014;11:20.",
    },
  ],
  tdee: [
    {
      text: "Mifflin MD, St Jeor ST, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241-247.",
    },
  ],
  "personalizing-your-diet": [
    {
      text: "Helms ER, Aragon AA, Fitschen PJ. Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation. J Int Soc Sports Nutr. 2014;11:20.",
    },
    {
      text: "Aragon AA, Schoenfeld BJ. Nutrient timing revisited: is there a post-exercise anabolic window? J Int Soc Sports Nutr. 2013;10:5.",
    },
  ],
  sleep: [
    {
      text: "Watson AM. Sleep and athletic performance. Curr Sports Med Rep. 2017;16(6):413-418.",
    },
    {
      text: "Watson NF, et al. Recommended amount of sleep for a healthy adult: AASM and Sleep Research Society consensus statement. Sleep. 2015;38(6):843-844.",
    },
  ],
  supplements: [
    {
      text: "Maughan RJ, et al. IOC consensus statement: dietary supplements and the high-performance athlete. Br J Sports Med. 2018;52(7):439-455.",
    },
    {
      text: "Kerksick CM, et al. ISSN exercise & sports nutrition review update: research & recommendations. J Int Soc Sports Nutr. 2018;15:38.",
    },
  ],
  "one-rep-max-guide": [
    {
      text: "Brzycki M. Strength testing—predicting a one-rep max from reps-to-fatigue. JOPERD. 1993;64(1):88-90.",
    },
    {
      text: "Epley B. Poundage chart. Boyd Epley Workout. Lincoln, NE; 1985.",
    },
  ],
  "progressive-overload": [
    {
      text: "American College of Sports Medicine. Position stand: progression models in resistance training for healthy adults. Med Sci Sports Exerc. 2009;41(3):687-708.",
    },
    {
      text: "Schoenfeld BJ, Ogborn D, Krieger JW. Dose-response relationship between weekly resistance training volume and increases in muscle mass: a systematic review and meta-analysis. J Sports Sci. 2017;35(11):1073-1082.",
    },
  ],
  "volume-frequency": [
    {
      text: "Schoenfeld BJ, Ogborn D, Krieger JW. Effects of resistance training frequency on measures of muscle hypertrophy: a systematic review and meta-analysis. Sports Med. 2016;46(11):1689-1697.",
    },
    {
      text: "Schoenfeld BJ, Ogborn D, Krieger JW. Dose-response relationship between weekly resistance training volume and increases in muscle mass. J Sports Sci. 2017;35(11):1073-1082.",
    },
  ],
  "training-intensity": [
    {
      text: "Schoenfeld BJ, et al. Strength and hypertrophy adaptations between low- vs. high-load resistance training: a systematic review and meta-analysis. J Strength Cond Res. 2017;31(12):3508-3523.",
    },
  ],
  "lifting-technique": [
    {
      text: "Haff GG, Triplett NT (eds). NSCA's Essentials of Strength Training and Conditioning. 4th ed. Human Kinetics; 2016.",
    },
  ],
};
