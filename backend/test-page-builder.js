const http = require('http');

const API_BASE = 'http://localhost:5000';

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('=== Test Page Builder - Toutes les Sections ===\n');

  let token = null;
  let testPageId = null;

  // 1. Authentification
  console.log('1. Authentification...');
  try {
    const authRes = await request('POST', '/api/auth/login', {
      email: 'admin@onehealth.cm',
      password: 'admin123'
    });
    if (authRes.data.success && authRes.data.data?.token) {
      token = authRes.data.data.token;
      console.log('   OK Token obtenu');
    } else {
      console.log('   ERREUR Echec authentification');
      return;
    }
  } catch (e) {
    console.log('   ERREUR:', e.message);
    return;
  }

  // 2. Créer une page avec TOUTES les sections disponibles
  console.log('\n2. Creation d\'une page avec TOUS les types de sections...');
  try {
    const allSections = [
      {
        id: Date.now(),
        type: 'hero',
        name: 'Banniere principale',
        hidden: false,
        layout: 'full',
        spacing: { top: '0', bottom: '0' },
        content: {
          title_fr: 'One Health Cameroon',
          title_en: 'One Health Cameroon',
          subtitle_fr: 'Une seule sante pour tous',
          subtitle_en: 'One health for all',
          buttonText_fr: 'Decouvrir',
          buttonText_en: 'Discover',
          buttonUrl: '#about',
          bgColor: '#007A33',
          textColor: '#ffffff',
          height: '500',
          overlay: true,
          overlayOpacity: 50
        }
      },
      {
        id: Date.now() + 1,
        type: 'text',
        name: 'Introduction',
        hidden: false,
        layout: 'contained',
        spacing: { top: '20', bottom: '20' },
        content: {
          content_fr: '<h2>Bienvenue</h2><p>Contenu textuel de presentation.</p>',
          content_en: '<h2>Welcome</h2><p>Text content for presentation.</p>',
          bgColor: 'transparent',
          textAlign: 'center',
          padding: '40'
        }
      },
      {
        id: Date.now() + 2,
        type: 'image',
        name: 'Image principale',
        hidden: false,
        layout: 'contained',
        spacing: { top: '0', bottom: '20' },
        content: {
          src: 'https://via.placeholder.com/800x400',
          alt_fr: 'Image de demonstration',
          alt_en: 'Demo image',
          caption_fr: 'Legende de l\'image',
          caption_en: 'Image caption',
          width: '80',
          borderRadius: '12',
          alignment: 'center'
        }
      },
      {
        id: Date.now() + 3,
        type: 'features',
        name: 'Nos Piliers',
        hidden: false,
        layout: 'full',
        spacing: { top: '40', bottom: '40' },
        content: {
          title_fr: 'Nos 4 Piliers',
          title_en: 'Our 4 Pillars',
          columns: 3,
          items: [
            { icon: '🏥', title_fr: 'Sante Humaine', title_en: 'Human Health', desc_fr: 'Protection de la sante publique', desc_en: 'Public health protection' },
            { icon: '🐾', title_fr: 'Sante Animale', title_en: 'Animal Health', desc_fr: 'Bien-etre des animaux', desc_en: 'Animal welfare' },
            { icon: '🌍', title_fr: 'Environnement', title_en: 'Environment', desc_fr: 'Protection ecosysteme', desc_en: 'Ecosystem protection' }
          ]
        }
      },
      {
        id: Date.now() + 4,
        type: 'columns',
        name: 'Section 2 colonnes',
        hidden: false,
        layout: 'contained',
        spacing: { top: '0', bottom: '20' },
        content: {
          columns: 2,
          gap: '24',
          content: [
            { title_fr: 'Mission', title_en: 'Mission', text_fr: 'Notre mission est...', text_en: 'Our mission is...' },
            { title_fr: 'Vision', title_en: 'Vision', text_fr: 'Notre vision est...', text_en: 'Our vision is...' }
          ]
        }
      },
      {
        id: Date.now() + 5,
        type: 'video',
        name: 'Video presentation',
        hidden: false,
        layout: 'contained',
        spacing: { top: '20', bottom: '20' },
        content: {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          type: 'youtube',
          autoplay: false,
          title_fr: 'Video de presentation',
          title_en: 'Presentation video'
        }
      },
      {
        id: Date.now() + 6,
        type: 'gallery',
        name: 'Galerie photos',
        hidden: false,
        layout: 'full',
        spacing: { top: '20', bottom: '20' },
        content: {
          images: [
            { src: 'https://via.placeholder.com/400x400/007A33/fff', alt_fr: 'Image 1', alt_en: 'Image 1' },
            { src: 'https://via.placeholder.com/400x400/CE1126/fff', alt_fr: 'Image 2', alt_en: 'Image 2' },
            { src: 'https://via.placeholder.com/400x400/FCD116/000', alt_fr: 'Image 3', alt_en: 'Image 3' }
          ],
          columns: 3,
          gap: '16',
          lightbox: true
        }
      },
      {
        id: Date.now() + 7,
        type: 'testimonials',
        name: 'Temoignages',
        hidden: false,
        layout: 'full',
        spacing: { top: '40', bottom: '40' },
        content: {
          title_fr: 'Ce qu\'ils disent',
          title_en: 'What they say',
          items: [
            { name: 'Dr. Jean Dupont', role_fr: 'Medecin', role_en: 'Doctor', text_fr: 'Excellent programme!', text_en: 'Excellent program!', avatar: '' },
            { name: 'Marie Mbarga', role_fr: 'Veterinaire', role_en: 'Veterinarian', text_fr: 'Initiative remarquable.', text_en: 'Remarkable initiative.', avatar: '' }
          ]
        }
      },
      {
        id: Date.now() + 8,
        type: 'cta',
        name: 'Appel a l\'action',
        hidden: false,
        layout: 'full',
        spacing: { top: '0', bottom: '0' },
        content: {
          title_fr: 'Rejoignez le mouvement',
          title_en: 'Join the movement',
          description_fr: 'Ensemble pour une seule sante',
          description_en: 'Together for one health',
          buttonText_fr: 'Contactez-nous',
          buttonText_en: 'Contact us',
          buttonUrl: '/contact',
          bgColor: '#CE1126',
          textColor: '#ffffff'
        }
      },
      {
        id: Date.now() + 9,
        type: 'contact',
        name: 'Formulaire contact',
        hidden: false,
        layout: 'contained',
        spacing: { top: '40', bottom: '40' },
        content: {
          title_fr: 'Contactez-nous',
          title_en: 'Contact Us',
          description_fr: 'Remplissez le formulaire ci-dessous',
          description_en: 'Fill out the form below',
          fields: ['name', 'email', 'phone', 'subject', 'message'],
          submitText_fr: 'Envoyer le message',
          submitText_en: 'Send message',
          buttonColor: '#007A33',
          recipientEmail: 'contact@onehealth.cm'
        }
      },
      {
        id: Date.now() + 10,
        type: 'spacer',
        name: 'Espacement',
        hidden: false,
        layout: 'full',
        spacing: { top: '0', bottom: '0' },
        content: { height: '60' }
      },
      {
        id: Date.now() + 11,
        type: 'divider',
        name: 'Separateur',
        hidden: false,
        layout: 'contained',
        spacing: { top: '0', bottom: '0' },
        content: { style: 'dashed', color: '#e2e8f0', width: '80' }
      }
    ];

    const createRes = await request('POST', '/api/pages', {
      title: 'Page Test Complète - Toutes Sections',
      slug: 'page-test-complete-' + Date.now(),
      status: 'draft',
      template: 'landing',
      meta_title: 'Page Test Complete | One Health',
      meta_description: 'Page de test avec toutes les sections disponibles',
      sections: JSON.stringify(allSections)
    }, token);

    console.log('   Status:', createRes.status);
    if (createRes.data.success) {
      testPageId = createRes.data.data.id;
      console.log('   OK Page creee avec ID:', testPageId);
      console.log('   OK Sections creees:', allSections.length, 'sections');
      console.log('   Types inclus:');
      allSections.forEach((s, i) => {
        console.log(`      ${i + 1}. ${s.type} - "${s.name}"`);
      });
    } else {
      console.log('   ERREUR:', createRes.data.message);
      return;
    }
  } catch (e) {
    console.log('   ERREUR:', e.message);
    return;
  }

  // 3. Récupérer et vérifier la page créée
  console.log('\n3. Verification de la page creee...');
  try {
    const getRes = await request('GET', `/api/pages/${testPageId}`, null, token);
    if (getRes.data.success) {
      const page = getRes.data.data;
      console.log('   OK Page:', page.title);
      const sections = JSON.parse(page.sections || '[]');
      console.log('   OK Nombre de sections:', sections.length);

      // Vérifier chaque type
      const types = ['hero', 'text', 'image', 'features', 'columns', 'video', 'gallery', 'testimonials', 'cta', 'contact', 'spacer', 'divider'];
      console.log('\n   Verification des types:');
      types.forEach(type => {
        const found = sections.find(s => s.type === type);
        if (found) {
          console.log(`      OK ${type}: present (name: "${found.name}", hidden: ${found.hidden})`);
        } else {
          console.log(`      MANQUE ${type}: non trouve!`);
        }
      });
    } else {
      console.log('   ERREUR:', getRes.data.message);
    }
  } catch (e) {
    console.log('   ERREUR:', e.message);
  }

  // 4. Tester la mise à jour avec section masquée
  console.log('\n4. Test mise a jour avec section masquee...');
  try {
    const getRes = await request('GET', `/api/pages/${testPageId}`, null, token);
    if (getRes.data.success) {
      const page = getRes.data.data;
      const sections = JSON.parse(page.sections || '[]');

      // Masquer la section gallery
      const updatedSections = sections.map(s =>
        s.type === 'gallery' ? { ...s, hidden: true, name: 'Galerie (masquée)' } : s
      );

      const updateRes = await request('PUT', `/api/pages/${testPageId}`, {
        ...page,
        sections: JSON.stringify(updatedSections)
      }, token);

      if (updateRes.data.success) {
        console.log('   OK Section gallery masquee avec succes');
      } else {
        console.log('   ERREUR:', updateRes.data.message);
      }
    }
  } catch (e) {
    console.log('   ERREUR:', e.message);
  }

  // 5. Supprimer la page de test
  console.log('\n5. Suppression de la page de test...');
  try {
    const delRes = await request('DELETE', `/api/pages/${testPageId}`, null, token);
    if (delRes.data.success) {
      console.log('   OK Page supprimee');
    } else {
      console.log('   ERREUR:', delRes.data.message);
    }
  } catch (e) {
    console.log('   ERREUR:', e.message);
  }

  console.log('\n=== Tests termines ===');
  console.log('\nResume:');
  console.log('- 12 types de sections testes');
  console.log('- Nouvelles proprietes: name, hidden, layout, spacing');
  console.log('- Editeurs: hero, text, image, video, columns, features, cta, gallery, testimonials, contact, spacer, divider');
}

runTests().catch(console.error);
