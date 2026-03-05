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
} from "@react-email/components";

interface ConfirmationEmailProps {
  firstName: string;
  date: string;
  time: string;
  service: string;
}

export default function ConfirmationEmail({
  firstName,
  date,
  time,
  service,
}: ConfirmationEmailProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>Ton RDV chez IB Barber — {date} à {time}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={header}>IB BARBER</Heading>
          <Hr style={hr} />

          <Text style={text}>Salut {firstName},</Text>
          <Text style={text}>Ta réservation est confirmée.</Text>

          <Section style={recapBox}>
            <Text style={recapRow}>
              <span style={recapLabel}>Date</span>
              <span style={recapValue}>{date}</span>
            </Text>
            <Text style={recapRow}>
              <span style={recapLabel}>Heure</span>
              <span style={recapValue}>{time}</span>
            </Text>
            <Text style={recapRow}>
              <span style={recapLabel}>Prestation</span>
              <span style={recapValue}>{service}</span>
            </Text>
          </Section>

          <Text style={text}>
            Pour annuler ou modifier ton rendez-vous, contacte-moi sur Snapchat :
          </Text>
          <Text style={snapHandle}>@i-ftyyy08</Text>

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
  display: "flex",
  justifyContent: "space-between",
  fontSize: "14px",
  lineHeight: "28px",
  margin: 0,
};

const recapLabel: React.CSSProperties = {
  color: "#a1a1aa",
};

const recapValue: React.CSSProperties = {
  color: "#ffffff",
  fontWeight: 600,
};

const snapHandle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#ffffff",
  margin: "4px 0 0",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#71717a",
  margin: 0,
};
