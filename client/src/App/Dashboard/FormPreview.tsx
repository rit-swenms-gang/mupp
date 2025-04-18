import { Container, Row, Card, CardBody, CardTitle, CardSubtitle, CardText } from 'reactstrap';

export interface FormPreviewProps {
	name: string;
	category: string;
	summary: string;
}

export default function FormPreview({name, category, summary}: Readonly<FormPreviewProps>) {
	return (
		<Card>
			<CardBody>
				<Container>
					<Row>
						<CardTitle tag="h3">
							{name}
						</CardTitle>
						<CardSubtitle tag="h6">
							{category}
						</CardSubtitle>
						<CardText>
							{summary}
						</CardText>
					</Row>
				</Container>
			</CardBody>
		</Card>
	);
}