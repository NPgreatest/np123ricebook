import { render, screen, fireEvent ,waitFor , cleanup} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { act } from 'react';
import Cookies from 'js-cookie';
import MainPage from './MainPage';

beforeAll(() => {
    window.alert = jest.fn();
});

const mockFetchResponses = () => {
    const usersResponse = [
        {"id":1,"name":"Leanne Graham","username":"Bret","email":"Sincere@april.biz","address":{"street":"Kulas Light","suite":"Apt. 556","city":"Gwenborough","zipcode":"92998-3874","geo":{"lat":"-37.3159","lng":"81.1496"}},"phone":"1-770-736-8031 x56442","website":"hildegard.org","company":{"name":"Romaguera-Crona","catchPhrase":"Multi-layered client-server neural-net","bs":"harness real-time e-markets"}},{"id":2,"name":"Ervin Howell","username":"Antonette","email":"Shanna@melissa.tv","address":{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":"-43.9509","lng":"-34.4618"}},"phone":"010-692-6593 x09125","website":"anastasia.net","company":{"name":"Deckow-Crist","catchPhrase":"Proactive didactic contingency","bs":"synergize scalable supply-chains"}},{"id":3,"name":"Clementine Bauch","username":"Samantha","email":"Nathan@yesenia.net","address":{"street":"Douglas Extension","suite":"Suite 847","city":"McKenziehaven","zipcode":"59590-4157","geo":{"lat":"-68.6102","lng":"-47.0653"}},"phone":"1-463-123-4447","website":"ramiro.info","company":{"name":"Romaguera-Jacobson","catchPhrase":"Face to face bifurcated interface","bs":"e-enable strategic applications"}},{"id":4,"name":"Patricia Lebsack","username":"Karianne","email":"Julianne.OConner@kory.org","address":{"street":"Hoeger Mall","suite":"Apt. 692","city":"South Elvis","zipcode":"53919-4257","geo":{"lat":"29.4572","lng":"-164.2990"}},"phone":"493-170-9623 x156","website":"kale.biz","company":{"name":"Robel-Corkery","catchPhrase":"Multi-tiered zero tolerance productivity","bs":"transition cutting-edge web services"}},{"id":5,"name":"Chelsey Dietrich","username":"Kamren","email":"Lucio_Hettinger@annie.ca","address":{"street":"Skiles Walks","suite":"Suite 351","city":"Roscoeview","zipcode":"33263","geo":{"lat":"-31.8129","lng":"62.5342"}},"phone":"(254)954-1289","website":"demarco.info","company":{"name":"Keebler LLC","catchPhrase":"User-centric fault-tolerant solution","bs":"revolutionize end-to-end systems"}}
    ];

    const postsResponse = [{"userId":2,"id":11,"title":"et ea vero quia laudantium autem","body":"delectus reiciendis molestiae occaecati non minima eveniet qui voluptatibus\naccusamus in eum beatae sit\nvel qui neque voluptates ut commodi qui incidunt\nut animi commodi"},{"userId":2,"id":12,"title":"in quibusdam tempore odit est dolorem","body":"itaque id aut magnam\npraesentium quia et ea odit et ea voluptas et\nsapiente quia nihil amet occaecati quia id voluptatem\nincidunt ea est distinctio odio"},{"userId":2,"id":13,"title":"dolorum ut in voluptas mollitia et saepe quo animi","body":"aut dicta possimus sint mollitia voluptas commodi quo doloremque\niste corrupti reiciendis voluptatem eius rerum\nsit cumque quod eligendi laborum minima\nperferendis recusandae assumenda consectetur porro architecto ipsum ipsam"},{"userId":2,"id":14,"title":"voluptatem eligendi optio","body":"fuga et accusamus dolorum perferendis illo voluptas\nnon doloremque neque facere\nad qui dolorum molestiae beatae\nsed aut voluptas totam sit illum"},{"userId":2,"id":15,"title":"eveniet quod temporibus","body":"reprehenderit quos placeat\nvelit minima officia dolores impedit repudiandae molestiae nam\nvoluptas recusandae quis delectus\nofficiis harum fugiat vitae"},{"userId":2,"id":16,"title":"sint suscipit perspiciatis velit dolorum rerum ipsa laboriosam odio","body":"suscipit nam nisi quo aperiam aut\nasperiores eos fugit maiores voluptatibus quia\nvoluptatem quis ullam qui in alias quia est\nconsequatur magni mollitia accusamus ea nisi voluptate dicta"}];

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

};

// Mocking navigate and fetch
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));


