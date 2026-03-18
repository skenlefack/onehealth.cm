const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs');

// Helper function to create a table
function createTable(headers, rows) {
  const headerRow = new TableRow({
    children: headers.map(header => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: header, bold: true, size: 22 })],
        alignment: AlignmentType.CENTER
      })],
      shading: { fill: "1E3A5F" },
    })),
    tableHeader: true
  });

  const dataRows = rows.map((row, idx) => new TableRow({
    children: row.map(cell => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: cell, size: 20 })],
      })],
      shading: { fill: idx % 2 === 0 ? "F5F5F5" : "FFFFFF" }
    }))
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows]
  });
}

// Create the document
const doc = new Document({
  sections: [{
    properties: {},
    children: [
      // Title
      new Paragraph({
        children: [new TextRun({ text: "AGENDA DE FORMATION", bold: true, size: 48, color: "1E3A5F" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "Plateforme One Health CMS", bold: true, size: 36, color: "2196F3" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "Formation Complete - 3 Jours", size: 28, italics: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),

      // ========== JOUR 1 ==========
      new Paragraph({
        children: [new TextRun({ text: "JOUR 1 : Configuration Technique et Fondamentaux", bold: true, size: 32, color: "FFFFFF" })],
        shading: { fill: "1E3A5F" },
        spacing: { before: 400, after: 200 }
      }),

      // Matin J1
      new Paragraph({
        children: [new TextRun({ text: "Matin (9h00 - 12h30)", bold: true, size: 26, color: "2196F3" })],
        spacing: { before: 200, after: 100 }
      }),

      createTable(
        ["Horaire", "Module", "Contenu"],
        [
          ["9h00 - 9h30", "Accueil", "Presentation des participants, objectifs, tour de table"],
          ["9h30 - 10h30", "Configuration Email Professionnel", "Configuration SMTP, parametres serveur, test d'envoi"],
          ["10h30 - 10h45", "Pause cafe", ""],
          ["10h45 - 12h00", "Emails Automatiques", "Verification compte, notifications, templates bilingues"],
          ["12h00 - 12h30", "Concept One Health", "Approche integree sante humaine/animale/environnementale"]
        ]
      ),

      // Configuration Email
      new Paragraph({
        children: [new TextRun({ text: "Configuration Email - Details Techniques", bold: true, size: 24, color: "E65100" })],
        spacing: { before: 300, after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "Fichier de configuration: backend/.env", size: 22, italics: true })],
        spacing: { after: 100 }
      }),

      createTable(
        ["Variable", "Valeur", "Description"],
        [
          ["SMTP_HOST", "smtp.votredomaine.cm", "Serveur SMTP"],
          ["SMTP_PORT", "587", "Port SMTP"],
          ["SMTP_SECURE", "false", "SSL/TLS"],
          ["SMTP_USER", "noreply@onehealth.cm", "Utilisateur SMTP"],
          ["SMTP_PASS", "votre_mot_de_passe", "Mot de passe"],
          ["SMTP_FROM", "noreply@onehealth.cm", "Adresse expediteur"]
        ]
      ),

      new Paragraph({
        children: [new TextRun({ text: "Fournisseurs SMTP recommandes:", bold: true, size: 22 })],
        spacing: { before: 200, after: 100 }
      }),

      createTable(
        ["Fournisseur", "SMTP Host", "Port", "Securite"],
        [
          ["Gmail", "smtp.gmail.com", "587", "STARTTLS"],
          ["Office 365", "smtp.office365.com", "587", "STARTTLS"],
          ["OVH", "ssl0.ovh.net", "465", "SSL"],
          ["Sendinblue", "smtp-relay.sendinblue.com", "587", "STARTTLS"],
          ["Mailgun", "smtp.mailgun.org", "587", "STARTTLS"]
        ]
      ),

      // Apres-midi J1
      new Paragraph({
        children: [new TextRun({ text: "Apres-midi (14h00 - 17h30)", bold: true, size: 26, color: "2196F3" })],
        spacing: { before: 300, after: 100 }
      }),

      createTable(
        ["Horaire", "Module", "Contenu"],
        [
          ["14h00 - 15h00", "Architecture Plateforme", "5 modules: CMS, OHWR-Mapping, E-Learning, COHRM, Newsletter"],
          ["15h00 - 15h45", "Panneau d'Administration", "Connexion, tableau de bord, navigation"],
          ["15h45 - 16h00", "Pause", ""],
          ["16h00 - 17h00", "Gestion de Contenu", "Articles, pages, categories, medias, widgets"],
          ["17h00 - 17h30", "Atelier Pratique 1", "Configurer email + creer compte test + verifier reception"]
        ]
      ),

      // ========== JOUR 2 ==========
      new Paragraph({
        children: [new TextRun({ text: "JOUR 2 : OHWR-Mapping et COHRM-System", bold: true, size: 32, color: "FFFFFF" })],
        shading: { fill: "1E3A5F" },
        spacing: { before: 400, after: 200 }
      }),

      // Matin J2
      new Paragraph({
        children: [new TextRun({ text: "Matin (9h00 - 12h30) - OHWR-Mapping", bold: true, size: 26, color: "2196F3" })],
        spacing: { before: 200, after: 100 }
      }),

      createTable(
        ["Horaire", "Module", "Contenu"],
        [
          ["9h00 - 9h30", "Recapitulatif J1", "Questions, test email, revisions"],
          ["9h30 - 10h30", "OHWR: Vue d'ensemble", "Objectifs cartographie, statistiques, carte interactive"],
          ["10h30 - 10h45", "Pause cafe", ""],
          ["10h45 - 11h30", "Gestion des Experts", "Ajouter/modifier experts, domaines, geolocalisation, CV"],
          ["11h30 - 12h30", "Organisations & Ressources", "Institutions, equipements, laboratoires, documents"]
        ]
      ),

      new Paragraph({
        children: [new TextRun({ text: "OHWR-Mapping - Entites gerees", bold: true, size: 24, color: "E65100" })],
        spacing: { before: 300, after: 100 }
      }),

      createTable(
        ["Entite", "Description", "Champs cles"],
        [
          ["Experts", "Professionnels One Health", "Nom, titre, organisation, domaines, photo, CV, GPS"],
          ["Organisations", "Institutions partenaires", "Nom, acronyme, type, logo, contact, adresse"],
          ["Ressources Materielles", "Equipements, laboratoires", "Nom, type, capacite, statut, localisation"],
          ["Documents", "Rapports, guides, protocoles", "Titre, type, fichier PDF, theme, source"]
        ]
      ),

      // Apres-midi J2
      new Paragraph({
        children: [new TextRun({ text: "Apres-midi (14h00 - 17h30) - COHRM-System", bold: true, size: 26, color: "2196F3" })],
        spacing: { before: 300, after: 100 }
      }),

      createTable(
        ["Horaire", "Module", "Contenu"],
        [
          ["14h00 - 15h00", "COHRM: Introduction", "Surveillance basee sur les rumeurs, workflow verification"],
          ["15h00 - 15h45", "Signalement Rumeurs", "Sources multiples, categories, codes SMS"],
          ["15h45 - 16h00", "Pause", ""],
          ["16h00 - 16h45", "Traitement Rumeurs", "Investigation, statuts, priorites, notifications"],
          ["16h45 - 17h30", "Atelier Pratique 2", "Cycle complet: SMS -> investigation -> cloture"]
        ]
      ),

      new Paragraph({
        children: [new TextRun({ text: "COHRM - Codes SMS pour Agents Communautaires", bold: true, size: 24, color: "E65100" })],
        spacing: { before: 300, after: 100 }
      }),

      new Paragraph({
        children: [new TextRun({ text: "FORMAT: CODE*LOCALITE*SYMPTOMES*ESPECE*NOMBRE*DETAILS", bold: true, size: 22, font: "Courier New" })],
        shading: { fill: "F5F5F5" },
        spacing: { after: 50 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "EXEMPLE: MAL*YAOUNDE*FI,VO,DI*HUM*5*Cas groupes marche central", size: 22, font: "Courier New" })],
        shading: { fill: "F5F5F5" },
        spacing: { after: 200 }
      }),

      createTable(
        ["Code Evenement", "Signification"],
        [
          ["MAL", "Maladie suspecte"],
          ["MOR", "Mortalite anormale"],
          ["EPI", "Epidemie suspectee"],
          ["ZOO", "Zoonose suspectee"],
          ["INT", "Intoxication"],
          ["ENV", "Evenement environnemental"]
        ]
      ),

      new Paragraph({ children: [], spacing: { after: 100 } }),

      createTable(
        ["Code Symptome", "Signification"],
        [
          ["FI", "Fievre"],
          ["VO", "Vomissements"],
          ["DI", "Diarrhee"],
          ["TO", "Toux"],
          ["ER", "Eruption cutanee"],
          ["HE", "Hemorragie"],
          ["PA", "Paralysie"],
          ["MO", "Mortalite"]
        ]
      ),

      new Paragraph({ children: [], spacing: { after: 100 } }),

      createTable(
        ["Code Espece", "Signification"],
        [
          ["HUM", "Humain"],
          ["BOV", "Bovin"],
          ["OVI", "Ovin/Caprin"],
          ["VOL", "Volaille"],
          ["POR", "Porcin"],
          ["SAU", "Faune sauvage"]
        ]
      ),

      new Paragraph({
        children: [new TextRun({ text: "COHRM - Priorites", bold: true, size: 24, color: "E65100" })],
        spacing: { before: 300, after: 100 }
      }),

      createTable(
        ["Priorite", "Couleur", "Delai de reponse"],
        [
          ["Critique", "Rouge", "< 2 heures"],
          ["Haute", "Orange", "< 6 heures"],
          ["Moyenne", "Jaune", "< 24 heures"],
          ["Basse", "Vert", "< 72 heures"]
        ]
      ),

      // ========== JOUR 3 ==========
      new Paragraph({
        children: [new TextRun({ text: "JOUR 3 : E-Learning, Newsletter et Synthese", bold: true, size: 32, color: "FFFFFF" })],
        shading: { fill: "1E3A5F" },
        spacing: { before: 400, after: 200 }
      }),

      // Matin J3
      new Paragraph({
        children: [new TextRun({ text: "Matin (9h00 - 12h30) - E-Learning", bold: true, size: 26, color: "2196F3" })],
        spacing: { before: 200, after: 100 }
      }),

      createTable(
        ["Horaire", "Module", "Contenu"],
        [
          ["9h00 - 9h30", "Recapitulatif J2", "Questions OHWR et COHRM"],
          ["9h30 - 10h30", "E-Learning: Vue Apprenant", "Inscription cours, videos avec progression, quiz"],
          ["10h30 - 10h45", "Pause cafe", ""],
          ["10h45 - 11h30", "Mon Apprentissage", "Tableau de bord, statistiques, certificats PDF + QR"],
          ["11h30 - 12h30", "Admin: Creation de Cours", "Structure cours -> modules -> lecons, upload videos"]
        ]
      ),

      // Apres-midi J3
      new Paragraph({
        children: [new TextRun({ text: "Apres-midi (14h00 - 17h00) - Newsletter et Synthese", bold: true, size: 26, color: "2196F3" })],
        spacing: { before: 300, after: 100 }
      }),

      createTable(
        ["Horaire", "Module", "Contenu"],
        [
          ["14h00 - 14h45", "Admin: Quiz & Certificats", "Banque de questions (6 types), parcours diplomants"],
          ["14h45 - 15h30", "Newsletter", "Configuration widget, collecte abonnes, integration site"],
          ["15h30 - 15h45", "Pause", ""],
          ["15h45 - 16h30", "Atelier Final", "Scenario complet multi-modules"],
          ["16h30 - 17h00", "Cloture", "Evaluation, Q&A, remise des attestations"]
        ]
      ),

      new Paragraph({
        children: [new TextRun({ text: "Types de Questions Quiz", bold: true, size: 24, color: "E65100" })],
        spacing: { before: 300, after: 100 }
      }),

      createTable(
        ["Type", "Description"],
        [
          ["MCQ", "Choix unique"],
          ["Multiple Select", "Choix multiples"],
          ["True/False", "Vrai ou Faux"],
          ["Short Answer", "Reponse courte"],
          ["Fill in the Blank", "Texte a trous"],
          ["Matching", "Association"]
        ]
      ),

      // ========== RECAPITULATIF ==========
      new Paragraph({
        children: [new TextRun({ text: "RECAPITULATIF DES 6 MODULES", bold: true, size: 32, color: "FFFFFF" })],
        shading: { fill: "1E3A5F" },
        spacing: { before: 400, after: 200 }
      }),

      createTable(
        ["Module", "Fonctionnalites Cles"],
        [
          ["Email Pro", "Configuration SMTP, templates bilingues, verification compte, notifications"],
          ["CMS", "Articles, pages, categories, menus, medias, widgets"],
          ["OHWR-Mapping", "Experts, organisations, ressources, documents, carte interactive"],
          ["E-Learning", "Cours, videos tracking, quiz (6 types), certificats PDF + QR"],
          ["COHRM-System", "Rumeurs sanitaires, SMS codifie, investigation, statistiques"],
          ["Newsletter", "Widget inscription, collecte abonnes, export CSV"]
        ]
      ),

      // ========== IDENTIFIANTS ==========
      new Paragraph({
        children: [new TextRun({ text: "IDENTIFIANTS DE FORMATION", bold: true, size: 28, color: "1E3A5F" })],
        spacing: { before: 400, after: 200 }
      }),

      createTable(
        ["Role", "Email", "Mot de passe"],
        [
          ["Admin", "admin@onehealth.cm", "admin123"]
        ]
      ),

      // ========== CHECKLIST ==========
      new Paragraph({
        children: [new TextRun({ text: "CHECKLIST CONFIGURATION EMAIL", bold: true, size: 28, color: "1E3A5F" })],
        spacing: { before: 400, after: 200 }
      }),

      new Paragraph({ children: [new TextRun({ text: "[] 1. Obtenir les identifiants SMTP de votre fournisseur", size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: "[] 2. Editer le fichier backend/.env", size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: "[] 3. Renseigner SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS", size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: "[] 4. Configurer SMTP_FROM avec votre adresse d'envoi", size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: "[] 5. Redemarrer le serveur backend", size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: "[] 6. Tester avec une inscription de compte", size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: "[] 7. Verifier la reception de l'email de verification", size: 22 })] }),

      // Footer
      new Paragraph({
        children: [new TextRun({ text: "Document genere automatiquement - One Health CMS", size: 18, italics: true, color: "888888" })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 }
      })
    ]
  }]
});

// Generate the document
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('doc/Agenda_Formation_OneHealth_3jours.docx', buffer);
  console.log('Document Word cree: doc/Agenda_Formation_OneHealth_3jours.docx');
}).catch(err => {
  console.error('Erreur:', err);
});
