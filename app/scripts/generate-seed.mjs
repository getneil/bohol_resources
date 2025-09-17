#!/usr/bin/env node
/**
 * generate-seed.mjs
 * Generates realistic mock data for local development.
 * Output: ../../supabase/seed.sql
 * Ratios: 400 fresh (0-1y) / 350 mid (2-5y) / 250 senior (6-25y)
 */
import { faker } from '@faker-js/faker';
import fs from 'node:fs';
import path from 'node:path';

faker.seed(42);

/**
 * NAME UNIQUENESS STRATEGY (added Sept 2025)
 * We attempt to keep (first_name + last_name) pairs unique for clearer demo UX.
 * 1. Try up to 6 random (first,last) combinations.
 * 2. If still colliding, we create a compound first name by combining two first names.
 * 3. We do NOT guarantee absolute uniqueness across pathological cases, but with the
 *    provided pools and retry strategy collisions after compounding are practically nil.
 * 4. Emails remain based on sanitized `first.last` and still get numeric suffixes if needed.
 */

// Philippine localization helpers
const phFirstNames = [
  // Classic & common
  'Ana','Maria','Jose','Juan','Pedro','Luis','Carlos','Paolo','Paula','Riza','Andrea','Rodel','Jasmine','Kristine','Leo','Arnel','Lester','Marlon','Mae','Joana','Rey','Nico','Sheila','Allan','Grace','Jessa','Carlo','Ramon','Elisa','Noel','Rowena',
  // Modern & trending
  'Aljon','Katrina','Micah','Erika','Lovely','Jun','Emmanuel','Patrick','Angel','Lloyd','Jericho','Faye','Rhett','Giselle','Harold','Ivy','Junel','Kean','Lorraine','Mika','Nerissa','Owen','Phoebe','Quin','Raffy','Shaira','Tin','Uno','Vince','Winona','Yanna','Zyra','Jansen','Edric','Sabrina','Aaliyah','Zoe','Kyra','Liam','Ethan','Migo','Kian','Elijah','Nathan','Kyle','Jace','Aiden','Enzo','Zander','Skye','Lyra','Aya','Noemi','Bianca','Trixie','Hazel','Claudine','Elora','Franco','Gino','Hanz','Immanuel','Jiro','Kenzo','Loren','Myles','Noemi','Odel','Pia','Queenie','Rocco','Santi','Thalia','Uri','Vale','Wren','Yael','Zeph','Aria','Celine','Dione','Eira','Faith','Galen','Helena','Inna','Jules','Kael','Louie','Maui','Nate','Onin','Poch','Ronin','Selah','Tala','Ulric','Via','Wilma','Yuri','Zed',
  // Compound / hyphenated (simulate splitting later if needed)
  'Ana Mae','Ma. Elena','Ma. Kristine','Mary Joy','Rose Ann','Anne Marie','John Paul','John Mark','Mark Anthony','Karl Joseph','Jean Luc','Juan Miguel','John Rey','Mary Grace','Mary Rose','Ma. Theresa'
];
const phLastNames = [
  // Very common
  'Dela Cruz','Reyes','Garcia','Santos','Flores','Bautista','Villanueva','Fernandez','Mendoza','Domingo','Soriano','Lopez','Aquino','Torres','Cabrera','Ramos','Castro','Morales','Pascual','Navarro',
  'Salazar','Velasco','Legaspi','Vergara','Padilla','Valencia','Santiago','Del Rosario','Rivera','Aguilar','Gonzales','Palma','Rosales','Calderon','Escobar','Fuentes','Ortega','Peralta','Quintana','Sarmiento',
  // Additional Spanish-derived & localized
  'Abad','Alcantara','Arellano','Beltran','Bernardo','Carranza','Coronel','De Guzman','Espinosa','Ferrer','Galang','Ignacio','Jimenez','Lazaro','Macaraeg','Natividad','Ocampo','Panganiban','Quizon','Roxas','Salcedo','Tabora','Umali','Valdez','Yap','Zamora','Baltazar','Bataclan','Villamor','Manalo','Soriano','Villena','Jacinto','Guevarra','Laurel','Del Mundo','Mercado','Ponce','Tolentino','Manrique','Alejandro','Bonifacio','Quezada','Villegas','Boholano','Sandoval','Tiu','Sy','Tan','Lim','Chua','Go','Ong','Uy'
];
const phBarangays = [
  'Poblacion','Dao','Cogon','Totolan','Booy','Mansasa','TipTip','Manga','Taloto','Cogon Norte','San Isidro','Doljo','Bil-isan','Looc','Tawala','Danao','Libertad','Cabawan','Bool','Tamiso'
];
const phTowns = [
  'Tagbilaran','Dauis','Panglao','Carmen','Tubigon','Ubay','Talibon','Loon','Alburquerque','Baclayon','Maribojoc','Anda','Dimiao','Jagna','Sagbayan','Inabanga','Clarin','Trinidad','Sevilla','Antequera'
];
const phProvinces = ['Bohol'];
const phSchools = [
  'BISU Main','BISU Balilihan','Holy Name University','Mater Dei College','University of Bohol','BISU Candijay','BISU Calape','BISU Clarin','BISU Bilar', 'Tagbilaran City College', 'Carmen Municipal College','Bohol Wisdom School','St. Joseph College','Bohol Institute of Technology'
];
const phDegrees = [
  'BS Information Technology','BS Agriculture','BS Nursing','BS Education','BS Marine Biology','Diploma in Hospitality','BA Communication','BS Civil Engineering','BS Criminology','BS Accountancy','BS Mechanical Engineering','BS Electrical Engineering','BS Architecture','BS Tourism Management','BS Computer Science','BS Fisheries','BS Forestry','BS Environmental Science','BS Midwifery','BS Psychology'
];
const phShortCourses = [
  'NCII Bread and Pastry','NCII Cookery','Digital Marketing Bootcamp','Front-End Development Bootcamp','Basic Seafaring Certification','TESDA Housekeeping NCII','Barista Skills','AutoCAD Essentials','Basic Welding','Intro to UX Design'
];
const phOrgs = [
  // Existing
  'Bohol Agro Ventures','VisMin Creative Studio','Island Tech Labs','Panglao Resort Group','Central Bohol Clinic','Heritage Marine Coop','Bohol Eco Builders','Tagbilaran Digital Hub','Visayas Trading Corp','Bohol Social Impact Center',
  'Green Archipelago Farms','Blue Reef Marine Services','Heritage Crafts Collective','Sunrise Hospitality Inc','Visayan Learning Center','Bohol Wellness Cooperative','Island Innovations Hub','Coastal Engineering Works','Balilihan Agri Supply','Bohol Creative Forge',
  // Agriculture & Environment
  'Chocolate Hills Agri Cooperative','Loboc River Eco Ventures','Bohol Organic Farmers Network','Ubay Dairy Producers Guild','Inabanga Coco Growers Association','Baclayon Cacao Collective','Corella Bamboo Development Group','Anda Coastal Farming Cooperative','Alicia Rice Growers Alliance','Sagbayan Highland Farmers Hub',
  // Tourism & Hospitality
  'Loboc Eco Cruise Services','Anda Coral Bay Resort','Tarsier Sanctuary Tours','Bilar Forest Adventure Park','Bohol Heritage Trail Guides','Panglao Dive Network','Baclayon Heritage Museum Trust','Tagbilaran Conference Pavilion','Hinagdanan Cave Hospitality Group','Island Chain Travel Services',
  // Education & Training
  'Bohol Skills Advancement Center','Central Visayas Digital Literacy Hub','Rural Tech Enablement Program','Bohol Marine Conservation Institute','VisMin Hospitality Training Center','Barangay Youth Learning Labs','Provincial Teacher Support Network','Community Lifelong Learning Space','Island Leadership Institute','Bohol Career Development Hub',
  // Healthcare & Social Services
  'Bohol Rural Health Initiative','Visayas Community Wellness Program','Island Telehealth Cooperative','Bohol Midwives Network','Tagbilaran Nutrition Support Services','Provincial Medical Outreach Team','Barangay Health Volunteer Network','Marine Safety & First Aid Alliance','Bohol Mental Wellness Project','Central Island Rehabilitation Center',
  // Creative & Crafts
  'Bohol Handloom Weavers Guild','Island Woodcraft Makers Collective','Panglao Shellcraft Studio','Lila Heritage Arts Workshop','Visayan Folk Design Studio','Loon Creative Marketplace','Balilihan Artisans Cooperative','Tagbilaran Digital Creators Guild','Bohol Cultural Preservation Society','Crafted in Bohol Studio',
  // ICT & Innovation
  'Tagbilaran Startup Incubator','Bohol Freelancers Network','VisMin Open Source Alliance','Island Data Cooperative','Panglao Remote Work Hub','Bohol Civic Tech Lab','Central Visayas Innovation Forum','Island Systems Integration Group','Bohol Cloud Services Cooperative','Rural Connectivity Initiative',
  // Government & Civic
  'Provincial Development Council Office','Bohol Disaster Response Center','Municipal Services Integration Unit','Barangay Digital Records Project','Coastal Resource Management Office','Local Heritage Conservation Board','Island Transport Planning Unit','Bohol Youth Civic Council','Provincial Cooperative Development Office','Public Works Field Operations Team',
  // Social Enterprise & Impact
  'Island Livelihood Empowerment Network','Bohol Women Entrepreneurs Hub','Visayan Sustainable Futures Fund','Inclusive Growth Advocacy Center','Community Microfinance Initiative','Rural Enterprise Support Program','Coastal Resilience Partnership','Island Food Security Coalition','Bohol Social Innovation Lab','Grassroots Impact Accelerator'
];

