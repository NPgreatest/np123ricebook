import { render, screen, fireEvent,act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Cookies from 'js-cookie';
import LandingPage from './LandingPage';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Landing Page - Authentication', () => {
    beforeEach(() => {
        Cookies.remove('userId');
        jest.clearAllMocks();
    });

    test('should log in a user (login state should be set)', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve([{ username: 'Bret', address: { street: 'Kulas Light' }, id: 1 }])
            })
        );

        await act(async () => {
            render(<LandingPage />, { wrapper: MemoryRouter });
        });

        fireEvent.change(screen.getByLabelText(/Account Name/i), { target: { value: 'Bret' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Kulas Light' } });
        fireEvent.click(screen.getByText(/Log In/i));

        expect(mockNavigate).toHaveBeenCalledWith('/main');
        expect(Cookies.get('userId')).toBe('1');
    });


    test('JSON placeholder users can log in with username and password (street address)', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve([{ username: 'Bret', address: { street: 'Kulas Light' }, id: 1 }])
            })
        );

        await act(async () => {
            render(<LandingPage />, { wrapper: MemoryRouter });
        });

        fireEvent.change(screen.getByLabelText(/Account Name/i), { target: { value: 'Bret' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Kulas Light' } });
        fireEvent.click(screen.getByText(/Log In/i));

        expect(mockNavigate).toHaveBeenCalledWith('/main');
        expect(Cookies.get('userId')).toBe('1');
    });


    test('should not log in an invalid user', async () => { 
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve([{ username: 'Bret', address: { street: 'Kulas Light' }, id: 1 }])
            })
        );

        render(<LandingPage />, { wrapper: MemoryRouter });

        fireEvent.change(screen.getByLabelText(/Account Name/i), { target: { value: 'InvalidUser' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'WrongPassword' } });
        fireEvent.click(screen.getByText(/Log In/i));

        expect(screen.getByText(/Invalid username or password/i)).toBeInTheDocument();
    });

    test('should log out a user', () => {
        Cookies.set('userId', '1');
        Cookies.remove('userId');
        expect(Cookies.get('userId')).toBeUndefined();
    });
});
