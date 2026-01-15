const db = require('./config/db');

const sectionsData = {
  "sections": [
    {
      "id": "one-health-concept",
      "type": "text-image",
      "layout": "text-left-image-right",
      "title": {
        "fr": "LE CONCEPT \"ONE HEALTH\" AU CAMEROUN",
        "en": "THE \"ONE HEALTH\" CONCEPT IN CAMEROON"
      },
      "content": {
        "fr": [
          {
            "type": "paragraph",
            "text": "En 2004, un cadre de travail visant a reduire le risque de maladies infectieuses a l'interface Animal-Homme-Ecosysteme a ete developpe par les agences des Nations Unies et en 2010, la FAO, l'OIE et l'OMS ont developpe leur strategie pour relever ce nouveau defi. Situe dans la region du Bassin du Congo, considere comme a haut risque potentiel d'emergence de pandemies, le Cameroun n'a pas d'autre choix que de mettre en oeuvre sa strategie nationale \"One Health\"."
          },
          {
            "type": "paragraph",
            "text": "Le concept \"One Health\" est une approche coherente, globale et preventive pour la protection de la sante humaine, visant a renforcer les liens entre la sante animale, la sante humaine et la sante des ecosystemes."
          },
          {
            "type": "paragraph",
            "text": "Ce concept ne se limite pas aux zoonoses, il inclut toutes les questions affectant la sante publique (resistance antimicrobienne et securite alimentaire)."
          }
        ],
        "en": [
          {
            "type": "paragraph",
            "text": "In 2004, a framework to reduce the risk of infectious diseases at the Animal-Human-Ecosystem interface was developed by United Nations agencies and in 2010, FAO, OIE and WHO developed their strategy to meet this new challenge. Located in the Congo Basin region, considered as high potential risk for emergence of pandemics, Cameroon has no other choice but to implement its \"One Health\" national strategy."
          },
          {
            "type": "paragraph",
            "text": "The \"One Health\" concept is a coherent, comprehensive and preventive approach for protection of human health, purposed to strengthen links between animal health, human health and ecosystem health."
          },
          {
            "type": "paragraph",
            "text": "This concept not only limited to zoonoses, includes all issues affecting public health (antimicrobial resistance and food safety)."
          }
        ]
      },
      "image": {
        "src": "/uploads/pages/one-health-strategy-diagram.png",
        "alt": {
          "fr": "Diagramme de la Strategie Nationale One Health",
          "en": "National One Health Strategy Diagram"
        },
        "caption": {
          "fr": "Structure de la Strategie Nationale One Health",
          "en": "National One Health Strategy Structure"
        }
      }
    },
    {
      "id": "zoonoses-program",
      "type": "text-image",
      "layout": "text-left-image-right",
      "title": {
        "fr": "PROGRAMME ZOONOSES",
        "en": "ZOONOSES PROGRAM"
      },
      "content": {
        "fr": [
          {
            "type": "paragraph",
            "text": "Le Programme National de Prevention et de Lutte contre les Zoonoses Emergentes et Re-emergentes (Programme Zoonoses) a ete cree par l'arrete administratif No. 28/CAB/PM du 14 avril 2014, portant creation, organisation et fonctionnement du Programme National de Prevention et de Lutte contre les Zoonoses Emergentes et Re-emergentes par le Premier Ministre, Chef du Gouvernement est mandater pour assurer la promotion et l'appropriation du concept \"one health\" a travers une approche \"multisectorielle\" et \"multi-acteurs\" au Cameroun; parmi d'autres responsabilites."
          },
          {
            "type": "paragraph",
            "text": "Au niveau institutionnel, le Programme est organise autour de trois organes statutaires:"
          },
          {
            "type": "list",
            "style": "bullet",
            "items": [
              "le Comite de Pilotage;",
              "le Comite Technique;",
              "le Secretariat Permanent."
            ]
          }
        ],
        "en": [
          {
            "type": "paragraph",
            "text": "The National Program for the Prevention and Fight against Emerging and Re-emerging Zoonoses (Zoonoses Program) was created by administrative Order No. 28/CAB/PM of 14 April 2014, creating, organising and functioning of the National Program for the Prevention and Fight against Emerging and Re-emerging Zoonoses by the Prime Minister, Head of Government is mandated to ensure the promotion and appropriation of the \"one health\" concept through a \"multisectoral\" and \"multi-actor\" approach in Cameroon; amongst other responsibilities."
          },
          {
            "type": "paragraph",
            "text": "At the institutional level, the Program is organised around three statutory organs:"
          },
          {
            "type": "list",
            "style": "bullet",
            "items": [
              "the Steering committee;",
              "the Technical Committee;",
              "the Permanent Secretariat."
            ]
          }
        ]
      },
      "image": {
        "src": "/uploads/pages/zoonoses-program-logo.png",
        "alt": {
          "fr": "Logo du Programme Zoonoses",
          "en": "Zoonoses Program Logo"
        },
        "caption": {
          "fr": "Programme Zoonoses - Programme National",
          "en": "Zoonoses Program - National Program"
        }
      }
    }
  ],
  "settings": {
    "showTableOfContents": false,
    "headerStyle": "default",
    "spacing": "normal"
  }
};

async function fixPresentationPage() {
  try {
    const sectionsJson = JSON.stringify(sectionsData);

    const [result] = await db.query(`
      UPDATE pages
      SET sections = ?,
          meta_title = 'Presentation - One Health Cameroun',
          meta_description = 'Presentation du concept One Health et du Programme Zoonoses au Cameroun'
      WHERE slug = 'presentation'
    `, [sectionsJson]);

    if (result.affectedRows > 0) {
      console.log('Page Presentation mise a jour avec succes!');
    } else {
      console.log('Page Presentation non trouvee, creation...');
      await db.query(`
        INSERT INTO pages (title, slug, content, sections, template, status, meta_title, meta_description, show_title, show_breadcrumb, author_id)
        VALUES ('Presentation', 'presentation', '', ?, 'default', 'published', 'Presentation - One Health Cameroun', 'Presentation du concept One Health et du Programme Zoonoses au Cameroun', 1, 1, 1)
      `, [sectionsJson]);
      console.log('Page Presentation creee avec succes!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

fixPresentationPage();
