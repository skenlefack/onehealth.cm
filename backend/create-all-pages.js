const db = require('./config/db');

// Page 1: Zoonotic diseases in Cameroon
const zoonoticDiseasesPage = {
  title: 'Maladies zoonotiques au Cameroun',
  slug: 'zoonotic-diseases',
  sections: {
    "sections": [
      {
        "id": "cameroon-vulnerable",
        "type": "text-image",
        "layout": "text-left-image-right",
        "title": {
          "fr": "LE CAMEROUN EST PARTICULIEREMENT VULNERABLE",
          "en": "CAMEROON IS PARTICULARLY VULNERABLE"
        },
        "content": {
          "fr": [
            {
              "type": "paragraph",
              "text": "Les maladies zoonotiques sont des maladies qui se transmettent naturellement entre les animaux et les humains. La plupart des maladies infectieuses humaines connues et environ trois quarts des infections emergentes proviennent des animaux."
            },
            {
              "type": "paragraph",
              "text": "Le Cameroun est particulierement vulnerable aux effets des maladies zoonotiques car il est situe dans le bassin du Congo, qui est riche en faune et en flore et constitue donc un environnement fertile pour l'emergence de nouveaux pathogenes."
            },
            {
              "type": "paragraph",
              "text": "Le pays est egalement diversifie sur le plan environnemental, allant de la foret tropicale aux hautes montagnes et au Sahel aride."
            },
            {
              "type": "paragraph",
              "text": "Des epidemies de maladie a virus Ebola ont souvent ete signalees dans le bassin du Congo."
            }
          ],
          "en": [
            {
              "type": "paragraph",
              "text": "Zoonotic diseases are diseases that are naturally spread between animals and people. Most known human infectious diseases and about three-quarters of newly emerging infections originate from animals."
            },
            {
              "type": "paragraph",
              "text": "Cameroon is particularly vulnerable to the effect of zoonotic diseases because it is situated in the Congo basin, which is rich in fauna and flora and thus constitutes a fertile environment for the emergence of new pathogens."
            },
            {
              "type": "paragraph",
              "text": "The country is also environmentally diverse, ranging from tropical rainforest to high mountains and arid Sahel."
            },
            {
              "type": "paragraph",
              "text": "Outbreaks of Ebola virus disease have often been reported from the Congo basin."
            }
          ]
        },
        "image": {
          "src": "/uploads/pages/cameroon-map-zoonoses.png",
          "alt": {
            "fr": "Carte du Cameroun montrant les zones d'etudes zoonotiques",
            "en": "Map of Cameroon showing zoonotic study areas"
          }
        }
      },
      {
        "id": "prioritisation-zoonoses",
        "type": "text-image",
        "layout": "text-left-image-right",
        "title": {
          "fr": "PRIORISATION DES ZOONOSES AU CAMEROUN",
          "en": "PRIORITISATION OF ZOONOSES IN CAMEROON"
        },
        "content": {
          "fr": [
            {
              "type": "paragraph",
              "text": "Le paysage unique du pays peut creer un large eventail de menaces de maladies zoonotiques, y compris des maladies persistantes associees aux pertes de betail dans le nord pastoral aux pathogenes viraux nouvellement emergents dans le sud forestier."
            },
            {
              "type": "paragraph",
              "text": "En 2015, un atelier de deux jours a ete organise pour identifier les maladies zoonotiques de plus grande preoccupation nationale pour le Cameroun en utilisant les contributions de representants de la sante humaine, de l'elevage, de l'environnement, de la faune, de la recherche et des secteurs de l'enseignement superieur. Au cours de l'atelier, les representants ont identifie une liste de maladies zoonotiques pertinentes pour le Cameroun, defini les criteres de priorisation et determine les questions et les poids pertinents pour chaque critere."
            },
            {
              "type": "paragraph",
              "text": "Cinq maladies zoonotiques ont ete identifiees comme prioritaires par les participants en utilisant un outil de selection semi-quantitatif developpe par les Centers for Disease Control and Prevention (CDC) des Etats-Unis. Les cinq maladies zoonotiques selectionnees sont :"
            },
            {
              "type": "list",
              "style": "bullet",
              "items": [
                "la rage",
                "l'anthrax (charbon)",
                "l'influenza aviaire hautement pathogene",
                "la maladie a virus Ebola",
                "la tuberculose bovine"
              ]
            },
            {
              "type": "paragraph",
              "text": "Lors de la cinquieme session du Comite de Pilotage du Programme, la priorisation des zoonoses dans les zones agro-ecologiques a ete validee, conduisant a une augmentation du nombre de zoonoses prioritaires de 5 a 10."
            }
          ],
          "en": [
            {
              "type": "paragraph",
              "text": "The country's unique landscape can create a wide range of zoonotic disease threats, including persistent diseases associated with livestock losses in the pastoral north to newly emerging viral pathogens in the forested south."
            },
            {
              "type": "paragraph",
              "text": "In 2015, a two-day workshop was organized to identify zoonotic diseases of greatest national concern for Cameroon using input from representatives of human health, livestock, environment, wildlife, research, and higher education sectors. During the workshop, representatives identified a list of zoonotic diseases relevant for Cameroon, defined the criteria for prioritization, and determined questions and weights relevant to each criterion."
            },
            {
              "type": "paragraph",
              "text": "Five zoonotic diseases were identified as a priority by participants using a semi-quantitative selection tool developed by the U.S. Centers for Disease Control and Prevention (CDC). The five selected zoonotic diseases are:"
            },
            {
              "type": "list",
              "style": "bullet",
              "items": [
                "rabies",
                "anthrax",
                "highly pathogenic avian influenza",
                "Ebola Virus disease",
                "bovine tuberculosis"
              ]
            },
            {
              "type": "paragraph",
              "text": "During the fifth session of the Steering committee of the Program, the priorization of zoonoses in agro-ecological zones was validated leading to an increase in the number of priority zoonoses from 5 to 10."
            }
          ]
        },
        "image": {
          "src": "",
          "alt": { "fr": "", "en": "" }
        }
      }
    ],
    "settings": {}
  },
  meta_title: 'Maladies zoonotiques au Cameroun - One Health Cameroun',
  meta_description: 'Priorisation et surveillance des maladies zoonotiques au Cameroun'
};

