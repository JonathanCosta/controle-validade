export interface EmptyStateOptions {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function createEmptyState(options: EmptyStateOptions): HTMLElement {
  const root = document.createElement('div');
  root.className = 'empty-state';

  const title = document.createElement('h2');
  title.className = 'empty-state__title';
  title.textContent = options.title;
  root.appendChild(title);

  if (options.description) {
    const description = document.createElement('p');
    description.className = 'empty-state__description';
    description.textContent = options.description;
    root.appendChild(description);
  }

  if (options.actionLabel && options.onAction) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button button--primary';
    button.textContent = options.actionLabel;
    button.addEventListener('click', options.onAction);
    root.appendChild(button);
  }

  return root;
}
