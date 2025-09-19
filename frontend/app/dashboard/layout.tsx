
import AppNavbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { Container, Row, Col } from 'react-bootstrap';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark">
      <AppNavbar />
      <Container fluid>
        <Row>
          <Col md={2} className="d-none d-md-block bg-light sidebar">
            <Sidebar />
          </Col>
          <Col md={10} className="ms-sm-auto px-md-4 py-4">
            <main>
              {children}
            </main>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
