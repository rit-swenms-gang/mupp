import { Container, Row, Col, Card, CardBody, CardTitle, CardSubtitle, CardText } from 'reactstrap';

interface GroupBoxProps {
	name: string;
	category: string;
	description: string;
	members: string [];
}

export default function GroupBox({name, category, description, members}: GroupBoxProps) {

	return (
		<Card>
			<CardBody>
				<Container>
				<Row>
					<Col>
					<CardTitle tag="h3">
						{name}
					</CardTitle>
					
					<CardSubtitle tag="h6">
						{category}
					</CardSubtitle>
					<CardText>
						{description}
					</CardText>
					</Col>
					<Col>
					<Row><img src="src/App/media/the_muppets.jpg" width={214} height={120}/></Row>
					<Row>
						{members}
					</Row>
					</Col>
				</Row>
				</Container>
			</CardBody>
		</Card>
	);
}