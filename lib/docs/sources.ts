import { CALC_AUTHOR } from "@/lib/calculators/sources";

/** A cited reference. `text` is the human-readable citation (same in every
 * locale); `url` is optional and only set when a stable canonical page exists. */
type Citation = { text: string; url?: string };

/** Author/reviewer shown on docs — shared with the calculators so the site has a
 * single, consistent byline. Edit in `lib/calculators/sources.ts`. */
export const DOC_AUTHOR = CALC_AUTHOR;

/** ISO date of the last knowledge-base review. Bump when you revise articles. */
export const DOC_LAST_REVIEWED = "2026-11-16";

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
  "choosing-your-phase",
  "breaking-a-plateau",
  "tracking-food",
  "food-swaps",
  "diet-quality",
  "fat-loss-myths",
  "weight-tracking",
  "reading-your-numbers",
  "cardio-and-neat",
  "adaptive-thermogenesis",
  "insulin-sensitivity",
  "sleep-quality",
  "somatotypes",
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
    {
      text: "Paluch AE, Bajpai S, Bassett DR, et al. Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts. Lancet Public Health. 2022;7(3):e219-e228.",
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
    {
      text: "Morton RW, Murphy KT, McKellar SR, et al. A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults. Br J Sports Med. 2018;52(6):376-384.",
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
    {
      text: "Frankenfield D, Roth-Yousey L, Compher C. Comparison of predictive equations for resting metabolic rate in healthy nonobese and obese adults: a systematic review. J Am Diet Assoc. 2005;105(5):775-789.",
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
    {
      text: "Kreider RB, Kalman DS, Antonio J, et al. International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine. J Int Soc Sports Nutr. 2017;14:18.",
    },
    {
      text: "Guest NS, VanDusseldorp TA, Nelson MT, et al. International Society of Sports Nutrition position stand: caffeine and exercise performance. J Int Soc Sports Nutr. 2021;18(1):1.",
    },
    {
      text: "Ferracioli-Oda E, Qawasmi A, Bloch MH. Meta-analysis: melatonin for the treatment of primary sleep disorders. PLoS One. 2013;8(5):e63773.",
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
    {
      text: "Schoenfeld BJ, Pope ZK, Benik FM, et al. Longer interset rest periods enhance muscle strength and hypertrophy in resistance-trained men. J Strength Cond Res. 2016;30(7):1805-1812.",
    },
  ],
  "training-intensity": [
    {
      text: "Schoenfeld BJ, et al. Strength and hypertrophy adaptations between low- vs. high-load resistance training: a systematic review and meta-analysis. J Strength Cond Res. 2017;31(12):3508-3523.",
    },
    {
      text: "Refalo MC, Helms ER, Trexler ET, Hamilton DL, Fyfe JJ. Influence of resistance training proximity-to-failure on skeletal muscle hypertrophy: a systematic review with meta-analysis. Sports Med. 2023;53(3):649-665.",
    },
  ],
  "lifting-technique": [
    {
      text: "Haff GG, Triplett NT (eds). NSCA's Essentials of Strength Training and Conditioning. 4th ed. Human Kinetics; 2016.",
    },
    {
      text: "Schoenfeld BJ, Ogborn DI, Krieger JW. Effect of repetition duration during resistance training on muscle hypertrophy: a systematic review and meta-analysis. Sports Med. 2015;45(4):577-585.",
    },
    {
      text: "Pallarés JG, Hernández-Belmonte A, Martínez-Cava A, et al. Effects of range of motion on resistance training adaptations: a systematic review and meta-analysis. Scand J Med Sci Sports. 2021;31(10):1866-1881.",
    },
  ],
  "choosing-your-phase": [
    {
      text: "Garthe I, Raastad T, Refsnes PE, Koivisto A, Sundgot-Borgen J. Effect of two different weight-loss rates on body composition and strength and power-related performance in elite athletes. Int J Sport Nutr Exerc Metab. 2011;21(2):97-104.",
    },
    {
      text: "Iraki J, Fitschen P, Espinar S, Helms E. Nutrition recommendations for bodybuilders in the off-season: a narrative review. Sports (Basel). 2019;7(7):154.",
    },
    {
      text: "Barakat C, Pearson J, Escalante G, Campbell B, De Souza EO. Body recomposition: can trained individuals build muscle and lose fat at the same time? Strength Cond J. 2020;42(5):7-21.",
    },
  ],
  "breaking-a-plateau": [
    {
      text: "Hall KD, Sacks G, Chandramohan D, et al. Quantification of the effect of energy imbalance on bodyweight. Lancet. 2011;378(9793):826-837.",
    },
    {
      text: "Levine JA, Eberhardt NL, Jensen MD. Role of nonexercise activity thermogenesis in resistance to fat gain in humans. Science. 1999;283(5399):212-214.",
    },
    {
      text: "Nedeltcheva AV, Kilkus JM, Imperial J, Schoeller DA, Penev PD. Insufficient sleep undermines dietary efforts to reduce adiposity. Ann Intern Med. 2010;153(7):435-441.",
    },
  ],
  "tracking-food": [
    {
      text: "Burke LE, Wang J, Sevick MA. Self-monitoring in weight loss: a systematic review of the literature. J Am Diet Assoc. 2011;111(1):92-102.",
    },
    {
      text: "Merrill AL, Watt BK. Energy value of foods: basis and derivation. Agriculture Handbook No. 74. U.S. Department of Agriculture; 1973.",
    },
    {
      text: "U.S. Department of Agriculture, Agricultural Research Service. FoodData Central.",
    },
  ],
  "food-swaps": [
    {
      text: "U.S. Department of Agriculture, Agricultural Research Service. FoodData Central.",
    },
  ],
  "diet-quality": [
    {
      text: "Hall KD, Ayuketah A, Brychta R, et al. Ultra-processed diets cause excess calorie intake and weight gain: an inpatient randomized controlled trial of ad libitum food intake. Cell Metab. 2019;30(1):67-77.e3.",
    },
    {
      text: "Reynolds A, Mann J, Cummings J, Winter N, Mete E, Te Morenga L. Carbohydrate quality and human health: a series of systematic reviews and meta-analyses. Lancet. 2019;393(10170):434-445.",
    },
    {
      text: "Liu D, Huang Y, Huang C, et al. Calorie restriction with or without time-restricted eating in weight loss. N Engl J Med. 2022;386(16):1495-1504.",
    },
    {
      text: "Melina V, Craig W, Levin S. Position of the Academy of Nutrition and Dietetics: vegetarian diets. J Acad Nutr Diet. 2016;116(12):1970-1980.",
    },
    {
      text: "Forbes GB. Body fat content influences the body composition response to nutrition and exercise. Ann N Y Acad Sci. 2000;904:359-365.",
    },
  ],
  "fat-loss-myths": [
    {
      text: "Schoenfeld BJ, Aragon AA, Wilborn CD, Krieger JW, Sonmez GT. Body composition changes associated with fasted versus non-fasted aerobic exercise. J Int Soc Sports Nutr. 2014;11:54.",
    },
    {
      text: "Hall KD, Guo J. Obesity energetics: body weight regulation and the effects of diet composition. Gastroenterology. 2017;152(7):1718-1727.e3.",
    },
    {
      text: "Hall KD, Ayuketah A, Brychta R, et al. Ultra-processed diets cause excess calorie intake and weight gain: an inpatient randomized controlled trial of ad libitum food intake. Cell Metab. 2019;30(1):67-77.e3.",
    },
    {
      text: "Iwayama K, Kurihara R, Nabekura Y, et al. Exercise increases 24-h fat oxidation only when it is performed before breakfast. EBioMedicine. 2015;2(12):2003-2009.",
    },
    {
      text: "Hackett D, Hagstrom AD. Effect of overnight fasted exercise on weight loss and body composition: a systematic review and meta-analysis. J Funct Morphol Kinesiol. 2017;2(4):43.",
    },
  ],
  "weight-tracking": [
    {
      text: "Garthe I, Raastad T, Refsnes PE, Koivisto A, Sundgot-Borgen J. Effect of two different weight-loss rates on body composition and strength and power-related performance in elite athletes. Int J Sport Nutr Exerc Metab. 2011;21(2):97-104.",
    },
    {
      text: "Helms ER, Aragon AA, Fitschen PJ. Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation. J Int Soc Sports Nutr. 2014;11:20.",
    },
    {
      text: "Iraki J, Fitschen P, Espinar S, Helms E. Nutrition recommendations for bodybuilders in the off-season: a narrative review. Sports (Basel). 2019;7(7):154.",
    },
  ],
  "reading-your-numbers": [
    {
      text: "Kreitzman SN, Coxon AY, Szaz KF. Glycogen storage: illusions of easy weight loss, excessive weight regain, and distortions in estimates of body composition. Am J Clin Nutr. 1992;56(1 Suppl):292S-293S.",
    },
    {
      text: "Barakat C, Pearson J, Escalante G, Campbell B, De Souza EO. Body recomposition: can trained individuals build muscle and lose fat at the same time? Strength Cond J. 2020;42(5):7-21.",
    },
  ],
  "cardio-and-neat": [
    {
      text: "Levine JA, Eberhardt NL, Jensen MD. Role of nonexercise activity thermogenesis in resistance to fat gain in humans. Science. 1999;283(5399):212-214.",
    },
    {
      text: "Paluch AE, Bajpai S, Bassett DR, et al. Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts. Lancet Public Health. 2022;7(3):e219-e228.",
    },
    {
      text: "Wilson JM, Marin PJ, Rhea MR, Wilson SMC, Loenneke JP, Anderson JC. Concurrent training: a meta-analysis examining interference of aerobic and resistance exercises. J Strength Cond Res. 2012;26(8):2293-2307.",
    },
    {
      text: "Schoenfeld BJ, Aragon AA, Wilborn CD, Krieger JW, Sonmez GT. Body composition changes associated with fasted versus non-fasted aerobic exercise. J Int Soc Sports Nutr. 2014;11:54.",
    },
    {
      text: "Iwayama K, Kurihara R, Nabekura Y, et al. Exercise increases 24-h fat oxidation only when it is performed before breakfast. EBioMedicine. 2015;2(12):2003-2009.",
    },
  ],
  "how-a-program-works": [
    {
      text: "Simão R, de Salles BF, Figueiredo T, Dias I, Willardson JM. Exercise order in resistance training. Sports Med. 2012;42(3):251-265.",
    },
    {
      text: "American College of Sports Medicine. Position stand: progression models in resistance training for healthy adults. Med Sci Sports Exerc. 2009;41(3):687-708.",
    },
  ],
  "when-to-test-rm": [
    {
      text: "Grgic J, Lazinica B, Schoenfeld BJ, Pedisic Z. Test-retest reliability of the one-repetition maximum (1RM) strength assessment: a systematic review. Sports Med Open. 2020;6(1):31.",
    },
    {
      text: "Haff GG, Triplett NT (eds). NSCA's Essentials of Strength Training and Conditioning. 4th ed. Human Kinetics; 2016.",
    },
    {
      text: "Epley B. Poundage chart. Boyd Epley Workout. Lincoln, NE; 1985.",
    },
  ],
  "adaptive-thermogenesis": [
    {
      text: "Leibel RL, Rosenbaum M, Hirsch J. Changes in energy expenditure resulting from altered body weight. N Engl J Med. 1995;332(10):621-628.",
    },
    {
      text: "Rosenbaum M, Leibel RL. Adaptive thermogenesis in humans. Int J Obes (Lond). 2010;34(Suppl 1):S47-S55.",
    },
    {
      text: "Levine JA, Eberhardt NL, Jensen MD. Role of nonexercise activity thermogenesis in resistance to fat gain in humans. Science. 1999;283(5399):212-214.",
    },
    {
      text: "Byrne NM, Sainsbury A, King NA, Hills AP, Wood RE. Intermittent energy restriction improves weight loss efficiency in obese men: the MATADOR study. Int J Obes (Lond). 2018;42(2):129-138.",
    },
    {
      text: "Peos JJ, Helms ER, Fournier PA, Krieger J, Sainsbury A. Continuous versus intermittent dieting for fat loss and fat-free mass retention in resistance-trained adults: the ICECAP trial. Med Sci Sports Exerc. 2021;53(8):1685-1698.",
    },
    {
      text: "Fothergill E, et al. Persistent metabolic adaptation 6 years after “The Biggest Loser” competition. Obesity (Silver Spring). 2016;24(8):1612-1619.",
    },
    {
      text: "Keys A, Brožek J, Henschel A, Mickelsen O, Taylor HL. The Biology of Human Starvation. University of Minnesota Press; 1950.",
    },
    {
      text: "Lichtman SW, et al. Discrepancy between self-reported and actual caloric intake and exercise in obese subjects. N Engl J Med. 1992;327(27):1893-1898.",
    },
  ],
  "insulin-sensitivity": [
    {
      text: "Richter EA, Hargreaves M. Exercise, GLUT4, and skeletal muscle glucose uptake. Physiol Rev. 2013;93(3):993-1017.",
    },
    {
      text: "Spiegel K, Leproult R, Van Cauter E. Impact of sleep debt on metabolic and endocrine function. Lancet. 1999;354(9188):1435-1439.",
    },
    {
      text: "Donga E, et al. A single night of partial sleep deprivation induces insulin resistance in multiple metabolic pathways in healthy subjects. J Clin Endocrinol Metab. 2010;95(6):2963-2968.",
    },
    {
      text: "Olsen RH, Krogh-Madsen R, Thomsen C, Booth FW, Pedersen BK. Metabolic responses to reduced daily steps in healthy nonexercising men. JAMA. 2008;299(11):1261-1263.",
    },
    {
      text: "Knowler WC, et al. Reduction in the incidence of type 2 diabetes with lifestyle intervention or metformin. N Engl J Med. 2002;346(6):393-403.",
    },
    {
      text: "Hall KD, Guo J. Obesity energetics: body weight regulation and the effects of diet composition. Gastroenterology. 2017;152(7):1718-1727.",
    },
    {
      text: "Gardner CD, et al. Effect of low-fat vs low-carbohydrate diet on 12-month weight loss in overweight adults and the association with genotype pattern or insulin secretion: the DIETFITS randomized clinical trial. JAMA. 2018;319(7):667-679.",
    },
  ],
  "sleep-quality": [
    {
      text: "Nedeltcheva AV, Kilkus JM, Imperial J, Schoeller DA, Penev PD. Insufficient sleep undermines dietary efforts to reduce adiposity. Ann Intern Med. 2010;153(7):435-441.",
    },
    {
      text: "Al Khatib HK, Harding SV, Darzi J, Pot GK. The effects of partial sleep deprivation on energy balance: a systematic review and meta-analysis. Eur J Clin Nutr. 2017;71(5):614-624.",
    },
    {
      text: "Drake C, Roehrs T, Shambroom J, Roth T. Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed. J Clin Sleep Med. 2013;9(11):1195-1200.",
    },
    {
      text: "Ebrahim IO, Shapiro CM, Williams AJ, Fenwick PB. Alcohol and sleep I: effects on normal sleep. Alcohol Clin Exp Res. 2013;37(4):539-549.",
    },
    {
      text: "Haghayegh S, Khoshnevis S, Smolensky MH, Diller KR, Castriotta RJ. Before-bedtime passive body heating by warm shower or bath to improve sleep: a systematic review and meta-analysis. Sleep Med Rev. 2019;46:124-135.",
    },
    {
      text: "Stutz J, Eiholzer R, Spengler CM. Effects of evening exercise on sleep in healthy participants: a systematic review and meta-analysis. Sports Med. 2019;49(2):269-287.",
    },
    {
      text: "Ferracioli-Oda E, Qawasmi A, Bloch MH. Meta-analysis: melatonin for the treatment of primary sleep disorders. PLoS One. 2013;8(5):e63773.",
    },
  ],
  somatotypes: [
    {
      text: "Sheldon WH, Stevens SS, Tucker WB. The Varieties of Human Physique. Harper & Brothers; 1940.",
    },
    {
      text: "Heath BH, Carter JEL. A modified somatotype method. Am J Phys Anthropol. 1967;27(1):57-74.",
    },
    {
      text: "Hubal MJ, et al. Variability in muscle size and strength gain after unilateral resistance training. Med Sci Sports Exerc. 2005;37(6):964-972.",
    },
    {
      text: "Gardner CD, et al. Effect of low-fat vs low-carbohydrate diet on 12-month weight loss in overweight adults and the association with genotype pattern or insulin secretion: the DIETFITS randomized clinical trial. JAMA. 2018;319(7):667-679.",
    },
  ],
};
