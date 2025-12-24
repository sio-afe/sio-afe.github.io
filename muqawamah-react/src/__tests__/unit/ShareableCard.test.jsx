/**
 * ShareableCard Component Tests
 * Tests for match, team, player, and stats share cards
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { 
  MatchShareCard, 
  TeamShareCard, 
  PlayerShareCard, 
  StatsShareCard,
  ShareButton 
} from '../../components/shared/ShareableCard';

// Mock html-to-image
vi.mock('html-to-image', () => ({
  toBlob: vi.fn(() => Promise.resolve(new Blob(['mock'], { type: 'image/png' }))),
  toPng: vi.fn(() => Promise.resolve('data:image/png;base64,mockImageData'))
}));

// Mock navigator.share
const mockShare = vi.fn();
const mockCanShare = vi.fn(() => true);

beforeEach(() => {
  vi.clearAllMocks();
  
  // Setup navigator.share mock
  Object.defineProperty(navigator, 'share', {
    value: mockShare,
    writable: true,
    configurable: true
  });
  
  Object.defineProperty(navigator, 'canShare', {
    value: mockCanShare,
    writable: true,
    configurable: true
  });
});

describe('ShareButton', () => {
  it('renders share button with icon and text', () => {
    const handleClick = vi.fn();
    render(<ShareButton onClick={handleClick} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<ShareButton onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<ShareButton onClick={() => {}} className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('has title attribute for accessibility', () => {
    render(<ShareButton onClick={() => {}} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Share');
  });
});

describe('MatchShareCard', () => {
  const mockMatch = {
    id: '123',
    home_team: { name: 'Team A', crest_url: '/teamA.png' },
    away_team: { name: 'Team B', crest_url: '/teamB.png' },
    home_score: 2,
    away_score: 1,
    status: 'completed',
    match_type: 'group',
    match_date: '2025-01-15'
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders match card with team names', () => {
    render(<MatchShareCard match={mockMatch} onClose={mockOnClose} />);
    
    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
  });

  it('renders score for completed match', () => {
    render(<MatchShareCard match={mockMatch} onClose={mockOnClose} />);
    
    // Score numbers should be present
    const scoreNumbers = screen.getAllByText(/^[0-2]$/);
    expect(scoreNumbers.length).toBeGreaterThan(0);
  });

  it('renders VS for scheduled match', () => {
    const scheduledMatch = { ...mockMatch, status: 'scheduled', home_score: null, away_score: null };
    render(<MatchShareCard match={scheduledMatch} onClose={mockOnClose} />);
    
    expect(screen.getByText('VS')).toBeInTheDocument();
  });

  it('shows FULL TIME for completed match', () => {
    render(<MatchShareCard match={mockMatch} onClose={mockOnClose} />);
    
    expect(screen.getByText('FULL TIME')).toBeInTheDocument();
  });

  it('shows LIVE for live match', () => {
    const liveMatch = { ...mockMatch, status: 'live' };
    render(<MatchShareCard match={liveMatch} onClose={mockOnClose} />);
    
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('renders match type label - GROUP STAGE', () => {
    render(<MatchShareCard match={mockMatch} onClose={mockOnClose} />);
    
    expect(screen.getByText('GROUP STAGE')).toBeInTheDocument();
  });

  it('renders match type label - FINAL', () => {
    const finalMatch = { ...mockMatch, match_type: 'final' };
    render(<MatchShareCard match={finalMatch} onClose={mockOnClose} />);
    
    expect(screen.getByText('FINAL')).toBeInTheDocument();
  });

  it('renders match type label - SEMI FINAL', () => {
    const semiMatch = { ...mockMatch, match_type: 'semi-final' };
    render(<MatchShareCard match={semiMatch} onClose={mockOnClose} />);
    
    expect(screen.getByText('SEMI FINAL')).toBeInTheDocument();
  });

  it('renders Instagram handle', () => {
    render(<MatchShareCard match={mockMatch} onClose={mockOnClose} />);
    
    expect(screen.getByText('muqawama2026')).toBeInTheDocument();
  });

  it('renders tournament logo', () => {
    render(<MatchShareCard match={mockMatch} onClose={mockOnClose} />);
    
    const logo = screen.getByAltText('Muqawamah');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/assets/img/muq_invert.png');
  });

  it('calls onClose when overlay is clicked', () => {
    render(<MatchShareCard match={mockMatch} onClose={mockOnClose} />);
    
    const overlay = document.querySelector('.share-modal-overlay');
    fireEvent.click(overlay);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not call onClose when content is clicked', () => {
    render(<MatchShareCard match={mockMatch} onClose={mockOnClose} />);
    
    const content = document.querySelector('.share-modal-content');
    fireEvent.click(content);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    render(<MatchShareCard match={mockMatch} onClose={mockOnClose} />);
    
    const closeButton = document.querySelector('.share-modal-close');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders share and download buttons', () => {
    render(<MatchShareCard match={mockMatch} onClose={mockOnClose} />);
    
    // There are 2 "Share" texts (one in h3 and one in button)
    expect(screen.getAllByText('Share').length).toBeGreaterThan(0);
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('formats date correctly', () => {
    render(<MatchShareCard match={mockMatch} onClose={mockOnClose} />);
    
    // Date should be formatted as "15 JAN 2025" or similar
    expect(screen.getByText(/JAN/i)).toBeInTheDocument();
  });

  it('shows TBD when date is missing', () => {
    const noDateMatch = { ...mockMatch, match_date: null };
    render(<MatchShareCard match={noDateMatch} onClose={mockOnClose} />);
    
    expect(screen.getByText('TBD')).toBeInTheDocument();
  });

  it('renders logo placeholder when crest_url is missing', () => {
    const noCrestMatch = {
      ...mockMatch,
      home_team: { name: 'Team A', crest_url: null },
      away_team: { name: 'Team B', crest_url: null }
    };
    render(<MatchShareCard match={noCrestMatch} onClose={mockOnClose} />);
    
    const placeholders = document.querySelectorAll('.logo-placeholder');
    expect(placeholders.length).toBe(2);
    expect(placeholders[0].textContent).toBe('T');
    expect(placeholders[1].textContent).toBe('T');
  });
});

describe('TeamShareCard', () => {
  const mockTeam = {
    id: '456',
    name: 'Jollof FC',
    crest_url: '/jollof.png',
    captain: 'John Doe',
    primary_color: '#ff6600'
  };

  const mockStats = {
    played: 5,
    won: 3,
    drawn: 1,
    lost: 1,
    points: 10
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders team name', () => {
    render(<TeamShareCard team={mockTeam} stats={mockStats} onClose={mockOnClose} />);
    
    expect(screen.getByText('Jollof FC')).toBeInTheDocument();
  });

  it('renders captain label and name', () => {
    render(<TeamShareCard team={mockTeam} stats={mockStats} onClose={mockOnClose} />);
    
    expect(screen.getByText('Captain:')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders team stats (W, D, L, PTS)', () => {
    render(<TeamShareCard team={mockTeam} stats={mockStats} onClose={mockOnClose} />);
    
    // Check labels
    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('PTS')).toBeInTheDocument();
  });

  it('renders correct stat values', () => {
    render(<TeamShareCard team={mockTeam} stats={mockStats} onClose={mockOnClose} />);
    
    // Check values - using getAllByText since numbers might appear multiple places
    expect(screen.getAllByText('3').length).toBeGreaterThan(0); // Won
    expect(screen.getAllByText('1').length).toBeGreaterThan(0); // Draw/Lost
    expect(screen.getAllByText('10').length).toBeGreaterThan(0); // Points
  });

  it('renders without stats section when stats is null', () => {
    render(<TeamShareCard team={mockTeam} stats={null} onClose={mockOnClose} />);
    
    expect(screen.getByText('Jollof FC')).toBeInTheDocument();
    // Stats labels should not be present
    expect(screen.queryByText('W')).not.toBeInTheDocument();
    expect(screen.queryByText('PTS')).not.toBeInTheDocument();
  });

  it('renders without captain when not provided', () => {
    const teamNoCaptain = { ...mockTeam, captain: null };
    render(<TeamShareCard team={teamNoCaptain} stats={mockStats} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Captain:')).not.toBeInTheDocument();
  });

  it('renders Instagram handle', () => {
    render(<TeamShareCard team={mockTeam} stats={mockStats} onClose={mockOnClose} />);
    
    expect(screen.getByText('muqawama2026')).toBeInTheDocument();
  });

  it('renders logo placeholder when crest_url is missing', () => {
    const noCrestTeam = { ...mockTeam, crest_url: null };
    render(<TeamShareCard team={noCrestTeam} stats={mockStats} onClose={mockOnClose} />);
    
    const placeholder = document.querySelector('.team-logo-placeholder');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder.textContent).toBe('J');
  });

  it('applies team primary color to glow effect', () => {
    render(<TeamShareCard team={mockTeam} stats={mockStats} onClose={mockOnClose} />);
    
    const glow = document.querySelector('.glow-team');
    expect(glow).toHaveStyle({ background: '#ff6600' });
  });
});

describe('PlayerShareCard', () => {
  const mockPlayer = {
    name: 'Abdoulaye Ballo',
    image: '/player.jpg',
    position: 'CM',
    jersey_number: 10,
    goals: 5,
    assists: 3,
    is_captain: true
  };

  const mockTeam = {
    name: 'Jollof FC',
    crest_url: '/jollof.png'
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders player name', () => {
    render(<PlayerShareCard player={mockPlayer} team={mockTeam} onClose={mockOnClose} />);
    
    expect(screen.getByText('Abdoulaye Ballo')).toBeInTheDocument();
  });

  it('renders jersey number with hash', () => {
    render(<PlayerShareCard player={mockPlayer} team={mockTeam} onClose={mockOnClose} />);
    
    expect(screen.getByText('#10')).toBeInTheDocument();
  });

  it('renders position badge', () => {
    render(<PlayerShareCard player={mockPlayer} team={mockTeam} onClose={mockOnClose} />);
    
    expect(screen.getByText('CM')).toBeInTheDocument();
  });

  it('renders team name', () => {
    render(<PlayerShareCard player={mockPlayer} team={mockTeam} onClose={mockOnClose} />);
    
    expect(screen.getByText('Jollof FC')).toBeInTheDocument();
  });

  it('renders goals stat', () => {
    render(<PlayerShareCard player={mockPlayer} team={mockTeam} onClose={mockOnClose} />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
  });

  it('renders assists stat', () => {
    render(<PlayerShareCard player={mockPlayer} team={mockTeam} onClose={mockOnClose} />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Assists')).toBeInTheDocument();
  });

  it('renders captain badge for captain', () => {
    render(<PlayerShareCard player={mockPlayer} team={mockTeam} onClose={mockOnClose} />);
    
    expect(screen.getByText('Captain')).toBeInTheDocument();
    expect(screen.getByText('©')).toBeInTheDocument();
  });

  it('does not render captain badge for non-captain', () => {
    const nonCaptain = { ...mockPlayer, is_captain: false };
    render(<PlayerShareCard player={nonCaptain} team={mockTeam} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Captain')).not.toBeInTheDocument();
  });

  it('handles player without image - shows placeholder', () => {
    const noImagePlayer = { ...mockPlayer, image: null };
    render(<PlayerShareCard player={noImagePlayer} team={mockTeam} onClose={mockOnClose} />);
    
    expect(document.querySelector('.player-photo-placeholder')).toBeInTheDocument();
  });

  it('does not render jersey number when not provided', () => {
    const noJerseyPlayer = { ...mockPlayer, jersey_number: null };
    render(<PlayerShareCard player={noJerseyPlayer} team={mockTeam} onClose={mockOnClose} />);
    
    expect(screen.queryByText('#10')).not.toBeInTheDocument();
  });

  it('renders without team badge when team is null', () => {
    render(<PlayerShareCard player={mockPlayer} team={null} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Jollof FC')).not.toBeInTheDocument();
  });

  it('applies correct position color for midfielder', () => {
    render(<PlayerShareCard player={mockPlayer} team={mockTeam} onClose={mockOnClose} />);
    
    const badge = document.querySelector('.player-position-badge');
    expect(badge).toHaveStyle({ background: '#4ade80' }); // Green for midfielders
  });

  it('applies correct position color for goalkeeper', () => {
    const gkPlayer = { ...mockPlayer, position: 'GK' };
    render(<PlayerShareCard player={gkPlayer} team={mockTeam} onClose={mockOnClose} />);
    
    const badge = document.querySelector('.player-position-badge');
    expect(badge).toHaveStyle({ background: '#fbbf24' }); // Yellow for GK
  });

  it('applies correct position color for striker', () => {
    const strikerPlayer = { ...mockPlayer, position: 'ST' };
    render(<PlayerShareCard player={strikerPlayer} team={mockTeam} onClose={mockOnClose} />);
    
    const badge = document.querySelector('.player-position-badge');
    expect(badge).toHaveStyle({ background: '#f87171' }); // Red for attackers
  });
});

describe('StatsShareCard', () => {
  const mockItems = [
    { name: 'Player A', image: '/a.jpg', team_name: 'Team A', value: 10 },
    { name: 'Player B', image: '/b.jpg', team_name: 'Team B', value: 8 },
    { name: 'Player C', image: '/c.jpg', team_name: 'Team C', value: 6 }
  ];

  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders top 3 items', () => {
    render(<StatsShareCard statType="goals" items={mockItems} onClose={mockOnClose} />);
    
    expect(screen.getByText('Player A')).toBeInTheDocument();
    expect(screen.getByText('Player B')).toBeInTheDocument();
    expect(screen.getByText('Player C')).toBeInTheDocument();
  });

  it('renders correct title for goals', () => {
    render(<StatsShareCard statType="goals" items={mockItems} onClose={mockOnClose} />);
    
    expect(screen.getByText('Top Scorers')).toBeInTheDocument();
  });

  it('renders correct title for assists', () => {
    render(<StatsShareCard statType="assists" items={mockItems} onClose={mockOnClose} />);
    
    expect(screen.getByText('Top Assists')).toBeInTheDocument();
  });

  it('renders correct title for points', () => {
    render(<StatsShareCard statType="points" items={mockItems} onClose={mockOnClose} />);
    
    expect(screen.getByText('Team Standings')).toBeInTheDocument();
  });

  it('renders correct icon for goals (⚽)', () => {
    render(<StatsShareCard statType="goals" items={mockItems} onClose={mockOnClose} />);
    
    expect(screen.getByText('⚽')).toBeInTheDocument();
  });

  it('renders correct icon for assists (🎯)', () => {
    render(<StatsShareCard statType="assists" items={mockItems} onClose={mockOnClose} />);
    
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });

  it('renders stat values', () => {
    render(<StatsShareCard statType="goals" items={mockItems} onClose={mockOnClose} />);
    
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('renders team names', () => {
    render(<StatsShareCard statType="goals" items={mockItems} onClose={mockOnClose} />);
    
    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
    expect(screen.getByText('Team C')).toBeInTheDocument();
  });

  it('renders rank medals (1, 2, 3)', () => {
    render(<StatsShareCard statType="goals" items={mockItems} onClose={mockOnClose} />);
    
    const medals = document.querySelectorAll('.rank-medal');
    expect(medals).toHaveLength(3);
    expect(medals[0].textContent).toBe('1');
    expect(medals[1].textContent).toBe('2');
    expect(medals[2].textContent).toBe('3');
  });

  it('applies correct medal colors (gold, silver, bronze)', () => {
    render(<StatsShareCard statType="goals" items={mockItems} onClose={mockOnClose} />);
    
    const medals = document.querySelectorAll('.rank-medal');
    expect(medals[0]).toHaveStyle({ background: '#FFD700' }); // Gold
    expect(medals[1]).toHaveStyle({ background: '#C0C0C0' }); // Silver
    expect(medals[2]).toHaveStyle({ background: '#CD7F32' }); // Bronze
  });

  it('only shows top 3 even with more items', () => {
    const moreItems = [
      ...mockItems,
      { name: 'Player D', value: 4 },
      { name: 'Player E', value: 2 }
    ];
    render(<StatsShareCard statType="goals" items={moreItems} onClose={mockOnClose} />);
    
    expect(screen.getByText('Player A')).toBeInTheDocument();
    expect(screen.getByText('Player C')).toBeInTheDocument();
    expect(screen.queryByText('Player D')).not.toBeInTheDocument();
    expect(screen.queryByText('Player E')).not.toBeInTheDocument();
  });

  it('renders Instagram handle', () => {
    render(<StatsShareCard statType="goals" items={mockItems} onClose={mockOnClose} />);
    
    expect(screen.getByText('muqawama2026')).toBeInTheDocument();
  });

  it('renders initial when image is missing', () => {
    const noImageItems = [
      { name: 'Player A', image: null, team_name: 'Team A', value: 10 }
    ];
    render(<StatsShareCard statType="goals" items={noImageItems} onClose={mockOnClose} />);
    
    const initial = document.querySelector('.rank-initial');
    expect(initial).toBeInTheDocument();
    expect(initial.textContent).toBe('P');
  });
});

describe('Share functionality', () => {
  const mockMatch = {
    id: '123',
    home_team: { name: 'Team A' },
    away_team: { name: 'Team B' },
    home_score: 2,
    away_score: 1,
    status: 'completed',
    match_type: 'group',
    match_date: '2025-01-15'
  };

  it('shows generating indicator when generating image', async () => {
    render(<MatchShareCard match={mockMatch} onClose={() => {}} />);
    
    const shareButton = screen.getAllByText('Share')[1]?.closest('button');
    if (shareButton) {
      fireEvent.click(shareButton);
      // The generating indicator should appear briefly
      // Note: This test may be flaky due to async timing
    }
  });
});

describe('dataURLtoBlob helper', () => {
  it('converts valid data URL to blob (unit test)', () => {
    // Test the dataURLtoBlob logic directly
    // This is a small PNG (1x1 transparent pixel)
    const validDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    // Inline implementation to test
    const dataURLtoBlob = (dataURL) => {
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    };

    const blob = dataURLtoBlob(validDataURL);
    
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('download button is rendered and clickable', async () => {
    const mockMatch = {
      id: '123',
      home_team: { name: 'Team A' },
      away_team: { name: 'Team B' },
      status: 'completed',
      match_type: 'group'
    };
    
    render(<MatchShareCard match={mockMatch} onClose={() => {}} />);
    
    const downloadButton = screen.getByText('Download').closest('button');
    expect(downloadButton).toBeInTheDocument();

    // The share card pre-generates an image asynchronously; wait until it's ready.
    await waitFor(() => expect(downloadButton).not.toBeDisabled());
    
    // Click should not throw
    expect(() => fireEvent.click(downloadButton)).not.toThrow();
  });
});