const OUTPUT = path.resolve(process.cwd(), '../supabase/seed.sql');
const TOTAL = 1000;
const DISTRIBUTION = {
  fresh: 400,
  mid: 350,
  senior: 250
};

// bcrypt hash for 'password' (cost 10)
const PASSWORD_HASH = '$2a$10$X9ZwZ0pQHjXy3G8R3M2eQOmrJ3u0G1V41Yp.MgV7U3w8YVwzZK0mS';

const sectors = [
  'Tourism & Hospitality',
  'Agriculture',
  'Education & Training',
  'Healthcare',
  'Construction & Engineering',
  'Marine Services',
  'ICT & Freelance',
  'Creative Media',
  'Arts & Crafts',
  'Local Government',
  'Social Enterprise'
];

// Weighted sector distribution (sums ~1.0) tuned for local context
const sectorWeights = {
  // Rebalanced to emphasize ICT & Freelance (now 20%) while keeping sum ≈ 1.00
  'Tourism & Hospitality': 0.15,
  'Agriculture': 0.14,
  'Education & Training': 0.12,
  'Healthcare': 0.10,
  'Marine Services': 0.09,
  'Construction & Engineering': 0.07,
  'ICT & Freelance': 0.20, // boosted
  'Creative Media': 0.05,
  'Arts & Crafts': 0.04,
  'Local Government': 0.02,
  'Social Enterprise': 0.02
};

const skillPools = {
  general: [
    'Communication','Teamwork','Problem Solving','Leadership','Time Management','Adaptability','Critical Thinking','Collaboration','Public Speaking','Client Relations',
    'Report Writing','Basic Computer Literacy','Conflict Resolution','Presentation Skills','Email Etiquette','Task Prioritization','Meeting Facilitation'
  ],
  tech: [
    'JavaScript','TypeScript','SQL','Svelte','Node.js','Python','Docker','Git','REST APIs','Database Design','Testing','CI/CD','Linux Administration','Cloud Deployment','HTML/CSS','TailwindCSS',
    'API Integration','Unit Testing','Agile Practices','Scrum Facilitation','Performance Optimization','Security Hardening','Data Modeling','Version Control Strategy','Technical Documentation'
  ],
  tourism: [
    'Guest Relations','Event Planning','Food Safety','Reservation Systems','Front Desk Operations','Tour Guiding','Local Heritage Knowledge','Banquet Coordination','Concierge Support',
    'Itinerary Design','Cultural Interpretation','Hospitality Upselling','Front Office Auditing','Housekeeping Standards','Sustainable Tourism Practices'
  ],
  agriculture: [
    'Soil Management','Crop Rotation','Organic Farming','Irrigation','Seed Selection','Pest Management','Post-Harvest Handling','Composting','Livestock Care',
    'Seedling Propagation','Agri Equipment Operation','Fertilizer Application','Integrated Pest Management','Farm Bookkeeping','Water Resource Management'
  ],
  healthcare: [
    'Patient Care','First Aid','Records Management','Community Health','Vital Signs Monitoring','Health Education','Elderly Care','Basic Life Support','Medical Inventory',
    'Triage Support','Infection Control','Medication Administration','Nutrition Counseling','Health Data Privacy Awareness','Wellness Coaching'
  ],
  education: [
    'Curriculum Design','Assessment','Classroom Management','E-Learning','Lesson Planning','Student Mentoring','Educational Technology','Inclusive Education','Training Facilitation',
    'Learning Analytics','Student Engagement Strategies','Module Development','Outcome-Based Education','Peer Mentoring','Workshop Design'
  ],
  creative: [
    'Graphic Design','Content Writing','Photography','Video Editing','Illustration','Brand Storytelling','Social Media Strategy','Copy Editing','Layout Design','Motion Graphics',
    'Color Theory','Brand Identity Development','Content Strategy','Script Writing','Storyboard Creation','Audio Editing','Lightroom Workflow'
  ],
  arts_crafts: [
    'Weaving','Handicraft Production','Bamboo Crafting','Wood Carving','Textile Dyeing','Basket Weaving','Embroidery','Shell Crafting','Metal Craft Basics','Hand Loom Operation',
    'Pattern Drafting','Traditional Dye Techniques','Product Finishing','Hand Tool Maintenance','Design Prototyping','Local Material Sourcing'
  ],
  marine: [
    'Boat Handling','Navigation','Safety Compliance','Basic Engine Maintenance','Marine Ecology Awareness','Dive Support','Radio Communication','Dock Operations',
    'Vessel Maintenance Logs','Chart Reading','Tide & Current Interpretation','Marine Waste Management','Crew Coordination','Emergency Drill Execution'
  ],
  government: [
    'Public Administration','Policy Drafting','Records Filing','Community Outreach','Regulatory Compliance','Barangay Coordination','Public Consultation','Disaster Preparedness','Development Planning','Local Budget Familiarity'
  ],
  social_enterprise: [
    'Impact Measurement','Grant Writing','Stakeholder Engagement','Fundraising','Program Design','Volunteer Management','Social Campaign Planning','Partnership Development','Baseline Surveying','Advocacy Strategy'
  ],
  construction: [
    'Project Planning','AutoCAD','Blueprint Reading','Materials Estimation','Site Supervision','Safety Compliance','Quality Inspection','Concrete Works','Structural Framing','Equipment Coordination'
  ]
};

