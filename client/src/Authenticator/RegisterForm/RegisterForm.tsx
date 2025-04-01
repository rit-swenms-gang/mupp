import { Button, Card, CardHeader, Form, FormGroup, Input, Label } from 'reactstrap'

export default function LoginForm() {
  // TODO: 
  // - verify that email is valid
  // - verify that passwords match
  // - send account info to backend, create account, and get session info
  return (
    <Card>
      <CardHeader tag='h2'>Create an Account</CardHeader>
      <Form onSubmit={() => alert('Create New Account')}>
        <FormGroup floating>
          <Input
            id='username'
            name='username'
            placeholder='username'
            type='text'
          />
          <Label for='username'>
            Username
          </Label>
        </FormGroup>
        <FormGroup floating>
          <Input
            id='email'
            name='email'
            placeholder='Email@example.com'
            type='email'
          />
          <Label for='email'>
            Email
          </Label>
        </FormGroup>
        <FormGroup floating>
          <Input
            id='password'
            name='password'
            placeholder='Password'
            type='password'
          />
          <Label for='password'>
            Password
          </Label>
        </FormGroup>
        <FormGroup floating>
          <Input
            id='password-confirm'
            name='password-confirm'
            placeholder='password-confirm'
            type='password'
          />
          <Label for='password-confirm'>
            Confirm Password
          </Label>
        </FormGroup>
        <FormGroup className='py-3'>
          <Button
            block
            type='submit'
          >
            Create Account
          </Button>
        </FormGroup>
      </Form>
    </Card>
  );
}