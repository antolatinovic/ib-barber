import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Button,
  Row,
  Column,
} from "@react-email/components";

interface ConfirmationEmailProps {
  firstName: string;
  date: string;
  time: string;
  service: string;
  cancelUrl?: string | null;
  secondTime?: string | null;
  guestName?: string | null;
  isGuest?: boolean;
  mainName?: string | null;
}

export default function ConfirmationEmail({
  firstName,
  date,
  time,
  service,
  cancelUrl,
  secondTime,
  guestName,
  isGuest,
  mainName,
}: ConfirmationEmailProps) {
  const isDuo = !!secondTime;
  const timeDisplay = isDuo ? `${time} — ${secondTime}` : time;

  return (
    <Html lang="fr">
      <Head />
      <Preview>Ton RDV chez IB Barber — {date} à {time}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={header}>IB BARBER</Heading>
          <Hr style={hr} />

          <Text style={text}>Salut {firstName},</Text>
          {isGuest && mainName ? (
            <Text style={text}>
              Tu es invité(e) par <span style={recapValue}>{mainName}</span>. Votre réservation est confirmée.
            </Text>
          ) : (
            <Text style={text}>
              Ta réservation est confirmée.
              {isDuo && " Réservation pour 2 personnes."}
            </Text>
          )}

          <Section style={recapBox}>
            <Row style={recapRow}>
              <Column style={recapLabel}>Date</Column>
              <Column style={recapValue}>{date}</Column>
            </Row>
            <Row style={recapRow}>
              <Column style={recapLabel}>Heure</Column>
              <Column style={recapValue}>{timeDisplay}</Column>
            </Row>
            <Row style={recapRow}>
              <Column style={recapLabel}>Prestation</Column>
              <Column style={recapValue}>{service}</Column>
            </Row>
            {isDuo && guestName && !isGuest && (
              <Row style={recapRow}>
                <Column style={recapLabel}>Invité(e)</Column>
                <Column style={recapValue}>{guestName}</Column>
              </Row>
            )}
          </Section>

          <Section style={consignesBox}>
            <Text style={consignesTitle}>Consignes</Text>
            <Text style={text}>
              En arrivant, envoie un message sur Snapchat à{" "}
              <span style={recapValue}>@i-ftyyy08</span> pour qu&apos;on vienne t&apos;ouvrir.
            </Text>
            <Text style={text}>
              Tout retard de 10 min ou plus ne sera pas accepté.
            </Text>
          </Section>

          {cancelUrl && (
            <>
              <Text style={text}>
                Tu peux annuler ta réservation jusqu&apos;à 1h avant le rendez-vous :
              </Text>
              <Button href={cancelUrl} style={cancelButton}>
                Annuler ma réservation
              </Button>
            </>
          )}

          <Hr style={hr} />
          <Text style={footer}>IB Barber</Text>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#0a0a0a",
  color: "#ffffff",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: "480px",
  margin: "0 auto",
  padding: "32px 24px",
};

const header: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  letterSpacing: "-0.02em",
  color: "#ffffff",
  margin: "0 0 16px",
};

const hr: React.CSSProperties = {
  borderColor: "#27272a",
  margin: "24px 0",
};

const text: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#ffffff",
  margin: "0 0 8px",
};

const recapBox: React.CSSProperties = {
  backgroundColor: "#18181b",
  borderRadius: "12px",
  border: "1px solid #27272a",
  padding: "16px 20px",
  margin: "24px 0",
};

const recapRow: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "28px",
  marginBottom: "12px",
};

const recapLabel: React.CSSProperties = {
  color: "#a1a1aa",
  width: "100px",
};

const recapValue: React.CSSProperties = {
  color: "#ffffff",
  fontWeight: 600,
};

const consignesBox: React.CSSProperties = {
  backgroundColor: "#1a1a0e",
  borderRadius: "12px",
  border: "1px solid rgba(234, 179, 8, 0.3)",
  padding: "16px 20px",
  margin: "24px 0",
};

const consignesTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#eab308",
  margin: "0 0 8px",
};

const cancelButton: React.CSSProperties = {
  backgroundColor: "#27272a",
  color: "#ffffff",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 600,
  padding: "12px 24px",
  textDecoration: "none",
  display: "inline-block",
  margin: "8px 0 16px",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#71717a",
  margin: 0,
};
