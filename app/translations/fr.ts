// fr.ts
export const fr = {
    common: {
      languages: {
        en: 'Anglais',
        es: 'Espagnol',
        fr: 'Français'
      },
      back: 'Retour'
    },
    landing: {
      hero: {
        title: 'Plateforme de service client nouvelle génération',
        subtitle: 'Donnez à votre équipe de support les moyens de réussir grâce à des solutions basées sur l\'IA',
        getStarted: 'Commencer',
        learnMore: 'En savoir plus'
      },
      features: {
        title: 'Fonctionnalités',
        aiAssistant: {
          title: 'Assistant IA',
          description: 'Automatisation intelligente pour des résolutions plus rapides'
        },
        ticketing: {
          title: 'Billetterie intelligente',
          description: 'Gestion et routage efficaces des tickets'
        },
        analytics: {
          title: 'Analyses avancées',
          description: 'Informations basées sur les données pour de meilleures décisions'
        }
      },
      cta: {
        title: 'Prêt à transformer votre service client ?',
        subtitle: 'Rejoignez des milliers d\'entreprises qui utilisent déjà notre plateforme',
        button: 'Commencer l\'essai gratuit'
      }
    },
    faq: {
      title: 'Foire aux questions',
      description: 'Trouvez des réponses aux questions courantes sur notre plateforme.',
      searchPlaceholder: 'Rechercher des questions...',
      categories: {
        general: 'Général',
        pricing: 'Tarification',
        technical: 'Support technique'
      },
      technical: {
        title: 'FAQ sur le support technique',
        description: 'Obtenez de l\'aide sur les problèmes techniques, le dépannage et la configuration.',
        items: [
          {
            question: "Comment puis-je réinitialiser mon mot de passe ?",
            answer: "Pour réinitialiser votre mot de passe, cliquez sur le lien 'Mot de passe oublié' sur la page de connexion. Saisissez votre adresse e-mail et nous vous enverrons des instructions pour créer un nouveau mot de passe. Pour des raisons de sécurité, les liens de réinitialisation de mot de passe expirent après 24 heures."
          },
          {
            question: "Quels navigateurs et appareils sont pris en charge ?",
            answer: "Notre plateforme est optimisée pour les dernières versions des navigateurs Chrome, Firefox, Safari et Edge. Nous prenons également en charge les appareils mobiles fonctionnant sous iOS 13+ et Android 8+. Pour une expérience optimale, nous vous recommandons de maintenir votre navigateur et votre système d'exploitation à jour."
          },
          {
            question: "Comment puis-je gérer mes paramètres de notification ?",
            answer: "Connectez-vous à votre compte et accédez à Paramètres> Notifications. Vous pouvez y personnaliser vos préférences pour les notifications par e-mail, les alertes dans l'application et les notifications push mobiles. Vous pouvez définir différents niveaux de notification pour les mises à jour de tickets, les mentions et les annonces système."
          },
          {
            question: "Que dois-je faire si je rencontre une erreur ?",
            answer: "Si vous rencontrez une erreur : 1) Prenez une capture d'écran du message d'erreur, 2) Notez les étapes qui ont conduit à l'erreur, 3) Effacez le cache et les cookies de votre navigateur, 4) Essayez de vous déconnecter et de vous reconnecter. Si le problème persiste, contactez notre équipe de support avec ces détails pour une résolution plus rapide."
          },
          {
            question: "Comment puis-je activer l'authentification à deux facteurs (2FA) ?",
            answer: "Pour activer la 2FA : 1) Allez dans Paramètres> Sécurité, 2) Cliquez sur 'Activer la 2FA', 3) Choisissez entre l'application d'authentification ou la vérification par SMS, 4) Suivez l'assistant de configuration. Nous vous recommandons d'utiliser une application d'authentification comme Google Authenticator ou Authy pour une sécurité renforcée."
          },
          {
            question: "Puis-je accéder à la plateforme hors ligne ?",
            answer: "Bien que la plupart des fonctionnalités nécessitent une connexion Internet, notre application Web progressive (PWA) vous permet de visualiser les tickets précédemment chargés et de rédiger des réponses hors ligne. Vos modifications seront automatiquement synchronisées une fois que vous serez de nouveau en ligne."
          },
          {
            question: "Comment puis-je exporter mes données ?",
            answer: "Pour exporter vos données : 1) Accédez à Paramètres> Gestion des données, 2) Sélectionnez le type de données que vous souhaitez exporter (tickets, contacts, rapports), 3) Choisissez votre format préféré (CSV, JSON, PDF), 4) Cliquez sur 'Générer l'exportation'. Les exportations volumineuses peuvent prendre plusieurs minutes à traiter."
          },
          {
            question: "Quelle est la configuration système requise ?",
            answer: "Configuration minimale requise : 2 Go de RAM, navigateur Web moderne, connexion Internet stable (1 Mbps +). Pour des performances optimales, nous recommandons : 4 Go + de RAM, Internet haut débit (5 Mbps +) et une résolution d'écran de 1280x720 ou supérieure."
          }
        ]
      }
    },
    contact: {
      title: 'Contacter le support',
      form: {
        description: 'Veuillez remplir le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.',
        customerInfo: 'Vos informations',
        name: 'Nom complet',
        email: 'Adresse e-mail',
        company: 'Entreprise',
        phone: 'Numéro de téléphone',
        issueDetails: 'Détails du problème',
        category: 'Catégorie',
        categories: {
          support: 'Support technique',
          billing: 'Facturation',
          sales: 'Questions sur le produit',
          account: 'Gestion de compte',
          other: 'Autre'
        },
        subject: 'Sujet',
        message: 'Message',
        submit: 'Soumettre',
        submitting: 'Envoi en cours...'
      },
      success: 'Message envoyé avec succès !',
      error: 'Erreur lors de l\'envoi du message. Veuillez réessayer.'
    }
  };