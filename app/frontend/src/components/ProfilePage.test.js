import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Cookies from 'js-cookie';
import ProfilePage from './ProfilePage';

jest.mock('js-cookie', () => ({
    get: jest.fn(),
}));

beforeAll(() => {
    jest.spyOn(global, 'fetch');
});

afterAll(() => {
    global.fetch.mockRestore();
});

describe('ProfilePage', () => {
    beforeEach(() => {
        Cookies.get.mockClear();
        global.fetch.mockClear();
    });

    const mockFetch = (data) => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve(data),
            })
        );
    };

    test('fetches and displays the correct user profile data', async () => {
        const mockUserId = '1';
        const mockUserData = [
            {
                id: 1,
                username: 'Bret',
                email: 'Sincere@april.biz',
                phone: '1-770-736-8031 x56442',
                zipcode: '92998-3874',
            },
        ];

        Cookies.get.mockImplementation(() => mockUserId);
        mockFetch(mockUserData);

        render(
            <MemoryRouter>
                <ProfilePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/Username:/)).toHaveValue('Bret');
            expect(screen.getByLabelText(/Email:/)).toHaveValue('Sincere@april.biz');
            expect(screen.getByLabelText(/Phone:/)).toHaveValue('1-770-736-8031 x56442');
            expect(screen.getByLabelText(/Zipcode:/)).toHaveValue('92998-3874');
        });
    });

    //redundant test
    test('shows current logged in users profile information', async () => {
        const mockUserId = '1';
        const mockUserData = [
            {
                id: 1,
                username: 'Bret',
                email: 'Sincere@april.biz',
                phone: '1-770-736-8031 x56442',
                zipcode: '92998-3874',
            },
        ];

        Cookies.get.mockImplementation(() => mockUserId);
        mockFetch(mockUserData);

        render(
            <MemoryRouter>
                <ProfilePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/Username:/)).toHaveValue('Bret');
            expect(screen.getByLabelText(/Email:/)).toHaveValue('Sincere@april.biz');
            expect(screen.getByLabelText(/Phone:/)).toHaveValue('1-770-736-8031 x56442');
            expect(screen.getByLabelText(/Zipcode:/)).toHaveValue('92998-3874');
        });
    });

    test('redirects if no userId cookie is found', () => {
        Cookies.get.mockImplementation(() => undefined);

        render(
            <MemoryRouter initialEntries={['/profile']}>
                <ProfilePage />
            </MemoryRouter>
        );

        expect(global.fetch).not.toHaveBeenCalled();
    });
});
