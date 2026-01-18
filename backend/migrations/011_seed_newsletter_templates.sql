-- ============================================
-- NEWSLETTER TEMPLATES SEED
-- Modern professional email templates
-- ============================================

-- Update category ENUM to include more types
ALTER TABLE newsletter_templates
MODIFY COLUMN category ENUM('newsletter', 'welcome', 'notification', 'custom', 'actualites', 'digest', 'sante', 'evenement', 'formation', 'alerte', 'rapport') DEFAULT 'newsletter';

-- Add layout column for template structure (ignore error if already exists)
ALTER TABLE newsletter_templates
ADD COLUMN layout ENUM('image-top', 'image-left', 'image-right', 'cards-grid', 'minimal', 'hero-banner', 'sidebar', 'zigzag') DEFAULT 'image-top';

ALTER TABLE newsletter_templates
ADD COLUMN preview_gradient VARCHAR(255);

-- Template 1: Actualites Modernes (Image Top)
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Actualites Modernes', 'actualites-modernes', 'actualites', 'image-top', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, Geneva, sans-serif; background: #f0f4f8; color: #1e293b; line-height: 1.6; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 40px 30px; text-align: center; }
    .header img { height: 60px; margin-bottom: 15px; }
    .header h1 { color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 8px; }
    .content { padding: 40px 30px; }
    .intro { font-size: 16px; color: #475569; margin-bottom: 30px; padding-bottom: 25px; border-bottom: 2px solid #e2e8f0; }
    .article { margin-bottom: 35px; }
    .article-image { width: 100%; height: 220px; object-fit: cover; border-radius: 12px; margin-bottom: 18px; }
    .article-category { display: inline-block; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 600; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; }
    .article h2 { font-size: 20px; color: #1e293b; margin-bottom: 10px; font-weight: 700; }
    .article p { color: #64748b; font-size: 15px; margin-bottom: 15px; }
    .article a { display: inline-flex; align-items: center; color: #059669; font-weight: 600; text-decoration: none; font-size: 14px; }
    .article a:hover { text-decoration: underline; }
    .divider { height: 1px; background: #e2e8f0; margin: 30px 0; }
    .cta-section { text-align: center; padding: 35px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%); margin: 30px 0; border-radius: 16px; }
    .cta-section h3 { color: #1e293b; font-size: 18px; margin-bottom: 8px; }
    .cta-section p { color: #64748b; font-size: 14px; margin-bottom: 20px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; }
    .footer { background: #1e293b; color: #94a3b8; padding: 35px 30px; text-align: center; }
    .footer p { font-size: 13px; margin-bottom: 12px; }
    .footer a { color: #10b981; text-decoration: none; }
    .social-links { margin: 20px 0; }
    .social-links a { display: inline-block; margin: 0 8px; }
    .unsubscribe { font-size: 11px; color: #64748b; margin-top: 20px; }
    .unsubscribe a { color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health Cameroon">
      <h1>One Health Cameroon</h1>
      <p>Actualites et informations</p>
    </div>
    <div class="content">
      <p class="intro">Bonjour {{first_name}}, voici les dernieres actualites de One Health Cameroon.</p>
      {{articles}}
      {{custom_content}}
      <div class="cta-section">
        <h3>Restez informes</h3>
        <p>Visitez notre site pour plus d''actualites et de ressources.</p>
        <a href="{{site_url}}" class="cta-button">Visiter le site</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; {{year}} One Health Cameroon. Tous droits reserves.</p>
      <p class="unsubscribe">Vous recevez cet email car vous etes abonne a notre newsletter.<br><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health Cameroon">
      <h1>One Health Cameroon</h1>
      <p>News and updates</p>
    </div>
    <div class="content">
      <p class="intro">Hello {{first_name}}, here are the latest news from One Health Cameroon.</p>
      {{articles}}
      {{custom_content}}
    </div>
    <div class="footer">
      <p>&copy; {{year}} One Health Cameroon. All rights reserved.</p>
      <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>', 1);

-- Template 2: Digest Classique (Image Left)
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Digest Classique', 'digest-classique', 'digest', 'image-left', 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #f8fafc; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: #065f46; padding: 30px; }
    .header-inner { display: flex; align-items: center; gap: 15px; }
    .header img { height: 50px; }
    .header h1 { color: #fff; font-size: 22px; }
    .content { padding: 30px; }
    .article-row { display: flex; gap: 20px; margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #e2e8f0; }
    .article-row:last-child { border-bottom: none; }
    .article-image { width: 140px; height: 100px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
    .article-content { flex: 1; }
    .article-content h3 { font-size: 16px; color: #1e293b; margin-bottom: 8px; }
    .article-content p { font-size: 13px; color: #64748b; margin-bottom: 10px; }
    .article-content a { color: #059669; font-size: 13px; font-weight: 600; text-decoration: none; }
    .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #10b981; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-inner">
        <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
        <h1>Digest Hebdomadaire</h1>
      </div>
    </div>
    <div class="content">
      <p style="color:#475569;margin-bottom:25px;">Bonjour {{first_name}}, voici votre resume de la semaine.</p>
      {{articles_horizontal}}
      {{custom_content}}
    </div>
    <div class="footer">
      <p>&copy; {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>{{articles}}</body></html>', 1);

-- Template 3: Bulletin Sante (Hero Banner)
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Bulletin Sante', 'bulletin-sante', 'sante', 'hero-banner', 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #fff5f5; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .alert-bar { background: linear-gradient(90deg, #dc2626 0%, #ea580c 100%); color: #fff; padding: 12px; text-align: center; font-size: 13px; font-weight: 600; }
    .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 40px 30px; text-align: center; }
    .header img { height: 60px; margin-bottom: 12px; }
    .header h1 { color: #fff; font-size: 24px; }
    .hero { background: linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%); padding: 30px; text-align: center; }
    .hero h2 { color: #dc2626; font-size: 22px; margin-bottom: 15px; }
    .hero p { color: #78716c; font-size: 15px; }
    .content { padding: 30px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
    .stat-box { background: #f8fafc; padding: 20px; text-align: center; border-radius: 12px; }
    .stat-number { font-size: 28px; font-weight: 700; color: #059669; }
    .stat-label { font-size: 12px; color: #64748b; margin-top: 5px; }
    .article { margin-bottom: 25px; }
    .article h3 { font-size: 18px; color: #1e293b; margin-bottom: 10px; }
    .article p { font-size: 14px; color: #64748b; }
    .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #10b981; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="alert-bar">BULLETIN DE SANTE - {{month}} {{year}}</div>
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
      <h1>Bulletin de Sante</h1>
    </div>
    <div class="hero">
      <h2>{{subject}}</h2>
      <p>Informations et alertes sanitaires importantes</p>
    </div>
    <div class="content">
      {{articles}}
      {{custom_content}}
    </div>
    <div class="footer">
      <p>&copy; {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>{{articles}}</body></html>', 1);

-- Template 4: Invitation Evenement (Cards Grid)
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Invitation Evenement', 'invitation-evenement', 'evenement', 'cards-grid', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #faf5ff; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #c026d3 100%); padding: 50px 30px; text-align: center; }
    .header img { height: 50px; margin-bottom: 20px; }
    .header h1 { color: #fff; font-size: 28px; margin-bottom: 10px; }
    .header p { color: rgba(255,255,255,0.9); font-size: 16px; }
    .event-date { background: #fff; color: #7c3aed; display: inline-block; padding: 15px 30px; border-radius: 12px; margin-top: 20px; }
    .event-date strong { display: block; font-size: 24px; }
    .event-date span { font-size: 13px; color: #64748b; }
    .content { padding: 30px; }
    .info-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px; }
    .info-card { background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; }
    .info-card h4 { font-size: 14px; color: #64748b; margin-bottom: 8px; }
    .info-card p { font-size: 15px; color: #1e293b; font-weight: 600; }
    .cta { text-align: center; margin: 30px 0; }
    .cta a { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #c026d3 100%); color: #fff; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 600; }
    .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #a78bfa; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
      <h1>Vous etes invites!</h1>
      <p>{{subject}}</p>
      <div class="event-date">
        <strong>{{event_date}}</strong>
        <span>{{event_time}}</span>
      </div>
    </div>
    <div class="content">
      <div class="info-cards">
        <div class="info-card">
          <h4>Lieu</h4>
          <p>{{event_location}}</p>
        </div>
        <div class="info-card">
          <h4>Duree</h4>
          <p>{{event_duration}}</p>
        </div>
      </div>
      {{custom_content}}
      <div class="cta">
        <a href="{{registration_url}}">S''inscrire maintenant</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Event invitation</body></html>', 1);

-- Template 5: Resume Hebdomadaire (Zigzag)
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Resume Hebdomadaire', 'resume-hebdomadaire', 'digest', 'zigzag', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #f0f9ff; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%); padding: 35px; text-align: center; }
    .header img { height: 50px; margin-bottom: 12px; }
    .header h1 { color: #fff; font-size: 24px; }
    .header p { color: rgba(255,255,255,0.9); font-size: 14px; margin-top: 8px; }
    .content { padding: 30px; }
    .week-number { background: #e0f2fe; color: #0284c7; display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
    .article-zigzag { display: flex; gap: 20px; margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #e2e8f0; }
    .article-zigzag.reverse { flex-direction: row-reverse; }
    .article-zigzag img { width: 180px; height: 120px; object-fit: cover; border-radius: 10px; flex-shrink: 0; }
    .article-zigzag-content { flex: 1; }
    .article-zigzag-content h3 { font-size: 17px; color: #1e293b; margin-bottom: 8px; }
    .article-zigzag-content p { font-size: 13px; color: #64748b; margin-bottom: 10px; }
    .article-zigzag-content a { color: #0284c7; font-size: 13px; font-weight: 600; text-decoration: none; }
    .footer { background: #0f172a; color: #94a3b8; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #38bdf8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
      <h1>Resume Hebdomadaire</h1>
      <p>Semaine du {{week_start}} au {{week_end}}</p>
    </div>
    <div class="content">
      <span class="week-number">Semaine {{week_number}}</span>
      {{articles_zigzag}}
      {{custom_content}}
    </div>
    <div class="footer">
      <p>&copy; {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Weekly summary</body></html>', 1);

-- Template 6: Annonce Officielle (Minimal)
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Annonce Officielle', 'annonce-officielle', 'newsletter', 'minimal', 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, "Times New Roman", serif; background: #fffbeb; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #fde68a; }
    .header { background: #fff; padding: 40px 30px; text-align: center; border-bottom: 3px solid #f59e0b; }
    .header img { height: 60px; margin-bottom: 15px; }
    .header h1 { color: #78350f; font-size: 26px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; }
    .badge { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #fff; padding: 8px 20px; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-top: 15px; font-family: "Segoe UI", sans-serif; }
    .content { padding: 40px 30px; }
    .content h2 { font-size: 24px; color: #1e293b; margin-bottom: 20px; font-weight: 400; }
    .content p { font-size: 16px; color: #475569; line-height: 1.8; margin-bottom: 20px; }
    .signature { margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0; }
    .signature p { font-size: 14px; color: #64748b; margin-bottom: 5px; }
    .signature strong { color: #1e293b; }
    .footer { background: #78350f; color: #fde68a; padding: 25px; text-align: center; font-size: 12px; font-family: "Segoe UI", sans-serif; }
    .footer a { color: #fcd34d; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
      <h1>Annonce Officielle</h1>
      <span class="badge">Communication</span>
    </div>
    <div class="content">
      <h2>{{subject}}</h2>
      {{custom_content}}
      <div class="signature">
        <p>Cordialement,</p>
        <p><strong>L''equipe One Health Cameroon</strong></p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Official announcement</body></html>', 1);

-- Template 7: Mise a jour Recherche (Image Right)
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Mise a jour Recherche', 'mise-a-jour-recherche', 'newsletter', 'image-right', 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #fdf2f8; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 30px; display: flex; align-items: center; gap: 15px; }
    .header img { height: 50px; }
    .header div h1 { color: #fff; font-size: 20px; }
    .header div p { color: rgba(255,255,255,0.8); font-size: 12px; }
    .content { padding: 30px; }
    .research-item { display: flex; gap: 20px; margin-bottom: 30px; }
    .research-item-content { flex: 1; }
    .research-item-content .tag { display: inline-block; background: #fce7f3; color: #be185d; font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 12px; margin-bottom: 10px; text-transform: uppercase; }
    .research-item-content h3 { font-size: 18px; color: #1e293b; margin-bottom: 10px; }
    .research-item-content p { font-size: 14px; color: #64748b; margin-bottom: 12px; }
    .research-item-content a { color: #be185d; font-size: 13px; font-weight: 600; text-decoration: none; }
    .research-item img { width: 160px; height: 120px; object-fit: cover; border-radius: 10px; flex-shrink: 0; }
    .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #f9a8d4; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
      <div>
        <h1>Recherche & Publications</h1>
        <p>Dernieres mises a jour</p>
      </div>
    </div>
    <div class="content">
      {{articles_image_right}}
      {{custom_content}}
    </div>
    <div class="footer">
      <p>&copy; {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Research update</body></html>', 1);

-- Template 8: Formation & Atelier
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Formation & Atelier', 'formation-atelier', 'formation', 'hero-banner', 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #fefce8; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 30px; text-align: center; }
    .header img { height: 50px; }
    .hero { background: linear-gradient(135deg, #fef3c7 0%, #fce7f3 100%); padding: 40px 30px; text-align: center; }
    .hero-badge { display: inline-block; background: #b45309; color: #fff; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 15px; }
    .hero h1 { font-size: 26px; color: #78350f; margin-bottom: 15px; }
    .hero p { font-size: 15px; color: #92400e; }
    .content { padding: 30px; }
    .program { background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 25px; }
    .program h3 { font-size: 16px; color: #1e293b; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
    .program ul { list-style: none; }
    .program li { padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #475569; display: flex; align-items: center; gap: 10px; }
    .program li:last-child { border-bottom: none; }
    .program li::before { content: ""; width: 8px; height: 8px; background: #059669; border-radius: 50%; }
    .cta { text-align: center; margin: 25px 0; }
    .cta a { display: inline-block; background: linear-gradient(135deg, #b45309 0%, #d97706 100%); color: #fff; padding: 14px 35px; border-radius: 10px; text-decoration: none; font-weight: 600; }
    .footer { background: #78350f; color: #fde68a; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #fcd34d; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
    </div>
    <div class="hero">
      <span class="hero-badge">Formation</span>
      <h1>{{subject}}</h1>
      <p>Rejoignez-nous pour cette formation exclusive</p>
    </div>
    <div class="content">
      <div class="program">
        <h3>Programme</h3>
        {{custom_content}}
      </div>
      <div class="cta">
        <a href="{{registration_url}}">S''inscrire a la formation</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Training invitation</body></html>', 1);

-- Template 9: Focus Partenaire (Sidebar)
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Focus Partenaire', 'focus-partenaire', 'newsletter', 'sidebar', 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #eff6ff; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; }
    .header img { height: 50px; margin-bottom: 10px; }
    .header h1 { color: #fff; font-size: 22px; }
    .content { display: flex; }
    .main { flex: 1; padding: 25px; }
    .sidebar { width: 180px; background: #f0f9ff; padding: 20px; border-left: 1px solid #e0f2fe; }
    .partner-logo { width: 100%; height: 100px; background: #e0f2fe; border-radius: 10px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; color: #3b82f6; font-size: 12px; }
    .main h2 { font-size: 20px; color: #1e293b; margin-bottom: 15px; }
    .main p { font-size: 14px; color: #64748b; margin-bottom: 15px; line-height: 1.7; }
    .sidebar h4 { font-size: 12px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .sidebar ul { list-style: none; }
    .sidebar li { font-size: 13px; color: #475569; padding: 8px 0; border-bottom: 1px solid #dbeafe; }
    .cta { text-align: center; padding: 25px; background: #f0f9ff; }
    .cta a { display: inline-block; background: #3b82f6; color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
    .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #60a5fa; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
      <h1>Focus Partenaire</h1>
    </div>
    <div class="content">
      <div class="main">
        <h2>{{subject}}</h2>
        {{custom_content}}
      </div>
      <div class="sidebar">
        <div class="partner-logo">Logo Partenaire</div>
        <h4>En bref</h4>
        <ul>
          <li>Partenaire depuis 2020</li>
          <li>10+ projets conjoints</li>
          <li>Impact regional</li>
        </ul>
      </div>
    </div>
    <div class="cta">
      <a href="{{site_url}}/partners">Voir tous nos partenaires</a>
    </div>
    <div class="footer">
      <p>&copy; {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Partner spotlight</body></html>', 1);

-- Template 10: Success Story
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Success Story', 'success-story', 'newsletter', 'hero-banner', 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #fff7ed; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 25px; text-align: center; }
    .header img { height: 45px; }
    .hero-image { width: 100%; height: 250px; object-fit: cover; }
    .content { padding: 30px; }
    .content h1 { font-size: 24px; color: #1e293b; margin-bottom: 20px; }
    .quote { background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f59e0b; }
    .quote p { font-size: 18px; color: #78350f; font-style: italic; line-height: 1.6; }
    .quote .author { margin-top: 15px; font-size: 14px; color: #92400e; font-style: normal; font-weight: 600; }
    .impact { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 25px 0; }
    .impact-item { text-align: center; padding: 20px; background: #f8fafc; border-radius: 10px; }
    .impact-item .number { font-size: 28px; font-weight: 700; color: #059669; }
    .impact-item .label { font-size: 12px; color: #64748b; margin-top: 5px; }
    .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #fbbf24; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
    </div>
    <img class="hero-image" src="{{hero_image}}" alt="Success Story">
    <div class="content">
      <h1>{{subject}}</h1>
      {{custom_content}}
      <div class="quote">
        <p>"{{quote_text}}"</p>
        <p class="author">- {{quote_author}}</p>
      </div>
      <div class="impact">
        <div class="impact-item">
          <div class="number">{{impact_1_number}}</div>
          <div class="label">{{impact_1_label}}</div>
        </div>
        <div class="impact-item">
          <div class="number">{{impact_2_number}}</div>
          <div class="label">{{impact_2_label}}</div>
        </div>
        <div class="impact-item">
          <div class="number">{{impact_3_number}}</div>
          <div class="label">{{impact_3_label}}</div>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>&copy; {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Success story</body></html>', 1);

-- Template 11: Bulletin d''Alerte
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Bulletin d''Alerte', 'bulletin-alerte', 'alerte', 'hero-banner', 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
'[ALERTE] {{subject}}', '[ALERT] {{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #fef2f2; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border: 2px solid #fecaca; }
    .alert-banner { background: linear-gradient(90deg, #dc2626 0%, #b91c1c 100%); color: #fff; padding: 15px; text-align: center; }
    .alert-banner h2 { font-size: 18px; text-transform: uppercase; letter-spacing: 2px; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .header { background: #fff; padding: 25px; text-align: center; border-bottom: 1px solid #fecaca; }
    .header img { height: 50px; }
    .content { padding: 30px; }
    .alert-level { display: inline-block; background: #fef2f2; color: #dc2626; padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; margin-bottom: 20px; border: 1px solid #fecaca; }
    .content h1 { font-size: 22px; color: #1e293b; margin-bottom: 20px; }
    .content p { font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 15px; }
    .actions { background: #fef2f2; padding: 25px; border-radius: 12px; margin: 25px 0; }
    .actions h3 { font-size: 16px; color: #dc2626; margin-bottom: 15px; }
    .actions ul { list-style: none; }
    .actions li { padding: 10px 0; font-size: 14px; color: #475569; display: flex; align-items: flex-start; gap: 10px; }
    .actions li::before { content: "!"; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; background: #dc2626; color: #fff; border-radius: 50%; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .cta { text-align: center; margin: 25px 0; }
    .cta a { display: inline-block; background: #dc2626; color: #fff; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { background: #7f1d1d; color: #fecaca; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #fca5a5; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="alert-banner">
      <h2>ALERTE SANITAIRE</h2>
    </div>
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
    </div>
    <div class="content">
      <span class="alert-level">Niveau: {{alert_level}}</span>
      <h1>{{subject}}</h1>
      {{custom_content}}
      <div class="actions">
        <h3>Actions recommandees</h3>
        <ul>
          <li>{{action_1}}</li>
          <li>{{action_2}}</li>
          <li>{{action_3}}</li>
        </ul>
      </div>
      <div class="cta">
        <a href="{{more_info_url}}">Plus d''informations</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; {{year}} One Health Cameroon - Communication urgente</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Alert bulletin</body></html>', 1);

-- Template 12: Rapport Mensuel
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Rapport Mensuel', 'rapport-mensuel', 'rapport', 'cards-grid', 'linear-gradient(135deg, #0250c5 0%, #d43f8d 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #f5f3ff; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 35px; text-align: center; }
    .header img { height: 50px; margin-bottom: 12px; }
    .header h1 { color: #fff; font-size: 24px; }
    .header p { color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 8px; }
    .kpis { display: grid; grid-template-columns: repeat(4, 1fr); background: #f8fafc; }
    .kpi { padding: 20px 15px; text-align: center; border-right: 1px solid #e2e8f0; }
    .kpi:last-child { border-right: none; }
    .kpi-value { font-size: 24px; font-weight: 700; color: #4f46e5; }
    .kpi-label { font-size: 11px; color: #64748b; margin-top: 4px; }
    .content { padding: 30px; }
    .section { margin-bottom: 30px; }
    .section h3 { font-size: 16px; color: #1e293b; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
    .highlight-card { background: linear-gradient(135deg, #ede9fe 0%, #fae8ff 100%); padding: 20px; border-radius: 12px; margin-bottom: 15px; }
    .highlight-card h4 { font-size: 15px; color: #4f46e5; margin-bottom: 8px; }
    .highlight-card p { font-size: 13px; color: #64748b; }
    .footer { background: #1e1b4b; color: #a5b4fc; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #c4b5fd; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
      <h1>Rapport Mensuel</h1>
      <p>{{month}} {{year}}</p>
    </div>
    <div class="kpis">
      <div class="kpi">
        <div class="kpi-value">{{kpi_1_value}}</div>
        <div class="kpi-label">{{kpi_1_label}}</div>
      </div>
      <div class="kpi">
        <div class="kpi-value">{{kpi_2_value}}</div>
        <div class="kpi-label">{{kpi_2_label}}</div>
      </div>
      <div class="kpi">
        <div class="kpi-value">{{kpi_3_value}}</div>
        <div class="kpi-label">{{kpi_3_label}}</div>
      </div>
      <div class="kpi">
        <div class="kpi-value">{{kpi_4_value}}</div>
        <div class="kpi-label">{{kpi_4_label}}</div>
      </div>
    </div>
    <div class="content">
      <div class="section">
        <h3>Points cles du mois</h3>
        {{custom_content}}
      </div>
      {{articles}}
    </div>
    <div class="footer">
      <p>&copy; {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Monthly report</body></html>', 1);

-- Template 13: Nouvelles Communaute
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Nouvelles Communaute', 'nouvelles-communaute', 'newsletter', 'cards-grid', 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #ecfeff; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); padding: 35px; text-align: center; }
    .header img { height: 50px; margin-bottom: 12px; }
    .header h1 { color: #fff; font-size: 24px; }
    .content { padding: 30px; }
    .intro { font-size: 15px; color: #475569; margin-bottom: 25px; text-align: center; }
    .news-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px; }
    .news-card { background: #f0fdfa; padding: 20px; border-radius: 12px; border: 1px solid #99f6e4; }
    .news-card h4 { font-size: 14px; color: #0f766e; margin-bottom: 8px; }
    .news-card p { font-size: 13px; color: #64748b; }
    .members-section { background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 25px; }
    .members-section h3 { font-size: 16px; color: #1e293b; margin-bottom: 15px; text-align: center; }
    .member-avatars { display: flex; justify-content: center; gap: -10px; }
    .member-avatar { width: 50px; height: 50px; border-radius: 50%; background: #0891b2; border: 3px solid #fff; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600; margin-left: -10px; }
    .member-avatar:first-child { margin-left: 0; }
    .events-section h3 { font-size: 16px; color: #1e293b; margin-bottom: 15px; }
    .event-item { display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #e2e8f0; }
    .event-date { background: #0891b2; color: #fff; padding: 10px; border-radius: 8px; text-align: center; min-width: 60px; }
    .event-date .day { font-size: 20px; font-weight: 700; }
    .event-date .month { font-size: 11px; text-transform: uppercase; }
    .event-info h4 { font-size: 14px; color: #1e293b; margin-bottom: 4px; }
    .event-info p { font-size: 12px; color: #64748b; }
    .footer { background: #164e63; color: #a5f3fc; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #67e8f9; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
      <h1>Nouvelles de la Communaute</h1>
    </div>
    <div class="content">
      <p class="intro">Bonjour {{first_name}}, voici les dernieres nouvelles de notre communaute.</p>
      <div class="news-grid">
        {{community_news}}
      </div>
      {{custom_content}}
      <div class="events-section">
        <h3>Evenements a venir</h3>
        {{upcoming_events}}
      </div>
    </div>
    <div class="footer">
      <p>&copy; {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Community news</body></html>', 1);

-- Template 14: Lancement Produit
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Lancement Produit', 'lancement-produit', 'newsletter', 'hero-banner', 'linear-gradient(135deg, #f77062 0%, #fe5196 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #fdf2f8; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { padding: 25px; text-align: center; }
    .header img { height: 45px; }
    .hero { background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); padding: 50px 30px; text-align: center; }
    .hero-badge { display: inline-block; background: rgba(255,255,255,0.2); color: #fff; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 20px; }
    .hero h1 { color: #fff; font-size: 32px; margin-bottom: 15px; }
    .hero p { color: rgba(255,255,255,0.9); font-size: 16px; }
    .product-image { width: 100%; height: 300px; object-fit: cover; }
    .content { padding: 30px; }
    .features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
    .feature { text-align: center; padding: 20px; }
    .feature-icon { width: 50px; height: 50px; background: #fce7f3; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: #ec4899; font-size: 20px; }
    .feature h4 { font-size: 15px; color: #1e293b; margin-bottom: 6px; }
    .feature p { font-size: 13px; color: #64748b; }
    .cta { text-align: center; padding: 30px; background: #fdf2f8; }
    .cta a { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: #fff; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px; }
    .footer { background: #831843; color: #fbcfe8; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #f9a8d4; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
    </div>
    <div class="hero">
      <span class="hero-badge">Nouveau</span>
      <h1>{{subject}}</h1>
      <p>Decouvrez notre derniere innovation</p>
    </div>
    <img class="product-image" src="{{product_image}}" alt="Product">
    <div class="content">
      <div class="features">
        {{features}}
      </div>
      {{custom_content}}
    </div>
    <div class="cta">
      <a href="{{product_url}}">Decouvrir maintenant</a>
    </div>
    <div class="footer">
      <p>&copy; {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Product launch</body></html>', 1);

-- Template 15: Minimal Elegant
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Minimal Elegant', 'minimal-elegant', 'newsletter', 'minimal', 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, "Times New Roman", serif; background: #f8fafc; color: #1e293b; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { padding: 50px 40px; text-align: center; border-bottom: 1px solid #e2e8f0; }
    .header img { height: 50px; margin-bottom: 20px; }
    .header h1 { font-size: 14px; letter-spacing: 4px; text-transform: uppercase; color: #64748b; font-weight: 400; }
    .content { padding: 50px 40px; }
    .content h2 { font-size: 28px; color: #1e293b; margin-bottom: 25px; font-weight: 400; line-height: 1.3; }
    .content p { font-size: 16px; color: #475569; line-height: 1.8; margin-bottom: 20px; }
    .content a { color: #0891b2; }
    .divider { width: 50px; height: 2px; background: #0891b2; margin: 35px 0; }
    .article-minimal { margin-bottom: 35px; }
    .article-minimal h3 { font-size: 20px; color: #1e293b; margin-bottom: 10px; font-weight: 400; }
    .article-minimal p { font-size: 15px; color: #64748b; }
    .article-minimal a { display: inline-block; margin-top: 10px; color: #0891b2; font-size: 14px; text-decoration: none; font-family: "Segoe UI", sans-serif; }
    .footer { padding: 40px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { font-size: 13px; color: #94a3b8; margin-bottom: 8px; font-family: "Segoe UI", sans-serif; }
    .footer a { color: #64748b; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
      <h1>One Health Cameroon</h1>
    </div>
    <div class="content">
      <h2>{{subject}}</h2>
      {{custom_content}}
      <div class="divider"></div>
      {{articles_minimal}}
    </div>
    <div class="footer">
      <p>&copy; {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Minimal elegant</body></html>', 1);

-- Set first template as default
UPDATE newsletter_templates SET is_default = 1 WHERE slug = 'actualites-modernes';
