import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import '@testing-library/jest-dom/extend-expect';



const usersResponse = [
    {
      "id": 1,
      "name": "Leanne Graham",
      "username": "Bret",
      "email": "Sincere@april.biz",
      "address": {
        "street": "Kulas Light",
        "suite": "Apt. 556",
        "city": "Gwenborough",
        "zipcode": "92998-3874",
        "geo": {
          "lat": "-37.3159",
          "lng": "81.1496"
        }
      },
      "phone": "1-770-736-8031 x56442",
      "website": "hildegard.org",
      "company": {
        "name": "Romaguera-Crona",
        "catchPhrase": "Multi-layered client-server neural-net",
        "bs": "harness real-time e-markets"
      }
    }
  ];
  

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/users')) {
      return Promise.resolve({
        json: async () => usersResponse,
      });
    } else if (url.includes('/posts')) {
      return Promise.resolve({
        json: async () => postsResponse,
      });
    }
    return Promise.reject(new Error('Unhandled request'));
  });
});

afterAll(() => {
    global.fetch.mockClear();
    delete global.fetch;
});

describe('RegisterPage', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should render the registration form', () => {
        render(
            <MemoryRouter>
                <RegisterPage />
            </MemoryRouter>
        );
        expect(screen.getByText('Registration Page')).toBeInTheDocument();
    });

    window.alert = jest.fn();
    
    it('should register a new user and redirect to the main page', async () => {
        render(
            <MemoryRouter>
                <RegisterPage />
            </MemoryRouter>
        );
    
        fireEvent.change(screen.getByLabelText(/Account Name/i), { target: { value: 'uniqueUsername' } });
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '2000-01-01' } });
        fireEvent.change(screen.getByLabelText(/Zipcode/i), { target: { value: '12345' } });
        fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'password123' } });
    
        fireEvent.click(screen.getByText('Submit'));
    
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Registration Successful');
        });
    });
    

    test('should show an error if the username is not unique', async () => {
        render(
          <MemoryRouter>
            <RegisterPage />
          </MemoryRouter>
        );
      
        fireEvent.change(screen.getByLabelText(/Account Name/i), { target: { value: 'Bret' } });
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'user2@example.com' } });
        fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '2000-01-01' } });
        fireEvent.change(screen.getByLabelText(/Zipcode/i), { target: { value: '12345' } });
        fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'password123' } });
      
        fireEvent.click(screen.getByText('Submit'));
      
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Username already registered');
        });
      });
      

    test('should clear the form when clicking Clear button', () => {
        render(
            <MemoryRouter>
                <RegisterPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/Account Name/i), { target: { value: 'someUsername' } });

        fireEvent.click(screen.getByText('Clear'));

        expect(screen.getByLabelText(/Account Name/i)).toHaveValue('');
    });
});
