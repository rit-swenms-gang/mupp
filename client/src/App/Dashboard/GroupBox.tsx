import { Container, Row, Col, Card, CardBody, CardTitle, CardSubtitle, CardText } from 'reactstrap';
import { GroupProps } from './Group';


function printGroupMembers(memberList: string []) {
    let members = "";

    for(let i = 0; i < memberList.length; i++) {
      members += memberList[i];
      if(i < memberList.length - 1) {
        members += ", ";
      }
    }
    
    return members;
  }

export default function GroupBox({name, category, description, members}: Readonly<GroupProps>) {

	return (
		<Card>
			<CardBody>
				<Container>
					<Row className='flex align'>
						<Col>
							<Row>
								<CardTitle tag="h3">
									{name}
								</CardTitle>
								
								<CardSubtitle tag="h6">
									{category}
								</CardSubtitle>
							</Row>
							<Row>
								<CardText>
									{description}
								</CardText>
							</Row>
						</Col>
						<Col>
							<Row><img src="src/App/media/the_muppets.jpg" width={214} height={120}/></Row>
							<Row>
								{printGroupMembers(members)}
							</Row>
						</Col>
					</Row>
				</Container>
			</CardBody>
		</Card>
	);
}