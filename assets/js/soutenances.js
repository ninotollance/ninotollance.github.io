// =====================================================================
// Tes soutenances CDA (dates tirées de ton planning) : c'est le seul fichier
// à modifier pour cette section.
//
// - statut : 'passee' ou 'a-venir'  → après chaque soutenance, passe-la en 'passee'
// - date   : 'AAAA-MM-JJ' (premier jour de la soutenance)
// - resume : une ou deux phrases sur ce que tu as présenté
// - image, dossier, doc, code : chemins ou liens ; laisse '' si tu n'en as pas,
//   le lien ne s'affichera pas (si dossier et doc sont le même PDF, mets le même
//   chemin aux deux : un seul lien « Dossier projet & doc technique » s'affiche)
//
// La carte du haut montre la soutenance passée la plus récente.
// Les autres soutenances passées apparaissent avec « Voir les X autres ».
// Les soutenances à venir ne sont pas listées : elles servent au compteur
// « 1 / 6 soutenances · prochaine le … ».
// =====================================================================
window.SOUTENANCES = [
  {
    titre:  'Programmation orientée objet · Site de vente',
    resume: "Application Java (Swing, Maven) de gestion d'un site de vente : consultation du stock et des commandes, modification et livraison des commandes, calcul des ventes, puis envoi par e-mail de l'état des commandes livrées via Brevo.",
    date: '2026-11-05', statut: 'a-venir',
    image: 'assets/img/soutenance-1.jpg', dossier: 'assets/docs/soutenance-1-dossier.pdf', doc: 'assets/docs/soutenance-1-dossier.pdf',
    code: 'https://github.com/ninotollance/Soutenance-n-1',
  },
  {
    titre:  'Maquette, base de données et POO',
    resume: '',
    date: '2026-12-17', statut: 'a-venir',
    image: 'assets/img/soutenance-2.jpg', dossier: '', doc: '', code: '',
  },
  {
    titre:  'Application front-end et back-end',
    resume: '',
    date: '2027-01-28', statut: 'a-venir',
    image: 'assets/img/soutenance-3.jpg', dossier: '', doc: '', code: '',
  },
  {
    titre:  'Back-end',
    resume: '',
    date: '2027-02-22', statut: 'a-venir',
    image: 'assets/img/soutenance-4.jpg', dossier: '', doc: '', code: '',
  },
  {
    titre:  'Front-end',
    resume: '',
    date: '2027-04-08', statut: 'a-venir',
    image: 'assets/img/soutenance-5.jpg', dossier: '', doc: '', code: '',
  },
  {
    titre:  'Projet final · titre CDA',
    resume: '',
    date: '2027-06-30', statut: 'a-venir',
    image: 'assets/img/soutenance-6.jpg', dossier: '', doc: '', code: '',
  },
];
