import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DailySeed from '../DailySeed';
import * as api from '@/lib/api';

// Mock modules
vi.mock('@/lib/api');
vi.mock('react-hot-toast');

const mockChallenge = {
  id: '1',
  date: '2025-11-03',
  type: 'interaction',
  challenge: 'Test Challenge',
  description: 'Complete test challenge',
  creditsReward: 10,
  participantsCount: 5,
  completed: false,
};

describe('DailySeed Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('renders loading state initially', () => {
    vi.mocked(api.api.get).mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<DailySeed />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders challenge data when loaded', async () => {
    vi.mocked(api.api.get).mockResolvedValueOnce({
      data: mockChallenge,
    });

    renderWithProviders(<DailySeed />);

    await waitFor(() => {
      expect(screen.getByText('Test Challenge')).toBeInTheDocument();
    });
  });

  it('shows completed state when challenge is already completed', async () => {
    const completedChallenge = { ...mockChallenge, completed: true };
    vi.mocked(api.api.get).mockResolvedValueOnce({
      data: completedChallenge,
    });

    renderWithProviders(<DailySeed />);

    await waitFor(() => {
      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });
  });
});