// Additional Filipino / local cultural skill elements to enrich variety
const culturalSkills = ['Basic Cebuano', 'Conversational Cebuano', 'Cultural Heritage Advocacy', 'Community Organizing', 'Barangay Coordination', 'Local Tourism Promotion', 'Environmental Stewardship', 'Coastal Resource Management'];

function pick(arr, min, max) {
  const count = faker.number.int({ min, max });
  return faker.helpers.arrayElements(arr, count);
}

function yearsExperience(category) {
  if (category === 'fresh') return faker.number.int({ min: 0, max: 1 });
  if (category === 'mid') return faker.number.int({ min: 2, max: 5 });
  return faker.number.int({ min: 6, max: 25 });
}

function graduationYear(expYears) {
  const currentYear = new Date().getFullYear();
  const base = currentYear - expYears - faker.number.int({ min: 0, max: 2 });
  return Math.max(base, currentYear - 30);
}

function randomSector() {
  const r = Math.random();
  let acc = 0;
  for (const s of sectors) {
    acc += sectorWeights[s] || 0;
    if (r <= acc) return s;
  }
  return sectors[sectors.length - 1];
}

function sectorSkills(sector) {
  switch (sector) {
    case 'Tourism & Hospitality': return skillPools.tourism;
    case 'Agriculture': return skillPools.agriculture;
    case 'Healthcare': return skillPools.healthcare;
    case 'Education & Training': return skillPools.education;
    case 'Creative Media': return skillPools.creative;
    case 'Arts & Crafts': return skillPools.arts_crafts;
    case 'Marine Services': return skillPools.marine;
    case 'ICT & Freelance': return skillPools.tech;
    case 'Construction & Engineering': return [...skillPools.construction, ...skillPools.tech.slice(0,5)];
    case 'Local Government': return [...skillPools.government, ...skillPools.general.slice(0,5)];
    case 'Social Enterprise': return [...skillPools.social_enterprise, ...skillPools.general.slice(0,5)];
    default: return skillPools.general;
  }
}

let users = [];
// Track used full names to minimize duplicates. We allow natural chance of rare duplicates, but we'll try to avoid them.
const usedFullNames = new Set();

// Filipino suffixes and professional titles
const filipinoSuffixes = ['Jr.', 'III', 'IV', 'Sr.', 'II'];
const professionalTitles = [
  'Engr.', 'Atty.', 'Dr.', 'Prof.', 'Arch.',
  'CPA', 'Capt.', 'Hon.', 'Rev.', 'Dir.', 'Chief', 'VP', 'MD', 'RN', 'PhD', 'DDS', 'DVM', 'CFO', 'CEO', 'COO',
];

// Track uniqueness for emails
const emailBaseCounts = {};

