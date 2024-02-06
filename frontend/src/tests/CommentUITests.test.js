import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { BrowserRouter as Router } from 'react-router-dom';
import { UserContext } from '../context/UserContext'; // Mock UserContext

import MockAdapter from "axios-mock-adapter";
import axios from 'axios';
import {useNavigate } from 'react-router-dom';
import EditComment from '../pages/EditComment';
import PostDetails from '../pages/PostDetails';
import Comment from '../components/Comment';

jest.mock('axios');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  default: {
    Consumer: ({ children }) => children({ user: null, setUser: () => {} }), // Mock Consumer
    Provider: ({ children }) => children, // Mock Provider
  },
}));

jest.mock('axios');

// COMMENT COMPONENT

describe('Testing Comment Component UI', () => {

  test('should load the Comment', () => {
    render(
      <MemoryRouter>
        <Comment c={{ author: 'TestAuthor', comment: 'Test Comment', _id: '1' }} />
      </MemoryRouter>
    );
    const commentElement = screen.getByTestId('comment-1');
    expect(commentElement).toBeInTheDocument();
  });

  test('should load the delete button', async () => {
    render(
      <MemoryRouter>
        <Comment c={{ _id: '65b6a95bb0104f5ccd15d7e6', author: 'User', comment: 'Sample comment' }}/>
      </MemoryRouter>
    );
    const deleteButton = screen.getByTestId('delete-button');
    expect(deleteButton).toBeInTheDocument();
  });

  test('should load the edit button', async () => {
    render(
      <MemoryRouter>
        <Comment c={{ _id: '65b6a95bb0104f5ccd15d7e6', author: 'User', comment: 'Sample comment' }}/>
      </MemoryRouter>
    );
    const editButton = screen.getByTestId('edit-button');
    expect(editButton).toBeInTheDocument();
  });

  test('should load the author', async () => {
    render(
      <MemoryRouter>
        <Comment c={{ author: 'User' }} />
      </MemoryRouter>
    );
    const author = screen.getByTestId('author');
    expect(author).toBeInTheDocument();
  });

  test('should load the updated time', async () => {
    render(
      <MemoryRouter>
        <Comment c={{ updatedAt: '2023-11-26T12:35:56' }} />
      </MemoryRouter>
    );
    const updatedTime = screen.getByTestId('updated-time');
    expect(updatedTime).toBeInTheDocument();
  });

  test('formats and displays date correctly', () => {
    const testDate = new Date('2021-01-01');
    render(<Comment c={{ updatedAt: testDate, author: 'TestUser', comment: 'Test Comment' }} post={{}} />);
    expect(screen.getByText(testDate.toLocaleString())).toBeInTheDocument();
  });  

  test('edit button navigates to edit comment page', () => {
    const mockedNavigate = jest.fn();
    useNavigate.mockReturnValue(mockedNavigate);
    render(<Comment c={{ _id: '123', author: 'User', comment: 'Sample comment' }} post={{}} />);
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);
    expect(mockedNavigate).toHaveBeenCalledWith('/edit-comment/123');
  });

  test('edit and delete buttons be visible to the comment creator', () => {
    render(
      <UserContext.Provider value={{ user: { _id: 'user123' } }}>
        <Comment c={{ _id: '123', author: 'User', comment: 'Sample comment', userId: 'user123' }} post={{}} />
      </UserContext.Provider>
    );
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
  });

  test('edit and delete buttons should not be visible to someone other than the comment creator', () => {
    render(
      <UserContext.Provider value={{ user: { _id: 'user555' } }}>
        <Comment c={{ _id: '123', author: 'User', comment: 'Sample comment', userId: 'user123' }} post={{}} />
      </UserContext.Provider>
    );
    expect(screen.queryByTestId('edit-button')).toBeNull();
    expect(screen.queryByTestId('delete-button')).toBeNull();    
  });

  test('reloads the page upon successful delete', async () => {
    // Mock axios.delete
    axios.delete.mockResolvedValue({});

    delete window.location;
    window.location = { reload: jest.fn() };

    // Render component
    render(<Comment c={{ _id: '123', author: 'User', comment: 'Sample comment' }} post={{}} />);

    fireEvent.click(screen.getByTestId('delete-button'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalled());

    expect(window.location.reload).toHaveBeenCalled();

    window.location = location;
  });

  test('handles error during comment deletion', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    axios.delete.mockRejectedValue(new Error('Deletion failed'));
    render(<Comment c={{ _id: '123', author: 'User', comment: 'Sample comment' }} post={{}} />);
    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.anything());
    });
  });

});

