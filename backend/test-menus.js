const http = require('http');

const API_BASE = 'http://localhost:5000';

// Helper function for HTTP requests
function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

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

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== Test des Menus API ===\n');

  let token = null;
  let testMenuId = null;
  let testItemId = null;

  // 1. Authentication
  console.log('1. Authentification...');
  try {
    const authRes = await request('POST', '/api/auth/login', {
      email: 'admin@onehealth.cm',
      password: 'admin123'
    });

    if (authRes.data.success && authRes.data.data && authRes.data.data.token) {
      token = authRes.data.data.token;
      console.log('   OK - Token obtenu');
    } else {
      console.log('   ERREUR - Authentification echouee:', authRes.data);
      return;
    }
  } catch (e) {
    console.log('   ERREUR:', e.message);
    return;
  }

  // 2. List existing menus
  console.log('\n2. Liste des menus existants...');
  try {
    const listRes = await request('GET', '/api/menus', null, token);
    console.log('   Status:', listRes.status);
    if (listRes.data.success) {
      console.log('   Menus trouves:', listRes.data.data.length);
      listRes.data.data.forEach(m => {
        console.log(`   - ${m.name} (${m.location}) - ${m.item_count || 0} elements`);
      });
    } else {
      console.log('   Reponse:', listRes.data);
    }
  } catch (e) {
    console.log('   ERREUR:', e.message);
  }

  // 3. Create test menu
  console.log('\n3. Creation d\'un menu de test...');
  try {
    const createRes = await request('POST', '/api/menus', {
      name: 'Menu Test API',
      location: 'header',
      description: 'Menu cree par test automatise'
    }, token);

    console.log('   Status:', createRes.status);
    if (createRes.data.success) {
      testMenuId = createRes.data.data.id;
      console.log('   OK - Menu cree avec ID:', testMenuId);
    } else {
      console.log('   ERREUR:', createRes.data);
    }
  } catch (e) {
    console.log('   ERREUR:', e.message);
  }

  if (!testMenuId) {
    console.log('\nImpossible de continuer sans menu de test');
    return;
  }

  // 4. Add menu items
  console.log('\n4. Ajout d\'elements au menu...');

  // 4a. Add home link
  try {
    const itemRes = await request('POST', `/api/menus/${testMenuId}/items`, {
      label: 'Accueil',
      label_en: 'Home',
      url: '/',
      type: 'home',
      position: 0
    }, token);

    if (itemRes.data.success) {
      console.log('   OK - Element "Accueil" ajoute');
      testItemId = itemRes.data.data.id;
    } else {
      console.log('   ERREUR ajout Accueil:', itemRes.data);
    }
  } catch (e) {
    console.log('   ERREUR:', e.message);
  }

  // 4b. Add custom link
  try {
    const itemRes = await request('POST', `/api/menus/${testMenuId}/items`, {
      label: 'Contact',
      label_en: 'Contact Us',
      url: '/contact',
      type: 'custom',
      position: 1
    }, token);

    if (itemRes.data.success) {
      console.log('   OK - Element "Contact" ajoute');
    } else {
      console.log('   ERREUR ajout Contact:', itemRes.data);
    }
  } catch (e) {
    console.log('   ERREUR:', e.message);
  }

  // 5. List menu items
  console.log('\n5. Liste des elements du menu...');
  try {
    const itemsRes = await request('GET', `/api/menus/${testMenuId}/items`, null, token);
    console.log('   Status:', itemsRes.status);
    if (itemsRes.data.success) {
      console.log('   Elements trouves:', itemsRes.data.data.length);
      itemsRes.data.data.forEach(item => {
        console.log(`   - ${item.label} (${item.type}) -> ${item.url}`);
      });
    } else {
      console.log('   Reponse:', itemsRes.data);
    }
  } catch (e) {
    console.log('   ERREUR:', e.message);
  }

  // 6. Update menu item
  if (testItemId) {
    console.log('\n6. Modification d\'un element...');
    try {
      const updateRes = await request('PUT', `/api/menus/items/${testItemId}`, {
        label: 'Page Accueil',
        icon: 'home',
        type: 'home',
        url: '/'
      }, token);

      if (updateRes.data.success) {
        console.log('   OK - Element modifie');
      } else {
        console.log('   ERREUR:', updateRes.data);
      }
    } catch (e) {
      console.log('   ERREUR:', e.message);
    }
  }

  // 7. Get single menu
  console.log('\n7. Recuperation du menu par ID...');
  try {
    const menuRes = await request('GET', `/api/menus/${testMenuId}`, null, token);
    if (menuRes.data.success) {
      console.log('   OK - Menu:', menuRes.data.data.name);
    } else {
      console.log('   ERREUR:', menuRes.data);
    }
  } catch (e) {
    console.log('   ERREUR:', e.message);
  }

  // 8. Get menu by location
  console.log('\n8. Recuperation du menu par location (header)...');
  try {
    const locRes = await request('GET', '/api/menus/location/header', null, token);
    if (locRes.data.success) {
      console.log('   OK - Menu trouve:', locRes.data.data?.name || 'N/A');
    } else {
      console.log('   Reponse:', locRes.data);
    }
  } catch (e) {
    console.log('   ERREUR:', e.message);
  }

  // 9. Delete test menu
  console.log('\n9. Suppression du menu de test...');
  try {
    const deleteRes = await request('DELETE', `/api/menus/${testMenuId}`, null, token);
    if (deleteRes.data.success) {
      console.log('   OK - Menu supprime');
    } else {
      console.log('   ERREUR:', deleteRes.data);
    }
  } catch (e) {
    console.log('   ERREUR:', e.message);
  }

  // 10. Verify deletion
  console.log('\n10. Verification de la suppression...');
  try {
    const verifyRes = await request('GET', `/api/menus/${testMenuId}`, null, token);
    if (verifyRes.status === 404 || !verifyRes.data.success) {
      console.log('   OK - Menu bien supprime');
    } else {
      console.log('   ATTENTION - Menu encore present');
    }
  } catch (e) {
    console.log('   OK - Menu bien supprime (erreur attendue)');
  }

  console.log('\n=== Tests termines ===');
}

runTests().catch(console.error);
