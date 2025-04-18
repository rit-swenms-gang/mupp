import { render, screen } from '@testing-library/react';
import App from "./App";

describe('App', () => {

  it('renders headline', () => {
    // arrange
    render(<App />);

    // act
    const headline = screen.getByText(/Multi-User Project Planner/i);

    //assert
    expect(headline).toBeInTheDocument();

  });

});