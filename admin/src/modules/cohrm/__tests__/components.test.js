/**
 * Tests for COHRM shared UI components
 * Tests StatusBadge, PriorityBadge, RiskBadge, and EmptyState
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock lucide-react icons to simple spans
jest.mock('lucide-react', () => ({
  Bell: (props) => <span data-testid="icon-bell" {...props} />,
  Search: (props) => <span data-testid="icon-search" {...props} />,
  AlertTriangle: (props) => <span data-testid="icon-alert-triangle" {...props} />,
  XCircle: (props) => <span data-testid="icon-x-circle" {...props} />,
  CheckCircle: (props) => <span data-testid="icon-check-circle" {...props} />,
  Shield: (props) => <span data-testid="icon-shield" {...props} />,
  AlertCircle: (props) => <span data-testid="icon-alert-circle" {...props} />,
  AlertOctagon: (props) => <span data-testid="icon-alert-octagon" {...props} />,
  HelpCircle: (props) => <span data-testid="icon-help-circle" {...props} />,
  Inbox: (props) => <span data-testid="icon-inbox" {...props} />,
}));

import StatusBadge from '../components/shared/StatusBadge';
import PriorityBadge from '../components/shared/PriorityBadge';
import RiskBadge from '../components/shared/RiskBadge';
import EmptyState from '../components/shared/EmptyState';

// ============================================
// StatusBadge
// ============================================

describe('StatusBadge', () => {
  const STATUSES = ['pending', 'investigating', 'confirmed', 'false_alarm', 'closed'];

  test('renders without crashing for all statuses', () => {
    for (const status of STATUSES) {
      const { unmount } = render(<StatusBadge status={status} />);
      unmount();
    }
  });

  test('renders correct label for pending status', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('En attente')).toBeInTheDocument();
  });

  test('renders correct label for confirmed status', () => {
    render(<StatusBadge status="confirmed" />);
    expect(screen.getByText(/Confirm/i)).toBeInTheDocument();
  });

  test('renders correct label for closed status', () => {
    render(<StatusBadge status="closed" />);
    expect(screen.getByText(/Cl.tur/i)).toBeInTheDocument();
  });

  test('renders with different sizes', () => {
    const { container: sm } = render(<StatusBadge status="pending" size="sm" />);
    const { container: lg } = render(<StatusBadge status="pending" size="lg" />);
    // Both should render without error
    expect(sm.querySelector('span')).toBeInTheDocument();
    expect(lg.querySelector('span')).toBeInTheDocument();
  });

  test('renders icon by default', () => {
    const { container } = render(<StatusBadge status="pending" />);
    // Icon should be present as a child element
    const span = container.querySelector('span');
    expect(span.children.length).toBeGreaterThanOrEqual(1);
  });

  test('hides icon when showIcon is false', () => {
    const { container } = render(<StatusBadge status="pending" showIcon={false} />);
    // Should not have the Bell icon test id
    expect(container.querySelector('[data-testid="icon-bell"]')).not.toBeInTheDocument();
  });

  test('handles null status gracefully', () => {
    const { container } = render(<StatusBadge status={null} />);
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});

// ============================================
// PriorityBadge
// ============================================

describe('PriorityBadge', () => {
  const PRIORITIES = ['low', 'medium', 'high', 'critical'];

  test('renders without crashing for all priorities', () => {
    for (const priority of PRIORITIES) {
      const { unmount } = render(<PriorityBadge priority={priority} />);
      unmount();
    }
  });

  test('renders correct label for low priority', () => {
    render(<PriorityBadge priority="low" />);
    expect(screen.getByText(/Faible|Basse/i)).toBeInTheDocument();
  });

  test('renders correct label for critical priority', () => {
    render(<PriorityBadge priority="critical" />);
    expect(screen.getByText(/Critique|Critique/i)).toBeInTheDocument();
  });

  test('renders pulse animation style for critical', () => {
    const { container } = render(<PriorityBadge priority="critical" />);
    // Critical priority should inject a <style> tag for animation
    const styleTag = container.querySelector('style');
    expect(styleTag).toBeInTheDocument();
    expect(styleTag.textContent).toContain('cohrmPulse');
  });

  test('does not render pulse animation for non-critical', () => {
    const { container } = render(<PriorityBadge priority="low" />);
    const styleTag = container.querySelector('style');
    expect(styleTag).not.toBeInTheDocument();
  });

  test('renders with different sizes', () => {
    for (const size of ['sm', 'md', 'lg']) {
      const { container, unmount } = render(<PriorityBadge priority="medium" size={size} />);
      expect(container.querySelector('span')).toBeInTheDocument();
      unmount();
    }
  });

  test('shows dot indicator for critical priority', () => {
    const { container } = render(<PriorityBadge priority="critical" />);
    // Critical has an inner span acting as a dot indicator
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBeGreaterThan(1);
  });
});

// ============================================
// RiskBadge
// ============================================

describe('RiskBadge', () => {
  const RISK_LEVELS = ['unknown', 'low', 'moderate', 'high', 'very_high'];

  test('renders without crashing for all risk levels', () => {
    for (const level of RISK_LEVELS) {
      const { unmount } = render(<RiskBadge level={level} />);
      unmount();
    }
  });

  test('renders correct label for low risk', () => {
    render(<RiskBadge level="low" />);
    expect(screen.getByText(/Faible/i)).toBeInTheDocument();
  });

  test('renders correct label for high risk', () => {
    render(<RiskBadge level="high" />);
    expect(screen.getByText(/lev/i)).toBeInTheDocument();
  });

  test('renders correct label for very_high risk', () => {
    render(<RiskBadge level="very_high" />);
    expect(screen.getByText(/lev/i)).toBeInTheDocument();
  });

  test('renders correct label for moderate risk', () => {
    render(<RiskBadge level="moderate" />);
    expect(screen.getByText(/Mod/i)).toBeInTheDocument();
  });

  test('renders pulse animation for very_high risk', () => {
    const { container } = render(<RiskBadge level="very_high" />);
    const styleTag = container.querySelector('style');
    expect(styleTag).toBeInTheDocument();
    expect(styleTag.textContent).toContain('cohrmRiskPulse');
  });

  test('does not render pulse animation for low risk', () => {
    const { container } = render(<RiskBadge level="low" />);
    const styleTag = container.querySelector('style');
    expect(styleTag).not.toBeInTheDocument();
  });

  test('renders icon by default', () => {
    const { container } = render(<RiskBadge level="low" />);
    expect(container.querySelector('[data-testid]')).toBeInTheDocument();
  });

  test('hides icon when showIcon is false', () => {
    const { container } = render(<RiskBadge level="low" showIcon={false} />);
    expect(container.querySelector('[data-testid="icon-shield"]')).not.toBeInTheDocument();
  });

  test('handles unknown/undefined level gracefully', () => {
    const { container } = render(<RiskBadge level="unknown" />);
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});

// ============================================
// EmptyState
// ============================================

describe('EmptyState', () => {
  test('renders default empty state', () => {
    render(<EmptyState />);
    expect(screen.getByText('Aucune donn\u00e9e')).toBeInTheDocument();
    expect(screen.getByText(/Aucun .l.ment/i)).toBeInTheDocument();
  });

  test('renders search variant', () => {
    render(<EmptyState variant="search" />);
    expect(screen.getByText('Aucun r\u00e9sultat')).toBeInTheDocument();
  });

  test('renders error variant', () => {
    render(<EmptyState variant="error" />);
    expect(screen.getByText('Erreur')).toBeInTheDocument();
  });

  test('renders custom title and message', () => {
    render(<EmptyState title="Custom Title" message="Custom message text" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom message text')).toBeInTheDocument();
  });

  test('renders action button when provided', () => {
    const mockAction = jest.fn();
    render(<EmptyState action={mockAction} actionLabel="Retry" />);
    const button = screen.getByText('Retry');
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  test('does not render button when no action provided', () => {
    const { container } = render(<EmptyState />);
    expect(container.querySelector('button')).not.toBeInTheDocument();
  });

  test('uses default action label when none provided', () => {
    const mockAction = jest.fn();
    render(<EmptyState action={mockAction} />);
    expect(screen.getByText(/essayer/i)).toBeInTheDocument();
  });

  test('respects isDark prop for styling', () => {
    const { container: light } = render(<EmptyState isDark={false} />);
    const { container: dark } = render(<EmptyState isDark={true} />);
    // Both should render without error
    expect(light.querySelector('div')).toBeInTheDocument();
    expect(dark.querySelector('div')).toBeInTheDocument();
  });
});