function genUsers() {
  let idCounter = 1; // We'll still generate UUIDs, but a counter helps debug
  function newId() { return faker.string.uuid(); }

  const pushUser = (category) => {
    const id = newId();

    // Ensure (first_name + last_name) uniqueness with limited retries; optionally combine two first names.
    let first, last, fullKey;
    let attempts = 0;
    while (attempts < 6) { // few quick attempts with single first name
      first = faker.helpers.arrayElement(phFirstNames);
      last = faker.helpers.arrayElement(phLastNames);
      fullKey = `${first}||${last}`;
      if (!usedFullNames.has(fullKey)) break;
      attempts++;
    }
    if (usedFullNames.has(fullKey)) {
      // Still collided; build a compound first name (two distinct first names) to differentiate.
      const secondFirst = faker.helpers.arrayElement(phFirstNames.filter(n => n !== first));
      first = `${first} ${secondFirst}`; // combine; email sanitization below will handle spaces
      fullKey = `${first}||${last}`;
    }
    usedFullNames.add(fullKey);

    const baseLocal = `${first}.${last}`.toLowerCase().replace(/[^a-z0-9]+/g,'');
    let suffixIndex = emailBaseCounts[baseLocal] ?? 0;
    emailBaseCounts[baseLocal] = suffixIndex + 1;
    const emailLocal = suffixIndex === 0 ? baseLocal : baseLocal + suffixIndex; // first occurrence has no numeric suffix
    const email = emailLocal + '@example.test';
    const exp = yearsExperience(category);
    const sector = randomSector();
    // Randomly assign suffix/title to ~20-30% of users
    let suffix = null, title = null;
    const assignType = Math.random();
    if (assignType < 0.15) {
      // Only suffix
      suffix = faker.helpers.arrayElement(filipinoSuffixes);
    } else if (assignType < 0.30) {
      // Only title
      title = faker.helpers.arrayElement(professionalTitles);
    } else if (assignType < 0.35) {
      // Both
      suffix = faker.helpers.arrayElement(filipinoSuffixes);
      title = faker.helpers.arrayElement(professionalTitles);
    }
// Bilingual flavor occasionally (Tagalog/Cebuano mix) for realism
const bilingualAddons = [
      'Active in local community projects.', 'Regularly volunteers at civic outreach events.', 'Helps organize weekend coastal cleanups.', 'Assists with relief repacking during typhoon season.', 'Frequently joins tree planting initiatives.', 'Supports small community livelihood seminars.', 'Facilitates basic digital literacy workshops.', 'Engages with youth development council programs.', 'Supports cooperative-centered local enterprises.', 'Coordinates barangay disaster preparedness drills.', 'Serves as a resource speaker in local forums.', 'Contributes to community-driven mapping initiatives.', 'Assists elderly residents with online registrations.', 'Facilitates youth leadership reflection circles.', 'Participates in health awareness caravans.', 'Promotes urban pocket gardening initiatives.', 'Advocates fair trade promotion for local products.', 'Helps mobilize school supply donation drives.', 'Moderates local grassroots innovation meetups.', 'Encourages cooperative membership engagement.', 'Supports coastal resource stewardship campaigns.', 'Assists with community feedback system pilots.', 'Participates in participatory budgeting workshops.', 'Promotes inclusive civic dialogue practices.', 'Helps streamline community meeting facilitation.', 'Provides peer mentoring for students.', 'Organizes weekend study support sessions.', 'Tutors out-of-school youth in foundational literacy.', 'Introduces coding fundamentals to teenagers.', 'Designs simplified study aids for rural learners.', 'Sets up neighborhood reading corners.', 'Assists educators with digital migration tasks.', 'Creates plain-language summaries of complex lessons.', 'Curates open educational resource collections.', 'Advocates learner-centered teaching strategies.', 'Helps coordinate modular material distribution.', 'Co-develops flexible community learning spaces.', 'Facilitates early childhood storytelling circles.', 'Conducts study technique reinforcement sessions.', 'Promotes accessibility in educational content.', 'Encourages reflective academic journaling habits.', 'Participates in environmental cleanup drives.', 'Organizes plastic reduction awareness campaigns.', 'Promotes responsible coastal tourism practices.', 'Monitors community mangrove rehabilitation plots.', 'Advocates watershed conservation behaviors.', 'Promotes zero-waste household transitions.', 'Documents local biodiversity sightings.', 'Supports citizen coral monitoring initiatives.', 'Raises awareness on rainwater harvesting benefits.', 'Facilitates composting technique demonstrations.', 'Promotes sustainable livelihood alternatives.', 'Assists with marine debris classification logs.', 'Encourages household waste segregation compliance.', 'Conducts coastal hazard orientation briefings.', 'Pilots community seed bank exchange activities.', 'Delivers climate resilience info sessions.', 'Supports native plant propagation clusters.', 'Helps incubate early eco-enterprise concepts.', 'Volunteers at community health outreach fairs.', 'Assists with basic vital sign screening booths.', 'Distributes health information materials.', 'Promotes household nutrition awareness.', 'Coordinates inclusive wellness fun run logistics.', 'Supports peer-based mental health listening spaces.', 'Assists mobile medical outreach teams.', 'Encourages preventive checkup scheduling.', 'Conducts introductory first aid mini-sessions.', 'Promotes safe water handling practices.', 'Raises maternal health awareness topics.', 'Assists midwives during vaccination activities.', 'Validates incoming health survey form entries.', 'Helps draft simplified health orientation guides.', 'Shares practical urban gardening techniques.', 'Digitizes smallholder farm record templates.', 'Assists with organic fertilizer demonstration plots.', 'Coordinates farm-to-market linkage consultations.', 'Conducts post-harvest handling orientations.', 'Promotes diversified cropping strategies.', 'Mobilizes youth volunteers for agri field days.', 'Encourages efficient irrigation water usage.', 'Advocates community seed saving initiatives.', 'Documents farmer field school observations.', 'Facilitates cooperative governance reflection sessions.', 'Supports participatory farm planning dialogues.', 'Installs lightweight open source tools for SMEs.', 'Assists public offices in digitizing records.', 'Delivers basic cybersecurity awareness tips.', 'Optimizes workflows for low-bandwidth contexts.', 'Helps pilot community Wi-Fi hotspot deployments.', 'Supports open data transparency communities.', 'Contributes to localization of software documentation.', 'Prototypes simple civic technology dashboards.', 'Facilitates design thinking sprint activities.', 'Encourages ethical technology adoption discussions.', 'Onboards teams to digital collaboration platforms.', 'Introduces structured version control practices.', 'Volunteers in cultural heritage mapping sessions.', 'Supports narrative development for artisan products.', 'Organizes youth collaborative mural projects.', 'Documents oral history interview transcripts.', 'Curates layouts for pop-up community exhibits.', 'Advocates preservation of traditional weaving crafts.', 'Assists with visitor flow design in heritage venues.', 'Promotes digital access to local craft catalogs.', 'Launches collaborative art ideation workshops.', 'Mentors emerging creatives in portfolio building.', 'Validates baseline social survey instruments.', 'Maps multi-stakeholder relationship networks.', 'Drafts early-stage impact measurement frameworks.', 'Advocates inclusive and equitable hiring practices.', 'Coaches micro-entrepreneurs on brand clarity.', 'Streamlines beneficiary intake tracking processes.', 'Facilitates community co-design charrettes.', 'Runs short-form financial literacy primers.', 'Hosts social innovation pitch showcase nights.', 'Promotes participatory monitoring approaches.', 'Refines social enterprise narrative positioning.', 'Moderates open governance roundtable discussions.', 'Supports transparency-focused dashboard experiments.', 'Assists public consultation documentation teams.', 'Simplifies policy drafts into layman summaries.', 'Facilitates iterative civic feedback workshops.', 'Promotes data-informed barangay planning cycles.', 'Organizes youth civic engagement clusters.', 'Supports election process literacy initiatives.', 'Mentors peers on structured project execution.', 'Shares applied time management templates.', 'Advocates psychological safety within teams.', 'Encourages documentation-first engineering habits.', 'Promotes reflective learning practice reviews.', 'Introduces lean experimentation cycles.', 'Reinforces outcome-focused collaboration norms.', 'Encourages proactive stakeholder alignment.', 'Advocates continuous feedback integration.', 'Simplifies technical terms into plain English.', 'Assists in multilingual workshop facilitation.', 'Localizes user-facing instructional material.', 'Encourages inclusive onboarding language choices.', 'Adapts content to reflect regional nuances.', 'Supports progressive terminology standardization.', 'Volunteers in early warning information dissemination.', 'Maps hazard-prone residential clusters.', 'Demonstrates household emergency kit preparation.', 'Assists evacuation drill logistics planning.', 'Helps encode rapid needs assessment findings.', 'Supports localized climate adaptation briefings.', 'Develops concise emergency reference leaflets.', 'Monitors beach erosion indicators periodically.', 'Promotes reef-safe tourism behavior guidelines.', 'Logs shoreline debris classification counts.', 'Encourages sustainable small-scale fishing norms.', 'Validates community marine survey submissions.', 'Promotes responsible snorkeling brief orientations.', 'Supports sea grass bed observational surveys.', 'Facilitates structured retrospective discussions.', 'Prototypes low-cost community process tools.', 'Documents peer knowledge sharing outputs.', 'Automates repetitive administrative tasks.', 'Promotes iterative improvement mindsets.', 'Shares secure credential hygiene reminders.', 'Encourages collaborative problem reframing.', 'Applies human-centered design frameworks.', 'Promotes equitable access to learning tools.', 'Integrates continuous feedback loops in workflows.', 'Advocates ethical resource allocation decisions.', 'Improves localized onboarding documentation.', 'Helps teams adopt lightweight risk registers.', 'Supports peer-led capability uplift sessions.', 'Introduces lightweight impact tracking logs.',
      // --- 600 more unique phrases below ---
      'Leads local disaster simulation exercises.', 'Organizes barangay sports tournaments.', 'Facilitates online learning webinars.', 'Promotes digital inclusion for seniors.', 'Coordinates food bank distribution events.', 'Mentors youth in entrepreneurship.', 'Hosts community art competitions.', 'Advocates for green energy adoption.', 'Supports local animal welfare campaigns.', 'Conducts financial planning workshops.', 'Promotes healthy lifestyle challenges.', 'Facilitates inter-barangay knowledge exchange.', 'Organizes local history walking tours.', 'Leads recycling awareness drives.', 'Hosts coding bootcamps for beginners.', 'Promotes water conservation projects.', 'Coordinates local book donation drives.', 'Facilitates mental health first aid training.', 'Organizes community mural painting.', 'Leads barangay safety patrols.', 'Hosts local science fairs.', 'Promotes inclusive playground design.', 'Facilitates parent-teacher engagement sessions.', 'Organizes local food festivals.', 'Leads barangay tree census projects.', 'Hosts digital storytelling workshops.', 'Promotes local music talent showcases.', 'Coordinates barangay blood donation drives.', 'Facilitates senior citizen social clubs.', 'Organizes local film screenings.', 'Leads barangay composting initiatives.', 'Hosts local poetry slams.', 'Promotes local business networking events.', 'Coordinates barangay vaccination campaigns.', 'Facilitates youth leadership bootcamps.', 'Organizes local tech meetups.', 'Leads barangay emergency response teams.', 'Hosts local debate tournaments.', 'Promotes local crafts fairs.', 'Coordinates barangay clean water projects.', 'Facilitates local job fairs.', 'Organizes local environmental film festivals.', 'Leads barangay reading programs.', 'Hosts local chess tournaments.', 'Promotes local dance competitions.', 'Coordinates barangay health checkups.', 'Facilitates local startup pitch nights.', 'Organizes local photography contests.', 'Leads barangay gardening clubs.', 'Hosts local trivia nights.', 'Promotes local science clubs.', 'Coordinates barangay nutrition seminars.', 'Facilitates local volunteer appreciation events.', 'Organizes local hackathons.', 'Leads barangay art exhibitions.', 'Hosts local book clubs.', 'Promotes local sports leagues.', 'Coordinates barangay disaster relief efforts.', 'Facilitates local business incubators.', 'Organizes local coding competitions.', 'Leads barangay music festivals.', 'Hosts local science workshops.', 'Promotes local environmental stewardship.', 'Coordinates barangay youth mentorship programs.', 'Facilitates local community forums.', 'Organizes local wellness retreats.', 'Leads barangay technology literacy campaigns.', 'Hosts local film festivals.', 'Promotes local food sustainability.', 'Coordinates barangay recycling programs.', 'Facilitates local career counseling.', 'Organizes local art workshops.', 'Leads barangay health awareness campaigns.', 'Hosts local startup showcases.', 'Promotes local reading initiatives.', 'Coordinates barangay sports clinics.', 'Facilitates local science outreach.', 'Organizes local music workshops.', 'Leads barangay environmental cleanups.', 'Hosts local coding bootcamps.', 'Promotes local business development.', 'Coordinates barangay tech literacy drives.', 'Facilitates local leadership seminars.', 'Organizes local dance workshops.', 'Leads barangay nutrition programs.', 'Hosts local art competitions.', 'Promotes local science education.', 'Coordinates barangay wellness programs.', 'Facilitates local volunteer training.', 'Organizes local sports tournaments.', 'Leads barangay book clubs.', 'Hosts local environmental forums.', 'Promotes local tech innovation.', 'Coordinates barangay health fairs.', 'Facilitates local business networking.', 'Organizes local reading programs.', 'Leads barangay science fairs.', 'Hosts local wellness workshops.', 'Promotes local art exhibitions.', 'Coordinates barangay startup incubators.', 'Facilitates local coding workshops.', 'Organizes local nutrition seminars.', 'Leads barangay volunteer drives.', 'Hosts local science competitions.', 'Promotes local dance festivals.', 'Coordinates barangay music clubs.', 'Facilitates local environmental education.', 'Organizes local tech workshops.', 'Leads barangay wellness initiatives.', 'Hosts local business forums.', 'Promotes local reading clubs.', 'Coordinates barangay art projects.', 'Facilitates local science education.', 'Organizes local volunteer appreciation.', 'Leads barangay startup events.', 'Hosts local nutrition workshops.', 'Promotes local tech meetups.', 'Coordinates barangay wellness seminars.', 'Facilitates local art education.', 'Organizes local business development events.', 'Leads barangay science workshops.', 'Hosts local volunteer training sessions.', 'Promotes local wellness programs.', 'Coordinates barangay reading initiatives.', 'Facilitates local tech innovation.', 'Organizes local art festivals.', 'Leads barangay business incubators.', 'Hosts local science outreach events.', 'Promotes local nutrition education.', 'Coordinates barangay volunteer programs.', 'Facilitates local wellness seminars.', 'Organizes local tech competitions.', 'Leads barangay art workshops.', 'Hosts local business networking events.', 'Promotes local science education.', 'Coordinates barangay wellness initiatives.', 'Facilitates local reading programs.', 'Organizes local volunteer drives.', 'Leads barangay tech innovation.', 'Hosts local art exhibitions.', 'Promotes local business development.', 'Coordinates barangay science fairs.', 'Facilitates local wellness workshops.', 'Organizes local nutrition programs.', 'Leads barangay volunteer appreciation.', 'Hosts local tech meetups.', 'Promotes local art education.', 'Coordinates barangay business forums.', 'Facilitates local science competitions.', 'Organizes local wellness retreats.', 'Leads barangay reading clubs.', 'Hosts local volunteer training.', 'Promotes local tech innovation.', 'Coordinates barangay art exhibitions.', 'Facilitates local business development.', 'Organizes local science workshops.', 'Leads barangay wellness programs.', 'Hosts local nutrition seminars.', 'Promotes local volunteer appreciation.', 'Coordinates barangay tech workshops.', 'Facilitates local art competitions.', 'Organizes local business networking.', 'Leads barangay science outreach.', 'Hosts local wellness seminars.', 'Promotes local reading initiatives.', 'Coordinates barangay volunteer training.', 'Facilitates local tech education.', 'Organizes local art workshops.', 'Leads barangay business development.', 'Hosts local science fairs.', 'Promotes local wellness education.', 'Coordinates barangay nutrition programs.', 'Facilitates local volunteer appreciation.', 'Organizes local tech innovation events.', 'Leads barangay art education.', 'Hosts local business development events.', 'Promotes local science innovation.', 'Coordinates barangay wellness workshops.', 'Facilitates local reading clubs.', 'Organizes local volunteer programs.', 'Leads barangay tech competitions.', 'Hosts local art festivals.', 'Promotes local business networking.', 'Coordinates barangay science education.', 'Facilitates local wellness innovation.', 'Organizes local nutrition workshops.', 'Leads barangay volunteer training.', 'Hosts local tech education events.', 'Promotes local art innovation.', 'Coordinates barangay business incubators.', 'Facilitates local science education.', 'Organizes local wellness programs.', 'Leads barangay reading initiatives.', 'Hosts local volunteer appreciation.', 'Promotes local tech workshops.', 'Coordinates barangay art innovation.', 'Facilitates local business forums.', 'Organizes local science competitions.', 'Leads barangay wellness seminars.', 'Hosts local nutrition education.', 'Promotes local volunteer programs.', 'Coordinates barangay tech innovation.', 'Facilitates local art education.', 'Organizes local business networking events.', 'Leads barangay science innovation.', 'Hosts local wellness workshops.', 'Promotes local reading programs.', 'Coordinates barangay volunteer appreciation.', 'Facilitates local tech innovation.', 'Organizes local art competitions.', 'Leads barangay business development.', 'Hosts local science fairs.', 'Promotes local wellness education.', 'Coordinates barangay nutrition seminars.', 'Facilitates local volunteer training.', 'Organizes local tech innovation events.', 'Leads barangay art workshops.', 'Hosts local business development events.', 'Promotes local science education.', 'Coordinates barangay wellness programs.', 'Facilitates local reading clubs.', 'Organizes local volunteer programs.', 'Leads barangay tech innovation.', 'Hosts local art exhibitions.', 'Promotes local business networking.', 'Coordinates barangay science fairs.', 'Facilitates local wellness workshops.', 'Organizes local nutrition programs.', 'Leads barangay volunteer appreciation.', 'Hosts local tech meetups.', 'Promotes local art education.', 'Coordinates barangay business forums.', 'Facilitates local science competitions.', 'Organizes local wellness retreats.', 'Leads barangay reading clubs.', 'Hosts local volunteer training.', 'Promotes local tech innovation.', 'Coordinates barangay art exhibitions.', 'Facilitates local business development.', 'Organizes local science workshops.', 'Leads barangay wellness programs.', 'Hosts local nutrition seminars.', 'Promotes local volunteer appreciation.', 'Coordinates barangay tech workshops.', 'Facilitates local art competitions.', 'Organizes local business networking.', 'Leads barangay science outreach.', 'Hosts local wellness seminars.', 'Promotes local reading initiatives.', 'Coordinates barangay volunteer training.', 'Facilitates local tech education.', 'Organizes local art workshops.', 'Leads barangay business development.', 'Hosts local science fairs.', 'Promotes local wellness education.', 'Coordinates barangay nutrition programs.', 'Facilitates local volunteer appreciation.', 'Organizes local tech innovation events.', 'Leads barangay art education.', 'Hosts local business development events.', 'Promotes local science innovation.', 'Coordinates barangay wellness workshops.', 'Facilitates local reading clubs.', 'Organizes local volunteer programs.', 'Leads barangay tech competitions.', 'Hosts local art festivals.', 'Promotes local business networking.', 'Coordinates barangay science education.', 'Facilitates local wellness innovation.', 'Organizes local nutrition workshops.', 'Leads barangay volunteer training.', 'Hosts local tech education events.', 'Promotes local art innovation.', 'Coordinates barangay business incubators.', 'Facilitates local science education.', 'Organizes local wellness programs.', 'Leads barangay reading initiatives.', 'Hosts local volunteer appreciation.', 'Promotes local tech workshops.', 'Coordinates barangay art innovation.', 'Facilitates local business forums.', 'Organizes local science competitions.', 'Leads barangay wellness seminars.', 'Hosts local nutrition education.', 'Promotes local volunteer programs.', 'Coordinates barangay tech innovation.', 'Facilitates local art education.', 'Organizes local business networking events.', 'Leads barangay science innovation.', 'Hosts local wellness workshops.', 'Promotes local reading programs.', 'Coordinates barangay volunteer appreciation.', 'Facilitates local tech innovation.', 'Organizes local art competitions.', 'Leads barangay business development.', 'Hosts local science fairs.', 'Promotes local wellness education.', 'Coordinates barangay nutrition seminars.', 'Facilitates local volunteer training.'
    ];
  // const baseBio = faker.person.bio();
  const extra = Math.random() < 0.5 ? ' ' + faker.helpers.arrayElement(bilingualAddons) : '';
  // Only use enrichment phrase for now (no faker bio)
  const profileSummary = extra.trim().slice(0, 600);
  const barangay = faker.helpers.arrayElement(phBarangays);
  const town = faker.helpers.arrayElement(phTowns);
  const province = 'Bohol';

  users.push({ id, first, last, email, category, exp, sector, profileSummary, barangay, town, province, suffix, title });
};

  for (let i = 0; i < DISTRIBUTION.fresh; i++) pushUser('fresh');
  for (let i = 0; i < DISTRIBUTION.mid; i++) pushUser('mid');
  for (let i = 0; i < DISTRIBUTION.senior; i++) pushUser('senior');
}

