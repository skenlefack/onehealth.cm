const db = require('./config/db');

const sectionsData = {
  "sections": [
    {
      "id": "one-health-approach",
      "type": "text-image",
      "layout": "text-left-image-right",
      "title": {
        "fr": "COLLABORATION ET COMMUNICATION INTERDISCIPLINAIRES ET MULTISECTORIELLES",
        "en": "INTERDISCIPLINARY AND MULTISECTORAL COLLABORATION AND COMMUNICATION"
      },
      "content": {
        "fr": [
          {
            "type": "paragraph",
            "text": "Entre 2002 et 2010, le systeme de sante mondial a ete confronte a l'emergence du Syndrome Respiratoire Aigu Severe (SRAS), de la grippe aviaire hautement pathogene H5N1 et de la grippe pandemique A H1N1. L'epidemiologie de ces maladies et leur impact sur la sante publique, social et economique ainsi que les consequences sur la securite alimentaire causees par ces maladies ont ravive l'urgence de combiner les efforts mondiaux pour prevenir et controler les maladies."
          },
          {
            "type": "paragraph",
            "text": "Les parties prenantes des chaines de sante nationales et mondiales ont observe que la mobilisation des efforts pour prevenir et controler ces maladies, de maniere durable, devrait etre menee en utilisant une approche globale visant a renforcer la collaboration et la communication interdisciplinaires et multisectorielles sur tous les aspects de la sante animale, de la sante humaine et de la sante environnementale : c'est l'approche \"One Health\"."
          }
        ],
        "en": [
          {
            "type": "paragraph",
            "text": "Between 2002 and 2010, the global health system was challenged with the emergence of Severe Acute Respiratory Syndrome (SARS), the H5N1 highly pathogenic influenza and the pandemic influenza A H1N1. The epidemiology of these diseases and their impact on public health, social and economic as well as the food security consequences caused by these diseases have revived the emergency to combine global efforts to prevent and control the diseases."
          },
          {
            "type": "paragraph",
            "text": "Stakeholders of the national and global health chains have observed that mobilization of efforts to prevent and control these diseases, in a sustainable way should be carried out using a comprehensive approach aiming enhancing interdisciplinary and multisector collaboration and communication on all aspects of animal health, human health and environmental health: this is the \"One Health\" approach."
          }
        ]
      },
      "image": {
        "src": "/uploads/pages/one-health-approach-diagram.png",
        "alt": {
          "fr": "Diagramme de l'approche One Health",
          "en": "One Health Approach Diagram"
        },
        "caption": {
          "fr": "L'approche One Health : Coordination, Communication et Collaboration",
          "en": "The One Health Approach: Coordinating, Communicating and Collaborating"
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

async function createPage() {
  try {
    const sectionsJson = JSON.stringify(sectionsData);

    // Check if page exists
    const [existing] = await db.query('SELECT id FROM pages WHERE slug = ?', ['one-health-approach']);

    if (existing.length > 0) {
      // Update existing page
      await db.query(`
        UPDATE pages
        SET sections = ?,
            title = 'Approche One Health',
            meta_title = 'Approche One Health - One Health Cameroun',
            meta_description = 'L approche One Health pour la collaboration interdisciplinaire et multisectorielle',
            show_title = 1,
            show_breadcrumb = 1,
            status = 'published'
        WHERE slug = 'one-health-approach'
      `, [sectionsJson]);
      console.log('Page "One Health Approach" mise a jour avec succes!');
    } else {
      // Create new page
      await db.query(`
        INSERT INTO pages (title, slug, content, sections, template, status, meta_title, meta_description, show_title, show_breadcrumb, author_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Approche One Health',
        'one-health-approach',
        '',
        sectionsJson,
        'default',
        'published',
        'Approche One Health - One Health Cameroun',
        'L approche One Health pour la collaboration interdisciplinaire et multisectorielle',
        1,
        1,
        2
      ]);
      console.log('Page "One Health Approach" creee avec succes!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

createPage();
