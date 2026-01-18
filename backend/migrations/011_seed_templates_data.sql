-- Insert 15 professional newsletter templates

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
    .header h1 { color: #ffffff; font-size: 26px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .intro { font-size: 16px; color: #475569; margin-bottom: 30px; padding-bottom: 25px; border-bottom: 2px solid #e2e8f0; }
    .article { margin-bottom: 35px; }
    .article-image { width: 100%; height: 220px; object-fit: cover; border-radius: 12px; margin-bottom: 18px; }
    .article h2 { font-size: 20px; color: #1e293b; margin-bottom: 10px; }
    .article p { color: #64748b; font-size: 15px; margin-bottom: 15px; }
    .article a { color: #059669; font-weight: 600; text-decoration: none; }
    .cta-section { text-align: center; padding: 35px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%); margin: 30px 0; border-radius: 16px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; }
    .footer { background: #1e293b; color: #94a3b8; padding: 35px 30px; text-align: center; font-size: 12px; }
    .footer a { color: #10b981; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health Cameroon">
      <h1>One Health Cameroon</h1>
    </div>
    <div class="content">
      <p class="intro">Bonjour {{first_name}}, voici les dernieres actualites.</p>
      {{articles}}
      {{custom_content}}
      <div class="cta-section">
        <a href="{{site_url}}" class="cta-button">Visiter le site</a>
      </div>
    </div>
    <div class="footer">
      <p>© {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>{{articles}}</body></html>', 1);

-- Template 2: Digest Classique (Image Left)
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Digest Classique', 'digest-classique', 'digest', 'image-left', 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #f8fafc; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: #065f46; padding: 30px; text-align: center; }
    .header img { height: 50px; }
    .header h1 { color: #fff; font-size: 22px; margin-top: 10px; }
    .content { padding: 30px; }
    .article-row { display: table; width: 100%; margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #e2e8f0; }
    .article-image { display: table-cell; width: 140px; vertical-align: top; }
    .article-image img { width: 130px; height: 90px; object-fit: cover; border-radius: 8px; }
    .article-content { display: table-cell; vertical-align: top; padding-left: 15px; }
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
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
      <h1>Digest Hebdomadaire</h1>
    </div>
    <div class="content">
      <p style="color:#475569;margin-bottom:25px;">Bonjour {{first_name}}, voici votre resume.</p>
      {{articles}}
      {{custom_content}}
    </div>
    <div class="footer">
      <p>© {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>{{articles}}</body></html>', 1);

-- Template 3: Bulletin Sante
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Bulletin Sante', 'bulletin-sante', 'sante', 'hero-banner', 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
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
    .content { padding: 30px; }
    .article { margin-bottom: 25px; }
    .article h3 { font-size: 18px; color: #1e293b; margin-bottom: 10px; }
    .article p { font-size: 14px; color: #64748b; }
    .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #10b981; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="alert-bar">BULLETIN DE SANTE</div>
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
      <h1>Bulletin de Sante</h1>
    </div>
    <div class="hero">
      <h2>{{subject}}</h2>
    </div>
    <div class="content">
      {{articles}}
      {{custom_content}}
    </div>
    <div class="footer">
      <p>© {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>{{articles}}</body></html>', 1);

-- Template 4: Invitation Evenement
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Invitation Evenement', 'invitation-evenement', 'evenement', 'cards-grid', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #faf5ff; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #c026d3 100%); padding: 50px 30px; text-align: center; }
    .header img { height: 50px; margin-bottom: 20px; }
    .header h1 { color: #fff; font-size: 28px; margin-bottom: 10px; }
    .header p { color: rgba(255,255,255,0.9); font-size: 16px; }
    .content { padding: 30px; }
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
    </div>
    <div class="content">
      {{custom_content}}
      <div class="cta">
        <a href="{{site_url}}">S''inscrire</a>
      </div>
    </div>
    <div class="footer">
      <p>© {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Event</body></html>', 1);

-- Template 5: Resume Hebdomadaire
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Resume Hebdomadaire', 'resume-hebdomadaire', 'digest', 'zigzag', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #f0f9ff; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%); padding: 35px; text-align: center; }
    .header img { height: 50px; margin-bottom: 12px; }
    .header h1 { color: #fff; font-size: 24px; }
    .content { padding: 30px; }
    .week-badge { background: #e0f2fe; color: #0284c7; display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
    .article-alt { margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #e2e8f0; }
    .article-alt h3 { font-size: 17px; color: #1e293b; margin-bottom: 8px; }
    .article-alt p { font-size: 13px; color: #64748b; margin-bottom: 10px; }
    .article-alt a { color: #0284c7; font-size: 13px; font-weight: 600; text-decoration: none; }
    .footer { background: #0f172a; color: #94a3b8; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #38bdf8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
      <h1>Resume Hebdomadaire</h1>
    </div>
    <div class="content">
      <span class="week-badge">Cette semaine</span>
      {{articles}}
      {{custom_content}}
    </div>
    <div class="footer">
      <p>© {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Weekly</body></html>', 1);

-- Template 6: Annonce Officielle
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Annonce Officielle', 'annonce-officielle', 'newsletter', 'minimal', 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, serif; background: #fffbeb; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #fde68a; }
    .header { background: #fff; padding: 40px 30px; text-align: center; border-bottom: 3px solid #f59e0b; }
    .header img { height: 60px; margin-bottom: 15px; }
    .header h1 { color: #78350f; font-size: 26px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; }
    .badge { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #fff; padding: 8px 20px; font-size: 11px; font-weight: 600; margin-top: 15px; }
    .content { padding: 40px 30px; }
    .content h2 { font-size: 24px; color: #1e293b; margin-bottom: 20px; }
    .content p { font-size: 16px; color: #475569; line-height: 1.8; margin-bottom: 20px; }
    .signature { margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0; }
    .footer { background: #78350f; color: #fde68a; padding: 25px; text-align: center; font-size: 12px; }
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
        <p>L''equipe One Health Cameroon</p>
      </div>
    </div>
    <div class="footer">
      <p>© {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Announcement</body></html>', 1);

-- Template 7: Mise a jour Recherche
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Mise a jour Recherche', 'mise-a-jour-recherche', 'newsletter', 'image-right', 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #fdf2f8; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 30px; text-align: center; }
    .header img { height: 50px; }
    .header h1 { color: #fff; font-size: 20px; margin-top: 10px; }
    .content { padding: 30px; }
    .research-item { display: table; width: 100%; margin-bottom: 30px; }
    .research-text { display: table-cell; vertical-align: top; padding-right: 15px; }
    .research-text .tag { display: inline-block; background: #fce7f3; color: #be185d; font-size: 10px; padding: 4px 10px; border-radius: 12px; margin-bottom: 10px; }
    .research-text h3 { font-size: 18px; color: #1e293b; margin-bottom: 10px; }
    .research-text p { font-size: 14px; color: #64748b; margin-bottom: 12px; }
    .research-text a { color: #be185d; font-size: 13px; font-weight: 600; text-decoration: none; }
    .research-image { display: table-cell; width: 160px; vertical-align: top; }
    .research-image img { width: 150px; height: 110px; object-fit: cover; border-radius: 10px; }
    .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #f9a8d4; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
      <h1>Recherche & Publications</h1>
    </div>
    <div class="content">
      {{articles}}
      {{custom_content}}
    </div>
    <div class="footer">
      <p>© {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Research</body></html>', 1);

-- Template 8: Formation & Atelier
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Formation & Atelier', 'formation-atelier', 'formation', 'hero-banner', 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #fefce8; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 30px; text-align: center; }
    .header img { height: 50px; }
    .hero { background: linear-gradient(135deg, #fef3c7 0%, #fce7f3 100%); padding: 40px 30px; text-align: center; }
    .hero-badge { display: inline-block; background: #b45309; color: #fff; padding: 6px 16px; border-radius: 20px; font-size: 11px; margin-bottom: 15px; }
    .hero h1 { font-size: 26px; color: #78350f; margin-bottom: 15px; }
    .content { padding: 30px; }
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
    </div>
    <div class="content">
      {{custom_content}}
      <div class="cta">
        <a href="{{site_url}}">S''inscrire</a>
      </div>
    </div>
    <div class="footer">
      <p>© {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Training</body></html>', 1);

-- Template 9: Focus Partenaire
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Focus Partenaire', 'focus-partenaire', 'newsletter', 'sidebar', 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #eff6ff; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; }
    .header img { height: 50px; margin-bottom: 10px; }
    .header h1 { color: #fff; font-size: 22px; }
    .content { padding: 25px; }
    .content h2 { font-size: 20px; color: #1e293b; margin-bottom: 15px; }
    .content p { font-size: 14px; color: #64748b; margin-bottom: 15px; line-height: 1.7; }
    .cta { text-align: center; padding: 25px; background: #f0f9ff; }
    .cta a { display: inline-block; background: #3b82f6; color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; }
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
      <h2>{{subject}}</h2>
      {{custom_content}}
    </div>
    <div class="cta">
      <a href="{{site_url}}/partners">Nos partenaires</a>
    </div>
    <div class="footer">
      <p>© {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Partner</body></html>', 1);

-- Template 10: Success Story
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Success Story', 'success-story', 'newsletter', 'hero-banner', 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #fff7ed; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 25px; text-align: center; }
    .header img { height: 45px; }
    .content { padding: 30px; }
    .content h1 { font-size: 24px; color: #1e293b; margin-bottom: 20px; }
    .quote { background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f59e0b; }
    .quote p { font-size: 18px; color: #78350f; font-style: italic; line-height: 1.6; }
    .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #fbbf24; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
    </div>
    <div class="content">
      <h1>{{subject}}</h1>
      {{custom_content}}
    </div>
    <div class="footer">
      <p>© {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Success</body></html>', 1);

-- Template 11: Bulletin d''Alerte
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Bulletin d''Alerte', 'bulletin-alerte', 'alerte', 'hero-banner', 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
'[ALERTE] {{subject}}', '[ALERT] {{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #fef2f2; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border: 2px solid #fecaca; }
    .alert-banner { background: linear-gradient(90deg, #dc2626 0%, #b91c1c 100%); color: #fff; padding: 15px; text-align: center; font-size: 18px; font-weight: 700; }
    .header { background: #fff; padding: 25px; text-align: center; border-bottom: 1px solid #fecaca; }
    .header img { height: 50px; }
    .content { padding: 30px; }
    .alert-level { display: inline-block; background: #fef2f2; color: #dc2626; padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; margin-bottom: 20px; border: 1px solid #fecaca; }
    .content h1 { font-size: 22px; color: #1e293b; margin-bottom: 20px; }
    .content p { font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 15px; }
    .actions { background: #fef2f2; padding: 25px; border-radius: 12px; margin: 25px 0; }
    .actions h3 { font-size: 16px; color: #dc2626; margin-bottom: 15px; }
    .cta { text-align: center; margin: 25px 0; }
    .cta a { display: inline-block; background: #dc2626; color: #fff; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { background: #7f1d1d; color: #fecaca; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #fca5a5; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="alert-banner">ALERTE SANITAIRE</div>
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
    </div>
    <div class="content">
      <span class="alert-level">Alerte importante</span>
      <h1>{{subject}}</h1>
      {{custom_content}}
      <div class="cta">
        <a href="{{site_url}}">Plus d''informations</a>
      </div>
    </div>
    <div class="footer">
      <p>© {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Alert</body></html>', 1);

-- Template 12: Rapport Mensuel
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Rapport Mensuel', 'rapport-mensuel', 'rapport', 'cards-grid', 'linear-gradient(135deg, #0250c5 0%, #d43f8d 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #f5f3ff; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 35px; text-align: center; }
    .header img { height: 50px; margin-bottom: 12px; }
    .header h1 { color: #fff; font-size: 24px; }
    .kpis { display: table; width: 100%; background: #f8fafc; }
    .kpi { display: table-cell; padding: 20px 15px; text-align: center; border-right: 1px solid #e2e8f0; }
    .kpi:last-child { border-right: none; }
    .kpi-value { font-size: 24px; font-weight: 700; color: #4f46e5; }
    .kpi-label { font-size: 11px; color: #64748b; margin-top: 4px; }
    .content { padding: 30px; }
    .section h3 { font-size: 16px; color: #1e293b; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
    .footer { background: #1e1b4b; color: #a5b4fc; padding: 25px; text-align: center; font-size: 12px; }
    .footer a { color: #c4b5fd; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{site_url}}/images/one-health.jpg" alt="One Health">
      <h1>Rapport Mensuel</h1>
    </div>
    <div class="content">
      <div class="section">
        <h3>Points cles</h3>
        {{custom_content}}
      </div>
      {{articles}}
    </div>
    <div class="footer">
      <p>© {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Report</body></html>', 1);

-- Template 13: Nouvelles Communaute
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Nouvelles Communaute', 'nouvelles-communaute', 'newsletter', 'cards-grid', 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #ecfeff; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); padding: 35px; text-align: center; }
    .header img { height: 50px; margin-bottom: 12px; }
    .header h1 { color: #fff; font-size: 24px; }
    .content { padding: 30px; }
    .intro { font-size: 15px; color: #475569; margin-bottom: 25px; text-align: center; }
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
      <p class="intro">Bonjour {{first_name}}, voici les dernieres nouvelles.</p>
      {{articles}}
      {{custom_content}}
    </div>
    <div class="footer">
      <p>© {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Community</body></html>', 1);

-- Template 14: Lancement Produit
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Lancement Produit', 'lancement-produit', 'newsletter', 'hero-banner', 'linear-gradient(135deg, #f77062 0%, #fe5196 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, sans-serif; background: #fdf2f8; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { padding: 25px; text-align: center; }
    .header img { height: 45px; }
    .hero { background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); padding: 50px 30px; text-align: center; }
    .hero-badge { display: inline-block; background: rgba(255,255,255,0.2); color: #fff; padding: 6px 16px; border-radius: 20px; font-size: 11px; margin-bottom: 20px; }
    .hero h1 { color: #fff; font-size: 32px; margin-bottom: 15px; }
    .hero p { color: rgba(255,255,255,0.9); font-size: 16px; }
    .content { padding: 30px; }
    .cta { text-align: center; padding: 30px; background: #fdf2f8; }
    .cta a { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: #fff; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 600; }
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
    <div class="content">
      {{custom_content}}
    </div>
    <div class="cta">
      <a href="{{site_url}}">Decouvrir</a>
    </div>
    <div class="footer">
      <p>© {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Launch</body></html>', 1);

-- Template 15: Minimal Elegant
INSERT INTO newsletter_templates (name, slug, category, layout, preview_gradient, subject_fr, subject_en, content_html_fr, content_html_en, is_active) VALUES
('Minimal Elegant', 'minimal-elegant', 'newsletter', 'minimal', 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
'{{subject}}', '{{subject}}',
'<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, serif; background: #f8fafc; color: #1e293b; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { padding: 50px 40px; text-align: center; border-bottom: 1px solid #e2e8f0; }
    .header img { height: 50px; margin-bottom: 20px; }
    .header h1 { font-size: 14px; letter-spacing: 4px; text-transform: uppercase; color: #64748b; }
    .content { padding: 50px 40px; }
    .content h2 { font-size: 28px; color: #1e293b; margin-bottom: 25px; }
    .content p { font-size: 16px; color: #475569; line-height: 1.8; margin-bottom: 20px; }
    .content a { color: #0891b2; }
    .divider { width: 50px; height: 2px; background: #0891b2; margin: 35px 0; }
    .footer { padding: 40px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { font-size: 13px; color: #94a3b8; margin-bottom: 8px; }
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
      {{articles}}
    </div>
    <div class="footer">
      <p>© {{year}} One Health Cameroon</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>',
'<!DOCTYPE html><html><body>Minimal</body></html>', 1);

-- Set first template as default
UPDATE newsletter_templates SET is_default = 1 WHERE slug = 'actualites-modernes';
