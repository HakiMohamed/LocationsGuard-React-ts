import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { Reservation } from '../../types/reservation.types';
import carInspectionImage from '../../assets/images/EtatDeCarroserie.png';

// Définition des styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 1.4,
    textAlign: 'justify',
  },
  article: {
    marginBottom: 6,
  },
  signature: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
  },
  carInspection: {
    marginTop: 20,
    width: '100%',
    height: 'auto',
  },
});

interface ContractPDFProps {
  reservation: Reservation;
}

const ContractPDF: React.FC<ContractPDFProps> = ({ reservation }) => {
  // Ajout de vérifications pour éviter les erreurs
  if (!reservation || !reservation.client || !reservation.automobile) {
    console.error('Données de réservation manquantes:', reservation);
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Erreur: Données de réservation incomplètes</Text>
        </Page>
      </Document>
    );
  }

  const today = new Date().toLocaleDateString('fr-FR');
  const startDate = new Date(reservation.startDate).toLocaleDateString('fr-FR');
  const endDate = new Date(reservation.endDate).toLocaleDateString('fr-FR');
  const durationInDays = Math.ceil((new Date(reservation.endDate).getTime() - new Date(reservation.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const pricePerDay = reservation.totalPrice / durationInDays;

  try {
    return (
      <Document>
        {/* Page 1: Contrat de location */}
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Contrat de Location de Véhicule</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Entre les soussignés :</Text>
            <Text style={styles.paragraph}>
              La Société de Location : IRENT MOROCCO, société à responsabilité limitée au capital de 100 000 dirhams, 
              dont le siège social est situé à [adresse complète], immatriculée au Registre du Commerce et des Sociétés 
              sous le numéro RC123456, représentée par M. [nom du représentant], en sa qualité de Gérant, ci-après 
              dénommée "le Loueur".
            </Text>
            <Text style={styles.paragraph}>
              Et
            </Text>
            <Text style={styles.paragraph}>
              Le Locataire : {reservation.client?.firstName} {reservation.client?.lastName}, 
              demeurant à {reservation.client?.address || '[Adresse du client]'}, 
              titulaire de la CIN/Passeport numéro {reservation.client?.idCard || '[N° ID]'}, 
              ci-après dénommé "le Locataire".
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 1 : Objet du contrat</Text>
            <Text style={styles.paragraph}>
              Le Loueur met à la disposition du Locataire, qui accepte, le véhicule désigné ci-après, 
              aux conditions définies dans le présent contrat.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 2 : Désignation du véhicule</Text>
            <Text style={styles.paragraph}>
              Marque : {reservation.automobile?.brand}{'\n'}
              Modèle : {reservation.automobile?.model}{'\n'}
              Immatriculation : {reservation.automobile?.licensePlate}{'\n'}
              Kilométrage au départ : {reservation.automobile?.mileage} km
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 3 : Durée de la location</Text>
            <Text style={styles.paragraph}>
              La location est consentie pour une durée de {durationInDays} jours, 
              à compter du {startDate} jusqu'au {endDate}.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 4 : Prix de la location et modalités de paiement</Text>
            <Text style={styles.paragraph}>
              Le montant total de la location est fixé à {reservation.totalPrice} dirhams, 
              soit {pricePerDay.toFixed(2)} dirhams par jour.{'\n'}
              Ce montant comprend :{'\n'}
              - Le coût de la location du véhicule{'\n'}
              - L'assurance responsabilité civile obligatoire
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 5 : Dépôt de garantie</Text>
            <Text style={styles.paragraph}>
              Un dépôt de garantie de 5000 dirhams est exigé à la prise en charge du véhicule.
            </Text>
          </View>

          <View style={styles.signature}>
            <View style={styles.signatureBox}>
              <Text>Le Loueur</Text>
              <Text>Date : {today}</Text>
              <Text>Signature :</Text>
            </View>
            <View style={styles.signatureBox}>
              <Text>Le Locataire</Text>
              <Text>Date : {today}</Text>
              <Text>Signature :</Text>
            </View>
          </View>
        </Page>

        {/* Page 2: Suite du contrat */}
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 6 : Obligations du Locataire</Text>
            <Text style={styles.paragraph}>
              Le Locataire s'engage à :{'\n\n'}
              - Utiliser le véhicule conformément aux dispositions du Code de la route en vigueur au Maroc.{'\n'}
              - Ne pas utiliser le véhicule à des fins illicites ou pour le transport rémunéré de passagers.{'\n'}
              - Ne pas sous-louer le véhicule ou le prêter à des tiers non autorisés.{'\n'}
              - Assumer l'entière responsabilité des infractions commises durant la période de location.{'\n'}
              - Maintenir le véhicule en bon état de fonctionnement.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 7 : Assurances</Text>
            <Text style={styles.paragraph}>
              Le véhicule est couvert par une assurance responsabilité civile obligatoire. 
              Les dommages non couverts par l'assurance seront à la charge du Locataire.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 8 : Restitution du véhicule</Text>
            <Text style={styles.paragraph}>
              Le Locataire s'engage à restituer le véhicule dans son état initial, 
              hormis l'usure normale, à la date et à l'heure convenues. 
              Tout retard non autorisé entraînera des frais supplémentaires.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 9 : Litiges</Text>
            <Text style={styles.paragraph}>
              En cas de litige, les parties s'engagent à rechercher une solution amiable. 
              À défaut, les tribunaux compétents de Casablanca seront seuls compétents.
            </Text>
          </View>

          <View style={styles.signature}>
            <View style={styles.signatureBox}>
              <Text>Lu et approuvé</Text>
              <Text>Le Loueur</Text>
              <Text>Signature :</Text>
            </View>
            <View style={styles.signatureBox}>
              <Text>Lu et approuvé</Text>
              <Text>Le Locataire</Text>
              <Text>Signature :</Text>
            </View>
          </View>
        </Page>

        {/* Page 3: État de Carrosserie */}
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>État de Carrosserie</Text>
          
          <View style={styles.section}>
            <Text>Véhicule : {reservation.automobile?.brand} {reservation.automobile?.model}</Text>
            <Text>Immatriculation : {reservation.automobile?.licensePlate}</Text>
            <Text>Kilométrage : {reservation.automobile?.mileage} km</Text>
            <Text>Date de l'inspection : {today}</Text>
          </View>

          <View style={styles.section}>
            <Image src={carInspectionImage} style={styles.carInspection} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Légende :</Text>
            <Text>X = Rayure</Text>
            <Text>O = Bosselure</Text>
            <Text>/ = Éraflure</Text>
          </View>

          <View style={styles.signature}>
            <View style={styles.signatureBox}>
              <Text>État des lieux de départ</Text>
              <Text>Date : {startDate}</Text>
              <Text>Signature du Locataire :</Text>
            </View>
            <View style={styles.signatureBox}>
              <Text>État des lieux de retour</Text>
              <Text>Date : {endDate}</Text>
              <Text>Signature du Locataire :</Text>
            </View>
          </View>
        </Page>
      </Document>
    );
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Erreur lors de la génération du document</Text>
        </Page>
      </Document>
    );
  }
};

export default ContractPDF; 