// EDIT COMMENT PAGE

describe('Testing Edit Comment page UI', () => {

  test('renders correctly with initial state',async () => {
    await act(async () => {
      render(
        <Router>
          <UserContext.Provider value={{ user: { _id: 'testUserId' } }}>
            <EditComment />
          </UserContext.Provider>
        </Router>
      );
    });
    await waitFor(() => {
    expect(screen.getByPlaceholderText('Enter comment text')).toBeInTheDocument();
  });
  });

  test('it fetches comment selected and updates state', async () => {
    const mockComment = { comment: 'Test comment' };
    axios.get.mockResolvedValue({ data: mockComment });
    await act(async () => {
      render(
        <Router>
          <UserContext.Provider value={{ user: { _id: 'testUserId' } }}>
            <EditComment />
          </UserContext.Provider>
        </Router>
      );
    });
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter comment text').value).toBe(mockComment.comment);
    });
  });

  test('updates textarea on user input', async() => {
    const user = { _id: 'testUserId' };
    await act(async () => {
    render(
      <Router>
        <UserContext.Provider value={{ user }}>
        <EditComment />
      </UserContext.Provider>
      </Router>
      
    );
  });
  await waitFor(() => {
    const newText = 'Updated comment text';
    const textarea = screen.getByPlaceholderText('Enter comment text');
    fireEvent.change(textarea, { target: { value: newText } });

    expect(textarea.value).toBe(newText);
  });
  });

  test('should load the update button', () => {
    render(
      <MemoryRouter>
        <EditComment />
      </MemoryRouter>
    );
    const commentElement = screen.getByTestId('update-button');
    expect(commentElement).toBeInTheDocument();
  });

  test('should load the heading', () => {
    render(
      <MemoryRouter>
        <EditComment />
      </MemoryRouter>
    );
    const commentElement = screen.getByTestId('update-a-comment');
    expect(commentElement).toBeInTheDocument();
  });

  test('updates comment after the button is clicked', async () => {
    axios.put.mockResolvedValue({ data: { postId: 'testPostId' } });
  
    await act(async () => {
      render(
        <Router>
          <UserContext.Provider value={{ user: { _id: 'testUserId' } }}>
            <EditComment />
          </UserContext.Provider>
        </Router>
      );
    });
  
    const textarea = screen.getByPlaceholderText('Enter comment text');
    const updateButton = screen.getByText('Update');
  
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Updated comment' } });
      fireEvent.click(updateButton);
    });
  
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/comments/'), 
        { comment: 'Updated comment', userId: 'testUserId' },
        { withCredentials: true }
      );
    });
  });  

  test('navigates on successful update', async () => {
    const mockNavigate = require('react-router-dom').useNavigate();
    const mockComment = { comment: 'Test comment', postId: '123' };
    axios.get.mockResolvedValue({ data: mockComment });
    axios.put.mockResolvedValue({ data: mockComment });

    await act(async () => {
      render(
        <UserContext.Provider value={{ user: { _id: 'testUserId' } }}>
          <Router>
            <EditComment />
          </Router>
        </UserContext.Provider>
      );
    });

    // Simulate user input and form submission
    fireEvent.change(screen.getByPlaceholderText('Enter comment text'), { target: { value: 'Updated comment' } });
    fireEvent.click(screen.getByText('Update'));

    await waitFor(() => {
      // Check if navigation was called with the correct path
      expect(mockNavigate).toHaveBeenCalledWith('/posts/post/' + mockComment.postId);
    });
  });
  

  test('handles update error correctly', async () => {
    axios.put.mockRejectedValue(new Error('API error'));
    await act(async () => {
      render(
        <Router>
          <UserContext.Provider value={{ user: { _id: 'testUserId' } }}>
            <EditComment />
          </UserContext.Provider>
        </Router>
      );
    });
    const textarea = screen.getByPlaceholderText('Enter comment text');
    const updateButton = screen.getByText('Update');
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Updated comment text' } });
      fireEvent.click(updateButton);
    });
    await waitFor(() => {
      expect(screen.getByText('An error occurred while updating the comment.')).toBeInTheDocument();
    });
  });
  
  test('handles invalid comment ID', async () => {

    const invalidCommentId = 'invalidCommentId';

    // Mock Axios to simulate an error response
    axios.get.mockRejectedValue(new Error('An error occurred while fetching the comment.'));

    render(
      <MemoryRouter initialEntries={[`/comments/${invalidCommentId}`]}>
        <Routes>
          <Route path="/comments/:id" element={<EditComment />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the component to render and display the error message
    await waitFor(() => {
      expect(screen.getByText('An error occurred while fetching the comment.')).toBeInTheDocument();
    });
  });
  
  test("handles empty text before API call", async () => {
    // Create a new instance of MockAdapter
    const mock = new MockAdapter(axios);
  
    // Mock useParams to provide a valid commentId
    jest.spyOn(require("react-router-dom"), "useParams").mockReturnValue({
      id: "validCommentId",
    });
  
    render(
      <MemoryRouter>
        <EditComment />
      </MemoryRouter>
    );
  
    const textarea = screen.getByPlaceholderText("Enter comment text");
  
    // Simulate user input: clear the text
    fireEvent.change(textarea, { target: { value: "" } });
  
    const updateButton = screen.getByText("Update");
    fireEvent.click(updateButton);
  
    await waitFor(() => {
      expect(mock.history.put.length).toBe(0);
    });
  
    const errorMessage = screen.queryByText(
      "Please enter a valid comment text."
    );
    expect(errorMessage).not.toBeInTheDocument();
  
    mock.restore();
  });

  test('handles very long comment text', async () => {
    const longText = 'A'.repeat(5000); // Create a very long comment text (adjust the length as needed)
    
    // Mock axios.get to return a mock comment with the long text
    axios.get.mockResolvedValue({ data: { comment: longText } });
  
    render(
      <Router>
        <UserContext.Provider value={{ user: { _id: 'testUserId' } }}>
          <EditComment />
        </UserContext.Provider>
      </Router>
    );
  
    // Wait for the effect to run and the state to update
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Enter comment text');
      expect(textarea.value).toBe(longText);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});

// POST DETAILS PAGE

describe('Comment for PostDetails page', () => {

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  test('should initially render the comments section', async () => {
    // Mock response for post details and comments
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/posts/')) {
        return Promise.resolve({ data: { _id: 'comment1' } });
      }
      if (url.includes('/api/comments/post/')) {
        return Promise.resolve({ data: [{ _id: 'comment1', comment: 'Test comment' }] });
      }
      return Promise.reject(new Error('not found'));
    });

    render(
      <MemoryRouter initialEntries={['/posts/post/123']}>
        <Routes>
          <Route path="/posts/post/:id" element={<PostDetails />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the comment section to appear
    const commentSection = await screen.findByTestId('comment-heading');
    expect(commentSection).toBeInTheDocument();
  });
  
  test('should render add-comment button', async () => {
    // Mock response for post details and comments
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/posts/')) {
        return Promise.resolve({ data: { _id: 'comment1'} });
      }
      if (url.includes('/api/comments/post/')) {
        return Promise.resolve({ data: [ { _id: 'comment1', comment: 'Test comment' } ] });
      }
      return Promise.reject(new Error('not found'));
    });
  
    render(
      <MemoryRouter initialEntries={['/posts/post/123']}>
        <Routes>
          <Route path="/posts/post/:id" element={<PostDetails />} />
        </Routes>
      </MemoryRouter>
    );
  
    // Use findByTestId to wait for the add-comment button to appear
    const addCommentButton = await screen.findByTestId('add-comment');
    expect(addCommentButton).toBeInTheDocument();
  });

  test('should display comments correctly after adding', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/comments/post/')) {
        return Promise.resolve({ data: [{ _id: 'comment1', comment: 'Test comment' }] });
      }
      // Handle other URLs
    });
  
    render(
      <MemoryRouter initialEntries={['/posts/post/123']}>
        <Routes>
          <Route path="/posts/post/:id" element={<PostDetails />} />
        </Routes>
      </MemoryRouter>
    );
  
    const comment = await screen.findByText('Test comment');
    expect(comment).toBeInTheDocument();
  });
  
  test('should render the input field for adding a comment', async () => {
    // Mock response for post details and comments
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/posts/')) {
        return Promise.resolve({ data: { _id: 'comment1' } });
      }
      if (url.includes('/api/comments/post/')) {
        return Promise.resolve({ data: [{ _id: 'comment1', comment: 'Test comment' }] });
      }
      return Promise.reject(new Error('not found'));
    });
  
    render(
      <MemoryRouter initialEntries={['/posts/post/123']}>
        <Routes>
          <Route path="/posts/post/:id" element={<PostDetails />} />
        </Routes>
      </MemoryRouter>
    );
  
    // Use findByTestId to wait for the add-comment button to appear
    const commentInput = await screen.findByPlaceholderText('Write a comment');
    expect(commentInput).toBeInTheDocument();
  });

  test('should add a new comment after add-comment button is pressed with valid inputs', async () => {
    const mockUser = {
      _id: 'testUserId',
      username: 'testUser'
    };
    // Mocking axios.get calls for fetching post and comments
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/posts/')) {
        return Promise.resolve({ data: { title: 'Test Post', updatedAt: new Date().toISOString(), username: 'testAuthor', desc: 'Test Description' } });
      } else if (url.includes('/api/comments/post/')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error('Not found'));
    });

    // Mocking axios.post call for adding a comment
    axios.post.mockResolvedValueOnce({ data: {/* response data */} });

    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter initialEntries={['/posts/post/validCommentId']}> {/* Adjusted entry */}
          <Routes>
            <Route path="/posts/post/:id" element={<PostDetails />} />
          </Routes>
        </MemoryRouter>
      </UserContext.Provider>
    );

    // Find and fill the comment input
    const commentInput = await screen.findByPlaceholderText('Write a comment');
    fireEvent.change(commentInput, { target: { value: 'New comment' } });

    // Find and click the add comment button
    const addButton = await screen.findByTestId('add-comment');
    fireEvent.click(addButton);

    // Wait for the axios.post call and check it was called with expected arguments
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/comments/create'),
        expect.objectContaining({
          comment: 'New comment',
          author: mockUser.username,
          postId: 'validCommentId', 
          userId: mockUser._id
        }),
        expect.objectContaining({ withCredentials: true })
      );
    });
  });

  