genUsers();

// Build SQL
let lines = [];
lines.push('-- =====================================================================');
lines.push('-- Auto-generated seed data for local development');
lines.push('-- Generated at ' + new Date().toISOString());
lines.push('--');
lines.push('-- PURPOSE');
lines.push('--   Provides 1000 localized (PH) mock users with professionals, education,');
lines.push('--   work history, skills, and a single link each for feature prototyping');
lines.push('--   (search, filtering, UI iteration).');
lines.push('--');
lines.push('-- USAGE (DESTRUCTIVE)');
lines.push('--   1. supabase db reset        # WARNING: wipes local dev DB');
lines.push("--   2. psql $SUPABASE_DB_URL -f supabase/seed.sql");
lines.push('--      OR docker exec -i supabase-db psql -U postgres -d postgres < supabase/seed.sql');
lines.push('--');
lines.push('-- REGENERATION');
lines.push('--   From repo root (app dir contains script):');
lines.push('--     cd app && npm run seed:generate');
lines.push('--   Deterministic output via faker.seed(42). Change seed for a new dataset.');
lines.push('--');
lines.push('-- AUTH / PASSWORD');
lines.push("--   All users share the bcrypt hash for password: 'password'. Replace HASH if needed.");
lines.push('--   Direct inserts into auth.users assume local dev environment with relaxed policies.');
lines.push('--');
lines.push('-- PERFORMANCE OPT');
lines.push('--   Triggers that maintain professionals.value_profile are disabled during bulk load');
lines.push('--   and a single batch rebuild call per professional is executed, then triggers re-enabled.');
lines.push('--');
lines.push('-- DATA MODEL NOTES');
lines.push('--   * value_profile is a concatenated denormalized summary (education/work/skills/links)');
lines.push('--   * Tags include sector, town, province, and experience category (fresh/mid/senior)');
lines.push('--   * Some fresh users may have 0 work history entries (intentional)');
lines.push('--');
lines.push('-- UNIQUENESS STRATEGY');
lines.push('--   Emails: first.last(+n) to avoid collisions. first occurrence has no suffix.');
lines.push('--   Names: best-effort uniqueness of (first_name,last_name). On repeated collision a compound first name is generated (e.g., "Ana Maria").');
lines.push('--   Phones: sequential unique starting at +639000000000.');
lines.push('--');
lines.push('-- FUTURE EXTENSIONS (commented in script)');
lines.push('--   * Address columns (street_address, barangay, town, province, postal_code)');
lines.push('--   * Additional links per professional');
lines.push('--   * Locality-based additional tags (barangay)');
lines.push('--');
lines.push('-- LIMITATIONS');
lines.push('--   * Not production-grade anonymization—fabricated data only.');
lines.push('--   * Email domain fixed (@example.test).');
lines.push('--   * Single link per user to keep dataset lean.');
lines.push('--   * Phones not validated against real PH telco numbering blocks.');
lines.push('--');
lines.push('-- DISTRIBUTION');
lines.push('--   400 fresh (0-1y) / 350 mid (2-5y) / 250 senior (6-25y)');
lines.push('-- =====================================================================');
lines.push('BEGIN;');
// Temporarily disable value_profile aggregation triggers to avoid repeated recalculations
lines.push('ALTER TABLE public.education DISABLE TRIGGER education_refresh_value_profile;');
lines.push('ALTER TABLE public.work_history DISABLE TRIGGER work_history_refresh_value_profile;');
lines.push('ALTER TABLE public.skills DISABLE TRIGGER skills_refresh_value_profile;');
lines.push('ALTER TABLE public.links DISABLE TRIGGER links_refresh_value_profile;');