// Page 2: Cameroon One Health National Strategy Guidelines
const strategyPage = {
  title: 'Strategie Nationale One Health',
  slug: 'national-strategy',
  sections: {
    "sections": [
      {
        "id": "strategy-intro",
        "type": "text-image",
        "layout": "text-left-image-right",
        "title": {
          "fr": "STRATEGIE NATIONALE ONE HEALTH DU CAMEROUN",
          "en": "CAMEROON ONE HEALTH NATIONAL STRATEGY"
        },
        "content": {
          "fr": [
            {
              "type": "paragraph",
              "text": "En 2012, la Strategie Nationale One Health du Cameroun a ete elaboree. La strategie est alignee sur les Objectifs de Developpement National ainsi que sur l'Agenda de Securite Sanitaire Mondiale."
            },
            {
              "type": "paragraph",
              "text": "Ce document etablit un cadre strategique pour la mise en oeuvre de l'approche One Health au Cameroun sous 5 axes majeurs :"
            }
          ],
          "en": [
            {
              "type": "paragraph",
              "text": "In 2012, the Cameroon One Health National Strategy was developed. The strategy is in alignment with National Development Objectives as well as the Global Health Security Agenda."
            },
            {
              "type": "paragraph",
              "text": "This document lays out a strategic framework for the implementation of the One Health Approach in Cameroon under 5 major axes:"
            }
          ]
        },
        "image": {
          "src": "/uploads/pages/strategy-overview.png",
          "alt": {
            "fr": "Apercu des 5 strategies One Health",
            "en": "Overview of 5 One Health strategies"
          }
        }
      },
      {
        "id": "strategy-1",
        "type": "text-image",
        "layout": "text-left-image-right",
        "title": {
          "fr": "STRATEGIE 1 : Cadre Institutionnel",
          "en": "STRATEGY 1: Institutional Framework"
        },
        "content": {
          "fr": [
            {
              "type": "paragraph",
              "text": "Mise en place du cadre institutionnel pour \"One Health\""
            },
            {
              "type": "paragraph",
              "text": "Cette strategie vise a etablir les structures organisationnelles et les mecanismes de gouvernance necessaires pour coordonner les efforts One Health a travers les differents secteurs au Cameroun."
            }
          ],
          "en": [
            {
              "type": "paragraph",
              "text": "Putting into place the institutional framework for \"One Health\""
            },
            {
              "type": "paragraph",
              "text": "This strategy aims to establish the organizational structures and governance mechanisms needed to coordinate One Health efforts across different sectors in Cameroon."
            }
          ]
        },
        "image": { "src": "", "alt": { "fr": "", "en": "" } }
      },
      {
        "id": "strategy-2",
        "type": "text-image",
        "layout": "text-left-image-right",
        "title": {
          "fr": "STRATEGIE 2 : Partage des Connaissances",
          "en": "STRATEGY 2: Knowledge Sharing"
        },
        "content": {
          "fr": [
            {
              "type": "paragraph",
              "text": "Partage des connaissances et formation"
            },
            {
              "type": "paragraph",
              "text": "Cette strategie se concentre sur le renforcement des capacites a travers la formation et le partage des connaissances entre les professionnels de la sante humaine, animale et environnementale."
            }
          ],
          "en": [
            {
              "type": "paragraph",
              "text": "Knowledge sharing and training"
            },
            {
              "type": "paragraph",
              "text": "This strategy focuses on capacity building through training and knowledge sharing among human, animal, and environmental health professionals."
            }
          ]
        },
        "image": { "src": "", "alt": { "fr": "", "en": "" } }
      },
      {
        "id": "strategy-3",
        "type": "text-image",
        "layout": "text-left-image-right",
        "title": {
          "fr": "STRATEGIE 3 : Systemes de Surveillance",
          "en": "STRATEGY 3: Surveillance Systems"
        },
        "content": {
          "fr": [
            {
              "type": "paragraph",
              "text": "Renforcement des systemes de surveillance de la sante environnementale, de la sante animale et de la sante humaine"
            },
            {
              "type": "paragraph",
              "text": "Cette strategie vise a ameliorer la detection precoce et la reponse aux menaces sanitaires grace a des systemes de surveillance integres."
            }
          ],
          "en": [
            {
              "type": "paragraph",
              "text": "Strengthening surveillance systems of environmental health, animal health and human health"
            },
            {
              "type": "paragraph",
              "text": "This strategy aims to improve early detection and response to health threats through integrated surveillance systems."
            }
          ]
        },
        "image": { "src": "", "alt": { "fr": "", "en": "" } }
      },
      {
        "id": "strategy-4",
        "type": "text-image",
        "layout": "text-left-image-right",
        "title": {
          "fr": "STRATEGIE 4 : Recherche",
          "en": "STRATEGY 4: Research"
        },
        "content": {
          "fr": [
            {
              "type": "paragraph",
              "text": "Developpement de la recherche sur les maladies emergentes et re-emergentes"
            },
            {
              "type": "paragraph",
              "text": "Cette strategie soutient les initiatives de recherche pour mieux comprendre et combattre les maladies zoonotiques emergentes et re-emergentes."
            }
          ],
          "en": [
            {
              "type": "paragraph",
              "text": "Development of research on emerging and re-emerging diseases"
            },
            {
              "type": "paragraph",
              "text": "This strategy supports research initiatives to better understand and combat emerging and re-emerging zoonotic diseases."
            }
          ]
        },
        "image": { "src": "", "alt": { "fr": "", "en": "" } }
      },
      {
        "id": "strategy-5",
        "type": "text-image",
        "layout": "text-left-image-right",
        "title": {
          "fr": "STRATEGIE 5 : Communication et Sensibilisation",
          "en": "STRATEGY 5: Communication and Sensitization"
        },
        "content": {
          "fr": [
            {
              "type": "paragraph",
              "text": "Communication et sensibilisation sur le concept \"One Health\""
            },
            {
              "type": "paragraph",
              "text": "Cette strategie vise a sensibiliser le public et les parties prenantes au concept One Health et a l'importance de la collaboration intersectorielle pour la sante."
            }
          ],
          "en": [
            {
              "type": "paragraph",
              "text": "Communication and sensitization on the \"One Health\" concept"
            },
            {
              "type": "paragraph",
              "text": "This strategy aims to raise awareness among the public and stakeholders about the One Health concept and the importance of intersectoral collaboration for health."
            }
          ]
        },
        "image": { "src": "", "alt": { "fr": "", "en": "" } }
      }
    ],
    "settings": {}
  },
  meta_title: 'Strategie Nationale One Health - One Health Cameroun',
  meta_description: 'Les 5 axes strategiques de la mise en oeuvre de l approche One Health au Cameroun'
};

async function createPages() {
  const pages = [zoonoticDiseasesPage, strategyPage];

  for (const page of pages) {
    try {
      const sectionsJson = JSON.stringify(page.sections);

      // Check if page exists
      const [existing] = await db.query('SELECT id FROM pages WHERE slug = ?', [page.slug]);

      if (existing.length > 0) {
        await db.query(`
          UPDATE pages
          SET sections = ?, title = ?, meta_title = ?, meta_description = ?,
              show_title = 1, show_breadcrumb = 1, status = 'published'
          WHERE slug = ?
        `, [sectionsJson, page.title, page.meta_title, page.meta_description, page.slug]);
        console.log(`Page "${page.title}" mise a jour!`);
      } else {
        await db.query(`
          INSERT INTO pages (title, slug, content, sections, template, status, meta_title, meta_description, show_title, show_breadcrumb, author_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [page.title, page.slug, '', sectionsJson, 'default', 'published', page.meta_title, page.meta_description, 1, 1, 2]);
        console.log(`Page "${page.title}" creee!`);
      }
    } catch (error) {
      console.error(`Erreur pour "${page.title}":`, error.message);
    }
  }

  process.exit(0);
}

createPages();