test('should fetch comments on component mount', async () => {
  render(
    <MemoryRouter initialEntries={['/posts/post/123']}>
      <Routes>
        <Route path="/posts/post/:id" element={<PostDetails />} />
      </Routes>
    </MemoryRouter>
  );

  expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/comments/post/'));
  
});

test('logs an error when fetching post details fails', async () => {
  // Mock both console.log and console.error
  global.console = {
    log: jest.fn(),
    error: jest.fn(),
    // Add other console methods that are used in the component, if any
  };

  // Mock the axios call to simulate a failure
  axios.get.mockImplementation((url) => {
    if (url.includes('/api/posts/')) {
      return Promise.reject(new Error('Failed to fetch post'));
    }
  });

  render(
    <MemoryRouter initialEntries={['/posts/post/123']}>
      <Routes>
        <Route path="/posts/post/:id" element={<PostDetails />} />
      </Routes>
    </MemoryRouter>
  );

  // Wait for the axios call to be made
  await waitFor(() => expect(axios.get).toHaveBeenCalled());

  // Check if console.error has been called with the expected error
  expect(console.error).toHaveBeenCalledWith(expect.any(Error));
});

test('logs an error when fetching comments fails', async () => {
  // Mock both console.log and console.error
  global.console = {
    log: jest.fn(),
    error: jest.fn(),
    // Include other console methods if used in the component
  };

  // Mock the axios call to simulate a failure in fetching comments
  axios.get.mockImplementation((url) => {
    if (url.includes('/api/comments/post/')) {
      return Promise.reject(new Error('Failed to fetch comments'));
    }
    // Mock other URLs as needed
  });

  render(
    <MemoryRouter initialEntries={['/posts/post/123']}>
      <Routes>
        <Route path="/posts/post/:id" element={<PostDetails />} />
      </Routes>
    </MemoryRouter>
  );

  // Wait for the axios call to be made
  await waitFor(() => expect(axios.get).toHaveBeenCalled());

  // Check if console.error has been called with the expected error
  expect(console.error).toHaveBeenCalledWith(expect.any(Error));
});

});