// auth.users (minimal columns). Adjust as needed for hosted Supabase.
lines.push('\n-- auth.users');
lines.push('/* NOTE: Direct inserts assume permissive local auth schema. */');
lines.push('DELETE FROM auth.users;');

users.forEach(u => {
  lines.push(`INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) VALUES ('${u.id}', '${u.email}', '${PASSWORD_HASH}', now(), now(), now());`);
});

// user_profiles
lines.push('\n-- public.user_profiles');
// Deleting user_profiles cascades to professionals, education, work_history, skills, links
lines.push('DELETE FROM public.user_profiles;');
// Sequential unique phone numbers to guarantee uniqueness (starts at +639000000000)
let phoneSeq = 9000000000;
users.forEach(u => {
  // Birth year influenced by experience category for realism
  let birthYearBase;
  if (u.category === 'fresh') birthYearBase = faker.number.int({min:2002,max:2005});
  else if (u.category === 'mid') birthYearBase = faker.number.int({min:1997,max:2001});
  else birthYearBase = faker.number.int({min:1978,max:1996});
  const birthYear = birthYearBase;
  const birthDate = `${birthYear}-${faker.number.int({min:1, max:12}).toString().padStart(2,'0')}-${faker.number.int({min:1, max:28}).toString().padStart(2,'0')}`;
  const phone = '+63' + (phoneSeq++).toString();
  const firstName = u.first.replace(/'/g,"''");
  const lastName = u.last.replace(/'/g,"''");
  const suffixVal = u.suffix ? `'${u.suffix.replace(/'/g,"''")}'` : 'NULL';
  const titleVal = u.title ? `'${u.title.replace(/'/g,"''")}'` : 'NULL';
  // Future-ready address generation (not inserted because schema lacks these columns yet)
  lines.push(`INSERT INTO public.user_profiles (id, first_name, last_name, suffix, title, phone_number, birth_date, photo_url, thumb_url, created_at, updated_at, active) VALUES ('${u.id}', '${firstName}', '${lastName}', ${suffixVal}, ${titleVal}, '${phone}', '${birthDate}', NULL, NULL, now(), now(), true);`);
  // lines.push(`-- FUTURE (uncomment after adding address columns): INSERT INTO public.user_profiles (id, first_name, last_name, suffix, title, phone_number, birth_date, photo_url, thumb_url, street_address, barangay, town, province, postal_code, created_at, updated_at, active) VALUES ('${u.id}', '${firstName}', '${lastName}', ${suffixVal}, ${titleVal}, '${phone}', '${birthDate}', NULL, NULL, '${'${streetAddress}'}', '${u.barangay}', '${u.town}', '${u.province}', '${'${postal}'}', now(), now(), true);`);
});

// professionals (child rows removed via cascade above)
lines.push('\n-- public.professionals');
users.forEach(u => {
  const sectorTag = u.sector.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  const townTag = u.town.toLowerCase().replace(/[^a-z0-9]+/g,'_');
  const provinceTag = u.province.toLowerCase();
  const categoryTag = u.category; // fresh/mid/senior
  const tagsArray = [sectorTag, townTag, provinceTag, categoryTag];
  const tagsLiteral = `'{"${tagsArray.join('","')}"}'`;
  lines.push(`INSERT INTO public.professionals (user_profile_id, profile_summary, tags, value_profile, created_at, updated_at) VALUES ('${u.id}', '${u.profileSummary.replace(/'/g,"''")}', ${tagsLiteral}, NULL, now(), now());`);
});

// education
lines.push('\n-- public.education');
users.forEach(u => {
  const entries = u.category === 'fresh' ? faker.number.int({min:1,max:2}) : faker.number.int({min:1,max:3});
  for (let i=0;i<entries;i++) {
    const gradYear = graduationYear(u.exp) - faker.number.int({min:0,max:2});
    const degree = faker.helpers.arrayElement(phDegrees);
    const school = faker.helpers.arrayElement(phSchools);
    lines.push(`INSERT INTO public.education (id, professional_id, school, degree, year, created_at, updated_at) VALUES ('${faker.string.uuid()}', '${u.id}', '${school}', '${degree}', ${gradYear}, now(), now());`);
  }
  // Optional short course credential (more likely for fresh & mid)
  const scProbability = u.category === 'fresh' ? 0.55 : (u.category === 'mid' ? 0.35 : 0.15);
  if (Math.random() < scProbability) {
    const scYear = graduationYear(u.exp) + faker.number.int({min:0,max:1});
    const sc = faker.helpers.arrayElement(phShortCourses);
    const school = faker.helpers.arrayElement(phSchools);
    lines.push(`INSERT INTO public.education (id, professional_id, school, degree, year, created_at, updated_at) VALUES ('${faker.string.uuid()}', '${u.id}', '${school}', '${sc}', ${scYear}, now(), now());`);
  }
});

// Sector-specific roles
const sectorRoles = {
  'Tourism & Hospitality': [
    'Guest Services Coordinator','Concierge','Front Desk Supervisor','Activity Manager','Hotel Sales Coordinator','Resort Manager','Event Planner','Restaurant Manager','Housekeeping Director','Travel Agent','Tour Guide','Hospitality Trainer'
  ],
  'Agriculture': [
    'Farm Manager','Crop Specialist','Agricultural Technician','Livestock Supervisor','Irrigation Engineer','Soil Scientist','Greenhouse Coordinator','Agricultural Consultant','Aquaculture Manager','Harvest Supervisor'
  ],
  'Education & Training': [
    'Teacher','Academic Coordinator','Curriculum Developer','Training Facilitator','Headmaster','Admissions Officer','Student Support Specialist','Education Program Manager','Tutor','Vocational Trainer'
  ],
  'Healthcare': [
    'Nurse','Medical Technologist','Physician','Clinic Manager','Pharmacist','Physical Therapist','Health Administrator','Community Health Worker','Dental Hygienist','Radiology Technician'
  ],
  'Construction & Engineering': [
    'Site Engineer','Project Manager','Architect','Quantity Surveyor','Building Inspector','Civil Engineer','Safety Officer','Construction Foreman','Structural Analyst','Estimator'
  ],
  'Marine Services': [
    'Marine Engineer','Port Manager','Vessel Technician','Diving Instructor','Fishing Operations Coordinator','Marine Biologist','Harbor Master','Nautical Surveyor','Ship Captain','Dock Supervisor'
  ],
  'ICT & Freelance': [
    'Web Developer','IT Support Specialist','Systems Analyst','Freelance Designer','Network Administrator','App Developer','Content Writer','SEO Specialist','Digital Marketer','Remote Project Manager'
  ],
  'Creative Media': [
    'Photographer','Videographer','Graphic Designer','Animation Specialist','Editor','Production Coordinator','Copywriter','Sound Engineer','Social Media Manager','Art Director'
  ],
  'Arts & Crafts': [
    'Artisan','Craftsperson','Pottery Instructor','Textile Designer','Art Teacher','Jewelry Maker','Sculpture Artist','Woodworker','Handicraft Coordinator','Gallery Assistant'
  ],
  'Local Government': [
    'Municipal Officer','Community Development Specialist','Licensing Coordinator','Public Works Supervisor','Urban Planner','Local Council Analyst','Budget Officer','Zoning Inspector','Administrative Aide','Policy Advisor'
  ],
  'Social Enterprise': [
    'Program Director','Social Worker','Fundraising Coordinator','Community Engagement Manager','Outreach Specialist','Volunteer Coordinator','Impact Analyst','Advocacy Officer','Enterprise Consultant','Training Officer'
  ],
  'General': [
    'Developer','Technician','Coordinator','Assistant','Manager','Specialist','Engineer','Consultant','Analyst'
  ]
};

// work_history
lines.push('\n-- public.work_history');
// Sector-specific organization pools (regex filtered subsets)
const sectorOrganizations = {
  'Tourism & Hospitality': phOrgs.filter(o => /(Resort|Tours?|Cruise|Hospitality|Dive|Travel|Heritage Trail|Conference|Cave)/i.test(o)),
  'Agriculture': phOrgs.filter(o => /(Agro|Farms?|Farmers|Organic|Cacao|Bamboo|Cooperative|Rice|Dairy|Highland)/i.test(o)),
  'Education & Training': phOrgs.filter(o => /(Institute|Learning|Training|Skills|Literacy|Education|Leadership|Career)/i.test(o)),
  'Healthcare': phOrgs.filter(o => /(Clinic|Health|Wellness|Medical|Midwives|Nutrition|Rehabilitation)/i.test(o)),
  'Construction & Engineering': phOrgs.filter(o => /(Engineering|Works|Construction|Structural|Infrastructure)/i.test(o)),
  'Marine Services': phOrgs.filter(o => /(Marine|Coastal|Harbor|Dive|Coral|River|Ocean|Cruise)/i.test(o)),
  'ICT & Freelance': phOrgs.filter(o => /(Tech|Digital|Startup|Cloud|Systems|Data|Freelancers|Open Source|Innovation|Civic Tech)/i.test(o)),
  'Creative Media': phOrgs.filter(o => /(Creative|Design|Studio|Forge|Creators|Arts|Cultural|Crafted)/i.test(o)),
  'Arts & Crafts': phOrgs.filter(o => /(Craft|Weavers|Woodcraft|Artisans|Shellcraft|Arts|Handloom|Heritage)/i.test(o)),
  'Local Government': phOrgs.filter(o => /(Council|Office|Planning|Records|Disaster|Development|Public Works|Transport)/i.test(o)),
  'Social Enterprise': phOrgs.filter(o => /(Empowerment|Women Entrepreneurs|Sustainable|Inclusive|Microfinance|Resilience|Innovation Lab|Impact|Livelihood)/i.test(o))
};

users.forEach(u => {
  let jobs = 0;
  if (u.category === 'fresh') jobs = faker.number.int({min:0,max:1});
  else if (u.category === 'mid') jobs = faker.number.int({min:1,max:3});
  else jobs = faker.number.int({min:2,max:5});
  let startYear = new Date().getFullYear() - u.exp;
  // Pick sector-specific roles, fallback to General if not found
  const rolesArr = sectorRoles[u.sector] || sectorRoles['General'];
  for (let i=0;i<jobs;i++) {
    const role = faker.helpers.arrayElement(rolesArr);
    const orgPool = (sectorOrganizations[u.sector] && sectorOrganizations[u.sector].length) ? sectorOrganizations[u.sector] : phOrgs;
    const org = faker.helpers.arrayElement(orgPool);
    const yearStart = startYear + i;
    const yearEnd = (i === jobs-1 && faker.datatype.boolean() && u.category !== 'fresh') ? 'NULL' : (yearStart + faker.number.int({min:0,max:2}));
    lines.push(`INSERT INTO public.work_history (id, professional_id, role, organization, summary, year_start, year_end, created_at, updated_at) VALUES ('${faker.string.uuid()}', '${u.id}', '${role}', '${org.replace(/'/g,"''")}', '${faker.lorem.sentence().replace(/'/g,"''")}', ${yearStart}, ${yearEnd}, now(), now());`);
  }
});

// skills
lines.push('\n-- public.skills');
users.forEach(u => {
  const pool = sectorSkills(u.sector);
  const merged = [...new Set([...skillPools.general, ...pool, ...culturalSkills])];
  const picked = pick(merged, 4, 9);
  picked.forEach(skill => {
    const level = u.category === 'fresh' ? 'beginner' : (u.category === 'mid' ? faker.helpers.arrayElement(['beginner','intermediate']) : faker.helpers.arrayElement(['intermediate','expert']));
    lines.push(`INSERT INTO public.skills (id, professional_id, skill, level, created_at) VALUES ('${faker.string.uuid()}', '${u.id}', '${skill}', '${level}', now());`);
  });
});

// links (exactly one per user)
lines.push('\n-- public.links');
users.forEach(u => {
  const slug = (u.first + '-' + u.last).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const baseDomain = 'profiles.example.test';
  const summary = 'Profile link';
  const url = `https://${baseDomain}/${slug}`;
  lines.push(`INSERT INTO public.links (id, professional_id, url, summary, created_at, updated_at) VALUES ('${faker.string.uuid()}', '${u.id}', '${url}', '${summary}', now(), now());`);
});

// Batch rebuild value_profile now that all related rows are in place
lines.push('\n-- Batch rebuild value_profile for all professionals');
users.forEach(u => {
  lines.push(`SELECT public.refresh_professional_value_profile('${u.id}');`);
});
// Re-enable triggers
lines.push('ALTER TABLE public.education ENABLE TRIGGER education_refresh_value_profile;');
lines.push('ALTER TABLE public.work_history ENABLE TRIGGER work_history_refresh_value_profile;');
lines.push('ALTER TABLE public.skills ENABLE TRIGGER skills_refresh_value_profile;');
lines.push('ALTER TABLE public.links ENABLE TRIGGER links_refresh_value_profile;');

lines.push('\nCOMMIT;');

fs.writeFileSync(OUTPUT, lines.join('\n') + '\n', 'utf8');
console.log('Seed file written to', OUTPUT);
