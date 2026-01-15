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
  console.log('=== Test du Module Pages ===\n');

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
      console.log('   ✅ Token obtenu');
    } else {
      console.log('   ❌ Echec authentification');
      return;
    }
  } catch (e) {
    console.log('   ❌ Erreur:', e.message);
    return;
  }

  // 2. Liste des pages existantes
  console.log('\n2. Liste des pages existantes...');
  try {
    const listRes = await request('GET', '/api/pages', null, token);
    console.log('   Status:', listRes.status);
    if (listRes.data.success) {
      console.log('   ✅ Pages trouvees:', listRes.data.data.length);
      listRes.data.data.forEach(p => {
        const sections = p.sections ? JSON.parse(p.sections).length : 0;
        console.log(`      - ${p.title} (/${p.slug}) [${p.status}] - ${sections} blocs`);
      });
    }
  } catch (e) {
    console.log('   ❌ Erreur:', e.message);
  }

  // 3. Créer une page de test avec blocs
  console.log('\n3. Creation d\'une page de test avec blocs...');
  try {
    const testSections = [
      {
        id: Date.now(),
        type: 'hero',
        content: {
          title_fr: 'Bienvenue sur One Health',
          title_en: 'Welcome to One Health',
          subtitle_fr: 'Une seule sante pour tous',
          subtitle_en: 'One health for all',
          buttonText_fr: 'Decouvrir',
          buttonText_en: 'Discover',
          buttonUrl: '#about',
          bgColor: '#007A33',
          textColor: '#ffffff',
          height: '500',
          overlay: true
        }
      },
      {
        id: Date.now() + 1,
        type: 'features',
        content: {
          title_fr: 'Nos Piliers',
          title_en: 'Our Pillars',
          columns: 3,
          items: [
            { icon: '🏥', title_fr: 'Sante Humaine', title_en: 'Human Health', desc_fr: 'Protection de la sante publique', desc_en: 'Public health protection' },
            { icon: '🐾', title_fr: 'Sante Animale', title_en: 'Animal Health', desc_fr: 'Bien-etre des animaux', desc_en: 'Animal welfare' },
            { icon: '🌍', title_fr: 'Environnement', title_en: 'Environment', desc_fr: 'Protection de l\'ecosysteme', desc_en: 'Ecosystem protection' }
          ]
        }
      },
      {
        id: Date.now() + 2,
        type: 'cta',
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
      }
    ];

    const createRes = await request('POST', '/api/pages', {
      title: 'Page Test One Health',
      slug: 'page-test-' + Date.now(),
      status: 'draft',
      template: 'landing',
      meta_title: 'Page Test | One Health Cameroon',
      meta_description: 'Ceci est une page de test creee automatiquement',
      sections: JSON.stringify(testSections)
    }, token);

    console.log('   Status:', createRes.status);
    if (createRes.data.success) {
      testPageId = createRes.data.data.id;
      console.log('   ✅ Page creee avec ID:', testPageId);
      console.log('   ✅ Sections:', testSections.length, 'blocs (hero, features, cta)');
    } else {
      console.log('   ❌ Erreur:', createRes.data.message);
    }
  } catch (e) {
    console.log('   ❌ Erreur:', e.message);
  }

  if (!testPageId) {
    console.log('\n❌ Impossible de continuer sans page de test');
    return;
  }

  // 4. Récupérer la page créée
  console.log('\n4. Recuperation de la page creee...');
  try {
    const getRes = await request('GET', `/api/pages/${testPageId}`, null, token);
    if (getRes.data.success) {
      const page = getRes.data.data;
      console.log('   ✅ Page:', page.title);
      console.log('   ✅ Template:', page.template);
      console.log('   ✅ Status:', page.status);
      const sections = JSON.parse(page.sections || '[]');
      console.log('   ✅ Blocs:');
      sections.forEach((s, i) => {
        console.log(`      ${i + 1}. ${s.type} - ${s.content?.title_fr || s.content?.content_fr?.substring(0, 20) || 'N/A'}`);
      });
    } else {
      console.log('   ❌ Erreur:', getRes.data.message);
    }
  } catch (e) {
    console.log('   ❌ Erreur:', e.message);
  }

  // 5. Mettre à jour la page
  console.log('\n5. Mise a jour de la page...');
  try {
    const updateRes = await request('PUT', `/api/pages/${testPageId}`, {
      title: 'Page Test One Health (Modifiee)',
      slug: 'page-test-modifiee',
      status: 'published',
      template: 'landing',
      meta_title: 'Page Test Modifiee | One Health',
      meta_description: 'Page mise a jour avec succes',
      sections: JSON.stringify([
        {
          id: Date.now(),
          type: 'hero',
          content: {
            title_fr: 'Titre Modifie',
            title_en: 'Modified Title',
            subtitle_fr: 'Sous-titre modifie',
            subtitle_en: 'Modified subtitle',
            bgColor: '#1a1a2e',
            textColor: '#ffffff',
            height: '400'
          }
        },
        {
          id: Date.now() + 1,
          type: 'text',
          content: {
            content_fr: '<h2>Section Texte</h2><p>Contenu mis a jour avec succes.</p>',
            content_en: '<h2>Text Section</h2><p>Content updated successfully.</p>',
            textAlign: 'center',
            padding: '60'
          }
        }
      ])
    }, token);

    if (updateRes.data.success) {
      console.log('   ✅ Page mise a jour');
      console.log('   ✅ Nouveau titre:', updateRes.data.data.title);
      console.log('   ✅ Nouveau status:', updateRes.data.data.status);
    } else {
      console.log('   ❌ Erreur:', updateRes.data.message);
    }
  } catch (e) {
    console.log('   ❌ Erreur:', e.message);
  }

  // 6. Dupliquer la page
  console.log('\n6. Duplication de la page...');
  let duplicatedPageId = null;
  try {
    const dupRes = await request('PUT', `/api/pages/${testPageId}/duplicate`, {}, token);
    if (dupRes.data.success) {
      duplicatedPageId = dupRes.data.data.id;
      console.log('   ✅ Page dupliquee avec ID:', duplicatedPageId);
      console.log('   ✅ Titre:', dupRes.data.data.title);
    } else {
      console.log('   ❌ Erreur:', dupRes.data.message);
    }
  } catch (e) {
    console.log('   ❌ Erreur:', e.message);
  }

  // 7. Récupérer page par slug (public)
  console.log('\n7. Recuperation page par slug (public)...');
  try {
    const slugRes = await request('GET', '/api/pages/slug/page-test-modifiee');
    if (slugRes.data.success) {
      console.log('   ✅ Page trouvee:', slugRes.data.data.title);
    } else {
      console.log('   ⚠️ Page non trouvee (normal si non publiee)');
    }
  } catch (e) {
    console.log('   ❌ Erreur:', e.message);
  }

  // 8. Supprimer les pages de test
  console.log('\n8. Suppression des pages de test...');
  try {
    const delRes = await request('DELETE', `/api/pages/${testPageId}`, null, token);
    if (delRes.data.success) {
      console.log('   ✅ Page originale supprimee');
    }
    if (duplicatedPageId) {
      const delDupRes = await request('DELETE', `/api/pages/${duplicatedPageId}`, null, token);
      if (delDupRes.data.success) {
        console.log('   ✅ Page dupliquee supprimee');
      }
    }
  } catch (e) {
    console.log('   ❌ Erreur:', e.message);
  }

  // 9. Vérification finale
  console.log('\n9. Verification finale...');
  try {
    const finalRes = await request('GET', '/api/pages', null, token);
    if (finalRes.data.success) {
      console.log('   ✅ Pages restantes:', finalRes.data.data.length);
    }
  } catch (e) {
    console.log('   ❌ Erreur:', e.message);
  }

  console.log('\n=== Tests termines ===');
}

runTests().catch(console.error);