describe('Main Page - User Actions', () => {


    beforeEach(() => {
        Cookies.set('userId', '1');
        global.fetch = jest.fn();
        jest.clearAllMocks();
    });

    afterEach(() => {
        Cookies.remove('userId');
        jest.resetAllMocks();
    });

    test('should fetch and display articles for the logged-in user', async () => {
        mockFetchResponses();

        await act(async () => {
            render(<MainPage />, { wrapper: MemoryRouter });
        });

        expect(fetch).toHaveBeenCalledTimes(2);
        expect(screen.getByText(/et ea vero quia laudantium autem/i)).toBeInTheDocument();
        expect(screen.getByText(/delectus reiciendis molestiae occaecati/i)).toBeInTheDocument();
    });

    test('should update the status headline', async () => {
        mockFetchResponses();

        await act(async () => {
            render(<MainPage />, { wrapper: MemoryRouter });
        });

        window.prompt = jest.fn().mockReturnValue("Updated Status Headline");
        const updateButton = screen.getByText(/Update Status/i);
        fireEvent.click(updateButton);

        expect(screen.getByText(/Status: Updated Status Headline/)).toBeInTheDocument();
    });

    test('should post a new article', async () => {
        mockFetchResponses();

        await act(async () => {
            render(<MainPage />, { wrapper: MemoryRouter });
        });

        const textarea = screen.getByPlaceholderText(/Write a new article.../i);
        fireEvent.change(textarea, { target: { value: 'This is a new article post' } });
        
        const postButton = screen.getByText(/Post/);
        fireEvent.click(postButton);

        expect(screen.getByText('This is a new article post')).toBeInTheDocument();
    });

    test('should allow following a new user', async () => {
        mockFetchResponses();

        await act(async () => {
            render(<MainPage />, { wrapper: MemoryRouter });
        });
        expect(screen.getByText('Ervin Howell')).toBeInTheDocument();
        expect(screen.getByText('Clementine Bauch')).toBeInTheDocument();
        expect(screen.getByText('Patricia Lebsack')).toBeInTheDocument();
        
        const followInput = screen.getByPlaceholderText(/Add a user to follow.../i);
        fireEvent.change(followInput, { target: { value: 'Kamren' } });
        await act(async () => {
            const followButton = screen.getByText('Follow');
            fireEvent.click(followButton);
        });
        expect(screen.getByText('Chelsey Dietrich')).toBeInTheDocument();
        
    });


    test('suitable message when trying to add user that does not exist', async () => {
        mockFetchResponses();

        await act(async () => {
            render(<MainPage />, { wrapper: MemoryRouter });
        });
        expect(screen.getByText('Ervin Howell')).toBeInTheDocument();
        expect(screen.getByText('Clementine Bauch')).toBeInTheDocument();
        expect(screen.getByText('Patricia Lebsack')).toBeInTheDocument();
        
        const followInput = screen.getByPlaceholderText(/Add a user to follow.../i);
        fireEvent.change(followInput, { target: { value: 'Unexisits user' } });
        await act(async () => {
            const followButton = screen.getByText('Follow');
            fireEvent.click(followButton);
        });

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('cannot find user');
        });

    });


    test('should allow Unfollowing a user', async () => {
        mockFetchResponses();

        await act(async () => {
            render(<MainPage />, { wrapper: MemoryRouter });
        });
        expect(screen.getByText('Ervin Howell')).toBeInTheDocument();
        expect(screen.getByText('Clementine Bauch')).toBeInTheDocument();
        expect(screen.getByText('Patricia Lebsack')).toBeInTheDocument();


        await act(async () => {
            const unfollowButton = screen.getAllByText('Unfollow')[0];
            fireEvent.click(unfollowButton);
        });

        expect(screen.queryByText('Ervin Howell')).not.toBeInTheDocument();
        expect(screen.queryByText('Clementine Bauch')).toBeInTheDocument();
        expect(screen.queryByText('Patricia Lebsack')).toBeInTheDocument();
        
    });

    //redundant test
    test('add JSON placeholder user to follower list, new users articles shown in feed', async () => {
        mockFetchResponses();

        await act(async () => {
            render(<MainPage />, { wrapper: MemoryRouter });
        });
        expect(screen.getByText('Ervin Howell')).toBeInTheDocument();
        expect(screen.getByText('Clementine Bauch')).toBeInTheDocument();
        expect(screen.getByText('Patricia Lebsack')).toBeInTheDocument();
        
        const followInput = screen.getByPlaceholderText(/Add a user to follow.../i);
        fireEvent.change(followInput, { target: { value: 'Kamren' } });
        await act(async () => {
            const followButton = screen.getByText('Follow');
            fireEvent.click(followButton);
        });
        expect(screen.getByText('Chelsey Dietrich')).toBeInTheDocument();
        
    });

    //redundant test
    test('remove user from follower list, old users articles are removed from feed', async () => {
        mockFetchResponses();

        await act(async () => {
            render(<MainPage />, { wrapper: MemoryRouter });
        });
        expect(screen.getByText('Ervin Howell')).toBeInTheDocument();
        expect(screen.getByText('Clementine Bauch')).toBeInTheDocument();
        expect(screen.getByText('Patricia Lebsack')).toBeInTheDocument();


        await act(async () => {
            const unfollowButton = screen.getAllByText('Unfollow')[0];
            fireEvent.click(unfollowButton);
        });

        expect(screen.queryByText('Ervin Howell')).not.toBeInTheDocument();
        expect(screen.queryByText('Clementine Bauch')).toBeInTheDocument();
        expect(screen.queryByText('Patricia Lebsack')).toBeInTheDocument();
        
    });


    test('should search articles by keyword', async () => {
        mockFetchResponses();

        await act(async () => {
            render(<MainPage />, { wrapper: MemoryRouter });
        });
        expect(screen.queryByText(/in quibusdam tempore odit est dolorem/i)).toBeInTheDocument();
        const searchInput = screen.getByPlaceholderText(/Search articles.../i);
        fireEvent.change(searchInput, { target: { value: 'laudantium' } });

        expect(screen.getByText(/et ea vero quia laudantium autem/i)).toBeInTheDocument();
        expect(screen.queryByText(/in quibusdam tempore odit est dolorem/i)).not.toBeInTheDocument();

    });


    test('register new users (no posts or followed users)', async () => {
        mockFetchResponses();
        Cookies.remove('userId');
        Cookies.set('userId', 'new');
        Cookies.set('username','newUser');
        await act(async () => {
            render(<MainPage />, { wrapper: MemoryRouter });
        });

        expect(screen.getByText(/Username: newUser/i)).toBeInTheDocument();

        const articlesList = screen.queryAllByRole('article');
        expect(articlesList).toHaveLength(0);

        expect(screen.getByText(/Followed Users/i)).toBeInTheDocument();
        
        const followInput = screen.getByPlaceholderText(/Add a user to follow/i);
        expect(followInput).toBeInTheDocument();

        expect(screen.getByPlaceholderText(/Write a new article/i)).toBeInTheDocument();
    });

    test('should allow adding a new article with text-only', async () => {
        mockFetchResponses();
    
        await act(async () => {
            render(<MainPage />, { wrapper: MemoryRouter });
        });
    
        const textarea = screen.getByPlaceholderText(/Write a new article.../i);
        fireEvent.change(textarea, { target: { value: 'This is a text-only article' } });
    
        const postButton = screen.getByText(/Post/i);
        fireEvent.click(postButton);
    
        expect(screen.getByText('This is a text-only article')).toBeInTheDocument();
    });


    test('should display new articles at the top of the feed when added', async () => {
        mockFetchResponses();
    
        await act(async () => {
            render(<MainPage />, { wrapper: MemoryRouter });
        });
    
        const initialFirstArticle = screen.getByText(/et ea vero quia laudantium autem/i);
        expect(initialFirstArticle).toBeInTheDocument();
    
        const textarea = screen.getByPlaceholderText(/Write a new article.../i);
        fireEvent.change(textarea, { target: { value: 'Newest article at the top' } });
    
        const postButton = screen.getByText(/Post/i);
        fireEvent.click(postButton);
    

        console.log(screen.getAllByRole('article'));
        const newFirstArticle = screen.getAllByRole('article')[0];
        expect(newFirstArticle).toHaveTextContent(/Newest article at the top/i);


    });
    

    test('should keep the user logged in after a simulated page refresh', async () => {
        mockFetchResponses();

        await act(async () => {
            render(<MainPage />, { wrapper: MemoryRouter });
        });

        expect(screen.getByText(/Username: Bret/i)).toBeInTheDocument();
        expect(screen.getByText(/Multi-layered client-server neural-net/i)).toBeInTheDocument();
        expect(screen.getByText(/et ea vero quia laudantium autem/i)).toBeInTheDocument();

        cleanup(); 
        mockFetchResponses(); 
    
        await act(async () => {
            render(<MainPage />, { wrapper: MemoryRouter });
        });

        await waitFor(() => {
            expect(screen.getByText(/Username: Bret/i)).toBeInTheDocument();
            expect(screen.getByText(/Multi-layered client-server neural-net/i)).toBeInTheDocument();
            expect(screen.getByText(/et ea vero quia laudantium autem/i)).toBeInTheDocument();
        });
    
});

    



});
