import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from '../Counter';
import { TestProviders } from '@/client/components/providers/TestProviders';

describe('Counter', () => {
  it('renders with initial count of 0', () => {
    render(
      <TestProviders>
        <Counter />
      </TestProviders>
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('increments count when + button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <Counter />
      </TestProviders>
    );

    const incrementButton = screen.getByRole('button', { name: '+' });

    await user.click(incrementButton);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('decrements count when - button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <Counter />
      </TestProviders>
    );

    const decrementButton = screen.getByRole('button', { name: '-' });

    await user.click(decrementButton);

    expect(screen.getByText('-1')).toBeInTheDocument();
  });
});