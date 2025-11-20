import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import IntentionOnboarding from '../IntentionOnboarding';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('IntentionOnboarding', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    mockPush.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders all four intention options when open', () => {
    render(<IntentionOnboarding isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Buscar algo')).toBeInTheDocument();
    expect(screen.getByText('Ofrecer algo')).toBeInTheDocument();
    expect(screen.getByText('Unirme a comunidad')).toBeInTheDocument();
    expect(screen.getByText('Solo explorar')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<IntentionOnboarding isOpen={false} onClose={() => {}} />);

    expect(screen.queryByText('¿Qué quieres hacer hoy?')).not.toBeInTheDocument();
  });

  it('handles search intention flow', async () => {
    render(<IntentionOnboarding isOpen={true} onClose={() => {}} />);

    // Click on search option
    fireEvent.click(screen.getByText('Buscar algo'));

    // Should show second step
    await waitFor(() => {
      expect(screen.getByText('¿Qué estás buscando?')).toBeInTheDocument();
    });

    // Type search query
    const searchInput = screen.getByPlaceholderText(/clases de guitarra/i);
    fireEvent.change(searchInput, { target: { value: 'bicicleta' } });

    // Click search button
    const searchButton = screen.getByText('Buscar');
    fireEvent.click(searchButton);

    // Should save intention to localStorage
    await waitFor(() => {
      expect(localStorage.getItem('user_intention')).toBe('search');
    });

    // Should redirect to offers page with search query
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/offers?search=bicicleta');
    });
  });

  it('handles offer intention flow', async () => {
    render(<IntentionOnboarding isOpen={true} onClose={() => {}} />);

    // Click on offer option
    fireEvent.click(screen.getByText('Ofrecer algo'));

    // Should show second step
    await waitFor(() => {
      expect(screen.getByText('¿Qué quieres ofrecer?')).toBeInTheDocument();
    });

    // Fill in offer details
    const titleInput = screen.getByPlaceholderText(/Clases de guitarra/i);
    fireEvent.change(titleInput, { target: { value: 'Clases de piano' } });

    const categorySelect = screen.getByDisplayValue('Producto');
    fireEvent.change(categorySelect, { target: { value: 'service' } });

    const priceInput = screen.getByPlaceholderText('0');
    fireEvent.change(priceInput, { target: { value: '25' } });

    // Click continue button
    const continueButton = screen.getByText('Continuar');
    fireEvent.click(continueButton);

    // Should save draft to localStorage
    await waitFor(() => {
      const draft = JSON.parse(localStorage.getItem('offer_draft') || '{}');
      expect(draft.title).toBe('Clases de piano');
      expect(draft.category).toBe('service');
      expect(draft.price).toBe('25');
    });

    // Should redirect to offer creation
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/offers/new');
    });
  });

  it('handles community intention flow', async () => {
    render(<IntentionOnboarding isOpen={true} onClose={() => {}} />);

    // Click on community option
    fireEvent.click(screen.getByText('Unirme a comunidad'));

    // Should show second step
    await waitFor(() => {
      expect(screen.getByText('Encuentra tu comunidad')).toBeInTheDocument();
    });

    // Fill in location
    const locationInput = screen.getByPlaceholderText(/Ciudad, barrio/i);
    fireEvent.change(locationInput, { target: { value: 'Madrid' } });

    // Select interests
    fireEvent.click(screen.getByText('Huerto urbano'));
    fireEvent.click(screen.getByText('Sostenibilidad'));

    // Click search communities button
    const searchButton = screen.getByText('Buscar comunidades');
    fireEvent.click(searchButton);

    // Should save intention to localStorage
    await waitFor(() => {
      expect(localStorage.getItem('user_intention')).toBe('community');
    });

    // Should redirect to communities page with filters
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/communities')
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('location=Madrid')
      );
    });
  });

  it('handles explore intention immediately', async () => {
    const onClose = vi.fn();
    const onIntentionSelected = vi.fn();

    render(
      <IntentionOnboarding
        isOpen={true}
        onClose={onClose}
        onIntentionSelected={onIntentionSelected}
      />
    );

    // Click on explore option
    fireEvent.click(screen.getByText('Solo explorar'));

    // Should save intention
    await waitFor(() => {
      expect(localStorage.getItem('user_intention')).toBe('explore');
    });

    // Should call callbacks
    await waitFor(() => {
      expect(onIntentionSelected).toHaveBeenCalledWith('explore');
      expect(onClose).toHaveBeenCalled();
    });

    // Should redirect to homepage
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('can go back from second step to first step', async () => {
    render(<IntentionOnboarding isOpen={true} onClose={() => {}} />);

    // Click on search option
    fireEvent.click(screen.getByText('Buscar algo'));

    // Should show second step
    await waitFor(() => {
      expect(screen.getByText('¿Qué estás buscando?')).toBeInTheDocument();
    });

    // Click back button
    const backButton = screen.getByText('Volver');
    fireEvent.click(backButton);

    // Should show first step again
    await waitFor(() => {
      expect(screen.getByText('¿Qué quieres hacer hoy?')).toBeInTheDocument();
      expect(screen.getByText('Buscar algo')).toBeInTheDocument();
    });
  });

  it('tracks analytics events', async () => {
    const analyticsTrackSpy = vi.fn();
    vi.mock('@/lib/analytics', () => ({
      default: { track: analyticsTrackSpy },
      ANALYTICS_EVENTS: {},
    }));

    render(<IntentionOnboarding isOpen={true} onClose={() => {}} />);

    // Click on search option
    fireEvent.click(screen.getByText('Buscar algo'));

    // Should track intention selected event
    await waitFor(() => {
      expect(localStorage.getItem('user_intention')).toBe('search');
    });
  });

  it('calls onClose when clicking close button', () => {
    const onClose = vi.fn();
    render(<IntentionOnboarding isOpen={true} onClose={onClose} />);

    // Find and click close button (X icon)
    const closeButton = screen.getByLabelText('Cerrar');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('disables continue button when required fields are empty', async () => {
    render(<IntentionOnboarding isOpen={true} onClose={() => {}} />);

    // Click on offer option
    fireEvent.click(screen.getByText('Ofrecer algo'));

    // Should show second step
    await waitFor(() => {
      expect(screen.getByText('¿Qué quieres ofrecer?')).toBeInTheDocument();
    });

    // Continue button should be disabled when title is empty
    const continueButton = screen.getByText('Continuar');
    expect(continueButton).toBeDisabled();

    // Fill in title
    const titleInput = screen.getByPlaceholderText(/Clases de guitarra/i);
    fireEvent.change(titleInput, { target: { value: 'Clases de piano' } });

    // Continue button should now be enabled
    expect(continueButton).not.toBeDisabled();
  });
});
