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
  Row,
  Column,
} from "@react-email/components";

interface CancellationEmailProps {
  firstName: string;
  date: string;
  time: string;
  service: string;
}

export default function CancellationEmail({
  firstName,
  date,
  time,
  service,
}: CancellationEmailProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>Ton RDV chez IB Barber a été annulé — {date} à {time}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={header}>IB BARBER</Heading>
          <Hr style={hr} />

          <Text style={text}>Salut {firstName},</Text>
          <Text style={text}>Ton rendez-vous a bien été annulé.</Text>

          <Section style={recapBox}>
            <Row style={recapRow}>
              <Column style={recapLabel}>Date</Column>
              <Column style={recapValue}>{date}</Column>
            </Row>
            <Row style={recapRow}>
              <Column style={recapLabel}>Heure</Column>
              <Column style={recapValue}>{time}</Column>
            </Row>
            <Row style={recapRow}>
              <Column style={recapLabel}>Prestation</Column>
              <Column style={recapValue}>{service}</Column>
            </Row>
          </Section>

          <Text style={text}>
            Pour reprendre rendez-vous, contacte-moi sur Snapchat :
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
