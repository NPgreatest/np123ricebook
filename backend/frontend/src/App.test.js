import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { act } from 'react';

test('renders landing page text', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const landingText = screen.getByText(/Rice/i);
  expect(landingText).toBeInTheDocument();
});