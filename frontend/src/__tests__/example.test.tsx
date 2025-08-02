import { describe, it, expect } from 'vitest';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { container } = render(<MyComponent />);
    expect(container).toBeInTheDocument();
  });
});