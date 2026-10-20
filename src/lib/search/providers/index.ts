import { serperProvider } from './serperProvider';

export { serperProvider };

export function isSearchConfigured(): boolean {
  return serperProvider.isConfigured();
}
